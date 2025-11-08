import { useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import TextElementComponent from './TextElement';
import type { TextElement } from '../types';
import { ElementState } from '../types';
import { useSlides } from '../contexts/SlideContext';

interface CanvasProps {
  elements: TextElement[];
  isActive: boolean;
  slideIndex: number;
}

export default function Canvas({ elements, isActive, slideIndex }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { selectElement, setElementState, updateElement } = useSlides();

  // Defensive: ensure elements is always an array
  const safeElements = Array.isArray(elements) ? elements : [];

  // Configure drag sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    })
  );

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && isActive) {
      e.stopPropagation();
      selectElement(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const element = safeElements.find((el) => el.id === active.id);

    if (element && element.state === ElementState.DEFAULT) {
      // Dragging DEFAULT element → transition to SELECTED
      setElementState(element.id, ElementState.SELECTED);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (!delta.x && !delta.y) return; // No movement

    const element = safeElements.find((el) => el.id === active.id);
    if (!element || !canvasRef.current) return;

    // Get canvas bounds (excluding padding)
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const padding = 32;
    const maxWidth = canvasRect.width - padding * 2;
    const maxHeight = canvasRect.height - padding * 2;

    // Calculate new position with constraints
    let newX = element.transform.x + delta.x;
    let newY = element.transform.y + delta.y;

    // Constrain within canvas bounds
    newX = Math.max(0, Math.min(newX, maxWidth - element.transform.width));
    newY = Math.max(0, Math.min(newY, maxHeight - element.transform.height));

    updateElement(slideIndex, element.id, {
      transform: {
        ...element.transform,
        x: newX,
        y: newY,
      },
    });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement]}
    >
      <div
        ref={canvasRef}
        className="relative h-full w-full rounded-lg p-8"
        onClick={handleCanvasClick}
        style={{ minHeight: '768px' }}
      >
        {safeElements.map((element) => (
          <TextElementComponent
            key={element.id}
            element={element}
            isActive={isActive}
            slideIndex={slideIndex}
          />
        ))}
      </div>
    </DndContext>
  );
}
