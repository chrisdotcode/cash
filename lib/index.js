#!/usr/bin/env node
'use strict';

var fs = require('fs');

var argv  = require('telltale')(process.argv);

// Special character used for escaping '{' and '}' literals.
const REPLACEMENT_STRING_LEFT     = '\u001e';
const REPLACEMENT_REGEX_LEFT      = /\u001e/g;
const ESCAPED_BRACKET_REGEX_LEFT  = /\\\{/g;
const REPLACEMENT_STRING_RIGHT    = '\u001f';
const REPLACEMENT_REGEX_RIGHT     = /\u001f/g;
const ESCAPED_BRACKET_REGEX_RIGHT = /\\\}/g;
const TAG_REGEX                   = /\{(.*)\}/g;
const ARRAY_REGEX                 = /\{\[\]([^]*?)\}([^]*)\{\/\1\}/g;
const ARRAY_LIST_REGEX            = /^\[(.+(?: ,.)*)\]$/;

var context = argv.long;

function objectMap(object, fn) {
	return Object.keys(object).map(function(key) {
		return fn(key, object[key], object);
	});
}

objectMap(argv.short, function(key, value) {
	let test = ARRAY_LIST_REGEX.exec(value);

	if (test) {
		context[key] = test[1].split(',');
	} else {
		if (value.includes(',')) {
			context[key] = [];

			value.split(',').forEach(function(file, index) {
				let arg = fs.readFileSync(file, {encoding: 'utf8'});

				if (arg.endsWith('\n')) {
					arg = arg.substring(0, arg.length - 1);
				}

				context[key][index] = arg;
			});
		} else {
			let arg = fs.readFileSync(value, {encoding: 'utf8'});

			if (arg.endsWith('\n')) {
				arg = arg.substring(0, arg.length - 1);
			}

			context[key] = arg;
		}
	}
});

var file = '';

if (argv.args.length === 0) {
	process.stdin.setEncoding('utf8');

	process.stdin.on('readable', function() {
		let chunk = process.stdin.read();

		if (chunk !== null) {
			file += chunk;
		}
	});

	process.stdin.on('end', function() {
		console.log(parse(file));
	});
} else {
	file = argv.args
		.map((x) => fs.readFileSync(x, {encoding: 'utf8'}))
		.map((x) => parse(x))
		.join('');

	if (file.endsWith('\n')) {
		file = file.substring(0, file.length - 1);
	}
	console.log(file);
}

function replace(content, match, index) {
	return content.replace(TAG_REGEX, function(_, tag) {
		if (tag.startsWith('/') && !match) {
			return '{' + tag + '}';
		} else if (tag.startsWith('[]') && !match) {
			return '{' + tag + '}';
		} else if (tag === '' && match) {
			return context[match][index] || '';
		} else if (tag === '') {
			return '{}';
		} else {
			return context[tag] || '';
		}
	});
}

function parse(file, userContext) {
	context = userContext || context;

	var pass1 = file.replace(ESCAPED_BRACKET_REGEX_LEFT, REPLACEMENT_STRING_LEFT);
	var pass2 = pass1.replace(ESCAPED_BRACKET_REGEX_RIGHT, REPLACEMENT_STRING_RIGHT);

	var pass3 = replace(pass2);

	var pass4 = pass3.replace(ARRAY_REGEX, function(_, match, innerContent) {
		return (context[match] || []).map(function(_, index) {
			return replace(innerContent, match, index);
		}).join('');
	});

	var pass5 = pass4.replace(REPLACEMENT_REGEX_LEFT, '{');
	var pass6 = pass5.replace(REPLACEMENT_REGEX_RIGHT, '}');

	return pass6;
}

exports = module.exports = {parse};
