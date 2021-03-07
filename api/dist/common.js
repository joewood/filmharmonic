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
exports.cleanResultset = exports.cleanRow = exports.getRows = exports.upsertRow = exports.getRow = exports.getContainer = exports.HttpError = void 0;
const cosmos_1 = require("@azure/cosmos");
class HttpError extends Error {
    constructor(message, status = 503) {
        super(message);
        this.status = status;
    }
}
exports.HttpError = HttpError;
function getContainer(name) {
    const storageClient = new cosmos_1.CosmosClient(process.env["COSMOS"]);
    const db = storageClient.database("filmharmonic");
    return db.container(name);
}
exports.getContainer = getContainer;
function getRow(table, PartitionKey, RowKey) {
    return __awaiter(this, void 0, void 0, function* () {
        const cont = getContainer(table);
        const dd = yield cont.items
            .query(`SELECT * FROM c where c.PartitionKey="${decodeURIComponent(PartitionKey)}" AND c.RowKey="${decodeURIComponent(RowKey)}"`, {
            partitionKey: PartitionKey,
        })
            .fetchAll();
        if (dd.resources.length > 0)
            return dd.resources[0];
        throw new Error("404 missing item");
    });
}
exports.getRow = getRow;
function upsertRow(table, row) {
    return __awaiter(this, void 0, void 0, function* () {
        const cont = getContainer(table);
        const dd = yield cont.items.upsert(row, {});
        return dd.item.id;
    });
}
exports.upsertRow = upsertRow;
function getRows(table, query, partitionKey, continuationToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = getContainer(table);
        const result = yield container.items
            .query(query, {
            partitionKey,
            continuationToken,
        })
            .fetchNext();
        return { resources: result.resources, continuationToken: result.continuationToken };
    });
}
exports.getRows = getRows;
function cleanRow(out) {
    for (const k in out) {
        if ("_" in out[k])
            out[k] = out[k]._;
    }
    delete out[".metadata"];
    delete out.etag;
    return out;
}
exports.cleanRow = cleanRow;
function cleanResultset(resultSet) {
    return (resultSet.entries || []).map(cleanRow);
}
exports.cleanResultset = cleanResultset;
//# sourceMappingURL=common.js.map