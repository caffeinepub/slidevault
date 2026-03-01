import { useEffect, useRef } from "react";

interface QRCodeDisplayProps {
  url: string;
  size?: number;
}

/**
 * Generates and displays a QR code using the Canvas API.
 * Uses a simple QR code generation approach via a data URL.
 */
export function QRCodeDisplay({ url, size = 200 }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load QR code library from a bundled approach
    // We'll use a canvas-based approach by drawing a placeholder
    // and loading qrcodejs via a script tag
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js";
    script.onload = () => {
      if (canvasRef.current && window.QRCode) {
        void window.QRCode.toCanvas(canvasRef.current, url, {
          width: size,
          margin: 2,
          color: {
            dark: "#0d1117",
            light: "#ffffff",
          },
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [url, size]);

  return (
    <div className="flex items-center justify-center p-4 bg-white rounded-lg">
      <canvas ref={canvasRef} />
    </div>
  );
}

declare global {
  interface Window {
    QRCode: {
      toCanvas: (
        canvas: HTMLCanvasElement,
        text: string,
        options?: object,
      ) => Promise<void>;
    };
  }
}
