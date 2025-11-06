import { createContext, useContext, useState, useRef, ReactNode } from 'react';
import type { SlideData, TextElement } from '../types';
import { SlidesListHandle } from '../components/SlidesList';

const INITIAL_NUMBER_OF_SLIDES = 4;

interface SlideContextValue {
  // State
  slides: SlideData[];
  activeSlideIndex: number;
  contentRef: React.RefObject<SlidesListHandle>;

  // Slide operations
  addSlide: () => void;
  selectSlide: (index: number) => void;
  setActiveSlideIndex: (index: number) => void;

  // Element operations
  addTextElement: () => void;
  selectElement: (slideIndex: number, elementId: string | null) => void;
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
        fontSize: 24,
        fontWeight: 'normal',
        color: '#e4e4e7',
        textAlign: 'left',
      },
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

  const selectElement = (slideIndex: number, elementId: string | null) => {
    setSlides(
      slides.map((slide, index) =>
        index === slideIndex ? { ...slide, selectedElementId: elementId } : slide
      )
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
    selectSlide,
    setActiveSlideIndex,
    addTextElement,
    selectElement,
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
