define(["app/ast"], function (AST) {

    return function() {
    
        module("ast");
        var one = AST.quantifier(1, 1, true);
        
        test("quantifier", function() {
            propEqual({asttype: 'quantifier', low: 0, high: null, isGreedy: false},
                AST.quantifier(0, null, false));
        });
        
        test("char", function() {
            propEqual({type: 'astnode', value: '\n', quantifier: {type: 'astnode', low: 1, high: 1, isGreedy: true}},
                AST.char('x', one));
        });
    };
});