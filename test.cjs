const assert = require('node:assert/strict');
const { execFileSync, spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

async function main() {
  const { version } = require('./package.json');
  const tarball = resolve(`killp-${version}.tgz`);
  const contents = execFileSync('tar', ['-tzf', tarball], { encoding: 'utf8' });
  assert.deepEqual(contents.trim().split('\n').sort(), [
    'package/LICENSE', 'package/README.md', 'package/killp', 'package/package.json',
  ]);
  assert.deepEqual(
    execFileSync('tar', ['-xOzf', tarball, 'package/killp']),
    readFileSync('killp'),
  );
  const run = (...args) => spawnSync('npx', [
    '--yes', '--package', tarball, '--', 'killp', ...args,
  ], { encoding: 'utf8', timeout: 30000 });
  const usage = run();
  assert.equal(usage.status, 2, usage.stderr);
  assert.match(usage.stderr, /usage: killp PORT/);
  const invalid = run('invalid');
  assert.equal(invalid.status, 2, invalid.stderr);
  assert.match(invalid.stderr, /is not a port/);

  const listener = spawn(process.execPath, ['-e', `
    const server = require('node:net').createServer();
    server.listen(0, '127.0.0.1', () => console.log(server.address().port));
  `], { stdio: ['ignore', 'pipe', 'inherit'] });
  const exited = once(listener, 'exit');
  const timeout = setTimeout(() => listener.kill(), 30000);
  try {
    const [output] = await once(listener.stdout, 'data');
    const result = run(output.toString().trim());
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /: killed /);
    assert.equal((await exited)[1], 'SIGKILL');
    console.log('Tarball contents, npx usage, invalid input, and listener termination passed.');
  } finally {
    clearTimeout(timeout);
    listener.kill();
    await exited;
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
