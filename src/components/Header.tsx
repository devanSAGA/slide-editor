import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FiCheck, FiCopy } from 'react-icons/fi';
import Button from './Button';
import { useSlides } from '../contexts/SlideContext';
import { TbUserShare } from 'react-icons/tb';

export default function Header() {
  const { roomId } = useParams();
  const { activeSlideIndex } = useSlides();
  const [copied, setCopied] = useState<'deck' | 'slide' | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const copyToClipboard = async (text: string, type: 'deck' | 'slide') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => {
        setCopied(null);
        setShowDropdown(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareDeck = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    copyToClipboard(url, 'deck');
  };

  const handleShareSlide = () => {
    const url = `${window.location.origin}/room/${roomId}?slide=${activeSlideIndex}`;
    copyToClipboard(url, 'slide');
  };

  return (
    <div className="flex h-12 items-center justify-between gap-3 rounded border-b border-zinc-800/50 bg-zinc-800 py-2 text-zinc-200">
      <div className="pl-4 text-lg font-medium">Slide Editor</div>

      <div className="relative">
        <Button
          variant="primary"
          className="mr-4 px-1.5 py-1.5"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <TbUserShare size={16} />
          Share
        </Button>

        {showDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl">
            <div className="flex flex-col p-2">
              <button
                onClick={handleShareDeck}
                className="flex items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-700"
              >
                <div className="flex flex-col">
                  <span className="font-medium">Copy link to deck</span>
                  <span className="text-xs text-zinc-400">Share all slides</span>
                </div>
                {copied === 'deck' ? (
                  <FiCheck className="text-green-500" size={16} />
                ) : (
                  <FiCopy className="text-zinc-400" size={16} />
                )}
              </button>

              <button
                onClick={handleShareSlide}
                className="flex items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-700"
              >
                <div className="flex flex-col">
                  <span className="font-medium">Copy link to current slide</span>
                  <span className="text-xs text-zinc-400">Share slide {activeSlideIndex + 1}</span>
                </div>
                {copied === 'slide' ? (
                  <FiCheck className="text-green-500" size={16} />
                ) : (
                  <FiCopy className="text-zinc-400" size={16} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Backdrop to close dropdown */}
        {showDropdown && (
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
        )}
      </div>
    </div>
  );
}
