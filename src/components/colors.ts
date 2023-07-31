const backgroundColors = [
  "bg-fuchsia-200",
  "bg-teal-200",
  "bg-lime-200",
  "bg-sky-200",
  "bg-indigo-200",
  "bg-cyan-200",
];

const borderColors = [
  "border-sky-300",
  "border-indigo-300",
  "border-cyan-300",
  "border-fuchsia-300",
  "border-teal-300",
  "border-rose-300",
  "border-lime-300",
];

const hashString = (s: string) => {
  let hash = 0;
  if (s.length === 0) return hash;
  for (let i = 0; i < s.length; i++) {
    const chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return hash;
};

export const withColor = (...css: string[]): string => {
  return css.join(" ");
};

export const bgFromString = (s: string): string => {
  return itemFromArrayByString(backgroundColors, s);
};

export const bgFromNumber = (n: number): string => {
  return itemFromArray(backgroundColors, n);
};

export const borderFromString = (s: string): string => {
  return itemFromArrayByString(borderColors, s);
};

export const borderFromDepth = (depth: number): string => {
  return itemFromArray(borderColors, depth);
};

const itemFromArrayByString = <T>(arr: T[], s: string): T => {
  return itemFromArray(arr, hashString(s));
};

const itemFromArray = <T>(arr: T[], i: number): T => {
  return arr[i % arr.length];
};
