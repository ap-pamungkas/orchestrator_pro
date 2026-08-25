export type ComponentCategory = 'input' | 'board' | 'output' | 'conditioner';
export type AppMode = 'educator' | 'developer';

export interface KitComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  type: string;
  description?: string;
  image?: string;
  pinInfo?: string;
  defaultGpio?: string;
  statusBadge?: string;
  requiredConditionerId?: string;
  requiredConditionerName?: string;
  isCustom?: boolean;
  iconPreset?: string;
}

export interface WireConnection {
  id: string;
  fromCategory: 'input' | 'board';
  fromSlot: number; // 0, 1, 2
  toCategory: 'board' | 'output';
  toSlot: number; // 0, 1, 2
  conditioner?: KitComponent | null;
}

export interface ArchitectureState {
  inputs: (KitComponent | null)[]; // 3 slots
  boards: (KitComponent | null)[]; // 3 slots
  outputs: (KitComponent | null)[]; // 3 slots
  inputConditioners?: (KitComponent | null)[]; // 3 mini slots between input & board
  outputConditioners?: (KitComponent | null)[]; // 3 mini slots between board & output
  wires?: WireConnection[]; // user-drawn dynamic wire connections
  conditioner?: (KitComponent | null)[]; // backward compatibility
}

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CodeFile {
  name: string;
  content: string;
  isReadOnly?: boolean;
}

export interface CodeVariation {
  id: string;
  componentId: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  inputCount: number;
  outputCount: number;
  command: string;
  setupSummary: string;
  logicSummary: string;
  codeExplanation: {
    symbol: string;
    description: string;
  }[];
  sourceCode: string;
  isCustom?: boolean;
  files?: CodeFile[];
}

export interface NewComponentForm {
  name: string;
  category: ComponentCategory;
  type: string;
  description: string;
  pinInfo: string;
  defaultGpio: string;
  statusBadge: string;
  image: string;
  requiredConditionerId?: string;
  requiredConditionerName?: string;
}

export interface NewCaseForm {
  title: string;
  command: string;
  difficulty: DifficultyLevel;
  description: string;
  setupSummary: string;
  logicSummary: string;
  sourceCode: string;
  files?: CodeFile[];
}
