import React, { useState, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Search, Plus, Upload, Shuffle, Trash, Sparkles } from 'lucide-react';
import type { TierItem } from '../types';

import { ItemCard } from './ItemCard';
import { compressImageFile } from '../utils/image';

interface UnrankedPoolProps {
  items: TierItem[];
  onAddTextItem: (title: string, tag?: string, color?: string) => void;
  onAddImageItems: (images: { title: string; imageUrl: string }[]) => void;
  onShufflePool: () => void;
  onClearPool: () => void;
  onDeleteItem: (itemId: string) => void;
  onStartGauntlet: () => void;
}

export const UnrankedPool: React.FC<UnrankedPoolProps> = ({
  items,
  onAddTextItem,
  onAddImageItems,
  onShufflePool,
  onClearPool,
  onDeleteItem,
  onStartGauntlet,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddTextModal, setShowAddTextModal] = useState(false);
  const [textTitle, setTextTitle] = useState('');
  const [textTag, setTextTag] = useState('');
  const [textColor, setTextColor] = useState('#cba6f7');
  const [isProcessingImages, setIsProcessingImages] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: 'unranked-pool',
  });

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.tag && item.tag.toLowerCase().includes(q))
    );
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    const newItems: { title: string; imageUrl: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressed = await compressImageFile(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        newItems.push({
          title: nameWithoutExt,
          imageUrl: compressed,
        });
      } catch (err) {
        console.error('Failed to compress image:', file.name, err);
      }
    }

    if (newItems.length > 0) {
      onAddImageItems(newItems);
    }

    setIsProcessingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textTitle.trim()) return;
    onAddTextItem(textTitle.trim(), textTag.trim() || undefined, textColor);
    setTextTitle('');
    setTextTag('');
    setShowAddTextModal(false);
  };

  return (
    <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl p-4 md:p-5 flex flex-col gap-4 shadow-sm">
      {/* Pool Header Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-display font-bold text-lg md:text-xl text-[#cdd6f4]">
            Unranked Items
          </h2>
          <span className="font-mono text-xs bg-[#313244] text-[#a6adc8] px-2 py-0.5 rounded-full">
            {items.length} items
          </span>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative flex-1 sm:flex-initial sm:w-48 md:w-56">
            <Search className="w-4 h-4 text-[#6c7086] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181825] border border-[#313244] focus:border-[#cba6f7] text-xs text-[#cdd6f4] rounded-lg pl-9 pr-3 py-2 outline-none transition-colors"
            />
          </div>

          {/* Add Text Card */}
          <button
            type="button"
            onClick={() => setShowAddTextModal(true)}
            className="tactile-btn text-xs font-semibold px-3 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg border border-[#45475a] flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#a6e3a1]" />
            <span>Add Text</span>
          </button>

          {/* Upload Images */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingImages}
            className="tactile-btn text-xs font-semibold px-3 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg border border-[#45475a] flex items-center gap-1.5 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-[#89b4fa]" />
            <span>{isProcessingImages ? 'Optimizing...' : 'Upload Images'}</span>
          </button>

          {/* 1v1 Gauntlet Mode */}
          {items.length >= 2 && (
            <button
              type="button"
              onClick={onStartGauntlet}
              className="tactile-btn text-xs font-semibold px-3 py-2 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] rounded-lg flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>1v1 Gauntlet</span>
            </button>
          )}

          {/* Shuffle */}
          <button
            type="button"
            onClick={onShufflePool}
            disabled={items.length === 0}
            title="Shuffle unranked items"
            className="tactile-btn p-2 bg-[#181825] hover:bg-[#313244] text-[#a6adc8] hover:text-[#cdd6f4] rounded-lg border border-[#313244] disabled:opacity-30"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Clear pool */}
          <button
            type="button"
            onClick={onClearPool}
            disabled={items.length === 0}
            title="Remove all unranked items"
            className="tactile-btn p-2 bg-[#181825] hover:bg-[#313244] text-[#a6adc8] hover:text-[#f38ba8] rounded-lg border border-[#313244] disabled:opacity-30"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Droppable Unranked Card Grid */}
      <div
        ref={setNodeRef}
        className={`min-h-[140px] p-3 md:p-4 rounded-xl border border-dashed transition-colors flex flex-wrap content-start items-center gap-2.5 ${
          isOver
            ? 'border-[#cba6f7] bg-[#313244]/40'
            : 'border-[#313244] bg-[#181825]/60'
        }`}
      >
        <SortableContext
          items={filteredItems.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={onDeleteItem} />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="w-full py-8 flex flex-col items-center justify-center text-center gap-2 text-[#6c7086]">
            <Upload className="w-8 h-8 opacity-40" />
            <p className="text-sm font-medium">No items in the pool</p>
            <p className="text-xs text-[#a6adc8]">
              Upload photos or add custom text cards to start ranking
            </p>
          </div>
        )}

        {items.length > 0 && filteredItems.length === 0 && (
          <div className="w-full py-8 text-center text-xs text-[#6c7086]">
            No items matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Add Text Item Modal */}
      {showAddTextModal && (
        <div className="fixed inset-0 z-50 bg-[#11111b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <h3 className="font-display font-bold text-xl text-[#cdd6f4]">
              Create Text Card
            </h3>
            <form onSubmit={handleTextSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#a6adc8] font-medium block mb-1">
                  Title or Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Next.js, Espresso, Elden Ring"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-[#181825] border border-[#313244] focus:border-[#cba6f7] text-sm text-[#cdd6f4] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#a6adc8] font-medium block mb-1">
                  Category Tag (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Framework, Coffee, RPG"
                  value={textTag}
                  onChange={(e) => setTextTag(e.target.value)}
                  className="w-full bg-[#181825] border border-[#313244] focus:border-[#cba6f7] text-sm text-[#cdd6f4] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-[#a6adc8] font-medium block mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-8 cursor-pointer bg-transparent rounded"
                  />
                  <span className="font-mono text-xs text-[#6c7086]">{textColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-[#313244]">
                <button
                  type="button"
                  onClick={() => setShowAddTextModal(false)}
                  className="tactile-btn text-xs font-semibold px-4 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn text-xs font-semibold px-4 py-2 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] rounded-lg"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
