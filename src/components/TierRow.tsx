import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { ChevronUp, ChevronDown, Trash2, RotateCcw, Palette } from 'lucide-react';
import type { Tier, TierItem } from '../types';
import { DEFAULT_TIER_COLORS } from '../types';

import { ItemCard } from './ItemCard';

interface TierRowProps {
  tier: Tier;
  items: TierItem[];
  onUpdateTier: (tierId: string, updates: Partial<Tier>) => void;
  onDeleteTier: (tierId: string) => void;
  onClearTier: (tierId: string) => void;
  onMoveTier: (tierId: string, direction: 'up' | 'down') => void;
  onDeleteItem: (itemId: string) => void;
  onInspectItem?: (item: TierItem) => void;
  expandAllText?: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export const TierRow: React.FC<TierRowProps> = ({
  tier,
  items,
  onUpdateTier,
  onDeleteTier,
  onClearTier,
  onMoveTier,
  onDeleteItem,
  onInspectItem,
  expandAllText,
  isFirst,
  isLast,
}) => {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [labelInput, setLabelInput] = useState(tier.label);

  const { setNodeRef, isOver } = useDroppable({
    id: tier.id,
  });

  const handleLabelSubmit = () => {
    if (labelInput.trim()) {
      onUpdateTier(tier.id, { label: labelInput.trim() });
    } else {
      setLabelInput(tier.label);
    }
    setIsEditingLabel(false);
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch bg-[#1e1e2e] border border-[#313244] rounded-xl overflow-hidden shadow-sm transition-all duration-150">
      {/* Tier Label Pillar */}
      <div
        className="sm:w-28 md:w-32 min-h-[72px] sm:min-h-[104px] p-2 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 relative select-none flex-shrink-0"
        style={{ backgroundColor: tier.color }}
      >
        {isEditingLabel ? (
          <input
            type="text"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            onBlur={handleLabelSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleLabelSubmit();
              if (e.key === 'Escape') {
                setLabelInput(tier.label);
                setIsEditingLabel(false);
              }
            }}
            autoFocus
            maxLength={10}
            className="w-full text-center font-display font-bold text-xl md:text-2xl text-[#11111b] bg-white/70 rounded px-1 py-0.5 outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingLabel(true)}
            title="Click to rename tier"
            className="font-display font-black text-xl md:text-2xl text-[#11111b] drop-shadow-sm hover:scale-105 active:scale-95 transition-transform truncate max-w-full px-2"
          >
            {tier.label}
          </button>
        )}

        {/* Color Picker trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Change tier color"
            className="w-7 h-7 rounded-full bg-[#11111b]/30 hover:bg-[#11111b]/50 text-[#11111b] flex items-center justify-center transition-colors"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {showColorPicker && (
            <div className="absolute left-0 sm:left-full top-full sm:top-0 sm:ml-2 z-30 p-2 bg-[#181825] border border-[#313244] rounded-lg shadow-xl grid grid-cols-3 gap-1.5 w-32">
              {DEFAULT_TIER_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => {
                    onUpdateTier(tier.id, { color: col });
                    setShowColorPicker(false);
                  }}
                  style={{ backgroundColor: col }}
                  className="w-8 h-8 rounded-md hover:scale-110 transition-transform border border-[#11111b]/30"
                />
              ))}
              <div className="col-span-3 pt-1 border-t border-[#313244]">
                <input
                  type="color"
                  value={tier.color}
                  onChange={(e) => onUpdateTier(tier.id, { color: e.target.value })}
                  className="w-full h-6 cursor-pointer bg-transparent rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Droppable Items Container */}
      <div
        ref={setNodeRef}
        className={`flex-1 p-2 md:p-3 flex flex-wrap content-start items-center gap-2 min-h-[80px] sm:min-h-[104px] transition-colors ${
          isOver ? 'bg-[#313244]/40' : 'bg-[#181825]/60'
        }`}
      >
        <SortableContext items={tier.itemIds} strategy={horizontalListSortingStrategy}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onDelete={onDeleteItem}
              onInspect={onInspectItem}
              expandAllText={expandAllText}
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="w-full h-full min-h-[64px] flex items-center justify-center text-xs text-[#6c7086] border border-dashed border-[#313244] rounded-lg pointer-events-none">
            Drop items here
          </div>
        )}
      </div>

      {/* Row Action Controls */}
      <div className="w-full sm:w-12 bg-[#11111b]/40 border-t sm:border-t-0 sm:border-l border-[#313244] flex flex-row sm:flex-col items-center justify-around sm:justify-center p-1 sm:p-0 gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => onMoveTier(tier.id, 'up')}
          disabled={isFirst}
          title="Move tier up"
          className="p-1.5 rounded text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onMoveTier(tier.id, 'down')}
          disabled={isLast}
          title="Move tier down"
          className="p-1.5 rounded text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onClearTier(tier.id)}
          title="Return items to unranked pool"
          className="p-1.5 rounded text-[#a6adc8] hover:text-[#fab387] hover:bg-[#313244] transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => onDeleteTier(tier.id)}
          title="Delete tier"
          className="p-1.5 rounded text-[#a6adc8] hover:text-[#f38ba8] hover:bg-[#313244] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
