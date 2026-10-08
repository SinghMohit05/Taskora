"use strict";
/**
 * TaskForge Enums and Literal Types
 * Strictly aligned with assessment requirements.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TASK_STATUS_VALUES = exports.TASK_STATUS = exports.TASK_PRIORITY_VALUES = exports.TASK_PRIORITY = exports.PROJECT_STATUS_VALUES = exports.PROJECT_STATUS = void 0;
exports.PROJECT_STATUS = {
    NOT_STARTED: 'Not Started',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
};
exports.PROJECT_STATUS_VALUES = Object.values(exports.PROJECT_STATUS);
exports.TASK_PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
};
exports.TASK_PRIORITY_VALUES = Object.values(exports.TASK_PRIORITY);
exports.TASK_STATUS = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
};
exports.TASK_STATUS_VALUES = Object.values(exports.TASK_STATUS);
