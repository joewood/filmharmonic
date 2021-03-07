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
const common_1 = require("../common");
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const container = common_1.getContainer("users");
            if (req.method === "GET") {
                const { id } = req.params;
                if (!id) {
                    context.res = { body: "Must specify user", status: 404 };
                    return;
                }
                const result = yield container.items.query(`SELECT * FROM c WHERE c.userid="${id}"`).fetchAll();
                if (result.resources.length === 0) {
                    context.res = { body: `User ${id} not found`, status: 404 };
                    return;
                }
                context.res = { body: JSON.stringify(result.resources[0]) };
                return;
            }
            else if (req.method === "PUT") {
                const { id } = req.params;
                yield container.items.upsert(Object.assign(Object.assign({}, req.body), { userid: id, email: id }));
                const result = yield container.items.query(`SELECT * FROM c WHERE c.userid="${id}"`).fetchAll();
                context.res = { body: JSON.stringify(result.resources[0]) };
            }
        }
        catch (e) {
            console.error(e);
            context.res = { status: e.statusCode, body: JSON.stringify(e) };
            return;
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map