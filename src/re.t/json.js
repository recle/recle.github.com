/* 
    re.t.json - state machine based parser
*/

// namespace
var re = re || {};
re.t = re.t || {};
re.t.json = re.t.json || {};

// debackslashify
re.t.json.debackslashify = function(text) {

	var escapes = {
		'\\': '\\',
		'"' : '"' ,
		'/' : '/' ,
		't' : '\t',
		'n' : '\n',
		'r' : '\r',
		'b' : '\b',
		'f' : '\f'
	};

	return text.replace(/\\(?:u(.{4})|([^u]))/g, function(all, unicode, escape) {
		return unicode ? String.fromCharCode(parseInt(unicode, 16)) : escapes[escape];
	});

};

// tokenize
re.t.json.tokenize = function(text, inspectToken) {

	var pattern = /^[\x20\t\n\r]*(?:([,:\[\]{}])|(true)|(false)|(null)|(-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)|"((?:[^\r\n\t\\\"]|\\(?:["\\\/trnfb]|u[0-9a-fA-F]{4}))*)")/;
	var result;

	for (;;) {

		result = pattern.exec(text);
		if (!result)
			break;

		var token;
		if (token = result[1]) {
			inspectToken(token, "sign");
		}
		else if (token = result[2]) {
			inspectToken(token, "true");
		}
		else if (token = result[3]) {
			inspectToken(token, "false");
		}
		else if (token = result[4]) {
			inspectToken(token, "null");
		}
		else if (token = result[5]) {
			inspectToken(token, "number");
		}
		else if (token = result[6]) {
			inspectToken(re.t.json.debackslashify(token), "string");
		}

		text = text.slice(result[0].length);
	}

	if (/[^\x20\r\t\n]/.test(text))
		return false;

	return true;
};

// parse
re.t.json.parse = function(text, trace) {

	// state table
	var state = "start";

	var key;
	var stack = [];
	var container;
	var value;

	var valueActions = {

		start: function(tokenValue) {
			value = tokenValue;
			state = "end";
		},

		objvalue: function(tokenValue) {
			value = tokenValue;
			state = "objcomma";
		},

		firstarrvalue: function(tokenValue) {
			value = tokenValue;
			state = "arrcomma";
		},

		arrvalue: function(tokenValue) {
			value = tokenValue;
			state = "arrcomma";
		}
	};

	var actions = {

		"number": valueActions,
		"true": valueActions,
		"false": valueActions,
		"null": valueActions,
		"string": {
			start: function(tokenValue) {
				value = tokenValue;
				state = "end";
			},

			firstobjkey: function(tokenValue) {
				key = tokenValue;
				state = "colon";
			},

			objkey: function(tokenValue) {
				key = tokenValue;
				state = "colon";
			},

			objvalue: function(tokenValue) {
				value = tokenValue;
				state = "objcomma";
			},

			firstarrvalue: function(tokenValue) {
				value = tokenValue;
				state = "arrcomma";
			},

			arrvalue: function(tokenValue) {
				value = tokenValue;
				state = "arrcomma";
			}
		},

		'{': {
			start: function() {
				stack.push({state: "end"});
				container = {};
				state = "firstobjkey";
			},
			objvalue: function() {
				stack.push({state: "objcomma", container: container, key:  key});
				container = {};
				state = "firstobjkey";
			},
			firstarrvalue: function() {
				stack.push({state: "arrcomma", container: container});
				container = {};
				state = "firstobjkey";
			},
			arrvalue: function() {
				stack.push({state: "arrcomma", container: container});
				container = {};
				state = "firstobjkey";
			}
		},

		'}': {
			firstobjkey: function() {
				var pop = stack.pop();
				state = pop.state;
				value = container;
				container = pop.container;
				key = pop.key;
			},
			objcomma: function() {
				var pop = stack.pop();
				container[key] = value;
				value = container;
				container = pop.container;
				key = pop.key;
				state = pop.state;
			}
		},

		'[': {
			start: function() {
				stack.push({ state: "end" });
				container = [];
				state = "firstarrvalue";
			},
			objvalue: function() {
				stack.push({state: "objcomma", container: container, key:  key});
				container = [];
				state = "firstarrvalue";
			},
			firstarrvalue: function() {
				stack.push({state: "arrcomma", container: container});
				container = [];
				state = "firstarrvalue";
			},
			arrvalue: function() {
				stack.push({state: "arrcomma", container: container});
				container = [];
				state = "firstarrvalue";
			}
		},

		']': {
			firstarrvalue: function() {
				var pop = stack.pop();
				state = pop.state;
				value = container;
				container = pop.container;
				key = pop.key;
			},
			arrcomma: function() {
				var pop = stack.pop();
				container.push(value);
				value = container;
				container = pop.container;
				key = pop.key;
				state = pop.state;
			}
		},

		',': {
			arrcomma: function() {
				container.push(value);
				state = "arrvalue";
			},	
			objcomma: function() {
				container[key] = value;
				state = "objvalue";
			}
		},

		':': {
			colon: function() {
				state = "objvalue";
			}
		}

	};

	var result = re.t.json.tokenize(text, function(token, type) {

		if (type === "true") {
			actions[type][state](true);
		}
		else if (type === "false") {
			actions[type][state](false);
		}
		else if (type === "null") {
			actions[type][state](null);
		}
		else if (type === "number") {
			actions[type][state](+token);
		}
		else if (type === "string") {
			actions[type][state](token);
		}
		else {
			actions[token][state]();
		}

	});

	if (!result)
		return null;

	return value;
}
