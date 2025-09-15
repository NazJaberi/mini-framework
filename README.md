# Mini Framework (NJABERI) — Full Beginner’s Guide

This project is a tiny JavaScript framework plus a sample Todo app that shows how to use it. If you can write a little JS and HTML, you can understand this framework end‑to‑end. This guide explains every moving piece, carefully and plainly.

What you’ll get by the end:
- What each file does and how pieces fit together
- How elements are created and rendered
- How state changes trigger re‑renders
- How events work
- How routing works (URLs → which view)
- How the Todo app uses all of the above


## Project Layout

- `src/index.js`: Public entry point that wires everything together (createApp, exports).
- `src/core/dom.js`: Virtual element (VNode) and `createElement` to build UI.
- `src/core/state.js`: Tiny global state store with subscribe/notify.
- `src/core/events.js`: Minimal event emitter + root DOM event setup.
- `src/core/router.js`: Simple router (supports hash routes like `#/active`).
- `src/core/editable.js`: Utility to turn text into an inline editable input.
- `todo-app/`: Example TodoMVC‑style app built using the framework.
- `docs/README.MD`: A shorter feature‑oriented doc; this file is the deep dive.


## The Big Picture (How it all works)

1) You write UI using `createElement(tag, attrs, ...children)`. That returns a "VNode" (a lightweight JS object describing the DOM you want).

2) When you mount a VNode, it turns into real DOM via `vnode.render()` and gets appended to the page.

3) App state lives in one place: the `store`. When you call `store.setState(...)`, every subscriber runs (usually your `render()` function).

4) Your `render()` builds fresh VNodes from the latest state and mounts them again (simple full re‑render). Browsers are fast enough for small apps.

5) Events are attached inline as attributes (like `onclick`, `oninput`). The framework sets those on the real DOM elements when rendering.

6) The router updates the store with the current route when the URL changes (hashchange or history). Components can react to that state.


## Core: DOM Abstraction

File: `src/core/dom.js`

- `class VNode` (turns descriptions into real DOM):
  - `constructor(tag, attrs = {}, children = [])` stores what to build.
  - `render()` creates the element, applies attributes, and appends all children.
    - Styles: if `style` is an object, each key/value is applied to `element.style`.
    - Events: any key starting with `on` (like `onclick`) is treated as an event handler.
      - The code sets `element[key] = value` (e.g., `element.onclick = handler`).
      - It also sets a `data-event-...` attribute, which is currently informational.
    - Boolean attributes (`checked`, `disabled`, `selected`, `autofocus`) are set only when `true`.
    - Children can be strings, numbers, other VNodes, real DOM nodes, or arrays of those.

- `createElement(tag, attrs = {}, ...children)`:
  - Flattens nested arrays (so you can do `children.map(...)`), removes `null/undefined/false` children, and returns a `new VNode(...)`.

Why a VNode? It gives you a clean JS way to describe the UI before turning it into real DOM. This is a simplified Virtual DOM approach.


## Core: App Entry and Mounting

File: `src/index.js`

- `createApp(rootSelector)`:
  - Finds the root element in the page (`document.querySelector(rootSelector)`).
  - Calls `initDOMEvents(rootElement)` once to prepare event handling.
  - Returns an object with:
    - `mount(component)`: Clears the root and appends your UI.
      - If you pass a function, it assumes it returns a VNode; if you pass a VNode, it renders it; if you pass a real node, it appends directly.
    - `use(plugin)`: Optional plugin hook (calls `plugin(this)`).
    - `router`: The singleton router instance.
    - `store`: The singleton global store.
  - You typically create a single app: `const app = createApp('#app')`.

Exports:
- Re‑exports everything you need in apps: `createElement`, `Store`, `store`, `EventEmitter`, `Router`, `router`, `VNode`, `createEditableElement`.


## Core: Global State Store

File: `src/core/state.js`

- `class Store`:
  - `constructor(initialState = {})`: starts with `state` and an empty `listeners` array.
  - `getState()`: returns a shallow copy of state so you don’t mutate it by accident.
  - `setState(newState)`: merges new keys into state and calls `notify()`.
  - `subscribe(listener)`: adds a callback and returns an `unsubscribe` function.
  - `notify()`: calls all listeners with the current state.

