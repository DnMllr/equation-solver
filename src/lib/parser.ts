import { Token } from "typescript-parsec";
import {
  buildLexer,
  expectEOF,
  expectSingleResult,
  rule,
} from "typescript-parsec";
import { alt, apply, kmid, lrec_sc, seq, str, tok } from "typescript-parsec";

import { ASTExpression, CNode, BinOpNode, SymNode, ASTNodeType } from "./ast";

export type Equations = {
  [lvalue: string]: ASTExpression;
};

enum TokenKind {
  Number,
  Symbol,
  Add,
  Sub,
  Mul,
  Div,
  LParen,
  RParen,
  Space,
}

const lexer = buildLexer([
  [true, /^\-?\d+(\.\d+)?/g, TokenKind.Number],
  [true, /^[a-zA-Z]+/g, TokenKind.Symbol],
  [true, /^\+/g, TokenKind.Add],
  [true, /^\-/g, TokenKind.Sub],
  [true, /^\*/g, TokenKind.Mul],
  [true, /^\//g, TokenKind.Div],
  [true, /^\(/g, TokenKind.LParen],
  [true, /^\)/g, TokenKind.RParen],
  [false, /^\s+/g, TokenKind.Space],
]);

function applyNumber(value: Token<TokenKind.Number>): CNode {
  return new CNode(+value.text);
}

function applySymbol(value: Token<TokenKind.Symbol>): SymNode {
  return new SymNode(value.text);
}

function applyBinary(
  first: ASTExpression,
  second: [Token<TokenKind>, ASTExpression]
): ASTExpression {
  switch (second[0].text) {
    case "+":
      return new BinOpNode(ASTNodeType.Add, first, second[1]);
    case "-":
      return new BinOpNode(ASTNodeType.Sub, first, second[1]);
    case "*":
      return new BinOpNode(ASTNodeType.Mul, first, second[1]);
    case "/":
      return new BinOpNode(ASTNodeType.Div, first, second[1]);
    default:
      throw new Error(`Unknown binary operator: ${second[0].text}`);
  }
}

const TERM = rule<TokenKind, ASTExpression>();
const FACTOR = rule<TokenKind, ASTExpression>();
const EXP = rule<TokenKind, ASTExpression>();

TERM.setPattern(
  alt(
    apply(tok(TokenKind.Number), applyNumber),
    apply(tok(TokenKind.Symbol), applySymbol),
    kmid(str("("), EXP, str(")"))
  )
);

FACTOR.setPattern(
  lrec_sc(TERM, seq(alt(str("*"), str("/")), TERM), applyBinary)
);

EXP.setPattern(
  lrec_sc(FACTOR, seq(alt(str("+"), str("-")), FACTOR), applyBinary)
);

export const parse = (expr: string): Equations => {
  const equations = expr
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => {
      const [l, r] = line.split("=");
      const ast: ASTExpression = expectSingleResult(
        expectEOF(EXP.parse(lexer.parse(r)))
      );
      return [l.trim(), ast] as [string, ASTExpression];
    });

  return equations.reduce(
    (obj, [l, r]) => ({
      ...obj,
      [l]: r,
    }),
    {}
  );
};
