import SlidesList from './SlidesList';
import Toolbar from './Toolbar';
import { useSlides } from '../contexts/SlideContext';

export default function Content() {
  const { slides, activeSlideIndex, contentRef, setActiveSlideIndex, addTextElement, selectElement, updateElement } = useSlides();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded bg-zinc-900">
      <div className="overflow-auto">
        <SlidesList
          ref={contentRef}
          slides={slides}
          activeSlideIndex={activeSlideIndex}
          onActiveSlideChange={setActiveSlideIndex}
          onSelectElement={selectElement}
          onUpdateElement={updateElement}
        />
      </div>
      <Toolbar onAddTextElement={addTextElement} />
    </div>
  );
}
