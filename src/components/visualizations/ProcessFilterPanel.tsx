import { memo } from 'react';
import { Filter, Eye, EyeOff, X } from 'lucide-react';
import type { ProcessCategory } from '../../data/complexGraphData';

interface ProcessFilterPanelProps {
  categories: ProcessCategory[];
  onToggleCategory: (categoryId: string) => void;
  onToggleAll: (enabled: boolean) => void;
  totalNodes: number;
  visibleNodes: number;
  onClose?: () => void;
}

export const ProcessFilterPanel = memo(({
  categories,
  onToggleCategory,
  onToggleAll,
  totalNodes,
  visibleNodes,
  onClose,
}: ProcessFilterPanelProps) => {
  const allEnabled = categories.every(c => c.enabled);
  const someEnabled = categories.some(c => c.enabled);

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-700 text-sm">Filters</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-50 rounded transition-colors focus:outline-none"
            title="Close Filters"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-500">Visible</span>
          <span className="font-medium text-gray-700">{visibleNodes} / {totalNodes}</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gray-400 transition-all duration-300" style={{ width: `${(visibleNodes / totalNodes) * 100}%` }} />
        </div>
        <div className="flex gap-2 mt-2">
          <button onClick={() => onToggleAll(true)} disabled={allEnabled} className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-all disabled:opacity-30 focus:outline-none">
            <Eye className="w-3 h-3 inline mr-1" /> All
          </button>
          <button onClick={() => onToggleAll(false)} disabled={!someEnabled} className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-all disabled:opacity-30 focus:outline-none">
            <EyeOff className="w-3 h-3 inline mr-1" /> None
          </button>
        </div>
      </div>

      <div className="px-3 py-2 max-h-[400px] overflow-y-auto">
        {categories.map((category) => (
          <label key={category.id} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group">
            <input type="checkbox" checked={category.enabled} onChange={() => onToggleCategory(category.id)} className="w-4 h-4 rounded border border-gray-300 text-gray-600 focus:ring-0 focus:ring-offset-0" />
            <div className="flex-1">
              <div className={category.enabled ? 'text-sm text-gray-700 font-medium' : 'text-sm text-gray-400'}>{category.name}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
});

ProcessFilterPanel.displayName = 'ProcessFilterPanel';
