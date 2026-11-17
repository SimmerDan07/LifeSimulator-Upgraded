"""javalang with a fix: parenthesized expressions become their own node,
so selectors / prefix / postfix operators after ')' are not lost or clobbered."""
import javalang
from javalang import tree, parser

class Parenthesized(tree.Primary):
    attrs = ("expression",)

def _parse_par_expression(self):
    self.accept('(')
    expression = self.parse_expression()
    self.accept(')')
    return Parenthesized(expression=expression)

parser.Parser.parse_par_expression = _parse_par_expression

class Initializer(tree.Declaration):
    attrs = ("static", "statements")

def _parse_class_body_declaration(self):
    if self.try_accept(';'):
        return None
    elif self.would_accept('static', '{'):
        self.accept('static')
        return Initializer(static=True, statements=self.parse_block())
    elif self.would_accept('{'):
        return Initializer(static=False, statements=self.parse_block())
    return self.parse_member_declaration()

parser.Parser.parse_class_body_declaration = _parse_class_body_declaration

def parse(src):
    return javalang.parse.parse(src)
