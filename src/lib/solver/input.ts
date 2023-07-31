export enum InputNodeType {
  Dependent,
  Bound,
  Free,
}

interface IInputNode<T extends InputNodeType> {
  readonly type: T;
  readonly symbol: string;
}

interface IDependentNode extends IInputNode<InputNodeType.Dependent> {
  readonly calculation: Calculation;
}

interface IBoundNode extends IInputNode<InputNodeType.Bound> {}
interface IFreeNode extends IInputNode<InputNodeType.Free> {}

export type SolverNode = DependentNode | BoundNode | FreeNode;

abstract class Bindable {
  abstract attemptBinding(bindings: Bindings): BoundNode | this;
}

export class DependentNode extends Bindable implements IDependentNode {
  public readonly type: InputNodeType.Dependent = InputNodeType.Dependent;
  constructor(
    public readonly symbol: string,
    public readonly calculation: Calculation
  ) {
    super();
  }

  attemptBinding(bindings: Bindings): this | BoundNode {
    if (this.calculation.type === CalculationType.Ref) {
      const binding = bindings.get(this.calculation.dependencies);
      if (binding != null) {
        return new BoundNode(this.symbol, binding.value);
      }
    } else {
      const [head, ...tail] = this.calculation.dependencies;
      const init = bindings.get(head);
      if (init == null) {
        return this;
      }

      let l = init.value;

      for (const dep of tail) {
        const r = bindings.get(dep);
        if (r == null) {
          return this;
        }

        switch (this.calculation.type) {
          case CalculationType.Add:
            l += r.value;
            break;
          case CalculationType.Sub:
            l -= r.value;
            break;
          case CalculationType.Mul:
            l *= r.value;
            break;
          case CalculationType.Div:
            l /= r.value;
            break;
        }
      }

      return new BoundNode(this.symbol, l);
    }
    return this;
  }
}

export class BoundNode extends Bindable implements IBoundNode {
  public readonly type: InputNodeType.Bound = InputNodeType.Bound;
  constructor(public readonly symbol: string, public readonly value: number) {
    super();
  }

  attemptBinding(bindings: Bindings): BoundNode | this {
    return this;
  }
}

export class FreeNode extends Bindable implements IFreeNode {
  public readonly type: InputNodeType.Free = InputNodeType.Free;
  constructor(public readonly symbol: string) {
    super();
  }

  attemptBinding(bindings: Bindings): this | BoundNode {
    const binding = bindings.get(this.symbol);
    if (binding != null) {
      return new BoundNode(this.symbol, binding.value);
    }
    return this;
  }
}

export type Bindings = Map<string, BoundNode>;

export enum CalculationType {
  Ref,
  Add,
  Sub,
  Mul,
  Div,
}

interface ICalculation<T extends CalculationType> {
  type: T;
}

interface BinCalculation
  extends ICalculation<
    | CalculationType.Add
    | CalculationType.Sub
    | CalculationType.Mul
    | CalculationType.Div
  > {
  dependencies: string[];
}

interface RefCalculation extends ICalculation<CalculationType.Ref> {
  dependencies: string;
}

export type Calculation = BinCalculation | RefCalculation;
