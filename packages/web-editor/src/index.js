export * from "./completion.js";
export * from "./forms.js";
export * from "./instarepl.js";
export * from "./scanner.js";
export {
  applyCompletion,
  applyParedit,
  barfBackward,
  barfForward,
  completionTokenAt,
  insertIndent,
  killToFormEnd,
  localFormAt,
  slurpForward,
  structuralAlign
} from "./textarea.js";
