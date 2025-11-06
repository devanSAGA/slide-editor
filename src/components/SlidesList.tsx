import { useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from 'react';
import Slide from './Slide';
import type { SlideData, TextElement } from '../types';
import { ElementState } from '../types';

interface SlidesListProps {
  slides: SlideData[];
  activeSlideIndex: number;
  onActiveSlideChange: (index: number) => void;
  onSelectElement: (slideIndex: number, elementId: string | null) => void;
  onSetElementState: (slideIndex: number, elementId: string, state: ElementState) => void;
  onUpdateElement: (slideIndex: number, elementId: string, updates: Partial<TextElement>) => void;
}

export interface SlidesListHandle {
  scrollToSlide: (index: number) => void;
}

const SlidesList = forwardRef<SlidesListHandle, SlidesListProps>(
  ({ slides, activeSlideIndex, onActiveSlideChange, onSelectElement, onSetElementState, onUpdateElement }, ref) => {
    const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);
    const isProgrammaticScrollRef = useRef(false);
    const scrollTimeoutRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      scrollToSlide: (index: number) => {
        isProgrammaticScrollRef.current = true;

        // Clear any existing timeout
        if (scrollTimeoutRef.current !== null) {
          clearTimeout(scrollTimeoutRef.current);
        }

        const slideElement = slideRefs.current[index];
        const scrollContainer = containerRef.current?.parentElement;

        if (slideElement && scrollContainer) {
          // Get positions relative to the scroll container
          const containerRect = scrollContainer.getBoundingClientRect();
          const slideRect = slideElement.getBoundingClientRect();
          const offset = 20; // 20px space above the slide

          // Calculate scroll position
          const scrollTop = slideRect.top - containerRect.top + scrollContainer.scrollTop - offset;

          scrollContainer.scrollTo({
            top: scrollTop,
            behavior: 'smooth',
          });
        }

        // Use a more reliable approach: listen for scroll end
        const resetFlag = () => {
          isProgrammaticScrollRef.current = false;
          scrollTimeoutRef.current = null;
        };

        // Fallback timeout in case scroll event doesn't fire
        scrollTimeoutRef.current = window.setTimeout(resetFlag, 1500);
      },
    }));

    // Memoize the callback to prevent unnecessary observer recreation
    const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
      if (isProgrammaticScrollRef.current) {
        return;
      }

      // Only process entries that are becoming more visible (entering)
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const index = slideRefs.current.findIndex((el) => el === entry.target);
          if (index !== -1) {
            onActiveSlideChange(index);
          }
        }
      });
    }, [onActiveSlideChange]);

    useEffect(() => {
      const observerOptions = {
        root: null, // Use viewport as root for more reliable detection
        threshold: 0.5, // Single threshold at 50% visibility
        rootMargin: '0px',
      };

      const observer = new IntersectionObserver(handleIntersection, observerOptions);

      slideRefs.current.forEach((slide) => {
        if (slide) {
          observer.observe(slide);
        }
      });

      return () => {
        observer.disconnect();
      };
    }, [slides.length, handleIntersection]);

    // Cleanup scroll timeout on unmount
    useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current !== null) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    const handleSlideClick = (index: number) => {
      onActiveSlideChange(index);
    };

    return (
      <div ref={containerRef} className="flex flex-col items-center gap-4 p-4">
        {slides.map((slide, index) => (
          <Slide
            key={slide.id}
            ref={(el) => {
              slideRefs.current[index] = el;
            }}
            isActive={index === activeSlideIndex}
            onClick={() => handleSlideClick(index)}
            elements={slide.elements}
            selectedElementId={slide.selectedElementId}
            onSelectElement={(elementId) => onSelectElement(index, elementId)}
            onSetElementState={(elementId, state) => onSetElementState(index, elementId, state)}
            onUpdateElement={(elementId, updates) => onUpdateElement(index, elementId, updates)}
            slideIndex={index}
          />
        ))}
      </div>
    );
  }
);

SlidesList.displayName = 'SlidesList';

export default SlidesList;
