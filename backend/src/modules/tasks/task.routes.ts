import { Router } from 'express';
import {
  getTasksHandler,
  getTaskByIdHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
} from './task.controller';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
  idParamSchema,
} from './task.validation';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All task endpoints require authentication
router.use(authenticate);

router.get('/', validate({ query: taskQuerySchema }), getTasksHandler);
router.get('/:id', validate({ params: idParamSchema }), getTaskByIdHandler);
router.post('/', validate({ body: createTaskSchema }), createTaskHandler);
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateTaskSchema }),
  updateTaskHandler
);
router.delete('/:id', validate({ params: idParamSchema }), deleteTaskHandler);

export default router;
