# AGENTS.md

## Project: ESP32 Learning Kit Orchestrator

This repository contains a visual learning and documentation application for an ESP32 Embedded System Kit.

The application is intended to provide a Figma-like visual environment where users can:

```text
Component Library
        ↓
Drag & Drop
        ↓
System Architecture
        ↓
Input / Board / Output
        ↓
Select Component
        ↓
Code Variations
        ↓
Source Code Documentation
```

The project is designed to grow incrementally.

**Do not implement future features unless explicitly requested.**

---

# 1. Core Development Principles

## 1.1 Inspect Before Modifying

Before changing code:

1. Inspect the repository structure.
2. Inspect `package.json`.
3. Identify the framework.
4. Identify the styling system.
5. Identify the UI component library.
6. Identify the routing structure.
7. Identify state management.
8. Identify existing reusable components.
9. Identify existing data structures.
10. Check whether a feature already exists before implementing it.

Do not assume the project is empty.

Do not rebuild existing functionality unnecessarily.

---

# 2. Preserve Existing Architecture

The existing application is the source of truth.

When implementing a feature:

* Reuse existing components.
* Reuse existing utilities.
* Reuse existing hooks.
* Reuse existing styling conventions.
* Reuse existing layout components.
* Reuse existing state management when appropriate.

Do not introduce a new architecture just because another architecture is personally preferred.

Avoid unnecessary refactoring.

If a refactor is required, keep it small and explain why.

---

# 3. Development Philosophy

The application is being developed incrementally.

Prefer:

```text
Small feature
    ↓
Test
    ↓
Verify
    ↓
Continue
```

Instead of:

```text
Large rewrite
    ↓
Many features
    ↓
Difficult debugging
```

Every implementation should have a clearly defined scope.

---

# 4. Current Product Concept

The main application represents an embedded-system architecture:

```text
INPUT
  ↓
BOARD
  ↓
OUTPUT
```

For example:

```text
Tactile Button
      ↓
     ESP32
      ↓
      LED
```

The application should make this relationship visually understandable.

---

# 5. Component Categories

The application currently recognizes three primary component categories:

```text
input
board
output
```

## Input

Examples:

```text
Tactile Button
Motion Switch
Potentiometer
DHT22
```

## Board

Examples:

```text
ESP32
Arduino Uno
Raspberry Pi
```

## Output

Examples:

```text
LED
Buzzer
Motor Driver
MAX7219 LED Matrix
```

New component types should use the existing category system.

Do not create separate architecture logic for every individual component.

---

# 6. Component Data Model

Use a normalized component representation.

Preferred conceptual structure:

```typescript
type ComponentCategory =
  | "input"
  | "board"
  | "output";

type KitComponent = {
  id: string;
  name: string;
  category: ComponentCategory;
  type: string;
  description?: string;
  image?: string;
};
```

Components should be data-driven.

Avoid hard-coding component-specific UI logic whenever possible.

Bad:

```typescript
if (component.name === "Tactile Button") {
  // special UI
}
```

Prefer:

```typescript
if (component.category === "input") {
  // generic input behavior
}
```

Component-specific behavior should only exist when technically necessary.

---

# 7. Architecture Model

The visual architecture consists of three slots:

```typescript
type ArchitectureState = {
  input: KitComponent | null;
  board: KitComponent | null;
  output: KitComponent | null;
};
```

The slot rules are:

```text
INPUT SLOT
accepts: input

BOARD SLOT
accepts: board

OUTPUT SLOT
accepts: output
```

Never allow an invalid category to be inserted into a slot.

Example:

```text
LED → INPUT
```

must be rejected.

Example:

```text
ESP32 → OUTPUT
```

must be rejected.

---

# 8. Drag & Drop Rules

The application uses visual drag-and-drop interaction.

The expected behavior is:

```text
Component Library
       ↓
      Drag
       ↓
Architecture Slot
```

Valid drop:

```text
Tactile Button → Input Slot
ESP32 → Board Slot
LED → Output Slot
```

Invalid drop:

```text
LED → Input Slot
ESP32 → Output Slot
Tactile Button → Board Slot
```

Invalid drops must not modify application state.

During drag:

### Valid target

Use:

* Accent border
* Subtle background highlight

### Invalid target

Use:

* Error/invalid visual state
* Do not insert the component

Avoid excessive animations.

---

# 9. Selection Model

Components placed inside the architecture are selectable.

Maintain a single selected component:

```typescript
selectedComponent: KitComponent | null
```

Only one component should be selected at a time.

The selected component must have a visible state.

Preferred visual feedback:

```text
Accent border
Subtle background
Subtle shadow
```

Do not rely only on color to communicate selection.

---

# 10. Code Variation Concept

The application is also a source-code documentation system.

A component may have multiple learning-oriented code variations.

Example:

```text
Tactile Button
    ↓
Button → LED ON
Button → LED ON/OFF
Button → LED Toggle
Button → LED Blink
Button → LED Timer
```

