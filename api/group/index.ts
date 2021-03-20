import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, getMovie, getUser, HttpError } from "../common";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const container = getContainer("groups");
        const userContainer = getContainer("users");
        let { id, movies } = req.params;
        id = decodeURIComponent(id);
        const memberResult = await container.items.query(`SELECT c.userid from c WHERE c.groupid="${id}"`).fetchAll();
        if (memberResult.resources.length === 0) throw new HttpError(`Group ${id} not found`, 404);
        const userids = memberResult.resources.map((c) => c.userid);

        if (!!movies && movies === "movies") {
            const wishlistContainer = getContainer("wishlist");
            const inClause = userids.map((u) => `"${u}"`).join(",");
            const result = await wishlistContainer.items
                .query(
                    `SELECT count(c.userid) AS votes,c.moveid as movieid FROM c where c.userid IN (${inClause}) GROUP BY c.moveid`
                )
                .fetchAll();
            if (result.resources.length === 0) throw new HttpError(`Group ${id} not found`, 404);
            const movies = await Promise.all(result.resources.map((m) => getMovie(m.movieid)));
            const movieVotes = result.resources.map((v, i) => ({ ...v, ...(movies[i] || {}) }));
            context.res = { body: JSON.stringify(movieVotes) };
            return;
        }
        if (!id) throw new HttpError("Must specify user", 404);
        if (req.method === "GET") {
            const users = await Promise.all(userids.map((u) => getUser(userContainer, u)));
            context.res = { body: JSON.stringify(users) };
            return;
        }
    } catch (e) {
        console.error(e);
        context.res = { status: e.status || 503, body: e.message };
        return;
    }
};

export default httpTrigger;
