define(["app/ast"], function (AST) {

    return function(expExc) {
    
        module("ast");
        var one = AST.quantifier(1, 1, true);
        
        test("quantifier", function() {
            propEqual({asttype: 'quantifier', low: 0, high: null, isGreedy: false},
                AST.quantifier(0, null, false));
        });
        
        test("char", function() {
            propEqual({asttype: 'char', value: '\n', quantifier: {asttype: 'quantifier', low: 1, high: 1, isGreedy: true}},
                AST.char('\n', one));
        });
        
        test("dot", function() {
            propEqual({asttype: 'dot', quantifier: {asttype: 'quantifier', low: 1, high: 1, isGreedy: true}},
                AST.dot(one));
        });
        
        test("any", function() {
            propEqual({asttype: 'any', isNegated: false, phrases: [AST.char('3', one)], quantifier: one},
                AST.any(false, [AST.char('3', one)], one));
        });
        
        test("group", function() {
            propEqual({asttype: 'group', isCapture: true, phrases: [AST.dot(one)], quantifier: one},
                AST.group(true, [AST.dot(one)], one));
        });
        
        test("bad data -> exception", function() {
            expExc(function() {
                AST.range('a', 13, one);
            });
        });
    };
});