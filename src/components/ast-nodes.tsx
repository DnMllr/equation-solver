import { Component, Match, Switch } from "solid-js";
import {
  bgFromNumber,
  borderFromDepth,
  borderFromString,
  withColor,
} from "./colors";
import {
  ASTExpression,
  ASTNodeType,
  BinOpNode,
  CNode,
  SymNode,
} from "../lib/ast";
import {
  AiOutlineCloseCircle,
  AiOutlineMinusCircle,
  AiOutlinePlusCircle,
} from "solid-icons/ai";
import { FiDivideCircle } from "solid-icons/fi";

export const Equation: Component<{ value: ASTExpression; depth: number }> = (
  props
) => {
  return (
    <Switch
      fallback={<OpNode node={props.value as BinOpNode} depth={props.depth} />}
    >
      <Match when={props.value.type === ASTNodeType.Sym ? props.value : false}>
        {(value) => <SymbolASTNode symbol={value()} />}
      </Match>
      <Match
        when={props.value.type === ASTNodeType.Const ? props.value : false}
      >
        {(value) => <ConstNode constant={value()} />}
      </Match>
    </Switch>
  );
};

const SymbolASTNode: Component<{ symbol: SymNode }> = (props) => {
  return (
    <div
      class={withColor(
        "rounded px-2 border-2",
        borderFromString(props.symbol.value)
      )}
    >
      {props.symbol.value}
    </div>
  );
};

const ConstNode: Component<{ constant: CNode }> = (props) => {
  return (
    <div
      class={withColor(
        "rounded border-2 border-slate-500 px-2",
        bgFromNumber(props.constant.value)
      )}
    >
      {props.constant.value}
    </div>
  );
};

const OpNode: Component<{ node: BinOpNode; depth: number }> = (props) => {
  return (
    <div class={"rounded border-2 p-1 " + borderFromDepth(props.depth)}>
      <h3 class="text-lg mb-2">
        <OpSymbol node={props.node} />
      </h3>
      <div class="flex gap-2 items-center">
        <Equation value={props.node.left} depth={props.depth + 1} />
        <Equation value={props.node.right} depth={props.depth + 1} />
      </div>
    </div>
  );
};

const OpSymbol: Component<{ node: BinOpNode }> = (props) => {
  return (
    <Switch>
      <Match when={props.node.type === ASTNodeType.Add}>
        <AiOutlinePlusCircle />
      </Match>
      <Match when={props.node.type === ASTNodeType.Sub}>
        <AiOutlineMinusCircle />
      </Match>
      <Match when={props.node.type === ASTNodeType.Div}>
        <FiDivideCircle />
      </Match>
      <Match when={props.node.type === ASTNodeType.Mul}>
        <AiOutlineCloseCircle />
      </Match>
    </Switch>
  );
};
