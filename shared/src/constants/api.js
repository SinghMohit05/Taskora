"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = exports.AUTH_STORAGE_KEY = exports.API_PATHS = void 0;
/**
 * TaskForge Unified API Path Constants
 * Ensures single source of truth across Backend, Web, and Mobile clients.
 */
exports.API_PATHS = {
    AUTH: {
        REGISTER: '/api/auth/register',
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        ME: '/api/auth/me',
    },
    PROJECTS: {
        BASE: '/api/projects',
        BY_ID: (id) => `/api/projects/${id}`,
    },
    TASKS: {
        BASE: '/api/tasks',
        BY_ID: (id) => `/api/tasks/${id}`,
    },
    DASHBOARD: {
        STATS: '/api/dashboard',
    },
};
exports.AUTH_STORAGE_KEY = 'taskforge_auth_token';
exports.ERROR_CODES = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    RATE_LIMITED: 'RATE_LIMITED',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
};
