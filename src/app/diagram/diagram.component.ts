/**
 * DIAGRAM COMPONENT - Main container for ng-diagram
 * ===================================================
 *
 * This component demonstrates how to integrate ng-diagram into your Angular application.
 * It showcases:
 * - Service injection and usage
 * - Event handling
 * - Model initialization
 * - Configuration setup
 */

import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

// ng-diagram imports - Core library components and services
import {
  // Components
  NgDiagramComponent,               // Main diagram canvas component
  NgDiagramBackgroundComponent,     // Background patterns (dots, grid, solid)

  // Types and interfaces
  NgDiagramNodeTemplateMap,         // Map of node type -> component template
  NgDiagramPaletteItem,             // Type for palette items (drag & drop)
  Node,                             // Node interface
  EdgeRoutingName,                  // Edge routing types ('orthogonal', 'polyline', 'bezier')

  // Services - Key ng-diagram services for diagram manipulation
  NgDiagramService,                 // Main service - initialization, config updates
  NgDiagramSelectionService,        // Manage node/edge selection
  NgDiagramModelService,            // CRUD operations on nodes and edges
  NgDiagramViewportService,         // Pan, zoom, coordinate transformations

  // Functions
  initializeModel,                  // Helper to create initial diagram model
  provideNgDiagram,                 // Provider function for ng-diagram (required!)
  createMiddlewares,                // Create middlewares configuration

  // Event types - All available diagram events
  DiagramInitEvent,                 // Fired when diagram is initialized
  EdgeDrawnEvent,                   // Fired when edge is drawn between nodes
  SelectionMovedEvent,              // Fired when nodes are dragged
  SelectionChangedEvent,            // Fired when selection changes
  SelectionRemovedEvent,            // Fired when nodes/edges are deleted
  GroupMembershipChangedEvent,      // Fired when node group membership changes
  SelectionRotatedEvent,            // Fired when nodes are rotated
  ViewportChangedEvent,             // Fired when pan/zoom changes
  ClipboardPastedEvent,             // Fired when clipboard content is pasted
  NodeResizedEvent,                 // Fired when node is resized
  PaletteItemDroppedEvent,          // Fired when palette item is dropped
} from 'ng-diagram';

import { PaletteComponent } from './palette/palette.component';
import { PropertiesComponent } from '../ui-components/properties/properties.component';
import { NavbarComponent, BackgroundType } from '../ui-components/navbar/navbar.component';
import { BaseNodeEdgeData, PaletteData } from '../types';
import { paletteModel } from './palette-data';
import { nodeTemplateMap } from './node-template-map';
import { edgeTemplateMap } from './edge-template-map';
import { NodeTemplateType } from './node-templates/node-template.types';
import {
  ContextMenuComponent,
  PasteEvent,
} from '../ui-components/context-menu/context-menu.component';
import { ContextMenuService } from '../ui-components/context-menu/context-menu.service';

// Facade services - Extract business logic from component
import { PropertiesFacadeService } from './services/properties-facade.service';
import { DebugEventsService } from './services/debug-events.service';
import { ContextMenuFacadeService } from './services/context-menu-facade.service';
import { createDiagramConfig } from './services/diagram.config';

// Middlewares - Plugin system for intercepting diagram state changes
import { horizontalLockMiddleware } from './middlewares/horizontal-lock.middleware';

