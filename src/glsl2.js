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
*/

const fs = require('fs');
const { join, win32 } = require('path');
const { exec } = require('child_process');
const chalk = require('chalk');
const { VULKAN } = require('./consts');
const log = console.log.bind(console);

const execSync = (cmd) => new Promise((resolve) => exec(cmd, { maxBuffer: 0xFFFFFFFF }, (err, stdout, stderr) => resolve([ err, stdout /* , stderr */ ])));

const $ = (bin, arg = '') => {
  const name = win32.basename(bin);
  const [ path ] = bin.split(name);

  return `cd /d ${ path } && ${ name } ${ typeof arg === 'string' ? arg : arg.join(' ') }`;
};

const run = async (src_file, dst_file) => {
  if (fs.lstatSync(src_file).isFile()) {
    let file = fs.readFileSync(src_file, 'utf8');

    while (true) {
      const match = file.match(/[A-Za-z0-9_-]+.(comp|frag|geom|tesc|tese|vert)\(\{[^]*?\}\)/);

      if (!match) {
        break;
      }

      const glsl_code_wrapper = match[0];
      const glsl_code = glsl_code_wrapper.match(/\(\{[^]*?\}\)/)[0].slice(2, -2);
      const glsl_filename = glsl_code_wrapper.match(/[A-Za-z0-9_-]+.(comp|frag|geom|tesc|tese|vert)/)[0];
      const glsl_path = join(__dirname, '../.', glsl_filename);
      const spirv_path = join(__dirname, '../.', `${ glsl_filename.split('.').pop() }.spv`);
      let tab = 0;

      log(glsl_filename);
      log(glsl_path);

      fs.writeFileSync(glsl_path, glsl_code.split('\r').slice(1, -1).map((elm, row_index) => {
        tab = tab || (elm.match(/( )+/) || [ '' ])[0].length;
        const row = elm.replace(/\n/g, '');
        const row_tab = (row.match(/( )+/) || [ '' ])[0].length;
        const new_row = row.slice(row_tab < tab ? row_tab : tab);
        log(chalk.yellow(`${ row_index }:`), chalk.green(new_row));
        return new_row;
      }).join('\n'));

      // await execSync($(join(VULKAN, 'Bin/glslangValidator.exe'), glsl_path));
      // fs.unlinkSync(glsl_path);

      const test = glsl_code.trim().split('');

      const [ err, stdout ] = await execSync($(join(VULKAN, 'Bin/glslangValidator.exe'), `-V -H -Os ${ glsl_path } -o ${ spirv_path } --spirv-dis`));

      log(err);
      log(stdout);

      new Uint32Array(new Uint8Array(fs.readFileSync(spirv_path)).buffer)
      // file = `${ file.slice(0, match.index) }{${ new Uint32Array(new Uint8Array(test.map((elm, i) => elm.charCodeAt(0)).concat(new Array(4 - (test.length % 4)).fill(0))).buffer) }}${ file.slice(match.index + glsl_code_wrapper.length) }`;
      file = `${ file.slice(0, match.index) }{ ${ new Uint32Array(new Uint8Array(fs.readFileSync(spirv_path)).buffer) } }${ file.slice(match.index + glsl_code_wrapper.length) }`;

      fs.unlinkSync(spirv_path);
      fs.unlinkSync(glsl_path);
    }

    fs.writeFileSync(dst_file, file);
  }
};

const [ src_file, dst_file ] = process.argv.slice(2);

run(src_file, dst_file);
