# Diagramming Resources

- 🌐 **ngDiagram website**: [ngdiagram.dev](https://www.ngdiagram.dev/)
- 💻 **ngDiagram GitHub**: [github.com/synergycodes/ng-diagram](https://github.com/synergycodes/ng-diagram)
- 📚 **ngDiagram Documentation**: [Getting Started](https://www.ngdiagram.dev/docs/intro/quick-start/)
- 🎤 **Presentation**: [View slides](https://synergiapro-my.sharepoint.com/:p:/g/personal/lukasz_jazwa_synergycodes_com/ESwjUjti0kRGnRpHUWQqcRUB-6RhkzalJoDsEj4DnJXsLg?e=SnBFxV)
- 📖 **Additional Resources**: [synergycodes.com/diagramming-resources](https://www.synergycodes.com/diagramming-resources)

# NgDiagramMeetupDemo

A showcase demonstrating how to use [ng-diagram](https://www.ngdiagram.dev/) - an Angular library for creating interactive diagrams.

## Project Structure

### 📁 `src/app/diagram/` - **Main ng-diagram Integration**
This directory contains all the core ng-diagram logic and showcases how to use the library. **Start here to learn ng-diagram!**

- **`diagram.component.ts`** - Main diagram component with documentation on:
  - ng-diagram services (ModelService, SelectionService, ViewportService, etc.)
  - Event handling (all diagram events with examples)
  - Configuration setup
  - Model initialization

- **`services/`**
  - `diagram.config.ts` - NgDiagramConfig with snapping, zoom, rotation, etc.
  - `properties-facade.service.ts` - Properties panel integration
  - `debug-events.service.ts` - Complete event handling reference
  - `context-menu-facade.service.ts` - Clipboard and z-order operations

- **`palette/`** - Drag & drop palette system:
  - `palette-data.ts` - Palette item definitions
  - `palette.component.ts` - How ng-diagram drag & drop works
  - Components for palette items and drag previews

- **`node-templates/`** - Custom node components:
  - `trigger-node/` - Basic node with ports, resize, and rotation
  - `custom-node/` - Interactive node with status dropdown
  - `group-node/` - Container node for grouping
  - `node-template-map.ts` - Type-to-component mapping

- **`edge-templates/`** - Custom edge components:
  - `custom-edge/` - Edge template with label support

### 📁 `src/app/ui-components/` - **Supporting UI Components**
Angular components that provide the UI around the diagram (navbar, sidebars, properties panel, context menu).

### 📁 `src/app/types.ts` - **Type Definitions**
Shared TypeScript interfaces used across the application.

## Quick Start

### Installation

```bash
npm install
```

### Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.


## Building

To build the project run:

```bash
npm build
```

This will compile your project and store the build artifacts in the `dist/` directory.
