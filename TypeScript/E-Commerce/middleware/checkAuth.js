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
exports.role_access = exports.checkAuth = void 0;
const jwttoken_1 = require("../utils/jwttoken");
function checkAuth(req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
        res.status(401).json({ message: 'Unauthorized - No token provided' });
        return;
    }
    const decoded = (0, jwttoken_1.verifyToken)(token);
    if (!decoded) {
        res.status(401).json({ message: 'Unauthorized - Invalid token' });
        return;
    }
    // Attach the decoded user information to the request
    req.user = {
        user_id: decoded.user_id,
        role: decoded.role
        // Other properties from decoded if needed
    };
    console.log("req:" + req.user.user_id);
    next();
}
exports.checkAuth = checkAuth;
const role_access = (requiredRole) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user_role = req.user.role;
    console.log(user_role);
    if (!user_role || user_role !== requiredRole) {
        res.status(403).json({ message: 'Forbidden - Insufficient permissions' });
        return;
    }
    // User has the required role, proceed to the next middleware
    next();
});
exports.role_access = role_access;
