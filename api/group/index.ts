import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, getUser, HttpError } from "../common";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const container = getContainer("groups");
        const userContainer = getContainer("users");
        let { id } = req.params;
        id = decodeURIComponent(id);
        if (!id) throw new HttpError("Must specify user", 404);
        if (req.method === "GET") {
            const result = await container.items.query(`SELECT c.userid from c WHERE c.groupid="${id}"`).fetchAll();
            if (result.resources.length === 0) throw new HttpError(`Group ${id} not found`, 404);
            const userids = result.resources.map((c) => c.userid);
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
