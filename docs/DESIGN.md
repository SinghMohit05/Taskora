# Design System & UI/UX Guidelines
## Project Management System (Web + Mobile)

---

## 1. Design Philosophy & Aesthetic Vision

The design system is crafted to deliver a **modern, executive, high-productivity experience**. It balances visual polish (glassmorphism accents, crisp borders, subtle micro-animations) with utilitarian clarity (clear data hierarchy, unmistakable status indicators, high-contrast typography).

* **Visual Style**: Clean modern SaaS aesthetic with support for Dark and Light modes.
* **Feel**: Snappy, responsive, intentional, and clutter-free.
* **Accessibility**: Meets WCAG 2.1 AA standards for contrast ratios across all text, status badges, and interactive controls.

---

## 2. Color Palette & Design Tokens

### 2.1 Core Neutral Palette (Dark & Light Theme)

```css
/* Design Tokens - CSS Variables */
:root {
  /* Light Theme */
  --bg-app: #F8FAFC;          /* Slate 50 - Main background */
  --bg-surface: #FFFFFF;      /* White - Cards, dialogs, dropdowns */
  --bg-subtle: #F1F5F9;       /* Slate 100 - Secondary containers */
  --border-default: #E2E8F0;  /* Slate 200 - Card and input borders */
  --border-strong: #CBD5E1;   /* Slate 300 - Focused element borders */
  
  --text-primary: #0F172A;    /* Slate 900 - Headings and primary text */
  --text-secondary: #475569;  /* Slate 600 - Body and supporting text */
  --text-muted: #94A3B8;      /* Slate 400 - Placeholders and timestamps */
  
  /* Brand / Primary Accent (Deep Indigo) */
  --primary-50: #EEF2FF;
  --primary-100: #E0E7FF;
  --primary-500: #6366F1;
  --primary-600: #4F46E5;     /* Main interactive button color */
  --primary-700: #4338CA;     /* Hover state */
  --primary-foreground: #FFFFFF;
}

[data-theme="dark"] {
  /* Dark Theme */
  --bg-app: #0B0F19;          /* Deep midnight navy */
  --bg-surface: #111827;      /* Rich dark slate - Cards and panels */
  --bg-subtle: #1F2937;       /* Card elevated surface */
  --border-default: #1F2937;  /* Subtle dividers */
  --border-strong: #374151;   /* Active boundaries */
  
  --text-primary: #F9FAFB;    /* Off-white primary text */
  --text-secondary: #9CA3AF;  /* Cool gray body text */
  --text-muted: #6B7280;      /* Muted captions */
  
  --primary-600: #6366F1;     /* Elevated Indigo accent */
  --primary-700: #4F46E5;
  --primary-foreground: #FFFFFF;
}
```

### 2.2 Semantic Status & Priority Colors

Colors are strictly mapped to entity states to guarantee cognitive consistency across Web and Mobile:

#### Project & Task Statuses
| Status | Badge Background | Badge Text | Border Accent | Semantic Meaning |
| :--- | :--- | :--- | :--- | :--- |
| **Not Started** (Project) | `#F1F5F9` (Slate 100) | `#475569` (Slate 700) | `#CBD5E1` | Planned but uninitiated |
| **Pending** (Task) | `#FEF3C7` (Amber 100) | `#B45309` (Amber 800) | `#FCD34D` | Awaiting execution |
| **In Progress** (Both) | `#E0E7FF` (Indigo 100) | `#4338CA` (Indigo 700) | `#A5B4FC` | Currently being worked on |
| **Completed** (Both) | `#DCFCE7` (Emerald 100) | `#15803D` (Emerald 700) | `#86EFAC` | Finished and verified |

#### Task Priority Levels
| Priority | Pill Background | Indicator Dot / Text | Visual Urgency |
| :--- | :--- | :--- | :--- |
| **Low** | `#F8FAFC` (Slate 50) | `#64748B` (Slate 500) | Standard / Routine backlog |
| **Medium** | `#FEF3C7` (Amber 50) | `#D97706` (Amber 600) | Moderate milestone priority |
| **High** | `#FEE2E2` (Rose 100) | `#DC2626` (Rose 600) | Critical / Immediate focus |

