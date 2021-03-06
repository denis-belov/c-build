const { exec } = require('child_process');

const execSync = (cmd) => new Promise((resolve) => exec(cmd, { maxBuffer: 0xFFFFFFFF }, (err, stdout, stderr) => resolve({ err, stdout, stderr })));

const run = async () => {
  const { stdout, stderr } = await execSync(`chcp 65001 && cd /d ${ process.argv[2] } && ${ process.argv[3] }`);

  console.log(stdout.match(/error/gi) ? '\x1b[31m' : '\x1b[32m', stdout.replace(/(\t)+/g, ''));
  console.log(stderr.match(/error/gi) ? '\x1b[31m' : '\x1b[32m', stderr.replace(/(\t)+/g, ''));
};

run();
