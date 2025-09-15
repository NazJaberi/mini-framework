# Framework + Todo App Audit

This document answers each audit question with a clear YES/NO and provides detailed evidence with file references and explanations.

Note: File references are clickable paths with the relevant start line.

---

## Is the documentation written in a markdown file?

Answer: YES

Evidence:
- Root documentation: `README.md:1`
- Feature guide: `docs/README.MD:1`

Explanation: The project ships two Markdown docs: a top‑level README for an end‑to‑end explanation and `docs/README.MD` with feature‑oriented usage and examples.

---

## Does the documentation contain a top-level overview of the framework's features?

Answer: YES

Evidence:
- `docs/README.MD:1` — “Features of the Framework” lists DOM Abstraction, State Management, Event Handling, Routing.
- `README.md:1` — “The Big Picture” and “Project Layout” provide a high‑level map.

Explanation: Both documents describe the overall architecture and the four core features and how they interact.

---

## Does the documentation contain an explanation and code examples on how to create an element, add attributes to an element, create an event and nest elements?

Answer: YES

Evidence:
- `docs/README.MD:14` — Creating Elements section with examples.
- `docs/README.MD:46` — Adding Events to Elements examples (`onclick`, `oninput`, `onsubmit`).
- `docs/README.MD:72` — Nesting Elements with multiple createElement calls.
- `docs/README.MD:98` — Adding Attributes section (basic, style, data, boolean attributes).

Explanation: The docs provide concrete `createElement(...)` examples covering attributes, events, and nested children.

---

## Does the documentation contain an explanation on how the framework works?

Answer: YES

Evidence:
- `README.md:25` — “The Big Picture (How it all works)”.
- `README.md:57` — DOM abstraction via VNode and `createElement`.
- `README.md:79` — Global state store, subscribe/notify model.
- `README.md:101` — Event handling rationale and setup.
- `README.md:113` — Router behavior and store integration.

Explanation: The README explains rendering, state, events, and routing with rationale and tradeoffs.

---

## Open the todoMVC project and compare it to other todoMVC examples. Does it contain every element as the other todoMVCs examples?

Answer: YES

Evidence (presence of canonical elements):
- App wrapper: `todo-app/app.js:170` creates `<section class="todoapp">`.
- Header and title: `todo-app/app.js:171` header, `todo-app/app.js:172` h1 "todos".
- New todo input: `todo-app/app.js:173` input.new-todo.
- Main section: `todo-app/app.js:181` section.main.
- Toggle-all checkbox: `todo-app/app.js:182` input#toggle-all.toggle-all and label at `todo-app/app.js:189`.
- Todo list: `todo-app/app.js:120` ul.todo-list.
- Footer with counter and filters: `todo-app/app.js:130` footer.footer and `todo-app/app.js:135` ul.filters.
- Clear completed button (conditional): `todo-app/app.js:158`.

Explanation: The structure matches standard TodoMVC: header + input, main + list + toggle-all, footer + counters + filters + clear button.

---

## Open the Web Developer Tools and check for the classes, ids, etc. Does it correctly correspond to those in the examples?

Answer: YES

Evidence (class/id usage in code and CSS):
- Classes used in markup match styles: `.todoapp`, `.new-todo`, `.main`, `.toggle-all`, `.todo-list`, `.footer`, `.filters`, `.clear-completed`.
- CSS definitions:
  - `.todoapp`: `todo-app/style.css:44`
  - `.new-todo`: `todo-app/style.css:103`
  - `.toggle-all`: `todo-app/style.css:117`
  - `.todo-list`: `todo-app/style.css:150`
  - `.footer`: `todo-app/style.css:303`
  - `.filters`: `todo-app/style.css:337`
  - `.clear-completed`: `todo-app/style.css:369`
- Markup creating these classes/ids:
  - `todo-app/app.js:173` new-todo input
  - `todo-app/app.js:182` id="toggle-all" class="toggle-all"
  - `todo-app/app.js:120` ul.todo-list
  - `todo-app/app.js:130` footer.footer
  - `todo-app/app.js:135` ul.filters
  - `todo-app/app.js:158` button.clear-completed

