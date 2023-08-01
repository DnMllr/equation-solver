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
      const next = input[i].attemptBinding(bindings);
      keepGoing ||= next !== input[i];
      input[i] = next;

      if (input[i] instanceof BoundNode) {
        bindings.set(input[i].symbol, input[i] as BoundNode);
      }
    }
  }

  return {
    completed: allBound(input),
    result: input,
  };
};

const allBound = (input: SolverNode[]): boolean => {
  return input.reduce((l, r) => {
    return l && r instanceof BoundNode;
  }, true);
};
