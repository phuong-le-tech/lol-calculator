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
    <div className="flex gap-1 border-b border-dark-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "border-b-2 border-gold-300 text-gold-300"
              : tab.disabled
                ? "cursor-not-allowed text-dark-50"
                : "text-dark-100 hover:text-gold-100"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
