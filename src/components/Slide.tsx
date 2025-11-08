import { forwardRef } from 'react';
import Canvas from './Canvas';
import type { TextElement } from '../types';

interface SlideProps {
  isActive: boolean;
  elements: TextElement[];
  slideIndex: number;
}

const Slide = forwardRef<HTMLDivElement, SlideProps>(
  ({ isActive, elements, slideIndex }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex min-h-[768px] w-full max-w-[1368px] flex-col rounded-lg bg-black shadow-lg transition-opacity duration-300 ${
          isActive ? 'border border-gray-100/50 opacity-100' : 'opacity-20'
        }`}
      >
        <Canvas
          elements={elements}
          isActive={isActive}
          slideIndex={slideIndex}
        />
      </div>
    );
  }
);

Slide.displayName = 'Slide';

export default Slide;
