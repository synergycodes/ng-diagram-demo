# ngDiagram Feature Demo

[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/licenses/MIT)

**Live demo:** [synergycodes.github.io/ng-diagram-demo](https://synergycodes.github.io/ng-diagram-demo/)

![ngDiagram feature demo — a palette with default and custom nodes, bezier edges with labels, a collapsible group, a selected dashed dangling edge with relink handles, and the properties panel with its relinkable and dangling ends](docs/assets/demo.png)

A showcase of [ngDiagram](https://www.ngdiagram.dev/) — an Angular library for creating interactive diagrams. One app wires up the library's main features side by side: custom node and edge templates, a drag-and-drop palette, grouping with collapsible groups, a clipboard context menu, snapping, rotation, a custom middleware, and edge relinking with dangling edges.

## Project Structure

### 📁 `src/app/diagram/` - **Main ngDiagram Integration**
This directory contains all the core ngDiagram logic and showcases how to use the library. **Start here to learn ngDiagram!**

- **`diagram.component.ts`** - Main diagram component with documentation on:
  - ngDiagram services (ModelService, SelectionService, ViewportService, etc.)
  - Event handling (all diagram events with examples)
  - Configuration setup
  - Model initialization

- **`services/`**
  - `diagram.config.ts` - NgDiagramConfig with snapping, zoom, rotation, edge relinking, dangling edges and grouping rules
  - `properties-facade.service.ts` - Properties panel integration
  - `debug-events.service.ts` - Complete event handling reference
  - `context-menu-facade.service.ts` - Clipboard and z-order operations
  - `group-collapse.service.ts` - Collapsing and expanding groups

- **`palette/`** - Drag & drop palette system:
  - `palette-data.ts` - Palette item definitions
  - `palette.component.ts` - How ngDiagram drag & drop works
  - Components for palette items and drag previews

- **`node-templates/`** - Custom node components:
  - `trigger-node/` - Basic node with ports, resize, and rotation
  - `custom-node/` - Interactive node with status dropdown
  - `decision-node/` - Node with an output port per branch, branches edited in the properties panel
  - `group-node/` - Container node for grouping, collapsible to its header
  - `node-template-map.ts` - Type-to-component mapping

- **`edge-templates/`** - Custom edge components:
  - `custom-edge/` - Edge template with label support

### 📁 `src/app/ui-components/` - **Supporting UI Components**
Angular components that provide the UI around the diagram (navbar, sidebars, properties panel, context menu).

### 📁 `src/app/types.ts` - **Type Definitions**
Shared TypeScript interfaces used across the application.

### 📁 `src/app/diagram/middlewares/` - **Custom Middleware**

- **`horizontal-lock.middleware.ts`** - Demonstrates how to constrain node movement using the middleware pipeline. Nodes with **Lock vertical movement** checked in the properties panel are restricted to X-axis movement only (their Y position stays locked). Select any node, tick the checkbox, and drag it around.

## Edge Relinking and Dangling Edges

Select an edge and drag the handle at either end onto another port to relink it. Drop an edge on empty canvas, delete a node, or click **Detach** in the properties panel, and the edge keeps a free, dashed end. Both features are set in `diagram.config.ts` and can be switched off from the navbar for comparison.

## Collapsible Groups

Click the arrow in a group's header to collapse it to the header bar; edges to the nodes inside move to the group's ports until it expands. Implemented in `group-collapse.service.ts`, following the library's [expand/collapse groups example](https://www.ngdiagram.dev/docs/examples/expand-collapse-groups).

## Getting Started

Built against Angular 21.2 and ngDiagram 1.4 (see `package.json`); Node.js 20.19+ or 22.12+ and npm 10+.

```bash
git clone https://github.com/synergycodes/ng-diagram-demo.git
cd ng-diagram-demo
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) — a small diagram loads with every node template: the three custom templates (trigger, task status, decision) and a group whose child is the library's default node. Try dragging new nodes in from the left palette, right-clicking a node for the clipboard context menu, and ticking **Lock vertical movement** on a selected node - a custom middleware then pins its Y position while you drag. Select an edge and drag one of its end handles to relink it, or collapse the group from its header. `npm run build` compiles to `dist/`.

Working with an AI coding tool? Copy [`mcp.json`](mcp.json) to `.mcp.json` (or your tool's MCP config) to add the ngDiagram docs MCP server — searchable ngDiagram documentation and API reference right in the session. The file carries the Windows command; the macOS/Linux variant is noted inside.

## Support

- **Issues**: [GitHub Issues](https://github.com/synergycodes/ng-diagram-demo/issues)
- **ngDiagram Discussions**: [GitHub Discussions](https://github.com/synergycodes/ng-diagram/discussions), [Discord](https://discord.gg/FDMjRuarFb)
- **ngDiagram Documentation**: [ngdiagram.dev/docs](https://www.ngdiagram.dev/docs)
- **More diagramming resources**: [synergycodes.com/diagramming-resources](https://www.synergycodes.com/diagramming-resources)

## License

MIT — see [LICENSE](LICENSE).

---

Built with ❤️ by the [Synergy Codes](https://www.synergycodes.com/) team
