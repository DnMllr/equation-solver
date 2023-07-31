import { Setter, Accessor, Signal, createSignal } from "solid-js";
import {
  SetStoreFunction,
  Store,
  createStore,
  reconcile,
} from "solid-js/store";
import { debounce } from "@solid-primitives/scheduled";

import { Equations, parse } from "./parser";

import { SolveResult, findFreeVariables, solve } from "./solver";
import { BoundNode, FreeNode, SolverNode } from "./solver/input";
import { compile } from "./solver/compiler";

const DEFAULT_EQUATIONS = `x = y * 2
y = z + z - p / 5
z = 12`;

interface ParseTreeStore {
  error: Error | null;
  tree: Equations;
}

interface SolverStore {
  input: SolverNode[];
  freeVariables: FreeNode[];
  bindings: Record<string, number>;
}

const createEquations = (): Signal<string> => {
  return createSignal(DEFAULT_EQUATIONS);
};

const createTreeStore = (
  tree: Equations
): [Store<ParseTreeStore>, SetStoreFunction<ParseTreeStore>] => {
  return createStore({
    error: null,
    tree,
  });
};

const createSolverStore = (
  nodes: SolverNode[]
): [Store<SolverStore>, SetStoreFunction<SolverStore>] => {
  return createStore({
    input: nodes,
    freeVariables: findFreeVariables(nodes),
    bindings: {},
  });
};

const createSolutionStore = (): [
  Store<SolveResult>,
  SetStoreFunction<SolveResult>
] => {
  return createStore({
    completed: true,
    result: [],
  });
};

export class Ctrl {
  public setRules: (e: string) => void;
  constructor(
    private setParseTree: SetStoreFunction<ParseTreeStore>,
    public parseTree: ParseTreeStore,
    public setSolverInput: SetStoreFunction<SolverStore>,
    public solverInput: SolverStore,
    private setSolution: SetStoreFunction<SolveResult>,
    public solution: SolveResult,
    public setText: Setter<string>,
    public text: Accessor<string>
  ) {
    this.setRules = debounce((e: string) => {
      console.log("parsing equations", e);
      let tree: Equations;
      try {
        tree = parse(e);
        this.setParseTree(reconcile({ error: null, tree: tree }));
        console.log("parsed", tree);
      } catch (error) {
        this.setParseTree("error", error);
        console.error("parsingError", error);
      }

      let input: SolverNode[];
      try {
        input = compile(tree);
        this.setSolverInput(
          reconcile({
            input,
            freeVariables: findFreeVariables(input),
            bindings: this.solverInput.bindings,
          })
        );
        console.log("compiled", input);
      } catch (error) {
        console.error("compiler error", error);
      }

      this.attemptSolve();
    }, 150);
  }

  attemptSolve() {
    const nextInput = this.solverInput.input.map((i) => i);
    const bindings = new Map();
    for (const [key, value] of Object.entries(this.solverInput.bindings)) {
      if (value != null) {
        bindings.set(key, new BoundNode(key, value));
      }
    }

    const result = solve(nextInput, bindings);
    this.setSolution(reconcile(result));
    console.log("solved", result);
  }
}

export const createSolverUIState = (): Ctrl => {
  // string input
  const [equations, setEquations] = createEquations();

  // ast
  const tree = parse(equations());
  const [parseTree, setParseTree] = createTreeStore(tree);

  // compile
  const input = compile(tree);
  const [solverInput, setSolverInput] = createSolverStore(input);

  // solve
  const [solution, setSolution] = createSolutionStore();

  return new Ctrl(
    setParseTree,
    parseTree,
    setSolverInput,
    solverInput,
    setSolution,
    solution,
    setEquations,
    equations
  );
};
