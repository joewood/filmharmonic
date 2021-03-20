import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, getMovie, getUser, HttpError } from "../common";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const userContainer = getContainer("users");
        let { id, action, movieid } = req.params;
        // id = decodeURIComponent(id);
        if (!id) throw new HttpError("Must specify user", 404);
        if (req.method === "GET") {
            const user = await getUser(userContainer, id);
            const movies = await Promise.all(user.wishlist.map((m) => getMovie(m)));
            context.res = { body: JSON.stringify({ ...user, wishlist: movies }, null, 2) };
            return;
        } else if (req.method === "PUT") {
            if (action === "propose" || action === "vote") {
                const user = await getUser(userContainer, id, true);
                await userContainer.items.upsert({ ...user, [action]: movieid });
            } else if (action === "add") {
                const wishlistContainer = await getContainer("wishlist");
                await wishlistContainer.items.upsert({ email: id, userid: id, moveid: movieid });
            } else if (action === "remove") {
                context.log("REMOVING");
                const wishlistContainer = await getContainer("wishlist");
                const ex = await wishlistContainer.items
                    .query(`select c.id FROM c WHERE c.groupid="woods" AND c.userid="${id}" AND c.moveid="${movieid}"`)
                    .fetchAll();
                const itemId = ex.resources[0]?.id;
                if (itemId) {
                    context.log("Deleting " + itemId);
                    await wishlistContainer.item(itemId, movieid).delete();
                } else {
                    throw new HttpError("Cannot find item", 404);
                }
            } else if (action === "watched") {
                const wishlistContainer = await getContainer("wishlist");
                const ex = await wishlistContainer.items
                    .query(`select c.id FROM c WHERE c.userid="${id}" AND c.moveid="${movieid}"`)
                    .fetchAll();
                context.log("Getting ", ex.resources);
                const item = ex.resources[0];
                if (!item) throw new HttpError("Cannot find item", 404);
                await wishlistContainer.items.upsert({ ...item, watched: true });
            } else {
                throw new HttpError("Unknown command " + action, 501);
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