---

## 3. Fonts & Typography Hierarchy

* **Primary Font Family**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
* **Heading Accent Font**: `Outfit` or `Inter` (geometric, modern, authoritative)
* **Code / Monospace**: `JetBrains Mono`, `Fira Code`, `monospace` (for IDs and timestamps)

### Typography Scale

| Token | Size | Line Height | Weight | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display 2XL** | `32px` (`2rem`) | `38px` | Bold (`700`) | Web Dashboard welcome, Main Hero headers |
| **Heading XL** | `24px` (`1.5rem`) | `32px` | SemiBold (`600`) | Page titles (Projects, Tasks, Mobile Dashboard) |
| **Heading LG** | `20px` (`1.25rem`) | `28px` | SemiBold (`600`) | Modal titles, Section headers |
| **Subheading MD**| `16px` (`1rem`) | `24px` | Medium (`500`) | Card titles, Form field labels, Nav links |
| **Body Default** | `14px` (`0.875rem`) | `20px` | Regular (`400`) | General text, descriptions, table cells |
| **Caption SM** | `12px` (`0.75rem`) | `16px` | Regular (`400`) / Medium (`500`) | Metadata, timestamps, status badges |
| **Micro XS** | `11px` (`0.6875rem`) | `14px` | Medium (`500`) | Priority tag pills, tiny counters |

---

## 4. Component UI Specifications

### 4.1 Buttons & Interactive Elements
* **Primary Button**: Background `--primary-600`, text `white`, rounded `8px`, subtle box shadow `0 1px 2px rgba(0,0,0,0.05)`. Hover: `--primary-700` with smooth transition (`150ms ease-in-out`). Active: slight scale down (`scale-98`).
* **Secondary / Outline Button**: Border `1px solid var(--border-default)`, background `transparent`, text `--text-primary`. Hover: background `--bg-subtle`.
* **Danger Button**: Background `#EF4444`, text `white`. Used for Delete Project and Delete Task confirmations with a confirmation modal barrier.

### 4.2 Form Inputs & Controls
* **Input Fields**: Height `42px` (Web) / `48px` (Mobile touch target), padding `10px 14px`, border `1px solid var(--border-default)`, border-radius `8px`.
* **Focus State**: Ring `2px solid var(--primary-500)`, border-color `transparent`.
* **Validation Error State**: Border `1px solid #EF4444`, helper error message rendered below in `12px` red text.

### 4.3 Stat Summary Cards (Dashboard)
* **Design**: Elevated card with subtle border, subtle gradient overlay or glassmorphic backdrop, prominent numeral display (`32px bold`), with icon badge in top right corner.
* **Metric Cards**:
  1. *Total Projects*: Indigo icon & accent
  2. *Total Tasks*: Purple icon & accent
  3. *Completed Tasks*: Emerald green icon & accent
  4. *Pending Tasks*: Amber warning icon & accent
  5. *In Progress*: Cyan / Blue progress icon & accent

### 4.4 Task & Project Cards
* **Layout**: Clear hierarchy with title, status pill, priority indicator, and due date timestamp.
* **Quick Toggle**: Dedicated circular checkbox on tasks enabling immediate toggle between `Pending` $\leftrightarrow$ `Completed` with instant optimistic UI update.

---

## 5. Mobile-Specific UI/UX Guidelines

1. **Touch Ergonomics**: Minimum touch targets are $\ge 44 \times 44\text{ pt}$ for buttons, tabs, and interactive rows.
2. **Safe Area Insets**: Native handling of iOS notch/Dynamic Island and Android status/navigation bars via `react-native-safe-area-context`.
3. **Pull-to-Refresh**: Native `RefreshControl` integrated into the top of scrollable views with brand indigo tint (`#4F46E5`).
4. **Bottom Sheet Modals**: For creating/editing tasks on mobile, slide-up bottom sheets are used rather than centered web modals for optimal one-hand thumb usability.
5. **Persistent Offline Banner**: When offline, a sticky top alert (`#EF4444` background with white text) announces: *"No network connection. Showing cached data."*
