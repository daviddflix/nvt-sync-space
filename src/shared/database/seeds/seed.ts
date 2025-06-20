import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runSeeds(): Promise<void> {
  const seedDir = __dirname;
  const files = fs.readdirSync(seedDir)
    .filter(f => f.match(/^\d+_.*\.sql$/))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(seedDir, file), 'utf8');
    console.log(`Running seed: ${file}`); // eslint-disable-line no-console
    await pool.query(sql);
  }
}

runSeeds()
  .then(() => {
    console.log('Seeding complete'); // eslint-disable-line no-console
    return pool.end();
  })
  .catch(err => {
    console.error(err); // eslint-disable-line no-console
    pool.end().then(() => process.exit(1));
  });
