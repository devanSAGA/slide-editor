import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { FiPlus } from 'react-icons/fi';
import { AiOutlineDelete } from 'react-icons/ai';
import { useSlides } from '../contexts/SlideContext';
import Button from './Button';
import Tooltip from './Tooltip';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { slides, activeSlideIndex, addSlide, deleteSlide, selectSlide } = useSlides();
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate item height: 133px per item
  const virtualizer = useVirtualizer({
    count: slides.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 133,
    overscan: 2,
  });

  return (
    <div
      className={`flex h-full flex-col border-r border-zinc-800/50 text-zinc-300 transition-all duration-300 ${
        isCollapsed ? 'w-[48px]' : 'w-[240px]'
      }`}
    >
      <div className={`flex items-center justify-end ${isCollapsed ? 'p-2 pb-0' : 'p-2'}`}>
        <Tooltip content={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} side="right">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <GoSidebarExpand size={20} /> : <GoSidebarCollapse size={20} />}
          </Button>
        </Tooltip>
      </div>
      {!isCollapsed && (
        <>
          <div ref={parentRef} className="flex flex-1 flex-col overflow-auto p-4">
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
                {virtualizer.getVirtualItems().map((virtualItem) => {
                  const index = virtualItem.index;
                  return (
                    <div
                      key={virtualItem.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <div
                        className={`group relative flex aspect-video cursor-pointer items-center justify-center rounded-lg transition-all ${
                          index === activeSlideIndex
                            ? 'ring-2 ring-blue-800'
                            : 'bg-zinc-800 hover:bg-zinc-700'
                        }`}
                        onClick={() => selectSlide(index)}
                      >
                        <span
                          className={`text-2xl font-semibold ${
                            index === activeSlideIndex ? 'text-white' : 'text-zinc-400'
                          }`}
                        >
                          {index + 1}
                        </span>
                        {slides.length > 1 && (
                          <div className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <Tooltip content="Delete slide" side="left">
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSlide(index);
                                }}
                                aria-label="Delete slide"
                              >
                                <AiOutlineDelete size={16} />
                              </Button>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
          </div>
          <div className="mt-2 border-t border-zinc-800/50 p-4">
            <Button variant="secondary" onClick={addSlide} className="w-full">
              <FiPlus size={16} />
              New Slide
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
