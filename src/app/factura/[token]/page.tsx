import { notFound } from "next/navigation";
import { getInvoiceByToken } from "@/lib/invoice/verification";
import { formatCurrency } from "@/lib/utils";

export default async function InvoiceVerificationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const verification = await getInvoiceByToken(token);

  if (!verification || new Date() > verification.expiresAt) {
    return notFound();
  }

  const invoice = verification.invoice;
  const client = invoice.client;

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Factura No. {invoice.number}</h1>
            <p className="text-slate-500 mt-1">
              Fecha de emisión: {new Date(invoice.date).toLocaleDateString("es-CO")}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Cliente</h2>
            <p className="font-medium text-slate-900">{client.name}</p>
            {client.email && <p className="text-slate-600">{client.email}</p>}
            {client.address && <p className="text-slate-600">{client.address}</p>}
          </div>

          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Items</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-slate-500 font-medium">Descripción</th>
                  <th className="text-center py-2 text-slate-500 font-medium">Cant.</th>
                  <th className="text-right py-2 text-slate-500 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-3">{item.description}</td>
                    <td className="text-center py-3">{item.quantity}</td>
                    <td className="text-right py-3">
                      {formatCurrency(Number(item.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Impuestos ({(Number(invoice.taxRate) * 100).toFixed(0)}%)</span>
              <span className="font-medium">{formatCurrency(Number(invoice.taxAmount))}</span>
            </div>
            <div className="flex justify-between py-2 border-t text-lg font-bold">
              <span>Total a Pagar</span>
              <span className="text-sky-600">{formatCurrency(Number(invoice.total))}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-400">
              <h3 className="font-semibold text-amber-800 mb-1">Notas</h3>
              <p className="text-amber-700 text-sm">{invoice.notes}</p>
            </div>
          )}

          <div className="mt-8 text-center text-slate-400 text-sm">
            <p>Verification ID: {verification.id.slice(0, 8)}</p>
            <p>Generated: {new Date(verification.createdAt).toLocaleDateString("es-CO")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}