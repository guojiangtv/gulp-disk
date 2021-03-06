/**
 *
 *
 * @author smy
 * @date 2019-04-25
 * @param {*} file
 * @github git@github.com:saysmy/gulp-remove-babel-use-strict.git
 * @returns
 */
var through = require("through2"),
	gutil = require("gulp-util");

module.exports = function (options) {
	"use strict";
	function removeUseStrict(file, enc, callback) {
		/*jshint validthis:true*/

		// Do nothing if no contents
		if (file.isNull()) {
			this.push(file);
			return callback();
		}

		if (file.isStream()) {

			// http://nodejs.org/api/stream.html
			// http://nodejs.org/api/child_process.html
			// https://github.com/dominictarr/event-stream

			// accepting streams is optional
			this.emit("error",
				new gutil.PluginError("gulp-remove-use-strict", "Stream content is not supported"));
			return callback();
		}

		// check if file.contents is a `Buffer`
		if (file.isBuffer()) {

			file.contents = new Buffer(String(file.contents).replace(/^('|")use strict('|");/, ''), options);
			this.push(file);

		}
		return callback();
	}

	return through.obj(removeUseStrict);
};
