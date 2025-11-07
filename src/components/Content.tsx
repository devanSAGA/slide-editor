import { FiPlus } from 'react-icons/fi';
import SlidesList from './SlidesList';
import Toolbar from './Toolbar';
import Button from './Button';
import { useSlides } from '../contexts/SlideContext';

export default function Content() {
  const { slides, activeSlideIndex, contentRef, setActiveSlideIndex, addTextElement } = useSlides();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded bg-zinc-900">
      <div className="overflow-auto">
        <SlidesList
          ref={contentRef}
          slides={slides}
          activeSlideIndex={activeSlideIndex}
          onActiveSlideChange={setActiveSlideIndex}
        />
      </div>
      <Toolbar>
        <Toolbar.Item>
          <Button variant="ghost" onClick={addTextElement}>
            <FiPlus size={16} />
            Add Text Element
          </Button>
        </Toolbar.Item>
      </Toolbar>
    </div>
  );
}
