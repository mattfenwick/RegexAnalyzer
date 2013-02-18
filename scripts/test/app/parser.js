define(["app/tokens", "app/ast", "libs/maybeerror", "libs/parsercombs", "app/parser"], function (Tokens, AST, ME, PC, P) {

    return function() {
    
        module("parser");
        var T = Tokens.Token,
            ONE = AST.quantifier(1, 1, true),
            tdot = T('dot', '.'),
            toa  = T('openany', '['),
            tanc = T('anchor', 'b'),
            tchr = T('char', '\n'),
            tbr  = T('backref', '4'),
            tcc  = T('class', 'S'),
            tocg = T('opengroup', '('),
            tong = T('opengroup', '(?:'),
            tcg  = T('closegroup', ')'),
            toq  = T('openq', '{'),
            tcq  = T('closeq', '}'),
            tcm  = T('comma', ','),
            tqm  = T('qmark', '?'),
            tpls = T('plus', '+'),
            tstr = T('star', '*'),
            td3  = T('digit', '3'),
            td7  = T('digit', '7'),
            tchx = T('char', 'x'),
            tdsh = T('dash', '-'),
            talt = T('alt', '|');
            
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
        
        test("quantifiers", function() {
            var p = P.quantifier.parse,
                q = AST.quantifier;
            propEqual(good([tqm], q(3, 7, false)), 
                p([toq, td3, tcm, td7, tcq, tqm, tqm]),
                '{3,7}?');
            propEqual(good([tdot], q(1, null, true)),
                p([tpls, tdot]),
                '+');
            propEqual(good([tbr], q(0, null, false)),
                p([tstr, tqm, tbr]),
                '*?');
            propEqual(good([tqm], q(0, 1, false)),
                p([tqm, tqm, tqm]),
                '??');
            propEqual(good([td3], q(0, null, true)),
                p([toq, tcm, tcq, td3]),
                '{,}');
            propEqual(good([tcm], q(0, 7, false)),
                p([toq, tcm, td7, tcq, tqm, tcm]),
                '{,7}?');
            propEqual(good([toq], q(3, null, true)),
                p([toq, td3, tcm, tcq, toq]),
                '{3,}');
            propEqual(good([], q(7, 7, true)),
                p([toq, td7, tcq]),
                '{7}');
        });
        
        test("range", function() {
            propEqual(good([toq], AST.range('x', '\n')),
                P.range.parse([tchx, tdsh, tchr, toq]),
                'x-\\n');
        });
        
        test("any", function() {
            // [a-z\s]
            // \4|\S|x
            propEqual(good([toq], AST.any(false, [AST.backref(4), AST.charclass('not whitespace'), AST.char('x')])),
                P.any.parse([tbr, talt, tcc, talt, tchx, toq]),
                '\4|\S|x');
        });
        
/*        test("compound forms: group, any", function() {
            propEqual(good([tbr], AST.group(true, AST.regex(AST.dot(), ONE))),
                P.group.parse([tocg, tdot, tcg, tbr]),
                'open capture group');
        });*/
        
    };

});