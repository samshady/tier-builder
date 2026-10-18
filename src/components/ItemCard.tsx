import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical } from 'lucide-react';
import type { TierItem } from '../types';


interface ItemCardProps {
  item: TierItem;
  onDelete?: (id: string) => void;
  isOverlay?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onDelete, isOverlay = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

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
      className={`relative group flex items-center justify-center select-none rounded-lg overflow-hidden border border-[#313244] bg-[#181825] transition-shadow duration-150 touch-manipulation ${
        item.type === 'image'
          ? 'w-20 h-20 md:w-24 md:h-24'
          : 'min-w-[100px] h-20 md:h-24 px-3'
      } ${isOverlay ? 'z-50 ring-2 ring-[#cba6f7]' : 'hover:border-[#585b70]'}`}
    >
      {/* Drag Surface */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        {item.type === 'image' && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover pointer-events-none"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full p-2 flex flex-col justify-between text-left"
            style={{
              borderLeft: `4px solid ${item.color || '#cba6f7'}`,
              backgroundColor: '#1e1e2e',
            }}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="font-semibold text-xs md:text-sm text-[#cdd6f4] line-clamp-2 leading-tight">
                {item.title}
              </span>
              <GripVertical className="w-3.5 h-3.5 text-[#6c7086] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
            {item.tag && (
              <span className="text-[11px] font-mono text-[#a6adc8] bg-[#313244] px-1.5 py-0.5 rounded self-start truncate max-w-full">
                {item.tag}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Delete button */}
      {onDelete && !isOverlay && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          title="Remove item"
          className="absolute top-1 right-1 z-20 w-6 h-6 rounded-full bg-[#11111b]/80 text-[#f38ba8] opacity-0 group-hover:opacity-100 hover:bg-[#f38ba8] hover:text-[#11111b] flex items-center justify-center transition-all duration-150"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Image caption badge on hover */}
      {item.type === 'image' && item.title && (
        <div className="absolute bottom-0 inset-x-0 z-20 bg-[#11111b]/90 px-1 py-0.5 text-center text-[11px] text-[#cdd6f4] truncate opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {item.title}
        </div>
      )}
    </div>
  );
};
