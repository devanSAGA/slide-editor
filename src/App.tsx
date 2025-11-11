import { LiveblocksProvider, ClientSideSuspense } from '@liveblocks/react';
import { RoomProvider } from '@liveblocks/react/suspense';
import { LiveList } from '@liveblocks/client';
import SlideEditor from './components/SlideEditor';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function RoomWrapper() {
  const { roomId = '' } = useParams();

  return (
    <LiveblocksProvider publicApiKey={import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY}>
      <RoomProvider
        id={roomId}
        initialStorage={() => ({
          slides: new LiveList([]),
        })}
      >
        <ClientSideSuspense
          fallback={
            <div className="flex h-screen items-center justify-center bg-zinc-950">
              <div className="text-zinc-400">Loading room...</div>
            </div>
          }
        >
          <SlideEditor />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

// Landing page - generates new room and redirects
function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Generate a random room ID
    const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    navigate(`/room/${roomId}`);
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="text-zinc-400">Loading presentation...</div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/room/:roomId" element={<RoomWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