- `export const store = new Store({})`: a single global store you can import anywhere.

Typical pattern:
- At startup: `store.setState({ ...initial })`.
- Register UI updates: `store.subscribe(render)`.
- Any action calls `store.setState(...)` → `render()` runs → UI rebuilds.


## Core: Events

File: `src/core/events.js`

- `class EventEmitter`:
  - A simple pub/sub utility: `on(event, cb)` to subscribe, `emit(event, ...args)` to fire.
  - Returns an `unsubscribe` from `on()`.
  - Not strictly required for basic apps, but handy for decoupling logic.

- `initDOMEvents(rootElement)`:
  - Attaches listeners for common events (`click`, `input`, `change`, etc.) at the root.
  - In this version, events are handled directly via element properties (`onclick`, `oninput`, ...), so the listeners are essentially placeholders. Keeping this makes it easy to evolve to delegated events later without changing app code.


## Core: Router

File: `src/core/router.js`

- `class Router`:
  - Keeps a list of `{ path, component }` routes.
  - Listens to `hashchange` to detect navigation when using `#/...` URLs.

- `addRoute(path, component)`:
  - Registers a route. `path` can be:
    - Normal path like `/about` (uses History API)
    - Hash path like `/#/active` (uses `window.location.hash`)
    - A pattern with params like `/user/:id` (extracts `params`).

- `navigate(path)`:
  - For hash paths, sets `window.location.hash`.
  - For non‑hash paths, uses `history.pushState(...)` and triggers a route change.

- `handleRouteChange()`:
  - Figures out the current path (supports either hash or pathname).
  - Finds the first matching route (supports `:param` patterns).
  - Updates `store` with `{ route: { path, params } }`.
  - If the route has a `component` function, it calls it.

- `init()`:
  - Calls `handleRouteChange()` once on startup; returns `this` for chaining.

- `export const router = new Router()`:
  - A single shared router instance.


## Core: Inline Editable Utility

File: `src/core/editable.js`

- Goal: Show text normally, but switch to an `<input>` when the user wants to edit; pressing Enter or blur saves and switches back.

- How it works:
  - Keeps an `editing` id in global `store` (which element is being edited). If `editing` equals this element’s id, render an `<input>`; otherwise render a `<span>`.
  - `createEditableElement(text, onUpdate, attrs = {})` returns a VNode:
    - `attrs.id` identifies this editable element; default is a timestamp‑based id.
    - When not editing: renders a `span` with `ondblclick` to start editing.
    - When editing: renders an `input` with:
      - `value: text`
      - `autofocus: true`
      - `onblur`: save and stop editing
      - `onkeydown`: Enter saves, Escape cancels
    - Calls `onUpdate(newText)` when the user confirms.


## Putting It Together: Todo App Walkthrough

Folder: `todo-app/`

High level flow:
1) HTML loads `app.js` as a module and shows an empty `<div id="app"></div>`.
2) `app.js` creates the app, initializes routes, sets initial state, and defines `render()`.
3) `render()` builds the UI VNodes and mounts them.
4) Event handlers update the `store`, which triggers `render()` again (via subscription).

Key files:

- HTML shell (`todo-app/index.html`):
  - Includes `style.css` and `app.js`.
  - Contains `#app` where the UI is mounted.

- Main script (`todo-app/app.js`):
  - Imports framework API: `createApp`, `createElement`, `store`, `router`, `createEditableElement`.
  - Initializes state: `{ todos: [], filter: 'all' }`.
  - Defines handlers:
    - `addTodo(e)`: on Enter, adds a new todo with `{ id, text, completed:false }` and clears the input.
    - `toggleTodo(id)`: flips `completed` for a specific todo.
    - `removeTodo(id)`: removes a todo.
    - `clearCompleted()`: removes all completed todos.
    - `toggleAll(e)`: sets every todo’s `completed` to the checkbox value.
    - `updateTodoText(id, newText)`: edits the text, or removes the todo if emptied.
    - `setFilter(filter)`: updates `filter` in state and navigates to the matching route.
  - Components:
    - `TodoItem(todo)`: one list item with checkbox, editable label (via `createEditableElement`), and a delete button.
    - `TodoList()`: filters todos by `filter` and renders a `<ul>` of items.
    - `Footer()`: shows counts and the All/Active/Completed filters; includes a clear‑completed button when needed.
    - `TodoApp()`: composes the header (input), main section (list + toggle‑all), and footer.
  - Routing:
    - Registers routes: `/` → all, `/#/active` → active only, `/#/completed` → completed only.
    - Calls `router.init()` to sync the initial route.
    - Also checks `window.location.hash` at startup to set the initial filter.
  - Rendering:
    - `const app = createApp('#app')` creates the app bound to the root div.
    - `function render() { app.mount(TodoApp()); }`
    - `store.subscribe(render)` so every state change re‑renders.
    - Calls `render()` once for the first paint.


