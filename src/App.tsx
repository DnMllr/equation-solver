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
    <div class="flex gap-2 flex-wrap items-stretch justify-around mb-1">
      {c()}
    </div>
  );
};

const TextInput: Component<{ app: Ctrl }> = (props) => {
  return (
    <Area title="Equations" class={["w-1/3"]}>
      <textarea
        class="overflow-hidden flex-grow rounded border-2 h-32 w-full border-zinc-200 block"
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
    </Area>
  );
};

const ParseTree: Component<{ app: Ctrl }> = (props) => {
  return (
    <Area title="Parse Tree" class={["grow"]}>
      <AST ast={props.app.parseTree.tree} />
    </Area>
  );
};

const SolverRow: ParentComponent = (props) => {
  const c = children(() => props.children);
  return <div class="flex gap-2 flex-col sm:flex-row">{c()}</div>;
};

const Input: Component<{ app: Ctrl }> = (props) => {
  return (
    <Area title="inputs">
      <Inputs
        value={props.app.solverInput.freeVariables}
        bindings={props.app.solverInput.bindings}
        setBindings={(key, value) => {
          props.app.setSolverInput("bindings", key, value);
          props.app.attemptSolve();
        }}
      />
    </Area>
  );
};

const Output: Component<{ app: Ctrl }> = (props) => {
  return (
    <Area title="Outputs">
      <Outputs
        outputs={props.app.solution.result}
        freeVariables={props.app.solverInput.freeVariables}
        ast={props.app.parseTree.tree}
      />
    </Area>
  );
};

const Area: ParentComponent<{ title: string; class?: string[] }> = (props) => {
  const c = children(() => props.children);
  return (
    <div
      class={`transition-all my-2 border-2 border-slate-100 rounded p-8 hover:shadow ${
        props.class ? props.class.join(" ") : ""
      }`}
    >
      <h2 class="mb-4 text-xl">{props.title}</h2>
      {c()}
    </div>
  );
};

export default App;
