import { TargetPanel } from "../target/TargetPanel";

export function RightSidebar() {
  return (
    <aside className="flex w-[320px] shrink-0 flex-col gap-3 overflow-y-auto border-l border-gold-300/15 bg-dark-500/75 p-4 backdrop-blur-xl">
      <TargetPanel />
    </aside>
  );
}
