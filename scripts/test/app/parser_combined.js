define(["app/ast", "libs/maybeerror", "app/parser_combined"], function (AST, ME, P) {

    return function() {
    
        module("parser_combined");
        var ONE = AST.quantifier(1, 1, true);
            
        function good(rest, result) {
            return ME.pure({rest: rest, result: result});
        }
        
        test("simple forms: anchor, char, backref, dot, charclass", function() {
            propEqual(good("\\b", AST.dot()), P.dot.parse(".\\b"), 'dot');
            propEqual(good(".", {type: 'pattern', pattype: 'anchor', value: 'word boundary'}), 
                      P.anchor.parse("\\b."), 
                      'anchor');
            propEqual(good("bc", AST.char('a')), 
                P.char.parse("abc"), 'char');
            propEqual(good("qr", AST.char('\n')),
                P.char.parse("\nqr"), 'char from escape');
            propEqual(good("oops", AST.backref(4)),
                P.backref.parse("\\4oops"),
                'backref');
            propEqual(good("{}", AST.charclass('not whitespace')),
                P.charclass.parse("\\S{}"),
                'char class');
        });
        
        test("quantifiers", function() {
            var q = AST.quantifier;
            var testCases = [
                ['?',   q(3, 7, false),    '{3,7}??'],
                ['.',   q(1, null, true),  '+.'     ],
                ['\\4', q(0, null, false), '*?\\4'  ],
                ['?',   q(0, 1, false),    '???'    ],
                ['3',   q(0, null, true),  '{,}3'   ],
                [',',   q(0, 7, false),    '{,7}?,' ],
                ['{',   q(3, null, true),  '{3,}{'  ],
                ['',    q(7, 7, true),     '{7}'    ]];
            
            testCases.map(function(t) {
                deepEqual(good(t[0], t[1]), P.quantifier.parse(t[2]));
            });
        });
        
        test("range", function() {
            propEqual(good('(', AST.range('x', '\n')),
                P.range.parse('x-\\n('));
        });
        
        test("[any]", function() {
            propEqual(good('', AST.any(true, [AST.regex(AST.range('\n', 'x'), ONE), 
                                              AST.regex(AST.charclass('not whitespace'), ONE)])),
                P.any2.parse('[^\n-x\\S]'));

        });
        
        test("a|n|y", function() {
            propEqual(good('{', AST.regex(
                                      AST.any(false, [AST.regex(AST.backref(4), ONE), 
                                                      AST.regex(AST.charclass('not whitespace'), ONE)]),
                                      ONE)),
                P.any1.parse('\\4|\\S{'));
            propEqual(good('{', AST.regex(
                                      AST.any(false, [AST.regex(AST.backref(4), ONE), 
                                                      AST.regex(AST.charclass('not whitespace'), AST.quantifier(7, null, false)),
                                                      AST.regex(AST.char('x'), ONE),
                                                      AST.regex(AST.anchor('word boundary'), ONE)]),
                                      ONE)),
                P.any1.parse('\\4|\\S{7,}?|x|\\b{'));
        });

        test("sequence", function() {
            propEqual(good('{', AST.regex(AST.sequence([AST.regex(AST.char('\n'), AST.quantifier(1, null, true)),
                                                        AST.regex(AST.char('x'), AST.quantifier(0, 1, true)),
                                                        AST.regex(AST.char('3'), ONE)]), 
                                          ONE)),
                P.sequence.parse('\n+x?3{'));
            propEqual(good('{', AST.regex(AST.sequence([AST.regex(AST.char('\n'), AST.quantifier(1, null, true)),
                                                        AST.regex(AST.char('x'), AST.quantifier(0, 1, true)),
                                                        AST.regex(AST.char('3'), ONE)]), 
                                          ONE)),
                P.regex.parse('\n+x?3{'),
                'using regex parser');                
        });
        
        test("group", function() {
            propEqual(good('\\5', AST.group(true, AST.regex(AST.dot(), AST.quantifier(0, null, false)))),
                P.group.parse('(.*?)\\5'));
            propEqual(good('q', AST.group(false, AST.regex(AST.dot(), AST.quantifier(0, null, false)))),
                P.group.parse('(?:.*?)q'));
            propEqual(good('', AST.group(false, AST.regex(AST.sequence([AST.regex(AST.char('\n'), ONE),
                                                                        AST.regex(AST.char('x'), ONE),
                                                                        AST.regex(AST.char('3'), ONE)]), ONE))),
                P.group.parse('(?:\nx3)'));
            propEqual(good('', AST.group(true, AST.regex(AST.any(false, 
                                                                  [AST.regex(AST.sequence([AST.regex(AST.char('\n'), ONE),
                                                                                           AST.regex(AST.char('x'), ONE)]),
                                                                             ONE),
                                                                   AST.regex(AST.sequence([AST.regex(AST.backref(4), ONE),
                                                                                           AST.regex(AST.char('\n'), ONE)]),
                                                                             ONE)]),
                                                          ONE))),
                P.group.parse('(\nx|\\4\n)'));
        });
        
        test("regex", function() {
            propEqual(good('', AST.regex(AST.sequence([AST.regex(AST.char('a'), ONE),
                                                       AST.regex(AST.backref(1), ONE),
                                                       AST.regex(AST.char('b'), ONE)]), 
                                         ONE)),
                P.regex.parse('a\\1b'));
        });

    };

});