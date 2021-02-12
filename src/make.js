/*
eslint-disable

max-len,
*/



const path = require('path');
const fs = require('fs');



const C_EXT = [ '.c' ];
// const CPP_EXT = [ '.cpp' ];



const makeArray = (_object) => (Array.isArray(_object) ? _object : [ _object || '' ].filter((elm) => elm));



class Make {

	// compile constants

	static GCC_X64 = 'gcc-x64';
	static MSVS_X64 = 'msvs-x64';
	static EMCC_X64 = 'emcc-x64';



	constructor (options) {

		const {

			GCC_X64,
			MSVS_X64,
			EMCC_X64,
		} = Make;

		this.env = options?.env || GCC_X64;
		this.dirname = options?.dirname || '';

		this.str = '';



		// file extensions. RENAME!

		let a = null;

		switch (this.env) {

		case GCC_X64:
		case EMCC_X64:

			a = 'a';
			break;

		case MSVS_X64:

			a = 'lib';
			break;

		default:
		}

		this.a = a;



		let o = null;

		switch (this.env) {

		case GCC_X64:
		case EMCC_X64:

			o = 'o';
			break;

		case MSVS_X64:

			o = 'obj';
			break;

		default:
		}



		let s = null;

		switch (this.env) {

		case GCC_X64:

			s = 's';
			break;

		case MSVS_X64:

			s = 'asm';
			break;

		case EMCC_X64:

			s = 'wat';
			break;

		default:
		}



		let bin = null;

		switch (this.env) {

		case GCC_X64:

			bin = 'bin';
			break;

		case MSVS_X64:

			bin = 'exe';
			break;

		case EMCC_X64:

			bin = 'js';
			break;

		default:
		}



		// tools

		let ASSEMBLER = null;

		switch (this.env) {

		case GCC_X64:

			ASSEMBLER = 'gcc';
			break;

		case MSVS_X64:

			ASSEMBLER = 'ml64';
			break;

		default:
		}

		let ASSEMBLER_ARG = null;

		switch (this.env) {

		case GCC_X64:

			ASSEMBLER_ARG = '-c';
			break;

		case MSVS_X64:

			ASSEMBLER_ARG = '/c';
			break;

		default:
		}



		let C_COMPILER = null;

		switch (this.env) {

		case GCC_X64:

			C_COMPILER = 'gcc';
			break;

		case MSVS_X64:

			C_COMPILER = 'cl';
			break;

		case EMCC_X64:

			C_COMPILER = 'emcc';
			break;

		default:
		}

		let C_COMPILER_ARG = null;

		switch (this.env) {

		case GCC_X64:

			C_COMPILER_ARG = '-c -m64 -msse3 -Ofast -funroll-loops -Wall -Wextra -Wpedantic';
			break;

		case MSVS_X64:

			C_COMPILER_ARG = '/c /EHsc /MP999 /O2';
			break;

		case EMCC_X64:

			C_COMPILER_ARG = '-c -O3 -msimd128 -msse -Wall -Wextra -Wpedantic';
			break;

		default:
		}



		let CPP_COMPILER = null;

		switch (this.env) {

		case GCC_X64:

			CPP_COMPILER = 'g++';
			break;

		case MSVS_X64:

			CPP_COMPILER = 'cl';
			break;

		case EMCC_X64:

			CPP_COMPILER = 'emcc';
			break;

		default:
		}

		let CPP_COMPILER_ARG = null;

		switch (this.env) {

		case GCC_X64:

			CPP_COMPILER_ARG = '-c -std=c++20 -m64 -msse3 -Ofast -funroll-loops -Wall -Wextra -Wpedantic';
			break;

		case MSVS_X64:

			CPP_COMPILER_ARG = '/c /std:c++20 /EHsc /MP999 /O2';
			break;

		case EMCC_X64:

			CPP_COMPILER_ARG = '-c -std=c++20 -O3 -msimd128 -msse -Wall -Wextra -Wpedantic';
			break;

		default:
		}



		let BUILDER = null;

		switch (this.env) {

		case GCC_X64:

			BUILDER = 'ld';
			break;

		case MSVS_X64:

			BUILDER = 'lib';
			break;

		case EMCC_X64:

			BUILDER = 'emcc';
			break;

		default:
		}

		let BUILDER_ARG = null;

		switch (this.env) {

		case GCC_X64:

			BUILDER_ARG = '-r -flto';
			break;

		case MSVS_X64:

			BUILDER_ARG = '';
			break;

		case EMCC_X64:

			BUILDER_ARG = '';
			break;

		default:
		}



		let LINKER = null;

		switch (this.env) {

		case GCC_X64:

			LINKER = 'gcc';
			break;

		case MSVS_X64:

			LINKER = 'link';
			break;

		case EMCC_X64:

			LINKER = 'emcc';
			break;

		default:
		}

		let LINKER_ARG = null;

		switch (this.env) {

		case GCC_X64:

			LINKER_ARG = '-flto';
			break;

		case MSVS_X64:

			LINKER_ARG = [

				'/SUBSYSTEM:CONSOLE',
				'/NODEFAULTLIB:LIBUCRT',
				'/NODEFAULTLIB:MSVCRT',
			].join(' ');
			break;

		case EMCC_X64:

			LINKER_ARG = [

				'--bind',
				'-s WASM=1',
				'-s SINGLE_FILE=1',
				'-s MODULARIZE=1',
				'-s EXPORT_ES6=1',
				'-s USE_ES6_IMPORT_META=0',
				'-s ENVIRONMENT=web',
				'-s EXPORTED_RUNTIME_METHODS=\'["ccall", "cwrap"]\'',
				'-s ASSERTIONS=1',
			].join(' ');
			break;

		default:
		}



		let MAKE_TOOL = null;

		switch (this.env) {

		case GCC_X64:

			MAKE_TOOL = 'make';
			break;

		case MSVS_X64:

			MAKE_TOOL = 'nmake';
			break;

		case EMCC_X64: {

			switch (process.platform) {

			case 'linux':

				MAKE_TOOL = 'make';
				break;

			case 'win32':

				MAKE_TOOL = 'nmake';
				break;

			default:
			}

			break;
		}

		default:
		}



		let MAKE_TOOL_MAKEFILE_ARG = null;

		switch (this.env) {

		case GCC_X64:

			MAKE_TOOL_MAKEFILE_ARG = '-f';
			break;

		case MSVS_X64:

			MAKE_TOOL_MAKEFILE_ARG = '/F';
			break;

		case EMCC_X64: {

			switch (process.platform) {

			case 'linux':

				MAKE_TOOL_MAKEFILE_ARG = '-f';
				break;

			case 'win32':

				MAKE_TOOL_MAKEFILE_ARG = '/F';
				break;

			default:
			}

			break;
		}

		default:
		}



		let MAKE_TOOL_ARG = null;

		switch (this.env) {

		case GCC_X64:

			MAKE_TOOL_ARG = '';
			break;

		case MSVS_X64:

			MAKE_TOOL_ARG = '';
			break;

		case EMCC_X64:

			MAKE_TOOL_ARG = '';
			break;

		default:
		}



		// functions

		// mkdir is related to OS

		let mkdir = null;

		switch (process.platform) {

		case 'linux':

			mkdir = (dir) => `mkdir -p ${ dir }`;
			break;

		case 'win32':

			mkdir = (dir) => `(IF NOT EXIST ${ dir } mkdir ${ dir })`;
			break;

			// const folders = dir.split('/');

			// return folders.map((_, index) => {

			// 	const _dir = folders.slice(0, index + 1).join('/');

			// 	return `(IF NOT EXIST ${ _dir } mkdir ${ _dir })`;
			// }).join(' && ');

		default:
		}



		switch (this.env) {

		case GCC_X64:

			// make includes overriding possibility
			// make specific compiler arguments and arguments overriding possibility
			this.cpp = (file, headers, includes_global, includes_local, location) => {

				const { dir, base, ext, name } = path.parse(file);

				let out = '';

				console.log(`\t${ mkdir(`$(BUILD)/${ location }/${ o }/${ dir }`) } && ${ mkdir(`$(BUILD)/${ location }/${ s }/${ dir }`) } && `);

				out += `$(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o } : ${ dir }/${ base } ${ headers.join(' ') }\n`;

				out += `\t${ mkdir(`$(BUILD)/${ location }/${ o }/${ dir }`) } && ${ mkdir(`$(BUILD)/${ location }/${ s }/${ dir }`) } && `;

				out += `${ C_EXT.includes(ext) ? C_COMPILER : CPP_COMPILER } ${ dir }/${ base } ${ C_EXT.includes(ext) ? C_COMPILER_ARG : CPP_COMPILER_ARG } ${ includes_global.map((include) => `-I ${ include }`).join(' ') } ${ includes_local.map((include) => `-I ${ include }`).join(' ') } -o $(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o }`;

				out += ` && objdump -d -M intel -S $(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o } > $(BUILD)/${ location }/${ s }/${ dir }/${ name }.${ s }`;

				this.str += `${ out }\n\n`;
			};

			break;

		case MSVS_X64:

			this.cpp = (file, headers, includes_global, includes_local, location) => {

				const { dir, base, ext, name } = path.parse(file);

				let out = '';

				out += `$(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o } : ${ dir }/${ base } ${ headers.join(' ') }\n`;

				out += `\t${ mkdir(`$(BUILD)/${ location }/${ o }/${ dir }`) } && ${ mkdir(`$(BUILD)/${ location }/${ s }/${ dir }`) } && `;

				out += `${ C_EXT.includes(ext) ? C_COMPILER : CPP_COMPILER } ${ dir }/${ base } ${ C_EXT.includes(ext) ? C_COMPILER_ARG : CPP_COMPILER_ARG } ${ includes_global.map((include) => `/I${ include }`).join(' ') } ${ includes_local.map((include) => `/I${ include }`).join(' ') } /Fo$(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o }`;

				out += ` /FA /Fa$(BUILD)/${ location }/${ s }/${ dir }/${ name }.${ s }`;

				this.str += `${ out }\n\n`;
			};

			break;

		case EMCC_X64:

			this.cpp = (file, headers, includes_global, includes_local, location) => {

				const { dir, base, ext, name } = path.parse(file);

				let out = '';

				console.log(`\t${ mkdir(`$(BUILD)/${ location }/${ o }/${ dir }`) } && ${ mkdir(`$(BUILD)/${ location }/${ s }/${ dir }`) } && `);

				out += `$(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o } : ${ dir }/${ base } ${ headers.join(' ') }\n`;

				out += `\t${ mkdir(`$(BUILD)/${ location }/${ o }/${ dir }`) } && ${ mkdir(`$(BUILD)/${ location }/${ s }/${ dir }`) } && `;

				out += `${ C_EXT.includes(ext) ? C_COMPILER : CPP_COMPILER } ${ dir }/${ base } ${ C_EXT.includes(ext) ? C_COMPILER_ARG : CPP_COMPILER_ARG } ${ includes_global.map((include) => `-I ${ include }`).join(' ') } ${ includes_local.map((include) => `-I ${ include }`).join(' ') } -o $(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o }`;

				// out += ` && objdump -d -M intel -S $(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o } > $(BUILD)/${ location }/${ s }/${ dir }/${ name }.${ s }`;

				this.str += `${ out }\n\n`;
			};

			break;

		default:
		}



		switch (this.env) {

		case GCC_X64:

			this.asm = (file, location = 'internal') => {

				const { dir, name } = path.parse(file);

				let out = '';

				out += `$(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o } : ${ dir }/${ name }.${ s }\n`;

				out += `\t${ mkdir(`$(BUILD)/${ location }/${ o }/${ dir }`) } && `;

				out += `${ ASSEMBLER } ${ dir }/${ name }.${ s } ${ ASSEMBLER_ARG } -o $(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o }`;

				this.str += `${ out }\n\n`;
			};

			break;

		case MSVS_X64:

			this.asm = (file, location = 'internal') => {

				const { dir, name } = path.parse(file);

				let out = '';

				out += `$(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o } : $(SRC)/${ dir }/${ name }.${ s }\n`;

				out += `\t${ mkdir(`$(BUILD)/${ location }/${ o }/${ dir }`) } && `;

				out += `${ ASSEMBLER } /Fo$(BUILD)/${ location }/${ o }/${ dir }/${ name }.${ o } ${ ASSEMBLER_ARG } $(SRC)/${ dir }/${ name }.${ s }`;

				this.str += `${ out }\n\n`;
			};

			break;

		default:
		}



		switch (this.env) {

		case GCC_X64:
		case EMCC_X64:
		case MSVS_X64:

			this.static = (name, files = [], makefile) => {

				let out = '';

				out += `${ name }.${ a } : ${ files.join(' ') }\n`;

				out += `\t${ MAKE_TOOL } ${ MAKE_TOOL_ARG } ${ MAKE_TOOL_MAKEFILE_ARG } ${ makefile }`;

				this.str += `${ out }\n\n`;
			};

			break;

		default:
		}



		switch (this.env) {

		case GCC_X64:

			this.linkStatic = (name, _options) => {

				const statics = makeArray(_options?.statics);
				const objects_internal = makeArray(_options?.objects?.internal);
				const objects_external = makeArray(_options?.objects?.external);

				const linked_units = [

					`${ objects_internal.map((file) => `$(BUILD)/internal/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ objects_external.map((file) => `$(BUILD)/external/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ statics.map((file) => `${ file }.${ a }`).join(' ') }`,
				].join(' ');

				let out = '';

				out += `$(BUILD)/output/${ a }/${ name }.${ a } : ${ linked_units }\n`;

				out += `\t${ mkdir(`$(BUILD)/output/${ a }`) } && ${ mkdir(`$(BUILD)/output/${ s }`) } && `;

				out += `${ BUILDER } ${ linked_units } ${ BUILDER_ARG } -o $(BUILD)/output/${ a }/${ name }.${ a }`;

				out += ` && objdump -d -M intel -S $(BUILD)/output/${ a }/${ name }.${ a } > $(BUILD)/output/${ s }/${ name }.${ s }`;

				this.str += `${ out }\n\n`;
			};

			break;

		case MSVS_X64:

			this.linkStatic = (target, _options) => {

				const statics = makeArray(_options?.statics);
				const objects_internal = makeArray(_options?.objects?.internal);
				const objects_external = makeArray(_options?.objects?.external);

				const linked_units = [

					`${ objects_internal.map((file) => `$(BUILD)/internal/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ objects_external.map((file) => `$(BUILD)/external/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ statics.map((file) => `${ file }.${ a }`).join(' ') }`,
				].join(' ');

				let out = '';

				out += `$(BUILD)/output/${ a }/${ target }.${ a } : ${ linked_units }\n`;

				out += `\t${ mkdir(`$(BUILD)/output/${ a }`) } && && ${ mkdir(`$(BUILD)/output/${ s }`) } && `;

				out += `${ BUILDER } ${ linked_units } ${ BUILDER_ARG } /OUT:$(BUILD)/output/${ a }/${ target }.${ a }`;

				out += ` && dumpbin /disasm $(BUILD)/output/${ a }/${ target }.${ a } /out:$(BUILD)/output/${ s }/${ target }.${ s }`;

				this.str += `${ out }\n\n`;
			};

			break;

		default:
		}



		switch (this.env) {

		case GCC_X64:

			this.linkBin = (target, _options) => {

				const syslibs = makeArray(_options?.syslibs);
				const statics = makeArray(_options?.statics);
				const objects_internal = makeArray(_options?.objects?.internal);
				const objects_external = makeArray(_options?.objects?.external);

				const linked_units = [

					`${ objects_internal.map((file) => `$(BUILD)/internal/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ objects_external.map((file) => `$(BUILD)/external/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ statics.map((file) => `${ file }.${ a }`).join(' ') }`,
				].join(' ');

				let out = '';

				out += `$(BUILD)/output/${ bin }/${ target }.${ bin } : ${ linked_units }\n`;

				out += `\t${ mkdir(`$(BUILD)/output/${ bin }`) } && `;

				out += `${ LINKER } ${ linked_units } ${ syslibs.map((lib) => `-l ${ lib }`).join(' ') } ${ LINKER_ARG } -o $(BUILD)/output/${ bin }/${ target }.${ bin }`;

				out += ` && objdump -d -M intel -S $(BUILD)/output/${ bin }/${ target }.${ bin } > $(BUILD)/output/${ s }/${ target }.${ s }`;

				this.str = `${ out }\n\n${ this.str }`;
			};

			break;

		case MSVS_X64:

			this.linkBin = (target, _options) => {

				const syslibs = makeArray(_options?.syslibs);
				const statics = makeArray(_options?.statics);
				const objects_internal = makeArray(_options?.objects?.internal);
				const objects_external = makeArray(_options?.objects?.external);

				const linked_units = [

					`${ objects_internal.map((file) => `$(BUILD)/internal/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ objects_external.map((file) => `$(BUILD)/external/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ statics.map((file) => `${ file }.${ a }`).join(' ') }`,
				].join(' ');

				let out = '';

				out += `$(BUILD)/output/${ bin }/${ target }.${ bin } : ${ linked_units }\n`;

				out += `\t${ mkdir(`$(BUILD)/output/${ bin }`) } && `;

				out += `${ LINKER } ${ linked_units } ${ syslibs.join(' ') } ${ LINKER_ARG } /OUT:$(BUILD)/output/${ bin }/${ target }.${ bin }`;

				out += ` && dumpbin /disasm $(BUILD)/output/${ bin }/${ target }.${ bin } /out:$(BUILD)/output/${ s }/${ target }.${ s }`;

				this.str = `${ out }\n\n${ this.str }`;
			};

			break;

		case EMCC_X64:

			this.linkBin = (target, _options) => {

				const statics = makeArray(_options?.statics);
				const objects_internal = makeArray(_options?.objects?.internal);
				const objects_external = makeArray(_options?.objects?.external);

				const linked_units = [

					`${ objects_internal.map((file) => `$(BUILD)/internal/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ objects_external.map((file) => `$(BUILD)/external/${ o }/${ file }.${ o }`).join(' ') }`,
					`${ statics.map((file) => `${ file }.${ a }`).join(' ') }`,
				].join(' ');

				let out = '';

				out += `$(BUILD)/output/${ bin }/${ target }.${ bin } : ${ linked_units }\n`;

				out += `\t${ mkdir(`$(BUILD)/output/${ bin }`) } && `;

				out += `${ LINKER } ${ linked_units } ${ LINKER_ARG } -o $(BUILD)/output/${ bin }/${ target }.${ bin }`;

				// out += ` && objdump -d -M intel -S $(BUILD)/output/${ bin }/${ target }.${ bin } > $(BUILD)/output/${ s }/${ target }.${ s }`;

				this.str = `${ out }\n\n${ this.str }`;
			};

			break;

		default:
		}
	}

	create (options) {

		const type = options?.type || 'bin';
		const target = options?.target || 'build';

		const objects = { internal: [], external: [] };
		const statics = [];
		const includes = makeArray(options?.includes);
		const syslibs = makeArray(options?.syslibs);

		// const vars = options?.vars?.[this.env] ? Object.keys(options.vars[this.env]).map((elm) => `${ elm }=${ options.vars[this.env][elm] }`) : [];
		// console.log(vars);

		[ 'internal', 'external' ].forEach((location) => {

			if (options?.objects?.[location]?.cpp) {

				const files = makeArray(options.objects[location].cpp);

				files.forEach((file) => {

					if (typeof file === 'string') {

						const { dir, name } = path.parse(file);

						objects[location].push(`${ dir }/${ name }`);

						this.cpp(file, [], includes, [], location);
					}
					else if (typeof file === 'object') {

						const { dir, name } = path.parse(file.source);

						console.log(file.source);

						objects[location].push(`${ dir }/${ name }`);

						this.cpp(file.source, makeArray(file.options?.headers), includes, makeArray(file.options?.includes), location);

						if (file.options?.custom_dependencies) {

							const custom = makeArray(file.options.custom_dependencies);

							custom.forEach((elm) => {

								this.str += `${ elm.join('') }\n\n`;
							});
						}
					}
				});
			}

			if (options?.objects?.[location]?.asm) {

				const files = makeArray(options.objects[location].asm);

				files.forEach((file) => {

					if (typeof file === 'string') {

						const { dir, name } = path.parse(file);

						objects[location].push(`${ dir }/${ name }`);

						this.asm(file, 'location');
					}
					else if (typeof file === 'object') {

						const { dir, name } = path.parse(file.source);

						objects[location].push(`${ dir }/${ name }`);

						this.asm(file.source, 'location');

						if (file.options?.custom_dependencies) {

							const custom = makeArray(file.options.custom_dependencies);

							custom.forEach((elm) => {

								this.str += `${ elm.join('') }\n\n`;
							});
						}
					}
				});
			}
		});

		if (options?.statics) {

			statics.push(...makeArray(options.statics));
		}

		if (options?.statics2) {

			let asd = makeArray(options.statics2);

			if (options.vars?.[this.env]) {

				Object.keys(options.vars[this.env]).forEach((_var) => {

					// console.log(_var, `$(${ _var })`, options.vars[this.env][_var]);

					asd = asd.map((elm) => elm.replace(`$(${ _var })`, options.vars[this.env][_var]));
				});
			}

			// const asd = makeArray(options.statics2).map((elm) => elm.replace('$(SRC)', options?.vars?.[this.env].SRC));
			// console.log(asd);

			asd.forEach((file) => {

				const json = JSON.parse(fs.readFileSync(path.join(file, 'make.json'), 'utf8'));

				const ff = [];

				if (json?.objects?.internal?.cpp) {

					const files = json.objects.internal.cpp;

					files.forEach((_file) => {

						if (typeof _file === 'string') {

							// console.log(_file);

							if (!ff.includes(_file)) {

								// ff.push(_file.replace('$(SRC)', path.join(file, 'src')));

								let qwe = _file.replace('$(SRC)', path.join(file, 'src'));

								if (options.vars?.[this.env]) {

									Object.keys(options.vars[this.env]).forEach((_var) => {

										// console.log(_var, `$(${ _var })`, options.vars[this.env][_var]);

										qwe = qwe.replace(options.vars[this.env][_var], `$(${ _var })`);
									});
								}

								ff.push(qwe);
							}

							// this.static = ('NAME', files = [], makefile);
						}
						else if (typeof _file === 'object') {

							// console.log(_file);

							if (!ff.includes(_file.source)) {

								// ff.push();

								let qwe = _file.source.replace('$(SRC)', path.join(file, 'src'));

								if (options.vars?.[this.env]) {

									Object.keys(options.vars[this.env]).forEach((_var) => {

										// console.log(_var, `$(${ _var })`, options.vars[this.env][_var]);

										qwe = qwe.replace(options.vars[this.env][_var], `$(${ _var })`);
									});
								}

								ff.push(qwe);
							}

							if (_file.options?.headers) {

								const headers = makeArray(_file.options?.headers);

								headers.forEach((header) => {

									if (!ff.includes(header)) {

										let qwe = header.replace('$(SRC)', path.join(file, 'src'));

										if (options.vars?.[this.env]) {

											Object.keys(options.vars[this.env]).forEach((_var) => {

												// console.log(_var, `$(${ _var })`, options.vars[this.env][_var]);

												qwe = qwe.replace(options.vars[this.env][_var], `$(${ _var })`);
											});
										}

										ff.push(qwe);
									}
								});
							}
						}
					});
				}
				// console.log(ff);

				let yyy = path.join(file, `build/${ this.env }/output/${ this.a }/${ file.split('/').pop() }`);

				Object.keys(options.vars[this.env]).forEach((_var) => {

					// console.log(_var, `$(${ _var })`, options.vars[this.env][_var]);

					yyy = yyy.replace(options.vars[this.env][_var], `$(${ _var })`);
				});

				this.static(yyy, ff, path.join(file, `makefiles/${ this.env }/makefile`));
			});
		}

		if (type === 'static') {

			this.linkStatic(

				target,

				{
					objects,
					statics,
					syslibs,
				},
			);
		}
		else if (type === 'bin') {

			this.linkBin(

				target,

				{
					objects,
					statics,
					syslibs,
				},
			);
		}

		// makefile variables
		this.str =
			`${

				[
					`SRC=${ this.dirname }/src`,
					`BUILD=${ this.dirname }/build/${ this.env }`,
					...(options?.vars?.[this.env] ? Object.keys(options.vars[this.env]).map((elm) => `${ elm }=${ options.vars[this.env][elm] }`) : []),
				].join('\n')
			}\n\n${ this.str }`;



		const makefiles = `${ this.dirname }/makefiles`;

		const env = `${ makefiles }/${ this.env }`;

		const makefile = `${ env }/makefile`;

		this.str = `${ this.str.trim().replace(/( )+/g, ' ').replace(/(\/)+/g, '/').replace(/\/\$\(SRC\)\//g, '/').replace(/\/\$\(SRC\) /g, ' ') }\n`;

		// remove build folder
		if (fs.existsSync(`${ this.dirname }/build/${ this.env }`)) {

			fs.rmdirSync(`${ this.dirname }/build/${ this.env }`, { recursive: true });
		}

		if (fs.existsSync(makefiles)) {

			if (fs.existsSync(env)) {

				fs.rmdirSync(env, { recursive: true });
			}

			fs.mkdirSync(env);
			fs.appendFileSync(makefile, this.str);
		}
		else {

			fs.mkdirSync(makefiles);
			fs.mkdirSync(env);
			fs.appendFileSync(makefile, this.str);
		}
	}
}

const [ env, file ] = process.argv.slice(2);

const make = new Make({ env, dirname: path.parse(file).dir });

make.create(JSON.parse(fs.readFileSync(file, 'utf8')));
