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
            const container = common_1.getContainer("groups");
            const userContainer = common_1.getContainer("users");
            let { id } = req.params;
            id = decodeURIComponent(id);
            if (!id)
                throw new common_1.HttpError("Must specify user", 404);
            if (req.method === "GET") {
                const result = yield container.items.query(`SELECT c.userid from c WHERE c.groupid="${id}"`).fetchAll();
                if (result.resources.length === 0)
                    throw new common_1.HttpError(`Group ${id} not found`, 404);
                const userids = result.resources.map((c) => c.userid);
                const users = yield Promise.all(userids.map((u) => common_1.getUser(userContainer, u)));
                context.res = { body: JSON.stringify(users) };
                return;
            }
        }
        catch (e) {
            console.error(e);
            context.res = { status: e.status || 503, body: e.message };
            return;
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map