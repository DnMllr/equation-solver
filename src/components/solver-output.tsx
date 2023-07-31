import { Component, For, Match, Show, Switch } from "solid-js";
import { Equations } from "../lib/parser";
import {
  CalculationType,
  DependentNode,
  FreeNode,
  InputNodeType,
  SolverNode,
} from "../lib/solver/input";

export interface OutputsProps {
  outputs: SolverNode[];
  ast: Equations;
  freeVariables: FreeNode[];
}

export const Outputs: Component<OutputsProps> = (props) => {
  const isImportant = (symbol: string) => {
    const importantObjects = new Set(
      Object.keys(props.ast).concat(props.freeVariables.map((n) => n.symbol))
    );
    return importantObjects.has(symbol);
  };

  const values = () => {
    const importantOutputs = props.outputs.filter((o) => isImportant(o.symbol));
    const otherOutputs = props.outputs.filter((o) => !isImportant(o.symbol));
    importantOutputs.sort((a, b) => {
      return a.symbol.localeCompare(b.symbol);
    });
    return importantOutputs.concat(otherOutputs);
  };

  return (
    <div class="flex gap-8 flex-wrap">
      <For each={values()}>
        {(node) => (
          <div class={styleNode(node, isImportant(node.symbol))}>
            <NodeTitle node={node} />
            <NodeContent node={node} />
          </div>
        )}
      </For>
    </div>
  );
};

const NodeTitle: Component<{ node: SolverNode }> = (props) => {
  return (
    <div class="text-sm">
      <OutputType type={props.node.type} />
      <h2 class="text-lg p-2 rounded border-black border-2">
        {props.node.symbol}
      </h2>
    </div>
  );
};

const OutputType: Component<{ type: InputNodeType }> = (props) => {
  return (
    <Switch>
      <Match when={props.type === InputNodeType.Bound}>Bound Variable</Match>
      <Match when={props.type === InputNodeType.Free}>Free Variable</Match>
      <Match when={props.type === InputNodeType.Dependent}>
        Computed Variable
      </Match>
    </Switch>
  );
};

const NodeContent: Component<{ node: SolverNode }> = (props) => {
  return (
    <div class="flex flex-col justify-center items-center">
      <Show when={props.node.type === InputNodeType.Bound ? props.node : false}>
        {(node) => (
          <div>
            <div class="text-sm">Value:</div>
            <div>{node().value.toFixed(2)}</div>
          </div>
        )}
      </Show>

      <Show
        when={props.node.type === InputNodeType.Dependent ? props.node : false}
      >
        {(output) => <Calculation node={output()} />}
      </Show>

      <Show when={props.node.type === InputNodeType.Free}>Requires Input</Show>
    </div>
  );
};

const Calculation: Component<{ node: DependentNode }> = (props) => {
  return (
    <Switch>
      <Match when={props.node.calculation.type === CalculationType.Add}>
        <div class="text-sm">
          <div>Add Node</div>
          <div class="grow flex flex-col justify-center items-center">
            <div>{props.node.calculation.dependencies[0]}</div>
            <div>+</div>
            <div>{props.node.calculation.dependencies[1]}</div>
          </div>
        </div>
      </Match>
      <Match when={props.node.calculation.type === CalculationType.Sub}>
        <div>
          <div class="text-sm">Sub Node</div>
          <div class="flex flex-col justify-center items-center">
            <div>{props.node.calculation.dependencies[0]}</div>
            <div>-</div>
            <div>{props.node.calculation.dependencies[1]}</div>
          </div>
        </div>
      </Match>
      <Match when={props.node.calculation.type === CalculationType.Mul}>
        <div class="text-sm">
          <div>Mul Node</div>
          <div class="flex flex-col justify-center items-center">
            <div>{props.node.calculation.dependencies[0]}</div>
            <div>*</div>
            <div>{props.node.calculation.dependencies[1]}</div>
          </div>
        </div>
      </Match>
      <Match when={props.node.calculation.type === CalculationType.Div}>
        <div class="text-sm">
          <div>Div Node</div>
          <div class="flex flex-col justify-center items-center">
            <div>{props.node.calculation.dependencies[0]}</div>
            <div>/</div>
            <div>{props.node.calculation.dependencies[1]}</div>
          </div>
        </div>
      </Match>
      <Match when={props.node.calculation.type === CalculationType.Ref}>
        <div class="text-sm">
          <div>Ref Node</div>
          <div class="flex justify-center items-center gap-2">
            <div>→</div>
            <div>{props.node.calculation.dependencies}</div>
          </div>
        </div>
      </Match>
    </Switch>
  );
};

const styleNode = (output: SolverNode, isImportant: boolean): string => {
  let classes = "flex flex-col justify-between rounded border-2 p-4 w-44 h-48 ";
  switch (output.type) {
    case InputNodeType.Bound:
      classes += " border-green-500 bg-green-100 ";
      break;
    case InputNodeType.Free:
      classes += " border-red-500 bg-red-100 ";
      break;
    case InputNodeType.Dependent:
      classes += " border-zinc-200 bg-zinc-100 ";
      break;
  }

  if (!isImportant) {
    classes += " opacity-20 ";
  }

  return classes;
};
