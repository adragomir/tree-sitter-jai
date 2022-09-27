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
"inline" @keyword

"#import" @type.builtin
"#load" @type.builtin

"#type_info_none" @type.builtin
"#type_info_procedures_are_void_pointers" @type.builtin
"#no_padding" @type.builtin
"#must" @type.builtin

(null_token) @constant
(import_qualifier) @type.builtin
(expression_like_directive) @type.builtin
(assert_directive token:"#assert" @type.builtin)
(foreign_directive token:"#foreign" @type.builtin)
(deprecated_directive token:"#deprecated" @type.builtin)
(code_directive token:"#code" @type.builtin)
("#complete") @type.builtin
(run_statement_token) @type.builtin
(operator_like_directive) @type.builtin
(other_trailing_directive) @type.builtin

(file_scope_directive) @type.builtin
(export_scope_directive) @type.builtin
(module_scope_directive) @type.builtin

(string_literal) @string
(boolean_literal) @constant
(here_string) @string
(number) @number
(float_literal) @number
(scientific_notation) @number
(built_in_type) @type.builtin
(named_decl name:(identifier) @text (function_definition))
(named_decl name:(identifier) @text (struct_definition))
(named_decl name:(identifier) @constant (const_initializer))
(named_decl name:(identifier) @text (built_in_type))
(named_decl name:(identifier) @text (variable_initializer))
(inline_comment) @comment
(block_comment) @comment
(func_call name:(identifier) @function)
; (parameter name:(identifier) @variable)
; (for_loop name:(identifier) @variable)
