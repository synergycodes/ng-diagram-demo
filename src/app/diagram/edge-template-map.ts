import { NgDiagramEdgeTemplateMap } from 'ng-diagram';
import { CustomEdgeComponent } from './edge-templates/custom-edge/custom-edge.component';

export const edgeTemplateMap = new NgDiagramEdgeTemplateMap([
  ['custom-edge', CustomEdgeComponent],
]);
