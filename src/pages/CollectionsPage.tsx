import { useMemo, useState } from 'react';
import {
  CircleDollarSign,
  Clock3,
  ReceiptText,
  WalletCards,
} from 'lucide-react';
import { clients } from '../demo-data';
import type { Invoice, Order } from '../demo-data/types';
import {
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  SearchField,
  StatusBadge,
  formatMoney,
} from '../components/ui';

export default function CollectionsPage({
  invoices,
  orders,
  onPayment,
  notify,
}: {
  invoices: Invoice[];
  orders: Order[];
  onPayment: (orderId: string, full: boolean) => void;
  notify: (message: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('Todos');
  const [due, setDue] = useState('Todos');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const visible = useMemo(
    () =>
      invoices.filter((invoice) => {
        const client = clients.find((item) => item.id === invoice.clientId);
        const matchesDue =
          due === 'Todos' ||
          (due === 'Próximos 30 días'
            ? new Date(invoice.dueAt) <= new Date('2026-10-15')
            : invoice.state !== 'Pagada');
        return (
          `${invoice.code} ${client?.name}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (state === 'Todos' || invoice.state === state) &&
          matchesDue
        );
      }),
    [due, invoices, query, state],
  );
  const total = invoices.reduce((sum, item) => sum + item.total, 0);
  const paid = invoices.reduce((sum, item) => sum + item.paid, 0);
  const balance = total - paid;
  return (
    <section className="page-enter mx-auto max-w-[1560px]">
      <PageHeader
        eyebrow="Finanzas operativas"
        title="Cobranza"
        description="Facturación, abonos y saldos por Pedido / FCL con condición de pago visible."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <ReceiptText className="text-[#087f76]" size={21} />
          <p className="mt-3 text-xl font-bold">{formatMoney(total)}</p>
          <p className="text-xs text-slate-500">Total facturado</p>
        </Card>
        <Card className="p-4">
          <WalletCards className="text-emerald-600" size={21} />
          <p className="mt-3 text-xl font-bold">{formatMoney(paid)}</p>
          <p className="text-xs text-slate-500">Pagos recibidos</p>
        </Card>
        <Card className="p-4">
          <Clock3 className="text-amber-600" size={21} />
          <p className="mt-3 text-xl font-bold">{formatMoney(balance)}</p>
          <p className="text-xs text-slate-500">Saldo por cobrar</p>
        </Card>
      </div>
      <Card className="mt-5 overflow-hidden">
        <div className="grid gap-3 border-b border-[#e2e9ec] p-4 lg:grid-cols-[minmax(0,1fr)_180px_220px]">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Buscar factura o cliente…"
          />
          <select
            aria-label="Filtrar facturas por estado"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="rounded-xl border border-[#dce4e9] bg-white px-3 py-2 text-sm"
          >
            <option>Todos</option>
            <option>Pendiente</option>
            <option>Parcial</option>
            <option>Pagada</option>
          </select>
          <select
            aria-label="Filtrar facturas por vencimiento"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="rounded-xl border border-[#dce4e9] bg-white px-3 py-2 text-sm"
          >
            <option>Todos</option>
            <option>Próximos 30 días</option>
            <option>Con saldo</option>
          </select>
        </div>
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#f6f9fa] text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Factura</th>
                  <th className="px-4 py-3">Cliente / Pedido</th>
                  <th className="px-4 py-3">Condición</th>
                  <th className="px-4 py-3">Vencimiento</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Pagado</th>
                  <th className="px-4 py-3 text-right">Saldo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" aria-label="Acciones"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e9ec]">
                {visible.map((invoice) => {
                  const client = clients.find(
                    (item) => item.id === invoice.clientId,
                  );
                  const order = orders.find(
                    (item) => item.id === invoice.orderId,
                  );
                  return (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4 font-bold text-[#087f76]">
                        {invoice.code}
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-semibold">{client?.name}</span>
                        <span className="block text-xs text-slate-500">
                          {order?.code}
                        </span>
                      </td>
                      <td className="px-4 py-4">{invoice.paymentTerm}</td>
                      <td className="px-4 py-4">{invoice.dueAt}</td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {formatMoney(invoice.total, invoice.currency)}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums">
                        {formatMoney(invoice.paid, invoice.currency)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold tabular-nums">
                        {formatMoney(
                          invoice.total - invoice.paid,
                          invoice.currency,
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={invoice.state} />
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          variant="ghost"
                          disabled={invoice.state === 'Pagada'}
                          onClick={() => setSelected(invoice)}
                        >
                          Registrar pago
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {selected && (
        <Modal
          title={`Pago · ${selected.code}`}
          description={`Saldo ${formatMoney(selected.total - selected.paid, selected.currency)}`}
          onClose={() => setSelected(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelected(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  onPayment(selected.orderId, false);
                  setSelected(null);
                  notify('Abono parcial registrado en modo demostración.');
                }}
              >
                Abono 50%
              </Button>
              <Button
                onClick={() => {
                  onPayment(selected.orderId, true);
                  setSelected(null);
                  notify('Saldo pagado en modo demostración.');
                }}
              >
                <CircleDollarSign size={16} />
                Pagar saldo
              </Button>
            </>
          }
        >
          <p className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            No se procesa dinero ni se conecta a un banco. La selección solo
            actualiza esta sesión.
          </p>
        </Modal>
      )}
    </section>
  );
}
