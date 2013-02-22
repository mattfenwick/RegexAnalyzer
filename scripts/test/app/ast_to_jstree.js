define(["app/ast", "app/ast_to_jstree"], function (AST, a2jst) {

    return function() {
    
        module("ast_to_jstree");
        var convert = a2jst.convert;
        
        test('atom', function() {
            ok(0, 'tests unimplemented');
        });
    };

});