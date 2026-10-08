import { Request, Response } from 'express';
import { dashboardService } from './dashboard.service';
import { asyncHandler } from '../../utils/asyncHandler';
import { AppError } from '../../utils/AppError';

export const getDashboardMetricsHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    const data = await dashboardService.getMetrics(req.user.id);
    res.status(200).json({
      success: true,
      data,
    });
  }
);
