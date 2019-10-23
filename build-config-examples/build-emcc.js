'use strict';

const fs = require('fs');
const { join } = require('path');

module.exports = async (tools, consts, MODE) => {
  const { replaceDir, execSync, colorize, $ } = tools;
  const { EMCC } = consts;

  const config = {
    compilerArg: [
      [
        'test.cpp'
      ].map((elm) => join(__dirname, '../../xgk-cpp-test/src', elm)).join(' '),

      '-Os',
      '-o E:/reps/xgk/xgk-js-web-test/src/js/function.js',
      '-s WASM=1',
      '-s MODULARIZE=1',
      '-s ENVIRONMENT=web',
      `-s EXPORTED_FUNCTIONS="['_qwe']"`,
      `-s EXTRA_EXPORTED_RUNTIME_METHODS="['cwrap']"`,
      '-s USE_GLFW=3',
      '-I E:/reps/xgk/xgk-engine/src',
      '-L E:/reps/xgk/xgk-engine/DEBUG`',
      '-D EMSCRIPTEN_',
    ],
  };

  const { compilerArg } = config;

  replaceDir(join(__dirname, `../../xgk-cpp-test/${ MODE }`));
  
  colorize(await execSync(`${ $(EMCC, compilerArg) }`));

  fs.writeFileSync('E:/reps/xgk/xgk-js-web-test/src/js/function.js', `/*eslint-disable*/${ fs.readFileSync('E:/reps/xgk/xgk-js-web-test/src/js/function.js', 'utf8') }`);
};
