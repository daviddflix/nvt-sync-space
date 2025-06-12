import { Request, Response } from 'express';
import { RegisterUser, RegisterUserDto } from '../application/usecases/registerUser';
import { LoginUser, LoginUserDto } from '../application/usecases/loginUser';
import { verifyToken, generateAccessToken, generateRefreshToken } from '../application/utils/jwt';
import { revokeToken } from '../application/utils/tokenStore';
import { UserRepository } from '../domain/UserRepository';
import { logger } from '../../../shared/logger';

export class AuthController {
  private registerUser: RegisterUser;
  private loginUser: LoginUser;

  constructor(private repo: UserRepository) {
    this.registerUser = new RegisterUser(repo);
    this.loginUser = new LoginUser(repo);
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = req.body as RegisterUserDto;
      logger.info(`Auth register attempt for ${dto.email}`);
      const { user, accessToken, refreshToken } = await this.registerUser.execute(dto);
      logger.info(`User ${user.id} registered`);
      res.status(201).json({ user: { id: user.id, email: user.email }, accessToken, refreshToken });
    } catch (err: any) {
      logger.error(`Register error: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = req.body as LoginUserDto;
      logger.info(`Auth login attempt for ${dto.email}`);
      const { user, accessToken, refreshToken } = await this.loginUser.execute(dto);
      logger.info(`User ${user.id} logged in`);
      res.json({ user: { id: user.id, email: user.email }, accessToken, refreshToken });
    } catch (err: any) {
      logger.error(`Login error: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      if (!refreshToken) throw new Error('refresh token required');
      const payload = verifyToken<{ sub: string; jti: string }>(refreshToken);
      revokeToken(payload.jti);
      const user = await this.repo.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) throw new Error('invalid token');
      logger.info(`Token refresh for user ${user.id}`);
      const accessToken = generateAccessToken(user.id);
      const newRefreshToken = generateRefreshToken(user.id);
      await this.repo.updateRefreshToken(user.id, newRefreshToken);
      res.json({ accessToken, refreshToken: newRefreshToken });
    } catch (err: any) {
      logger.error(`Refresh error: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { refreshToken } = req.body as { refreshToken: string };
      if (!refreshToken) throw new Error('refresh token required');
      const payload = verifyToken<{ sub: string; jti: string }>(refreshToken);
      revokeToken(payload.jti);
      await this.repo.updateRefreshToken(payload.sub, null);
      logger.info(`User ${payload.sub} logged out`);
      res.json({ success: true });
    } catch (err: any) {
      logger.error(`Logout error: ${err.message}`);
      res.status(400).json({ error: err.message });
    }
  };
}
