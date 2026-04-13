'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DownloadIcon } from 'lucide-react';
import { Invoice } from '@/types/billing';
import { InvoicePDF } from './invoice-pdf';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@lib/utils';
import { Button } from '@/components/ui/button';

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
      className={cn(
        buttonVariants({ variant, size }), 
        "flex w-full cursor-pointer items-center justify-start border-none! bg-transparent! p-0! shadow-none!",
        className
      )}
    >
      {({ loading }: { loading: boolean }) => (
        <span className="flex items-center gap-2">
          {loading ? (
            <>
              <span className="block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              Preparando...
            </>
          ) : (
            <>
              <DownloadIcon data-icon="inline-start" className="size-4" />
              Descargar PDF
            </>
          )}
        </span>
      )}
    </PDFDownloadLink>
  );
}
