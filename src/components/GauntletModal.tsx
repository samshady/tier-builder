import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, X, Trophy } from 'lucide-react';
import type { TierItem, Tier } from '../types';


interface GauntletModalProps {
  unrankedItems: TierItem[];
  tiers: Tier[];
  onApplyRanking: (sortedItemIds: string[]) => void;
  onClose: () => void;
}

export const GauntletModal: React.FC<GauntletModalProps> = ({
  unrankedItems,
  tiers,
  onApplyRanking,
  onClose,
}) => {
  // We perform an interactive binary insertion sort
  const [sortedList, setSortedList] = useState<TierItem[]>(() =>
    unrankedItems.length > 0 ? [unrankedItems[0]] : []
  );
  const [currentIndex, setCurrentIndex] = useState(1);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [isFinished, setIsFinished] = useState(unrankedItems.length <= 1);

  const currentItem = unrankedItems[currentIndex];
  const mid = Math.floor((low + high) / 2);
  const comparisonItem = sortedList[mid];

  const handleChoice = (winnerIsCurrent: boolean) => {
    let nextLow = low;
    let nextHigh = high;

    if (winnerIsCurrent) {
      // Current item is better, search lower half (higher rank)
      nextHigh = mid - 1;
    } else {
      // Comparison item is better, search upper half
      nextLow = mid + 1;
    }

    if (nextLow > nextHigh) {
      // Found insertion index for currentItem!
      const newSorted = [...sortedList];
      newSorted.splice(nextLow, 0, currentItem);

      if (currentIndex + 1 >= unrankedItems.length) {
        // Complete!
        setSortedList(newSorted);
        setIsFinished(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        const nextIdx = currentIndex + 1;
        setSortedList(newSorted);
        setCurrentIndex(nextIdx);
        setLow(0);
        setHigh(newSorted.length - 1);
      }
    } else {
      setLow(nextLow);
      setHigh(nextHigh);
    }
  };

  const handleFinishAndDistribute = () => {
    onApplyRanking(sortedList.map((item) => item.id));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11111b]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-6 md:p-8 w-full max-w-2xl shadow-2xl flex flex-col gap-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#a6adc8] hover:text-[#cdd6f4] rounded-lg hover:bg-[#313244] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col gap-1 text-center">
          <div className="flex items-center justify-center gap-2 text-[#cba6f7]">
            <Sparkles className="w-5 h-5" />
            <span className="font-mono text-xs uppercase tracking-wider font-semibold">
              Rapid 1v1 Gauntlet
            </span>
          </div>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-[#cdd6f4]">
            {isFinished ? 'Gauntlet Complete' : 'Which item ranks higher?'}
          </h2>
          {!isFinished && (
            <p className="text-xs text-[#a6adc8]">
              Comparing item {currentIndex + 1} of {unrankedItems.length}
            </p>
          )}
        </div>

        {/* Comparison Arena or Finished View */}
        {!isFinished && currentItem && comparisonItem ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
            {/* Card A (Current Item) */}
            <button
              type="button"
              onClick={() => handleChoice(true)}
              className="tactile-btn flex flex-col items-center justify-center gap-4 p-6 bg-[#181825] hover:bg-[#313244] border-2 border-[#313244] hover:border-[#cba6f7] rounded-xl text-center transition-all group min-h-[220px]"
            >
              {currentItem.type === 'image' && currentItem.imageUrl ? (
                <img
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  className="w-24 h-24 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-lg flex items-center justify-center p-3 font-display font-bold text-center text-sm"
                  style={{
                    backgroundColor: currentItem.color || '#cba6f7',
                    color: '#11111b',
                  }}
                >
                  {currentItem.title}
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                <span className="font-display font-bold text-base md:text-lg text-[#cdd6f4]">
                  {currentItem.title}
                </span>
                {currentItem.tag && (
                  <span className="text-[11px] font-mono text-[#a6adc8] bg-[#313244] px-2 py-0.5 rounded">
                    {currentItem.tag}
                  </span>
                )}
              </div>
            </button>

            {/* Card B (Comparison Item) */}
            <button
              type="button"
              onClick={() => handleChoice(false)}
              className="tactile-btn flex flex-col items-center justify-center gap-4 p-6 bg-[#181825] hover:bg-[#313244] border-2 border-[#313244] hover:border-[#cba6f7] rounded-xl text-center transition-all group min-h-[220px]"
            >
              {comparisonItem.type === 'image' && comparisonItem.imageUrl ? (
                <img
                  src={comparisonItem.imageUrl}
                  alt={comparisonItem.title}
                  className="w-24 h-24 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform"
                />
              ) : (
                <div
                  className="w-24 h-24 rounded-lg flex items-center justify-center p-3 font-display font-bold text-center text-sm"
                  style={{
                    backgroundColor: comparisonItem.color || '#cba6f7',
                    color: '#11111b',
                  }}
                >
                  {comparisonItem.title}
                </div>
              )}
              <div className="flex flex-col items-center gap-1">
                <span className="font-display font-bold text-base md:text-lg text-[#cdd6f4]">
                  {comparisonItem.title}
                </span>
                {comparisonItem.tag && (
                  <span className="text-[11px] font-mono text-[#a6adc8] bg-[#313244] px-2 py-0.5 rounded">
                    {comparisonItem.tag}
                  </span>
                )}
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#a6e3a1]/20 text-[#a6e3a1] flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-[#cdd6f4]">
                All items sorted
              </h3>
              <p className="text-xs text-[#a6adc8] mt-1">
                Items will be distributed sequentially across your {tiers.length} tiers.
              </p>
            </div>

            <div className="w-full max-h-48 overflow-y-auto bg-[#181825] border border-[#313244] rounded-xl p-3 flex flex-wrap gap-2 justify-center">
              {sortedList.map((item, idx) => (
                <span
                  key={item.id}
                  className="font-mono text-xs px-2.5 py-1 rounded bg-[#313244] text-[#cdd6f4] flex items-center gap-1.5"
                >
                  <span className="text-[#a6adc8]">#{idx + 1}</span>
                  {item.title}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={handleFinishAndDistribute}
              className="tactile-btn px-6 py-2.5 bg-[#a6e3a1] hover:bg-[#94e2d5] text-[#11111b] font-display font-bold rounded-xl shadow-lg mt-2"
            >
              Apply to Board
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
