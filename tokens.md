    circumflex :=  '^'
    dollarsign :=  '$'
    plus       :=  '+'
    star       :=  '*'
    qmark      :=  '?'
    alt        :=  '|'
    comma      :=  ','
    dot        :=  '.'
    dash       :=  '-'

    openq      :=  '{'
    closeq     :=  '}'
    openany    :=  '['
    closeany   :=  ']'
    opengroup  :=  '(?:'  |  '('
    closegroup :=  ')'
    
    class      :=   /\\[dDsSwW]/ 
    anchor     :=   /\\[bBaz]/
    backref    :=   /\\\d+/
    char       :=   (none of "^$+*?|,.{}[](:)-=!<>\", not a digit)
    escape     :=   '\'  (one of "^$+*?|,.{}[](:)-=!<>\.ntrf")
    digit      :=   \d
