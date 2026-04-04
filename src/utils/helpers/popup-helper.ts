export type PopupType = 'info' | 'error' | 'success' | 'warning';

import React from 'react';

export interface PopupOptions {
  title: string;
  body: string | React.ReactNode;
  type?: PopupType;
  onClose?: () => void;
  actionText?: string;
  onAction?: () => void;
  closeText?: string;
}

export function showPopup(options: PopupOptions) {
  const event = new CustomEvent('show-global-popup', { detail: options });
  window.dispatchEvent(event);
}
