define(["app/ast"], function (AST) {

    return function(expExc) {
    
        module("ast");
        var one = AST.quantifier(1, 1, true);
        
        test("quantifier", function() {
            propEqual({type: 'quantifier', low: 0, high: null, isGreedy: false},
                AST.quantifier(0, null, false));
        });
        
        test("char", function() {
            propEqual({type: 'pattern', pattype: 'char', value: '\n'},
                AST.char('\n'));
        });
        
        test("dot", function() {
            propEqual({type: 'pattern', pattype: 'dot'}, AST.dot(one));
        });
        
        test("any", function() {
            propEqual({type: 'pattern', pattype: 'any', isNegated: false, regexes: [AST.char('3')]},
                AST.any(false, [AST.char('3')]));
        });
        
        test("group", function() {
            propEqual({type: 'pattern', pattype: 'group', isCapture: true, regex: AST.regex(AST.dot(), one)},
                AST.group(true, AST.regex(AST.dot(), one)));
        });
        
        test("bad data -> exception", function() {
            expExc(function() {
                AST.range('a', 13, one);
            });
        });
    };
});