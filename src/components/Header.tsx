import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiCheck, FiCopy } from 'react-icons/fi';
import Button from './Button';
import { useSlides } from '../contexts/SlideContext';
import { TbUserShare } from 'react-icons/tb';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface DropdownOptionProps {
  title: string;
  description: string;
  onClick: () => void;
  isCopied: boolean;
}

interface CopyLinkDropdownProps {
  deckUrl: string;
  slideUrl: string;
  copiedValue: string | null;
  onCopy: (url: string) => void;
  activeSlideIndex: number;
}

function DropdownOption({ title, description, onClick, isCopied }: DropdownOptionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between gap-2 rounded px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-700"
    >
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-xs text-zinc-400">{description}</span>
      </div>
      {isCopied ? (
        <FiCheck className="text-green-500" size={16} />
      ) : (
        <FiCopy className="text-zinc-400" size={16} />
      )}
    </button>
  );
}

function CopyLinkDropdown({
  deckUrl,
  slideUrl,
  copiedValue,
  onCopy,
  activeSlideIndex,
}: CopyLinkDropdownProps) {
  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-zinc-700 bg-zinc-800 shadow-xl">
      <div className="flex flex-col p-2">
        <DropdownOption
          title="Copy link to deck"
          description="Share all slides"
          onClick={() => onCopy(deckUrl)}
          isCopied={copiedValue === deckUrl}
        />

        <DropdownOption
          title="Copy link to current slide"
          description={`Share slide ${activeSlideIndex + 1}`}
          onClick={() => onCopy(slideUrl)}
          isCopied={copiedValue === slideUrl}
        />
      </div>
    </div>
  );
}

export default function Header() {
  const { roomId } = useParams();
  const { activeSlideIndex } = useSlides();
  const [showDropdown, setShowDropdown] = useState(false);
  const { copiedValue, copy } = useCopyToClipboard(2000);

  // Close dropdown after copy completes
  useEffect(() => {
    if (copiedValue) {
      const timer = setTimeout(() => {
        setShowDropdown(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedValue]);

  const deckUrl = `${window.location.origin}/room/${roomId}`;
  const slideUrl = `${window.location.origin}/room/${roomId}?slide=${activeSlideIndex}`;

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
          <CopyLinkDropdown
            deckUrl={deckUrl}
            slideUrl={slideUrl}
            copiedValue={copiedValue}
            onCopy={copy}
            activeSlideIndex={activeSlideIndex}
          />
        )}

        {/* Backdrop to close dropdown */}
        {showDropdown && (
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
        )}
      </div>
    </div>
  );
}
