import { useState, useRef, useId } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Content from './Content';
import { SlidesListHandle } from './SlidesList';

export default function SlideEditor() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const slideIdPrefix = useId();
  const slideCountRef = useRef(0);

  const [slides, setSlides] = useState<Array<{ id: string }>>(() => {
    return Array.from({ length: 4 }, () => ({
      id: `${slideIdPrefix}-${slideCountRef.current++}`,
    }));
  });
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const contentRef = useRef<SlidesListHandle>(null);

  const addNewSlide = () => {
    const id = `${slideIdPrefix}-${slideCountRef.current++}`;
    setSlides([...slides, { id }]);
  };

  const handleSlideClick = (index: number) => {
    setActiveSlideIndex(index);
    contentRef.current?.scrollToSlide(index);
  };

  const handleActiveSlideChange = (index: number) => {
    setActiveSlideIndex(index);
  };

  const handleAddTextElement = () => {
    // TODO: Implement text element creation logic
    console.log('Add text element to slide:', activeSlideIndex);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        slides={slides}
        onAddSlide={addNewSlide}
        onSlideClick={handleSlideClick}
        activeSlideIndex={activeSlideIndex}
      />

      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2">
        <Header />
        <Content ref={contentRef} slides={slides} activeSlideIndex={activeSlideIndex} onActiveSlideChange={handleActiveSlideChange} onAddTextElement={handleAddTextElement} />
      </div>
    </div>
  );
}
