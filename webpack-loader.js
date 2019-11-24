/*
eslint-disable
linebreak-style,
id-length,
id-match,
no-console,
no-sync,
func-style,
max-len,
no-magic-numbers,
id-blacklist,
camelcase,
no-unused-expressions,
no-constant-condition,
prefer-destructuring,
no-inline-comments,
no-unused-vars,
complexity,
*/

const fs = require('fs');
const { join } = require('path');
const { replaceDir, colorize, execSync, $, removeDir, parseGlsl } = require('./tools');

module.exports = async function WebpackLoader(src) {
  const options = (this.options && this.options.eslint) || this.query || {};
  let common_args = '';
  let [ args ] = src.match(/\/\*( )+compiler-args[^]*?\*\//i);

  if (!options.compiler) {
    throw new Error('You must pass compiler path');
  }

  if (options.args) {
    if (options.args.split) {
      common_args = options.args;
    } else if (options.args.join) {
      common_args = options.args.join(' ');
    }
  }

  if (args) {
    args = args
      .replace(/\/\*( )+compiler-args/, '')
      .replace(/\*\//, '')
      .replace(/\s/g, ' ');
  } else {
    args = '';
  }

  replaceDir(join(__dirname, 'tmp'));

  fs.appendFileSync(join(__dirname, `tmp/wasm.${ options.type || 'cpp' }`), src);

  await parseGlsl(join(__dirname, 'tmp'), join(__dirname, 'tmp'), `wasm.${ options.type || 'cpp' }`);

  colorize(await execSync(`${ $(options.compiler, [ `-o ${ join(__dirname, 'tmp/wasm.js') }`, `${ args } ${ common_args }`, join(__dirname, `tmp/wasm.${ options.type || 'cpp' }`) ]) }`));

  const js = fs.readFileSync(join(__dirname, 'tmp/wasm.js'), 'utf8');

  removeDir(join(__dirname, 'tmp'));

  return `/*eslint-disable*/${ js }`;
};
