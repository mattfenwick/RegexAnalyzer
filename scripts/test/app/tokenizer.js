define(["app/tokens", "app/tokenizer", "libs/maybeerror"], function (Tokens, Tzer, ME) {

    return function() {
    
        module("tokenizer");
        var T = Tokens.Token,
            parse = Tzer.scanner;
            
        test("regex for each token type", function() {
            deepEqual(Tokens.priorities.length, Tzer.regexes.length);
        });
        
        test('punctuation', function() {
            propEqual(ME.pure([
                          T('opengroup', '('),
                          T('closegroup', ')'),
                          T('openany', '['),
                          T('closeany', ']'),
                          T('openq', '{'),
                          T('closeq', '}'),
                          T('opengroup', '(?:')]), 
                      parse("()[]{}(?:"));
        });
        
        test('special chars', function() {
            propEqual(ME.pure([
                          T('circumflex', '^'),
                          T('dollarsign', '$'),
                          T('plus', '+'),
                          T('star', '*'),
                          T('qmark', '?'),
                          T('alt', '|'),
                          T('dash', '-'),
                          T('dot', '.'),
                          T('comma', ',')]), 
                      parse("^$+*?|-.,"));
        });
        
        test('class, anchor, backref, char, escape, digit', function() {
            propEqual(ME.pure([
                          T('class', 'w'),
                          T('anchor', 'b'),
                          T('backref', '4'),
                          T('char', 'x'),
                          T('char', '@'),
                          T('escape', 'n'),
                          T('digit', '3')]),
                      parse("\\w\\b\\4x@\\n3"));
        });
        
        test("escapes", function() {
            propEqual(ME.pure([
                          T('escape', '.'),
                          T('escape', '<'),
                          T('escape', 't'),
                          T('escape', '$'),
                          T('escape', '(')]),
                      parse("\\.\\<\\t\\$\\("));
        });
        
        test("error reporting", function() {
            propEqual(ME.error({
                          'rest': '\\q1])',
                          message: 'no token matched',
                          'tokens': [T('opengroup', '('), T('openany', '['), T('char', 'a')]
                      }),
                      parse("([a\\q1])"),
                      'invalid escape');
            propEqual(ME.error({
                          'rest': ':ab',
                          message: 'no token matched',
                          'tokens': [T('digit', '4')],
                      }),
                      parse('4:ab'),
                      'unattached colon');
            // what?  are there no other ways to create an error?
        });
    };

});