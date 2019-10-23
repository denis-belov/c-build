/*
eslint-disable
linebreak-style,
id-length,
id-match,
camelcase,
max-len,
no-sync,
no-magic-numbers
*/

const fs = require('fs');
const { join } = require('path');
const consts = require('./consts');
const { getCommandLineArgs, execSync, replaceDir, colorize, $ } = require('./tools');
const { OBJ_PATH } = consts;
const { PROJECT, COMPILER, MODE, RUN } = getCommandLineArgs();
const conf = require(`${ PROJECT }/build-config`);
// const chalk = require('chalk');

replaceDir(join(PROJECT, MODE));

let src = null;

if (typeof conf.files === 'string') {
  src = [ join(PROJECT, conf.path, conf.files) ];
} else {
  src = conf.files.map((elm) => join(PROJECT, conf.path, elm)).join(' ');
}

const extra_args = [];

if (COMPILER === 'gcc') {
  extra_args.push(
    `-D ${ MODE }`,
    '-D GCC',
    `-o ${ join(PROJECT, MODE, conf.out || `${ conf.name }.exe`) }`,
  );
} else if (COMPILER === 'cl') {
  extra_args.push(
    `/D${ MODE }`,
    '/DCL',
    `/Fe${ join(PROJECT, MODE, conf.out || `${ conf.name }.exe`) }`,
  );
} else if (COMPILER === 'emcc') {
  extra_args.push(
    `-D ${ MODE }`,
    '-D EMCC',
  );
}

conf.compilers[COMPILER] = [ ...src, ...extra_args, ...conf.compilers[COMPILER] ].join(' ');

(async () => {
  await execSync('chcp 65001');

  if (conf.stages && conf.stages.length) {
    await conf.stages.forEach((stage) => stage());
  }

  // if (conf.env) {
  //   colorize(await execSync(`vcvarsall ${ conf.env } && ${ COMPILER } ${ conf.compilers[COMPILER] }`));
  // } else {
  colorize(await execSync(`${ COMPILER } ${ conf.compilers[COMPILER] }`));
  // }

  fs.readdirSync(OBJ_PATH).filter((elm) => elm.search('.obj') > -1).forEach((elm) => !fs.existsSync(`${ OBJ_PATH }/${ elm }.obj`) || fs.unlinkSync(`${ OBJ_PATH }/${ elm }.obj`));

  if (RUN) {
    colorize(await execSync($(join(PROJECT, MODE, `${ conf.name }.exe`))));
  }
})();
