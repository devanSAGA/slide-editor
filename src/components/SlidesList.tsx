import { useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import Slide from './Slide';

interface SlidesListProps {
  slides: Array<{ id: string }>;
  activeSlideIndex: number;
  onActiveSlideChange: (index: number) => void;
}

export interface SlidesListHandle {
  scrollToSlide: (index: number) => void;
}

const SlidesList = forwardRef<SlidesListHandle, SlidesListProps>(({ slides, activeSlideIndex, onActiveSlideChange }, ref) => {
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);

  useImperativeHandle(ref, () => ({
    scrollToSlide: (index: number) => {
      isProgrammaticScrollRef.current = true;
      slideRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
      // Reset flag after scroll animation completes (approximately 500ms for smooth scroll)
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 1000);
    },
  }));

  useEffect(() => {
    const observerOptions = {
      root: containerRef.current?.parentElement,
      threshold: 0.5, // Trigger when 50% of the slide is visible
      rootMargin: '0px',
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Skip observation during programmatic scrolling
      if (isProgrammaticScrollRef.current) {
        return;
      }

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = slideRefs.current.findIndex((el) => el === entry.target);
          if (index !== -1 && index !== activeSlideIndex) {
            onActiveSlideChange(index);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    slideRefs.current.forEach((slide) => {
      if (slide) {
        observer.observe(slide);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [slides.length, activeSlideIndex, onActiveSlideChange]);

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
          id={slide.id}
          number={index + 1}
          isActive={index === activeSlideIndex}
          onClick={() => handleSlideClick(index)}
        />
      ))}
    </div>
  );
});

SlidesList.displayName = 'SlidesList';

export default SlidesList;
