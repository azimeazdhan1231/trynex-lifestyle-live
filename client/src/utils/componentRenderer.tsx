import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Component renderer utility for dynamically loaded components
export const ComponentRenderer = {
  roots: new Map<string, any>(),
  queryClient: new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }),
  
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
      
      // Wrap component with QueryClientProvider
      const WrappedComponent = React.createElement(
        QueryClientProvider,
        { client: this.queryClient },
        React.createElement(Component, props)
      );
      
      // Render the component
      root.render(WrappedComponent);
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