import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, getUser, getUserWishlist, HttpError } from "../common";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const userContainer = getContainer("users");
        let { id, action, movieid } = req.params;
        if (!id) throw new HttpError("Must specify user", 404);
        if (req.method === "GET") {
            const wishlistContainer = await getContainer("wishlist");
            const user = await getUser(userContainer, id);
            const movies = await getUserWishlist(context, wishlistContainer, id); // Promise.all(user.wishlist.map((m) => getOrUpdateMovie(context, wishlistContainer, m)));
            context.res = { body: JSON.stringify({ ...user, wishlist: movies }, null, 2) };
            return;
        } else if (req.method === "PUT") {
            if (action === "add") {
                const wishlistContainer = await getContainer("wishlist");
                await wishlistContainer.items.upsert({ userid: id, moveid: movieid });
            } else if (action === "remove") {
                const wishlistContainer = await getContainer("wishlist");
                const ex = await wishlistContainer.items
                    .query(`select c.id FROM c WHERE c.userid="${id}" AND c.moveid="${movieid}"`)
                    .fetchAll();
                const itemId = ex.resources[0]?.id;
                if (itemId) {
                    await wishlistContainer.item(itemId, movieid).delete();
                } else {
                    throw new HttpError("Cannot find item", 404);
                }
            } else if (action === "watched") {
                const wishlistContainer = await getContainer("wishlist");
                const ex = await wishlistContainer.items
                    .query(`select * FROM c WHERE c.userid="${id}" AND c.moveid="${movieid}"`)
                    .fetchAll();
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
