'use strict';

const { join } = require('path');

module.exports = async (tools, consts, MODE, RUN) => {
  const { replaceDir, execSync, colorize, $ } = tools;
  const { VCVARSALL, CL } = consts;

  const config = {
    envArg: [ 'amd64' ],

    compilerArg: [
      [
        'test.cpp'
      ].map((elm) => join(__dirname, '../xgk-cpp-test/src', elm)).join(' '),

      '/EHsc',
      '/MT',
      '/MP999',

      `/D${ MODE }`,

      '/IE:/reps/xgk/xgk-engine/src',

      `/Fe${ join(__dirname, `../xgk-cpp-test/${ MODE }`, 'xgk-cpp-test.exe') }`,

      '/link',

      '/SUBSYSTEM:CONSOLE',
      '/NODEFAULTLIB:MSVCRT',
      '/NODEFAULTLIB:LIBCMT',

      '/LIBPATH:E:/reps/xgk/xgk-engine/DEBUG',

      'msvcrt.lib',
      'gdi32.lib',
      'user32.lib',
      'shell32.lib',
      'xgk-engine.lib',
    ],
  };

  const { envArg, compilerArg } = config;

  replaceDir(join(__dirname, `../xgk-cpp-test/${ MODE }`));
  
  colorize(await execSync(`${ $(VCVARSALL, envArg) } && ${ $(CL, compilerArg) }`));

  if (RUN) {
    colorize(await execSync($(join(__dirname, `../xgk-cpp-test/${ MODE }`, 'xgk-cpp-test.exe'))));
  }
};
