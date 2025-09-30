# Contribution Chart Color Reference

## GitHub Variation Colors (Fixed)

### Light Mode

- **Level 0** (No contributions): `bg-gray-100` - Light gray background
- **Level 1** (Light activity): `bg-green-100` - Very light green
- **Level 2** (Medium activity): `bg-green-300` - Medium light green
- **Level 3** (High activity): `bg-green-500` - Medium green
- **Level 4** (Max activity): `bg-green-700` - Dark green

### Dark Mode

- **Level 0** (No contributions): `dark:bg-gray-800` - Dark gray background
- **Level 1** (Light activity): `dark:bg-green-800` - Dark green (visible)
- **Level 2** (Medium activity): `dark:bg-green-600` - Medium dark green
- **Level 3** (High activity): `dark:bg-green-400` - Medium light green
- **Level 4** (Max activity): `dark:bg-green-300` - Light green

## Key Improvements Made

1. **Visibility**: Changed from `bg-green-900` (too dark) to `bg-green-800` and lighter for better contrast
2. **Progression**: Created a clear visual progression from light to dark
3. **Contrast**: Ensured all levels are clearly distinguishable in both themes
4. **Tooltips**: Fixed tooltip contrast with proper background colors:
   - Light mode: Dark tooltip (`bg-gray-900`, `text-white`)
   - Dark mode: Light tooltip (`bg-gray-100`, `text-gray-900`)

## Usage

The colors automatically adapt to the user's theme preference and provide excellent visibility across all contribution levels.
