import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice } from '@/types/billing';

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

// Colors based on ui-ux-pro-max standard styles (Slate/Blue brand variants)
const colors = {
  primary: '#0ea5e9', // Base light blue for brand emphasis
  textDark: '#0f172a', // Slate-900
  textMuted: '#64748b', // Slate-500
  border: '#e2e8f0', // Slate-200
  background: '#f8fafc', // Slate-50
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: colors.textDark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logoPlaceholder: {
    fontSize: 24,
    fontWeight: 700,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  companyInfo: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 1.4,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 700,
    textAlign: 'right',
    color: colors.textDark,
    letterSpacing: -1,
  },
  invoiceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  invoiceMetaLabel: {
    color: colors.textMuted,
    width: 80,
    textAlign: 'right',
    marginRight: 8,
  },
  invoiceMetaValue: {
    fontWeight: 700,
    width: 80,
    textAlign: 'right',
  },
  billToSection: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 4,
  },
  billToLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginBottom: 8,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  clientName: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  clientDetails: {
    color: colors.textMuted,
    lineHeight: 1.5,
  },
  table: {
    width: '100%',
    marginBottom: 32,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableHeaderCell: {
    color: colors.textMuted,
    fontWeight: 700,
    fontSize: 9,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
  },
  colDesc: { flex: 4, paddingRight: 8 },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 2, textAlign: 'right', paddingRight: 8 },
  colTotal: { flex: 2, textAlign: 'right' },
  itemDesc: {
    fontWeight: 700,
    marginBottom: 2,
  },
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalsContainer: {
    width: 200,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalsLabel: {
    color: colors.textMuted,
  },
  totalsValue: {
    fontWeight: 700,
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 2,
    borderTopColor: colors.textDark,
    marginTop: 6,
  },
  totalFinalLabel: {
    fontWeight: 700,
    fontSize: 12,
  },
  totalFinalValue: {
    fontWeight: 700,
    fontSize: 14,
    color: colors.primary,
  },
  notes: {
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    color: colors.textMuted,
    fontSize: 9,
    lineHeight: 1.5,
  },
});

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  // Use current date for generation marking
  const generatedDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
  }).format(new Date());

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoPlaceholder}>CERTA SEGUROS</Text>
            <View style={styles.companyInfo}>
              <Text>NIT: 900.123.456-7</Text>
              <Text>Av. Ejecutiva 123, Of. 405</Text>
              <Text>Bogotá, Colombia</Text>
            </View>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Número:</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.number}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Emisión:</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.date}</Text>
            </View>
            <View style={styles.invoiceMetaRow}>
              <Text style={styles.invoiceMetaLabel}>Vencimiento:</Text>
              <Text style={styles.invoiceMetaValue}>{invoice.dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billToSection}>
          <Text style={styles.billToLabel}>Cobra a:</Text>
          <Text style={styles.clientName}>{invoice.clientName}</Text>
          <View style={styles.clientDetails}>
            {/* Real applications would pass proper client details; for now, we leave space based on the Invoice type */}
            <Text>Atn. Departamento de Pagos</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>Descripción</Text>
            <Text style={[styles.tableHeaderCell, styles.colQty]}>Cant.</Text>
            <Text style={[styles.tableHeaderCell, styles.colPrice]}>V. Unitario</Text>
            <Text style={[styles.tableHeaderCell, styles.colTotal]}>Total</Text>
          </View>

          {invoice.items.map((item, index) => (
            <View key={item.id || index} style={styles.tableRow}>
              <View style={styles.colDesc}>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.total)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            {invoice.discountAmount > 0 && (
              <View style={styles.totalsRow}>
                <Text style={[styles.totalsLabel, { color: '#d97706' }]}>
                  Descuento ({invoice.discountDescription || 'General'})
                </Text>
                <Text style={[styles.totalsValue, { color: '#d97706' }]}>
                  -{formatCurrency(invoice.discountAmount)}
                </Text>
              </View>
            )}
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Impuestos ({(invoice.taxRate * 100).toFixed(0)}%)</Text>
              <Text style={styles.totalsValue}>{formatCurrency(invoice.taxAmount)}</Text>
            </View>
            <View style={styles.totalFinalRow}>
              <Text style={styles.totalFinalLabel}>Total a Pagar</Text>
              <Text style={styles.totalFinalValue}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.notes}>
          <Text>Notas de la factura:</Text>
          <Text>{invoice.notes || 'Gracias por su confianza. Por favor, realice el pago dentro de los plazos establecidos para evitar recargos por mora.'}</Text>
          <Text style={{ marginTop: 8 }}>Generada el {generatedDate}</Text>
        </View>
      </Page>
    </Document>
  );
}
