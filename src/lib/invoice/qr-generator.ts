import QRCode from 'qrcode';

export async function generateQRDataURL(url: string): Promise<string> {
  try {
    const dataURL = await QRCode.toDataURL(url, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 120,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}