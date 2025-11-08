import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { RoomProvider } from './liveblocks.config';
import SlideEditor from './components/SlideEditor';
import { useEffect } from 'react';
import { ClientSideSuspense } from '@liveblocks/react';

// Component to handle room routing
function RoomWrapper() {
  const { roomId } = useParams();

  return (
    <RoomProvider
      id={roomId}
      initialStorage={() => ({
        slides: [],
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
