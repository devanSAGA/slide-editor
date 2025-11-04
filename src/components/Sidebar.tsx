import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <div
      className={`flex h-full flex-col border-r border-zinc-800/50 p-2 text-zinc-300 transition-all duration-300 ${
        isCollapsed ? 'w-9' : 'w-[300px]'
      }`}
    >
      <div>
        <button
          onClick={onToggle}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <GoSidebarExpand
              size={20}
              className="text-zinc-400 hover:text-white"
            />
          ) : (
            <GoSidebarCollapse
              size={20}
              className="text-zinc-400 hover:text-white"
            />
          )}
        </button>
      </div>
      {!isCollapsed && (
        <div className="mt-4 flex flex-1 flex-col overflow-auto">
          <div className="text-sm">Sidebar Content</div>
        </div>
      )}
    </div>
  );
}
