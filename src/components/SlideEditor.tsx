import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlideProvider, useSlides } from '../contexts/SlideContext';
import Sidebar from './Sidebar';
import Header from './Header';
import Content from './Content';

function SlideEditorContent() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchParams] = useSearchParams();
  const { selectSlide, slides } = useSlides();
  const hasScrolledToInitialSlideRef = useRef(false);

  // Handle ?slide=N query parameter - only once on mount
  useEffect(() => {
    const slideParam = searchParams.get('slide');
    if (slideParam !== null && slides.length > 0 && !hasScrolledToInitialSlideRef.current) {
      const slideIndex = parseInt(slideParam, 10);
      if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < slides.length) {
        selectSlide(slideIndex);
        hasScrolledToInitialSlideRef.current = true;
      }
    }
  }, [searchParams, slides.length, selectSlide]);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2">
        <Header />
        <Content />
      </div>
    </div>
  );
}

export default function SlideEditor() {
  return (
    <SlideProvider>
      <SlideEditorContent />
    </SlideProvider>
  );
}
