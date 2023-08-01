import { Component, For, Index, JSX } from "solid-js";
import { FreeNode } from "../lib/solver/input";

export interface InputsProps<I> {
  value: I;
  bindings: Record<string, number>;
  setBindings(key: string, value: number | null): void;
}

export const Inputs: Component<InputsProps<FreeNode[]>> = (props) => {
  return (
    <div class="flex flex-col gap-4">
      <Index each={props.value}>
        {(input) => (
          <InputCard
            value={input()}
            bindings={props.bindings}
            setBindings={props.setBindings}
          />
        )}
      </Index>
    </div>
  );
};

const InputCard: Component<InputsProps<FreeNode>> = (props) => {
  const onKeyUp: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = (
    e
  ) => {
    if (e.currentTarget.value != null && e.currentTarget.value !== "") {
      const parsed = parseFloat(e.currentTarget.value);
      if (!isNaN(parsed)) {
        props.setBindings(props.value.symbol, parsed);
        return;
      }
    }

    props.setBindings(props.value.symbol, null);
  };

  return (
    <div class="flex gap-2">
      <label>{props.value.symbol}</label> =
      <input
        class="border border-zinc-200 rounded"
        type="number"
        onKeyUp={onKeyUp}
      ></input>
    </div>
  );
};
