import { Prisma, TaskStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../utils/AppError';
import {
  toPrismaProjectStatus,
  toUiProjectStatus,
  toUiTaskPriority,
  toUiTaskStatus,
} from '../../utils/statusMapper';
import {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput,
} from './project.validation';

export class ProjectService {
  async getProjects(userId: string, query: ProjectQueryInput) {
    const { search, status, page, limit, sortBy, order } = query;

    const where: Prisma.ProjectWhereInput = {
      ownerId: userId, // Strict tenant isolation
    };

    if (status) {
      const prismaStatus = toPrismaProjectStatus(status);
      if (prismaStatus) {
        where.status = prismaStatus;
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.project.count({ where });
    const skip = (page - 1) * limit;

    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          where: { status: TaskStatus.COMPLETED },
          select: { id: true },
        },
      },
    });

    const formattedProjects = projects.map((p) => ({
      id: p.id,
      ownerId: p.ownerId,
      name: p.name,
      description: p.description,
      status: toUiProjectStatus(p.status),
      startDate: p.startDate ? p.startDate.toISOString() : null,
      endDate: p.endDate ? p.endDate.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      taskCount: p._count.tasks,
      completedTaskCount: p.tasks.length,
    }));

    return {
      projects: formattedProjects,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getProjectById(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId, // Strict tenant isolation: returns 404 if owned by another user
      },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            projectId: true,
            name: true,
            description: true,
            priority: true,
            status: true,
            dueDate: true,
            createdAt: true,
          },
        },
      },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    const completedTaskCount = project.tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED
    ).length;

    return {
      id: project.id,
      ownerId: project.ownerId,
      name: project.name,
      description: project.description,
      status: toUiProjectStatus(project.status),
      startDate: project.startDate ? project.startDate.toISOString() : null,
      endDate: project.endDate ? project.endDate.toISOString() : null,
      createdAt: project.createdAt.toISOString(),
      taskCount: project._count.tasks,
      completedTaskCount,
      tasks: project.tasks.map((t) => ({
        id: t.id,
        projectId: t.projectId,
        name: t.name,
        description: t.description,
        priority: toUiTaskPriority(t.priority),
        status: toUiTaskStatus(t.status),
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }

  async createProject(userId: string, input: CreateProjectInput) {
    const project = await prisma.project.create({
      data: {
        ownerId: userId,
        name: input.name,
        description: input.description,
        status: toPrismaProjectStatus(input.status),
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    return {
      id: project.id,
      ownerId: project.ownerId,
      name: project.name,
      description: project.description,
      status: toUiProjectStatus(project.status),
      startDate: project.startDate ? project.startDate.toISOString() : null,
      endDate: project.endDate ? project.endDate.toISOString() : null,
      createdAt: project.createdAt.toISOString(),
      taskCount: project._count.tasks,
      completedTaskCount: 0,
    };
  }

  async updateProject(userId: string, projectId: string, input: UpdateProjectInput) {
    // 1. Scoped check: locate existing project owned by this user
    const existing = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    // 2. Validate final merged dates across existing record and incoming payload
    const mergedStartDate =
      input.startDate !== undefined
        ? input.startDate
          ? new Date(input.startDate)
          : null
        : existing.startDate;

    const mergedEndDate =
      input.endDate !== undefined
        ? input.endDate
          ? new Date(input.endDate)
          : null
        : existing.endDate;

    if (mergedStartDate && mergedEndDate && mergedEndDate.getTime() < mergedStartDate.getTime()) {
      throw new AppError(
        400,
        'VALIDATION_ERROR',
        'End date must be greater than or equal to start date',
        [
          {
            field: 'endDate',
            message: 'End date must be greater than or equal to start date',
          },
        ]
      );
    }

    const updated = await prisma.project.update({
      where: { id: existing.id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.status !== undefined && { status: toPrismaProjectStatus(input.status) }),
        ...(input.startDate !== undefined && {
          startDate: input.startDate ? new Date(input.startDate) : null,
        }),
        ...(input.endDate !== undefined && {
          endDate: input.endDate ? new Date(input.endDate) : null,
        }),
      },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          where: { status: TaskStatus.COMPLETED },
          select: { id: true },
        },
      },
    });

    return {
      id: updated.id,
      ownerId: updated.ownerId,
      name: updated.name,
      description: updated.description,
      status: toUiProjectStatus(updated.status),
      startDate: updated.startDate ? updated.startDate.toISOString() : null,
      endDate: updated.endDate ? updated.endDate.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
      taskCount: updated._count.tasks,
      completedTaskCount: updated.tasks.length,
    };
  }

  async deleteProject(userId: string, projectId: string) {
    // Enforce ownership in delete query directly to prevent race conditions
    const result = await prisma.project.deleteMany({
      where: {
        id: projectId,
        ownerId: userId,
      },
    });

    if (result.count === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    return {
      id: projectId,
      message: 'Project deleted successfully',
    };
  }
}

export const projectService = new ProjectService();
