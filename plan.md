# Admin Page File Organization Plan

Based on the existing structure where pages are under `src/pages/` with subfolders (e.g., `interactive-map`), I propose the following organization for the admin page:

## Directory Structure

```
src/pages/admin/
├── index.html          # Main HTML file for the admin page
├── admin.css           # Styles specific to the admin page
└── admin.js            # JavaScript functionality for the admin page
```

## Rationale

- **Separation**: Keeps the admin page completely separate from the interactive map, allowing independent development and maintenance.
- **Consistency**: Follows the same pattern as the `interactive-map` page.
- **Shared Resources**: The admin page can link to global styles (`../../styles/global.css`) and scripts (`../../scripts/global.js`) for common elements like header/footer if needed.
- **Assets**: If the admin page requires specific images or assets, create a subfolder under `src/assets/img/admin/` (e.g., `src/assets/img/admin/icons/`).

## Next Steps

Once approved, switch to code mode to create the files and implement the page.