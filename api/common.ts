import { Container, CosmosClient } from "@azure/cosmos";

export function getContainer(name: string): Container {
    const storageClient = new CosmosClient(process.env["COSMOS"]);
    const db = storageClient.database("beyond-piano-db");
    return db.container(name);
}

export async function getRow(table: string, PartitionKey: string, RowKey: string) {
    const cont = getContainer(table);
    const dd = await cont.items
        .query(
            `SELECT * FROM c where c.PartitionKey="${decodeURIComponent(
                PartitionKey
            )}" AND c.RowKey="${decodeURIComponent(RowKey)}"`,
            {
                partitionKey: PartitionKey,
            }
        )
        .fetchAll();
    if (dd.resources.length > 0) return dd.resources[0];
    throw new Error("404 missing item");
}

export async function upsertRow<T extends { PartitionKey: string; RowKey: string }>(table: string, row: T) {
    const cont = getContainer(table);
    const dd = await cont.items.upsert(row, {});
    return dd.item.id;
}

export async function getRows<T extends { PartitionKey: string; RowKey: string }>(
    table: string,
    query: string,
    partitionKey?: string,
    continuationToken?: string
): Promise<{ resources: T[]; continuationToken: string }> {
    const container = getContainer(table);
    const result = await container.items
        .query<T>(query, {
            partitionKey,
            continuationToken,
        })
        .fetchNext();
    return { resources: result.resources, continuationToken: result.continuationToken };
}

export function cleanRow(out) {
    for (const k in out) {
        if ("_" in out[k]) out[k] = out[k]._;
    }
    delete out[".metadata"];
    delete out.etag;
    return out;
}

export function cleanResultset(resultSet) {
    return (resultSet.entries || []).map(cleanRow);
}
