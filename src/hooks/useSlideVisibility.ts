import { useEffect, useRef, useCallback } from 'react';

interface UseSlideVisibilityOptions {
  /**
   * Callback fired when the most visible slide changes
   */
  onVisibleSlideChange: (index: number) => void;
  /**
   * Threshold for intersection (0-1). Default: 0.5 (50%)
   */
  threshold?: number;
  /**
   * Whether the hook is enabled. Default: true
   */
  enabled?: boolean;
}

interface UseSlideVisibilityReturn {
  getSlideRef: (index: number) => (el: HTMLDivElement | null) => void;
  pauseDetection: () => void;
  resumeDetection: () => void;
}

/**
 * Custom hook to detect which slide is most visible in the viewport
 * Uses IntersectionObserver to determine when a slide is >50% visible
 * Works seamlessly with virtualized lists by observing/unobserving dynamically
 */
export function useSlideVisibility({
  onVisibleSlideChange,
  threshold = 0.5,
  enabled = true,
}: UseSlideVisibilityOptions): UseSlideVisibilityReturn {
  const isPausedRef = useRef(false);
  const pauseTimeoutRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Map element -> index for O(1) lookup
  const elementToIndexRef = useRef<Map<Element, number>>(new Map());

  // Track intersection ratios for all visible slides
  const visibilityMapRef = useRef<Map<number, number>>(new Map());

  const pauseDetection = useCallback(() => {
    isPausedRef.current = true;

    // Clear any existing timeout
    if (pauseTimeoutRef.current !== null) {
      clearTimeout(pauseTimeoutRef.current);
    }

    // Auto-resume after 1.5 seconds as a safety measure
    pauseTimeoutRef.current = window.setTimeout(() => {
      isPausedRef.current = false;
      pauseTimeoutRef.current = null;
    }, 1500);
  }, []);

  const resumeDetection = useCallback(() => {
    if (pauseTimeoutRef.current !== null) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    isPausedRef.current = false;
  }, []);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (!enabled || isPausedRef.current) {
        return;
      }

      // Update the visibility map with current intersection ratios
      entries.forEach((entry) => {
        const index = elementToIndexRef.current.get(entry.target);
        if (index !== undefined) {
          if (entry.isIntersecting) {
            visibilityMapRef.current.set(index, entry.intersectionRatio);
          } else {
            visibilityMapRef.current.delete(index);
          }
        }
      });

      // Find the slide with the highest intersection ratio
      let maxRatio = 0;
      let mostVisibleIndex = -1;

      visibilityMapRef.current.forEach((ratio, index) => {
        if (ratio > maxRatio && ratio >= threshold) {
          maxRatio = ratio;
          mostVisibleIndex = index;
        }
      });

      // Only trigger callback if we found a visible slide
      if (mostVisibleIndex !== -1) {
        onVisibleSlideChange(mostVisibleIndex);
      }
    },
    [enabled, threshold, onVisibleSlideChange]
  );

  // Initialize IntersectionObserver once
  useEffect(() => {
    if (!enabled) return;

    const observerOptions: IntersectionObserverInit = {
      root: null, // viewport
      threshold: [0, 0.25, 0.5, 0.75, 1], // Multiple thresholds for accurate tracking
      rootMargin: '0px',
    };

    observerRef.current = new IntersectionObserver(handleIntersection, observerOptions);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      elementToIndexRef.current.clear();
      visibilityMapRef.current.clear();
    };
  }, [enabled, handleIntersection]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current !== null) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // Return a callback ref function that observes/unobserves dynamically
  const getSlideRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      if (!observerRef.current) return;

      // Find and unobserve any previous element at this index
      elementToIndexRef.current.forEach((idx, element) => {
        if (idx === index) {
          observerRef.current?.unobserve(element);
          elementToIndexRef.current.delete(element);
        }
      });

      // Observe the new element
      if (el) {
        elementToIndexRef.current.set(el, index);
        observerRef.current.observe(el);
      }
    };
  }, []);

  return {
    getSlideRef,
    pauseDetection,
    resumeDetection,
  };
}
