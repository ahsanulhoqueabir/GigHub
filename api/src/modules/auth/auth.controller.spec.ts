import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<
    Pick<
      AuthService,
      'register' | 'login' | 'refresh' | 'logout' | 'forgotPassword' | 'resetPassword'
    >
  >;

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
    };

    controller = new AuthController(authService as unknown as AuthService);
  });

  it('delegates logout to the service', async () => {
    authService.logout.mockResolvedValueOnce({
      success: true,
      message: 'Logged out successfully',
    });

    await expect(controller.logout()).resolves.toEqual({
      success: true,
      message: 'Logged out successfully',
    });

    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('delegates forgot-password and returns the public success message', async () => {
    authService.forgotPassword.mockResolvedValueOnce();

    await expect(
      controller.forgotPassword({ email: 'jane@example.com' } as never),
    ).resolves.toEqual({
      success: true,
      message: 'If that email exists, a reset link has been sent',
    });

    expect(authService.forgotPassword).toHaveBeenCalledWith('jane@example.com');
  });

  it('delegates reset-password and returns the public success message', async () => {
    authService.resetPassword.mockResolvedValueOnce();

    await expect(
      controller.resetPassword({ oob_code: 'code', new_password: 'password123' } as never),
    ).resolves.toEqual({
      success: true,
      message: 'Password reset successfully',
    });

    expect(authService.resetPassword).toHaveBeenCalledWith('code', 'password123');
  });
});