Code variations should be treated as data, not hard-coded UI.

Conceptual structure:

```typescript
type CodeVariation = {
  id: string;
  componentId: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  inputCount: number;
  outputCount: number;
  command: string;
  sourceCode: string;
};
```

---

# 11. Learning Progression

Code examples should generally progress from simple to more complex concepts.

Preferred progression:

```text
1. Basic digital input/output
2. if / else
3. Toggle / state
4. Timing / blink
5. Timer / sequence
6. Multiple input logic
7. Multiple output logic
8. State machines
```

Do not introduce unnecessarily complex abstractions into beginner examples.

The source code should be understandable by a beginner.

---

# 12. Source Code Documentation

The project is intended to document ESP32 source code using a consistent structure.

Preferred conceptual structure:

```text
INPUT ASSIGN
      ↓
SETUP
      ↓
COMMAND
      ↓
OUTPUT ASSIGN
```

Example:

```cpp
// ========================
// INPUT ASSIGN
// ========================

const int BUTTON = 18;


// ========================
// OUTPUT ASSIGN
// ========================

const int LED = 2;


// ========================
// SETUP
// ========================

void setup() {
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}


// ========================
// COMMAND
// ========================

void loop() {

  if (digitalRead(BUTTON) == LOW) {
    digitalWrite(LED, HIGH);
  } else {
    digitalWrite(LED, LOW);
  }

}
```

Maintain this conceptual separation when creating educational examples.

---

# 13. ESP32 Pin Documentation

GPIO assignments should be explicit.

For the current learning examples:

```text
Button 1 → GPIO 18
Button 2 → GPIO 19

LED 1 → GPIO 2
LED 2 → GPIO 4
```

Do not silently change GPIO assignments in existing examples.

If a GPIO mapping changes, update the corresponding documentation.

---

# 14. Important Documentation Rule

The following must eventually remain synchronized:

```text
Component
     ↓
GPIO
     ↓
Wiring
     ↓
Command
     ↓
Source Code
     ↓
Documentation
```

Do not modify source code GPIO assignments without considering the corresponding wiring documentation.

Future versions may introduce automatic consistency checking.

---

# 15. UI Design Rules

The application is a technical visual tool.

The design should resemble:

```text
Figma
+
Visual IDE
+
Embedded System Documentation
```

Preferred characteristics:

* Desktop-first
* Neutral gray workspace
* White cards
* Thin borders
* Rounded corners
* Blue accent
* Compact spacing
* Clear hierarchy
* Technical labels
* Monospace for code/GPIO
* Sans-serif for general UI

Avoid:

* Excessive gradients
* Excessive glassmorphism
* Huge hero sections
* Marketing-style landing page design
* Excessive shadows
* Oversized typography
* Unnecessary animations

The UI should prioritize functionality and visual clarity.

---

# 16. Main UI Areas

The application should maintain these conceptual areas:

```text
┌─────────────────────────────────────────────────────────────┐
│ Header                                                      │
├───────────────┬───────────────────────────┬─────────────────┤
│ Component     │ System Architecture       │ Code            │
│ Library       │                           │ Variations      │
│               │ INPUT                     │                 │
│ INPUT         │ BOARD                     │ Documentation   │
│ BOARD         │ OUTPUT                    │                 │
│ OUTPUT        │                           │                 │
├───────────────┴───────────────────────────┴─────────────────┤
│ Status Bar                                                  │
└─────────────────────────────────────────────────────────────┘
```

Do not completely redesign this structure without explicit instruction.

---

# 17. State Management

Keep state minimal.

Prefer derived state when possible.

Example:

```text
architecture
selectedComponent
selectedVariation
```

Avoid duplicating the same information in multiple state variables.

If a value can be derived from another state, derive it instead of storing it separately.

---

# 18. Mock Data vs Database

During early development, mock data is acceptable.

Recommended architecture:

```text
Mock Data
    ↓
Data Access Layer
    ↓
UI
```

Future architecture:

```text
Supabase
    ↓
Data Access Layer
    ↓
UI
```

Do not tightly couple UI components to Supabase.

The future database is expected to contain concepts such as:

```text
components
pins
commands
examples
example_inputs
example_outputs
source_codes
wirings
documentation
```

But do not implement database integration unless explicitly requested.

---

# 19. Supabase Rules

When Supabase is introduced:

* Keep database access outside presentational components.
* Use server-side access where appropriate.
* Keep environment variables secure.
* Never expose secret/service-role keys to the client.
* Use Row Level Security.
* Keep schema normalized.
* Avoid duplicating component metadata.
* Use relational references instead of repeated strings where appropriate.

Do not add Supabase prematurely.

---

# 20. Code Quality

Prefer:

* TypeScript
* Strong typing
* Small reusable components
* Clear naming
* Predictable state
* Simple functions
* Minimal dependencies

Avoid:

