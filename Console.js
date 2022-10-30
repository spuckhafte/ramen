import moment from 'moment';

export default class Logger {

	constructor() {

		const dark_colours = [
			"Black",
			"Red",
			"Green",
			"Yellow",
			"Blue",
			"Magenta",
			"Cyan",
			"White",
		];

		const light_colours = [
			"Grey",
			"LightRed",
			"LightGreen",
			"LightYellow",
			"LightBlue",
			"LightMagenta",
			"LightCyan",
			"LightWhite"
		]

		this.format = this.createEnum([
			"Reset",
			"Bold",
			null,
			null,
			"Underscore",
			null,
			null,
			null,
			null,
			"Strikethrough"
		])

		this.foreground = this.createEnum([
			...new Array(30).fill(null),
			...dark_colours,
			...new Array(52).fill(null),
			...light_colours
		]);

		this.background = this.createEnum([
			...new Array(40).fill(null),
			...dark_colours,
			...new Array(53).fill(null),
			...light_colours
		]);

		console.inline = (...args) => {
			process.stdout.write(this.prefix + " " + this.custom(...args));
		}

		console.input = (...args) => {
			return new Promise((resolve) => {
				console.inline([this.custom(this.unicode(this.background.Cyan), this.unicode(this.format.Bold), "INPUT"), ...args].join(' '))
				process.stdin.once('data', (data) => {
					resolve(data.toString().trim());
				});
			})
		}

		const log = console.log.bind(console);
		console.log = (...args) => {
			log(this.prefix, ...args);
		};

		const warn = console.warn.bind(console);
		console.warn = (...args) => {
			warn(this.prefix, this.custom(this.unicode(this.background.Yellow), this.unicode(this.format.Bold), "WARN"), ...args);
		};

		const error = console.error.bind(console);
		console.error = (...args) => {
			error(this.prefix, this.custom(this.unicode(this.background.Red), this.unicode(this.format.Bold), "ERROR"), ...args);
		};

		const debug = console.debug.bind(console);
		console.debug = (...args) => {
			debug(this.prefix, this.custom(this.unicode(this.background.Blue), this.unicode(this.format.Bold), "DEBUG"), ...args);
		};

		const success = console.info.bind(console);
		console.success = (...args) => {
			success(this.prefix, this.custom(this.unicode(this.background.Green), this.unicode(this.format.Bold), "SUCCESS"), ...args);
		};

	}

	get prefix() {
		return moment().format('(kk:mm:ss.SSS)');
	}

	custom(...content) {
		return content.join("") + this.unicode(this.format.Reset);
	}

	unicode(id) {
		return `\x1b[${id}m`
	}

	createEnum(keys) {
		const obj = {};
		for (const [index, key] of keys.entries()) {
			if (key === null) continue;
			obj[key] = index;
			obj[index] = key;
		}
		return Object.freeze(obj);
	}

};
