let listeners = [];
let toasts = [];
let idCounter = 0;

function emit() {
  listeners.forEach((fn) => fn(toasts));
}

export function subscribeToast(fn) {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
}

export function getToasts() {
  return toasts;
}

export function showToast({ type = "success", message, duration = 3000 }) {
  const id = ++idCounter;
  toasts = [...toasts, { id, type, message }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, duration);
}