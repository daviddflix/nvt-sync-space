import { Router } from 'express';
import { InMemoryUserRepository } from '../infrastructure/InMemoryUserRepository';
import { RegisterUser } from '../application/usecases/registerUser';
import { LoginUser } from '../application/usecases/loginUser';
import { verifyToken, generateAccessToken, generateRefreshToken } from '../application/utils/jwt';
import { revokeToken } from '../application/utils/tokenStore';

const router = Router();
const repo = new InMemoryUserRepository();

const registerUser = new RegisterUser(repo);
const loginUser = new LoginUser(repo);

router.post('/register', async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await registerUser.execute(req.body);
    res.status(201).json({ user: { id: user.id, email: user.email }, accessToken, refreshToken });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser.execute(req.body);
    res.json({ user: { id: user.id, email: user.email }, accessToken, refreshToken });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) throw new Error('refresh token required');
    const payload = verifyToken<{ sub: string; jti: string }>(refreshToken);
    revokeToken(payload.jti);
    const user = await repo.findById(payload.sub);
    if (!user || user.refreshToken !== refreshToken) throw new Error('invalid token');
    const accessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);
    await repo.updateRefreshToken(user.id, newRefreshToken);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) throw new Error('refresh token required');
    const payload = verifyToken<{ sub: string; jti: string }>(refreshToken);
    revokeToken(payload.jti);
    await repo.updateRefreshToken(payload.sub, null);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
