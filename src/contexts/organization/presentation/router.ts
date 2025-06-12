import { Router } from 'express';
import { organizationRepository } from '../infrastructure/OrganizationRepository';

const router = Router();

router.get('/', async (_req, res) => {
  const orgs = await organizationRepository.findAll();
  res.json(orgs);
});

router.post('/', async (req, res) => {
  const { name, description, userId } = req.body;
  if (!name || !userId) {
    return res.status(400).json({ message: 'name and userId are required' });
  }
  try {
    const org = await organizationRepository.create(name, userId, description);
    res.status(201).json(org);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  const org = await organizationRepository.findById(req.params.id);
  if (!org) return res.status(404).end();
  res.json(org);
});

router.put('/:id', async (req, res) => {
  try {
    const org = await organizationRepository.update(req.params.id, req.body);
    if (!org) return res.status(404).end();
    res.json(org);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  await organizationRepository.delete(req.params.id);
  res.status(204).end();
});

router.get('/:id/members', async (req, res) => {
  const members = await organizationRepository.listMembers(req.params.id);
  res.json(members);
});

router.post('/:id/members', async (req, res) => {
  const { userId, role } = req.body;
  if (!userId || !role) return res.status(400).json({ message: 'userId and role are required' });
  try {
    const m = await organizationRepository.addMember(req.params.id, userId, role);
    res.status(201).json(m);
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
  }
});

router.delete('/:id/members/:userId', async (req, res) => {
  await organizationRepository.removeMember(req.params.id, req.params.userId);
  res.status(204).end();
});

export default router;
