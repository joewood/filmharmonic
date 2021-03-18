import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, getMovie, getUser, HttpError } from "../common";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const userContainer = getContainer("users");
        let { id, action, movieid } = req.params;
        id = decodeURIComponent(id);
        if (!id) throw new HttpError("Must specify user", 404);
        if (req.method === "GET") {
            const user = await getUser(userContainer, id);
            const movies = await Promise.all(user.wishlist.map((m) => getMovie(m)));
            context.res = { body: JSON.stringify({ ...user, wishlist: movies }, null, 2) };
            return;
        } else if (req.method === "PUT") {
            if (action === "propose" || "vote") {
                const user = await getUser(userContainer, id, true);
                await userContainer.items.upsert({ ...user, [action]: movieid });
            } else if (action === "add") {
                const wishlistContainer = await getContainer("wishlist");
                await wishlistContainer.items.upsert({ email: id, moveid: movieid });
            } else if (action === "remove") {
                const wishlistContainer = await getContainer("wishlist");
                const ex = await wishlistContainer.items
                    .query(`select c.id FROM c WHERE c.email="${id}" AND c.moveid="${movieid}"`)
                    .fetchAll();
                const itemId = ex.resources[0].id;
                if (itemId) {
                    await wishlistContainer.item(itemId).delete();
                }
            }
            const user = getUser(userContainer, id);
            context.res = { body: JSON.stringify(user) };
        }
    } catch (e) {
        console.error(e);
        context.res = { status: e.status || 503, body: e.message };
        return;
    }
};

export default httpTrigger;
