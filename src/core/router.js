// src/core/router.js
import { store } from './state.js';
import { VNode } from './dom.js';

export class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.notFoundComponent = null;
    this.errorComponent = null;
    
    // Handle hash changes for routing
    window.addEventListener('hashchange', () => this.handleRouteChange());
  }

  addRoute(path, component) {
    this.routes.push({ path, component });
    return this;
  }

  // Convenience: register a route that intentionally renders nothing (blank canvas)
  addBlank(path) {
    return this.addRoute(path, () => null);
  }

  // Convenience: provide a blank component factory for explicit use
  blank() {
    return () => null;
  }

  navigate(path) {
    // For hash-based routing, we can directly set location.hash
    if (path.startsWith('/#/')) {
      window.location.hash = path.substring(2); // Remove the leading "/#"
    } else if (path.startsWith('#/')) {
      window.location.hash = path.substring(1); // Remove the leading "#"
    } else if (path === '/') {
      window.location.hash = '';
    } else {
      // For regular paths, use history API
      history.pushState(null, null, path);
      this.handleRouteChange();
    }
  }

  handleRouteChange() {
    // Get current path (support both regular paths and hash-based paths)
    const path = window.location.hash 
      ? `/#${window.location.hash.slice(1)}`  // Convert "#/active" to "/#/active" correctly
      : window.location.pathname;

    const route = this.routes.find(route => {
      // Simple path matching
      if (route.path === path) return true;
      
      // For hash paths like "/#/"
      if (route.path === '/' && (path === '/#/' || path === '/#')) return true;
      
      // Support for pattern matching
      if (route.path.includes(':')) {
        const routeParts = route.path.split('/');
        const pathParts = path.split('/');
        
        if (routeParts.length !== pathParts.length) return false;
        
        const params = {};
        const match = routeParts.every((part, i) => {
          if (part.startsWith(':')) {
            params[part.slice(1)] = pathParts[i];
            return true;
          }
          return part === pathParts[i];
        });
        
        if (match) {
          route.params = params;
          return true;
        }
      }
      
      return false;
    });
    
    if (route) {
      this.currentRoute = route;
      try {
        // Call the component function if it exists and capture its result
        let result;
        if (typeof route.component === 'function') {
          result = route.component();
        }

        // Determine if the route returned a view (VNode/Node/string/number)
        const hasView = (
          result instanceof VNode ||
          (typeof Node !== 'undefined' && result instanceof Node) ||
          typeof result === 'string' ||
          typeof result === 'number'
        );

        // Update state with route information and whether the route rendered a view
        store.setState({ 
          route: {
            path,
            params: route.params || {},
            notFound: false,
            error: null,
            noView: result == null, // null or undefined => treat as blank page
            view: hasView ? result : null
          }
        });
      } catch (err) {
        // Update state with error information
        store.setState({
          route: {
            path,
            params: route.params || {},
            notFound: false,
            error: err,
            noView: false,
            view: null
          }
        });
        if (typeof this.errorComponent === 'function') {
          this.errorComponent(err);
        }
      }
    } else {
      // No matching route → mark as notFound
      store.setState({
        route: {
          path,
          params: {},
          notFound: true,
          error: null,
          noView: false,
          view: null
        }
      });
      if (typeof this.notFoundComponent === 'function') {
        this.notFoundComponent({ path });
      }
    }
  }

  init() {
    this.handleRouteChange();
    return this;
  }

  // Set a component (callback) to run when no route matches
  setNotFound(component) {
    this.notFoundComponent = component;
    return this;
  }

  // Set a component (callback) to run when a route component throws
  setError(component) {
    this.errorComponent = component;
    return this;
  }
}

export const router = new Router();
