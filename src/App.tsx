import { Component, Show, children, ParentComponent } from "solid-js";

import { Ctrl, createSolverUIState } from "./lib/state";
import { AST } from "./components/ast";
import { Inputs } from "./components/solver-input";
import { Outputs } from "./components/solver-output";

const App: Component = () => {
  const solver = createSolverUIState();
  solver.attemptSolve();

  return (
    <Frame>
      <TextRow>
        <TextInput app={solver} />
        <ParseTree app={solver} />
      </TextRow>
      <SolverRow>
        <Input app={solver} />
        <Output app={solver} />
      </SolverRow>
    </Frame>
  );
};

const Frame: ParentComponent = (props) => {
  const c = children(() => props.children);
  return (
    <div class="p-8">
      <h1 class="text-2xl my-2 mb-4">Solver</h1>
      {c()}
    </div>
  );
};

const TextRow: ParentComponent = (props) => {
  const c = children(() => props.children);
  return (
    <div class="flex gap-2 flex-wrap items-stretch justify-around mb-2">
      {c()}
    </div>
  );
};

const TextInput: Component<{ app: Ctrl }> = (props) => {
  return (
    <div class="flex flex-col border-2 border-slate-100 rounded p-8 grow">
      <h2 class="text-xl my-2 mb-4 ">Equations</h2>
      <textarea
        class="overflow-hidden flex-grow rounded border-2 h-32 border-zinc-200"
        value={props.app.text()}
        onKeyUp={(e) => {
          props.app.setText(e.currentTarget.value);
          props.app.setRules(e.currentTarget.value);
        }}
      ></textarea>
      <div
        class={
          props.app.parseTree.error
            ? "mt-2 border-2 rounded bg-red-100 border-red-500"
            : ""
        }
      >
        <Show when={props.app.parseTree.error}>
          {(error) => error().message}
        </Show>
      </div>
    </div>
  );
};

const ParseTree: Component<{ app: Ctrl }> = (props) => {
  return (
    <div class="border-2 border-slate-100 rounded p-8 grow">
      <h2 class="mb-4 text-xl">Parse Tree</h2>
      <AST ast={props.app.parseTree.tree} />
    </div>
  );
};

const SolverRow: ParentComponent = (props) => {
  const c = children(() => props.children);
  return <div class="flex gap-2 flex-col sm:flex-row">{c()}</div>;
};

const Input: Component<{ app: Ctrl }> = (props) => {
  return (
    <div class="mt-8 my-2 border-2 border-slate-100 rounded p-8">
      <h2 class="mb-4 text-xl">Inputs</h2>
      <Inputs
        value={props.app.solverInput.freeVariables}
        bindings={props.app.solverInput.bindings}
        setBindings={(key, value) => {
          props.app.setSolverInput("bindings", key, value);
          props.app.attemptSolve();
        }}
      />
    </div>
  );
};

const Output: Component<{ app: Ctrl }> = (props) => {
  return (
    <div class="mt-8 my-2 border-2 border-slate-100 rounded p-8">
      <h2 class="mb-4 text-xl">Outputs</h2>
      <Outputs
        outputs={props.app.solution.result}
        freeVariables={props.app.solverInput.freeVariables}
        ast={props.app.parseTree.tree}
      />
    </div>
  );
};

export default App;
