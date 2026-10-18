import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Maximize2, Minimize2, Edit3 } from 'lucide-react';
import type { TierItem } from '../types';

interface ItemCardProps {
  item: TierItem;
  onDelete?: (id: string) => void;
  onInspect?: (item: TierItem) => void;
  isOverlay?: boolean;
  expandAllText?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onDelete,
  onInspect,
  isOverlay = false,
  expandAllText = false,
}) => {
  const [isLocalExpanded, setIsLocalExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const isTextExpanded = expandAllText || isLocalExpanded;

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  if (isOverlay) {
    style.cursor = 'grabbing';
    style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.45)';
    style.transform = 'scale(1.05)';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      title={item.title}
      className={`relative group flex items-center justify-center select-none rounded-lg overflow-visible border border-[#313244] bg-[#181825] transition-shadow duration-150 touch-manipulation ${
        isOverlay ? 'z-50 ring-2 ring-[#cba6f7]' : 'hover:border-[#585b70] animate-pop-in'
      } ${
        item.type === 'image'
          ? 'w-20 h-20 md:w-24 md:h-24'
          : isTextExpanded
          ? 'min-w-[140px] max-w-[280px] w-auto h-auto min-h-[5rem] md:min-h-[6rem] p-2'
          : 'min-w-[116px] md:min-w-[130px] max-w-[200px] h-20 md:h-24 px-2'
      }`}
    >
      {/* Drag Surface */}
      <div
        {...attributes}
        {...listeners}
        onDoubleClick={() => onInspect?.(item)}
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center rounded-lg overflow-hidden"
      >
        {item.type === 'image' && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover pointer-events-none rounded-lg"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full p-2 flex flex-col justify-between text-left rounded-lg"
            style={{
              borderLeft: `4px solid ${item.color || '#cba6f7'}`,
              backgroundColor: '#1e1e2e',
            }}
          >
            <div className="flex items-start justify-between gap-1">
              <span
                className={`font-semibold text-xs md:text-sm text-[#cdd6f4] break-words ${
                  isTextExpanded ? 'leading-snug' : 'line-clamp-2 md:line-clamp-3 leading-tight'
                }`}
              >
                {item.title}
              </span>
              <GripVertical className="w-3.5 h-3.5 text-[#6c7086] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>

            <div className="flex items-center justify-between gap-1 mt-1">
              {item.tag ? (
                <span className="text-[10px] font-mono text-[#a6adc8] bg-[#313244] px-1.5 py-0.5 rounded self-start truncate max-w-[100px]">
                  {item.tag}
                </span>
              ) : <span />}

              {/* In-card Action icons for text cards */}
              {!isOverlay && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLocalExpanded(!isLocalExpanded);
                    }}
                    title={isLocalExpanded ? 'Collapse card' : 'Expand card text'}
                    className="w-5 h-5 rounded bg-[#11111b]/80 text-[#a6adc8] hover:text-[#cba6f7] hover:bg-[#313244] flex items-center justify-center transition-colors"
                  >
                    {isLocalExpanded ? (
                      <Minimize2 className="w-3 h-3" />
                    ) : (
                      <Maximize2 className="w-3 h-3" />
                    )}
                  </button>

                  {onInspect && (
                    <button
                      type="button"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onInspect(item);
                      }}
                      title="Inspect and edit details"
                      className="w-5 h-5 rounded bg-[#11111b]/80 text-[#a6adc8] hover:text-[#cba6f7] hover:bg-[#313244] flex items-center justify-center transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete button */}
      {onDelete && !isOverlay && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          title="Remove item"
          className="absolute top-1 right-1 z-20 w-5 h-5 rounded-full bg-[#11111b]/80 text-[#f38ba8] opacity-0 group-hover:opacity-100 hover:bg-[#f38ba8] hover:text-[#11111b] flex items-center justify-center transition-all duration-150"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Image caption badge on hover */}
      {item.type === 'image' && item.title && (
        <div className="absolute bottom-0 inset-x-0 z-20 bg-[#11111b]/90 px-1 py-0.5 text-center text-[11px] text-[#cdd6f4] truncate opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-b-lg">
          {item.title}
        </div>
      )}

      {/* Hover Floating Tooltip Preview */}
      {!isOverlay && !isTextExpanded && item.title && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[260px] p-2.5 bg-[#11111b]/95 backdrop-blur-sm text-[#cdd6f4] rounded-xl shadow-2xl border border-[#45475a] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 text-left hidden group-hover:block">
          <p className="font-semibold text-xs leading-snug break-words">
            {item.title}
          </p>
          {item.tag && (
            <span className="mt-1 text-[10px] font-mono text-[#a6adc8] bg-[#313244] px-1.5 py-0.5 rounded inline-block">
              {item.tag}
            </span>
          )}
          <div className="mt-1.5 pt-1 border-t border-[#313244] text-[10px] text-[#a6adc8] flex items-center justify-between">
            <span>Click expand icon or double click to view</span>
          </div>
        </div>
      )}
    </div>
  );
};
