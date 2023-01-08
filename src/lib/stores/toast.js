import { writable } from 'svelte/store';

const createId = () => Math.random().toString(36).substr(2, 9);

export const toasts = writable([]);

export const removeToast = (id) => {
  toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
};

export const addToast = (message) => {
  const id = createId();
  toasts.update((toasts) => [...toasts, { id, message }]);
};