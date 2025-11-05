import { forwardRef } from 'react';

interface SlideProps {
  id: string;
  number: number;
}

const Slide = forwardRef<HTMLDivElement, SlideProps>(({ id, number }, ref) => {
  return (
    <div
      ref={ref}
      className="flex min-h-[768px] w-full max-w-[1368px] flex-col rounded-lg bg-zinc-800 shadow-lg"
    >
      <div className="flex-1 p-8">
        <div className="h-full text-zinc-400">
          <span className="text-sm">Slide {number}</span>
        </div>
      </div>
    </div>
  );
});

Slide.displayName = 'Slide';

export default Slide;
