import { useRef, useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AiOutlineDelete } from 'react-icons/ai';
import type { TextElement } from '../types';
import { ElementState } from '../types';
import Button from './Button';
import Tooltip from './Tooltip';
import { useSlides } from '../contexts/SlideContext';
import { useHistory } from '@liveblocks/react';

interface TextElementProps {
  element: TextElement;
  isActive: boolean;
  slideIndex: number;
  isNewlyCreated?: boolean;
}

export default function TextElement({
  element,
  isActive,
  slideIndex,
  isNewlyCreated = false,
}: TextElementProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const clickTimeoutRef = useRef<number | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const { deleteElement, updateElement } = useSlides();
  const history = useHistory();

  /**
   * TextElement with 3 states managed via ElementState enum:
   * - DEFAULT: No focus ring, draggable
   * - SELECTED: Shows focus ring, draggable
   * - EDITING: Allows text editing, not draggable
   */
  const [textElementState, setTextElementState] = useState<ElementState>(
    isNewlyCreated ? ElementState.SELECTED : ElementState.DEFAULT
  );

  const isEditing = textElementState === ElementState.EDITING;
  const isSelected = textElementState === ElementState.SELECTED;
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
  // Also pause history recording during text editing so all keystrokes are grouped as one undo operation
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();

      // Only pause history if element was created more than 100ms ago
      // This allows the initial element creation to be recorded before pausing
      const timeSinceCreation = Date.now() - (element.createdAt || Date.now());
      if (timeSinceCreation > 100) {
        history.pause();

        return () => {
          // Resume history when exiting edit mode
          history.resume();
        };
      }
    }
  }, [isEditing, history, element.createdAt]);

  // Click outside element to reset state to DEFAULT
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // If element is selected or editing and click is outside element, reset to default
      if (
        (textElementState === ElementState.SELECTED || textElementState === ElementState.EDITING) &&
        elementRef.current
      ) {
        if (!elementRef.current.contains(e.target as Node)) {
          setTextElementState(ElementState.DEFAULT);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [textElementState]);

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
      if (textElementState === ElementState.DEFAULT) {
        // DEFAULT → SELECTED
        setTextElementState(ElementState.SELECTED);
      } else if (textElementState === ElementState.SELECTED) {
        // SELECTED → EDITING
        setTextElementState(ElementState.EDITING);
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
    setTextElementState(ElementState.EDITING);
  };

  const handleBlur = () => {
    // Transition EDITING → DEFAULT (content is already saved via onChange)
    setTextElementState(ElementState.DEFAULT);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      // Exit edit mode without further changes
      setTextElementState(ElementState.DEFAULT);
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

  const handleMouseDownResize = (e: React.MouseEvent, edge: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (!elementRef.current) return;

    // Mark that we're resizing to block any drag initiation
    isResizingRef.current = true;

    // Pause history to batch all resize updates into a single undo entry
    history.pause();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.transform.width;
    const startHeight = element.transform.height;
    const startLeft = element.transform.x;
    const startTop = element.transform.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startLeft;
      let newY = startTop;

      // Handle different edges
      if (edge === 'right') {
        // Right edge - resize width only
        newWidth = Math.max(50, startWidth + deltaX);
      } else if (edge === 'left') {
        // Left edge - resize width from left side
        newWidth = Math.max(50, startWidth - deltaX);
        newX = startLeft + deltaX;
      } else if (edge === 'bottom') {
        // Bottom edge - resize height only
        newHeight = Math.max(30, startHeight + deltaY);
      } else if (edge === 'top') {
        // Top edge - resize height from top side
        newHeight = Math.max(30, startHeight - deltaY);
        newY = startTop + deltaY;
      }

      updateElement(slideIndex, element.id, {
        transform: {
          ...element.transform,
          width: newWidth,
          height: newHeight,
          x: newX,
          y: newY,
        },
      });
    };

    const handleMouseUp = () => {
      // Resume history to create a single undo entry for all resize changes
      history.resume();

      // Clear resizing flag after a tick to ensure drag doesn't start
      setTimeout(() => {
        isResizingRef.current = false;
      }, 0);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        if (node) elementRef.current = node;
      }}
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
      {...(isResizingRef.current ? {} : listeners)}
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

      {/* Resize handles - show when selected and active */}
      {isSelected && isActive && !isEditing && (
        <>
          {/* Top edge - exclude right corner where delete button is */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'top')}
            className="absolute -top-1 left-0 h-2"
            style={{
              right: '30px',
              zIndex: 20,
              cursor: 'n-resize',
              pointerEvents: 'auto',
              touchAction: 'none',
            }}
            title="Resize height"
          />
          {/* Bottom edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'bottom')}
            className="absolute -bottom-1 left-0 right-0 h-2"
            style={{ zIndex: 20, cursor: 's-resize', pointerEvents: 'auto', touchAction: 'none' }}
            title="Resize height"
          />
          {/* Left edge */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'left')}
            className="absolute -left-1 bottom-0 top-0 w-2"
            style={{ zIndex: 20, cursor: 'w-resize', pointerEvents: 'auto', touchAction: 'none' }}
            title="Resize width"
          />
          {/* Right edge - exclude top corner where delete button is */}
          <div
            onMouseDown={(e) => handleMouseDownResize(e, 'right')}
            className="absolute -right-1 bottom-0 w-2"
            style={{
              top: '30px',
              zIndex: 20,
              cursor: 'e-resize',
              pointerEvents: 'auto',
              touchAction: 'none',
            }}
            title="Resize width"
          />
        </>
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
