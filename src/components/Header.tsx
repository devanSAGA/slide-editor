import Button from './Button';

export default function Header() {
  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share clicked');
  };

  return (
    <div className="flex h-12 items-center justify-between gap-3 rounded border-b border-zinc-800/50 bg-zinc-800 p-2 text-zinc-200">
      <div className="text-lg font-medium">Slide Editor</div>
      <Button variant="primary" onClick={handleShare}>
        Share
      </Button>
    </div>
  );
}
