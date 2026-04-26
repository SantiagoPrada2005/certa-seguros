'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { DownloadIcon } from 'lucide-react';
import { PaymentRequest } from '@/types/billing';
import { CuentaCobroPDF } from './cuenta-cobro-pdf';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@lib/utils';
import { Button } from '@/components/ui/button';

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
  paymentRequest,
  variant = 'outline',
  size = 'sm',
  className = ''
}: {
  paymentRequest: PaymentRequest;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}) {
  return (
    <PDFDownloadLink
      document={<CuentaCobroPDF paymentRequest={paymentRequest} />}
      fileName={`CuentaCobro_${paymentRequest.number}.pdf`}
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
