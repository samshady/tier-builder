import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, Copy, ArrowRight, Palette, Tag as TagIcon, FileText } from 'lucide-react';
import type { TierItem, Tier } from '../types';
import { DEFAULT_TIER_COLORS } from '../types';

interface ItemDetailModalProps {
  isOpen: boolean;
  item: TierItem | null;
  tiers: Tier[];
  currentTierId: string; // Tier ID or 'unranked-pool'
  onClose: () => void;
  onSave: (updatedItem: TierItem) => void;
  onDeleteItem: (itemId: string) => void;
  onMoveToTier: (itemId: string, targetTierId: string) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  item,
  tiers,
  currentTierId,
  onClose,
  onSave,
  onDeleteItem,
  onMoveToTier,
}) => {
  const [title, setTitle] = useState('');
  const [tag, setTag] = useState('');
  const [color, setColor] = useState('#cba6f7');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setTag(item.tag || '');
      setColor(item.color || '#cba6f7');
      setCopied(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(title);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSave = () => {
    onSave({
      ...item,
      title: title.trim() || item.title,
      tag: tag.trim() || undefined,
      color: item.type === 'text' ? color : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#1e1e2e] border border-[#313244] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-[#313244] flex items-center justify-between bg-[#181825]/60">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: item.type === 'text' ? color : '#313244',
                color: '#11111b',
              }}
            >
              {item.type === 'image' ? 'IMG' : 'TXT'}
            </div>
            <div>
              <h2 className="font-display font-bold text-base md:text-lg text-[#cdd6f4]">
                Item Details
              </h2>
              <p className="text-xs text-[#a6adc8]">
                View complete text, edit details, or change tier placement
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-4">
          {/* Image preview if image item */}
          {item.type === 'image' && item.imageUrl && (
            <div className="flex items-center justify-center p-3 bg-[#11111b] rounded-xl border border-[#313244]">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="max-h-48 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Full Text Title Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="item-title-field" className="text-xs font-semibold text-[#cdd6f4] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#cba6f7]" />
                Full Title / Content
              </label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] text-[#a6adc8] hover:text-[#cba6f7] flex items-center gap-1 transition-colors px-2 py-0.5 rounded bg-[#181825] border border-[#313244]"
              >
                {copied ? <Check className="w-3 h-3 text-[#a6e3a1]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              id="item-title-field"
              rows={4}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter full item text..."
              className="w-full bg-[#181825] border border-[#313244] focus:border-[#cba6f7] rounded-xl p-3 text-sm text-[#cdd6f4] placeholder-[#585b70] outline-none transition-colors leading-relaxed"
            />
            <div className="mt-1 text-[11px] text-[#6c7086] text-right">
              {title.length} characters
            </div>
          </div>

          {/* Tag Field */}
          <div>
            <label htmlFor="item-tag-field" className="block text-xs font-semibold text-[#cdd6f4] mb-1.5 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-[#89b4fa]" />
              Category Tag (Optional)
            </label>
            <input
              id="item-tag-field"
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Band, Movie, Concept"
              className="w-full bg-[#181825] border border-[#313244] focus:border-[#cba6f7] rounded-xl px-3 py-2 text-sm text-[#cdd6f4] placeholder-[#585b70] outline-none transition-colors"
            />
          </div>

          {/* Accent Color for Text Cards */}
          {item.type === 'text' && (
            <div>
              <label className="block text-xs font-semibold text-[#cdd6f4] mb-2 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#fab387]" />
                Accent Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {DEFAULT_TIER_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    style={{ backgroundColor: col }}
                    className={`w-7 h-7 rounded-lg transition-transform ${
                      color === col ? 'ring-2 ring-white scale-110 shadow-md' : 'hover:scale-105 opacity-80'
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 cursor-pointer bg-transparent rounded border border-[#313244]"
                  title="Custom hex color"
                />
              </div>
            </div>
          )}

          {/* Move to Tier Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#cdd6f4] mb-2 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-[#a6e3a1]" />
              Move to Tier
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onMoveToTier(item.id, 'unranked-pool')}
                className={`tactile-btn px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                  currentTierId === 'unranked-pool'
                    ? 'bg-[#313244] text-[#cdd6f4] border-[#cba6f7]'
                    : 'bg-[#181825] text-[#a6adc8] border-[#313244] hover:text-[#cdd6f4]'
                }`}
              >
                Unranked Pool
              </button>
              {tiers.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => onMoveToTier(item.id, tier.id)}
                  style={{
                    backgroundColor: currentTierId === tier.id ? tier.color : '#181825',
                    color: currentTierId === tier.id ? '#11111b' : '#cdd6f4',
                    borderColor: tier.color,
                  }}
                  className={`tactile-btn px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                    currentTierId === tier.id ? 'shadow-md scale-105' : 'hover:bg-[#313244]'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-5 border-t border-[#313244] flex items-center justify-between bg-[#181825]/60">
          <button
            type="button"
            onClick={() => {
              onDeleteItem(item.id);
              onClose();
            }}
            className="tactile-btn px-3.5 py-2 text-xs font-semibold text-[#f38ba8] hover:bg-[#f38ba8]/10 border border-[#f38ba8]/30 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Item</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="tactile-btn px-4 py-2 text-xs font-semibold text-[#a6adc8] hover:text-[#cdd6f4] hover:bg-[#313244] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="tactile-btn px-5 py-2 text-xs font-bold bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] rounded-xl transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
