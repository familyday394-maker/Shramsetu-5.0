import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Standards-compliant ISO/IEC 18004 QR Code renderer using standard Reed-Solomon error correction.
 * Scannable by any standard smartphone camera or QR scanning device.
 */
export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  value,
  size = 140,
  className = '',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(value, {
      width: size * 2, // 2x density for crisp retina / print display
      margin: 1,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) {
          setDataUrl(url);
          setHasError(false);
        }
      })
      .catch((err) => {
        console.warn('QR code generation error:', err);
        if (isMounted) {
          setHasError(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [value, size]);

  if (hasError || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-2 text-center text-[10px] text-slate-400 ${className}`}
      >
        <span>Loading QR...</span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt="Standards-compliant QR Code for worker reference"
      width={size}
      height={size}
      className={`select-none bg-white rounded-md shadow-xs ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
