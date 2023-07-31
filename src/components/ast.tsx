import { Component, For } from "solid-js";
import { Equations } from "../lib/parser";
import { ASTExpression } from "../lib/ast";
import { Equation } from "./ast-nodes";

export const AST: Component<{ ast: Equations }> = (props) => {
  const entries = () => {
    const entries = Object.entries(props.ast);
    entries.sort();
    return entries;
  };
  return (
    <div class="flex flex-col sm:flex-row gap-2 flex-wrap">
      <For each={entries()}>
        {(entry) => <ASTCard lhs={entry[0]} rhs={entry[1]} />}
      </For>
    </div>
  );
};

const ASTCard: Component<{ lhs: string; rhs: ASTExpression }> = (props) => {
  return (
    <div class="flex flex-col gap-1 border-2 border-slate rounded min-w-[6rem]">
      <div class="flex gap-2 border-b border-slate-200 p-2">
        <h2 class="bold">{props.lhs}</h2>
        <span>=</span>
      </div>
      <div class="flex items-center justify-center grow p-2">
        <Equation value={props.rhs} depth={0} />
      </div>
    </div>
  );
};
