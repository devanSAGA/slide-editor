import { useRef, useImperativeHandle, forwardRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useSlideVisibility } from '../hooks/useSlideVisibility';
import Slide from './Slide';
import type { SlideData } from '../types';

interface SlidesListProps {
  slides: SlideData[];
  activeSlideIndex: number;
  onActiveSlideChange: (index: number) => void;
}

export interface SlidesListHandle {
  scrollToSlide: (index: number) => void;
}

const SlidesList = forwardRef<SlidesListHandle, SlidesListProps>(
  ({ slides, activeSlideIndex, onActiveSlideChange }, ref) => {
    const parentRef = useRef<HTMLDivElement>(null);

    // Virtualizer: 768px slide height + 64px gap = 832px per item
    const virtualizer = useVirtualizer({
      count: slides.length,
      getScrollElement: () => parentRef.current?.parentElement || null,
      estimateSize: () => 832,
      overscan: 1,
    });

    // Use custom hook for slide visibility detection
    const { getSlideRef, pauseDetection } = useSlideVisibility({
      onVisibleSlideChange: onActiveSlideChange,
      threshold: 0.5,
    });

    useImperativeHandle(ref, () => ({
      scrollToSlide: (index: number) => {
        // Pause visibility detection during programmatic scroll
        pauseDetection();

        // Use virtualizer to scroll to the item
        virtualizer.scrollToIndex(index, {
          align: 'start',
          behavior: 'smooth',
        });
      },
    }));

    const virtualItems = virtualizer.getVirtualItems();

    return (
      <div ref={parentRef} className="flex flex-col items-center gap-16 p-4">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualItems.map((virtualItem) => {
            const index = virtualItem.index;
            const slide = slides[index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: `translate(-50%, ${virtualItem.start}px)`,
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Slide
                  ref={getSlideRef(index)}
                  isActive={index === activeSlideIndex}
                  elements={slide.elements}
                  selectedElementId={slide.selectedElementId}
                  slideIndex={index}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);

SlidesList.displayName = 'SlidesList';

export default SlidesList;
