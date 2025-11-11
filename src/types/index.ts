import { LiveList, LiveObject } from '@liveblocks/client';

export enum ElementState {
  DEFAULT = 'default', // No focus border, draggable
  SELECTED = 'selected', // Shows focus border, draggable
  EDITING = 'editing', // Allows text editing, not draggable
}

export interface TextStyle {
  fontSize?: number;
  fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  textDecoration?: 'none' | 'underline' | 'line-through';
}

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface TextElement {
  [key: string]: any;
  id: string;
  type: 'text';
  content: string;
  transform: Transform;
  style: TextStyle;
  createdAt?: number;
}

export type SlideData = {
  [key: string]: any;
  id: string;
  elements: LiveList<LiveObject<TextElement>>;
};

export type Storage = {
  slides: LiveList<LiveObject<SlideData>>;
};
