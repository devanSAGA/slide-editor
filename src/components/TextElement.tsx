import { useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AiOutlineDelete } from 'react-icons/ai';
import type { TextElement } from '../types';
import { ElementState } from '../types';
import Button from './Button';
import Tooltip from './Tooltip';
import { useSlides } from '../contexts/SlideContext';

interface TextElementProps {
  element: TextElement;
  isActive: boolean;
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
  slideIndex,
}: TextElementProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const clickTimeoutRef = useRef<number | null>(null);
  const { deleteElement, setElementState, updateElement } = useSlides();

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
        setElementState(slideIndex, element.id, ElementState.SELECTED);
      } else if (element.state === ElementState.SELECTED) {
        // SELECTED → EDITING
        setElementState(slideIndex, element.id, ElementState.EDITING);
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
    setElementState(slideIndex, element.id, ElementState.EDITING);
  };

  const handleBlur = () => {
    // Transition EDITING → DEFAULT (content is already saved via onChange)
    setElementState(slideIndex, element.id, ElementState.DEFAULT);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Exit edit mode without further changes
      setElementState(slideIndex, element.id, ElementState.DEFAULT);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Trigger blur which will transition state
      textareaRef.current?.blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Update parent state immediately as user types
    updateElement(slideIndex, element.id, { content: e.target.value });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={`group relative rounded px-2 py-1 ${
        isSelected && isActive
          ? 'bg-blue-500/10 ring-2 ring-blue-500'
          : isEditing
            ? 'bg-green-500/10 ring-2 ring-green-500'
            : 'hover:bg-zinc-700/20'
      }`}
      {...attributes}
      {...listeners}
    >
      {/* Delete button - show when selected and active */}
      {isSelected && isActive && !isEditing && (
        <Tooltip content="Delete element" side="top">
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              deleteElement(slideIndex, element.id);
            }}
            aria-label="Delete element"
            className="absolute z-10 h-7 w-7 rounded-full bg-red-500/90 p-0 text-white shadow-lg hover:bg-red-600 hover:text-white"
            style={{ right: '-12px', top: '-12px' }}
          >
            <AiOutlineDelete size={14} />
          </Button>
        </Tooltip>
      )}

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