Explanation: Inspecting the DOM would show elements with the expected TodoMVC class names, which the stylesheet targets.

---

## Can you add a to-do element to the to-do list?

Answer: YES

Evidence:
- Handler: `todo-app/app.js:10` `function addTodo(e)` checks `e.key === 'Enter'`, trims value, updates `store`.
- Input wired: `todo-app/app.js:173` new-todo sets `onkeydown: addTodo`.

Explanation: Pressing Enter in the new todo input pushes a new item into state and re-renders the list.

---

## When you add a to-do element to the list, does the footer (element with class footer) appear as in other examples?

Answer: YES

Evidence:
- Conditional footer: `todo-app/app.js:192` shows `Footer()` only when `todos.length > 0`.
- Footer component: `todo-app/app.js:130` constructs `<footer class="footer">`.

Explanation: Initially hidden; it appears once there is at least one todo, consistent with TodoMVC behavior.

---

## Can you check/uncheck a to-do element on the list?

Answer: YES

Evidence:
- Checkbox element: `todo-app/app.js:88` input with `type: 'checkbox'`, `class: 'toggle'`.
- Toggle handler: `todo-app/app.js:27` `toggleTodo(id)` flips `completed` and updates state; wired at `todo-app/app.js:92`.

Explanation: Clicking the checkbox triggers a state update; UI re-renders to reflect completion.

---

## Can you remove a to-do element off the list?

Answer: YES

Evidence:
- Destroy button: `todo-app/app.js:103` button with `class: 'destroy'`.
- Remove handler: `todo-app/app.js:36` `removeTodo(id)` filters out the item; wired at `todo-app/app.js:105`.

Explanation: Clicking the "×" button removes the specific todo from the array and re-renders.

---

## Add at least 2 to-dos and select only one of them. If you click on the Active button, do only the unchecked to-dos appear?

Answer: YES

Evidence:
- Filter logic: `todo-app/app.js:114` filters by `filter === 'active'` → `!todo.completed`.
- Active nav: `todo-app/app.js:145` link triggers `setFilter('active')`.

Explanation: Active view hides completed items by applying a filter over state before rendering.

---

## And if you click on the Completed button, do only the checked to-dos appear?

Answer: YES

Evidence:
- Filter logic: `todo-app/app.js:116` returns only `todo.completed`.
- Completed nav: `todo-app/app.js:152` link triggers `setFilter('completed')`.

Explanation: Completed view shows only items whose `completed` flag is true.

---

## Does a Clear Completed button appear?

Answer: YES

Evidence:
- Conditional render: `todo-app/app.js:158` shows `button.clear-completed` only when `completedCount > 0`.

Explanation: The button exists only when there is something to clear, like other TodoMVC implementations.

---

## When clicking on the clear completed button, does it remove only the checked to-dos?

Answer: YES

Evidence:
- Handler: `todo-app/app.js:43` `clearCompleted()` filters to `!todo.completed`.
- Button wiring: `todo-app/app.js:160` sets `onclick: clearCompleted`.

Explanation: Only completed items are removed; active items remain.

---

## When clicking on the Active and Completed buttons, does the URL change?

Answer: YES

Evidence:
- Navigation: `todo-app/app.js:76` `setFilter(filter)` calls `router.navigate("/#/…")`.
- Router: `src/core/router.js:18` handles hash paths by setting `window.location.hash`.

Explanation: Clicking filter links updates both state and the URL hash (e.g., `#/active`, `#/completed`).

---

## Add 3 to-dos to the list and check each one, keeping an eye on the counter of to-dos left to do. Does the counter change accordingly to your actions?

Answer: YES

Evidence:
- Counter calculation: `todo-app/app.js:127` computes `activeTodoCount` as `!todo.completed` length.
- Display: `todo-app/app.js:131` shows `<strong>{activeTodoCount}</strong>` and suffix.

