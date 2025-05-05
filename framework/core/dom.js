class VNode {
    constructor(tag, attrs = {}, children = []) {
      this.tag = tag;
      this.attrs = attrs;
      this.children = children;
    }
  
    render() {
      // Create the DOM element
      const element = document.createElement(this.tag);
      
      // Add attributes
      Object.entries(this.attrs).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'object') {
          Object.entries(value).forEach(([prop, val]) => {
            element.style[prop] = val;
          });
        } else if (key.startsWith('on')) {
          // We'll handle events separately through our event system
          const eventName = key.slice(2).toLowerCase();
          element.setAttribute(`data-event-${eventName}`, value);
        } else {
          element.setAttribute(key, value);
        }
      });
      
      // Add children
      this.children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else if (child instanceof VNode) {
          element.appendChild(child.render());
        } else if (child instanceof Node) {
          element.appendChild(child);
        }
      });
      
      return element;
    }
  }
  
  // Helper function to create VNodes
  function createElement(tag, attrs = {}, ...children) {
    return new VNode(tag, attrs, children.flat());
  }
  
  // Export the API
  export { createElement, VNode };