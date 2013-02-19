See:  http://opencompany.org/download/regex-cheatsheet.pdf
      http://www.cs.sfu.ca/~cameron/Teaching/384/99-3/regexp-plg.html
      http://en.wikipedia.org/wiki/Regular_expression
      
    
    Regex       :=   Any1  |  Sequence  |  Single
    
    Single      :=   ( Any2  |  Group  |  Anchor  |  Char  |  dot  |  backref  |  class )  Quantifier(?)
    
    Sequence    :=   Single({2,})
    
    Any1        :=   sepBy2  alt  ( Single  |  Sequence )
    
    Any2        :=   openany  circumflex(?)  ( Char  |  class  |  Range )(+)  closeany
    
    Group       :=   opengroup  Regex  closegroup
    
    Anchor      :=   anchor  |  circumflex  |  dollarsign    
    
    Char        :=   char  |  digit  |  escape
    
    Range       :=   Char  dash  Char
    
    Quantifier  :=   ( plus  |  star  |  qmark  |  QRange )  qmark(?)
    
    QRange      :=   openq  ( ( digit(*)  comma  digit(*) )  |  digit(+) )  closeq
