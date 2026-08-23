export type ComponentCategory = 'input' | 'board' | 'output' | 'conditioner';

export interface KitComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  type: string;
  description: string;
  image: string;
  pinInfo?: string;
  defaultGpio?: string;
  statusBadge?: string;
  requiredConditionerId?: string;
  requiredConditionerName?: string;
  isCustom?: boolean;
  iconPreset?: string;
}

export interface ArchitectureState {
  inputs: (KitComponent | null)[]; // 3 slots
  boards: (KitComponent | null)[]; // 3 slots
  outputs: (KitComponent | null)[]; // 3 slots
  inputConditioners: (KitComponent | null)[]; // 3 mini slots between input & board
  outputConditioners: (KitComponent | null)[]; // 3 mini slots between board & output
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
