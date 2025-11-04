import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Content from './Content';

export default function SlideEditor() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex flex-1 flex-col gap-2 overflow-hidden p-2">
        <Header />
        <Content />
      </div>
    </div>
  );
}
