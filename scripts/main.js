var imports = [
    "app/parser",
    "app/ast_to_jstree",
    "app/tokenizer",
    "gui/astview",
];

require(imports, function(parser, a2jst, regs, astview, tokenview) {

    var ast = new astview($("#ast"));

    $("#parse").click(function() {
        var text = $("#input").val(),
            result = regs.scanner(text);
        if(result.status === 'success') {
            var goodTokens = result.value;
            var tree = parser.regex.parse(goodTokens);
            if(tree.status === 'success') { // what about if there's some tokens unconsumed?
                var conned = a2jst(tree.value.result);
                ast.drawAST(conned);
            } else {
                alert('error occurred!');
                var e = tree.value;
                ast.error(e.rule, e.meta.line, e.meta.column);
            }
        } else if(result.status === 'error') {
            ast.error();
        } else {
            alert('unexpected failure: (no message provided)');
        }
    });
    
    $("#input").val('(abc)\\123[^a-z]+\\??\\s\\d\\w');
    $("#parse").click();
});
