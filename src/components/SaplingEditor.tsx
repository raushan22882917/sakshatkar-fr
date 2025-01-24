import { useEffect, useRef } from 'react';
import { Textarea } from "@/components/ui/textarea";

declare global {
  interface Window {
    Sapling: {
      init: (config: any) => void;
      checkOnce: (element: HTMLElement) => void;
    };
  }
}

const customCSS = `
  #sapling-edit-controls #edit-controls-buttons {
    border: 0.5px solid #333;
  }

  #sapling-edit-controls #accept-button,
  #sapling-edit-controls #ignore-button {
    background-color: #111;
  }

  #sapling-edit-controls .icon-sapling-accept,
  #sapling-edit-controls #accept-text {
    color: green;
  }

  #sapling-edit-controls #accept-button:hover,
  #sapling-edit-controls #ignore-button:hover {
    background-color: #222;
  }

  #sapling-edit-controls .icon-sapling-reject,
  #sapling-edit-controls #ignore-text {
    color: #565656;
  }

  #sapling-edit-controls #ignore-row {
    border-top: 0.5px solid #333;
  }
`;

interface SaplingEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function SaplingEditor({ 
  value, 
  onChange, 
  placeholder, 
  rows = 10,
  className = ""
}: SaplingEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Load Sapling SDK script
    const script = document.createElement('script');
    script.src = 'https://sapling.ai/static/js/sapling-sdk-v1.0.9.min.js';
    script.async = true;
    script.onload = () => {
      // Initialize Sapling after script loads
      if (window.Sapling && textareaRef.current) {
        window.Sapling.init({
          key: 'UKBBD94K3GPLDCII4851RINM5LZT6UYD',
          mode: 'dev',
          appearance: { customCSS }
        });
        window.Sapling.checkOnce(textareaRef.current);
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      document.body.removeChild(script);
    };
  }, []);

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`resize-none ${className}`}
      data-sapling-ignore="false"
    />
  );
}
