// src/core/router.js
import { store } from './state.js';

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
        // Update state with route information
        store.setState({ 
          route: {
            path,
            params: route.params || {},
            notFound: false,
            error: null
          }
        });

        // Call the component function if it exists
        if (typeof route.component === 'function') {
          route.component();
        }
      } catch (err) {
        // Update state with error information
        store.setState({
          route: {
            path,
            params: route.params || {},
            notFound: false,
            error: err
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
          error: null
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
