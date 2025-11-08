import { createContext, useContext, useState, useRef, ReactNode, useEffect, useMemo } from 'react';
import type { SlideData, TextElement } from '../types';
import { ElementState } from '../types';
import { SlidesListHandle } from '../components/SlidesList';
import {
  useStorage,
  useMutation,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
} from '../liveblocks.config';

const INITIAL_NUMBER_OF_SLIDES = 1;

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

  // History operations
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const SlideContext = createContext<SlideContextValue | null>(null);

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
  // Get slides from Liveblocks storage and normalize the data
  const rawSlides = useStorage((root) => root.slides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const contentRef = useRef<SlidesListHandle>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // History hooks - these are scoped to the current user's changes
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // Normalize slides to ensure all required fields exist
  // useMemo prevents creating new objects on every render
  const slides: SlideData[] = useMemo(
    () =>
      rawSlides
        ? rawSlides.map((slide) => ({
            id: slide?.id || crypto.randomUUID(),
            elements: Array.isArray(slide?.elements) ? slide.elements : [],
            selectedElementId: slide?.selectedElementId ?? null,
          }))
        : [],
    [rawSlides]
  );

  // Mutation to initialize slides
  const initializeSlides = useMutation(({ storage }) => {
    const currentSlides = storage.get('slides');
    if (!currentSlides || currentSlides.length === 0) {
      storage.set('slides', generateInitialSlides() as any);
    }
    setIsInitialized(true);
  }, []);

  // Initialize slides if empty - only after storage is loaded
  useEffect(() => {
    if (rawSlides !== null && !isInitialized && rawSlides.length === 0) {
      initializeSlides();
    } else if (rawSlides !== null && rawSlides.length > 0) {
      setIsInitialized(true);
    }
  }, [rawSlides, isInitialized, initializeSlides]);

  // Mutation to add a new slide
  const addSlide = useMutation(({ storage }) => {
    const newSlide: SlideData = {
      id: crypto.randomUUID(),
      elements: [],
      selectedElementId: null,
    };
    const currentSlides = storage.get('slides') || [];
    storage.set('slides', [...currentSlides, newSlide] as any);
  }, []);

  // Mutation to delete a slide
  const deleteSlide = useMutation(
    ({ storage }, index: number) => {
      const currentSlides = storage.get('slides') || [];
      // Don't delete if it's the last slide
      if (currentSlides.length <= 1) return;

      const newSlides = currentSlides.filter((_, i) => i !== index);
      storage.set('slides', newSlides as any);

      // Adjust active slide index if needed
      if (activeSlideIndex >= newSlides.length) {
        setActiveSlideIndex(newSlides.length - 1);
      } else if (activeSlideIndex > index) {
        setActiveSlideIndex(activeSlideIndex - 1);
      }
    },
    [activeSlideIndex]
  );

  const selectSlide = (index: number) => {
    setActiveSlideIndex(index);
    contentRef.current?.scrollToSlide(index);
  };

  // Mutation to add a text element
  const addTextElement = useMutation(
    ({ storage }) => {
      const newElementId = crypto.randomUUID();
      const newElement: TextElement = {
        id: newElementId,
        type: 'text',
        content: 'Double click to edit',
        transform: {
          x: 300,
          y: 200,
          width: 200,
          height: 50,
        },
        style: {
          fontSize: 16,
          fontWeight: 'normal',
          color: '#e4e4e7',
          textAlign: 'left',
        },
        state: ElementState.SELECTED,
        createdAt: Date.now(),
      };

      const currentSlides = storage.get('slides') || [];
      const updatedSlides = currentSlides.map((slide, index) =>
        index === activeSlideIndex
          ? {
              ...slide,
              elements: [...(slide.elements || []), newElement],
              selectedElementId: newElementId,
            }
          : slide
      );
      storage.set('slides', updatedSlides as any);
    },
    [activeSlideIndex]
  );

  // Mutation to delete an element
  const deleteElement = useMutation(({ storage }, slideIndex: number, elementId: string) => {
    const currentSlides = storage.get('slides') || [];
    const updatedSlides = currentSlides.map((slide, index) => {
      if (index !== slideIndex) return slide;

      return {
        ...slide,
        elements: (slide.elements || []).filter((el) => el.id !== elementId),
        selectedElementId: slide.selectedElementId === elementId ? null : slide.selectedElementId,
      };
    });
    storage.set('slides', updatedSlides as any);
  }, []);

  // Mutation to select an element
  const selectElement = useMutation(({ storage }, slideIndex: number, elementId: string | null) => {
    const currentSlides = storage.get('slides') || [];
    const updatedSlides = currentSlides.map((slide, index) => {
      if (index !== slideIndex) return slide;

      return {
        ...slide,
        selectedElementId: elementId,
        elements: (slide.elements || []).map((el) => {
          if (elementId && el.id === elementId && el.state === ElementState.DEFAULT) {
            return { ...el, state: ElementState.SELECTED };
          }
          if (el.id !== elementId && el.state !== ElementState.DEFAULT) {
            return { ...el, state: ElementState.DEFAULT };
          }
          return el;
        }),
      };
    });
    storage.set('slides', updatedSlides as any);
  }, []);

  // Mutation to set element state
  const setElementState = useMutation(
    ({ storage }, slideIndex: number, elementId: string, state: ElementState) => {
      const currentSlides = storage.get('slides') || [];
      const updatedSlides = currentSlides.map((slide, index) => {
        if (index !== slideIndex) return slide;

        return {
          ...slide,
          selectedElementId: state === ElementState.DEFAULT ? null : slide.selectedElementId,
          elements: (slide.elements || []).map((el) =>
            el.id === elementId ? { ...el, state } : el
          ),
        };
      });
      storage.set('slides', updatedSlides as any);
    },
    []
  );

  // Mutation to update an element
  const updateElement = useMutation(
    ({ storage }, slideIndex: number, elementId: string, updates: Partial<TextElement>) => {
      const currentSlides = storage.get('slides') || [];
      const updatedSlides = currentSlides.map((slide, index) =>
        index === slideIndex
          ? {
              ...slide,
              elements: (slide.elements || []).map((el) =>
                el.id === elementId ? { ...el, ...updates } : el
              ),
            }
          : slide
      );
      storage.set('slides', updatedSlides as any);
    },
    []
  );

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
    undo,
    redo,
    canUndo,
    canRedo,
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
