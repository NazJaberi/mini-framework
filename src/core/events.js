class EventEmitter {
    constructor() {
      this.events = {};
    }
  
    on(event, callback) {
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
      
      // Return unsubscribe function
      return () => {
        this.events[event] = this.events[event].filter(cb => cb !== callback);
      };
    }
  
    emit(event, ...args) {
      if (this.events[event]) {
        this.events[event].forEach(callback => callback(...args));
      }
    }
  }
  
  // Initialize DOM events
  function initDOMEvents(rootElement) {
    const eventTypes = ['click', 'input', 'change', 'submit', 'keyup', 'keydown'];
    
    eventTypes.forEach(eventType => {
      rootElement.addEventListener(eventType, (e) => {
        let target = e.target;
        
        while (target && target !== rootElement) {
          const handlerName = target.getAttribute(`data-event-${eventType}`);
          
          if (handlerName) {
            // Check if the handler is registered in the global scope
            if (typeof window[handlerName] === 'function') {
              window[handlerName](e);
            }
            
            // Or check if it's a method in a component
            if (target._component && typeof target._component[handlerName] === 'function') {
              target._component[handlerName](e);
            }
          }
          
          target = target.parentNode;
        }
      });
    });
  }
  
  export { EventEmitter, initDOMEvents };