## Reading the Code (Function by Function)

If you want to open files and jump right to definitions, here are the key starting points:
- `src/core/dom.js:1` — `class VNode` and `createElement` live here.
- `src/index.js:1` — `createApp` and framework exports.
- `src/core/state.js:1` — `Store` class and the shared `store`.
- `src/core/events.js:1` — `EventEmitter` and root events setup.
- `src/core/router.js:1` — `Router` and the shared `router`.
- `src/core/editable.js:1` — `createEditableElement` utility.
- `todo-app/app.js:1` — Example app that uses everything.


## Why It’s Implemented This Way

- Simplicity first: No build step, no JSX, just ES modules and functions.
- Explicit re‑rendering: When state changes, you rebuild the UI. It’s predictable and easy to debug.
- Inline events: You see event code where the element is defined. This keeps small apps very readable.
- Global store: A single source of truth avoids prop‑drilling and scattered state.
- Hash routing: Works from a static file without a server.

Tradeoffs:
- Full re‑render is simple but not the most efficient for huge trees. This project favors clarity over micro‑optimizations.
- Events are attached directly on elements; no complex delegation here (yet). That’s fine for small apps.


## How to Run the Example

Option A: Open the HTML file directly
- Open `todo-app/index.html` in a modern browser. Hash routing works from file URLs.

Option B: Serve it locally (recommended for consistent module loading)
- Use any static server, for example with Python:
  - `cd todo-app`
  - `python3 -m http.server 8000`
  - Visit `http://localhost:8000/`


## Frequently Asked “What happens when…?”

- “What happens when I type and press Enter in the input?”
  - `keydown` fires → `addTodo(e)` runs → it checks `e.key === 'Enter'` → adds to `store` → `store.notify()` → `render()` runs → new todo appears.

- “How does the editable label work?”
  - Double‑click a label → `createEditableElement` sets `store.editing` to this id → next render shows an `<input>` → blur or Enter calls `onUpdate(newText)` → clears `editing` → next render shows a normal label again.

- “How do the filters work?”
  - Click a filter → it calls `setFilter('active'|'completed'|'all')` → updates state and navigates to the hash route → `router` also updates `store.route` → components filter based on `store.filter`.


## Tips for Extending

- Add components by returning VNodes from functions. Keep them pure: input is state/props, output is view.
- Add actions that call `store.setState(...)`. Avoid mutating arrays/objects in place; instead, return new ones (like using `.map`, `.filter`, spread `{ ...obj }`).
- Add routes using `router.addRoute(path, component)`. In this design, route components can perform side effects (like setting filter) and return `null`.
- If you want event delegation later, `initDOMEvents` is the place to enhance.


## Glossary

- VNode: A plain JS object describing a DOM node: its tag, attributes, and children.
- Render: Turning a VNode into a real DOM element (`vnode.render()`).
- Store: A global state container with `getState`, `setState`, `subscribe`.
- Subscribe: Register a function to run whenever state changes.
- Router: Maps a URL to a route and keeps route info in state.


## Where to Look Next

- Start reading from `todo-app/app.js` to see framework usage in context.
- Jump into `src/core/dom.js` to see how elements are built.
- Explore `src/core/state.js` to learn how re‑rendering is triggered.
- Finally, skim `src/core/router.js` and `src/core/editable.js` for routing and inline‑editing.

You now have the whole mental model: describe UI with `createElement`, keep data in `store`, attach simple events, and re‑render on state changes. That’s the entire loop.

