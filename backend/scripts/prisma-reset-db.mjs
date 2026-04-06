import { execSync } from 'node:child_process';
import path from 'node:path';

const cwd = process.cwd();
const schemaPath = path.join('prisma', 'schema.prisma');
const preResetFile = path.join('prisma', 'pre-reset.sql');
const postResetFile = path.join('prisma', 'post-reset.sql');

function run(command) {
  console.log(`\n> ${command}`);
  execSync(command, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });
}

run(`npx prisma db execute --schema "${schemaPath}" --file "${preResetFile}"`);
run(`npx prisma db push --force-reset --accept-data-loss --schema "${schemaPath}"`);
run(`npx prisma db execute --schema "${schemaPath}" --file "${postResetFile}"`);
run(`npx prisma db seed --schema "${schemaPath}"`);
