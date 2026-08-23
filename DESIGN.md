# ESP32 Learning Kit Orchestrator — Design Specification

## 1. Overview

Aplikasi ini adalah visual learning environment untuk ESP32 Embedded System Kit.

Konsep utama aplikasi:

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
Select Code Variation
```

Untuk tahap V1, aplikasi **hanya sampai pada pemilihan component dan menampilkan variasi source code dari component yang dipilih**.

Belum perlu membuat:

* code editor penuh
* code generator
* Arduino uploader
* serial monitor
* simulation
* database CRUD admin
* wiring editor kompleks
* authentication
* execution/compilation

---

# 2. Design Reference

Gunakan screenshot yang diberikan sebagai referensi visual utama.

Karakter desain:

* Desktop application
* Engineering / developer tool
* Terlihat seperti Figma / visual IDE
* Sidebar kiri untuk component library
* Canvas utama untuk system architecture
* Panel kanan untuk code variation dan documentation
* Card-based UI
* Compact spacing
* Border tipis
* Rounded corners
* Neutral gray workspace
* White cards
* Blue sebagai accent/action color
* Informasi teknis tetap mudah dibaca

Jangan membuat UI seperti dashboard bisnis biasa.

Aplikasi harus terasa seperti:

```text
Figma
+
Arduino IDE
+
Visual Node Editor
+
Learning Documentation
```

---

# 3. Main Layout

Desktop layout:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Header                                                              │
├──────────────┬──────────────────────────────┬───────────────────────┤
│              │                              │                       │
│ COMPONENTS   │ SYSTEM ARCHITECTURE         │ CODE VARIATIONS       │
│              │                              │                       │
│ Input        │ ┌────────────────────────┐   │ Selected Component    │
│ [cards]      │ │ INPUT                  │   │                       │
│              │ │ [+ Drop Component]     │   │ Variation 1           │
│ Board        │ ├────────────────────────┤   │ Variation 2           │
│ [cards]      │ │ BOARD                  │   │ Variation 3           │
│              │ │ [+ Drop Component]     │   │ Variation 4           │
│ Output       │ ├────────────────────────┤   │ Variation 5           │
│ [cards]      │ │ OUTPUT                 │   │                       │
│ [cards]      │ │ [+ Drop Component]     │   │                       │
│              │ └────────────────────────┘   │                       │
│              │                              │                       │
├──────────────┴──────────────────────────────┴───────────────────────┤
│ Status Bar                                                          │
└─────────────────────────────────────────────────────────────────────┘
```

---

# 4. Component Library

Sidebar kiri bernama:

```text
COMPONENTS
```

Component dibagi menjadi tiga kategori.

## INPUT

Contoh:

```text
Tactile Button
Motion Switch
Potentiometer
DHT22
```

Untuk V1, minimal gunakan:

```text
Tactile Button
```

---

## BOARD

Contoh:

```text
ESP32
Arduino Uno
Raspberry Pi
```

Untuk V1:

```text
ESP32
```

---

## OUTPUT

Contoh:

```text
LED
Buzzer
Motor Driver
MAX7219 LED Matrix
```

Untuk V1:

```text
LED
```

---

# 5. Component Card

Setiap component ditampilkan sebagai card kecil.

Contoh:

```text
┌──────────────────────┐
│ [ IMAGE ]            │
│                      │
│ Tactile Button       │
│ Input                │
└──────────────────────┘
```

Component card harus dapat:

1. Click
2. Drag
3. Drop

Visual feedback:

### Normal

```text
cursor: grab
```

### Saat dragging

```text
opacity: 0.6
scale: 0.98
```

### Saat hover pada slot

Slot berubah menjadi:

```text
border: accent
background: accent-light
```

---

# 6. System Architecture Card

Card utama berada di tengah.

Judul:

```text
SYSTEM ARCHITECTURE
```

Di dalamnya terdapat tepat tiga slot:

```text
INPUT
BOARD
OUTPUT
```

Struktur:

```text
┌─────────────────────────────┐
│ SYSTEM ARCHITECTURE         │
│                             │
│ INPUT                       │
│ ┌─────────────────────────┐ │
│ │ + Drop Input Component  │ │
│ └─────────────────────────┘ │
│             ↓               │
│ BOARD                       │
│ ┌─────────────────────────┐ │
│ │ + Drop Board Component  │ │
│ └─────────────────────────┘ │
│             ↓               │
│ OUTPUT                      │
│ ┌─────────────────────────┐ │
│ │ + Drop Output Component │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

---

# 7. Slot Rules

Setiap slot hanya menerima tipe component yang sesuai.

## INPUT SLOT

Accept:

```text
category === "input"
```

Reject:

```text
board
output
```

---

## BOARD SLOT

Accept:

```text
category === "board"
```

Reject:

```text
input
output
```

---

## OUTPUT SLOT

Accept:

```text
category === "output"
```

Reject:

```text
input
board
```

Jika component salah kategori di-drop:

```text
Invalid component
This component cannot be placed in this slot.
```

Jangan memasukkan component yang salah ke slot.

---

# 8. Selected Component

Setiap component yang berhasil ditempatkan dapat dipilih.

Contoh:

```text
┌─────────────────────────┐
│ INPUT                   │
│                         │
│ ┌─────────────────────┐ │
│ │  Tactile Button     │ │
│ │  GPIO 18            │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

Ketika selected:

```text
border: accent color
box-shadow: subtle
```

Tambahkan indicator:

```text
Selected
```

---

# 9. Code Variation Panel

Panel kanan bernama:

```text
CODE VARIATIONS & IMPLEMENTATION
```

