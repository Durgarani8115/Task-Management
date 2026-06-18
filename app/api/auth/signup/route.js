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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
var server_1 = require("next/server");
var db_1 = require("@/lib/db");
var auth_1 = require("@/lib/auth");
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var formData, name, email, password, existingUser, user, token, response;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, request.formData()];
                case 1:
                    formData = _d.sent();
                    name = (_a = formData.get("name")) === null || _a === void 0 ? void 0 : _a.toString().trim();
                    email = (_b = formData.get("email")) === null || _b === void 0 ? void 0 : _b.toString().trim().toLowerCase();
                    password = (_c = formData.get("password")) === null || _c === void 0 ? void 0 : _c.toString();
                    if (!name || !email || !password) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Name, email and password are required" }, { status: 400 })];
                    }
                    if (password.length < 8) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })];
                    }
                    return [4 /*yield*/, db_1.default.user.findUnique({ where: { email: email } })];
                case 2:
                    existingUser = _d.sent();
                    if (existingUser) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Email is already registered" }, { status: 409 })];
                    }
                    return [4 /*yield*/, db_1.default.user.create({
                            data: {
                                name: name,
                                email: email,
                                passwordHash: (0, auth_1.hashPassword)(password),
                            },
                        })];
                case 3:
                    user = _d.sent();
                    token = (0, auth_1.createToken)({ userId: user.id });
                    response = server_1.NextResponse.redirect(new URL("/", request.url), {
                        status: 303,
                    });
                    response.cookies.set(auth_1.AUTH_COOKIE_NAME, token, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                        path: "/",
                        maxAge: auth_1.AUTH_COOKIE_MAX_AGE,
                    });
                    return [2 /*return*/, response];
            }
        });
    });
}
