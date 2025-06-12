import { execSync } from 'child_process';

module.exports = async () => {
  execSync('npx node-pg-migrate up', { stdio: 'inherit' });
  execSync('ts-node src/shared/database/seeds/seed.ts', { stdio: 'inherit' });
};
