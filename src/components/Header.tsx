import React, { useState } from 'react';
import { Layers, Share2, Plus, RotateCcw, Edit2, Sparkles } from 'lucide-react';
import type { Board } from '../types';


interface HeaderProps {
  board: Board;
  onUpdateTitle: (title: string) => void;
  onAddTier: () => void;
  onResetAllItems: () => void;
  onOpenBoardsModal: () => void;
  onOpenExportModal: () => void;
  onStartGauntlet: () => void;
  unrankedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  board,
  onUpdateTitle,
  onAddTier,
  onResetAllItems,
  onOpenBoardsModal,
  onOpenExportModal,
  onStartGauntlet,
  unrankedCount,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(board.title);

  const handleTitleSubmit = () => {
    if (titleInput.trim()) {
      onUpdateTitle(titleInput.trim());
    } else {
      setTitleInput(board.title);
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="border-b border-[#313244] bg-[#181825]/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Board Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#cba6f7] to-[#89b4fa] flex items-center justify-center text-[#11111b] font-display font-black text-xl shadow-md flex-shrink-0">
            TC
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#cba6f7] font-semibold uppercase tracking-wider">
                TierCraft
              </span>
              <span className="text-[#6c7086] text-xs">/</span>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') {
                      setTitleInput(board.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  autoFocus
                  className="bg-[#1e1e2e] border border-[#cba6f7] rounded px-2 py-0.5 text-sm font-display font-bold text-[#cdd6f4] outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  className="flex items-center gap-1.5 font-display font-bold text-base md:text-lg text-[#cdd6f4] hover:text-[#cba6f7] transition-colors group"
                >
                  <span className="truncate max-w-[200px] sm:max-w-xs">{board.title}</span>
                  <Edit2 className="w-3.5 h-3.5 text-[#6c7086] group-hover:text-[#cba6f7] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
            <p className="text-xs text-[#a6adc8] hidden sm:block">
              Drag cards to rank. High-res export, local IndexedDB storage, zero server tracking.
            </p>
          </div>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 1v1 Gauntlet Mode */}
          {unrankedCount >= 2 && (
            <button
              type="button"
              onClick={onStartGauntlet}
              className="tactile-btn text-xs font-semibold px-3 py-2 bg-[#1e1e2e] hover:bg-[#313244] text-[#cba6f7] border border-[#cba6f7]/40 rounded-xl flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[#cba6f7]" />
              <span className="hidden sm:inline">1v1 Gauntlet</span>
            </button>
          )}

          {/* Add Tier */}
          <button
            type="button"
            onClick={onAddTier}
            className="tactile-btn text-xs font-semibold px-3 py-2 bg-[#1e1e2e] hover:bg-[#313244] text-[#cdd6f4] border border-[#313244] rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-[#a6e3a1]" />
            <span>Add Tier</span>
          </button>

          {/* Reset All */}
          <button
            type="button"
            onClick={onResetAllItems}
            title="Reset all items to unranked pool"
            className="tactile-btn p-2 bg-[#1e1e2e] hover:bg-[#313244] text-[#a6adc8] hover:text-[#fab387] border border-[#313244] rounded-xl"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Boards / Templates */}
          <button
            type="button"
            onClick={onOpenBoardsModal}
            className="tactile-btn text-xs font-semibold px-3 py-2 bg-[#1e1e2e] hover:bg-[#313244] text-[#cdd6f4] border border-[#313244] rounded-xl flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-[#89b4fa]" />
            <span>Boards</span>
          </button>

          {/* Export & Share */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="tactile-btn text-xs font-semibold px-4 py-2 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Export & Share</span>
          </button>
        </div>
      </div>
    </header>
  );
};
