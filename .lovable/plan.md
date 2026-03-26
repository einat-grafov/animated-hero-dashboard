

## Fix Build Errors

### Problems
1. **Missing `build:dev` script** — Lovable requires a `build:dev` script in `package.json` to run the preview. It's not present.
2. **Missing `framer-motion` dependency** — The `framer-motion` package is listed in `package.json` but failing to resolve, likely due to the lockfile being out of sync or the dependency not being installed.

### Fix
**Edit `package.json`** — Add the `build:dev` script:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "preview": "vite preview"
}
```

This single change should resolve both issues — the `build:dev` script will trigger a proper install of all dependencies (including `framer-motion`) and build the project.

