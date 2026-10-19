# groove-ui changelog

## 2.0.0

A lighter, cleaner redesign.

### Changed
- `textField` renders its label as a styled `<span>` instead of a `<label>` element, for easier custom styling.
- `iconButton` and `iconLink`: the `label` prop has been renamed to `title`.
- `cover`: the `alt` prop has been renamed to `altText`.
- Theme: the `muted` text color is now a softer gray (`#B4B8C2`) for a lighter look.

### Migration
Old prop names are ignored without a warning. Update `label` to `title` and `alt` to `altText` in your code.

## 1.4.0

- Added `note` component for small helper text.
- Icon components now hide their SVGs from screen readers.
