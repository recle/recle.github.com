/* 
    Unit Test - re.t.json    
*/

test("Test re.t.json.debackslashify", function() {

	var data = [
		["Empty", "", ""],
		["No escape", "no escape", "no escape"],
		["Slashes and quote", "slash\\/, backslash\\\\, quote\\\"", "slash/, backslash\\, quote\""],
		["Blank", "\\r\\n\\b\\f\\t", "\r\n\b\f\t"]
	];

	for (var i = 0; i < data.length; i++) {
		ok(re.t.json.debackslashify(data[i][1]) == data[i][2], data[i][0] + ": (" + data[i][1] + ") -> (" + data[i][2] + ")");
	}

});


test("Test re.t.json.tokenize", function() {

	var data = [
		["Empty", ""],
		["Spaces", " \t\r\n  "],
		["String", "\"string\""],
		["Number", "12.3"],
		["Number", "-1e100"],
		["Literal", "true, false, null"],
		["Array", "[1, 2.4, \"gh\"]"],
		["Object", "{\"name\" : \"kurt\", \"age\": 2.4 } "],
		["Compond", "{ \"arr\": [1, 2, 3], \"description\": \"array\", [\"abc\", [true, false, null]}"],
		["Slash", "{\"\\\"nam\\\\ean d\\\"\": \"co de\"}"]
	];

	for (var i = 0; i < data.length; i++) {
		var tokens = [];
		ok(re.t.json.tokenize(data[i][1], function(token, type) {
			tokens[tokens.length] = token + "<" + type + ">";
		}), data[i][0] + ": (" + data[i][1] + ") -> (" + tokens + ")");
	}

});

test("Test re.t.json.parse", function() {

	var obj = re.t.json.parse("{\"1\": 2}");
	ok(obj != null, obj);

	var obj2 = re.t.json.parse("{\"1\": [1, {\"name\": \"value\"}]}");
	ok(obj2 != null, obj2);

});