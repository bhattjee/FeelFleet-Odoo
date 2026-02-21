import { create } from 'zustand';

interface LayoutState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  sidebarCollapsed: true,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}));
