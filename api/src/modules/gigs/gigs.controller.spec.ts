import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GigsController } from './gigs.controller';
import { GigsService } from './gigs.service';
import { GigPackageTier, GigStatus } from '@/types/gig.types';
import { UserRole } from '@/types/auth.types';

describe('GigsController', () => {
  let controller: GigsController;
  let gigsService: jest.Mocked<GigsService>;

  const currentUser = {
    profile_id: 'profile-1',
    username: 'seller',
    is_verified: true,
    role: UserRole.STUDENT,
  };

  beforeEach(() => {
    gigsService = {
      create: jest.fn(),
      updateEdit: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
      list: jest.fn(),
      detail: jest.fn(),
      mine: jest.fn(),
    } as any;

    controller = new GigsController(gigsService);
  });

  it('creates a gig', async () => {
    gigsService.create.mockResolvedValueOnce({ success: true, data: { id: 'gig-1' } as any });

    const result = await controller.create(currentUser, {
      title: 'Build app',
      description: 'I will build a production-grade app for your startup team',
      category_id: 'cat-1',
      tags: ['nestjs'],
      packages: [
        {
          tier: GigPackageTier.BASIC,
          title: 'Basic',
          description: 'Basic package description',
          price: 20,
          delivery_days: 2,
          revisions: 1,
        },
      ],
    } as any);

    expect(result.success).toBe(true);
    expect(gigsService.create).toHaveBeenCalledWith('profile-1', expect.any(Object));
  });

  it('maps 400 create failure to BadRequestException', async () => {
    gigsService.create.mockResolvedValueOnce({
      success: false,
      status: 400,
      error: 'Invalid payload',
    });

    await expect(controller.create(currentUser, {} as any)).rejects.toThrow(BadRequestException);
  });

  it('updates gig edit type', async () => {
    gigsService.updateEdit.mockResolvedValueOnce({ success: true, data: { id: 'gig-1' } as any });

    const result = await controller.update('gig-1', currentUser, { type: 'edit' } as any);

    expect(result.success).toBe(true);
    expect(gigsService.updateEdit).toHaveBeenCalledWith('gig-1', 'profile-1', expect.any(Object));
  });

  it('updates gig status type', async () => {
    gigsService.updateStatus.mockResolvedValueOnce({ success: true, data: { id: 'gig-1' } as any });

    const result = await controller.update('gig-1', currentUser, {
      type: 'status',
      status: GigStatus.ACTIVE,
    });

    expect(result.success).toBe(true);
    expect(gigsService.updateStatus).toHaveBeenCalledWith('gig-1', 'profile-1', GigStatus.ACTIVE);
  });

  it('throws BadRequestException for missing status in status update', async () => {
    await expect(
      controller.update('gig-1', currentUser, { type: 'status' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('maps forbidden update failure', async () => {
    gigsService.updateEdit.mockResolvedValueOnce({
      success: false,
      status: 403,
      error: 'Forbidden',
    });

    await expect(controller.update('gig-1', currentUser, { type: 'edit' } as any)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('removes gig for owner', async () => {
    gigsService.remove.mockResolvedValueOnce({ success: true, data: { id: 'gig-1' } as any });

    const result = await controller.remove('gig-1', currentUser);

    expect(result.success).toBe(true);
    expect(gigsService.remove).toHaveBeenCalledWith('gig-1', 'profile-1');
  });

  it('lists public gigs', async () => {
    gigsService.list.mockResolvedValueOnce({
      success: true,
      data: [],
      pagination: { totalCount: 0 } as any,
    });

    const result = await controller.list({ page: 1, limit: 20 } as any);

    expect(result.success).toBe(true);
  });

  it('returns gig detail', async () => {
    gigsService.detail.mockResolvedValueOnce({ success: true, data: { id: 'gig-1' } as any });

    const result = await controller.detail('gig-slug');

    expect(result.success).toBe(true);
  });

  it('maps missing detail to NotFoundException', async () => {
    gigsService.detail.mockResolvedValueOnce({
      success: false,
      status: 404,
      error: 'Gig not found',
    });

    await expect(controller.detail('missing')).rejects.toThrow(NotFoundException);
  });

  it('returns current user gigs', async () => {
    gigsService.mine.mockResolvedValueOnce({
      success: true,
      data: [],
      pagination: { totalCount: 0 } as any,
    });

    const result = await controller.mine(currentUser, 1, 20);

    expect(result.success).toBe(true);
    expect(gigsService.mine).toHaveBeenCalledWith('profile-1', 1, 20);
  });

  it('maps mine failure to InternalServerErrorException', async () => {
    gigsService.mine.mockResolvedValueOnce({ success: false, error: 'Failed to fetch' });

    await expect(controller.mine(currentUser, 1, 20)).rejects.toThrow(InternalServerErrorException);
  });
});