* `any` unless absolutely necessary
* Large monolithic components
* Duplicated logic
* Magic strings
* Unnecessary abstractions
* Premature optimization

---

# 21. Component Design

Components should have one clear responsibility.

Prefer:

```text
ComponentLibrary
ComponentGroup
ComponentItem
ArchitectureCanvas
ArchitectureSlot
PlacedComponent
CodeVariationPanel
CodeVariationList
CodeVariationItem
```

But follow the existing project's component conventions.

Do not create dozens of components for trivial markup.

---

# 22. Error Handling

Errors should be understandable to the user.

Example:

```text
Invalid component

This component cannot be placed in the Input slot.
```

Avoid exposing raw technical errors to normal users.

For development/debugging, preserve useful console/log information where appropriate.

---

# 23. Accessibility

Interactive elements must be accessible.

Ensure:

* Buttons have accessible labels.
* Interactive cards can be identified.
* Keyboard interaction is considered where practical.
* Selection is not communicated only through color.
* Text has sufficient contrast.
* Focus states are visible.

Drag-and-drop should not be the only possible interaction for important actions when a practical alternative exists.

---

# 24. Performance

Avoid unnecessary re-renders.

Do not introduce optimization prematurely.

However:

* Keep large code strings out of unnecessary component state.
* Avoid duplicating large objects.
* Use stable IDs.
* Avoid expensive calculations during render.

The application should remain responsive while interacting with the architecture canvas.

---

# 25. Dependencies

Before adding a dependency:

1. Check whether the project already provides equivalent functionality.
2. Check whether the functionality can reasonably be implemented with existing tools.
3. Add a dependency only when it provides clear value.

Do not add libraries simply because they are popular.

---

# 26. Scope Control

When asked to implement a feature:

1. Identify the exact requested scope.
2. Inspect existing implementation.
3. Implement only what is necessary.
4. Do not automatically implement future roadmap items.
5. Do not redesign unrelated parts.
6. Do not refactor unrelated code.

If a requested change requires modifying an existing architecture, make the smallest safe change.

---

# 27. Phase-Based Development

The project should be developed in phases.

## Phase 1 — Visual Foundation

```text
Component Library
Drag & Drop
Three Slots
Component Selection
Code Variation List
```

## Phase 2 — Source Code Viewer

```text
Variation Selection
Source Code Viewer
Code Explanation
Input / Command / Output documentation
```

## Phase 3 — Wiring Documentation

```text
Pin Mapping
Wiring
GPIO Documentation
Architecture Visualization
```

## Phase 4 — Supabase

```text
Database
CRUD
Source Code Repository
Component Repository
Documentation Repository
```

## Phase 5 — Advanced Features

Potential future features:

```text
Code Editor
Code Generator
Project Saving
Versioning
Simulation
Serial Monitor
AI Assistance
Automatic Wiring Validation
```

Do not implement a later phase unless explicitly requested.

---

# 28. When Implementing a New Feature

Follow this process:

```text
1. Inspect
      ↓
2. Understand
      ↓
3. Plan minimally
      ↓
4. Implement
      ↓
5. Test
      ↓
6. Review affected files
      ↓
7. Report changes
```

Before coding, determine:

* Which files are affected?
* Is there an existing component to extend?
* Is there existing state to reuse?
* Is there existing data to reuse?
* Will the change affect another feature?

---

# 29. Testing Requirements

After implementing functionality, verify:

* Application starts correctly.
* No TypeScript errors.
* No build errors.
* No console errors.
* Existing functionality still works.
* Drag-and-drop works.
* Invalid drops are rejected.
* Selection works.
* Code variation list updates correctly.
* UI does not break at desktop resolutions.

For UI changes, test the actual user flow rather than only checking compilation.

---

# 30. Do Not Fake Completion

Never claim a feature is complete if:

* It is only mocked visually when functional behavior was requested.
* Drag-and-drop does not actually work.
* Data is hard-coded in the wrong layer.
* Existing functionality is broken.
* Build/type checks fail.

Clearly distinguish:

```text
Implemented
Mocked
Not implemented
Blocked
```

---

# 31. Final Response After Implementation

After making changes, report concisely:

```text
Implemented:
- ...
- ...
- ...

Files changed:
- ...
- ...

Validation:
- Type check: ...
- Build: ...
- Tests: ...

Not implemented:
- ...
```

Do not provide a long explanation unless requested.

---

# 32. Golden Rule

The most important rule for this repository:

> Build the ESP32 Learning Kit Orchestrator incrementally. Preserve the existing application, keep the data model modular, keep the UI visual and technical, and never expand the scope beyond the requested phase.

The intended long-term relationship is:

```text
COMPONENT
    ↓
INPUT / BOARD / OUTPUT
    ↓
COMMAND
    ↓
SOURCE CODE
    ↓
WIRING
    ↓
DOCUMENTATION
```

Every implementation should move the application closer to this model without unnecessarily implementing future functionality.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
