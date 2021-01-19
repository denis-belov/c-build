const path = require('path');

const C_EXT = [ '.c' ];
const CPP_EXT = [ '.cpp' ];

module.exports = class Make {

	// compile constants

	static GCC_X64 = 'gcc-x64';
	static MSVS_X64 = 'msvs-x64';



	constructor (ENV, dirname, options = {}) {

		const {

			GCC_X64,
			MSVS_X64,
		} = Make;

		this.ENV = ENV;
		this.dirname = dirname;

		this.str =
			[
				`SRC=${ dirname }/src`,
				`BUILD=${ dirname }/build`,
			].join('\n')
			+
			'\n\n';



		const includes = options.includes || [];

		// file extensions. RENAME!

		let a;

		switch (ENV) {

			case GCC_X64:  a = 'a';   break;

			case MSVS_X64: a = 'lib'; break;
		}



		let o;

		switch (ENV) {

			case GCC_X64:  o = 'o';   break;

			case MSVS_X64: o = 'obj'; break;
		}



		let s;

		switch (ENV) {

			case GCC_X64:  s = 's';   break;

			case MSVS_X64: s = 'asm'; break;
		}



		let bin;

		switch (ENV) {

			case GCC_X64:  bin = 'bin'; break;

			case MSVS_X64: bin = 'exe'; break;
		}



		// tools

		let ASSEMBLER;

		switch (ENV) {

			case GCC_X64:  ASSEMBLER = 'gcc';  break;

			case MSVS_X64: ASSEMBLER = 'ml64'; break;
		}

		let ASSEMBLER_ARG;

		switch (ENV) {

			case GCC_X64:  ASSEMBLER_ARG = '-c'; break;

			case MSVS_X64: ASSEMBLER_ARG = '/c';   break;
		}



		let C_COMPILER;

		switch (ENV) {

			case GCC_X64:  C_COMPILER = 'gcc'; break;

			case MSVS_X64: C_COMPILER = 'cl';  break;
		}

		let C_COMPILER_ARG;

		switch (ENV) {

			case GCC_X64:  C_COMPILER_ARG = `-c -m64 -msse3 -Ofast -funroll-loops -Wall -Wextra -Wpedantic -I $(SRC) ${ includes.map((dir) => `-I ${ dir }`).join(' ') }`; break;

			case MSVS_X64: C_COMPILER_ARG = `/c /EHsc /MP999 /O2 /I$(SRC) ${ includes.map((dir) => `/I${ dir }`).join(' ') }`;                                             break;
		}



		let CPP_COMPILER;

		switch (ENV) {

			case GCC_X64:  CPP_COMPILER = 'g++'; break;

			case MSVS_X64: CPP_COMPILER = 'cl';  break;
		}

		let CPP_COMPILER_ARG;

		switch (ENV) {

			case GCC_X64:  CPP_COMPILER_ARG = `-c -std=c++20 -m64 -msse3 -Ofast -funroll-loops -Wall -Wextra -Wpedantic -I $(SRC) ${ includes.map((dir) => `-I ${ dir }`).join(' ') }`; break;

			case MSVS_X64: CPP_COMPILER_ARG = `/c /std:c++20 /EHsc /MP999 /O2 /I$(SRC) ${ includes.map((dir) => `/I${ dir }`).join(' ') }`;                                             break;
		}



		let BUILDER;

		switch (ENV) {

			case GCC_X64:  BUILDER = 'ld';  break;

			case MSVS_X64: BUILDER = 'lib'; break;
		}

		let BUILDER_ARG;

		switch (ENV) {

			case GCC_X64:  BUILDER_ARG = '-r -flto'; break;

			case MSVS_X64: BUILDER_ARG = '';         break;
		}



		let LINKER;

		switch (ENV) {

			case GCC_X64:  LINKER = 'gcc';  break;

			case MSVS_X64: LINKER = 'link'; break;
		}

		let LINKER_ARG;

		switch (ENV) {

			case GCC_X64:  LINKER_ARG = '-flto';                                                         break;

			case MSVS_X64: LINKER_ARG = '/SUBSYSTEM:CONSOLE /NODEFAULTLIB:LIBUCRT /NODEFAULTLIB:MSVCRT'; break;
		}

		let LINKER_DEFAULT_LIBS;

		switch (ENV) {

			case GCC_X64:  LINKER_DEFAULT_LIBS = '-l dl -l pthread -l Xrandr -l Xxf86vm -l Xi -l Xinerama -l X11 -l Xcursor'; break;

			case MSVS_X64: LINKER_DEFAULT_LIBS = 'ucrt.lib gdi32.lib user32.lib shell32.lib glfw3.lib';                       break;
		}



		// functions

		let mkdir;

		switch (ENV) {

			case GCC_X64:

				mkdir = (dir) => `mkdir -p ${ dir }`;

				break;

			case MSVS_X64:

				mkdir = (dir) => {

					return `(IF NOT EXIST ${ dir } mkdir ${ dir })`;

					// const folders = dir.split('/');

					// return folders.map((_, index) => {

					// 	const _dir = folders.slice(0, index + 1).join('/');

					// 	return `(IF NOT EXIST ${ _dir } mkdir ${ _dir })`;
					// }).join(' && ');
				};

				break;
		}



		switch (ENV) {

			case GCC_X64:

				this.cpp = (file, headers = [], location = 'internal') => {

					const { dir, base, ext, name } = path.parse(file);

					let out = '';

					out += `$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }/${ name }.${ o } : $(SRC)/${ dir }/${ base } ${ headers.map((file) => file.replace(`${ dirname }/src`, '$(SRC)').replace(`${ dirname }/build`, '$(BUILD)')).join(' ') }\n`;

					out += `\t${ mkdir(`$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }`) } && ${ mkdir(`$(BUILD)/${ ENV }/${ location }/${ s }/${ dir }`) } && `;

					out += `${ C_EXT.includes(ext) ? C_COMPILER : CPP_COMPILER } $(SRC)/${ dir }/${ base } ${ C_EXT.includes(ext) ? C_COMPILER_ARG : CPP_COMPILER_ARG } -o $(BUILD)/${ ENV }/${ location }/${ o }/${ dir }/${ name }.${ o }`;

					out += ` && objdump -d -M intel -S $(BUILD)/${ ENV }/${ location }/${ o }/${ dir }/${ name }.${ o } > $(BUILD)/${ ENV }/${ location }/${ s }/${ dir }/${ name }.${ s }`;

					this.str += `${ out }\n\n`;
				};

				break;

			case MSVS_X64:

				this.cpp = (file, headers = [], location = 'internal') => {

					const { dir, base, ext, name } = path.parse(file);

					let out = '';

					out += `$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }/${ name }.${ o } : $(SRC)/${ dir }/${ base } ${ headers.map((file) => file.replace(`${ dirname }/src`, '$(SRC)').replace(`${ dirname }/build`, '$(BUILD)')).join(' ') }\n`;

					out += `\t${ mkdir(`$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }`) } && ${ mkdir(`$(BUILD)/${ ENV }/${ location }/${ s }/${ dir }`) } && `;

					out += `${ C_EXT.includes(ext) ? C_COMPILER : CPP_COMPILER } $(SRC)/${ dir }/${ base } ${ C_EXT.includes(ext) ? C_COMPILER_ARG : CPP_COMPILER_ARG } /Fo$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }/${ name }.${ o }`;

					out += ` /FA /Fa$(BUILD)/${ ENV }/${ location }/${ s }/${ dir }/${ name }.${ s }`;

					this.str += `${ out }\n\n`;
				};

				break;
		}



		switch (ENV) {

			case GCC_X64:

				this.asm = (file, location = 'internal') => {

					const { dir, name } = path.parse(file);

					let out = '';

					out += `$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }/${ name }.${ o } : $(SRC)/${ dir }/${ name }.${ s }\n`;

					out += `\t${ mkdir(`$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }`) } && `;

					out += `${ ASSEMBLER } $(SRC)/${ dir }/${ name }.${ s } ${ ASSEMBLER_ARG } -o $(BUILD)/${ ENV }/${ location }/${ o }/${ dir }/${ name }.${ o }`;

					this.str += `${ out }\n\n`;
				};

				break;

			case MSVS_X64:

				this.asm = (file, location = 'internal') => {

					const { dir, name } = path.parse(file);

					let out = '';

					out += `$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }/${ name }.${ o } : $(SRC)/${ dir }/${ name }.${ s }\n`;

					out += `\t${ mkdir(`$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }`) } && `;

					out += `${ ASSEMBLER } /Fo$(BUILD)/${ ENV }/${ location }/${ o }/${ dir }/${ name }.${ o } ${ ASSEMBLER_ARG } $(SRC)/${ dir }/${ name }.${ s }`;

					this.str += `${ out }\n\n`;
				};

				break;
		}



		switch (ENV) {

			case GCC_X64:

				this.linkStatic = (name, options = {}) => {

					const objects = options.objects || {};
					const statics = options.statics || [];
					const internal = objects.internal || [];
					const external = objects.external || [];

					const linked_units = [

						`${ internal.map((file) => `$(BUILD)/${ ENV }/internal/${ o }/${ file }.${ o }`).join(' ') }`,
						`${ external.map((file) => `$(BUILD)/${ ENV }/external/${ o }/${ file }.${ o }`).join(' ') }`,
						`${ statics.map((file) => `${ file }.${ a }`).join(' ') }`,
					].join(' ');

					let out = '';

					out += `$(BUILD)/${ ENV }/output/${ a }/${ name }.${ a } : ${ linked_units }\n`;

					out += `\t${ mkdir(`$(BUILD)/${ ENV }/output/${ a }`) } && ${ mkdir(`$(BUILD)/${ ENV }/output/${ s }`) } && `;

					out += `${ BUILDER } ${ linked_units } ${ BUILDER_ARG } -o $(BUILD)/${ ENV }/output/${ a }/${ name }.${ a }`;

					out += ` && objdump -d -M intel -S $(BUILD)/${ ENV }/output/${ a }/${ name }.${ a } > $(BUILD)/${ ENV }/output/${ s }/${ name }.${ s }`;

					this.str += `${ out }\n\n`;
				};

				break;

			case MSVS_X64:

				this.linkStatic = (name, options = {}) => {

					const objects = options.objects || {};
					const statics = options.statics || [];
					const internal = objects.internal || [];
					const external = objects.external || [];

					const linked_units = [

						`${ internal.map((file) => `$(BUILD)/${ ENV }/internal/${ o }/${ file }.${ o }`).join(' ') }`,
						`${ external.map((file) => `$(BUILD)/${ ENV }/external/${ o }/${ file }.${ o }`).join(' ') }`,
						`${ statics.map((file) => `${ file }.${ a }`).join(' ') }`,
					].join(' ');

					let out = '';

					out += `$(BUILD)/${ ENV }/output/${ a }/${ name }.${ a } : ${ linked_units }\n`;

					out += `\t${ mkdir(`$(BUILD)/${ ENV }/output/${ a }`) } && && ${ mkdir(`$(BUILD)/${ ENV }/output/${ s }`) } && `;

					out += `${ BUILDER } ${ linked_units } ${ BUILDER_ARG } /OUT:$(BUILD)/${ ENV }/output/${ a }/${ name }.${ a }`;

					out += ` && dumpbin /disasm $(BUILD)/${ ENV }/output/${ a }/${ name }.${ a } /out:$(BUILD)/${ ENV }/output/${ s }/${ name }.${ s }`;

					this.str += `${ out }\n\n`;
				};

				break;
		}



		switch (ENV) {

			case GCC_X64:

				this.linkBin = (name, options = {}) => {

					const objects = options.objects || {};
					const statics = options.statics || [];
					const internal = objects.internal || [];
					const external = objects.external || [];

					const linked_units = [

						`${ internal.map((file) => `$(BUILD)/${ ENV }/internal/${ o }/${ file }.${ o }`).join(' ') }`,
						`${ external.map((file) => `$(BUILD)/${ ENV }/external/${ o }/${ file }.${ o }`).join(' ') }`,
						`${ statics.map((file) => `${ file }.${ a }`).join(' ') }`,
					].join(' ');

					let out = '';

					out += `$(BUILD)/${ ENV }/output/${ bin }/${ name }.${ bin } : ${ linked_units }\n`;

					out += `\t${ mkdir(`$(BUILD)/${ ENV }/output/${ bin }`) } && `;

					out += `${ LINKER } ${ linked_units } ${ LINKER_DEFAULT_LIBS } ${ LINKER_ARG } -o $(BUILD)/${ ENV }/output/${ bin }/${ name }.${ bin }`;

					out += ` && objdump -d -M intel -S $(BUILD)/${ ENV }/output/${ bin }/${ name }.${ bin } > $(BUILD)/${ ENV }/output/${ s }/${ name }.${ s }`;

					this.str += `${ out }\n\n`;
				};

				break;

			case MSVS_X64:

				this.linkBin = (name, options = {}) => {

					const objects = options.objects || {};
					const statics = options.statics || [];
					const internal = objects.internal || [];
					const external = objects.external || [];

					const linked_units = [

						`${ internal.map((file) => `$(BUILD)/${ ENV }/internal/${ o }/${ file }.${ o }`).join(' ') }`,
						`${ external.map((file) => `$(BUILD)/${ ENV }/external/${ o }/${ file }.${ o }`).join(' ') }`,
						`${ statics.map((file) => `${ file }.${ a }`).join(' ') }`,
					].join(' ');

					let out = '';

					out += `$(BUILD)/${ ENV }/output/${ bin }/${ name }.${ bin } : ${ linked_units }\n`;

					out += `\t${ mkdir(`$(BUILD)/${ ENV }/output/${ bin }`) } && `;

					out += `${ LINKER } ${ linked_units } ${ LINKER_DEFAULT_LIBS } ${ LINKER_ARG } /OUT:$(BUILD)/${ ENV }/output/${ bin }/${ name }.${ bin }`;

					out += ` && dumpbin /disasm $(BUILD)/${ ENV }/output/${ bin }/${ name }.${ bin } /out:$(BUILD)/${ ENV }/output/${ s }/${ name }.${ s }`;

					this.str += `${ out }\n\n`;
				};

				break;
		}
	}

	cpp_ext (file, headers = []) {

		return this.cpp(file, headers, 'external')
	}

	asm_ext (file) {

		return this.asm(file, 'external');
	}

	create () {

		const fs = require('fs');

		const makefiles = `${ this.dirname }/makefiles`;

		const env = `${ makefiles }/${ this.ENV }`;

		const makefile = `${ env }/makefile`;

		this.str = `${ this.str.trim() }\n`;

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
