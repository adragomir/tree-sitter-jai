; highlights.scm

"if" @keyword
"case" @keyword
"return" @keyword
"defer" @keyword
"else" @keyword
"for" @keyword
"while" @keyword
"using" @keyword
"struct" @keyword

(string_literal) @string
(here_string) @string
(number) @number
(float_literal) @number
(scientific_notation) @number
(built_in_type) @type
(named_decl name:(identifier) @function (function_definition))
(named_decl name:(identifier) @type.user (struct_definition))
(named_decl name:(identifier) @constant (const_initializer))
(named_decl name:(identifier) @variable (built_in_type))
(named_decl name:(identifier) @variable (variable_initializer))
(inline_comment) @comment
(block_comment) @comment
(func_call name:(identifier) @function)
; (parameter name:(identifier) @variable)
; (for_loop name:(identifier) @variable)
