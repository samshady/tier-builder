import React, { useEffect, useState, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import type {
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Board, Tier, TierItem } from './types';
import { DEFAULT_TIER_COLORS } from './types';

import { db, initializeDatabase } from './db';
import { decodeBoardFromUrlHash } from './utils/share';
import { Header } from './components/Header';
import { TierRow } from './components/TierRow';
import { UnrankedPool } from './components/UnrankedPool';
import { StatsBar } from './components/StatsBar';
import { ItemCard } from './components/ItemCard';
import { ExportModal } from './components/ExportModal';
import { BoardsModal } from './components/BoardsModal';
import { GauntletModal } from './components/GauntletModal';
import { ItemDetailModal } from './components/ItemDetailModal';

export const App: React.FC = () => {
  const [board, setBoard] = useState<Board | null>(null);
  const [savedBoards, setSavedBoards] = useState<Board[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isBoardsModalOpen, setIsBoardsModalOpen] = useState(false);
  const [isGauntletOpen, setIsGauntletOpen] = useState(false);
  const [expandAllText, setExpandAllText] = useState(false);
  const [inspectingItem, setInspectingItem] = useState<TierItem | null>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Setup DnD sensors with a 5px activation distance to support touch scrolling smoothly
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Load initial board and saved boards from IndexedDB or URL hash
  useEffect(() => {
    async function loadData() {
      // Check if URL hash contains a shared board
      const hash = window.location.hash;
      if (hash && hash.includes('tier=')) {
        const hashPayload = hash.split('tier=')[1];
        const sharedBoard = decodeBoardFromUrlHash(hashPayload);
        if (sharedBoard) {
          setBoard(sharedBoard);
          await db.boards.put(sharedBoard);
          const all = await db.boards.toArray();
          setSavedBoards(all);
          return;
        }
      }

      const initial = await initializeDatabase();
      setBoard(initial);
      const all = await db.boards.toArray();
      setSavedBoards(all);
    }
    loadData();
  }, []);

  // Save changes to IndexedDB when board updates
  const updateBoard = async (updated: Board) => {
    updated.updatedAt = Date.now();
    setBoard(updated);
    await db.boards.put(updated);
    const all = await db.boards.toArray();
    setSavedBoards(all);
  };

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#181825] text-[#cdd6f4]">
        <div className="font-display font-bold text-lg animate-pulse">Loading TierCraft...</div>
      </div>
    );
  }

  // Find container for a given item ID (tier ID or 'unranked-pool')
  const findContainer = (id: string): string | null => {
    if (board.unrankedItemIds.includes(id) || id === 'unranked-pool') {
      return 'unranked-pool';
    }
    for (const tier of board.tiers) {
      if (tier.id === id || tier.itemIds.includes(id)) {
        return tier.id;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveItemId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceContainer = findContainer(activeId);
    const targetContainer = findContainer(overId);

    if (!sourceContainer || !targetContainer || sourceContainer === targetContainer) {
      return;
    }

    // Move item between containers during drag
    const newBoard = { ...board };

    // Remove from source
    if (sourceContainer === 'unranked-pool') {
      newBoard.unrankedItemIds = newBoard.unrankedItemIds.filter((id) => id !== activeId);
    } else {
      const sourceTier = newBoard.tiers.find((t) => t.id === sourceContainer);
      if (sourceTier) {
        sourceTier.itemIds = sourceTier.itemIds.filter((id) => id !== activeId);
      }
    }

    // Add to target
    if (targetContainer === 'unranked-pool') {
      const overIndex = newBoard.unrankedItemIds.indexOf(overId);
      if (overIndex >= 0) {
        newBoard.unrankedItemIds.splice(overIndex, 0, activeId);
      } else {
        newBoard.unrankedItemIds.push(activeId);
      }
    } else {
      const targetTier = newBoard.tiers.find((t) => t.id === targetContainer);
      if (targetTier) {
        const overIndex = targetTier.itemIds.indexOf(overId);
        if (overIndex >= 0) {
          targetTier.itemIds.splice(overIndex, 0, activeId);
        } else {
          targetTier.itemIds.push(activeId);
        }
      }
    }

    setBoard(newBoard);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItemId(null);

    if (!over) {
      if (board) updateBoard(board);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceContainer = findContainer(activeId);
    const targetContainer = findContainer(overId);

    if (!sourceContainer || !targetContainer) {
      return;
    }

    const newBoard = { ...board };

    if (sourceContainer === targetContainer) {
      // Reordering within the same container
      if (sourceContainer === 'unranked-pool') {
        const oldIndex = newBoard.unrankedItemIds.indexOf(activeId);
        const newIndex = newBoard.unrankedItemIds.indexOf(overId);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          newBoard.unrankedItemIds = arrayMove(newBoard.unrankedItemIds, oldIndex, newIndex);
        }
      } else {
        const tier = newBoard.tiers.find((t) => t.id === sourceContainer);
        if (tier) {
          const oldIndex = tier.itemIds.indexOf(activeId);
          const newIndex = tier.itemIds.indexOf(overId);
          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            tier.itemIds = arrayMove(tier.itemIds, oldIndex, newIndex);
          }
        }
      }
    }

    updateBoard(newBoard);
  };

  // Tier operations
  const handleUpdateTier = (tierId: string, updates: Partial<Tier>) => {
    const newTiers = board.tiers.map((t) => (t.id === tierId ? { ...t, ...updates } : t));
    updateBoard({ ...board, tiers: newTiers });
  };

  const handleDeleteTier = (tierId: string) => {
    const tierToDelete = board.tiers.find((t) => t.id === tierId);
    if (!tierToDelete) return;

    // Return items to unranked pool
    const newUnranked = [...board.unrankedItemIds, ...tierToDelete.itemIds];
    const newTiers = board.tiers.filter((t) => t.id !== tierId);
    updateBoard({ ...board, tiers: newTiers, unrankedItemIds: newUnranked });
  };

  const handleClearTier = (tierId: string) => {
    const tierToClear = board.tiers.find((t) => t.id === tierId);
    if (!tierToClear) return;

    const newUnranked = [...board.unrankedItemIds, ...tierToClear.itemIds];
    const newTiers = board.tiers.map((t) => (t.id === tierId ? { ...t, itemIds: [] } : t));
    updateBoard({ ...board, tiers: newTiers, unrankedItemIds: newUnranked });
  };

  const handleMoveTier = (tierId: string, direction: 'up' | 'down') => {
    const index = board.tiers.findIndex((t) => t.id === tierId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= board.tiers.length) return;

    const newTiers = arrayMove(board.tiers, index, targetIndex);
    updateBoard({ ...board, tiers: newTiers });
  };

  const handleAddTier = () => {
    const colorIndex = board.tiers.length % DEFAULT_TIER_COLORS.length;
    const nextColor = DEFAULT_TIER_COLORS[colorIndex];
    const newTier: Tier = {
      id: `tier-${Date.now()}`,
      label: 'NEW',
      color: nextColor,
      itemIds: [],
    };
    updateBoard({ ...board, tiers: [...board.tiers, newTier] });
  };

  const handleAddTextItem = (title: string, tag?: string, color?: string) => {
    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newItem: TierItem = {
      id,
      type: 'text',
      title,
      tag,
      color: color || '#cba6f7',
      createdAt: Date.now(),
    };
    updateBoard({
      ...board,
      items: { ...board.items, [id]: newItem },
      unrankedItemIds: [id, ...board.unrankedItemIds],
    });
  };

  const handleAddTextItems = (titles: string[]) => {
    const newItems: Record<string, TierItem> = { ...board.items };
    const newIds: string[] = [];

    titles.forEach((title) => {
      const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      newItems[id] = {
        id,
        type: 'text',
        title,
        color: '#cba6f7',
        createdAt: Date.now(),
      };
      newIds.push(id);
    });

    updateBoard({
      ...board,
      items: newItems,
      unrankedItemIds: [...newIds, ...board.unrankedItemIds],
    });
  };


  const handleAddImageItems = (images: { title: string; imageUrl: string }[]) => {
    const newItems: Record<string, TierItem> = { ...board.items };
    const newIds: string[] = [];

    images.forEach((img) => {
      const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      newItems[id] = {
        id,
        type: 'image',
        title: img.title,
        imageUrl: img.imageUrl,
        createdAt: Date.now(),
      };
      newIds.push(id);
    });

    updateBoard({
      ...board,
      items: newItems,
      unrankedItemIds: [...newIds, ...board.unrankedItemIds],
    });
  };

  const handleDeleteItem = (itemId: string) => {
    const newItems = { ...board.items };
    delete newItems[itemId];

    const newUnranked = board.unrankedItemIds.filter((id) => id !== itemId);
    const newTiers = board.tiers.map((t) => ({
      ...t,
      itemIds: t.itemIds.filter((id) => id !== itemId),
    }));

    updateBoard({
      ...board,
      items: newItems,
      tiers: newTiers,
      unrankedItemIds: newUnranked,
    });
  };

  const handleUpdateItem = (updatedItem: TierItem) => {
    updateBoard({
      ...board,
      items: {
        ...board.items,
        [updatedItem.id]: updatedItem,
      },
    });
    setInspectingItem(updatedItem);
  };

  const handleMoveItemToTier = (itemId: string, targetTierId: string) => {
    const currentContainer = findContainer(itemId);
    if (!currentContainer || currentContainer === targetTierId) return;

    const newBoard = { ...board };

    if (currentContainer === 'unranked-pool') {
      newBoard.unrankedItemIds = newBoard.unrankedItemIds.filter((id) => id !== itemId);
    } else {
      const sourceTier = newBoard.tiers.find((t) => t.id === currentContainer);
      if (sourceTier) {
        sourceTier.itemIds = sourceTier.itemIds.filter((id) => id !== itemId);
      }
    }

    if (targetTierId === 'unranked-pool') {
      newBoard.unrankedItemIds.push(itemId);
    } else {
      const targetTier = newBoard.tiers.find((t) => t.id === targetTierId);
      if (targetTier) {
        targetTier.itemIds.push(itemId);
      }
    }

    updateBoard(newBoard);
  };

  const handleResetAllItems = () => {
    if (!confirm('Return all ranked items to the unranked pool?')) return;
    const allRanked = board.tiers.flatMap((t) => t.itemIds);
    const newTiers = board.tiers.map((t) => ({ ...t, itemIds: [] }));
    updateBoard({
      ...board,
      tiers: newTiers,
      unrankedItemIds: [...board.unrankedItemIds, ...allRanked],
    });
  };

  const handleShufflePool = () => {
    const shuffled = [...board.unrankedItemIds].sort(() => Math.random() - 0.5);
    updateBoard({ ...board, unrankedItemIds: shuffled });
  };

  const handleClearPool = () => {
    if (!confirm('Remove all unranked items from the pool?')) return;
    const newItems = { ...board.items };
    board.unrankedItemIds.forEach((id) => delete newItems[id]);
    updateBoard({
      ...board,
      items: newItems,
      unrankedItemIds: [],
    });
  };

  // 1v1 Gauntlet auto-distribution
  const handleApplyGauntletRanking = (sortedItemIds: string[]) => {
    if (board.tiers.length === 0) return;

    // Distribute sorted items evenly across tiers
    const count = sortedItemIds.length;
    const tierCount = board.tiers.length;
    const itemsPerTier = Math.ceil(count / tierCount);

    const newTiers = board.tiers.map((tier, idx) => {
      const start = idx * itemsPerTier;
      const end = start + itemsPerTier;
      const tierSlice = sortedItemIds.slice(start, end);
      return {
        ...tier,
        itemIds: [...tier.itemIds, ...tierSlice],
      };
    });

    const rankedSet = new Set(sortedItemIds);
    const remainingUnranked = board.unrankedItemIds.filter((id) => !rankedSet.has(id));

    updateBoard({
      ...board,
      tiers: newTiers,
      unrankedItemIds: remainingUnranked,
    });
  };

  // Active item for DragOverlay
  const activeItem = activeItemId ? board.items[activeItemId] : null;

  return (
    <div className="min-h-screen bg-[#181825] text-[#cdd6f4] flex flex-col font-sans">
      <Header
        board={board}
        onUpdateTitle={(title) => updateBoard({ ...board, title })}
        onAddTier={handleAddTier}
        onResetAllItems={handleResetAllItems}
        onOpenBoardsModal={() => setIsBoardsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onStartGauntlet={() => setIsGauntletOpen(true)}
        unrankedCount={board.unrankedItemIds.length}
        expandAllText={expandAllText}
        onToggleExpandAllText={() => setExpandAllText(!expandAllText)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        <StatsBar tiers={board.tiers} unrankedCount={board.unrankedItemIds.length} />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Main Tier Board Grid for Export */}
          <div
            ref={boardRef}
            className="flex flex-col gap-2.5 bg-[#181825] p-2 md:p-3 rounded-2xl border border-[#313244]/80 shadow-md"
          >
            {board.tiers.map((tier, idx) => {
              const tierItems = tier.itemIds
                .map((id) => board.items[id])
                .filter(Boolean);

              return (
                <TierRow
                  key={tier.id}
                  tier={tier}
                  items={tierItems}
                  onUpdateTier={handleUpdateTier}
                  onDeleteTier={handleDeleteTier}
                  onClearTier={handleClearTier}
                  onMoveTier={handleMoveTier}
                  onDeleteItem={handleDeleteItem}
                  onInspectItem={(item) => setInspectingItem(item)}
                  expandAllText={expandAllText}
                  isFirst={idx === 0}
                  isLast={idx === board.tiers.length - 1}
                />
              );
            })}

            {board.tiers.length === 0 && (
              <div className="py-12 text-center text-[#6c7086] border border-dashed border-[#313244] rounded-xl flex flex-col items-center justify-center gap-2">
                <p>No tiers on this board.</p>
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="tactile-btn text-xs font-semibold px-4 py-2 bg-[#cba6f7] text-[#11111b] rounded-lg"
                >
                  Create First Tier
                </button>
              </div>
            )}
          </div>

          {/* Unranked Items Tray */}
          <UnrankedPool
            items={board.unrankedItemIds.map((id) => board.items[id]).filter(Boolean)}
            onAddTextItem={handleAddTextItem}
            onAddTextItems={handleAddTextItems}
            onAddImageItems={handleAddImageItems}
            onShufflePool={handleShufflePool}
            onClearPool={handleClearPool}
            onDeleteItem={handleDeleteItem}
            onInspectItem={(item) => setInspectingItem(item)}
            expandAllText={expandAllText}
            onStartGauntlet={() => setIsGauntletOpen(true)}
          />

          <DragOverlay dropAnimation={null}>
            {activeItem ? <ItemCard item={activeItem} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Modals */}
      {isExportModalOpen && (
        <ExportModal
          board={board}
          boardElementRef={boardRef}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {isBoardsModalOpen && (
        <BoardsModal
          currentBoardId={board.id}
          savedBoards={savedBoards}
          onSelectBoard={(b) => setBoard(b)}
          onCreateBoard={(title) => {
            const newBoard: Board = {
              id: `board-${Date.now()}`,
              title,
              tiers: [
                { id: 'tier-s', label: 'S', color: '#f38ba8', itemIds: [] },
                { id: 'tier-a', label: 'A', color: '#fab387', itemIds: [] },
                { id: 'tier-b', label: 'B', color: '#f9e2af', itemIds: [] },
                { id: 'tier-c', label: 'C', color: '#a6e3a1', itemIds: [] },
                { id: 'tier-d', label: 'D', color: '#89b4fa', itemIds: [] },
                { id: 'tier-f', label: 'F', color: '#cba6f7', itemIds: [] },
              ],
              unrankedItemIds: [],
              items: {},
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            updateBoard(newBoard);
          }}
          onDeleteBoard={async (id) => {
            await db.boards.delete(id);
            const all = await db.boards.toArray();
            setSavedBoards(all);
          }}
          onImportBoard={(imported) => updateBoard(imported)}
          onClose={() => setIsBoardsModalOpen(false)}
        />
      )}

      {isGauntletOpen && (
        <GauntletModal
          unrankedItems={board.unrankedItemIds.map((id) => board.items[id]).filter(Boolean)}
          tiers={board.tiers}
          onApplyRanking={handleApplyGauntletRanking}
          onClose={() => setIsGauntletOpen(false)}
        />
      )}

      {inspectingItem && (
        <ItemDetailModal
          isOpen={Boolean(inspectingItem)}
          item={inspectingItem}
          tiers={board.tiers}
          currentTierId={findContainer(inspectingItem.id) || 'unranked-pool'}
          onClose={() => setInspectingItem(null)}
          onSave={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
          onMoveToTier={handleMoveItemToTier}
        />
      )}

      <footer className="border-t border-[#313244] py-4 text-center text-xs text-[#6c7086] font-mono flex items-center justify-center gap-2">
        <span>TierCraft</span>
        <span>•</span>
        <span>Created by <a href="https://github.com/samshady" target="_blank" rel="noopener noreferrer" className="text-[#cba6f7] hover:underline font-semibold">Sam Shady</a></span>
      </footer>

    </div>
  );
};

export default App;
