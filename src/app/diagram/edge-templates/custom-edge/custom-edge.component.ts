import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import {
  Edge, // Edge type from ng-diagram
  NgDiagramEdgeTemplate, // Interface that all edge templates must implement
  NgDiagramBaseEdgeComponent, // Pre-built component for rendering edge path
  NgDiagramBaseEdgeLabelComponent, // Pre-built component for rendering edge label
} from 'ng-diagram';
import { BaseNodeEdgeData } from '../../../types';

/**
 * CustomEdgeComponent - Custom edge template for connections
 *
 * This demonstrates how to create a custom edge component for ng-diagram.
 *
 * Edge Template Basics:
 * - Edges are the connections (lines) between nodes
 * - Each edge has: source, target, routing algorithm, optional label
 * - Can be customized with different styles, animations, or interactive elements
 *
 * Use ng-diagram base components:
 * - NgDiagramBaseEdgeComponent: Renders the path (handles all routing algorithms)
 * - NgDiagramBaseEdgeLabelComponent: Renders the label at specified position
 * - Just customize styling via CSS
 * - Handles selection, interaction automatically
 *
 * Edge Routing Algorithms (handled by NgDiagramBaseEdgeComponent):
 * - 'orthogonal': Right-angled paths (default)
 * - 'polyline': Direct line between nodes
 * - 'bezier': Smooth curves
 *
 * Usage:
 * 1. Create edge template component (this file)
 * 2. Set edge.type = 'custom-edge' when creating edges
 *    (use finalEdgeDataBuilder in config to set type)
 * 3. Pass edgeTemplateMap to ng-diagram component
 */
@Component({
  selector: 'app-custom-edge',
  templateUrl: './custom-edge.component.html',
  styleUrl: './custom-edge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgDiagramBaseEdgeComponent,      // Renders the edge path
    NgDiagramBaseEdgeLabelComponent, // Renders the edge label
  ],
})
export class CustomEdgeComponent implements NgDiagramEdgeTemplate<BaseNodeEdgeData> {
  /**
   * Edge input - REQUIRED for all edge templates
   * ng-diagram passes the edge object to this input
   */
  edge = input.required<Edge<BaseNodeEdgeData>>();
}
