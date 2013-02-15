See:  http://opencompany.org/download/regex-cheatsheet.pdf
      http://www.cs.sfu.ca/~cameron/Teaching/384/99-3/regexp-plg.html
      http://en.wikipedia.org/wiki/Regular_expression

Problem:  the structure of Sequences is implicit.  For example: /a/ is just a char,
  but /ab/ is a sequence of two chars.  Possible solution:  require Sequences to be at
  least two sub-regexes long.  Also have to watch out for left-recursion in the
  grammar -- so `Sequence`s are not allowed to contain `Sequence`s to prevent this.
  
Problem:  the order in which sub-rules of 'Pattern' are tried may be significant.  
  Then again, it may not.  Won't backtracking take care of this?  In any case, check out 
  this example:  /abc|def/.  If Sequence is tried first, then there will be '|def' left, 
  which won't match any rule.  So try 'Any' first.  However, backtracking should solve this.  
  So TEST!  Another example:  /abc/ could be parsed as a Char with 'bc' left, which would
  fail.  It needs to match the sequence rule first.  But again, backtracking should take
  care of this, so test it.
      
    
    Regex       :=   Pattern  Quantifier(?)
    
    Pattern     :=   Single  |  Sequence
    
    Single      :=   Any  |  Group  |  Anchor  |  Char  |  dot  |  backref  |  class
    
    Sequence    :=   Single({2,})
    
    Group       :=   opengroup  Regex(?)  closegroup
    
    Anchor      :=   anchor  |  circumflex  |  dollarsign    
    
    Char        :=   char  |  digit  |  escape
    
    Any         :=   Any1  |  Any2
    
    Any1        :=   openany  circumflex(?)  ( Char  |  class  |  Range )(+)  closeany
    
    Any2        :=   Regex  ( alt  Regex )(+)
    
    Range       :=   Char  dash  Char
    
    Quantifier  :=   ( plus  |  star  |  qmark  |  QRange )  qmark(?)
    
    QRange      :=   openq  ( ( digit(*)  comma  digit(*) )  |  digit(+) )  closeq
