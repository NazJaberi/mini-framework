// src/core/router.js
import { store } from './state.js';

export class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    
    // Handle browser history navigation
    window.addEventListener('popstate', () => this.handleRouteChange());
  }

  addRoute(path, component) {
    this.routes.push({ path, component });
    return this;
  }

  navigate(path) {
    history.pushState(null, null, path);
    this.handleRouteChange();
  }

  handleRouteChange() {
    const path = window.location.pathname;
    const route = this.routes.find(route => {
      // Simple path matching
      if (route.path === path) return true;
      
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
      
      // Update state with route information
      store.setState({ 
        route: {
          path,
          params: route.params || {}
        }
      });
    }
  }

  init() {
    this.handleRouteChange();
    return this;
  }
}

export const router = new Router();