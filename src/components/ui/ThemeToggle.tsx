import { Palette } from 'lucide-react';

interface ThemeToggleProps {
  variant?: 'sidebar' | 'default';
  isCollapsed?: boolean;
}

export function ThemeToggle({ variant = 'default', isCollapsed = false }: ThemeToggleProps) {
  if (variant === 'sidebar' && isCollapsed) {
    return (
      <button
        className="group w-full flex items-center justify-center rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 bg-transparent hover:bg-gray-100 border border-gray-200/60 transition-all duration-150 ease-out p-2.5"
        title="Theme"
      >
        <Palette size={20} className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
      </button>
    );
  }

  return (
    <button
      className="group w-full flex items-center justify-center rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 bg-transparent hover:bg-gray-100 border border-gray-200/60 transition-all duration-150 ease-out px-4 py-2.5 gap-3"
    >
      <Palette size={20} className="flex-shrink-0 transition-transform duration-150 group-hover:scale-110" />
      {variant === 'sidebar' && <span className="flex-1 text-left">Theme</span>}
    </button>
  );
}
