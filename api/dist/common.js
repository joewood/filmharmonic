"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContainer = exports.getUser = exports.HttpError = void 0;
const cosmos_1 = require("@azure/cosmos");
class HttpError extends Error {
    constructor(message, status = 503) {
        super(message);
        this.status = status;
    }
}
exports.HttpError = HttpError;
function getUser(container, email) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield container.items.query(`SELECT * FROM c WHERE c.userid="${email}"`).fetchAll();
        if (result.resources.length === 0)
            throw new HttpError(`User ${email} not found`, 404);
        const user = result.resources[0];
        const wishlistContainer = yield getContainer("wishlist");
        const wishlist = yield wishlistContainer.items.query(`SELECT c.moveid from c WHERE c.userid="${email}"`).fetchAll();
        user.wishlist = ((_a = wishlist.resources) === null || _a === void 0 ? void 0 : _a.map((m) => m.moveid)) || [];
        return user;
    });
}
exports.getUser = getUser;
function getContainer(name) {
    const storageClient = new cosmos_1.CosmosClient(process.env["COSMOS"]);
    const db = storageClient.database("filmharmonic");
    return db.container(name);
}
exports.getContainer = getContainer;
// export async function getRow(table: string, PartitionKey: string, RowKey: string) {
//     const cont = getContainer(table);
//     const dd = await cont.items
//         .query(
//             `SELECT * FROM c where c.PartitionKey="${decodeURIComponent(
//                 PartitionKey
//             )}" AND c.RowKey="${decodeURIComponent(RowKey)}"`,
//             {
//                 partitionKey: PartitionKey,
//             }
//         )
//         .fetchAll();
//     if (dd.resources.length > 0) return dd.resources[0];
//     throw new Error("404 missing item");
// }
// export async function upsertRow<T extends { PartitionKey: string; RowKey: string }>(table: string, row: T) {
//     const cont = getContainer(table);
//     const dd = await cont.items.upsert(row, {});
//     return dd.item.id;
// }
// export async function getRows<T extends { PartitionKey: string; RowKey: string }>(
//     table: string,
//     query: string,
//     partitionKey?: string,
//     continuationToken?: string
// ): Promise<{ resources: T[]; continuationToken: string }> {
//     const container = getContainer(table);
//     const result = await container.items
//         .query<T>(query, {
//             partitionKey,
//             continuationToken,
//         })
//         .fetchNext();
//     return { resources: result.resources, continuationToken: result.continuationToken };
// }
// export function cleanRow(out) {
//     for (const k in out) {
//         if ("_" in out[k]) out[k] = out[k]._;
//     }
//     delete out[".metadata"];
//     delete out.etag;
//     return out;
// }
// export function cleanResultset(resultSet) {
//     return (resultSet.entries || []).map(cleanRow);
// }
//# sourceMappingURL=common.js.map