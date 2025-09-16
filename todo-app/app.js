import { createApp, createElement, store, router, createEditableElement } from '../src/index.js';

// --- Persistence (localStorage) ---
const STORAGE_KEY = 'mini-framework-todos';

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Only accept expected shapes
    return {
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      filter: typeof parsed.filter === 'string' ? parsed.filter : 'all'
    };
  } catch (_) {
    return null;
  }
}

function persistState(state) {
  try {
    const toSave = {
      todos: Array.isArray(state.todos) ? state.todos : [],
      filter: typeof state.filter === 'string' ? state.filter : 'all'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (_) {
    // Ignore storage errors (quota/private mode)
  }
}

// Initialize the app state (hydrate from storage if present)
const saved = loadPersisted();
if (saved) {
  store.setState({ todos: saved.todos, filter: saved.filter });
} else {
  store.setState({ todos: [], filter: 'all' });
}

// Event handlers
function addTodo(e) {
  if (e.key === 'Enter') {
    const text = e.target.value.trim();
    if (text) {
      const { todos } = store.getState();
      store.setState({
        todos: [...todos, {
          id: Date.now(),
          text,
          completed: false
        }]
      });
      e.target.value = '';
    }
  }
}

function toggleTodo(id) {
  const { todos } = store.getState();
  store.setState({
    todos: todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  });
}

function removeTodo(id) {
  const { todos } = store.getState();
  store.setState({
    todos: todos.filter(todo => todo.id !== id)
  });
}

function clearCompleted() {
  const { todos } = store.getState();
  store.setState({
    todos: todos.filter(todo => !todo.completed)
  });
}

function toggleAll(e) {
  const { todos } = store.getState();
  const completed = e.target.checked;
  store.setState({
    todos: todos.map(todo => ({ ...todo, completed }))
  });
}

function updateTodoText(id, newText) {
  const { todos } = store.getState();
  
  if (newText.trim() === '') {
    // If the text is empty, remove the todo
    store.setState({
      todos: todos.filter(todo => todo.id !== id)
    });
  } else {
    // Otherwise update the text
    store.setState({
      todos: todos.map(todo => 
        todo.id === id ? { ...todo, text: newText } : todo
      )
    });
  }
}

function setFilter(filter) {
  store.setState({ filter });
  router.navigate(`/#/${filter === 'all' ? '' : filter}`);
}

// Components
function TodoItem(todo) {
  return createElement('li', { 
    class: todo.completed ? 'completed' : '',
    key: todo.id 
  }, 
    createElement('div', { class: 'view' },
      createElement('input', { 
        class: 'toggle', 
        type: 'checkbox', 
        checked: todo.completed,
        onclick: () => toggleTodo(todo.id)
      }),
      // Using the framework's createEditableElement function
      createEditableElement(
        todo.text, 
        (newText) => updateTodoText(todo.id, newText),
        { 
          class: 'todo-label',
          id: `todo-${todo.id}` 
        }
      ),
      createElement('button', { 
        class: 'destroy', 
        onclick: () => removeTodo(todo.id)
      })
    )
  );
}

function TodoList() {
  const { todos, filter } = store.getState();
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  return createElement('ul', { class: 'todo-list' },
    ...filteredTodos.map(todo => TodoItem(todo))
  );
}

function Footer() {
  const { todos, filter } = store.getState();
  const activeTodoCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeTodoCount;
  
  return createElement('footer', { class: 'footer' },
    createElement('span', { class: 'todo-count' },
      createElement('strong', {}, activeTodoCount.toString()),
      ` item${activeTodoCount !== 1 ? 's' : ''} left`
    ),
    createElement('ul', { class: 'filters' },
      createElement('li', {},
        createElement('a', { 
          class: filter === 'all' ? 'selected' : '',
          href: '#/',
          onclick: (e) => { e.preventDefault(); setFilter('all'); }
        }, 'All')
      ),
      createElement('li', {},
        createElement('a', { 
          class: filter === 'active' ? 'selected' : '',
          href: '#/active',
          onclick: (e) => { e.preventDefault(); setFilter('active'); }
        }, 'Active')
      ),
      createElement('li', {},
        createElement('a', { 
          class: filter === 'completed' ? 'selected' : '',
          href: '#/completed',
          onclick: (e) => { e.preventDefault(); setFilter('completed'); }
        }, 'Completed')
      )
    ),
    completedCount > 0 ?
      createElement('button', { 
        class: 'clear-completed',
        onclick: clearCompleted
      }, 'Clear completed')
      : null
  );
}

function TodoApp() {
  const { todos } = store.getState();
  
  return createElement('section', { class: 'todoapp' },
    createElement('header', { class: 'header' },
      createElement('h1', {}, 'todos'),
      createElement('input', {
        class: 'new-todo',
        placeholder: 'What needs to be done?',
        autofocus: true,
        onkeydown: addTodo
      })
    ),
    todos.length > 0 ? 
      createElement('section', { class: 'main' },
        createElement('input', {
          id: 'toggle-all',
          class: 'toggle-all',
          type: 'checkbox',
          checked: todos.every(todo => todo.completed),
          onclick: toggleAll
        }),
        createElement('label', { for: 'toggle-all' }, 'Mark all as complete'),
        TodoList()
      ) : null,
    todos.length > 0 ? Footer() : null
  );
}

// Error and Not Found pages
function NotFoundPage() {
  return createElement('section', { class: 'todoapp' },
    createElement('header', { class: 'header' },
      createElement('h1', {}, 'Not Found')
    ),
    createElement('div', { class: 'main' },
      createElement('p', { style: { padding: '16px' } }, 'The page you requested was not found.'),
      createElement('p', { style: { padding: '0 16px 16px' } },
        createElement('a', { href: '#/', onclick: (e) => { e.preventDefault(); setFilter('all'); } }, 'Go back to Todos')
      )
    )
  );
}

function ErrorPage(error) {
  const message = (error && error.message) ? error.message : 'An unexpected error occurred.';
  return createElement('section', { class: 'todoapp' },
    createElement('header', { class: 'header' },
      createElement('h1', {}, 'Error')
    ),
    createElement('div', { class: 'main' },
      createElement('p', { style: { padding: '16px', color: '#F44336' } }, message),
      createElement('p', { style: { padding: '0 16px 16px' } },
        createElement('a', { href: '#/', onclick: (e) => { e.preventDefault(); setFilter('all'); } }, 'Go back to Todos')
      )
    )
  );
}

// Root component that decides which page to render
function Root() {
  const { route } = store.getState();
  if (route && route.error) {
    return ErrorPage(route.error);
  }
  if (route && route.notFound) {
    return NotFoundPage();
  }
  if (route && route.view != null) {
    // If a route returned an explicit view (VNode/Node/string), render it
    return route.view;
  }
  if (route && route.noView) {
    // Intentionally render a blank canvas when a route does not render a view
    return createElement('div', { class: 'blank-canvas' });
  }
  return TodoApp();
}

// Create and mount the app
const app = createApp('#app');

// Setup routes
router.addRoute('/', () => {
  setFilter('all');
  return true; // indicates a normal route with a view (Root will render TodoApp)
});

router.addRoute('/#/active', () => {
  setFilter('active');
  return true; // normal view
});

router.addRoute('/#/completed', () => {
  setFilter('completed');
  return true; // normal view
});

router.addRoute('/#/test', () => {
  return createElement('div', { class: 'blank-canvas', style: { padding: '24px' } }, 'Hello world');
});

// Initialize the router
router
  .setNotFound(() => { /* state already updated; Root will render NotFound */ })
  .setError(() => { /* state already updated; Root will render Error */ })
  .init();

// Check the initial route without overriding unknown routes
const hash = window.location.hash;
if (hash === '#/' || hash === '') {
  setFilter('all');
} else if (hash === '#/active') {
  setFilter('active');
} else if (hash === '#/completed') {
  setFilter('completed');
}

// Render function
function render() {
  app.mount(Root());
}

// Subscribe to state changes
store.subscribe((s) => {
  // Persist only todos and filter
  persistState(s);
  // Re-render UI
  render();
});

// Initial render
render();
