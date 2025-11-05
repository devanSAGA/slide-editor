import { FiPlus } from 'react-icons/fi';

interface ToolbarProps {
  onAddTextElement: () => void;
}

export default function Toolbar({ onAddTextElement }: ToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transform">
      <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-lg">
        <button
          onClick={onAddTextElement}
          className="flex items-center gap-2 rounded-md px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-700"
        >
          <FiPlus size={16} />
          Add Text Element
        </button>
      </div>
    </div>
  );
}