Explanation: Any toggle or mutation triggers `store.setState(...)` and re-renders, updating the counter.

---

## If you double click a to-do element on the list can you edit that element?

Answer: YES

Evidence:
- Editable widget: `src/core/editable.js:9` `createEditableElement(text, onUpdate, attrs)`.
- Start editing: `src/core/editable.js:39` renders a `span` with `ondblclick` to start editing.
- Edit mode: `src/core/editable.js:29` returns an `input` with `autofocus`, `onblur` save, and `onkeydown` handling Enter/Escape (`src/core/editable.js:34`, `src/core/editable.js:21`).
- Usage in item: `todo-app/app.js:95` calls `createEditableElement(...)` for the todo label.

Explanation: Double‑clicking a label swaps it for an input; blur/Enter commits changes via `onUpdate`.

---

## Basic — Does the code obey the good practices?

Answer: YES

Evidence and rationale:
- Immutable updates: uses spreads and array `.map/.filter` (e.g., `todo-app/app.js:29`, `todo-app/app.js:39`, `todo-app/app.js:54`, `todo-app/app.js:69`).
- Separation of concerns: framework core vs. app code; pure view functions that return VNodes (`todo-app/app.js:111`, `todo-app/app.js:125`, `todo-app/app.js:167`).
- Clear state flow: single `store` with subscribe/notify (`src/core/state.js:1`).
- Minimal, readable event handling via inline handlers; no hidden globals.

---

## Bonus — Is the performance similar both in the student todoMVC and other examples?

Answer: YES (for small to moderate lists)

Evidence and rationale:
- Rendering strategy: simple full re-render on state change; browsers handle hundreds of nodes well.
- No heavy computations or network requests; handlers are O(n) over todos when needed.

Caveat: There is no diffing Virtual DOM; extremely large lists would benefit from keyed diffing or virtualization. For typical TodoMVC scale, performance is comparable.

---

## Bonus — Is it easier to handle the DOM using the framework than it is to use plain HTML and JS?

Answer: YES

Evidence:
- Declarative elements: `createElement(...)` composes nested structures succinctly (e.g., `todo-app/app.js:170` entire app view assembled from functions).
- Attributes and events are passed inline (e.g., `todo-app/app.js:92`, `todo-app/app.js:105`, `todo-app/app.js:160`).

Explanation: You avoid manual `document.createElement`, `appendChild`, and event binding boilerplate.

---

## Bonus — Is it easier to handle the routing in JS using the framework?

Answer: YES

Evidence:
- Simple API: `router.addRoute(...)` and `router.navigate(...)` (`todo-app/app.js:200`, `todo-app/app.js:205`, `todo-app/app.js:210`, and `todo-app/app.js:76`).
- Hash support out of the box: `src/core/router.js:18` handles `/#/...` paths.

Explanation: No need to wire `hashchange` manually; store receives route state for components to react.

---

## Bonus — Does the project run quickly and effectively? (Favoring recursivity, no unnecessary data requests, etc.)

Answer: YES

Evidence and rationale:
- No network requests; all data is local in `store`.
- Minimal work per update; handlers are small and state updates are shallow merges (`src/core/state.js:11`).
- Conditional rendering avoids unnecessary DOM (e.g., footer and main only when todos exist: `todo-app/app.js:180`, `todo-app/app.js:192`).

---

## Bonus — Is the code using asynchronicity to increase performance?

Answer: NO

Evidence:
- No `async/await`, `Promise`, or scheduling (e.g., `requestAnimationFrame`, `setTimeout`) in the app or core. All operations are synchronous.

Explanation: The app does not need async for its current scope; if fetching remote data or heavy computations were added, async patterns could be introduced.

---

## Bonus — Do you think this project is well done in general?

Answer: YES

Rationale:
- Clear separation between a tiny, readable framework and the example app.
- Predictable state flow and explicit rendering make behavior easy to understand.
- Good naming and conventional TodoMVC structure and classes.
- Extensible: event system, routing, and inline editing are small but practical building blocks.

