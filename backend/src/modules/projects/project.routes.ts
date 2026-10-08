import { Router } from 'express';
import {
  getProjectsHandler,
  getProjectByIdHandler,
  createProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
} from './project.controller';
import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
  idParamSchema,
} from './project.validation';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All project endpoints require valid authentication
router.use(authenticate);

router.get('/', validate({ query: projectQuerySchema }), getProjectsHandler);
router.get('/:id', validate({ params: idParamSchema }), getProjectByIdHandler);
router.post('/', validate({ body: createProjectSchema }), createProjectHandler);
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateProjectSchema }),
  updateProjectHandler
);
router.delete('/:id', validate({ params: idParamSchema }), deleteProjectHandler);

export default router;
