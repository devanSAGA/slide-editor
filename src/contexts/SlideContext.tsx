import { createContext, useContext, useState, useRef, ReactNode, useEffect, useMemo } from 'react';
import type { SlideData, TextElement } from '../types';
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
  activeElementId: string | null;
  isLoading: boolean;
  contentRef: React.RefObject<SlidesListHandle | null>;

  // Slide operations
  addSlide: () => void;
  deleteSlide: (index: number) => void;
  selectSlide: (index: number) => void;
  setActiveSlideIndex: (index: number) => void;

  // Element operations
  addTextElement: () => void;
  deleteElement: (slideIndex: number, elementId: string) => void;
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
  }));
};

interface SlideProviderProps {
  children: ReactNode;
}

export function SlideProvider({ children }: SlideProviderProps) {
  // Get slides from Liveblocks storage and normalize the data
  const rawSlides = useStorage((root) => root.slides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
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
        createdAt: Date.now(),
      };

      const currentSlides = storage.get('slides') || [];

      // Simply add the new element to the active slide
      const updatedSlides = currentSlides.map((slide, index) =>
        index === activeSlideIndex
          ? {
              ...slide,
              elements: [...(slide.elements || []), newElement],
            }
          : slide
      );
      storage.set('slides', updatedSlides as any);

      // Set active element in context
      setActiveElementId(newElementId);
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
      };
    });
    storage.set('slides', updatedSlides as any);

    // Clear active element if it was deleted
    if (activeElementId === elementId) {
      setActiveElementId(null);
    }
  }, [activeElementId]);


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

  // Compute loading state: true if storage not loaded or slides are initializing
  const isLoading = rawSlides === null || (rawSlides.length === 0 && !isInitialized);

  const value: SlideContextValue = {
    slides,
    activeSlideIndex,
    activeElementId,
    isLoading,
    contentRef,
    addSlide,
    deleteSlide,
    selectSlide,
    setActiveSlideIndex,
    addTextElement,
    deleteElement,
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
