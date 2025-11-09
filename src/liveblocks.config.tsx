import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import { LiveblocksProvider as BaseLiveblocksProvider } from '@liveblocks/react/suspense';
import type { SlideData } from './types';
import type { JsonObject } from '@liveblocks/client';
import type { ReactNode } from 'react';

// Type declaration for import.meta.env
declare global {
  interface ImportMeta {
    env: {
      VITE_LIVEBLOCKS_PUBLIC_KEY: string;
      VITE_USE_AUTH_ENDPOINT: string;
      [key: string]: string;
    };
  }
}

// Create the Liveblocks client with proper configuration
const createLiveblocksClient = () => {
  return createClient({
    authEndpoint: async (room) => {
      const { getUserId } = await import('./utils/userUtils');
      const userId = getUserId();

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          roomId: room,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with Liveblocks');
      }

      const { token } = await response.json();
      return { token };
    },
  });
};

const client = createLiveblocksClient();

// Define slides as JSON-compatible type
type LiveSlideData = JsonObject & SlideData;

// Storage type definition
type Storage = {
  slides: LiveSlideData[];
};

export const {
  RoomProvider,
  useStorage,
  useMutation,
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
  useHistory,
} = createRoomContext<{}, Storage>(client);

export function LiveblocksProvider({ children }: { children: ReactNode }) {
  const providerProps = {
    authEndpoint: async (room?: string) => {
      const { getUserId } = await import('./utils/userUtils');
      const userId = getUserId();

      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          roomId: room,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to authenticate with Liveblocks');
      }

      const { token } = await response.json();
      return { token };
    },
  };

  return <BaseLiveblocksProvider {...providerProps}>{children}</BaseLiveblocksProvider>;
}
