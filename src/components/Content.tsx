import { FiPlus } from 'react-icons/fi';
import SlidesList from './SlidesList';
import Toolbar from './Toolbar';
import Button from './Button';
import Skeleton from './Skeleton';
import { useSlides } from '../contexts/SlideContext';

export default function Content() {
  const { slides, activeSlideIndex, isLoading, contentRef, setActiveSlideIndex, addTextElement } =
    useSlides();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden rounded bg-zinc-900">
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <Skeleton width={1368} height={768} />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <SlidesList
            ref={contentRef}
            slides={slides}
            activeSlideIndex={activeSlideIndex}
            onActiveSlideChange={setActiveSlideIndex}
          />
        </div>
      )}
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
