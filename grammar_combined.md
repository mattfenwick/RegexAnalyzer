See:  http://opencompany.org/download/regex-cheatsheet.pdf
      http://www.cs.sfu.ca/~cameron/Teaching/384/99-3/regexp-plg.html
      http://en.wikipedia.org/wiki/Regular_expression
      
    
    Regex       :=   Any1  |  Sequence  |  Single
    
    Single      :=   ( Any2  |  Group  |  Anchor  |  Char  |  Dot  |  Backref  |  Class )  Quantifier(?)
    
    Sequence    :=   Single({2,})
    
    Any1        :=   sepBy2  '|'  ( Single  |  Sequence )
    
    Any2        :=   '['  '^'(?)  ( Char  |  Class  |  Range )(+)  ']'
    
    Group       :=   ( '('  |  '(?:' )  Regex  ')'
    
    Anchor      :=   '^'  |  '$'  |  '\\'  (one of 'bBaz')    
    
    Char        :=   (none of "^$+*?|,.{}[](:)-=!<>\")  |  '\\'  (one of "^$+*?|,.{}[](:)-=!<>\ntrf")
    
    Dot         :=   '.'
    
    Backref     :=   '\\'  /\d+/
    
    Class       :=   '\\'  (one of 'wWsSdD')
    
    Range       :=   Char  '-'  Char
    
    Quantifier  :=   ( '+'  |  '*'  |  '?'  |  QRange )  '?'(?)
    
    QRange      :=   '{'  ( ( /\d*/  ','  /\d*/ )  |  /\d+/ )  '}'
