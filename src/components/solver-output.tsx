import {
  Component,
  Index,
  Match,
  ParentComponent,
  Show,
  Switch,
  children,
} from "solid-js";
import { Equations } from "../lib/parser";
import {
  Calculation,
  CalculationType,
  DependentNode,
  FreeNode,
  InputNodeType,
  SolverNode,
} from "../lib/solver/input";
import { OpSymbol } from "./ast-nodes";
import { ASTNodeType } from "../lib/ast";

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
    <div class="flex gap-8 flex-wrap text-sm">
      <Index each={values()}>
        {(node) => (
          <div
            class={
              "transition-all hover:opacity-100 " +
              (isImportant(node().symbol) ? "" : "opacity-20")
            }
          >
            <OutputType node={node()} />
            <div class={styleNode(node())}>
              <NodeTitle node={node()} />
              <NodeContent node={node()} />
            </div>
          </div>
        )}
      </Index>
    </div>
  );
};

const NodeTitle: Component<{ node: SolverNode }> = (props) => {
  return (
    <h2 class={"py-2 px-4 border-b-2 " + colors(props.node.type)}>
      {props.node.symbol}
    </h2>
  );
};

const OutputType: Component<{ node: SolverNode }> = (props) => {
  return (
    <div class="text-xs flex justify-between">
      <Switch>
        <Match when={props.node.type === InputNodeType.Bound}>
          <div>Bound</div>
        </Match>
        <Match when={props.node.type === InputNodeType.Free}>
          <div>Free</div>
        </Match>
        <Match when={props.node.type === InputNodeType.Dependent}>
          <div>Dependent</div>
          <Title type={(props.node as DependentNode).calculation.type} />
        </Match>
      </Switch>
    </div>
  );
};

const NodeContent: Component<{ node: SolverNode }> = (props) => {
  return (
    <Switch>
      <Match
        when={props.node.type === InputNodeType.Bound ? props.node : false}
      >
        {(node) => <NodeValue>{node().value.toFixed(2)}</NodeValue>}
      </Match>
      <Match
        when={props.node.type === InputNodeType.Dependent ? props.node : false}
      >
        {(output) => <Card calculation={output().calculation} />}
      </Match>
      <Match when={props.node.type === InputNodeType.Free}>
        <NodeValue>Requires Input</NodeValue>
      </Match>
    </Switch>
  );
};

const NodeValue: ParentComponent = (props) => {
  const c = children(() => props.children);
  return (
    <div class="text-xl px-2 py-4 flex flex-col grow justify-center items-center">
      {c()}
    </div>
  );
};

const Card: Component<{ calculation: Calculation }> = (props) => {
  return (
    <Dependencies calculation={props.calculation}>
      <Operator type={props.calculation.type} />
    </Dependencies>
  );
};

const Title: Component<{ type: CalculationType }> = (props) => {
  return (
    <div>
      <Switch>
        <Match when={props.type === CalculationType.Ref}>Ref</Match>
        <Match when={props.type === CalculationType.Div}>Div</Match>
        <Match when={props.type === CalculationType.Mul}>Mul</Match>
        <Match when={props.type === CalculationType.Add}>Add</Match>
        <Match when={props.type === CalculationType.Sub}>Sub</Match>
      </Switch>
    </div>
  );
};

const Operator: Component<{ type: CalculationType }> = (props) => {
  return (
    <div class="flex justify-center items-center">
      <Switch>
        <Match when={props.type === CalculationType.Ref}>&</Match>
        <Match when={props.type === CalculationType.Div}>
          <OpSymbol type={ASTNodeType.Div} />
        </Match>
        <Match when={props.type === CalculationType.Mul}>
          <OpSymbol type={ASTNodeType.Mul} />
        </Match>
        <Match when={props.type === CalculationType.Add}>
          <OpSymbol type={ASTNodeType.Add} />
        </Match>
        <Match when={props.type === CalculationType.Sub}>
          <OpSymbol type={ASTNodeType.Sub} />
        </Match>
      </Switch>
    </div>
  );
};

const Dependencies: ParentComponent<{ calculation: Calculation }> = (props) => {
  const c = children(() => props.children);
  return (
    <div class="flex grow flex-col justify-center items-stretch gap-2 text-lg px-4 py-2">
      <Show
        when={props.calculation.type !== CalculationType.Ref}
        fallback={
          <div class="flex flex-row justify-center items-center">
            {c()} {props.calculation.dependencies}
          </div>
        }
      >
        <div class="flex items-center justify-start">
          {props.calculation.dependencies[0]}
        </div>
        {c()}
        <div class="flex items-center justify-end">
          {props.calculation.dependencies[1]}
        </div>
      </Show>
    </div>
  );
};

const styleNode = (output: SolverNode): string => {
  return (
    "flex flex-col rounded border-2 w-44 h-48 transition-all " +
    colors(output.type)
  );
};

const colors = (t: InputNodeType): string => {
  switch (t) {
    case InputNodeType.Bound:
      return " border-green-500 bg-green-100 ";
    case InputNodeType.Free:
      return " border-red-500 bg-red-100 ";
    case InputNodeType.Dependent:
      return " border-zinc-200 bg-zinc-100 ";
  }
};
