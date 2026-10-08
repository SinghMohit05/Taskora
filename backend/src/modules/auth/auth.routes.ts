import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  logoutHandler,
  getMeHandler,
} from './auth.controller';
import { registerSchema, loginSchema } from './auth.validation';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  loginRateLimiter,
  registerRateLimiter,
} from '../../middleware/rateLimiter';

const router = Router();

router.post('/register', registerRateLimiter, validate({ body: registerSchema }), registerHandler);
router.post('/login', loginRateLimiter, validate({ body: loginSchema }), loginHandler);
router.post('/logout', authenticate, logoutHandler);
router.get('/me', authenticate, getMeHandler);

export default router;
