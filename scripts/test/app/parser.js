define(["app/tokens", "app/ast", "libs/maybeerror", "libs/parsercombs", "app/parser"], function (Tokens, AST, ME, PC, P) {

    return function() {
    
        module("parser");
        var T = Tokens.Token,
            tdot = T('dot', '.'),
            toa  = T('openany', '['),
            tanc = T('anchor', 'b'),
            tchr = T('char', '\n'),
            tbr  = T('backref', '4'),
            tcc  = T('class', 'S');
            
        function good(rest, result) {
            return ME.pure({rest: rest, result: result});
        }
        
        test("simple forms: anchor, char, backref, dot, charclass", function() {
            propEqual(good([toa], AST.dot()), P.dot.parse([tdot, toa]), 'dot');
            propEqual(good([tdot], {type: 'pattern', pattype: 'anchor', value: 'word boundary'}), 
                      P.anchor.parse([tanc, tdot]), 
                      'anchor');
            propEqual(good([tanc], AST.char('\n')), 
                P.char.parse([tchr, tanc]), 'char');
            propEqual(good([tchr], AST.backref(4)),
                P.backref.parse([tbr, tchr]),
                'backref');
            propEqual(good([tbr], AST.charclass('not whitespace')),
                P.charclass.parse([tcc, tbr]),
                'char class');
        });
        
    };

});