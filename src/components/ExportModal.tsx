import React, { useState, useMemo } from 'react';
import { Download, Link2, FileJson, Check, X, Sparkles } from 'lucide-react';
import type { Board } from '../types';
import { exportBoardToPng, exportBoardToJson, encodeBoardToUrlHash, shortenUrl } from '../utils/share';

interface ExportModalProps {
  board: Board;
  boardElementRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  board,
  boardElementRef,
  onClose,
}) => {
  const [isExportingPng, setIsExportingPng] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [isShortening, setIsShortening] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);

  // Compute compact direct URL
  const directShareUrl = useMemo(() => {
    const hash = encodeBoardToUrlHash(board);
    const url = new URL(window.location.href);
    url.hash = `tier=${hash}`;
    return url.toString();
  }, [board]);

  const handleDownloadPng = async () => {
    if (!boardElementRef.current) return;
    setIsExportingPng(true);
    try {
      await exportBoardToPng(boardElementRef.current, board.title);
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExportingPng(false);
    }
  };

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(directShareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleCreateShortLink = async () => {
    if (shortUrl) {
      await navigator.clipboard.writeText(shortUrl);
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 2500);
      return;
    }

    setIsShortening(true);
    try {
      const result = await shortenUrl(directShareUrl);
      if (result) {
        setShortUrl(result);
        await navigator.clipboard.writeText(result);
        setCopiedShort(true);
        setTimeout(() => setCopiedShort(false), 2500);
      } else {
        // Fallback to direct link if offline
        await handleCopyShareLink();
      }
    } catch {
      await handleCopyShareLink();
    } finally {
      setIsShortening(false);
    }
  };

  const handleDownloadJson = () => {
    exportBoardToJson(board);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#11111b]/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-2xl p-6 md:p-8 w-full max-w-lg shadow-2xl flex flex-col gap-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#a6adc8] hover:text-[#cdd6f4] rounded-lg hover:bg-[#313244] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-1 text-center">
          <h2 className="font-display font-extrabold text-2xl text-[#cdd6f4]">
            Export & Share
          </h2>
          <p className="text-xs text-[#a6adc8]">
            Download high-resolution image, share via link, or back up to JSON.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* High-Res PNG Download */}
          <button
            type="button"
            onClick={handleDownloadPng}
            disabled={isExportingPng}
            className="tactile-btn p-4 bg-[#181825] hover:bg-[#313244] border border-[#313244] hover:border-[#cba6f7] rounded-xl flex items-center justify-between text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#cba6f7]/20 text-[#cba6f7] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-[#cdd6f4]">
                  Download High-Res PNG
                </div>
                <div className="text-xs text-[#6c7086]">
                  Pixel-perfect image for Twitter, Discord, and Reddit
                </div>
              </div>
            </div>
            <span className="font-mono text-xs text-[#cba6f7] px-2 py-1 bg-[#cba6f7]/10 rounded">
              {isExportingPng ? 'Rendering...' : 'Save PNG'}
            </span>
          </button>

          {/* Copy Compact Shareable URL */}
          <div className="p-4 bg-[#181825] border border-[#313244] hover:border-[#89b4fa] rounded-xl flex flex-col gap-3 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#89b4fa]/20 text-[#89b4fa] flex items-center justify-center flex-shrink-0">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#cdd6f4] flex items-center gap-2">
                    <span>Shareable URL</span>
                    <span className="text-[10px] font-mono text-[#a6e3a1] bg-[#a6e3a1]/10 px-1.5 py-0.5 rounded">
                      {directShareUrl.length} chars
                    </span>
                  </div>
                  <div className="text-xs text-[#6c7086]">
                    Compressed client-side hash, 100% serverless
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyShareLink}
                className="tactile-btn font-mono text-xs text-[#89b4fa] hover:text-[#b4befe] px-3 py-1.5 bg-[#89b4fa]/10 hover:bg-[#89b4fa]/20 rounded-lg flex items-center gap-1 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#a6e3a1]" /> : null}
                <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Quick Short Link Generator */}
            <div className="pt-2 border-t border-[#313244]/60 flex items-center justify-between text-xs">
              <span className="text-[#6c7086]">Want a short 20-character link?</span>
              <button
                type="button"
                onClick={handleCreateShortLink}
                disabled={isShortening}
                className="tactile-btn text-xs font-semibold px-2.5 py-1 text-[#cba6f7] hover:text-white bg-[#cba6f7]/10 hover:bg-[#cba6f7]/30 border border-[#cba6f7]/30 rounded-lg flex items-center gap-1 transition-colors"
              >
                {copiedShort ? (
                  <>
                    <Check className="w-3 h-3 text-[#a6e3a1]" />
                    <span className="text-[#a6e3a1]">Copied Short Link</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-[#cba6f7]" />
                    <span>{isShortening ? 'Shortening...' : shortUrl ? 'Copy Short Link' : 'Generate Short Link'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* JSON Backup */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="tactile-btn p-4 bg-[#181825] hover:bg-[#313244] border border-[#313244] hover:border-[#fab387] rounded-xl flex items-center justify-between text-left transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#fab387]/20 text-[#fab387] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <div className="font-display font-bold text-sm text-[#cdd6f4]">
                  Backup as JSON
                </div>
                <div className="text-xs text-[#6c7086]">
                  Full portable file format (.tier.json)
                </div>
              </div>
            </div>
            <span className="font-mono text-xs text-[#fab387] px-2 py-1 bg-[#fab387]/10 rounded">
              Download
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
