import React from 'react';
import { createRoot } from 'react-dom/client';

// Component renderer utility for dynamically loaded components
export const ComponentRenderer = {
  roots: new Map<string, any>(),
  
  async renderComponent(
    containerId: string, 
    componentImport: () => Promise<any>, 
    props: any = {}
  ): Promise<void> {
    try {
      // Load the component module
      const moduleWithComponent = await componentImport();
      const Component = moduleWithComponent.default || moduleWithComponent;
      
      // Get the container element
      const container = document.getElementById(containerId);
      if (!container) {
        console.warn(`Container ${containerId} not found`);
        return;
      }
      
      // Create or get existing React root
      let root = this.roots.get(containerId);
      if (!root) {
        root = createRoot(container);
        this.roots.set(containerId, root);
      }
      
      // Render the component
      root.render(React.createElement(Component, props));
      console.log(`✅ Component rendered in ${containerId}`);
      
    } catch (error) {
      console.error(`Failed to render component in ${containerId}:`, error);
    }
  },
  
  unmountComponent(containerId: string): void {
    const root = this.roots.get(containerId);
    if (root) {
      root.unmount();
      this.roots.delete(containerId);
    }
  },
  
  cleanup(): void {
    this.roots.forEach((root) => root.unmount());
    this.roots.clear();
  }
};