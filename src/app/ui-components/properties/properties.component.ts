import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EdgeRoutingName } from 'ng-diagram';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { PaletteItemIconComponent } from '../../diagram/palette/palette-item-icon/palette-item-icon.component';
import {
  AnyCircuitData,
  BatteryData,
  CapacitorData,
  CircuitNodeType,
  DiodeData,
  IcData,
  IcPin,
  LedData,
  PowerNetData,
  ResistorData,
} from '../../circuit/circuit-types';
import { defaultIconForType } from '../../circuit/palette-icon';
import { PropertiesFacadeService } from '../../diagram/services/properties-facade.service';

interface PinoutBucket {
  title: string;
  pins: IcPin[];
}

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SidebarComponent, FormsModule, PaletteItemIconComponent],
})
export class PropertiesComponent {
  private readonly facade = inject(PropertiesFacadeService);

  collapsed = input(true);

  selectedNode = this.facade.selectedNode;
  selectedNodes = this.facade.selectedNodes;
  multiSelected = this.facade.multiSelected;
  selectedEdge = this.facade.selectedEdge;
  selectedNodeType = this.facade.selectedNodeType;
  edgeRouting = this.facade.edgeRouting;

  /** "U1 + LED1" or "U1 + 2 more" when 4+ nodes selected. */
  multiSelectTitle = computed(() => {
    const refs = this.selectedNodes()
      .map((n) => (n.data as AnyCircuitData)?.reference)
      .filter((r): r is string => !!r);
    if (refs.length <= 1) return refs[0] ?? '';
    if (refs.length === 2) return refs.join(' + ');
    return `${refs[0]} + ${refs.length - 1} more`;
  });

  multiSelectReferenceList = computed(() =>
    this.selectedNodes()
      .map((n) => (n.data as AnyCircuitData)?.reference)
      .filter((r): r is string => !!r)
      .join(', '),
  );

  readonly Type = CircuitNodeType;

  routingOptions: { value: EdgeRoutingName; label: string }[] = [
    { value: 'polyline', label: 'Polyline' },
    { value: 'orthogonal', label: 'Orthogonal' },
    { value: 'bezier', label: 'Bezier' },
  ];

  iconType = computed(() => {
    const t = this.selectedNodeType();
    return t ? defaultIconForType(t) : null;
  });

  componentTypeName = computed(() => {
    const t = this.selectedNodeType();
    if (!t) return '';
    switch (t) {
      case CircuitNodeType.Resistor:
        return 'Resistor';
      case CircuitNodeType.Capacitor:
        return 'Capacitor';
      case CircuitNodeType.Diode:
        return 'Diode';
      case CircuitNodeType.Led:
        return 'LED';
      case CircuitNodeType.Battery:
        return 'Battery';
      case CircuitNodeType.Gnd:
        return 'Ground';
      case CircuitNodeType.Vcc:
        return 'Power Source';
      case CircuitNodeType.Ic:
        return 'Integrated Circuit';
      case CircuitNodeType.Board:
        return 'Development Board';
    }
  });

  data = computed<AnyCircuitData | null>(() => {
    const node = this.selectedNode();
    return node ? (node.data as AnyCircuitData) : null;
  });

  resistorData = computed(() =>
    this.selectedNodeType() === CircuitNodeType.Resistor ? (this.data() as ResistorData | null) : null,
  );
  capacitorData = computed(() =>
    this.selectedNodeType() === CircuitNodeType.Capacitor ? (this.data() as CapacitorData | null) : null,
  );
  diodeData = computed(() =>
    this.selectedNodeType() === CircuitNodeType.Diode ? (this.data() as DiodeData | null) : null,
  );
  ledData = computed(() =>
    this.selectedNodeType() === CircuitNodeType.Led ? (this.data() as LedData | null) : null,
  );
  batteryData = computed(() =>
    this.selectedNodeType() === CircuitNodeType.Battery ? (this.data() as BatteryData | null) : null,
  );
  powerData = computed(() => {
    const t = this.selectedNodeType();
    return t === CircuitNodeType.Gnd || t === CircuitNodeType.Vcc
      ? (this.data() as PowerNetData | null)
      : null;
  });
  icData = computed(() => {
    const t = this.selectedNodeType();
    return t === CircuitNodeType.Ic || t === CircuitNodeType.Board
      ? (this.data() as IcData | null)
      : null;
  });

  pinoutBuckets = computed<PinoutBucket[]>(() => {
    const ic = this.icData();
    if (!ic) return [];
    const groups: Record<string, IcPin[]> = {};
    const push = (title: string, pin: IcPin) => {
      (groups[title] ??= []).push(pin);
    };
    for (const pin of ic.pins) {
      switch (pin.type) {
        case 'power':
          push('Power', pin);
          break;
        case 'ground':
          push('Ground', pin);
          break;
        case 'analog':
          push('Analog', pin);
          break;
        case 'pwm':
          push('Digital / PWM', pin);
          break;
        case 'io':
          push('Digital I/O', pin);
          break;
        case 'input':
        case 'output':
          push('Signal', pin);
          break;
        default:
          push('Other', pin);
      }
    }
    return Object.entries(groups).map(([title, pins]) => ({
      title,
      pins: pins.sort((a, b) => a.number - b.number),
    }));
  });

  update(key: string, value: unknown) {
    this.facade.updateNodeField(key, value);
  }

  onRoutingChange(routing: EdgeRoutingName) {
    this.facade.updateEdgeRouting(routing);
  }
}
