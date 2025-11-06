import { useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { TextElement } from '../types';
import { ElementState } from '../types';

interface TextElementProps {
  element: TextElement;
  isActive: boolean;
  onSetState: (state: ElementState) => void;
  onUpdate: (updates: Partial<TextElement>) => void;
  slideIndex: number;
}

/**
 * TextElement with 3 states managed via ElementState enum:
 * - DEFAULT: No focus ring, draggable
 * - SELECTED: Shows focus ring, draggable
 * - EDITING: Allows text editing, not draggable
 */
export default function TextElement({
  element,
  isActive,
  onSetState,
  onUpdate,
  slideIndex,
}: TextElementProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const clickTimeoutRef = useRef<number | null>(null);

  const isEditing = element.state === ElementState.EDITING;
  const isSelected = element.state === ElementState.SELECTED;
  const isDraggable = isActive && !isEditing;

  // Setup draggable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: element.id,
    disabled: !isDraggable,
    data: {
      element,
      slideIndex,
    },
  });

  // Apply drag transform - instant visual feedback during drag
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${element.transform.x}px`,
    top: `${element.transform.y}px`,
    width: `${element.transform.width}px`,
    minHeight: `${element.transform.height}px`,
    fontSize: `${element.style.fontSize || 16}px`,
    fontWeight: element.style.fontWeight || 'normal',
    fontFamily: element.style.fontFamily || 'inherit',
    color: element.style.color || '#e4e4e7',
    textAlign: element.style.textAlign || 'left',
    textDecoration: element.style.textDecoration || 'none',
    cursor: isEditing ? 'text' : isDragging ? 'grabbing' : isDraggable ? 'grab' : 'default',
    userSelect: isEditing ? 'text' : 'none',
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : undefined, // Disable transitions during drag
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  // Auto-focus textarea when entering edit mode
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation();

    if (isEditing) return;

    // Clear any pending timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Use timeout to distinguish between single and double click
    clickTimeoutRef.current = setTimeout(() => {
      if (element.state === ElementState.DEFAULT) {
        // DEFAULT → SELECTED
        onSetState(ElementState.SELECTED);
      } else if (element.state === ElementState.SELECTED) {
        // SELECTED → EDITING
        onSetState(ElementState.EDITING);
      }
      clickTimeoutRef.current = null;
    }, 200);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isActive) return;
    e.stopPropagation();

    // Clear single click timeout
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // DEFAULT → EDITING or SELECTED → EDITING
    onSetState(ElementState.EDITING);
  };

  const handleBlur = () => {
    // Transition EDITING → DEFAULT (content is already saved via onChange)
    onSetState(ElementState.DEFAULT);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Exit edit mode without further changes
      onSetState(ElementState.DEFAULT);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Trigger blur which will transition state
      textareaRef.current?.blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Update parent state immediately as user types
    onUpdate({ content: e.target.value });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`rounded px-2 py-1 ${
        isSelected && isActive
          ? 'bg-blue-500/10 ring-2 ring-blue-500'
          : isEditing
            ? 'bg-green-500/10 ring-2 ring-green-500'
            : 'hover:bg-zinc-700/20'
      }`}
      {...attributes}
      {...listeners}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={element.content}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="w-full resize-none bg-transparent outline-none"
          style={{
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontFamily: 'inherit',
            color: 'inherit',
            textAlign: 'inherit',
            minHeight: `${element.transform.height}px`,
          }}
        />
      ) : (
        <div className="whitespace-pre-wrap break-words">
          {element.content || 'Double click to edit'}
        </div>
      )}
    </div>
  );
}
