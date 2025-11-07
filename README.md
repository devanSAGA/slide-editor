# Slide Editor

A real-time collaborative slide editor built with React 19, enabling multiple users to create, edit, and share presentations simultaneously.

## Requirements

### Functional Requirements

1. ✅ Basic slide editor with text element support
2. ✅ Shareable links for individual slides and complete presentations
3. ✅ Real-time multi-user collaboration on the same slide

### Technical Requirements

1. ✅ React as the frontend framework
2. ✅ Liveblocks as the real-time collaboration backbone
3. 🚧 User-scoped undo/redo operations (partially implemented, not yet user-scoped)
4. ✅ Sharing functionality for both single and multiple slides

## Features

- **Real-time Collaboration**: Multiple users can edit the same slide simultaneously with live updates
- **Text Elements**: Add, edit, and position text elements using an intuitive drag-and-drop interface
- **Flexible Sharing**: Share links to individual slides or entire presentations for seamless collaboration
- **Undo/Redo Support**: Basic undo/redo functionality **(currently partially implemented, not yet user-scoped)**
- **Responsive Design**: Collapsible sidebar and virtualized rendering for optimal performance with large presentations

## Tech Stack

### Core Technologies

- **React 19** with TypeScript - Modern UI framework with type safety
- **Vite 7** - Fast build tool and development server
- **Tailwind CSS v3** - Utility-first CSS framework

### Dependencies (3rd Party Libraries Used)

- **[@liveblocks/client](https://liveblocks.io/)** & **[@liveblocks/react](https://liveblocks.io/)** - Real-time collaboration infrastructure with CRDT data structures, shared storage, and user-scoped undo/redo mechanism
- **[@dnd-kit/core](https://dndkit.com/)** - Smooth, accessible drag-and-drop interactions for text elements
- **[@tanstack/react-virtual](https://tanstack.com/virtual)** - Virtualization for efficient rendering of large slide collections
- **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Intelligent merging of Tailwind CSS classes
- **[react-icons](https://react-icons.github.io/react-icons/)** - Comprehensive icon library
- **[@radix-ui/react-tooltip](https://www.radix-ui.com/primitives/docs/components/tooltip)** - Accessible, customizable tooltips

## Architecture

### State Management

The application uses a centralized **SlideContext** that manages all presentation state through Liveblocks storage:

**Stored States:**

- **`slides`** - Array of slide data synchronized across all users
- **`activeSlideIndex`** - Currently selected slide index (local to each user)
- **`contentRef`** - Reference to the slides list for programmatic scrolling

**Available Operations:**

- Slide operations: `addSlide()`, `deleteSlide()`, `selectSlide()`, `setActiveSlideIndex()`
- Element operations: `addTextElement()`, `deleteElement()`, `selectElement()`, `setElementState()`, `updateElement()`
- History operations: `undo()`, `redo()`, `canUndo`, `canRedo`

### Design Patterns

**Compound Component Pattern (Toolbar)**
The Toolbar component is built using the compound component pattern for maximum flexibility. While currently supporting only text elements, this architecture enables seamless addition of new element types (images, shapes, charts, etc.) without restructuring the component hierarchy.

**Generic Keyboard Shortcuts System**
A reusable `useKeyboardShortcuts` hook provides a declarative API for registering keyboard shortcuts. This extensible system makes it trivial to add new shortcuts throughout the application while maintaining consistent behavior and preventing conflicts.

**Reusable UI Components**
Core UI components like Button and Tooltip are designed for maximum reusability and consistency across the application

## User Experience

### Current Features

- **Collapsible Sidebar**: Maximizes workspace area while providing quick access to slide management
- **Virtualized Rendering**: Both the sidebar and main content area use virtualization to handle hundreds of slides efficiently
- **Visual Hierarchy**: Active slides are highlighted while inactive slides are dimmed for clear visual focus
- **Quick Navigation**: Click any sidebar thumbnail to instantly jump to that slide
- **Deep Linking**: Share URLs with specific slide indices that automatically scroll to the target slide on load
- **Contextual Tooltips**: Icon-only buttons include helpful tooltips for improved discoverability
- **Smooth Interactions**: Drag-and-drop positioning with real-time visual feedback

### Pending / Yet to be implemented

- **Drag-and-Drop Reordering**: Rearrange slides by dragging thumbnails in the sidebar
- **Resizable Text Elements**: Click and drag element edges to adjust dimensions
- **Rich Text Formatting**: Controls for font size, alignment, color, and other text properties
- **Enhanced Slide Management**: Add delete slide button in main editor for better discoverability when sidebar is collapsed

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build production bundle
npm run preview  # Preview production build locally
npm run lint     # Run ESLint checks
npx prettier --write "src/**/*.{js,jsx,ts,tsx}"  # Format code
```

## Project Structure

```
src/
├── components/       # React components
├── contexts/         # Context providers (SlideContext)
├── hooks/           # Custom React hooks (useKeyboardShortcuts, etc.)
├── types/           # TypeScript type definitions
├── liveblocks.config.ts  # Liveblocks configuration
├── main.tsx         # Application entry point
└── App.tsx          # Root component
```

## License

This project is private and not currently licensed for public use.
