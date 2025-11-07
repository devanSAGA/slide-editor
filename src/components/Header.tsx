import { TbUserShare } from 'react-icons/tb';
import Button from './Button';

export default function Header() {
  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share clicked');
  };

  return (
    <div className="flex h-12 items-center justify-between gap-3 rounded border-b border-zinc-800/50 bg-zinc-800 py-2 text-zinc-200">
      <div className="pl-4 text-lg font-medium">Slide Editor</div>
      <Button variant="primary" className="mr-4 px-1.5 py-1.5" onClick={handleShare}>
        <TbUserShare size={16} />
        Share
      </Button>
    </div>
  );
}
