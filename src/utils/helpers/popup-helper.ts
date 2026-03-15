export type PopupType = 'info' | 'error' | 'success' | 'warning';

export interface PopupOptions {
  title: string;
  body: string;
  type?: PopupType;
  onClose?: () => void;
}

export function showPopup(options: PopupOptions) {
  const event = new CustomEvent('show-global-popup', { detail: options });
  window.dispatchEvent(event);
}
