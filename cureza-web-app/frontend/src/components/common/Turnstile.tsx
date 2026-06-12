'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    onloadTurnstileCallback?: () => void;
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  sitekey: string;
  onVerify: (token: string) => void;
}

export function Turnstile({ sitekey, onVerify }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Inject Turnstile script if not already present
    if (!document.getElementById('cloudflare-turnstile-script')) {
      const script = document.createElement('script');
      script.id = 'cloudflare-turnstile-script';
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }

    const renderWidget = () => {
      if (window.turnstile && containerRef.current && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey,
          callback: (token) => {
            onVerify(token);
          },
        });
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      // Poll or wait for script to load
      const interval = setInterval(() => {
        if (window.turnstile) {
          renderWidget();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      // Cleanup if needed
    };
  }, [sitekey, onVerify]);

  return <div ref={containerRef} className="my-4 flex justify-center" />;
}
