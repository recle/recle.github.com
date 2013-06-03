/*
    Unit Test - re.t.sformat
*/

module("re.t.sformat");

test("Test - re.t.sformat", function() {

    // [arguments, result]
    var data = [
        [[null], ""],
        [[undefined], ""],
        [[""], ""],
        [["normal string", "unused"], "normal string"],
        [["pure %", "unused"], "pure %"],
        [["%%", null], "%"],
        [["%d", 1], "1"],
        [["%s", "used"], "used"],
        [["name: %s", "jack"], "name: jack"],
        [["%f", 1.3], "1.3"],
        [["pi is %f", 3.14], "pi is 3.14"],
        [["%d is %e", 100, 100], "100 is 1e+2"],
        [["mixed %s are covered by %d%%", "cases", 80], "mixed cases are covered by 80%"]
    ];

    var res;
    $.each(data, function(i, d) {
        ok((res = re.t.sformat.apply(this, d[0])) == d[1], "\"" + JSON.stringify(d[0]) + "\" -> \"" + res + "\"");
    });

});