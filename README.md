# JobTracker (Vite + React + Tailwind **v4**)

This scaffold uses **Tailwind v4 only** (no `tailwind.config.js`, no PostCSS setup).

## Run
```bash
npm i
npm run dev
```
Visit http://localhost:5173

## Tailwind v4 usage
- Styles are enabled by a single CSS import in `src/index.css`:
  ```css
  @import "tailwindcss";
  ```
- No config file is required. Utility classes in the source files are picked up automatically.

## API switch
Set `VITE_API_BASE_URL` in `.env` to point the axios client to your backend. Without it, the app uses localStorage mocks.
