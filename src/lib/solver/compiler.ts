import { ASTExpression, ASTNodeType, BinOpNode, SymNode } from "../ast";
import { Equations } from "../parser";
import {
  BoundNode,
  CalculationType,
  DependentNode,
  FreeNode,
  SolverNode,
} from "./input";

class Counter {
  private counter: number = 0;

  next(): string {
    return (this.counter++).toString(16);
  }
}

export const compile = (equations: Equations): SolverNode[] => {
  const freeVariables = new Set<string>();

  for (const rhs of Object.values(equations)) {
    for (const ref of rhs.references()) {
      freeVariables.add(ref);
    }
  }

  for (const lhs of Object.keys(equations)) {
    freeVariables.delete(lhs);
  }

  const ctx = new CompilerCtx();

  for (const free of freeVariables) {
    ctx.addFreeVariable(free);
  }

  for (const rhs of Object.values(equations)) {
    ctx.addExpression(rhs);
  }

  for (const [lhs, rhs] of Object.entries(equations)) {
    ctx.addBinding(lhs, rhs);
  }

  return ctx.output;
};

class CompilerCtx {
  public output: SolverNode[] = [];
  private ssaTable = new Map<ASTExpression, string>();
  private readonly freeTable = new Map<string, FreeNode>();
  private readonly counter = new Counter();
  private readonly referenceTable = new Map<string, DependentNode>();
  constructor() {}

  addFreeVariable(symbol: string) {
    if (!this.freeTable.has(symbol)) {
      const node = new FreeNode(symbol);
      this.output.push(node);
      this.freeTable.set(symbol, node);
    }
  }

  addExpression(rhs: ASTExpression) {
    const val = rhs.constEval();
    if (val != null) {
      return this.addConst(rhs, val);
    }

    switch (rhs.type) {
      case ASTNodeType.Sym:
        return this.addRef(rhs);
      case ASTNodeType.Const:
        return this.addConst(rhs, rhs.value);
      case ASTNodeType.Mul:
      case ASTNodeType.Add:
      case ASTNodeType.Sub:
      case ASTNodeType.Div:
        return this.addBinOp(rhs);
    }
  }

  addRef(rhs: SymNode): string {
    const ref = this.referenceTable.get(rhs.value);
    if (ref) {
      return ref.symbol;
    }

    const sym = `ref-${rhs.value}-${this.counter.next()}`;
    this.ssaTable.set(rhs, sym);
    const node = new DependentNode(sym, {
      type: CalculationType.Ref,
      dependencies: rhs.value,
    });

    this.output.push(node);
    this.referenceTable.set(rhs.value, node);

    return sym;
  }

  addConst(rhs: ASTExpression, value: number): string {
    const sym = `const-${this.counter.next()}`;
    this.ssaTable.set(rhs, sym);
    this.output.push(new BoundNode(sym, value));
    return sym;
  }

  addBinOp(rhs: BinOpNode): string {
    const sym = `math-${this.counter.next()}`;
    this.ssaTable.set(rhs, sym);

    let t: Exclude<CalculationType, CalculationType.Ref>;

    switch (rhs.type) {
      case ASTNodeType.Mul:
        t = CalculationType.Mul;
        break;
      case ASTNodeType.Add:
        t = CalculationType.Add;
        break;
      case ASTNodeType.Sub:
        t = CalculationType.Sub;
        break;
      case ASTNodeType.Div:
        t = CalculationType.Div;
        break;
    }

    this.output.push(
      new DependentNode(sym, {
        type: t,
        dependencies: [
          this.addExpression(rhs.left),
          this.addExpression(rhs.right),
        ],
      })
    );

    return sym;
  }

  addBinding(lhs: string, rhs: ASTExpression) {
    const sym = this.ssaTable.get(rhs);
    if (!sym) {
      throw new Error("symbol not found, this should never happen");
    }

    this.output.push(
      new DependentNode(lhs, {
        type: CalculationType.Ref,
        dependencies: sym,
      })
    );
  }
}
