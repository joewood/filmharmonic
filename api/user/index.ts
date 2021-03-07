import { Container } from "@azure/cosmos";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, getRow, getRows, HttpError, upsertRow } from "../common";

async function getUser(container: Container, email: string) {
    const result = await container.items.query(`SELECT * FROM c WHERE c.userid="${email}"`).fetchAll();
    console.log(result);
    if (result.resources.length === 0) throw new HttpError(`User ${email} not found`, 404);
    const user = result.resources[0];
    const wishlistContainer = await getContainer("wishlist");
    const wishlist = await wishlistContainer.items.query(`SELECT c.moveid from c WHERE c.userid="${email}"`).fetchAll();
    user.wishlist = wishlist.resources?.map((m) => m.moveid) || [];
    return user;
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const container = getContainer("users");
        let { id } = req.params;
        id = decodeURIComponent(id);
        console.log("USER " + id);
        if (!id) throw new HttpError("Must specify user", 404);
        if (req.method === "GET") {
            const user = await getUser(container, id);
            context.res = { body: JSON.stringify(user) };
            return;
        } else if (req.method === "PUT") {
            await container.items.upsert({ ...req.body, userid: id, email: id });
            const user = getUser(container, id);
            context.res = { body: JSON.stringify(user) };
        }
    } catch (e) {
        console.error(e);
        context.res = { status: e.status || 503, body: e.message };
        return;
    }
};

export default httpTrigger;
