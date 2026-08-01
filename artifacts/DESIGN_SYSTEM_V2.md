# DESIGN_SYSTEM_V2.md

> This document supersedes the MVP design only for the UI enhancement phase.
> The backend architecture, APIs, business logic, data models, and existing
> functionality must remain unchanged.
>
> Objective:
> Transform the existing MVP into a premium enterprise SaaS application with a
> modern light theme, exceptional UX, modular architecture, and polished
> interactions.

---

# 1. Design Philosophy

The application should feel comparable to:

- Linear
- Notion
- GitHub
- Vercel
- Figma
- Jira Cloud
- Atlassian
- Raycast
- Stripe Dashboard

Priorities

1. Clarity
2. Speed
3. Premium appearance
4. Excellent UX
5. Scalability
6. Accessibility
7. Consistency

Every screen should look intentionally designed rather than generated.

---

# 2. Theme

Primary Theme

Light

No dark mode.

Large white surfaces.

Subtle elevation.

Very soft shadows.

Minimal borders.

Rounded corners.

Comfortable spacing.

Glass effects only where appropriate.

---

# 3. Color System

Background
#F7F8FC

Secondary Background
#FFFFFF

Card
#FFFFFF

Border
#E8EAF2

Primary Text
#1E293B

Secondary Text
#64748B

Muted Text
#94A3B8

Primary Accent
#2563EB

Hover
#1D4ED8

Success
#22C55E

Warning
#F59E0B

Danger
#EF4444

Information
#0EA5E9

Selection
rgba(37,99,235,.12)

---

# 4. Typography

Use modern typography.

Large headings.

Comfortable body text.

Proper hierarchy.

Excellent readability.

Balanced whitespace.

---

# 5. Layout

Use a professional dashboard layout.

Top Navigation

Left Sidebar

Main Content

Inspector Panel (when appropriate)

Sticky toolbar

Sticky search

Responsive layout

Large desktop optimized

Tablet responsive

Mobile responsive

---

# 6. Enterprise Components

Implement reusable components.

Navigation

- Sidebar
- Collapsible sidebar
- Breadcrumbs
- Command palette
- Search bar
- Global actions

Cards

- Statistic cards
- Information cards
- Upload cards
- Graph cards

Tables

- Sorting
- Filtering
- Column resizing
- Pagination
- Empty states

Dialogs

- Modal
- Confirmation
- Drawer
- Sheet

Inputs

- Validation
- Helper text
- Prefix
- Suffix
- Keyboard navigation

Feedback

- Toasts
- Inline alerts
- Progress
- Skeletons

---

# 7. Interactions

Support

Right click context menu

Hover actions

Keyboard shortcuts

Drag & Drop

Multi-select

Bulk actions

Copy

Paste

Undo

Redo

Smart tooltips

Inline editing

Expandable panels

Resizable panels

Collapsible sections

Split panes

Floating action menus

Quick actions

---

# 8. Graph Experience

Concept graph becomes the hero feature.

Support

Zoom

Pan

Mini map

Search node

Highlight neighbors

Edge labels

Legend

Filters

Focus mode

Animated selection

Export

Fullscreen

Inspector panel

---

# 9. Upload Experience

Large upload area

Drag & Drop

Recent uploads

Upload history

File validation

Progress

Retry

Cancel upload

Success animation

Detailed errors

---

# 10. Results Experience

Tabs

Overview

Summary

Concepts

Relationships

Flashcards

Graph

Documents

Export

Search

Filter

Sort

Copy

Download

Print

---

# 11. Motion

Subtle.

Professional.

Fast.

Use

Hover transitions

Button transitions

Panel expansion

Loading skeletons

Fade

Scale

Smooth scrolling

No excessive animations.

---

# 12. Accessibility

Keyboard accessible.

Screen reader friendly.

Visible focus.

ARIA labels.

High contrast.

Large click targets.

---

# 13. Performance

Virtualization.

Lazy loading.

Code splitting.

Memoization.

Optimistic UI.

Caching.

Minimal re-rendering.

---

# 14. Code Standards

Never duplicate components.

Never duplicate styles.

Never create inconsistent spacing.

Every component reusable.

Every page responsive.

Every interaction accessible.

Everything production-ready.