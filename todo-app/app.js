import { createApp, createElement, store, router } from '../src/index.js';

// Initialize the app state
store.setState({
  todos: [],
  filter: 'all', 
  editing: null 
});

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

function startEditing(id) {
  store.setState({ editing: id });
}

function updateTodoText(id, text) {
  const { todos } = store.getState();
  
  if (text.trim() === '') {
    // If the text is empty, remove the todo
    store.setState({
      todos: todos.filter(todo => todo.id !== id),
      editing: null
    });
  } else {
    // Otherwise update the text
    store.setState({
      todos: todos.map(todo => 
        todo.id === id ? { ...todo, text } : todo
      ),
      editing: null
    });
  }
}

function handleEditKeyDown(e, id) {
  if (e.key === 'Enter') {
    updateTodoText(id, e.target.value);
  } else if (e.key === 'Escape') {
    store.setState({ editing: null });
  }
}

function setFilter(filter) {
  store.setState({ filter });
  router.navigate(`/#/${filter === 'all' ? '' : filter}`);
}

// Components
function TodoItem(todo) {
  const { editing } = store.getState();
  const isEditing = editing === todo.id;
  
  if (isEditing) {
    return createElement('li', { 
      class: 'editing',
      key: todo.id 
    }, 
      createElement('div', { class: 'view' },
        createElement('input', { 
          class: 'toggle', 
          type: 'checkbox', 
          checked: todo.completed,
          onclick: () => toggleTodo(todo.id)
        }),
        createElement('label', { 
          ondblclick: () => startEditing(todo.id)
        }, todo.text),
        createElement('button', { 
          class: 'destroy', 
          onclick: () => removeTodo(todo.id)
        })
      ),
      createElement('input', {
        class: 'edit',
        value: todo.text,
        // Use autofocus to focus the input when it's rendered
        autofocus: true,
        onblur: (e) => updateTodoText(todo.id, e.target.value),
        onkeydown: (e) => handleEditKeyDown(e, todo.id)
      })
    );
  }
  
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
      createElement('label', { 
        ondblclick: () => startEditing(todo.id)
      }, todo.text),
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

// Create and mount the app
const app = createApp('#app');

// Setup routes
router.addRoute('/', () => {
  setFilter('all');
  return null;
});

router.addRoute('/#/active', () => {
  setFilter('active');
  return null;
});

router.addRoute('/#/completed', () => {
  setFilter('completed');
  return null;
});

// Initialize the router
router.init();

// Check the initial route
const path = window.location.hash;
if (path === '#/active') {
  setFilter('active');
} else if (path === '#/completed') {
  setFilter('completed');
} else {
  setFilter('all');
}

// Render function
function render() {
  app.mount(TodoApp());
}

// Subscribe to state changes
store.subscribe(render);

// Initial render
render();