@Component({
  selector: 'app-diagram',
  imports: [
    CommonModule,
    PaletteComponent,
    PropertiesComponent,
    NgDiagramComponent,           // Required: Main diagram component
    NgDiagramBackgroundComponent, // Optional: Add background patterns
    NavbarComponent,
    ContextMenuComponent,
  ],
  providers: [
    ContextMenuService,
    PropertiesFacadeService,
    DebugEventsService,
    ContextMenuFacadeService,
    provideNgDiagram(),           // REQUIRED: Must include ng-diagram provider!
  ],
  templateUrl: './diagram.component.html',
  styleUrl: './diagram.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagramComponent {
  // ===================================
  // ng-diagram Core Services
  // ===================================
  // These services provide the main API for interacting with ng-diagram

  /**
   * NgDiagramService - Main diagram service
   * - Check initialization status
   * - Update diagram configuration dynamically
   */
  private readonly diagramService = inject(NgDiagramService);

  /**
   * NgDiagramSelectionService - Manage selection
   * - Get current selection (nodes and edges)
   * - Programmatically select nodes/edges
   * - Delete selection
   */
  private readonly diagramSelectionService = inject(NgDiagramSelectionService);

  /**
   * NgDiagramModelService - CRUD operations
   * - Access nodes and edges
   * - Add, update, remove nodes and edges
   * - Update node/edge data and properties
   */
  private readonly diagramModelService = inject(NgDiagramModelService);

  /**
   * NgDiagramViewportService - Viewport manipulation
   * - Get/set pan and zoom
   * - Center on specific nodes
   * - Convert between screen and diagram coordinates
   */
  private readonly viewportService = inject(NgDiagramViewportService);

  // ===================================
  // Application Services
  // ===================================

  private readonly contextMenuService = inject(ContextMenuService);
  private readonly snackBar = inject(MatSnackBar);

  /**
   * Facade Services - Separation of Concerns
   * These services extract complex logic from the component:
   * - PropertiesFacadeService: Handles all properties panel logic
   * - DebugEventsService: Manages debug event notifications
   * - ContextMenuFacadeService: Centralizes context menu operations
   */
  private readonly propertiesFacade = inject(PropertiesFacadeService);
  private readonly debugEvents = inject(DebugEventsService);
  private readonly contextMenuFacade = inject(ContextMenuFacadeService);

  // ===================================
  // Diagram Data and Configuration
  // ===================================

  /**
   * Palette Model - Defines draggable items
   * Each item represents a node type that can be dragged onto the canvas
   * See palette-data.ts for structure
   */
  paletteModel: NgDiagramPaletteItem<PaletteData>[] = paletteModel;

  /**
   * Node Template Map - Maps node types to Angular components
   * When a node is rendered, ng-diagram looks up its type in this map
   * and renders the corresponding component
   * Example: { 'trigger': TriggerNodeComponent, 'custom': CustomNodeComponent }
   */
  nodeTemplateMap: NgDiagramNodeTemplateMap = nodeTemplateMap;

  /**
   * Edge Template Map - Maps edge types to Angular components
   * Similar to nodeTemplateMap but for edges
   */
  edgeTemplateMap = edgeTemplateMap;

  /**
   * Middlewares - Plugin system for diagram state changes
   *
   * Middlewares intercept and can modify state changes before they reach the model.
   * They form a pipeline where each middleware can:
   * - Inspect changes (what nodes/edges are being added/updated/removed)
   * - Transform data (modify positions, properties, etc.)
   * - Validate operations (cancel invalid changes)
   * - Add supplementary changes (auto-layout, constraints)
   *
   * Example middleware: horizontal-lock
   * - Restricts nodes with label 'horizontal' to horizontal-only movement
   * - Demonstrates axis-locked movement constraint
   *
   * Middleware registration:
   * - createMiddlewares() accepts defaults and custom middlewares
   * - Spread ...defaults to include ng-diagram's built-in middlewares
   * - Add custom middlewares to the array
   *
   * See: middlewares/horizontal-lock.middleware.ts for implementation details
   */
  middlewares = createMiddlewares((defaults) => [
    ...defaults,                    // Include ng-diagram's default middlewares
    horizontalLockMiddleware,       // Custom middleware for horizontal movement lock
  ]);

  // ===================================
  // Component State
  // ===================================

  backgroundType = signal<BackgroundType>('dots');
  debugMode = this.debugEvents.debugMode;

  // ===================================
  // Diagram Model Initialization
  // ===================================

  /**
   * Diagram Model - The source of truth for all nodes and edges
   *
   * Use initializeModel() to create the initial state.
   * The model is a signal that ng-diagram watches for changes.
   *
   * Node Structure:
   * - id: Unique identifier (string)
   * - type: Maps to nodeTemplateMap (optional)
   * - position: { x, y } coordinates
   * - size: { width, height } dimensions (optional if autoSize: true)
   * - data: Your custom data (generic type)
   * - autoSize: Let template determine size (default: true)
   *
   * Edge Structure:
   * - id: Unique identifier
   * - source: Source node ID
   * - target: Target node ID
   * - sourcePort: Port ID on source node
   * - targetPort: Port ID on target node
   * - routing: 'polyline' | 'orthogonal' | 'bezier'
   * - targetArrowhead: Arrowhead marker ID (optional)
   * - data: Your custom data
   */
  model = initializeModel({
    nodes: [
      {
        id: '1',
        data: {},
        position: { x: 100, y: 100 },
        autoSize: false,
        size: { width: 150, height: 50 },
      },
      {
        id: '2',
        data: {},
        position: { x: 400, y: 200 },
        autoSize: false,
        size: { width: 150, height: 50 },
      },
    ],
    edges: [
      {
        id: '1',
        source: '1',
        target: '2',
        sourcePort: 'port-right',    // Must match port IDs in node template
        targetPort: 'port-left',      // Must match port IDs in node template
        targetArrowhead: 'ng-diagram-arrow',  // Built-in arrowhead
        routing: 'polyline',          // Line routing algorithm
        data: { label: 'label' },

        // Advanced: Manual routing with custom points
        // Uncomment to override automatic routing:
        // routingMode: 'manual',
        // points: [
        //   { x: 250, y: 125 },
        //   { x: 300, y: 50 },
        //   { x: 350, y: 250 },
        //   { x: 400, y: 225 },
        // ],
      },
    ],
  });

  /**
   * Diagram Configuration - Customize diagram behavior
   *
   * See services/diagram.config.ts for full configuration options:
   * - zoom: Min/max zoom, zoom to fit behavior
   * - background: Dot spacing, grid size
   * - snapping: Grid snapping for drag/resize
   * - nodeRotation: Rotation snapping
   * - resize: Minimum node sizes
   * - linking: Edge creation behavior
   */
  config = createDiagramConfig(this.initializeMinNodeSizes());

  // ===================================
  // Properties Panel Bindings
  // ===================================
  // These computed signals come from PropertiesFacadeService
  // They reflect the currently selected node/edge properties

  label = this.propertiesFacade.label;
  edgeRouting = this.propertiesFacade.edgeRouting;
  edgeLabelPosition = this.propertiesFacade.edgeLabelPosition;
  enableSnapDrag = this.propertiesFacade.enableSnapDrag;
  enableSnapResize = this.propertiesFacade.enableSnapResize;
  enableSnapRotate = this.propertiesFacade.enableSnapRotate;
  snapDragStep = this.propertiesFacade.snapDragStep;
  snapResizeStep = this.propertiesFacade.snapResizeStep;
  snapRotateStep = this.propertiesFacade.snapRotateStep;

  constructor() {
    /**
     * Reactive Configuration Updates
     * When debugMode changes, update the diagram config automatically
     */
    effect(() => {
      if (this.diagramService.isInitialized()) {
        this.diagramService.updateConfig({ debugMode: this.debugMode() });
      }
    });
  }

  // ===================================
  // ng-diagram Event Handlers
  // ===================================
  // These events allow you to react to diagram interactions
  // All events are optional - only implement what you need

  /**
   * DiagramInitEvent - Fired once when diagram finishes initialization
   * Use this to perform actions after diagram is ready
   */
  onDiagramInit(event: DiagramInitEvent) {
    this.debugEvents.onDiagramInit(event);
  }

  /**
   * EdgeDrawnEvent - Fired when user draws a new edge
   * event.edge contains the newly created edge
   */
  onEdgeDrawn(event: EdgeDrawnEvent) {
    this.debugEvents.onEdgeDrawn(event);
  }

  /**
   * SelectionMovedEvent - Fired when nodes are dragged
   * event.nodes contains all moved nodes with new positions
   */
  onSelectionMoved(event: SelectionMovedEvent) {
    this.debugEvents.onSelectionMoved(event);
  }

  /**
   * SelectionChangedEvent - Fired when selection changes
   * event.selectedNodes and event.selectedEdges contain current selection
   */
  onSelectionChanged(event: SelectionChangedEvent) {
    this.debugEvents.onSelectionChanged(event);
  }

  /**
   * SelectionRemovedEvent - Fired when nodes/edges are deleted
   * event.deletedNodes and event.deletedEdges contain deleted items
   */
  onSelectionRemoved(event: SelectionRemovedEvent) {
    this.debugEvents.onSelectionRemoved(event);
  }

  /**
   * GroupMembershipChangedEvent - Fired when nodes join/leave groups
   */
  onGroupMembershipChanged(event: GroupMembershipChangedEvent) {
    this.debugEvents.onGroupMembershipChanged(event);
  }

  /**
   * SelectionRotatedEvent - Fired when nodes are rotated
   * event.angle contains the new rotation angle
   */
  onSelectionRotated(event: SelectionRotatedEvent) {
    this.debugEvents.onSelectionRotated(event);
  }

  /**
   * ViewportChangedEvent - Fired when pan or zoom changes
   * event.viewport contains { x, y, scale }
   */
  onViewportChanged(event: ViewportChangedEvent) {
    this.debugEvents.onViewportChanged(event);
  }

  /**
   * ClipboardPastedEvent - Fired when content is pasted
   * event.nodes and event.edges contain pasted items
   */
  onClipboardPasted(event: ClipboardPastedEvent) {
    this.debugEvents.onClipboardPasted(event);
  }

  /**
   * NodeResizedEvent - Fired when a node is resized
   * event.node.size contains new dimensions
   */
  onNodeResized(event: NodeResizedEvent) {
    this.debugEvents.onNodeResized(event);
  }

  /**
   * PaletteItemDroppedEvent - Fired when palette item is dropped
   * event.node contains the newly created node from palette
   */
  onPaletteItemDropped(event: PaletteItemDroppedEvent) {
    this.debugEvents.onPaletteItemDropped(event);
  }

  // ===================================
  // Properties Panel Event Handlers
  // ===================================
  // Delegate to facade service for clean separation of concerns

  labelChange(label: string) {
    this.propertiesFacade.updateLabel(label);
  }

  routingChange(routing: EdgeRoutingName) {
    this.propertiesFacade.updateRouting(routing);
  }

  labelPositionChange(positionOnEdge: number) {
    this.propertiesFacade.updateLabelPosition(positionOnEdge);
  }

  snapDragChange(enableSnapDrag: boolean) {
    this.propertiesFacade.updateSnapDrag(enableSnapDrag);
  }

  snapResizeChange(enableSnapResize: boolean) {
    this.propertiesFacade.updateSnapResize(enableSnapResize);
  }

  snapRotateChange(enableSnapRotate: boolean) {
    this.propertiesFacade.updateSnapRotate(enableSnapRotate);
  }

  snapDragStepChange(snapDragStep: number) {
    this.propertiesFacade.updateSnapDragStep(snapDragStep);
  }

  snapResizeStepChange(snapResizeStep: number) {
    this.propertiesFacade.updateSnapResizeStep(snapResizeStep);
  }

  snapRotateStepChange(snapRotateStep: number) {
    this.propertiesFacade.updateSnapRotateStep(snapRotateStep);
  }

  // ===================================
  // Context Menu Event Handlers
  // ===================================
  // Delegate to facade service for clipboard and z-order operations

  onContextMenuCopy() {
    this.contextMenuFacade.copy();
  }

  onContextMenuCut() {
    this.contextMenuFacade.cut();
  }

  onContextMenuPaste(event: PasteEvent) {
    this.contextMenuFacade.paste(event);
  }

  onContextMenuDelete() {
    this.contextMenuFacade.delete();
  }

  onContextMenuBringToFront() {
    this.contextMenuFacade.bringToFront();
  }

  onContextMenuSendToBack() {
    this.contextMenuFacade.sendToBack();
  }

  // ===================================
  // Application-Specific Handlers
  // ===================================

  /**
   * Handle right-click on diagram
   * Demonstrates coordinate transformation from screen to diagram space
   */
  onDiagramRightClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Transform screen coordinates to diagram coordinates
    const cursorPosition = this.viewportService.clientToFlowViewportPosition({
      x: event.clientX,
      y: event.clientY,
    });
    this.contextMenuService.showDiagramMenu(cursorPosition);
  }

  /**
   * Search and Center on Node
   * Demonstrates programmatic selection and viewport manipulation
   */
  onSearchNode(query: string) {
    // Access all nodes from the model
    const nodes = this.diagramModelService.nodes() as Node<BaseNodeEdgeData>[];

    // Find node by label (case-insensitive substring match)
    const foundNode = nodes.find((node) => {
      const label = node.data.label || node.id;
      return label.toLowerCase().includes(query.toLowerCase());
    });

    if (foundNode) {
      // Programmatically select the node
      this.diagramSelectionService.select([foundNode.id]);

      // Center viewport on the node
      this.viewportService.centerOnNode(foundNode.id);
    } else {
      this.snackBar.open(`No node found matching "${query}"`, '', {
        duration: 3000,
      });
    }
  }

  /**
   * Initialize Minimum Node Sizes
   * Reads CSS custom properties to set minimum sizes per node type
   * This ensures nodes can't be resized smaller than their content
   */
  private initializeMinNodeSizes(): Map<string, { width: number; height: number }> {
    const style = getComputedStyle(document.documentElement);
    const nodeTypes = [NodeTemplateType.Trigger, NodeTemplateType.Custom, NodeTemplateType.Group];

    const map = new Map(
      nodeTypes.map((type) => [
        type,
        {
          width: parseInt(style.getPropertyValue(`--node-${type}-min-width`)),
          height: parseInt(style.getPropertyValue(`--node-${type}-min-height`)),
        },
      ])
    );

    return map;
  }
}
