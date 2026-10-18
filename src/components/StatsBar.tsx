import React from 'react';
import type { Tier } from '../types';


interface StatsBarProps {
  tiers: Tier[];
  unrankedCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ tiers, unrankedCount }) => {
  const totalRanked = tiers.reduce((acc, t) => acc + t.itemIds.length, 0);
  const grandTotal = totalRanked + unrankedCount;

  if (grandTotal === 0) return null;

  return (
    <div className="bg-[#181825] border border-[#313244] rounded-xl p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#a6adc8]">Board Distribution</span>
        <span className="font-mono text-[#6c7086]">
          {totalRanked} ranked ({Math.round((totalRanked / (grandTotal || 1)) * 100)}% complete)
        </span>
      </div>

      {/* Segmented bar */}
      <div className="w-full h-2.5 bg-[#313244] rounded-full overflow-hidden flex">
        {tiers.map((tier) => {
          const pct = grandTotal > 0 ? (tier.itemIds.length / grandTotal) * 100 : 0;
          if (pct === 0) return null;
          return (
            <div
              key={tier.id}
              style={{
                width: `${pct}%`,
                backgroundColor: tier.color,
              }}
              title={`${tier.label}: ${tier.itemIds.length} items (${Math.round(pct)}%)`}
              className="h-full transition-all duration-300"
            />
          );
        })}
      </div>

      {/* Pill summary */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
        {tiers.map((tier) => (
          <div key={tier.id} className="flex items-center gap-1.5 bg-[#1e1e2e] px-2 py-0.5 rounded border border-[#313244]">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: tier.color }}
            />
            <span className="text-[#cdd6f4] font-semibold">{tier.label}:</span>
            <span className="text-[#a6adc8]">{tier.itemIds.length}</span>
          </div>
        ))}
        {unrankedCount > 0 && (
          <div className="flex items-center gap-1.5 bg-[#1e1e2e] px-2 py-0.5 rounded border border-[#313244]">
            <span className="w-2 h-2 rounded-full inline-block bg-[#6c7086]" />
            <span className="text-[#6c7086]">Unranked:</span>
            <span className="text-[#a6adc8]">{unrankedCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};
