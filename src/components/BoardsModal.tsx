import React, { useRef } from 'react';
import { Plus, FolderOpen, Upload, Trash2, X, Check } from 'lucide-react';
import type { Board } from '../types';
import { STARTER_TEMPLATES } from '../db/templates';


interface BoardsModalProps {
  currentBoardId: string;
  savedBoards: Board[];
  onSelectBoard: (board: Board) => void;
  onCreateBoard: (title: string) => void;
  onDeleteBoard: (boardId: string) => void;
  onImportBoard: (board: Board) => void;
  onClose: () => void;
}

export const BoardsModal: React.FC<BoardsModalProps> = ({
  currentBoardId,
  savedBoards,
  onSelectBoard,
  onCreateBoard,
  onDeleteBoard,
  onImportBoard,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const board = JSON.parse(event.target?.result as string);
        if (board.tiers && board.items) {
          board.id = `imported-${Date.now()}`;
          board.updatedAt = Date.now();
          onImportBoard(board);
          onClose();
        } else {
          alert('Invalid tier list file format.');
        }
      } catch (err) {
        console.error('Failed to parse JSON file:', err);
        alert('Could not read the selected JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11111b]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-6 md:p-8 w-full max-w-xl shadow-2xl flex flex-col gap-5 relative max-h-[85vh]">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#a6adc8] hover:text-[#cdd6f4] rounded-lg hover:bg-[#313244] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-1">
          <h2 className="font-display font-extrabold text-2xl text-[#cdd6f4]">
            Saved Boards & Templates
          </h2>
          <p className="text-xs text-[#a6adc8]">
            Switch between locally stored boards or start from a curated template.
          </p>
        </div>

        {/* Action bar: New board or Import JSON */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const name = prompt('Enter a title for the new tier list:', 'My New Tier List');
              if (name && name.trim()) {
                onCreateBoard(name.trim());
                onClose();
              }
            }}
            className="tactile-btn flex-1 py-2 px-3 bg-[#cba6f7] hover:bg-[#b4befe] text-[#11111b] font-display font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Empty Board</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleJsonUpload}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="tactile-btn py-2 px-3 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] font-medium text-xs rounded-xl flex items-center justify-center gap-1.5 border border-[#45475a]"
          >
            <Upload className="w-4 h-4 text-[#89b4fa]" />
            <span>Import JSON</span>
          </button>
        </div>

        {/* Saved Boards List */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6c7086] font-semibold">
            Your Local Boards
          </span>
          {savedBoards.map((board) => {
            const isCurrent = board.id === currentBoardId;
            const itemCount = Object.keys(board.items).length;
            return (
              <div
                key={board.id}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  isCurrent
                    ? 'bg-[#313244]/40 border-[#cba6f7]'
                    : 'bg-[#181825] border-[#313244] hover:border-[#585b70]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectBoard(board);
                    onClose();
                  }}
                  className="flex-1 text-left flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#313244] flex items-center justify-center text-[#cba6f7]">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-[#cdd6f4] flex items-center gap-2">
                      {board.title}
                      {isCurrent && (
                        <span className="text-[10px] font-mono bg-[#cba6f7]/20 text-[#cba6f7] px-1.5 py-0.2 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Active
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#6c7086] font-mono">
                      {itemCount} items | {board.tiers.length} tiers
                    </div>
                  </div>
                </button>

                {savedBoards.length > 1 && !isCurrent && (
                  <button
                    type="button"
                    onClick={() => onDeleteBoard(board.id)}
                    title="Delete saved board"
                    className="p-2 text-[#6c7086] hover:text-[#f38ba8] rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Starter Templates */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#313244]">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#6c7086] font-semibold">
            Starter Templates
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STARTER_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  const cloned: Board = {
                    ...tpl,
                    id: `board-${Date.now()}`,
                    updatedAt: Date.now(),
                    createdAt: Date.now(),
                  };
                  onImportBoard(cloned);
                  onClose();
                }}
                className="tactile-btn p-3 bg-[#181825] hover:bg-[#313244] border border-[#313244] rounded-xl text-left flex flex-col gap-1 transition-colors"
              >
                <div className="font-display font-bold text-xs text-[#cdd6f4]">
                  {tpl.title}
                </div>
                <div className="text-[11px] text-[#6c7086] font-mono">
                  {Object.keys(tpl.items).length} items included
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