Panel ini awalnya dapat kosong.

Empty state:

```text
Select a component to view
available code variations.
```

Setelah component dipilih:

```text
SELECTED COMPONENT

Tactile Button
Input / Digital
```

Kemudian tampilkan:

```text
VARIATIONS

1. Button → LED ON
2. Button → LED ON/OFF
3. Button → LED Toggle
4. Button → LED Blink
5. Button → LED Timer
```

Untuk component lain nantinya:

```text
Tactile Button
    ↓
5 code variations

LED
    ↓
5 code variations

DHT22
    ↓
5 code variations
```

---

# 10. Code Variation Data

Setiap variation minimal memiliki:

```text
id
title
description
difficulty
input_count
output_count
command
source_code
```

Contoh:

```json
{
  "id": "EX-001",
  "title": "Button → LED ON",
  "description": "Turn LED on when button is pressed.",
  "difficulty": "Beginner",
  "inputCount": 1,
  "outputCount": 1,
  "command": "ON/OFF"
}
```

---

# 11. Variation List UI

Variation ditampilkan sebagai list item.

```text
┌───────────────────────────────┐
│ Button → LED ON               │
│ Beginner                      │
│ 1 Input → 1 Output            │
└───────────────────────────────┘

┌───────────────────────────────┐
│ Button → LED ON/OFF           │
│ Beginner                      │
│ 1 Input → 1 Output            │
└───────────────────────────────┘
```

Saat hover:

```text
background: light accent
```

Saat selected:

```text
border: accent
background: accent-light
```

---

# 12. Current V1 Data

Gunakan data berikut sebagai mock data terlebih dahulu.

## Input

### Tactile Button

```text
id: tactile-button
name: Tactile Button
category: input
type: digital
```

Variations:

```text
1. Button → LED ON
2. Button → LED ON/OFF
3. Button → LED Toggle
4. Button → LED Blink
5. Button → LED Timer
```

---

## Board

### ESP32

```text
id: esp32
name: ESP32
category: board
type: microcontroller
```

---

## Output

### LED

```text
id: led
name: LED
category: output
type: digital
```

---

# 13. Architecture State

Gunakan state seperti:

```typescript
type ComponentCategory =
  | "input"
  | "board"
  | "output";

type SelectedArchitecture = {
  input: Component | null;
  board: Component | null;
  output: Component | null;
};
```

Contoh initial state:

```typescript
{
  input: null,
  board: null,
  output: null
}
```

Setelah user melakukan drag:

```typescript
{
  input: tactileButton,
  board: esp32,
  output: led
}
```

---

# 14. Interaction Flow

## Step 1

User melihat component library.

```text
INPUT
Tactile Button

BOARD
ESP32

OUTPUT
LED
```

## Step 2

User drag:

```text
Tactile Button
        ↓
INPUT SLOT
```

## Step 3

User drag:

```text
ESP32
  ↓
BOARD SLOT
```

## Step 4

User drag:

```text
LED
 ↓
OUTPUT SLOT
```

Architecture menjadi:

```text
Tactile Button
      ↓
     ESP32
      ↓
      LED
```

## Step 5

User click `Tactile Button`.

Panel kanan berubah menjadi:

```text
CODE VARIATIONS

Button → LED ON
Button → LED ON/OFF
Button → LED Toggle
Button → LED Blink
Button → LED Timer
```

---

# 15. Important UX Rule

Jangan otomatis menampilkan seluruh source code ketika component baru dipilih.

Untuk V1:

```text
Select Component
       ↓
Show Variations
       ↓
User selects Variation
```

Setelah variation dipilih, cukup tandai variation sebagai selected.

Code editor/detail implementation dapat dibuat pada phase berikutnya.

---

# 16. Visual Style

Gunakan:

* Neutral gray workspace
* White cards
* Thin borders
* Rounded corners 8–12px
* Compact UI
* Blue accent
* Small technical labels
* Monospace font untuk code/GPIO
* Sans-serif untuk UI

Jangan menggunakan gradient berlebihan.

Jangan menggunakan glassmorphism berlebihan.

Jangan membuat UI seperti landing page.

Target visual:

```text
Professional
Technical
Educational
Visual
Minimal
Dense but readable
```

---

# 17. Responsive Scope

V1 difokuskan untuk:

```text
Desktop
1280px+
```

Prioritas:

```text
Desktop application experience
```

Mobile responsive belum menjadi prioritas.

---

# 18. V1 Boundary

### INCLUDE

* Component library
* Input/Board/Output grouping
* Drag & drop
* Three architecture slots
* Component selection
* Selected state
* Code variation panel
* Variation list
* Mock data
* Basic empty states
* Basic invalid-drop feedback

### DO NOT INCLUDE

* Authentication
* Supabase
* Database CRUD
* Code editor
* Code execution
* Arduino upload
* Serial monitor
* Wiring editor
* AI code generation
* Simulation
* Version management
* Admin panel

Semua fitur tersebut disiapkan untuk phase berikutnya.

---

# 19. Definition of Done

V1 dianggap selesai apabila:

* User dapat melihat component library.
* User dapat drag component.
* Input hanya dapat masuk Input Slot.
* Board hanya dapat masuk Board Slot.
* Output hanya dapat masuk Output Slot.
* User dapat mengganti component.
* User dapat memilih component.
* Component yang dipilih memiliki visual selected state.
* Panel Code Variations berubah berdasarkan component yang dipilih.
* Tactile Button memiliki minimal 5 variasi code.
* Tidak ada kebutuhan backend untuk menjalankan prototype.
* UI terasa seperti visual IDE/Figma, bukan dashboard biasa.
