# Ochno Webapp

## Get started
```
// The first time; install dependencies:
npm install

// Run environment (hot module reload):
npm run dev
```

## Code structure
```
frameworks - contains setup for all the imported packages and relevant addons to them.
modules    - reactive data stores for different data points. Also contains api endpoints and common data manipulation functions.
ui         - All the vue components and everything that is rendered on screen.
  components  - Shared components that are relatively simple and does not compound functionality.
  composables - Shared composable functions, handling common use cases.
  style       - General styling and theme less/css.
  templates   - Compound components with specific use cases, structured based on their primary data point.
  views       - Router views/pages, containing mostly top-level layout.
```
