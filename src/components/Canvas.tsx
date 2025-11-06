import { useRef } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import TextElementComponent from './TextElement';
import type { TextElement } from '../types';
import { ElementState } from '../types';

interface CanvasProps {
  elements: TextElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onSetElementState: (id: string, state: ElementState) => void;
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
  isActive: boolean;
  slideIndex: number;
}

export default function Canvas({
  elements,
  selectedElementId,
  onSelectElement,
  onSetElementState,
  onUpdateElement,
  isActive,
  slideIndex,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

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
      onSelectElement(null);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const element = elements.find((el) => el.id === active.id);

    if (element && element.state === ElementState.DEFAULT) {
      // Dragging DEFAULT element → transition to SELECTED
      onSetElementState(element.id, ElementState.SELECTED);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;

    if (!delta.x && !delta.y) return; // No movement

    const element = elements.find((el) => el.id === active.id);
    if (!element || !canvasRef.current) return;

    // Get canvas bounds (excluding padding)
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const padding = 32; // 8 * 4 = 32px (p-8 in Tailwind)
    const maxWidth = canvasRect.width - padding * 2;
    const maxHeight = canvasRect.height - padding * 2;

    // Calculate new position with constraints
    let newX = element.transform.x + delta.x;
    let newY = element.transform.y + delta.y;

    // Constrain within canvas bounds
    newX = Math.max(0, Math.min(newX, maxWidth - element.transform.width));
    newY = Math.max(0, Math.min(newY, maxHeight - element.transform.height));

    onUpdateElement(element.id, {
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
        {elements.map((element) => (
          <TextElementComponent
            key={element.id}
            element={element}
            isActive={isActive}
            onSetState={(state) => onSetElementState(element.id, state)}
            onUpdate={(updates) => onUpdateElement(element.id, updates)}
            slideIndex={slideIndex}
          />
        ))}
      </div>
    </DndContext>
  );
}
