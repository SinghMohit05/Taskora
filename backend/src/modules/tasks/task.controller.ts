import { Request, Response } from 'express';
import { taskService } from './task.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';

export const getTasksHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const result = await taskService.getTasks(req.user.id, req.query as any);
  res.status(200).json({
    success: true,
    data: result.tasks,
    meta: result.meta,
  });
});

export const getTaskByIdHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const task = await taskService.getTaskById(req.user.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: task,
  });
});

export const createTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const task = await taskService.createTask(req.user.id, req.body);
  res.status(201).json({
    success: true,
    data: task,
  });
});

export const updateTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const task = await taskService.updateTask(
    req.user.id,
    req.params.id as string,
    req.body
  );
  res.status(200).json({
    success: true,
    data: task,
  });
});

export const deleteTaskHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
  }

  const result = await taskService.deleteTask(req.user.id, req.params.id as string);
  res.status(200).json({
    success: true,
    data: result,
  });
});
