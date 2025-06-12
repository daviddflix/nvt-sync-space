jest.mock('../../src/shared/database/connection', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from '../../src/shared/database/connection';
import { moveIssue } from '../../src/contexts/project/infrastructure/projectRepository';

const queryMock = pool.query as jest.Mock;

describe('issue lifecycle', () => {
  beforeEach(() => {
    queryMock.mockReset();
  });

  it('moves issue to new column', async () => {
    queryMock.mockResolvedValue({ rows: [{ id: '1', column_id: 'col2', position: 2 }] });
    const result = await moveIssue('1', 'col2', 2);
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining('UPDATE issues'), ['col2', 2, '1']);
    expect(result.column_id).toBe('col2');
    expect(result.position).toBe(2);
  });
});
