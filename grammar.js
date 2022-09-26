module.exports = grammar({
  name: 'jai',
  //inline: $ => [$.note_simple, $.number],
  //inline: $ => [$.parameter],
  extras: $ =>
   [
    $.inline_comment,
    $.block_comment,
    /\s+/,
    $.note_simple,
    $.note_with_args,
  ],
  word: $ => $.identifier,
  externals: $ => [$.here_string],
  conflicts: $ =>[
    [$.switch, $.binary_expression],
    [$.parenthesis, $.parameter],
    [$.func_call, $.parameter],
    //[$.parameter, $._named_decl_expression],
    //[$.trailing_return_types, $.function_header],
    [$.trailing_return_types, $._parameter_list],
    [$._expression, $.names],
    //[$.func_call, $.func_call_in_progress],
    //[$._argument_list, $.argument_list_in_progress]
    [$._named_decl_expression, $._unary_operator_left]
  ],
  rules: {
    source_file: $ => repeat(
        $._statement
      ),
      expression_like_directive: $ => token(choice(
        "#caller_location",
        "#location",
        "#file",
        "#line",
        "#filepath",
        "#through",
      )),
    _expression: $ => choice(
      $.number,
      $.float_literal,
      $.scientific_notation,
      $.string_literal,
      $.binary_expression,
      $.unary_expression,
      $.cast_expression,
      $.parenthesis,
      $.built_in_type,
      $.uninitialized_token,
      $.identifier,
      $.func_call,
      //$.array_literal,
      $._expression_with_block,
      $.lambda_expression,
      $.expression_like_directive,
      $.ternary_expression,
      $.function_header,
      $.implicit_struct_literal,
      $.typed_struct_literal,
      $.implicit_compile_time_array_literal,
      $.typed_compile_time_array_literal,
      $.spicy_insert,
      $.code_directive,
      $.member_access,
      $.subscript,
      $.member_access_nothing,
      //$.func_call_in_progress
    ),
    parenthesis: $ => seq(
      "(",
      $._expression, // not optional as an expression!
      ")",
    ),
    _expression_with_block: $ => choice(
      $.function_definition,
      $.enum_definition,
      $.struct_definition,
      $.union_definition,
      $.here_string,
    ),
    _type_definition: $ => prec(1, choice(
      $.enum_definition,
      $.struct_definition,
      $.union_definition,
    )),
    _statement: $ =>  choice(
      $.return_statement,
      $.using_statement,
      $.if_statement,
      $.for_loop,
      $.while_loop,
      $.defer_statement,
      $.switch_statement,
      $.case_statement,
      $.continue_statement,
      $.if_directive,
      $.break_statement,
      $.backtick_statement,
      $.remove_statement,
      $.empty_statement,
      $.assignment_statement,
      $.push_context_statement,
      $._expression_statement,
      $.named_decl,
      $.operator_definition,
      $.import_statement,
      $.file_scope_directive,
      $.export_scope_directive,
      $.module_scope_directive,
      $.program_export,
      $.load_statement,
      $.imperative_scope,
      $.run_statement,
      $._type_definition,
      $.assert_directive,
      $.module_parameters,
    ),
    _expression_statement: $ => seq( $._expression, ";"),

      inline_comment: $ => token(seq('//', /.*/)),
      block_comment: $ => seq(
        '/*',
        repeat(choice(/./, $.block_comment)),
        '*/'
      ),
      lambda_expression: $ => prec(-1, seq(
        choice($._parameter_list, $.identifier),
        '=>',
        field('body', choice($.imperative_scope, $._expression))
      )),
    uninitialized_token: $ => "---",

    remove_statement: $ => seq(
      "remove",
      $._expression,
      ";"
    ),

    // taken from c grammar
    string_literal: $ => seq(
      '"',
      repeat(choice(
        token.immediate(prec(1, /[^\\"\n]+/)),
        $.escape_sequence
      )),
      '"',
    ),

    escape_sequence: $ => token(prec(1, seq(
      '\\',
      choice(
        /[^xuU]/,
        /\d{2,3}/,
        /x[0-9a-fA-F]{2,}/,
        /u[0-9a-fA-F]{4}/,
        /U[0-9a-fA-F]{8}/
      )
    ))),

    backtick_statement: $ => seq(
      "`",
      $._statement
    ),


    assert_directive: $ =>
    seq(
        "#assert",
      $._expression,
      optional($.string_literal),
      ";",
    ),

    file_scope_directive: $ =>
      '#scope_file',

    export_scope_directive: $ =>
      '#scope_export',

    import_statement: $ =>  prec(1, seq( // precedence over unary import
      '#import',
      field("name", $.string_literal),
      ";"
    )),

    struct_definition: $ => seq(
      "struct",
      optional("#type_info_none"),
      optional("#type_info_procedures_are_void_pointers"),
      optional($._parameter_list),
      $.data_scope,
      optional("#no_padding")
    ),

    
      _struct_literal_arg: $ => seq(
        optional(seq($._expression,
        "=")),
        $._expression,
      ),

    typed_struct_literal: $ => prec(5, seq( // precedence over member access
        $._expression,
        ".","{",
        CommaSep($._struct_literal_arg),
          "}"
      )),

    implicit_struct_literal: $ => prec(1, seq( // precedence over unary left .
      ".","{",
      CommaSep($._struct_literal_arg),
        "}"
    )),

    typed_compile_time_array_literal: $ => prec(5, seq( // precedence over member access
      $._expression,
      ".", "[",
      CommaSep($._expression),  optional(","),
        "]"
    )),

    implicit_compile_time_array_literal: $ => prec(1, seq( 
      ".", "[",
      CommaSep($._expression), optional(","),
        "]"
    )),

    union_definition: $ => seq(
      "union",
      optional($._parameter_list),
      $.data_scope
    ),

    enum_definition: $ => seq(
      choice("enum", "enum_flags"),
      optional($._expression),
      optional("#specified"),
      $.data_scope
    ),

    array_decl: $ => seq(
      "[",
      optional(choice($._expression, "..")),
      "]"
    ),

    built_in_type: $ => token(choice(
      'bool',
      'float32',
      'float64',
      'float',
      'int',
      'char',
      'string',
      's8',
      's16',
      's32',
      's64',
      'u8',
      'u16',
      'u32',
      'u64',
      'void',
    )),

      argument_name: $ => seq(
        $.identifier,
        "="
      ),

      argument: $ => prec(1, seq(
        optional($.argument_name),
        $._expression,
      )),

      _argument_list: $ => prec(1, seq(
        "(",
        CommaSep($.argument),
        optional(","),
        ")",
      )),

      func_call: $ =>seq(
        $._expression,
        $._argument_list,
      ),

      argument_list_in_progress: $ => prec(1, seq(
        "(",
        CommaSep($.argument),
        //optional(","),
        //"\n"
      )),

      trailing_return_types: $ => prec.right(seq(
        "->",
        choice(
          CommaSep1(seq($.parameter, optional("#must"))),
          seq(
            "(",
            CommaSep1(seq($.parameter, optional("#must"))),
            ")"
          )
          ),
      )),


      _parameter_list: $ => seq(
        '(',
          CommaSep($.parameter),
        ')'
      ),
  
    _named_decl_expression: $ => prec.left(3, seq(
        repeat("$"),
        $.identifier,
        ":",
        choice(
          $._expression, 
          $._variable_initializer_single,
          $._const_initializer_single,
        )
      )),

      parameter: $ => choice(
        $.using_expression,
        $._named_decl_expression,
        $._expression,
      ),
  

      function_header : $ => prec.left(seq(
        $._parameter_list,
        optional($.trailing_return_types),
        repeat($.trailing_directive)
      )),

      function_definition : $ => prec(1, seq(
        optional("inline"),
        $.function_header,
        $.imperative_scope,
      )),


      _operator_symbol: $=>token(choice(
        "==",
        "!=",
        "+",
        "-",
        "/",
        "*",
        "[]",
        ">",
        "<",
        ">=",
        "<="
      )),

      operator_definition: $ => seq(
        "operator",
        $._operator_symbol,
        "::",
        $.function_definition,
      ),
      
  
    block_end: $ => "}",

    data_scope: $ => seq(
      '{',
      repeat($._statement),
      $.block_end,
    ),

    imperative_scope: $ => seq(
      '{',
      repeat($._statement),
      $.block_end,
    ),


    deprecated_directive: $ => prec.left(seq(
      "#deprecated",
      optional($.string_literal),
    )),

    trailing_directive: $ =>choice(
      $.foreign_directive,
      $.deprecated_directive,
      token(choice(
      "#c_call",
      "#expand",
      "#compiler",
      "#no_abc",
      "#symmetric",
      "#runtime_support",
      "#intrinsic",
      "#modify",
      "#no_alias",
      ))
      
      ),
  
      code_directive: $ => prec.left( seq( 
        "#code",
        choice($._expression, $.imperative_scope, $._named_decl_expression) // you can probably put a lot of other things here.
      )),

    names: $ => CommaSep1($.identifier), // can this be identifiers??


    variable_initializer: $ => seq(
      optional($._expression), 
      seq(
        "=", 
        CommaSep1($._expression)),
    ),

    const_initializer: $ => seq(
      optional($._expression), 
      seq(
        ":", 
        CommaSep1($._expression)),
    ),


    _variable_initializer_single: $ => prec.right(seq(
      optional($._expression), 
      seq(
        "=", 
        $._expression),
    )),

    _const_initializer_single: $ => prec.right(seq(
      optional($._expression), 
      seq(
        ":", 
        $._expression),
    )),

    named_decl: $ => prec(1, seq(
      $.names,
      ":",
      choice(
        seq($._expression, ";"),
        seq($.variable_initializer, ";"),
        seq($.const_initializer, ";"),
        seq(choice(":","="), $._expression_with_block),
      )
    )),

    using_expression: $ => seq( // precedence over unary using
      "using",
        $._named_decl_expression,
    ),

    using_statement: $ => seq( // precedence over unary using
      "using",
      choice(
        $.named_decl,
        $._expression_statement,
      )
    ),

    _assignment_operator: $=> token(choice(
          "=", 
          "+=",
          "-=",
          "/=",
          "*=",
          "|=",
          "&=",
          "~=",
          "^=",
          "%=",
      )),

    assignment_statement: $ => seq(
      CommaSep1($._expression),
      $._assignment_operator, 
      CommaSep1($._expression),
      ";"
      ),

    
    defer_statement: $ => seq(
      "defer",
      $._statement,
    ),


    case_statement: $ => seq(
      "case",
      optional($._expression),
      ";",
    ),

    continue_statement: $ => seq(
      "continue",
      optional($._expression), 
      ";"
      ),

    switch_statement: $ => prec(1, seq(
      "if",
      optional("#complete"),
      $.switch,
    )),

    empty_statement: $ => ";",

    push_context_statement: $ => seq(
      "push_context",
      $._expression,
      $._statement,
    ),

    named_return: $ => seq(
      $.identifier,
      "=",
      $._expression,
    ),

    return_statement: $ => seq(
      'return',
      CommaSep(choice($._expression, $.named_return)),
      ';'
    ),

    break_statement: $ => seq(
      'break',
      optional($._expression),
      ';'
    ),

    relative_pointer: $ =>prec.left(seq(
      "*~",
      $._expression
    )),


  

    run_statement: $ => prec(1, seq(
      token(choice("#run", "#run_and_insert", "#add_context")),
      $._statement,
    )),

    operator_like_directive: $ => token(choice(
      "#type",
      "#import",
      "#foreign_library",
      "#foreign_system_library",
      "#char",
      "#bake_arguments",
      "#run",
      "#insert_internal",
      "#place",
      "#placeholder",
    )),

      pointer_to: $ => "*",

    _unary_operator_left: $ => choice(
      "-", "+", "!", "<<", "~", "xx", "xx,no_check", 
      "inline", "..", ".", "$",
      $.pointer_to,
      $.array_decl,
      $.relative_pointer,
      $.operator_like_directive,
     ),


    unary_expression: $ =>prec.right( seq(
      $._unary_operator_left, 
      $._expression
    )),
      

    // the things that can go into member access is:
    // identifier
    // subscript
    // function call
    // ((Cursor*)(100 + 100))->Child();
    // basically the thing directly to the right of . is ALWAYS an identifier.

    _subscript_rhs: $ => prec(4, seq(
      "[",
      $._expression,
      "]"
    )),

    _member_access_rhs: $ => prec.left(4, seq(
      ".", $.identifier
    )),

    member_access: $ => prec.left(4,  seq($._expression, $._member_access_rhs)),
    member_access_nothing: $ => prec(4,  seq($._expression, '.', choice(" ", "\n"))),
    subscript: $ => prec.left(4, seq($._expression, $._subscript_rhs)),
    switch: $ => prec.right( seq( $._expression, "==", $.imperative_scope)),

    foreign_directive: $ => prec.left(seq(
      "#foreign",
      optional(
        seq(
          $.identifier,
          optional($.string_literal)
          ),
    ))),


    binary_expression: $ => choice(
      
      $.switch,
      prec.left(3, seq($._expression, '/interface', $._expression)),
      prec.left(3, seq($._expression, '#align', $._expression)),
      prec.left(3, seq($._expression, '==', $._expression)),
      prec.left(3, seq($._expression, '!=', $._expression)),
      prec.left(3, seq($._expression, '||', $._expression)),
      prec.left(3, seq($._expression, '&&', $._expression)),
      prec.left(3, seq($._expression, '>', $._expression)),
      prec.left(3, seq($._expression, '<', $._expression)),
      prec.left(3, seq($._expression, '>=', $._expression)),
      prec.left(3, seq($._expression, '<=', $._expression)),
      prec.left(2, seq($._expression, '<<<', $._expression)),
      prec.left(2, seq($._expression, '>>>', $._expression)),
      prec.left(2, seq($._expression, '&', $._expression)),
      prec.left(2, seq($._expression, '|', $._expression)),
      prec.left(2, seq($._expression, '^', $._expression)),
      prec.left(2, seq($._expression, '<<', $._expression)),
      prec.left(2, seq($._expression, '>>', $._expression)),
      prec.left(2, seq($._expression, '*', $._expression)),
      prec.left(2, seq($._expression, '/', $._expression)),
      prec.left(2, seq($._expression, '%', $._expression)),
      prec.left(1, seq($._expression, '+', $._expression)),
      prec.left(1, seq($._expression, '-', $._expression)),
      // ...
    ),

    module_parameters: $ =>seq(
      "#module_parameters",
      $._parameter_list,
      ";"
    ),

    module_scope_directive: $ =>
      '#scope_module',

    while_loop: $ =>seq(
      "while",
      $._expression,
      $._statement
    ),

    range: $ => prec.right(seq(
      $._expression,
      optional(
        seq('..', $._expression))
      )),

    for_specifier: $=>prec.left( 6,
      seq(
        choice("<", "*"),
        optional(seq("=", $._expression))
    )),

    for_loop: $ => seq(
      "for",
      repeat($.for_specifier),
      optional(seq(
         seq(optional("`"), CommaSep1($.identifier)),
          ":")),
      $.range,
      $._statement,
    ),


    ternary_expression: $ => prec.left(seq(
      "ifx",
      $._expression,
      "then",
      $._expression,
      "else",
      $._expression,
    )),

    cast_expression: $ => prec.left(seq(
      "cast",
      repeat(choice(",no_check", ",trunc")),
      "(",
      $._expression,
      ")",
      $._expression
    )),

    if_directive: $ => prec.left(seq(
      "#if",
      $._expression,
      $._statement,
      optional($.else_statement)),
    ),

    if_statement: $ => prec.left(seq(
      "if",
      $._expression,
      optional("then"),
      $._statement,
      optional($.else_statement),
    )),

    else_statement: $ => seq(
      "else",
      $._statement
    ),

    _load_directive: $ => seq(
    "#load",
    $.string_literal,
    ),

    load_statement: $ => seq(
      $._load_directive,
      ";"
    ),


    spicy_insert_statements: $ =>prec.left(seq(
      $.identifier,
      "=",
      
      repeat( choice(
         /./, 
        seq("(", repeat(/./), ")" )
        ))
    )),

    spicy_insert: $ => prec.left(8, seq(
      "#insert",
      optional(seq(
        "(",
          CommaSep($.spicy_insert_statements),
        ")",
      )),
      $._expression
    )),


    array_literal: $ => seq(
      "{",
        ":",
        $._expression,
        ":",
        CommaSep($._expression),
        optional(","),
      "}"
    ),


    program_export : $ =>prec(1, seq(
      "#program_export",
      optional($.string_literal),
      $.named_decl
    )),


    note: $ => prec.right(choice(
      choice($.note_with_args, $.note_simple)
    )),

    note_simple: $ => /@[a-zA-Z_][a-zA-Z_0-9]*/,
    note_with_args: $ => token(seq(
      /@[a-zA-Z_][a-zA-Z_0-9]*/,
      "(",
      repeat(/./),
      ")",
    )),

    identifier: $ => /[a-zA-Z_][a-zA-Z_0-9\\]*/,

    number: $ => /\d[\d_]*|0(h|x|X)[a-fA-F0-9_]+|0b[01_]+/,
    float_literal: $ =>/\d[\d_]*\.\d[\d_]*|\.\d[\d_]*/,

    scientific_notation: $ => token(seq(
      /\d[\d_]*\.\d+|\d[\d_]*|\.\d[\d_]*|0(h|x|X)[a-fA-F0-9_]+|0b[01_]+/,
      choice("e", "E"),
      optional(choice("+","-")),
      /\d[\d_]*\.\d+|\d[\d_]*|\.\d[\d_]*|0(h|x|X)[a-fA-F0-9_]+|0b[01_]+/,
      ))
  }
}
);

function CommaSep(rule) {
return optional(CommaSep1(rule))
}

function CommaSep1(rule) {
return seq(
  rule,
  repeat(seq(
    ',',
    rule
  ))
)
}
