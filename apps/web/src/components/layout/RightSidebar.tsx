import { TargetPanel } from "../target/TargetPanel";

export function RightSidebar() {
  return (
    <aside className="flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-dark-200 bg-dark-500 p-4">
      <TargetPanel />
    </aside>
  );
}
