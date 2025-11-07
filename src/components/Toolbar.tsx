import { FiPlus } from 'react-icons/fi';
import Button from './Button';

interface ToolbarProps {
  onAddTextElement: () => void;
}

export default function Toolbar({ onAddTextElement }: ToolbarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transform">
      <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-lg">
        <Button
          variant="ghost"
          onClick={onAddTextElement}
        >
          <FiPlus size={16} />
          Add Text Element
        </Button>
      </div>
    </div>
  );
}
