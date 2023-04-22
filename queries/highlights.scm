; highlights.scm

(alias_if) @keyword
(alias_then) @keyword
(alias_case) @keyword
(alias_return) @keyword
(alias_defer) @keyword
(alias_else) @keyword
(alias_through) @keyword
(alias_return) @keyword
(alias_for) @keyword
(alias_while) @keyword
(alias_using) @keyword
(alias_struct) @keyword
(alias_continue) @keyword
(alias_break) @keyword
(alias_struct) @keyword
(alias_enum) @keyword
(alias_enum_flags) @keyword
(alias_static_if) @keyword
(alias_union) @keyword
(alias_remove) @keyword
(alias_assert) @keyword
(alias_ifx) @keyword

(alias_import) @keyword
(alias_dir) @keyword
(alias_string) @keyword
(alias_file) @keyword
(alias_load) @keyword

(alias_add_op) @operator
(alias_arith_add_op) @operator
(alias_arith_div_op) @operator
(alias_arith_mod_op) @operator
(alias_arith_mul_op) @operator
(alias_arith_sub_op) @operator
(alias_assign_add_op) @operator
(alias_assign_and_op) @operator
(alias_assign_div_op) @operator
(alias_assign_mod_op) @operator
(alias_assign_mul_op) @operator
(alias_assign_not_op) @operator
(alias_assign_op) @operator
(alias_assign_or_op) @operator
(alias_assign_sub_op) @operator
(alias_assign_xor_op) @operator
(alias_bitwise_and_op) @operator
(alias_bitwise_lsh_arith_op) @operator
(alias_bitwise_lsh_op) @operator
(alias_bitwise_or_op) @operator
(alias_bitwise_rsh_arith_op) @operator
(alias_bitwise_rsh_op) @operator
(alias_bitwise_xor_op) @operator
(alias_boolean_and_op) @operator
(alias_boolean_eq_op) @operator
(alias_boolean_ge_op) @operator
(alias_boolean_gt_op) @operator
(alias_boolean_le_op) @operator
(alias_boolean_lt_op) @operator
(alias_boolean_neq_op) @operator
(alias_boolean_or_op) @operator
(op_autocast) @operator

(alias_type_info_procedures_are_void_pointers) @keyword
(alias_type_info_none) @keyword
(alias_type_info_no_size_complaint) @keyword

(alias_align) @keyword
(alias_dump) @keyword

(alias_type) @keyword

(alias_no_padding_struct_mod) @keyword
(alias_must) @keyword

(string_literal) @string
(boolean_literal) @constant
(here_string_literal) @string
(number_literal) @number
(float_literal) @number
(scientific_notation_literal) @number
(built_in_type) @type.builtin

(comment) @comment

(alias_caller_location_literal) @keyword
(alias_location_literal) @keyword
(alias_file_literal) @keyword
(alias_line_literal) @keyword
(alias_filepath_literal) @keyword

(alias_down_for_mod) @operator
(alias_variant_array) @operator

(alias_c_call) @keyword
(alias_compiler) @keyword
(alias_complete) @keyword
(alias_dump) @keyword
(alias_expand) @keyword
(alias_inline) @keyword
(alias_inline) @keyword
(alias_intrinsic) @keyword
(alias_no_abc) @keyword
(alias_no_alias) @keyword
(alias_no_check_cast_mod) @keyword
(alias_no_context) @keyword
(alias_no_padding_struct_mod) @keyword
(alias_op_splat) @keyword
(alias_runtime_support) @keyword
(alias_splat) @keyword
(alias_string) @keyword
(alias_symmetric) @keyword
(alias_trunc_cast_mod) @keyword
(alias_type) @keyword
(alias_type_info_procedures_are_void_pointers) @keyword
(alias_type_isa) @keyword
(alias_type_ptr) @keyword
(alias_splat) @keyword
(alias_using) @keyword
"." @delimiter
";" @delimiter
":" @delimiter
"[" @operator
"]" @operator
"(" @operator
")" @operator
"{" @operator
"}" @operator
":=" @operator

(single_function_decl_shape name:(identifier) @function)
(single_struct_decl_shape name:(identifier) @type)
(single_enum_decl_shape name:(identifier) @type)
(single_union_decl_shape name:(identifier) @type)
(single_constant_decl_shape name:(identifier) @constant)
(multi_variable_decl_shape name:(identifier) @variable)
(single_variable_decl_shape name:(identifier) @variable type:(_) @type)
(single_variable_decl_shape name:(identifier) @variable value:(_))
(cast_expression type:(_) @type)
(named_function_parameter name:(identifier) @variable type:(_) @type)
(named_function_parameter name:(identifier) @variable initial:(_))
(return_parameter type:(_) @type)
(for_statement iterator:(identifier) @variable)
(call_expression function:(identifier) @function)
(import_statement import_as:(identifier) @variable)
(assignment_statement lhs:(identifier) @variable)
(return_statement argument:(argument_shape (identifier) @variable))
(for_statement expr:(identifier) @variable)

