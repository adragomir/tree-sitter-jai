const
  PREC = {
    //primary: 14, 
    subscript: 20, 
    selector: 19, 
    call: 18,
    unary: 17, 
    cast: 16, 
    multiply: 12,
    addition: 11,
    bitshift: 10,
    bitwise: 9,
    comparative: 8,
    and: 7,
    or: 6,
    param_type: 5,
    statement: 4,
    primary: 3,
    assign: 2,
    curly: 1,
    label: -1,
    composite_literal: -1, 
    ternary: -2, 
  };

module.exports = grammar({
    name: 'jai',
    //inline: $ => [$.note_simple, $.number],
    //inline: $ => [$.parameter],
    extras: $ =>
    [
        $.comment,
        /\s+/,
        //$.note,
    ],
    word: $ => $.identifier,
    externals: $ => [$.here_string_literal],
    conflicts: $ => [
        [$._unary_operator_left, $._unary_type_operator_left], 
        [$._expression, $.function_parameter], 
        [$._expression, $._type_expression], 
        [$.return_parameter, $.function_parameter], 
        [$.array_type_decl, $.subscript_expression], 
        [$.array_literal_expression, $.subscript_expression], 
        [$.argument_shape, $._unary_type_operator_left], 
        [$.argument_shape, $._type_expression], 
        [$._type_expression, $.single_struct_decl_shape], 
        [$._type_expression, $.single_union_decl_shape], 
        [$._type_expression, $.single_enum_decl_shape], 
        [$._type_expression, $.named_function_parameter], 
        [$.selector_expression, $.selector_type_expression], 
        [$._expression, $.struct_literal_expression, $.selector_type_expression], 
        // [$.insert_statement, $.expression_statement], 
        [$._top_level_statement, $._expression], 
    ],
    supertypes: $ => [
        $._expression, 
        $._type_expression, 
        $._statement
    ], 
    rules: {
        source_file: $ => repeat(
            $._top_level_statement
        ),

        // section: top level
        _top_level_statement: $ => choice(
            $.import_statement,
            $.load_statement,
            choice(
                alias('#scope_file', $.alias_scope_file), 
                alias('#scope_export', $.alias_scope_export), 
                alias('#scope_module', $.alias_scope_module), 
            ),
            $.module_parameters_statement,
            $.named_decl_statement, 
            $.if_directive_top_level, 
            // $.insert_statement, 
            $.expression_statement,
            $.run_shape, 
            $.placeholder_statement, 
            $.block_statement, 
            $.empty_statement, 
            $.comment, 
            $.note
        ), 

        module_parameters_statement: $ =>seq(
            alias('#module_parameters', $.alias_module_parameters),
            field('params', repeat(
                $._function_parameter_list, 
            )), 
            ';'
        ),

        placeholder_statement: $ => seq(
            alias('#placeholder', $.alias_placeholder), 
            field('name', $.identifier), 
            ';'
        ), 

        program_export_directive : $ =>seq(
            alias('#program_export', $.alias_program_export),
            field('name', optional($.string_literal)),
        ),

        if_directive_top_level: $ => prec.right(seq(
            alias('#if', $.alias_static_if),
            field('condition', $._expression),
            field('body', $._top_level_statement),
            optional(
                seq(
                    alias('else', $.alias_else),
                    field('else_body', $._top_level_statement)
                ) 
            )
        )),

        // section: statements
        _statement: $ =>  choice(
            $.expression_statement,
            $.return_statement,
            $.using_statement,
            $.if_statement,
            $.for_statement,
            $.while_statement,
            $.defer_statement,
            $.switch_statement,
            $.case_statement,
            $.through_statement,
            $.continue_statement,
            $.static_if_directive,
            $.backtick_statement,
            $.remove_statement,
            $.empty_statement,
            $.assignment_statement,
            $.push_context_statement, 
            $.named_decl_statement,
            $.operator_definition,
            $.import_statement,
            $.load_statement,
            $.block_statement,
            //$.run_expression,
            $.assert_directive,
            // $.insert_statement, 
        ),

        // insert_statement: $ => seq(
        //     $.insert_shape, 
        //     ';'
        // ),

        load_statement: $ => prec.right(seq(
            seq(
                alias('#load', $.alias_load),
                field('path', $.string_literal),
            ),
            ';'
        )),

        import_statement: $ => prec.right(seq(
            optional(seq(
                field('import_as', $.identifier), 
                '::',
            )), 
            alias('#import', $.alias_import),
            optional(
                seq(
                    ',', 
                    field('qualifier', choice(
                        alias('dir', $.alias_dir), 
                        alias('string', $.alias_string), 
                        alias('file', $.alias_file)
                    )), 
                )
            ), 
            field('value', $.string_literal),
            ';'
        )),

        expression_statement: $ => seq( $._expression, ';'),

        named_decl_statement: $ => prec.right(100, choice(
            $.multi_variable_decl_shape,
            seq($.single_variable_decl_shape, ';'), 
            seq($.single_constant_decl_shape, ';'),  
            $.single_function_decl_shape, 
            $.single_struct_decl_shape, 
            $.single_union_decl_shape, 
            $.single_enum_decl_shape, 
        )), 

        return_statement: $ => prec.right(seq(
            alias('return', $.alias_return),
            CommaSep(
                field('argument', $.argument_shape)
            ),
            ';'
        )),

        using_statement: $ => seq(
            alias('using', $.alias_using),
            $.single_variable_decl_shape, 
            ';'
        ),

        static_if_directive: $ => prec.right(seq(
            alias('#if', $.alias_if),
            field('condition', $._expression),
            field('if_body', $._statement),
            optional($.else_statement)
        )),

        if_statement: $ => prec.right(seq(
            alias('if', $.alias_if),
            field('condition', $._expression),
            optional(alias('then', $.alias_then)),
            field('if_body', $._statement),
            optional($.else_statement),
        )),

        else_statement: $ => seq(
            alias('else', $.alias_else),
            field('else_body', $._statement)
        ),

        for_statement: $ => prec.right(100, seq(
            alias('for', $.alias_for),
            repeat(
                field('for_mod', choice(
                    alias('<', $.alias_down_for_mod)
                ))
            ),
            optional(
                seq(
                    seq(
                        optional('`'), 
                        CommaSep1(field('iterator', $.identifier))
                    ),
                    ':'
                )
            ),
            field('expr', $._expression),
            field('body', $._statement),
        )),

        while_statement: $ =>seq(
            alias('while', $.alias_while),
            field('condition', $._expression),
            field('body', $._statement)
        ),

        remove_statement: $ => seq(
            alias('remove', $.alias_remove),
            field('body', $._expression),
            ';'
        ),

        backtick_statement: $ => seq(
            '`',
            field('body', $._statement)
        ),

        assert_directive: $ => seq(
            alias('#assert', $.alias_assert),
            field('condition', $._expression),
            optional(seq(',', $.string_literal)),
            ';',
        ),

        defer_statement: $ => seq(
            alias('defer', $.alias_defer),
            field('expr', choice(
                $.expression_statement, 
                $.block_statement
            )),
        ),

        case_statement: $ => seq(
            alias('case', $.alias_case),
            field('expr', optional($._expression)),
            ';',
        ),

        through_statement: $ => seq(
            alias('#through', $.alias_through),
            ';',
        ),

        break_statement: $ => seq(
            alias('break', $.alias_break),
            field('loop', optional($.identifier)),
            ';'
        ),
        continue_statement: $ => seq(
            alias('continue', $.alias_continue),
            field('loop', optional($.identifier)), 
            ';'
        ),

        switch_statement: $ => seq(
            alias('if', $.alias_if),
            field('complete_mod', optional(alias('#complete', $.alias_complete))),
            field('condition', $._expression), 
            '==', 
            field('body', $.block_statement)
        ),

        empty_statement: $ => ';',

        assignment_statement: $ => seq(
            field('lhs', $._expression),
            field('operator', choice(
                alias('=', $.alias_assign_op), 
                alias('+=', $.alias_assign_add_op),
                alias('-=', $.alias_assign_sub_op),
                alias('/=', $.alias_assign_div_op),
                alias('*=', $.alias_assign_mul_op), 
                alias('|=', $.alias_assign_or_op), 
                alias('&=', $.alias_assign_and_op), 
                alias('~=', $.alias_assign_not_op), 
                alias('^=', $.alias_assign_xor_op), 
                alias('%=', $.alias_assign_mod_op), 
            )), 
            field('rhs', $._expression), 
            ';'
        ),

        push_context_statement: $ => seq(
            alias('push_context', $.alias_push_context),
            field('name', $._expression),
            field('body', $.block_statement),
        ),

        // run_statement: $ => prec(1, seq(
        //     token(alias('#run', $.alias_run)), 
        //     field('body', $._statement),
        // )),

        add_context_statement: $ => seq(
            alias('#add_context', $.alias_add_context), 
            $.single_decl_shape, 
            ';'
        ), 

        block_statement: $ => seq(
            '{',
            repeat($._statement),
            '}',
        ),

        ////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////// section: expressions

        _expression: $ => choice(
            $.unary_expression,
            $.binary_expression,
            $.selector_expression,
            $.subscript_expression,
            $.call_expression,
            $.cast_expression,
            $.enum_identifier, 
            $.identifier,
            $.struct_literal_expression,
            $.array_literal_expression,
            $.lambda_expression,
            $._literal_expression, 
            $.grouped_expression,
            $.uninitialized_token,
            $.ternary_expression,
            $.code_expression,
            $.insert_shape, 
            $.run_shape, 
            prec.dynamic(-100, $._type_expression)
        ),

        insert_shape: $ => prec.right(100, seq(
            alias('#insert', $.alias_insert),
            optional(seq(
                ',scope(', 
                field('scope', $.identifier), 
                ')'
            )), 
            field('body', choice(
                // func like
                seq(
                    '->', $.identifier, $.block_statement
                ), 
                $.run_shape, 
                // parenthesized
                seq(
                    '(', 
                    CommaSep1(
                        seq(
                            $.identifier, 
                            '=', 
                            $._expression
                        )
                    ), 
                    ')'
                ), 
                // just ident
                $.identifier, 
                $.string_literal
            )), 
        )), 

        run_shape: $ => prec(100, seq(
            alias('#run', $.alias_run), 
            choice(
                seq(
                    '->', 
                    field('return_type', $._type_expression), 
                    field('body', $.block_statement)
                ), 
                seq(
                    '()', 
                    '->', 
                    field('return_type', $._type_expression), 
                    field('body', $.block_statement)
                ), 
                seq(
                    field('return_type', $._type_expression), 
                    field('body', $.block_statement)
                ), 
                field('body', $.grouped_expression), 
                field('body', $.call_expression)
            )
        )), 

        unary_expression: $ =>prec.left(PREC.unary, seq(
            field('op', $._unary_operator_left), 
            field('expr', $._expression)
        )),
        _unary_operator_left: $ => choice(
            alias('*~', $.op_relative_pointer), 
            alias('-', $.op_minus), 
            alias('+', $.op_plus), 
            alias('!', $.op_boolean_not), 
            alias('<<', $.op_deref), 
            alias('~', $.op_bit_complement), 
            alias('xx', $.op_autocast), 
            alias('xx,no_check', $.op_autocast_nocheck), 
            alias('*', $.op_ref),
            alias('#library', $.op_library),
            alias('#system_library', $.op_system_library),
            alias('#char', $.op_char),
            alias('#bake_arguments', $.op_bake_arguments),
            alias('#bake_constants', $.op_bake_constants),
            alias('#place', $.op_place),
        ),

        _literal_expression: $ => choice(
            $.number_literal, 
            $.float_literal, 
            $.scientific_notation_literal, 
            $.string_literal, 
            $.here_string_literal, 
            $.float_literal, 
            $.boolean_literal, 
            alias('null', $.alias_null), 
            choice(
                alias('#caller_location', $.alias_caller_location_literal), 
                alias('#location', $.alias_location_literal),
                alias('#file', $.alias_file_literal), 
                alias('#line', $.alias_line_literal), 
                alias('#filepath', $.alias_filepath_literal)
            )
        ), 

        binary_expression: $ => choice(
            prec.left(PREC.comparative, seq(
                field('lhs', $._expression), 
                field('operator', alias('..', $.alias_range_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.comparative, seq(
                field('lhs', $._expression), 
                field('operator', alias('==', $.alias_boolean_eq_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.comparative, seq(
                field('lhs', $._expression), 
                field('operator', alias('!=', $.alias_boolean_neq_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.comparative, seq(
                field('lhs', $._expression), 
                field('operator', alias('>', $.alias_boolean_gt_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.comparative, seq(
                field('lhs', $._expression), 
                field('operator', alias('<', $.alias_boolean_lt_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.comparative, seq(
                field('lhs', $._expression), 
                field('operator', alias('>=', $.alias_boolean_ge_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.comparative, seq(
                field('lhs', $._expression), 
                field('operator', alias('<=', $.alias_boolean_le_op)),  
                field('rhs', $._expression), 
            )),

            prec.left(PREC.and, seq(
                field('lhs', $._expression), 
                field('operator', alias('||', $.alias_boolean_or_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.or, seq(
                field('lhs', $._expression), 
                field('operator', alias('&&', $.alias_boolean_and_op)),  
                field('rhs', $._expression), 
            )),

            prec.left(PREC.bitshift, seq(
                field('lhs', $._expression), 
                field('operator', alias('<<<', $.alias_bitwise_lsh_arith_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.bitshift, seq(
                field('lhs', $._expression), 
                field('operator', alias('>>>', $.alias_bitwise_rsh_arith_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.bitshift, seq(
                field('lhs', $._expression), 
                field('operator', alias('<<', $.alias_bitwise_lsh_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.bitshift, seq(
                field('lhs', $._expression), 
                field('operator', alias('>>', $.alias_bitwise_rsh_op)),  
                field('rhs', $._expression), 
            )),

            prec.left(PREC.bitwise, seq(
                field('lhs', $._expression), 
                field('operator', alias('&', $.alias_bitwise_and_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.bitwise, seq(
                field('lhs', $._expression), 
                field('operator', alias('|', $.alias_bitwise_or_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.bitwise, seq(
                field('lhs', $._expression), 
                field('operator', alias('^', $.alias_bitwise_xor_op)),  
                field('rhs', $._expression), 
            )),

            prec.left(PREC.multiply, seq(
                field('lhs', $._expression), 
                field('operator', alias('*', $.alias_arith_mul_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.multiply, seq(
                field('lhs', $._expression), 
                field('operator', alias('/', $.alias_arith_div_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.multiply, seq(
                field('lhs', $._expression), 
                field('operator', alias('%', $.alias_arith_mod_op)),  
                field('rhs', $._expression), 
            )),

            prec.left(PREC.addition, seq(
                field('lhs', $._expression), 
                field('operator', alias('+', $.alias_arith_add_op)),  
                field('rhs', $._expression), 
            )),
            prec.left(PREC.addition, seq(
                field('lhs', $._expression), 
                field('operator', alias('-', $.alias_arith_sub_op)), 
                field('rhs', $._expression), 
            )),
            // ...
        ),


        cast_expression: $ => prec(PREC.cast, seq(
            alias('cast', $.alias_cast),
            repeat(
                field('cast_mod', choice(
                    alias(',no_check', $.alias_no_check_cast_mod), 
                    alias(',trunc', $.alias_trunc_cast_mod)
                ))
            ),
            '(',
            field('type', $._type_expression),
            ')',
            field('expr', $._expression)
        )),

        call_expression: $ => prec(PREC.call, seq(
            // field('inline_mod', optional(alias('inline', $.alias_inline))), 
            // name
            field('function', $._expression),
            // arguments
            seq(
                '(',
                CommaSep(field('argument', $.argument_shape)),
                ')',
            )
        )),

        grouped_expression: $ => prec.right(100, seq(
            '(',
            $._expression,
            ')',
        )),

        lambda_expression: $ => prec.right(100, seq(
            choice($._function_parameter_list, $.identifier),
            '=>',
            field('body', choice($.block_statement, $._expression))
        )),

        ternary_expression: $ => prec.right(PREC.ternary, seq(
            alias('ifx', $.alias_ifx),
            $._expression,
            alias('then', $.alias_then),
            $._expression,
            alias('else', $.alias_else),
            $._expression,
        )),

        struct_literal_expression: $ => prec(PREC.composite_literal, seq(
            optional(field('type', $._type_expression)),
            '.', '{',
            CommaSep($._struct_literal_arg),
            '}'
        )),

        _struct_literal_arg: $ => seq(
            optional(
                seq(
                    $.identifier,
                    '='
                )
            ),
            $._expression,
        ),

        // array_literal_expression: $ => prec.right(PREC.composite_literal, seq( 
        //     optional(field('type', $._type_expression)),
        //     '.', '[',
        //     CommaSep($._expression), optional(','),
        //     ']'
        // )),
        array_literal_expression: $ => prec.right(100, seq(
            optional(field('type', $._type_expression)),
            '.[',
            CommaSep($._expression), optional(','),
            ']'
        )),

        selector_expression: $ => prec.right(PREC.selector, seq(
            field('lhs', $._expression), 
            '.',
            field('rhs', $.identifier), 
        )),

        enum_identifier: $ => seq(
            '.',
            field('identifier', $.identifier), 
        ), 

        // subscript_expression: $ => prec(PREC.subscript, seq(
        //     $._expression,
        //     '[',
        //     $._expression,
        //     ']'
        // )),
        subscript_expression: $ => seq(
            $._expression,
            '[',
            $._expression,
            ']'
        ),

        code_expression: $ => prec.right(100, seq( 
            alias('#code', $.alias_code),
            choice(
                $._expression, 
                $.block_statement, 
                $.single_decl_shape
            )
        )),

        ////////////////////////////////////////////////////////////
        //////////////////////////////////////////////////////////// section: types

        _type_expression: $ => choice(
            // postfix
            $.interface_type, 
            $.sub_type, 
            // unary type
            $.unary_type, 
            // poly type
            $.built_in_type,
            $.selector_type_expression, 
            $.this_literal, 
            $.function_type_expression,
            $.identifier, 
            $.enum_definition, 
            $.union_type_expression, 
            $.struct_type_expression
        ),

        selector_type_expression: $ => prec.right(PREC.selector, seq(
            $._type_expression, 
            '.',
            $.identifier
        )),

        interface_type: $ => prec.right(PREC.unary -1, seq(
            field('type', $.identifier), 
            '/interface', 
            field('interface', $.identifier)
        )),

        sub_type: $ => prec.right(PREC.unary -1, seq(
            field('type', $.identifier), 
            '/', 
            field('type_parent', $.identifier)
        )),

        unary_type: $ => prec.left(PREC.unary -1, seq(
            field('type_op', $._unary_type_operator_left), 
            field('expr', $._expression)
        )),

        _unary_type_operator_left: $ => choice(
            // alias('..', $.alias_type_splat),
            alias('*', $.alias_type_ptr),
            $.array_type_decl,
            alias('#type,distinct', $.alias_type_distinct_op), 
            alias('#type,isa', $.alias_type_isa), 
            alias('#type', $.alias_type), 
        ),

        this_literal: $ => alias('#this', $.alias_this_literal), 

        function_type_expression: $ => prec.right(100, seq(
            field('params', $._function_parameter_list), 
            field('return_params', optional(
                seq(
                    '->',
                    choice(
                        CommaSep1(seq($.return_parameter, optional(alias('#must', $.alias_must)))),
                        prec.right(100, seq(
                            '(',
                            CommaSep1(seq($.return_parameter, optional(alias('#must', $.alias_must)))),
                            ')'
                        ))
                    ),
                )
            ))
        )), 

        _function_parameter_list: $ => seq(
            '(',
            CommaSep(field('param', $.function_parameter)),
            ')'
        ),

        function_parameter: $ => seq(
            field('using_mod', optional(alias('using', $.alias_using))), 
            choice(
                $.named_function_parameter, 
                seq(
                    field('splat_mod', optional(alias('..', $.alias_splat))), 
                    field('type', $._type_expression), 
                )
            ), 
        ),

        named_function_parameter: $ => prec.right(seq(
            field('name', $.identifier), 
            ':',
            optional(seq(
                field('splat_mod', optional(alias('..', $.alias_splat))), 
                field('type', $._type_expression), 
            )), 
            optional(seq(
                '=', 
                field('initial', $._expression)
            ))
        )), 

        return_parameter: $ => prec.right(PREC.primary, choice(
            $.named_function_parameter, 
            field('type', $._type_expression), 
        )), 

        array_type_decl: $ => seq(
            '[',
            field('size', optional(choice(
                $._expression, 
                alias('..', $.alias_variant_array), 
            ))),
            ']'
        ),

        built_in_type: $ => choice(
            alias('bool', $.alias_builtin_type_bool),
            alias('float32', $.alias_builtin_type_float32),
            alias('float64', $.alias_builtin_type_float64),
            alias('float', $.alias_builtin_type_float),
            alias('int', $.alias_builtin_type_int),
            alias('char', $.alias_builtin_type_char),
            alias('string', $.alias_builtin_type_string),
            alias('s8', $.alias_builtin_type_s8),
            alias('s16', $.alias_builtin_type_s16),
            alias('s32', $.alias_builtin_type_s32),
            alias('s64', $.alias_builtin_type_s64),
            alias('u8', $.alias_builtin_type_u8),
            alias('u16', $.alias_builtin_type_u16),
            alias('u32', $.alias_builtin_type_u32),
            alias('u64', $.alias_builtin_type_u64),
            alias('void', $.alias_builtin_type_void),
            alias('Code', $.alias_builtin_type_code), 
        ),

        ///////////////////// end types


        argument_shape: $ => choice(
            seq($.identifier, '=', $._expression), 
            seq(
                alias('..', $.alias_op_splat), 
                $._expression
            ), 
            $._expression,
        ),
  
        _const_initializer_single: $ => seq(
            optional($._type_expression), 
            seq(
                ':', 
                $._expression
            ),
        ),

        operator_definition: $ => prec.right(seq(
            alias('operator', $.alias_operator),
            field('op', choice(
                alias('==', $.alias_equal_op),
                alias('!=', $.alias_neq_op),
                alias('+', $.alias_add_op),
                alias('-', $.alias_sub_op), 
                alias('/', $.alias_div_op), 
                alias('*', $.alias_mul_op), 
                alias('[]', $.alias_index_op), 
                alias('>', $.alias_gt_op), 
                alias('<', $.alias_lt_op), 
                alias('>=', $.alias_ge_op), 
                alias('<=', $.alias_le_op)
            )),
            '::',
            field('body', $.function_definition_with_body_shape),
        )),
      

        names: $ => CommaSep1($.identifier), 

        single_decl_shape: $ => prec.right(PREC.primary, choice(
            $.single_variable_decl_shape, 
            $.single_constant_decl_shape, 
            $.single_function_decl_shape, 
            $.single_struct_decl_shape, 
            $.single_union_decl_shape, 
            $.single_enum_decl_shape, 
        )), 

        multi_variable_decl_shape: $ => seq(
            CommaSep2(field('name', $.identifier)),
            ':=', 
            CommaSep1($._expression),
            ';'
        ), 

        single_variable_decl_shape: $ => prec.right(PREC.primary, seq(
            field('name', $.identifier), 
            $._single_variable_initializer_shape
        )), 

        _single_variable_initializer_shape: $ => choice(
            choice(
                prec.right(100, seq(
                    ':=', 
                    field('value', $._expression)
                )), 
                prec.right(99, seq(
                    ':', 
                    field('type', $._type_expression), 
                    '=', 
                    field('value', $._expression)
                )), 
                prec.right(98, seq(
                    ':', 
                    field('type', $._type_expression)
                )), 
            )
        ),

        single_constant_decl_shape: $ => seq(
            field('name', $.identifier), 
            field('body', $._single_constant_initializer_shape), 
        ), 
        _single_constant_initializer_shape: $ => seq(
            choice(
                prec.right(100, seq('::', $._expression)), 
                prec.right(99, seq(':', $._type_expression, ':', $._expression)), 
            )
        ),

        single_function_decl_shape: $ => seq(
            field('name', $.identifier), 
            '::', 
            field('body', $.function_definition_with_body_shape)
        ), 

        function_definition_with_body_shape:  $ => prec.right(PREC.primary, seq(
            optional(field('inline_mod', alias('inline', $.alias_inline))),
            $.function_type_expression, 
            repeat(field('post_mod', $.function_trailing_directive)), 
            $.block_statement,
        )),

        function_trailing_directive: $ => choice(
            // modify
            seq(
                alias('#modify', $.alias_modify), 
                field('modify', $.block_statement)
            ), 
            // foreign
            seq(
                alias('#foreign', $.alias_foreign),
                field('foreign', $.identifier),
            ),
            seq(
                alias('#deprecated', $.alias_deprecated),
                field('deprecated', $.string_literal),
            ),
            alias('#c_call', $.alias_c_call), 
            alias('#dump', $.alias_dump), 
            alias('#expand', $.alias_expand), 
            alias('#compiler', $.alias_compiler), 
            alias('#no_abc', $.alias_no_abc), 
            alias('#symmetric', $.alias_symmetric), 
            alias('#runtime_support', $.alias_runtime_support), 
            alias('#intrinsic', $.alias_intrinsic), 
            alias('#no_context', $.alias_no_context), 
            alias('#no_alias', $.alias_no_alias), 
        ),

        single_struct_decl_shape: $ => seq(
            field('name', $.identifier), 
            '::', 
            field('body', $.struct_type_expression)
        ), 

        struct_type_expression: $ => prec.right(PREC.primary, seq(
            alias('struct', $.alias_struct),
            field('mods', optional(
                choice(
                    alias('#type_info_procedures_are_void_pointers', $.alias_type_info_procedures_are_void_pointers), 
                    alias('#type_info_no_size_complaint', $.alias_type_info_no_size_complaint), 
                    alias('#type_info_none', $.alias_type_info_none)
                )
            )),
            // type parameters
            optional(
                seq(
                    '(',
                    CommaSep(field('parameter', $.named_function_parameter)), 
                    ')'
                )
            ),
            field('body', $.struct_body), 
            field('post_mods', optional(
                alias('#no_padding', $.alias_no_padding_struct_mod)
            ))
        )),

        struct_body: $ => prec.right(seq(
            '{',
            repeat(
                // choice(
                //     // as using
                    seq(
                        optional(choice(
                            seq(alias('#as', $.alias_as), alias('using', $.alias_using)), 
                            seq(alias('using', $.alias_using), alias('#as', $.alias_as)), 
                            alias('using', $.alias_using)
                        )), 
                        $.single_variable_decl_shape, 
                        optional($.align_shape), 
                        ';'
                    ), 
                //     seq($.single_decl_shape, optional($.align_shape), ';')
                // )
            ),
            '}',
        )), 

        align_shape: $ => seq(
            alias('#align', $.alias_align), 
            field('align', $.number_literal)
        ), 

        single_union_decl_shape: $ => seq(
            field('name', $.identifier), 
            '::', 
            field('body', $.union_type_expression)
        ), 
        union_type_expression: $ => seq(
            alias('union', $.alias_union),
            // type parameters
            optional(
                seq(
                    '(',
                    CommaSep(field('parameter', $.named_function_parameter)), 
                    ')'
                )
            ),
            field('body', $.union_body), 
        ),

        union_body: $ => seq(
            '{',
            repeat(
                seq(
                    choice(
                        $.single_variable_decl_shape,
                        $.single_struct_decl_shape, 
                        $.single_union_decl_shape, 
                    ), 
                    ';'
                )
            ),
            '}',
        ), 

        single_enum_decl_shape: $ => seq(
            field('name', $.identifier), 
            '::', 
            field('body', $.enum_definition)
        ), 

        enum_definition: $ => prec.right(PREC.primary, seq(
            choice(
                alias('enum', $.alias_enum), 
                alias('enum_flags', $.alias_enum_flags)
            ),
            optional($.built_in_type),
            optional(alias('#specified', $.alias_specified)),
            $.enum_body
        )),

        enum_body: $ => seq(
            '{',
            repeat(
                choice(
                    seq($.identifier, '::', $.number_literal, ';'), 
                    seq($.identifier, ';'), 
                )
            ), 
            '}',
        ), 

        // section: terminals expressions

        // note: $ => choice(
        //     choice(
        //         token(
        //             seq(
        //                 /@[a-zA-Z_][a-zA-Z_0-9]*/,
        //                 '(',
        //                 repeat(/./),
        //                 ')',
        //             ),
        //         ), 
        //         /@[a-zA-Z_][a-zA-Z_0-9]*/,
        //     )
        // ),
        

        note: $ => /@[a-zA-Z_][a-zA-Z_0-9]*/, 

        comment: $ => token(choice(
            seq('//', /.*/),
            seq(
                '/*',
                /[^*]*\*+([^/*][^*]*\*+)*/,
                '/'
            )
        )), 

        uninitialized_token: $ => '---',

        // taken from c grammar
        string_literal: $ => seq(
            '"',
            repeat(choice(
                token.immediate(prec(1, /[^\\"\n]+/)),
                $.escape_sequence
            )),
            '"',
        ),

        escape_sequence: $ => token.immediate(seq(
            '\\',
            choice(
                /[^xuU]/,
                /\d{2,3}/,
                /x[0-9a-fA-F]{2,}/,
                /u[0-9a-fA-F]{4}/,
                /U[0-9a-fA-F]{8}/
            )
        )),

        boolean_literal: $ => token(choice('true', 'false',)), 

        identifier: $ => /\${0,2}[a-zA-Z_][a-zA-Z_0-9\\]*/,
        number_literal: $ => /\d[\d_]*|0(h|x|X)[a-fA-F0-9_]+|0b[01_]+/,
        float_literal: $ =>/\d[\d_]*\.\d[\d_]*|\.\d[\d_]*/,

        scientific_notation_literal: $ => token(seq(
            /\d[\d_]*\.\d+|\d[\d_]*|\.\d[\d_]*|0(h|x|X)[a-fA-F0-9_]+|0b[01_]+/,
            choice('e', 'E'),
            optional(choice("+","-")),
            /\d[\d_]*\.\d+|\d[\d_]*|\.\d[\d_]*|0(h|x|X)[a-fA-F0-9_]+|0b[01_]+/,
            ))
    }
});

function CommaSep(rule) {
    return optional(CommaSep1(rule))
}

function CommaSep1(rule) {
    return seq(
        rule,
        repeat(
            seq(
                ',',
                rule
            )
        )
    )
}

function CommaSep2(rule) {
    return seq(
        rule,
        ",", 
        rule, 
        repeat(
            seq(
                ',',
                rule
            )
        )
    )
}
