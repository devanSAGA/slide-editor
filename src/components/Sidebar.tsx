import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { FiPlus } from 'react-icons/fi';
import { useSlides } from '../contexts/SlideContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { slides, activeSlideIndex, addSlide, selectSlide } = useSlides();
  return (
    <div
      className={`flex h-full flex-col border-r border-zinc-800/50 text-zinc-300 transition-all duration-300 ${
        isCollapsed ? 'w-[52px]' : 'w-[300px]'
      }`}
    >
      <div className={`flex items-center justify-end ${isCollapsed ? 'p-4 pb-0' : 'p-4 pb-0'}`}>
        <button onClick={onToggle} aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {isCollapsed ? (
            <GoSidebarExpand size={20} className="text-zinc-400 hover:text-white" />
          ) : (
            <GoSidebarCollapse size={20} className="text-zinc-400 hover:text-white" />
          )}
        </button>
      </div>
      {!isCollapsed && (
        <>
          <div className="flex flex-1 flex-col gap-4 overflow-auto p-4">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => selectSlide(index)}
                className={`flex aspect-video cursor-pointer items-center justify-center rounded-lg transition-all ${
                  index === activeSlideIndex
                    ? 'ring-2 ring-blue-800'
                    : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                <span
                  className={`text-2xl font-semibold ${
                    index === activeSlideIndex ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  {index + 1}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 border-t border-zinc-800/50 p-4">
            <button
              onClick={addSlide}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-700 px-4 py-2 text-sm text-zinc-200 transition-colors hover:bg-zinc-600"
            >
              <FiPlus size={16} />
              New Slide
            </button>
          </div>
        </>
      )}
    </div>
  );
}
