import { Router } from 'express';
import OrganizationService from '../application/OrganizationService';
import OrganizationRepositoryPg from '../infrastructure/OrganizationRepositoryPg';

const repo = new OrganizationRepositoryPg();
const service = new OrganizationService(repo);

const router = Router();

// Middleware to extract userId from header for simplicity
router.use((req, res, next) => {
  const userId = req.header('x-user-id');
  if (!userId) {
    return res.status(400).json({ error: 'Missing user id' });
  }
  (req as any).userId = userId;
  next();
});

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const org = await service.createOrganization(name, description, (req as any).userId);
    res.status(201).json(org);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  const orgs = await service.listOrganizations((req as any).userId);
  res.json({ organizations: orgs });
});

router.get('/:id', async (req, res) => {
  const org = await service.getOrganization(req.params.id);
  if (!org) return res.status(404).end();
  res.json(org);
});

router.put('/:id', async (req, res) => {
  const { name, description } = req.body;
  const updated = await service.updateOrganization(req.params.id, name, description);
  if (!updated) return res.status(404).end();
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  await service.deleteOrganization(req.params.id);
  res.status(204).end();
});

router.post('/:id/members', async (req, res) => {
  const { userId, role } = req.body;
  await service.addMember(req.params.id, userId, role || 'member');
  res.status(204).end();
});

router.delete('/:id/members/:userId', async (req, res) => {
  await service.removeMember(req.params.id, req.params.userId);
  res.status(204).end();
});

export default router;
