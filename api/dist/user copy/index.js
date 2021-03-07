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
function getUser(container, email) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield container.items.query(`SELECT * FROM c WHERE c.userid="${email}"`).fetchAll();
        if (result.resources.length === 0)
            throw new common_1.HttpError(`User ${email} not found`, 404);
        const user = result.resources[0];
        const wishlistContainer = yield common_1.getContainer("wishlist");
        const wishlist = yield wishlistContainer.items.query(`SELECT c.moveid from c WHERE c.userid="${email}"`).fetchAll();
        user.wishlist = ((_a = wishlist.resources) === null || _a === void 0 ? void 0 : _a.map((m) => m.moveid)) || [];
        return user;
    });
}
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const container = common_1.getContainer("users");
            let { id } = req.params;
            id = decodeURIComponent(id);
            if (!id)
                throw new common_1.HttpError("Must specify user", 404);
            if (req.method === "GET") {
                const user = yield getUser(container, id);
                context.res = { body: JSON.stringify(user) };
                return;
            }
            else if (req.method === "PUT") {
                yield container.items.upsert(Object.assign(Object.assign({}, req.body), { userid: id, email: id }));
                const user = getUser(container, id);
                context.res = { body: JSON.stringify(user) };
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