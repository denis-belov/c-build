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

const getCommandLineArgs = () => {
  const args = {};

  process.argv.slice(2).forEach((elm) => {
    const parts = elm.split('=');

    args[parts[0]] = parts[1] || true;
  });

  return args;
};

const replaceDir = (path, make_dir = true) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((elm) => {
      const sub_path = join(path, elm);

      if (fs.lstatSync(sub_path).isFile()) {
        fs.unlinkSync(sub_path);
      } else {
        replaceDir(sub_path, false);
      }
    });

    fs.rmdirSync(path);
  }

  if (make_dir) {
    fs.mkdirSync(path);
  }
};

const execSync = (cmd) => new Promise((resolve) => exec(cmd, { maxBuffer: 1024 * 500 }, (err, stdout, stderr) => resolve([ err, stdout /* , stderr */ ])));

// const stream2uint32array = (path) => new Promise((resolve) => {
//   const stream = fs.createReadStream(path);
//   stream.on('data', (data) => {
//     stream.close();
//     // console.log(new Uint32Array(data.buffer.slice(0, data.length)));
//     resolve(new Uint32Array(data.buffer.slice(0, data.length)));
//   });
// });

const $ = (bin, arg = '') => {
  const name = win32.basename(bin);
  const [ path ] = bin.split(name);

  return `cd /d ${ path } && ${ name } ${ typeof arg === 'string' ? arg : arg.join(' ') }`;
};

const colorize = (out) => out.forEach((elm) => (!elm || elm.toString().split('\r\n').forEach((str) => log(chalk[({
  error: 'red',
  warning: 'yellow',
  note: 'grey',
  console_log: 'white',
  undefined: 'blue',
})[(str.toLowerCase().match(/error|warning|note|console_log/) || [])[0]]](str)))));

const parseGlsl = async (src_path, dst_path, include_files) => {
  // const test = fs.readFileSync('E:/reps/denis-belov/c-build/test.txt');
  // console.log(test);
  // console.log(new Uint8Array(test));
  // console.log(new Uint8Array(test).buffer);
  // console.log(test.buffer);

  // throw '';

  let files = null;

  if (include_files) {
    if (typeof include_files === 'string') {
      files = [ include_files ];
    } else {
      files = include_files;
    }
  } else {
    files = fs.readdirSync(src_path);
  }

  replaceDir(dst_path);

  for (let i = 0; i < files.length; i++) {
    const src_file = join(src_path, files[i]);
    const dst_file = join(dst_path, files[i]);

    if (fs.lstatSync(src_file).isFile()) {
      let file = fs.readFileSync(src_file, 'utf8');

      while (true) {
        const match = file.match(/[A-Za-z0-9_-]+.(comp|frag|geom|tesc|tese|vert)\(\{[^]*?\}\)/);

        if (!match) {
          break;
        }

        const glsl_code_wrapper = match[0];
        const glsl_filename = glsl_code_wrapper.match(/[A-Za-z0-9_-]+.(comp|frag|geom|tesc|tese|vert)/)[0];
        const glsl_path = join(dst_path, glsl_filename);
        const spirv_path = join(dst_path, `${ glsl_filename.split('.').pop() }.spv`);
        let tab = 0;

        fs.writeFileSync(glsl_path, glsl_code_wrapper.match(/\(\{[^]*?\}\)/)[0].slice(2, -2).split('\r').slice(1, -1).map((elm, row_index) => {
          tab = tab || (elm.match(/( )+/) || [ '' ])[0].length;
          const row = elm.replace(/\n/g, '');
          const row_tab = (row.match(/( )+/) || [ '' ])[0].length;
          const new_row = row.slice(row_tab < tab ? row_tab : tab);
          log(chalk.yellow(`${ row_index }:`), chalk.green(new_row));
          return new_row;
        }).join('\n'));

        // colorize(await execSync($(join(VULKAN, 'Bin/spirv-val.exe'), spirv_path)));
        colorize(await execSync($(join(VULKAN, 'Bin/glslangValidator.exe'), `-V -H -Os ${ glsl_path } -o ${ spirv_path } --spirv-dis`)));
        // colorize(await execSync($(join(VULKAN, 'Bin/spirv-remap.exe'), `--map all --input ${ spirv_path } --output ${ dst_path }`)));

        const arr = new Uint32Array(new Uint8Array(fs.readFileSync(spirv_path)).buffer);

        file = `${ file.slice(0, match.index) }{ ${ arr } }${ file.slice(match.index + glsl_code_wrapper.length) }`;
      }

      fs.appendFileSync(dst_file, file);
    }
  }
};

module.exports = {
  getCommandLineArgs,
  replaceDir,
  execSync,
  // stream2uint32array,
  $,
  colorize,
  parseGlsl,
};
