define(["app/tokens", "app/ast", "libs/maybeerror", "libs/parsercombs", "app/parser"], function (Tokens, AST, ME, PC, P) {

    return function() {
    
        module("parser");
        var T = Tokens.Token,
            ONE = AST.quantifier(1, 1, true),
            tdot = T('dot', '.'),
            toa  = T('openany', '['),
            tca  = T('closeany', ']'),
            tanc = T('anchor', 'b'),
            tchr = T('char', '\n'),
            tesc = T('escape', 'n'),
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
            talt = T('alt', '|'),
            tcmf = T('circumflex', '^');
            
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
            propEqual(good([tanc], AST.char('\n')),
                P.char.parse([tesc, tanc]), 'char from escape');
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
        
        test("any1", function() {
            propEqual(good([toq], AST.regex(
                                      AST.any(false, [AST.regex(AST.backref(4), ONE), 
                                                      AST.regex(AST.charclass('not whitespace'), ONE)]),
                                      ONE)),
                P.any1.parse([tbr, talt, tcc, toq]),
                '\4|\S');
            propEqual(good([toq], AST.regex(
                                      AST.any(false, [AST.regex(AST.backref(4), ONE), 
                                                      AST.regex(AST.charclass('not whitespace'), AST.quantifier(7, null, false)),
                                                      AST.regex(AST.char('x'), ONE),
                                                      AST.regex(AST.anchor('word boundary'), ONE)]),
                                      ONE)),
                P.any1.parse([tbr, talt, tcc, toq, td7, tcm, tcq, tqm, talt, tchx, talt, tanc, toq]),
                '\4|\S{7,}?|x|\b');
        });
        
        test("any2", function() {
            propEqual(good([], AST.any(true, [AST.regex(AST.range('\n', 'x'), ONE), 
                                              AST.regex(AST.charclass('not whitespace'), ONE)])),
                P.any2.parse([toa, tcmf, tchr, tdsh, tchx, tcc, tca]),
                '[^\n-x\S]');

        });
        
        test("sequence", function() {
            propEqual(good([toq], AST.regex(AST.sequence([AST.regex(AST.char('\n'), AST.quantifier(1, null, true)),
                                                       AST.regex(AST.char('x'), AST.quantifier(0, 1, true)),
                                                       AST.regex(AST.char('3'), ONE)]), 
                                         ONE)),
                P.sequence.parse([tchr, tpls, tchx, tqm, td3, toq]),
                '\n+x?3');
            propEqual(good([toq], AST.regex(AST.sequence([AST.regex(AST.char('\n'), AST.quantifier(1, null, true)),
                                                       AST.regex(AST.char('x'), AST.quantifier(0, 1, true)),
                                                       AST.regex(AST.char('3'), ONE)]), 
                                         ONE)),
                P.regex.parse([tchr, tpls, tchx, tqm, td3, toq]),
                '\n+x?3  using regex parser');                
        });
        
        test("group", function() {
            propEqual(good([tbr], AST.group(true, AST.regex(AST.dot(), AST.quantifier(0, null, false)))),
                P.group.parse([tocg, tdot, tstr, tqm, tcg, tbr]),
                '(.*?)');
            propEqual(good([tbr], AST.group(false, AST.regex(AST.dot(), AST.quantifier(0, null, false)))),
                P.group.parse([tong, tdot, tstr, tqm, tcg, tbr]),
                '(?:.*?)');
            propEqual(good([], AST.group(false, AST.regex(AST.sequence([AST.regex(AST.char('\n'), ONE),
                                                                        AST.regex(AST.char('x'), ONE),
                                                                        AST.regex(AST.char('3'), ONE)]), ONE))),
                P.group.parse([tong, tchr, tchx, td3, tcg]),
                '(?:\nx3)');
            propEqual(good([], AST.group(true, AST.regex(AST.any(false, 
                                                                  [AST.regex(AST.sequence([AST.regex(AST.char('\n'), ONE),
                                                                                           AST.regex(AST.char('x'), ONE)]),
                                                                             ONE),
                                                                   AST.regex(AST.sequence([AST.regex(AST.backref(4), ONE),
                                                                                           AST.regex(AST.char('\n'), ONE)]),
                                                                             ONE)]),
                                                          ONE))),
                P.group.parse([tocg, tchr, tchx, talt, tbr, tchr, tcg]),
                '(\nx|\4\n)');
        });
/*        
        test("regex", function() {
            ok(0, "AST may be far too complicated -- need to simplify, reduce unnecessary nesting");
        });
*/        
    };

});