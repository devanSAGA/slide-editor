import { forwardRef } from 'react';
import Canvas from './Canvas';
import type { TextElement } from '../types';
import { ElementState } from '../types';

interface SlideProps {
  isActive: boolean;
  onClick: () => void;
  elements: TextElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onSetElementState: (id: string, state: ElementState) => void;
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
  slideIndex: number;
}

const Slide = forwardRef<HTMLDivElement, SlideProps>(
  ({ isActive, onClick, elements, selectedElementId, onSelectElement, onSetElementState, onUpdateElement, slideIndex }, ref) => {
    const handleSlideClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClick();
      }
    };

    return (
      <div
        ref={ref}
        onClick={handleSlideClick}
        className={`flex min-h-[768px] w-full max-w-[1368px] flex-col rounded-lg bg-zinc-800 shadow-lg transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'opacity-20'
        }`}
      >
        <Canvas
          elements={elements}
          selectedElementId={selectedElementId}
          onSelectElement={onSelectElement}
          onSetElementState={onSetElementState}
          onUpdateElement={onUpdateElement}
          isActive={isActive}
          slideIndex={slideIndex}
        />
      </div>
    );
  }
);

Slide.displayName = 'Slide';

export default Slide;
