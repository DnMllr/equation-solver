import { Bindings, BoundNode, FreeNode, SolverNode } from "./input";

export const findFreeVariables = (input: SolverNode[]): FreeNode[] => {
  return (input.filter((i) => i instanceof FreeNode) as FreeNode[]).sort(
    (a, b) => a.symbol.localeCompare(b.symbol)
  );
};

export interface SolveResult {
  completed: boolean;
  result: SolverNode[];
}

export const solve = (input: SolverNode[], bindings: Bindings): SolveResult => {
  let limit = 500;
  let keepGoing = true;

  while (limit-- > 0 && keepGoing) {
    keepGoing = false;
    for (let i = 0; i < input.length; i++) {
      input[i] = input[i].attemptBinding(bindings);
      if (input[i] instanceof BoundNode) {
        bindings.set(input[i].symbol, input[i] as BoundNode);
      } else {
        keepGoing = true;
      }
    }
  }

  if (limit <= 0) {
    return {
      completed: false,
      result: input,
    };
  }

  return {
    completed: true,
    result: input,
  };
};
