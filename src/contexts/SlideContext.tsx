import { createContext, useContext, useState, useRef, ReactNode, useEffect, useMemo } from 'react';
import { LiveList, LiveObject } from '@liveblocks/client';
import {
  useUndo,
  useCanUndo,
  useRedo,
  useCanRedo,
  useStorage,
  useMutation,
} from '@liveblocks/react/suspense';
import { SlidesListHandle } from '../components/SlidesList';
import { SlideData, TextElement } from '../types';

interface SlideContextValue {
  // State
  slides: SlideData[];
  activeSlideIndex: number;
  activeElementId: string | null;
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

interface SlideProviderProps {
  children: ReactNode;
}

export function SlideProvider({ children }: SlideProviderProps) {
  const slides = useStorage((root) => {
    return root.slides;
  }) as SlideData[];
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const contentRef = useRef<SlidesListHandle>(null);

  // History hooks - these are scoped to the current user's changes
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  // Initialize storage with default slide on mount
  const initializeStorage = useMutation(({ storage }) => {
    const slides = storage.get('slides') as LiveList<LiveObject<SlideData>>;

    // Only initialize if slides don't exist or are empty
    if (!slides || slides.length === 0) {
      const newSlidesList = new LiveList<LiveObject<SlideData>>([
        new LiveObject<SlideData>({
          id: crypto.randomUUID(),
          elements: new LiveList<LiveObject<TextElement>>([]),
        }),
      ]);
      storage.set('slides', newSlidesList);
    }
  }, []);

  // Initialize storage on component mount
  useEffect(() => {
    initializeStorage();
  }, [initializeStorage]);

  const addSlide = useMutation(({ storage }) => {
    const slides = storage.get('slides') as LiveList<LiveObject<SlideData>>;

    if (slides) {
      const newSlide = new LiveObject<SlideData>({
        id: crypto.randomUUID(),
        elements: new LiveList<LiveObject<TextElement>>([]),
      });
      slides.push(newSlide);
    }
  }, []);

  // Mutation to delete a slide
  const deleteSlide = useMutation(
    ({ storage }, index: number) => {
      const slides = storage.get('slides') as LiveList<LiveObject<SlideData>>;

      if (!slides || slides.length <= 1) return;

      slides.delete(index);

      // Adjust active slide index if needed
      if (activeSlideIndex >= slides.length) {
        setActiveSlideIndex(slides.length - 1);
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
        // +++ add index signature if needed, see previous suggestions
      };

      const slides = storage.get('slides') as LiveList<LiveObject<SlideData>>;

      if (!slides || slides.length === 0) return;

      const activeSlide = slides.get(activeSlideIndex);
      if (!activeSlide) return;

      const elements = activeSlide.get('elements') as LiveList<LiveObject<TextElement>>;

      if (!elements) return;

      const elementLiveObject = new LiveObject<TextElement>(newElement);

      elements.push(elementLiveObject);

      setActiveElementId(newElementId);
    },
    [activeSlideIndex]
  );

  // Mutation to delete an element
  const deleteElement = useMutation(
    ({ storage }, slideIndex: number, elementId: string) => {
      const slides = storage.get('slides') as LiveList<LiveObject<SlideData>>;
      if (!slides || slides.length <= slideIndex) return;

      const slide = slides.get(slideIndex);
      if (!slide) return;

      const elements = slide.get('elements') as LiveList<LiveObject<TextElement>>;
      if (!elements) return;

      // Find index of element to delete
      const elementIndex = elements.findIndex((el) => el.get('id') === elementId);
      if (elementIndex === -1) return;

      elements.delete(elementIndex);

      // Clear active element if deleted
      if (activeElementId === elementId) {
        setActiveElementId(null);
      }
    },
    [activeElementId]
  );

  const updateElement = useMutation(
    ({ storage }, slideIndex: number, elementId: string, updates: Partial<TextElement>) => {
      const slides = storage.get('slides') as LiveList<LiveObject<SlideData>>;
      if (!slides || slides.length <= slideIndex) return;

      const slide = slides.get(slideIndex);
      if (!slide) return;

      const elements = slide.get('elements') as LiveList<LiveObject<TextElement>>;
      if (!elements) return;

      const element = elements.find((el) => el.get('id') === elementId);
      if (!element) return;

      element.update(updates);
    },
    []
  );

  const value: SlideContextValue = {
    slides,
    activeSlideIndex,
    activeElementId,
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
