import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Invoice } from '@/types/billing';

const LOGO_URL = '/images/logo/Certa Seguros.png';

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

// Colors based on Certa Seguros brand
const colors = {
  primary: '#0284c7', // sky-600
  secondary: '#0ea5e9', // sky-500
  textDark: '#0f172a', // slate-900
  textMuted: '#475569', // slate-600
  border: '#e2e8f0', // slate-200
  background: '#f0f9ff', // sky-50
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
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 40,
    objectFit: 'contain',
  },
  logoSection: {
    flexDirection: 'column',
  },
  commercialName: {
    fontSize: 18,
    fontWeight: 700,
    color: colors.primary,
    marginTop: 4,
  },
  companyInfo: {
    marginTop: 8,
    color: colors.textMuted,
    lineHeight: 1.4,
    fontSize: 9,
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
    marginBottom: 24,
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
    marginBottom: 24,
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
  paymentSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  paymentTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: colors.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  paymentRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  paymentLabel: {
    width: 40,
    color: colors.textMuted,
    fontSize: 9,
  },
  paymentValue: {
    flex: 1,
    fontWeight: 600,
    fontSize: 9,
  },
  qrSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  qrText: {
    fontSize: 7,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'center',
  },
  headerFixed: {
    position: 'absolute',
    top: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export function InvoicePDF({ invoice }: { invoice: Invoice }) {
  const companyInfo = {
    name: invoice.companyName || 'MARIA FERNANDA ZAPATA ORTIZ',
    nit: invoice.companyNit || '29775050-1',
    address: invoice.companyAddress || 'CR 5 BIS 14 B 47, URBANIZACION El Oasis I Etapa, Roldanillo, Valle del Cauca',
    phone: invoice.companyPhone || '3157420456',
    email: invoice.companyEmail || 'mfz.asesoriasempresariales@gmail.com',
  };

  const paymentInfo = invoice.paymentInfo || {
    bank: 'Banco de Colombia',
    accountType: 'Ahorros',
    accountNumber: '123 456 7890',
    concept: `Factura No. ${invoice.number}`,
  };

  const generatedDate = new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
  }).format(new Date());

  const qrVerifyUrl = `https://certaseguros.com.co/verify?f=${invoice.number}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Fixed Header - Logo on every page */}
        <View style={styles.headerFixed} fixed>
          <Image src={LOGO_URL} style={styles.logo} />
          <Text style={{ fontSize: 8, color: colors.textMuted }}>Página </Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`}
            style={{ fontSize: 8, color: colors.textMuted }}
          />
        </View>

        {/* Main Header - First page only */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <Image src={LOGO_URL} style={styles.logo} />
            <Text style={styles.commercialName}>CERTA SEGUROS</Text>
            <View style={styles.companyInfo}>
              <Text>{companyInfo.name}</Text>
              <Text>NIT: {companyInfo.nit}</Text>
              <Text>{companyInfo.address}</Text>
              <Text>{companyInfo.phone} | {companyInfo.email}</Text>
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

        {/* Payment Information */}
        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Datos para Pago</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Banco:</Text>
            <Text style={styles.paymentValue}>{paymentInfo.bank}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tipo:</Text>
            <Text style={styles.paymentValue}>{paymentInfo.accountType}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>No. Cuenta:</Text>
            <Text style={styles.paymentValue}>{paymentInfo.accountNumber}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Referencia:</Text>
            <Text style={styles.paymentValue}>{paymentInfo.concept}</Text>
          </View>
        </View>

        {/* QR Code Verification */}
        <View style={styles.qrSection}>
          <View style={styles.qrPlaceholder}>
            <Text style={{ fontSize: 8, color: colors.textMuted }}>QR</Text>
          </View>
          <Text style={styles.qrText}>{qrVerifyUrl}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {companyInfo.name} | {companyInfo.email} | {companyInfo.phone}
          </Text>
          <Text style={styles.footerText}>
            Generated: {generatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
