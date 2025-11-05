import { forwardRef } from 'react';
import SlidesList, { SlidesListHandle } from './SlidesList';
import Toolbar from './Toolbar';

interface ContentProps {
  slides: Array<{ id: string }>;
  activeSlideIndex: number;
  onActiveSlideChange: (index: number) => void;
  onAddTextElement: () => void;
}

const Content = forwardRef<SlidesListHandle, ContentProps>(
  ({ slides, activeSlideIndex, onActiveSlideChange, onAddTextElement }, ref) => {
    return (
      <div className="relative flex flex-1 flex-col overflow-hidden rounded bg-zinc-900">
        <div className="overflow-auto">
          <SlidesList
            ref={ref}
            slides={slides}
            activeSlideIndex={activeSlideIndex}
            onActiveSlideChange={onActiveSlideChange}
          />
        </div>
        <Toolbar onAddTextElement={onAddTextElement} />
      </div>
    );
  }
);

Content.displayName = 'Content';

export default Content;
