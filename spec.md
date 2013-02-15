Some examples (if no quantifier is given, assume it's `Range 1 1 True`):

Two or more consecutive sub-regexes form a sequence:

    /abc/ -> Sequence [Char a, Char b, Char c]

A group contains 0 or 1 sub-regex and can be capturing or non-capturing:

    /(a.c)/ -> Group True (Sequence [Char a, Dot, Char c])
    /(?:)/ -> Group False null

Square-bracketed `Any`s can be negated and contain ranges:

    /[^a-z\s]/ -> Any True [Range a z, Class "whitespace"]

An unbracketed `Any` contains two or more sub-regexes, separated by pipes:

    /ab|(\1)|qr/  ->  Any False [Sequence [Char a, Char b], 
                                 Group True (Backref 1),
                                 Sequence [Char q, Char r]]

Anchors may be quantified:
                                 
    /\b{2,}?/ -> Anchor "word boundary" (Range 2 null False)
