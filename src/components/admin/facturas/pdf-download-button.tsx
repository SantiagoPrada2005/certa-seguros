'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { Invoice } from '@/types/billing';
import { InvoicePDF } from './invoice-pdf';

// Dynamically import PDFDownloadLink because it uses browser APIs that SSR cannot render
const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button disabled variant="outline" size="sm">
        <span className="block animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
        Preparando...
      </Button>
    ),
  }
);

export function PdfDownloadButton({ 
  invoice, 
  variant = 'outline', 
  size = 'sm',
  className = ''
}: { 
  invoice: Invoice; 
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}) {
  return (
    <PDFDownloadLink 
      document={<InvoicePDF invoice={invoice} />} 
      fileName={`Factura_${invoice.number}.pdf`}
      className={className}
    >
      {({ loading }) => (
        <Button 
          disabled={loading} 
          variant={variant} 
          size={size}
          // To avoid hydration issues with nested a > button, although PDFDownloadLink renders an <a>.
          // Wait, PDFDownloadLink renders an <a> tag. We shouldn't put a <Button> inside an <a> 
          // if <Button> also renders a <button>. But practically, in React it usually gets warnings.
          // In shadcn, Button is a standard <button>. 
          // A better approach often is to style the PDFDownloadLink directly using buttonVariants() 
          // or `asChild` if PDFDownloadLink supports it (it doesn't).
          // We will use standard children but apply pointer-events-none if loading.
        >
          {loading ? (
            <>
              <span className="block animate-spin w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
              Preparando PDF...
            </>
          ) : (
            <>
              <DownloadIcon data-icon="inline-start" />
              Descargar PDF
            </>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
