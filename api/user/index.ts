import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, getUser, HttpError } from "../common";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const container = getContainer("users");
        let { id } = req.params;
        id = decodeURIComponent(id);
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
