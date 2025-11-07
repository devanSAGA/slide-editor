import { ReactNode, createContext } from 'react';

// Context for Toolbar (if needed for future enhancements)
const ToolbarContext = createContext<Record<string, never>>({});

interface ToolbarProps {
  children: ReactNode;
}

interface ToolbarItemProps {
  children: ReactNode;
}

interface ToolbarDividerProps {
  className?: string;
}

function ToolbarRoot({ children }: ToolbarProps) {
  return (
    <ToolbarContext.Provider value={{}}>
      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 transform">
        <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 p-1 shadow-lg">
          {children}
        </div>
      </div>
    </ToolbarContext.Provider>
  );
}

function ToolbarItem({ children }: ToolbarItemProps) {
  return <>{children}</>;
}

function ToolbarDivider({ className = '' }: ToolbarDividerProps) {
  return <div className={`h-6 w-px bg-zinc-700 ${className}`} />;
}

// Compound component export
const Toolbar = Object.assign(ToolbarRoot, {
  Item: ToolbarItem,
  Divider: ToolbarDivider,
});

export default Toolbar;
