import { runSeeds } from '../../src/shared/database/seeds/seed';

const executed: string[] = [];

const mockPool = {
  query: async (sql: string) => {
    executed.push(sql);
    return { rows: [] };
  },
};

describe('database seeds', () => {
  it('loads demo board issues', async () => {
    await runSeeds(mockPool as any);
    const allSql = executed.join('\n');
    expect(allSql).toContain('Getting Started');
    expect(allSql).toContain('INSERT INTO issues');
  });
});
