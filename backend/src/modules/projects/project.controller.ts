import { Request, Response } from 'express';
import { projectService } from './project.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';

export const getProjectsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const result = await projectService.getProjects(req.user.id, req.query as any);
  res.status(200).json({
    success: true,
    data: result.projects,
    meta: result.meta,
  });
});

export const getProjectByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const project = await projectService.getProjectById(req.user.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: project,
  });
});

export const createProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const project = await projectService.createProject(req.user.id, req.body);
  res.status(201).json({
    success: true,
    data: project,
  });
});

export const updateProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const project = await projectService.updateProject(
    req.user.id,
    req.params.id as string,
    req.body
  );
  res.status(200).json({
    success: true,
    data: project,
  });
});

export const deleteProjectHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const result = await projectService.deleteProject(req.user.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: result,
  });
});
