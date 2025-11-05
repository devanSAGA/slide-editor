import { useRef, useImperativeHandle, forwardRef } from 'react';
import Slide from './Slide';

interface SlidesListProps {
  slides: Array<{ id: string }>;
}

export interface SlidesListHandle {
  scrollToSlide: (index: number) => void;
}

const SlidesList = forwardRef<SlidesListHandle, SlidesListProps>(({ slides }, ref) => {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useImperativeHandle(ref, () => ({
    scrollToSlide: (index: number) => {
      slideRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    },
  }));

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {slides.map((slide, index) => (
        <Slide
          key={slide.id}
          ref={(el) => {
            slideRefs.current[index] = el;
          }}
          id={slide.id}
          number={index + 1}
        />
      ))}
    </div>
  );
});

SlidesList.displayName = 'SlidesList';

export default SlidesList;
