import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import type { SlideData, TextElement } from '../types';
import { ElementState } from '../types';
import { SlidesListHandle } from '../components/SlidesList';

const INITIAL_NUMBER_OF_SLIDES = 4;

interface SlideContextValue {
  // State
  slides: SlideData[];
  activeSlideIndex: number;
  contentRef: React.RefObject<SlidesListHandle | null>;

  // Slide operations
  addSlide: () => void;
  deleteSlide: (index: number) => void;
  selectSlide: (index: number) => void;
  setActiveSlideIndex: (index: number) => void;

  // Element operations
  addTextElement: () => void;
  deleteElement: (slideIndex: number, elementId: string) => void;
  selectElement: (slideIndex: number, elementId: string | null) => void;
  setElementState: (slideIndex: number, elementId: string, state: ElementState) => void;
  updateElement: (slideIndex: number, elementId: string, updates: Partial<TextElement>) => void;
}

const SlideContext = createContext<SlideContextValue | null>(null);

// Generate initial state of 4 slides
const generateInitialSlides = (): SlideData[] => {
  return Array.from({ length: INITIAL_NUMBER_OF_SLIDES }, () => ({
    id: crypto.randomUUID(),
    elements: [],
    selectedElementId: null,
  }));
};

interface SlideProviderProps {
  children: ReactNode;
}

export function SlideProvider({ children }: SlideProviderProps) {
  const [slides, setSlides] = useState<SlideData[]>(generateInitialSlides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const contentRef = useRef<SlidesListHandle>(null);

  const addSlide = () => {
    const newSlide: SlideData = {
      id: crypto.randomUUID(),
      elements: [],
      selectedElementId: null,
    };
    setSlides([...slides, newSlide]);
  };

  const deleteSlide = (index: number) => {
    // Don't delete if it's the last slide
    if (slides.length <= 1) return;

    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);

    // Adjust active slide index if needed
    if (activeSlideIndex >= newSlides.length) {
      setActiveSlideIndex(newSlides.length - 1);
    } else if (activeSlideIndex > index) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const selectSlide = (index: number) => {
    setActiveSlideIndex(index);
    contentRef.current?.scrollToSlide(index);
  };

  const addTextElement = () => {
    const newElementId = `text-${Date.now()}`;
    const newElement: TextElement = {
      id: newElementId,
      type: 'text',
      content: 'Double click to edit',
      transform: {
        x: 300, // Center horizontally (approximate)
        y: 200, // Center vertically (approximate)
        width: 200,
        height: 50,
      },
      style: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#e4e4e7',
        textAlign: 'left',
      },
      state: ElementState.SELECTED, // New elements start in SELECTED state
      createdAt: Date.now(),
    };

    setSlides(
      slides.map((slide, index) =>
        index === activeSlideIndex
          ? {
              ...slide,
              elements: [...slide.elements, newElement],
              selectedElementId: newElementId, // Auto-select the new element
            }
          : slide
      )
    );
  };

  const deleteElement = (slideIndex: number, elementId: string) => {
    setSlides(
      slides.map((slide, index) =>
        index === slideIndex
          ? {
              ...slide,
              elements: slide.elements.filter((el) => el.id !== elementId),
              selectedElementId: slide.selectedElementId === elementId ? null : slide.selectedElementId,
            }
          : slide
      )
    );
  };

  const selectElement = (slideIndex: number, elementId: string | null) => {
    setSlides(
      slides.map((slide, index) => {
        if (index !== slideIndex) return slide;

        return {
          ...slide,
          selectedElementId: elementId,
          elements: slide.elements.map((el) => {
            // Set selected element to SELECTED state
            if (elementId && el.id === elementId && el.state === ElementState.DEFAULT) {
              return { ...el, state: ElementState.SELECTED };
            }
            // Set all other elements to DEFAULT state
            if (el.id !== elementId && el.state !== ElementState.DEFAULT) {
              return { ...el, state: ElementState.DEFAULT };
            }
            return el;
          }),
        };
      })
    );
  };

  const setElementState = (slideIndex: number, elementId: string, state: ElementState) => {
    setSlides(
      slides.map((slide, index) => {
        if (index !== slideIndex) return slide;

        return {
          ...slide,
          // If transitioning to DEFAULT state (e.g., from EDITING), clear selection
          selectedElementId: state === ElementState.DEFAULT ? null : slide.selectedElementId,
          elements: slide.elements.map((el) => (el.id === elementId ? { ...el, state } : el)),
        };
      })
    );
  };

  const updateElement = (slideIndex: number, elementId: string, updates: Partial<TextElement>) => {
    setSlides(
      slides.map((slide, index) =>
        index === slideIndex
          ? {
              ...slide,
              elements: slide.elements.map((el) =>
                el.id === elementId ? { ...el, ...updates } : el
              ),
            }
          : slide
      )
    );
  };

  const value: SlideContextValue = {
    slides,
    activeSlideIndex,
    contentRef,
    addSlide,
    deleteSlide,
    selectSlide,
    setActiveSlideIndex,
    addTextElement,
    deleteElement,
    selectElement,
    setElementState,
    updateElement,
  };

  return <SlideContext.Provider value={value}>{children}</SlideContext.Provider>;
}

export function useSlides() {
  const context = useContext(SlideContext);
  if (!context) {
    throw new Error('useSlides must be used within a SlideProvider');
  }
  return context;
}
