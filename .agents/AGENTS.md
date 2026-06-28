# Cureza Workspace Rules

## Layout and Width
- **Container Width Alignment**: All public page containers and main layouts must strictly align with the global header/navigation container width (`container mx-auto px-4 md:px-6`).
- **No Narrow Restrictions**: Avoid restricting main page layout wrappers with `max-w-7xl` or other narrow constraints. This ensures page grids align seamlessly with the header on wide/2K monitors.

### Card Design
- Apply **8px border-radius** to all cards.
- Remove **all box shadows** and **drop shadows** (use only subtle borders).
- Use the following subtle border styles:
  ```css
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  border-color: rgba(85, 85, 85, 0.18) !important;
  box-shadow: none !important;
  filter: none !important;
  ```

### Typography
- Use a clean, modern, highly readable font.
- Avoid bold typography: keep font weight between **400–600** (Regular to Semi-Bold). Do not use heavy bold fonts.
- Improve readability with proper line height and spacing.
- Text should **not** be in ALL CAPS. Use **Capitalized (Title Case)** wherever appropriate.
- Maintain consistent typography throughout the page.

### Layout & Spacing
- Content width must match the **Header Container Width** (`container mx-auto px-4 md:px-6`) for perfect alignment.
- Maintain consistent horizontal spacing.
- Use proper whitespace between sections and keep alignment clean and balanced.

### Responsive Design & Card Carousels
- Entire page must be **100% Mobile Responsive** across desktop, laptop, tablet, and mobile.
- If any section contains too many cards causing excessive vertical scrolling, automatically convert that card layout into a **responsive horizontal carousel/slider**.
- Carousels must support: (Only Mobile & Tablets)
  - Swipe on mobile
  - Mouse drag on desktop
  - Navigation arrows
  - Pagination dots (if needed)
  - Smooth animation
- Avoid long vertical scrolling inside a single section.

### UI Consistency & Performance
- Keep spacing, padding, margins, and border radius consistent across the page.
- Maintain a premium minimal design. Avoid unnecessary visual effects.
- Use subtle hover animations only where needed.
- Do not use heavy animations; keep the UI lightweight, fast, and accessible.
