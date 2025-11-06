export enum ElementState {
  DEFAULT = 'default',   // No focus border, draggable
  SELECTED = 'selected', // Shows focus border, draggable
  EDITING = 'editing',   // Allows text editing, not draggable
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

export interface BaseElement {
  id: string;
  type: string;
  transform: Transform;
  createdAt: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  style: TextStyle;
  state: ElementState;
}

export type SlideElement = TextElement;

export interface SlideData {
  id: string;
  elements: TextElement[];
  selectedElementId: string | null;
}
