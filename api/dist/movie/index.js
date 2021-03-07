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
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.method === "GET") {
                if (!req.params.id) {
                    const id = req.params.id;
                    const omdbRequest = yield fetch(`http://www.omdbapi.com/?apikey=d88baf32&i=${id}`, { method: "GET" });
                    if (omdbRequest.ok) {
                        const data = yield omdbRequest.json();
                        context.res = { body: JSON.stringify(data, null, 2) };
                        return;
                    }
                    context.res = { body: omdbRequest.statusText, status: omdbRequest.status || 501 };
                    return;
                }
                const { search, page } = req.query;
                const omdbRequest = yield fetch(`http://www.omdbapi.com/?apikey=d88baf32&s=${search}&page=${page || 1}`, {
                    method: "GET",
                });
                if (omdbRequest.ok) {
                    const data = yield omdbRequest.json();
                    context.res = { body: JSON.stringify(data, null, 2) };
                }
                else {
                    context.res = { body: omdbRequest.statusText, status: omdbRequest.status || 501 };
                }
            }
        }
        catch (e) {
            console.error(e);
            context.res = { status: e.statusCode, body: JSON.stringify(e) };
        }
    });
};
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map