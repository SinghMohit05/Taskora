"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardResponseSchema = void 0;
const zod_1 = require("zod");
exports.dashboardResponseSchema = zod_1.z.object({
    totalProjects: zod_1.z.number().int().nonnegative(),
    totalTasks: zod_1.z.number().int().nonnegative(),
    completedTasks: zod_1.z.number().int().nonnegative(),
    pendingTasks: zod_1.z.number().int().nonnegative(),
    projectsInProgress: zod_1.z.number().int().nonnegative(),
});
