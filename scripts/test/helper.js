define(function() {
    
    function expectException(f, type, message, errortype) {// errortype is optional
        var threw = true,
            exc;
        try {
            f();
            threw = false;
        } catch(e) {
            exc = e;
        }
        ok(threw, "exception expected: " + message);
      if(exc) {
          equal(exc.type, type, "exception type: " + message + "  (" + typeof(exc) + JSON.stringify(exc) + ")");
          if(errortype) {
              equal(exc.errortype, errortype, "exception error type: " + message);
          }
      } else {
          ok(false, "failed to throw exception -- can't check type");
      }
    }
    
    return expectException;
    
});