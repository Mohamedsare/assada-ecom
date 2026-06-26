import { useUIStore } from "@/stores/ui";
export type { Toast, ToastType } from "@/stores/ui";

// Appels directs au store Zustand via getState() — fonctionne hors composant React,
// sans dépendance à un contexte ou à un effet de montage.
export function openCartDrawer() {
  useUIStore.getState().openCartDrawer();
}

export function closeCartDrawer() {
  useUIStore.getState().closeCartDrawer();
}

export function addToast(toast: Omit<import("@/stores/ui").Toast, "id">) {
  useUIStore.getState().addToast(toast);
}

export function removeToast(id: string) {
  useUIStore.getState().removeToast(id);
}
