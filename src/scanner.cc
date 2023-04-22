#include <vector>
#include <tree_sitter/parser.h>
#include <assert.h>

enum TokenType
{
    here_string_literal
};


extern "C" void * tree_sitter_jai_external_scanner_create() 
{
    return NULL;
}

extern "C" void tree_sitter_jai_external_scanner_destroy(void *payload) {
 
    
}

extern "C" unsigned tree_sitter_jai_external_scanner_serialize(void *payload, char *buffer) 
{
    return 0;
}

extern "C" void tree_sitter_jai_external_scanner_deserialize(void *payload, const char *buffer, unsigned length) {
    
}

static bool IsWhitespace(int32_t character)
{
    return character == ' ' || character ==  '\t' || character == '\r' || character == '\n';
}

static void SkipWhitespace(TSLexer* lexer)
{
    while (IsWhitespace(lexer->lookahead))
        lexer->advance(lexer, true);
}

extern "C" bool tree_sitter_jai_external_scanner_scan(void* payload, TSLexer * lexer, const bool* valid_symbols)
{
    /*
    if (!valid_symbols[here_string])
        return false;


    if (lexer->eof(lexer))
    {
        return false;
    }

    */

    // first try to match #string
    static const char* hashString = "#string";
    

    int startMatchIndex = 0;
    SkipWhitespace(lexer);

    while (startMatchIndex != 7)
    {
        if (lexer->lookahead == hashString[startMatchIndex])
        {
            lexer->advance(lexer, false);
            startMatchIndex++;
        }
        else
        {
            return false;
        }
    }

    // matched #string... now we need to make sure we have a space after #string
    if (!IsWhitespace(lexer->lookahead))
        return false;

    // skip the whitespace
    SkipWhitespace(lexer);

    std::vector<int32_t> terminator;

    while (!IsWhitespace(lexer->lookahead))
    {
        terminator.push_back(lexer->lookahead);
        lexer->advance(lexer, false);
        if (lexer->eof(lexer))
        {
            return false;
        }
    }

    // now match the terminator
    int matchCursor = 0;

    while (!lexer->eof(lexer))
    {
        if (lexer->lookahead == terminator[matchCursor])
        {
            matchCursor++;
        }
        else
        {
            matchCursor = 0;
        }
       
        if (matchCursor == terminator.size())
        {
            lexer->advance(lexer, false);
            lexer->mark_end(lexer);
            lexer->result_symbol = here_string_literal;
            return true;
        }

        lexer->advance(lexer, false);
    }
        
    //eof
    return false;
}
