var imports = [
    "app/parser",
    "app/ast_to_jstree",
    "gui/astview",
];

require(imports, function(parser, a2jst, astview) {

    var ast = new astview($("#ast"));

    $("#parse").click(function() {
        var text = $("#input").val(),
            result = parser.regex.parse(text);
        if(result.status === 'success') {
            var conned = a2jst(result.value.result);
            ast.drawAST(conned);
        } else if(result.status === 'error') {
            ast.error();
        } else {
            alert('unexpected failure: (no message provided)');
        }
    });
    
    $("#input").val('(abc)\\123[^a-z]+\\??\\s\\d\\w');
    $("#parse").click();
});
