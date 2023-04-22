((comment) @_start @_end
     (#make-range! "range" @_start @_end))

(((_) @head . (comment) @_start . (comment)+ @_end (_) @tail)
    (#not-has-type? @tail "comment")
    (#not-has-type? @head "comment")
    (#make-range! "range" @_start @_end))

(([

    (for_statement)
    (if_statement)
    (while_statement)
    (switch_statement)
    (case_statement)
    (import_statement)
    (named_decl_statement)
    (return_statement)
    (block_statement)
    (assignment_statement)

    (call_expression)
    (cast_expression)
    (selector_expression)
    (ternary_expression)
    (binary_expression)
    (grouped_expression)
    (struct_type_expression)
    (subscript_expression)
    (array_literal_expression)

    (single_variable_decl_shape)
    (struct_body)

    (identifier)
    (string_literal)
    (number_literal)

    (unary_type)
    (function_parameter)
] @_start @_end)
(#make-range! "range" @_start @_end))


