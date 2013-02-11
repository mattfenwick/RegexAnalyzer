See:  http://opencompany.org/download/regex-cheatsheet.pdf
      http://www.cs.sfu.ca/~cameron/Teaching/384/99-3/regexp-plg.html
      http://en.wikipedia.org/wiki/Regular_expression


    Regex       :=   circumflex(?)  Phrase(+)  dollarsign(?)
    
    Phrase      :=   ( Simple  |  Compound )  Quantifier(?)
    
    Simple      :=   char  |  digit  |  dot  |  escape  |  backref
    
    Compound    :=   Any1  |  Any2  |  Group  |  Range
    
    Quantifier  :=   ( plus  |  star  |  qmark  |  QRange )  qmark(?)
    
    QRange      :=   openq  digit(*)  comma  digit(*)  closeq
    
    Any1        :=   openany  circumflex(?)  Phrase(+)  closeany
    
    Any2        :=   Phrase  alt  Phrase
    
    Group       :=   opengroup  Phrase(+)  closegroup
    
    Range       :=   char  dash  char