(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _distIndexJs = require('./dist/index.js');

var _distIndexJs2 = _interopRequireDefault(_distIndexJs);

if (navigator.requestMIDIAccess) {
	navigator.requestMIDIAccess().then(onMIDIInit, onMIDIReject);
} else {
	console.error("DOH! No MIDI support present in your browser.");
}

function onMIDIInit(midi) {
	// midi.inputs
	// midi.onstatechange
	// midi.outputs
	// midi.sysexEnabled
	console.log("Successfully Initialized MIDI");
	var foundString = "Found " + midi.inputs.size + " inputs and " + midi.outputs.size + " outputs.";
	console.log(foundString);
	console.log("Sysex is", midi.sysexEnabled ? "enabled" : "disabled");
	onMIDIConect(midi);

	midi.onstatechange = function (event) {
		console.log("MIDIConnectionEvent on port", event.port);
		if (event.port.type === "input" && event.port.connection === "open") {
			onMIDIConect(midi);
		}
	};
}

function onMIDIConect(midi) {
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {

		for (var _iterator = midi.inputs.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var input = _step.value;

			console.log("Input id:", input.id, input);
			input.onmidimessage = function (event) {
				var midiMessage = (0, _distIndexJs2["default"])(event);
				console.log("Parsed", midiMessage);
			};
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator["return"]) {
				_iterator["return"]();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		for (var _iterator2 = midi.outputs.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			var output = _step2.value;

			console.log("Output id:", output.id, output);
		}
	} catch (err) {
		_didIteratorError2 = true;
		_iteratorError2 = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
				_iterator2["return"]();
			}
		} finally {
			if (_didIteratorError2) {
				throw _iteratorError2;
			}
		}
	}
}

function onMIDIReject(error) {
	console.error(error);
	return;
}

},{"./dist/index.js":2}],2:[function(require,module,exports){
(function (global){
"use strict";

(function (f) {
	if (typeof exports === "object" && typeof module !== "undefined") {
		module.exports = f();
	} else if (typeof define === "function" && define.amd) {
		define([], f);
	} else {
		var g;if (typeof window !== "undefined") {
			g = window;
		} else if (typeof global !== "undefined") {
			g = global;
		} else if (typeof self !== "undefined") {
			g = self;
		} else {
			g = this;
		}g.midimessage = f();
	}
})(function () {
	var define, module, exports;return (function e(t, n, r) {
		function s(o, u) {
			if (!n[o]) {
				if (!t[o]) {
					var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw (f.code = "MODULE_NOT_FOUND", f);
				}var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
					var n = t[o][1][e];return s(n ? n : e);
				}, l, l.exports, e, t, n, r);
			}return n[o].exports;
		}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) s(r[o]);return s;
	})({ 1: [function (require, module, exports) {
			"use strict";

			Object.defineProperty(exports, "__esModule", {
				value: true
			});

			exports["default"] = function (event) {
				function MIDIMessage(event) {
					this._event = event;
					this._data = event.data;
					this.receivedTime = event.receivedTime;

					if (this._data && this._data.length < 2) {
						console.warn("Illegal MIDI message of length", this._data.length);
						return;
					}

					this._messageCode = event.data[0] & 0xf0;
					this.channel = (event.data[0] & 0x0f) + 1;

					switch (this._messageCode) {

						// Note Off
						case 0x80:
							this.messageType = "noteoff";
							this.key = event.data[1] & 0x7F;
							this.velocity = event.data[2] & 0x7F;
							break;

						// Note On
						case 0x90:
							this.messageType = "noteon";
							this.key = event.data[1] & 0x7F;
							this.velocity = event.data[2] & 0x7F;
							break;

						// Polyphonic Key Pressure
						case 0xA0:
							this.messageType = "keypressure";
							this.key = event.data[1] & 0x7F;
							this.pressure = event.data[2] & 0x7F;
							break;

						// Control Change
						case 0xB0:
							this.messageType = "controlchange";
							this.controllerNumber = event.data[1] & 0x7F;
							this.controllerValue = event.data[2] & 0x7F;

							if (this.controllerNumber === 120 && this.controllerValue === 0) {
								this.channelModeMessage = "allsoundoff";
							} else if (this.controllerNumber === 121) {
								this.channelModeMessage = "resetallcontrollers";
							} else if (this.controllerNumber === 122) {
								if (this.controllerValue === 0) {
									this.channelModeMessage = "localcontroloff";
								} else {
									this.channelModeMessage = "localcontrolon";
								}
							} else if (this.controllerNumber === 123 && this.controllerValue === 0) {
								this.channelModeMessage = "allnotesoff";
							} else if (this.controllerNumber === 124 && this.controllerValue === 0) {
								this.channelModeMessage = "omnimodeoff";
							} else if (this.controllerNumber === 125 && this.controllerValue === 0) {
								this.channelModeMessage = "omnimodeon";
							} else if (this.controllerNumber === 126) {
								this.channelModeMessage = "monomodeon";
							} else if (this.controllerNumber === 127) {
								this.channelModeMessage = "polymodeon";
							}
							break;

						// Program Change
						case 0xC0:
							this.messageType = "programchange";
							this.program = event.data[1];
							break;

						// Channel Pressure
						case 0xD0:
							this.messageType = "channelpressure";
							this.pressure = event.data[1] & 0x7F;
							break;

						// Pitch Bend Change
						case 0xE0:
							this.messageType = "pitchbendchange";
							var msb = event.data[2] & 0x7F;
							var lsb = event.data[1] & 0x7F;
							this.pitchBend = (msb << 8) + lsb;
							break;
					}
				}

				return new MIDIMessage(event);
			};

			module.exports = exports["default"];
		}, {}] }, {}, [1])(1);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1]);
