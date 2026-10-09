import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import {
  toPrismaTaskPriority,
  toPrismaTaskStatus,
  toUiTaskPriority,
  toUiTaskStatus,
} from '../../utils/statusMapper';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryInput,
} from './task.validation';

export class TaskService {
  async getTasks(userId: string, query: TaskQueryInput) {
    const { projectId, status, priority, search, page, limit, sortBy, order } = query;

    // Strict multi-tenant data isolation:
    // Every query must be scoped to the authenticated user's ID to prevent cross-tenant access.
    const where: Prisma.TaskWhereInput = {
      project: {
        ownerId: userId,
      },
    };

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      const prismaStatus = toPrismaTaskStatus(status);
      if (prismaStatus) {
        where.status = prismaStatus;
      }
    }

    if (priority) {
      const prismaPriority = toPrismaTaskPriority(priority);
      if (prismaPriority) {
        where.priority = prismaPriority;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.task.count({ where });
    const skip = (page - 1) * limit;

    const tasks = await prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const formattedTasks = tasks.map((t) => ({
      id: t.id,
      projectId: t.projectId,
      projectName: t.project.name,
      name: t.name,
      description: t.description,
      priority: toUiTaskPriority(t.priority),
      status: toUiTaskStatus(t.status),
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
    }));

    return {
      tasks: formattedTasks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getTaskById(userId: string, taskId: string) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId: userId, // Scoped to user's projects only
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!task) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }

    return {
      id: task.id,
      projectId: task.projectId,
      projectName: task.project.name,
      name: task.name,
      description: task.description,
      priority: toUiTaskPriority(task.priority),
      status: toUiTaskStatus(task.status),
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
    };
  }

  async createTask(userId: string, input: CreateTaskInput) {
    // 1. Verify the target project belongs to the user before creating
    const targetProject = await prisma.project.findFirst({
      where: {
        id: input.projectId,
        ownerId: userId,
      },
    });

    if (!targetProject) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    // 2. Create the task
    const task = await prisma.task.create({
      data: {
        projectId: input.projectId,
        name: input.name,
        description: input.description,
        priority: toPrismaTaskPriority(input.priority),
        status: toPrismaTaskStatus(input.status),
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: task.id,
      projectId: task.projectId,
      projectName: task.project.name,
      name: task.name,
      description: task.description,
      priority: toUiTaskPriority(task.priority),
      status: toUiTaskStatus(task.status),
      dueDate: task.dueDate ? task.dueDate.toISOString() : null,
      createdAt: task.createdAt.toISOString(),
    };
  }

  async updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
    // 1. Verify the existing task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!existingTask) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }

    // 2. If moving task to another project, verify target project belongs to the user
    if (input.projectId && input.projectId !== existingTask.projectId) {
      const targetProject = await prisma.project.findFirst({
        where: {
          id: input.projectId,
          ownerId: userId,
        },
      });

      if (!targetProject) {
        throw new AppError(404, 'NOT_FOUND', 'Target project not found');
      }
    }

    // 3. Update the task
    const updated = await prisma.task.update({
      where: { id: existingTask.id },
      data: {
        ...(input.projectId !== undefined && { projectId: input.projectId }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.priority !== undefined && {
          priority: toPrismaTaskPriority(input.priority),
        }),
        ...(input.status !== undefined && {
          status: toPrismaTaskStatus(input.status),
        }),
        ...(input.dueDate !== undefined && {
          dueDate: input.dueDate ? new Date(input.dueDate) : null,
        }),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      projectName: updated.project.name,
      name: updated.name,
      description: updated.description,
      priority: toUiTaskPriority(updated.priority),
      status: toUiTaskStatus(updated.status),
      dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  async deleteTask(userId: string, taskId: string) {
    // 1. Verify the task belongs to a project owned by this user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId: userId,
        },
      },
    });

    if (!existingTask) {
      throw new AppError(404, 'NOT_FOUND', 'Task not found');
    }

    // 2. Delete the task
    await prisma.task.delete({
      where: { id: existingTask.id },
    });

    return {
      id: taskId,
      message: 'Task deleted successfully',
    };
  }
}

export const taskService = new TaskService();
