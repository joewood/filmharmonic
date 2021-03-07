import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer, getRow, getRows, upsertRow } from "../common";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        const container = getContainer("users");
        if (req.method === "GET") {
            const { id } = req.params;
            if (!id) {
                context.res = { body: "Must specify user", status: 404 };
                return;
            }
            const result = await container.items.query(`SELECT * FROM c WHERE c.userid="${id}"`).fetchAll();
            if (result.resources.length === 0) {
                context.res = { body: `User ${id} not found`, status: 404 };
                return;
            }
            context.res = { body: JSON.stringify(result.resources[0]) };
            return;
        } else if (req.method === "PUT") {
            const { id } = req.params;
            await container.items.upsert({ ...req.body, userid: id, email: id });
            const result = await container.items.query(`SELECT * FROM c WHERE c.userid="${id}"`).fetchAll();
            context.res = { body: JSON.stringify(result.resources[0]) };
        }
    } catch (e) {
        console.error(e);
        context.res = { status: e.statusCode, body: JSON.stringify(e) };
        return;
    }
};

export default httpTrigger;
