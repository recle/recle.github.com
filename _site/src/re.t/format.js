/*
    re.t.sformat - string format utility
*/

/* 
    @namespace
*/
    var re = re || {};
    re.t = re.t || {};

/*
    %% - the % literal
    %d - the number
    %e - the scientific number
    %f - the float number
    %s - the string
*/
re.t.sformat = function(format) {

    if (format === null || format === undefined || format.length === 0)
        return "";

    var cursor = 0;
    var args = arguments;
    return format.replace(/%([%defs])/g, function(match, p1, index, fullText) {

        if (match != null)
        {
            var arg = args[cursor + 1];
            cursor++;
            switch(p1)
            {
                case '%':
                    return "%";
                case 'd':
                    return (typeof arg === "number") ? arg.toFixed() : fullText;
                case 's':
                    return arg;
                case 'f':
                    return parseFloat(arg);
                case 'e':
                    return (typeof arg === "number") ? arg.toExponential() : fullText;
            }
        }
        return fullText;

    });

 };