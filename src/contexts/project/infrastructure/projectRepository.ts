import pool from '../../../shared/database/connection';
import { Board, Column, Issue, IssueComment } from '../domain/models';

export async function createBoard(
  orgId: string,
  name: string,
  description: string | null,
  userId: string,
): Promise<{ board: Board; columns: Column[] }> {
  const boardRes = await pool.query<Board>(
    `INSERT INTO boards (organization_id, name, description, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [orgId, name, description, userId],
  );
  const board = boardRes.rows[0];

  const columns: Column[] = [];
  const columnNames = ['Backlog', 'In Progress', 'Done'];
  for (let i = 0; i < columnNames.length; i += 1) {
    const colRes = await pool.query<Column>(
      `INSERT INTO columns (board_id, name, position)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [board.id, columnNames[i], i + 1],
    );
    columns.push(colRes.rows[0]);
  }

  return { board, columns };
}

export async function listBoards(orgId: string): Promise<Board[]> {
  const res = await pool.query<Board>(
    'SELECT * FROM boards WHERE organization_id = $1 ORDER BY created_at',
    [orgId],
  );
  return res.rows;
}

export async function getBoard(orgId: string, boardId: string): Promise<Board & { columns: Column[] }> {
  const boardRes = await pool.query<Board>(
    'SELECT * FROM boards WHERE id = $1 AND organization_id = $2',
    [boardId, orgId],
  );
  const board = boardRes.rows[0];
  const colRes = await pool.query<Column>(
    'SELECT * FROM columns WHERE board_id = $1 ORDER BY position',
    [boardId],
  );
  return { ...board, columns: colRes.rows };
}

export async function updateBoard(
  orgId: string,
  boardId: string,
  name: string,
  description: string | null,
): Promise<Board> {
  const res = await pool.query<Board>(
    `UPDATE boards
     SET name = $1, description = $2, updated_at = NOW()
     WHERE id = $3 AND organization_id = $4
     RETURNING *`,
    [name, description, boardId, orgId],
  );
  return res.rows[0];
}

export async function deleteBoard(orgId: string, boardId: string): Promise<void> {
  await pool.query('DELETE FROM boards WHERE id = $1 AND organization_id = $2', [boardId, orgId]);
}

export async function createIssue(
  boardId: string,
  columnId: string,
  title: string,
  description: string | null,
  assignedTo: string | null,
  priority: string,
  userId: string,
): Promise<Issue> {
  const posRes = await pool.query<{ pos: number }>(
    'SELECT COALESCE(MAX(position), 0) + 1 as pos FROM issues WHERE column_id = $1',
    [columnId],
  );

  const res = await pool.query<Issue>(
    `INSERT INTO issues (board_id, column_id, title, description, assigned_to, priority, position, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [boardId, columnId, title, description, assignedTo, priority, posRes.rows[0].pos, userId],
  );
  return res.rows[0];
}

export async function moveIssue(issueId: string, columnId: string, position: number): Promise<Issue> {
  const res = await pool.query<Issue>(
    `UPDATE issues
     SET column_id = $1, position = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [columnId, position, issueId],
  );
  return res.rows[0];
}

export async function addComment(issueId: string, userId: string, content: string): Promise<IssueComment> {
  const res = await pool.query<IssueComment>(
    `INSERT INTO issue_comments (issue_id, user_id, content)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [issueId, userId, content],
  );
  return res.rows[0];
}
