import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Search, Plus, Upload, Shuffle, Trash, Sparkles, Link, ListPlus } from 'lucide-react';
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
  const [quickAddInput, setQuickAddInput] = useState('');
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageTitleInput, setImageTitleInput] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isDragOverFiles, setIsDragOverFiles] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: 'unranked-pool',
  });

  // Listen for clipboard image paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const clipboardItems = e.clipboardData?.items;
      if (!clipboardItems) return;

      const newImages: { title: string; imageUrl: string }[] = [];
      for (let i = 0; i < clipboardItems.length; i++) {
        const item = clipboardItems[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            try {
              const compressed = await compressImageFile(file);
              newImages.push({
                title: `Pasted Image ${Date.now()}`,
                imageUrl: compressed,
              });
            } catch (err) {
              console.error('Failed to parse pasted image:', err);
            }
          }
        }
      }

      if (newImages.length > 0) {
        onAddImageItems(newImages);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onAddImageItems]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.tag && item.tag.toLowerCase().includes(q))
    );
  });

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsProcessingImages(true);
    const newItems: { title: string; imageUrl: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      try {
        const processed = await compressImageFile(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        newItems.push({
          title: nameWithoutExt,
          imageUrl: processed,
        });
      } catch (err) {
        console.error('Failed to process image:', file.name, err);
      }
    }

    if (newItems.length > 0) {
      onAddImageItems(newItems);
    }

    setIsProcessingImages(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddInput.trim()) return;
    onAddTextItem(quickAddInput.trim());
    setQuickAddInput('');
  };

  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lines = batchText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    lines.forEach((line) => {
      onAddTextItem(line);
    });

    setBatchText('');
    setShowBatchModal(false);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    const title = imageTitleInput.trim() || 'Web Image';
    onAddImageItems([{ title, imageUrl: imageUrlInput.trim() }]);
    setImageUrlInput('');
    setImageTitleInput('');
    setShowUrlModal(false);
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
          {/* Quick inline text adder */}
          <form onSubmit={handleQuickAdd} className="flex items-center gap-1 flex-1 sm:flex-initial">
            <input
              type="text"
              placeholder="Type option and hit Enter..."
              value={quickAddInput}
              onChange={(e) => setQuickAddInput(e.target.value)}
              className="bg-[#181825] border border-[#313244] focus:border-[#cba6f7] text-xs text-[#cdd6f4] rounded-lg px-3 py-2 outline-none w-44 sm:w-52 transition-colors"
            />
            <button
              type="submit"
              disabled={!quickAddInput.trim()}
              title="Add text card"
              className="tactile-btn p-2 bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#11111b] rounded-lg disabled:opacity-30 disabled:hover:bg-[#a6e3a1]"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          {/* Batch Text Add */}
          <button
            type="button"
            onClick={() => setShowBatchModal(true)}
            title="Batch add multiple text options"
            className="tactile-btn text-xs font-semibold px-2.5 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg border border-[#45475a] flex items-center gap-1.5"
          >
            <ListPlus className="w-4 h-4 text-[#fab387]" />
            <span className="hidden sm:inline">Bulk Text</span>
          </button>

          {/* Upload Images & GIFs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            multiple
            accept="image/*,.gif,.webp"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingImages}
            title="Upload images or animated GIFs"
            className="tactile-btn text-xs font-semibold px-3 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg border border-[#45475a] flex items-center gap-1.5 disabled:opacity-50"
          >
            <Upload className="w-4 h-4 text-[#89b4fa]" />
            <span>{isProcessingImages ? 'Processing...' : 'Upload Images/GIFs'}</span>
          </button>

          {/* Add Image/GIF via URL */}
          <button
            type="button"
            onClick={() => setShowUrlModal(true)}
            title="Add image or GIF from web link"
            className="tactile-btn p-2 bg-[#313244] hover:bg-[#45475a] text-[#a6adc8] hover:text-[#cdd6f4] rounded-lg border border-[#45475a]"
          >
            <Link className="w-4 h-4" />
          </button>

          {/* Search bar */}
          <div className="relative w-36 sm:w-44">
            <Search className="w-3.5 h-3.5 text-[#6c7086] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181825] border border-[#313244] focus:border-[#cba6f7] text-xs text-[#cdd6f4] rounded-lg pl-8 pr-2.5 py-2 outline-none transition-colors"
            />
          </div>

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

      {/* Droppable Unranked Card Grid with File Drop Support */}
      <div
        ref={setNodeRef}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files')) {
            e.preventDefault();
            setIsDragOverFiles(true);
          }
        }}
        onDragLeave={() => setIsDragOverFiles(false)}
        onDrop={(e) => {
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            setIsDragOverFiles(false);
            handleFileUpload(e.dataTransfer.files);
          }
        }}
        className={`min-h-[140px] p-3 md:p-4 rounded-xl border border-dashed transition-all flex flex-wrap content-start items-center gap-2.5 relative ${
          isDragOverFiles
            ? 'border-[#a6e3a1] bg-[#a6e3a1]/10'
            : isOver
            ? 'border-[#cba6f7] bg-[#313244]/40'
            : 'border-[#313244] bg-[#181825]/60'
        }`}
      >
        {isDragOverFiles && (
          <div className="absolute inset-0 bg-[#181825]/90 rounded-xl z-30 flex flex-col items-center justify-center gap-2 text-[#a6e3a1]">
            <Upload className="w-8 h-8 animate-bounce" />
            <span className="font-display font-bold text-sm">Drop images or GIFs here</span>
          </div>
        )}

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
              Type options above, upload images/GIFs, or paste images directly with Ctrl+V.
            </p>
          </div>
        )}

        {items.length > 0 && filteredItems.length === 0 && (
          <div className="w-full py-8 text-center text-xs text-[#6c7086]">
            No items matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Bulk Text Add Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-[#11111b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4">
            <h3 className="font-display font-bold text-xl text-[#cdd6f4]">
              Bulk Add Options
            </h3>
            <p className="text-xs text-[#a6adc8]">
              Paste your list of options below. Each line will become an individual card to rate.
            </p>
            <form onSubmit={handleBatchSubmit} className="flex flex-col gap-3">
              <textarea
                rows={6}
                placeholder="Python&#10;TypeScript&#10;Rust&#10;Go&#10;Zig"
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                autoFocus
                required
                className="w-full bg-[#181825] border border-[#313244] focus:border-[#cba6f7] text-sm text-[#cdd6f4] rounded-lg p-3 outline-none font-mono"
              />
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#313244]">
                <button
                  type="button"
                  onClick={() => setShowBatchModal(false)}
                  className="tactile-btn text-xs font-semibold px-4 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn text-xs font-semibold px-4 py-2 bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#11111b] rounded-lg font-bold"
                >
                  Add All Options
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add by URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 bg-[#11111b]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4">
            <h3 className="font-display font-bold text-xl text-[#cdd6f4]">
              Add Image or GIF via Link
            </h3>
            <form onSubmit={handleUrlSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-[#a6adc8] font-medium block mb-1">
                  Image or GIF URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/animation.gif"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-[#181825] border border-[#313244] focus:border-[#cba6f7] text-sm text-[#cdd6f4] rounded-lg px-3 py-2 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[#a6adc8] font-medium block mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dancing Cat"
                  value={imageTitleInput}
                  onChange={(e) => setImageTitleInput(e.target.value)}
                  className="w-full bg-[#181825] border border-[#313244] focus:border-[#cba6f7] text-sm text-[#cdd6f4] rounded-lg px-3 py-2 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#313244]">
                <button
                  type="button"
                  onClick={() => setShowUrlModal(false)}
                  className="tactile-btn text-xs font-semibold px-4 py-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="tactile-btn text-xs font-semibold px-4 py-2 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] rounded-lg font-bold"
                >
                  Add Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
