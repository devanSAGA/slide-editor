import { forwardRef } from 'react';
import SlidesList, { SlidesListHandle } from './SlidesList';

interface ContentProps {
  slides: Array<{ id: string }>;
}

const Content = forwardRef<SlidesListHandle, ContentProps>(({ slides }, ref) => {
  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded bg-zinc-900">
      <div className="overflow-auto">
        <SlidesList ref={ref} slides={slides} />
      </div>
    </div>
  );
});

Content.displayName = 'Content';

export default Content;
