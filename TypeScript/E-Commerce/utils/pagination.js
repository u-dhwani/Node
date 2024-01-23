"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
function paginate(page, pageSize) {
    const offset = (page - 1) * pageSize;
    return { offset, pageSize };
}
exports.paginate = paginate;
