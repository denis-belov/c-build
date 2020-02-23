/*
eslint-disable
linebreak-style,
id-length,
id-match,
camelcase,
max-len,
no-sync,
no-magic-numbers,
no-confusing-arrow,
*/

// const fs = require('fs');
const { join } = require('path');
// const consts = require('./consts');
const { getCommandLineArgs, execSync, replaceDir, colorize, $ } = require('./tools');
// const { OBJ_PATH } = consts;
const { PROJECT, COMPILER, ASSEMBLER, MODE, RUN } = getCommandLineArgs();
const conf = require(`${ PROJECT }/build-config`);
// const chalk = require('chalk');

replaceDir(join(PROJECT, MODE));

// let src = null;

if (typeof conf.files === 'string') {
  conf.files = [ join(PROJECT, conf.path, conf.files) ];
}

const extra_args = [];

if (COMPILER === 'gcc') {
  extra_args.push(
    `-D ${ MODE }`,
    `-o ${ join(PROJECT, MODE, conf.out || `${ conf.name }.exe`) }`,
  );
} else if (COMPILER === 'cl') {
  extra_args.push(
    `/D${ MODE }`,
    `/Fe${ join(PROJECT, MODE, conf.out || `${ conf.name }.exe`) }`,
  );
} else if (COMPILER === 'emcc') {
  extra_args.push(
    `-D ${ MODE }`,
  );
}

conf.compilers[COMPILER] = [ ...conf.files, ...extra_args, ...conf.compilers[COMPILER] ].join(' ');

if (conf.assemblers) {
  conf.assemblers[ASSEMBLER] = conf.assemblers[ASSEMBLER].join(' ');
}

(async () => {
  await execSync('chcp 65001');

  if (conf.stages && conf.stages.length) {
    await conf.stages.forEach((stage) => stage());
  }

  if (conf.assemblers) {
    colorize(await execSync(`${ ASSEMBLER } ${ conf.assemblers[ASSEMBLER] }`));
  }

  if (COMPILER === 'cl' && conf.env) {
    colorize(await execSync(`vcvarsall ${ conf.env } && cl ${ conf.compilers[COMPILER] }`));
  } else {
    colorize(await execSync(`${ COMPILER } ${ conf.compilers[COMPILER] }`));
  }

  // fs.readdirSync(OBJ_PATH).filter((elm) => elm.search('.obj') > -1).forEach((elm) => !fs.existsSync(`${ OBJ_PATH }/${ elm }.obj`) || fs.unlinkSync(`${ OBJ_PATH }/${ elm }.obj`));

  if (RUN) {
    colorize(await execSync($(join(PROJECT, MODE, `${ conf.name }.exe`))));
  }
})();
