import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import fetch from "node-fetch";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    try {
        if (req.method === "GET") {
            if (!!req.params.id) {
                const id = req.params.id;
                const omdbRequest = await fetch(`http://www.omdbapi.com/?apikey=d88baf32&i=${id}`, { method: "GET" });
                if (omdbRequest.ok) {
                    const data = await omdbRequest.json();
                    context.res = { body: JSON.stringify(data, null, 2) };
                    return;
                }
                context.res = { body: omdbRequest.statusText, status: omdbRequest.status || 501 };
                return;
            }
            const { search, page } = req.query;
            const omdbRequest = await fetch(`http://www.omdbapi.com/?apikey=d88baf32&s=${search}&page=${page || 1}`, {
                method: "GET",
            });
            if (omdbRequest.ok) {
                const data = await omdbRequest.json();
                context.res = { body: JSON.stringify(data, null, 2) };
            } else {
                context.res = { body: omdbRequest.statusText, status: omdbRequest.status || 501 };
            }
        }
    } catch (e) {
        console.error(e);
        context.res = { status: e.statusCode || 501, body: JSON.stringify(e.message) };
    }
};

export default httpTrigger;
