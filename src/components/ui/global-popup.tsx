import React, { useEffect, useState } from 'react';
import { PopupOptions } from '@/utils/helpers/popup-helper';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export function GlobalPopupProvider() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<PopupOptions | null>(null);

  useEffect(() => {
    const handleShow = (e: CustomEvent<PopupOptions>) => {
      setOptions(e.detail);
      setIsOpen(true);
    };

    window.addEventListener('show-global-popup', handleShow as EventListener);
    return () => {
      window.removeEventListener('show-global-popup', handleShow as EventListener);
    };
  }, []);

  if (!isOpen || !options) return null;

  const handleClose = () => {
    setIsOpen(false);
    if (options.onClose) {
      options.onClose();
    }
  };

  const icons = {
    info: <Info className="h-6 w-6 text-blue-500" />,
    success: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    warning: <AlertCircle className="h-6 w-6 text-orange-500" />,
    error: <XCircle className="h-6 w-6 text-red-500" />
  };

  const type = options.type || 'info';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-xl shadow-2xl border border-border/50 overflow-hidden animate-in zoom-in-95 duration-200 p-6 relative m-4">
        <div className="flex gap-4 items-start">
          <div className="shrink-0 mt-0.5">
            {icons[type]}
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">{options.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{options.body}</p>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button onClick={handleClose} className="min-w-[100px]">
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}
