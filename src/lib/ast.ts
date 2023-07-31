export enum ASTNodeType {
  Sym,
  Const,
  Mul,
  Add,
  Sub,
  Div,
}

interface IASTNode<T extends ASTNodeType> {
  readonly type: T;
  isConst(): boolean;
  isBinOp(): boolean;
  constEval(): number | undefined;
  references(): string[];
}

interface ISymbolNode extends IASTNode<ASTNodeType.Sym> {
  readonly value: string;
}

interface IConstNode extends IASTNode<ASTNodeType.Const> {
  readonly value: number;
}

type BinOpType =
  | ASTNodeType.Mul
  | ASTNodeType.Add
  | ASTNodeType.Sub
  | ASTNodeType.Div;

interface IBinOpNode extends IASTNode<BinOpType> {
  readonly left: IASTExpression;
  readonly right: IASTExpression;
}

type IASTExpression = ISymbolNode | IConstNode | IBinOpNode;

export class SymNode implements ISymbolNode {
  public readonly type: ASTNodeType.Sym = ASTNodeType.Sym;
  constructor(public readonly value: string) {}

  isConst(): false {
    return false;
  }

  isBinOp(): boolean {
    return false;
  }

  constEval(): number | undefined {
    return undefined;
  }

  references(): string[] {
    return [this.value];
  }
}

export class CNode implements IConstNode {
  public readonly type: ASTNodeType.Const = ASTNodeType.Const;
  constructor(public readonly value: number) {}

  isConst(): true {
    return true;
  }

  isBinOp(): boolean {
    return false;
  }

  constEval(): number | undefined {
    return this.value;
  }

  references(): string[] {
    return [];
  }
}

export class BinOpNode implements IBinOpNode {
  constructor(
    public readonly type: BinOpType,
    public readonly left: ASTExpression,
    public readonly right: ASTExpression
  ) {}

  isConst(): boolean {
    return this.left.isConst() && this.right.isConst();
  }

  isBinOp(): true {
    return true;
  }

  constEval(): number | undefined {
    if (!this.isConst()) {
      return void 0;
    }

    switch (this.type) {
      case ASTNodeType.Mul:
        return this.left.constEval()! * this.right.constEval()!;
      case ASTNodeType.Add:
        return this.left.constEval()! + this.right.constEval()!;
      case ASTNodeType.Sub:
        return this.left.constEval()! - this.right.constEval()!;
      case ASTNodeType.Div:
        return this.left.constEval()! / this.right.constEval()!;
    }
  }

  references(): string[] {
    return this.left.references().concat(this.right.references());
  }
}

export type ASTExpression = BinOpNode | CNode | SymNode;
