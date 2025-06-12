import { Router } from 'express';
import {
  createBoard,
  listBoards,
  getBoard,
  updateBoard,
  deleteBoard,
  createIssue,
  moveIssue,
  addComment,
} from '../infrastructure/projectRepository';

const router = Router();

router.post('/orgs/:orgId/boards', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const { orgId } = req.params;
    const userId = req.header('x-user') || '00000000-0000-0000-0000-000000000000';
    const result = await createBoard(orgId, name, description ?? null, userId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/orgs/:orgId/boards', async (req, res, next) => {
  try {
    const boards = await listBoards(req.params.orgId);
    res.json({ boards });
  } catch (err) {
    next(err);
  }
});

router.get('/orgs/:orgId/boards/:boardId', async (req, res, next) => {
  try {
    const board = await getBoard(req.params.orgId, req.params.boardId);
    res.json(board);
  } catch (err) {
    next(err);
  }
});

router.put('/orgs/:orgId/boards/:boardId', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const board = await updateBoard(
      req.params.orgId,
      req.params.boardId,
      name,
      description ?? null,
    );
    res.json(board);
  } catch (err) {
    next(err);
  }
});

router.delete('/orgs/:orgId/boards/:boardId', async (req, res, next) => {
  try {
    await deleteBoard(req.params.orgId, req.params.boardId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.post('/orgs/:orgId/boards/:boardId/issues', async (req, res, next) => {
  try {
    const { columnId, title, description, assignedTo, priority } = req.body;
    const userId = req.header('x-user') || '00000000-0000-0000-0000-000000000000';
    const issue = await createIssue(
      req.params.boardId,
      columnId,
      title,
      description ?? null,
      assignedTo ?? null,
      priority ?? 'medium',
      userId,
    );
    res.status(201).json(issue);
  } catch (err) {
    next(err);
  }
});

router.put('/orgs/:orgId/issues/:issueId/move', async (req, res, next) => {
  try {
    const { columnId, position } = req.body;
    const issue = await moveIssue(req.params.issueId, columnId, position);
    res.json(issue);
  } catch (err) {
    next(err);
  }
});

router.post('/orgs/:orgId/issues/:issueId/comments', async (req, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.header('x-user') || '00000000-0000-0000-0000-000000000000';
    const comment = await addComment(req.params.issueId, userId, content);
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
});

export default router;
