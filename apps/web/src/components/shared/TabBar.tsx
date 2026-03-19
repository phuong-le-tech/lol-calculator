"use client";

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="flex gap-6 bg-[#111827AA] rounded-[10px] p-1 border-b border-dark-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          className={`relative px-3 py-1.5 text-[13px] font-medium transition-colors ${
            activeTab === tab.id
              ? "text-gold-300"
              : tab.disabled
                ? "cursor-not-allowed text-dark-50"
                : "text-dark-100 hover:text-gold-100"
          }`}
        >
          {activeTab === tab.id && (
            <span className="absolute inset-0 rounded-lg bg-gold-300/15" />
          )}
          <span className="relative">{tab.label}</span>
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-gold-300" />
          )}
        </button>
      ))}
    </div>
  );
}
