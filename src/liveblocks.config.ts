import { createClient } from '@liveblocks/client';
import { createRoomContext } from '@liveblocks/react';
import type { SlideData } from './types';
import type { JsonObject } from '@liveblocks/client';

const client = createClient({
  // @ts-ignore
  publicApiKey: import.meta.env.VITE_LIVEBLOCKS_PUBLIC_KEY,
});

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
  useHistory
} = createRoomContext<{}, Storage>(client);
