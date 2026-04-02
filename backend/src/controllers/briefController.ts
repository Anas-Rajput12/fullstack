import { Request, Response } from 'express';
import CreativeBriefModel from '../models/CreativeBrief';
import aiService from '../services/aiService';

/**
 * List user's creative briefs
 * GET /api/v1/briefs
 */
export async function listBriefs(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const { status, campaign_id, page, limit } = req.query;

    const currentPage = page ? parseInt(page as string, 10) : 1;
    const pageLimit = limit ? parseInt(limit as string, 10) : 20;
    const offset = (currentPage - 1) * pageLimit;

    const result = await CreativeBriefModel.findAllByUser(
      userId,
      { 
        status: status as string | undefined, 
        campaign_id: campaign_id as string | undefined 
      },
      pageLimit,
      offset
    );

    res.status(200).json({
      data: result.briefs,
      pagination: {
        page: currentPage,
        limit: pageLimit,
        total: result.total,
        has_more: currentPage * pageLimit < result.total,
      },
    });
  } catch (error: any) {
    console.error('List briefs error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve briefs',
      },
    });
  }
}

/**
 * Get brief by ID
 * GET /api/v1/briefs/:id
 */
export async function getBrief(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const brief = await CreativeBriefModel.findById(id, userId);

    if (!brief) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Brief not found',
        },
      });
      return;
    }

    res.status(200).json({
      data: brief,
    });
  } catch (error: any) {
    console.error('Get brief error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve brief',
      },
    });
  }
}

/**
 * Save creative brief
 * POST /api/v1/briefs
 */
export async function saveBrief(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const briefData = req.body;

    const brief = await CreativeBriefModel.create({
      user_id: userId,
      ...briefData,
    });

    res.status(201).json({
      data: brief,
    });
  } catch (error: any) {
    console.error('Save brief error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to save brief',
      },
    });
  }
}

/**
 * Update brief
 * PUT /api/v1/briefs/:id
 */
export async function updateBrief(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const updateData = req.body;

    const brief = await CreativeBriefModel.update(id, updateData, userId);

    if (!brief) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Brief not found',
        },
      });
      return;
    }

    res.status(200).json({
      data: brief,
    });
  } catch (error: any) {
    console.error('Update brief error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update brief',
      },
    });
  }
}

/**
 * Delete brief
 * DELETE /api/v1/briefs/:id
 */
export async function deleteBrief(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    await CreativeBriefModel.delete(id, userId);

    res.status(204).send();
  } catch (error: any) {
    console.error('Delete brief error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete brief',
      },
    });
  }
}

/**
 * Generate AI brief (SSE stream)
 * POST /api/v1/briefs/generate
 */
export async function generateBrief(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    const generationData = req.body;

    console.log('[BriefController] Generating brief for user:', userId);
    console.log('[BriefController] Generation data:', generationData);

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

    // Progress callback
    const onProgress = (step: string, content: string, progress: number) => {
      console.log('[BriefController] Progress:', step, progress);
      const event = `event: progress\ndata: ${JSON.stringify({ step, content, progress })}\n\n`;
      res.write(event);
    };

    // Generate copy using AI service
    console.log('[BriefController] Calling aiService.generateCopy...');
    const result = await aiService.generateCopy(
      {
        objectives: generationData.objectives,
        target_audience: generationData.target_audience,
        tone: generationData.brand_voice,
      },
      onProgress
    );

    console.log('[BriefController] AI service returned result:', result ? 'success' : 'empty');

    // Send completion event
    const completeEvent = `event: complete\ndata: ${JSON.stringify(result)}\n\n`;
    res.write(completeEvent);
    res.end();

    // Save the generated brief asynchronously
    (async () => {
      try {
        await CreativeBriefModel.create({
          user_id: userId,
          title: `AI Brief - ${new Date().toISOString().split('T')[0]}`,
          objectives: generationData.objectives,
          target_audience: generationData.target_audience,
          ai_generated_copy: result,
          status: 'completed',
          word_count: result.word_count || 0,
        });
      } catch (error) {
        console.error('Failed to save generated brief:', error);
      }
    })();
  } catch (error: any) {
    console.error('Generate brief error:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));

    if (!res.headersSent) {
      res.status(500).json({
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'Failed to generate brief',
        },
      });
    } else {
      // Send error event in SSE stream
      const errorEvent = `event: error\ndata: ${JSON.stringify({ message: error.message })}\n\n`;
      res.write(errorEvent);
      res.end();
    }
  }
}

/**
 * Export brief as PDF
 * POST /api/v1/briefs/:id/export
 */
export async function exportBrief(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Get brief from database
    const brief = await CreativeBriefModel.findById(id, userId);

    if (!brief) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Brief not found',
        },
      });
      return;
    }

    // Update status to exported
    const updatedBrief = await CreativeBriefModel.update(
      id,
      {
        status: 'exported',
        exported_pdf_url: `/briefs/${id}.pdf`,
      },
      userId
    );

    res.status(200).json({
      data: updatedBrief,
      message: 'Brief ready for PDF export',
    });
  } catch (error: any) {
    console.error('Export brief error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to export brief',
      },
    });
  }
}
