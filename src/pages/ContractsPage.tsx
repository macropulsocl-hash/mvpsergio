import { useMemo, useState } from 'react';
import {
  FileCheck2,
  FileDown,
  Paperclip,
  Plus,
  Save,
  Send,
  Ship,
} from 'lucide-react';
import { clients, products } from '../demo-data';
import type { Contract } from '../demo-data/types';
import {
  Button,
  Card,
  Field,
  Modal,
  PageHeader,
  SearchField,
  StatusBadge,
  formatKg,
  formatMoney,
} from '../components/ui';

interface Props {
  contracts: Contract[];
  onEmit: (id: string) => void;
  onOpenOrder: (id: string) => void;
  notify: (message: string) => void;
}

export default function ContractsPage({
  contracts,
  onEmit,
  onOpenOrder,
  notify,
}: Props) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(contracts[0]?.id ?? '');
  const [modal, setModal] = useState<'new' | 'pdf' | 'attachments' | null>(
    null,
  );
  const filtered = useMemo(
    () =>
      contracts.filter((contract) => {
        const client = clients.find((item) => item.id === contract.clientId);
        return `${contract.code} ${contract.po} ${client?.name}`
          .toLowerCase()
          .includes(query.toLowerCase());
      }),
    [contracts, query],
  );
  const contract =
    contracts.find((item) => item.id === selectedId) ?? filtered[0];
  const totals = contract?.lines.reduce(
    (result, line) => ({
      contracted: result.contracted + line.contractedKg,
      assigned: result.assigned + line.assignedKg,
    }),
    { contracted: 0, assigned: 0 },
  );
  const client = contract
    ? clients.find((item) => item.id === contract.clientId)
    : undefined;

  return (
    <section className="page-enter mx-auto max-w-[1560px]">
      <PageHeader
        eyebrow="Compromisos comerciales"
        title="Contratos"
        description="Control de líneas, kilos disponibles y Pedidos / FCL asociados."
        actions={
          <Button onClick={() => setModal('new')}>
            <Plus size={17} />
            Nuevo contrato
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[370px_minmax(0,1fr)]">
        <Card className="h-fit overflow-hidden">
          <div className="border-b border-[#e2e9ec] p-4">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Buscar contrato, PO o cliente…"
            />
          </div>
          <div className="divide-y divide-[#e7edef] p-2">
            {filtered.map((item) => {
              const itemClient = clients.find(
                (candidate) => candidate.id === item.clientId,
              );
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-xl p-3 text-left transition ${contract?.id === item.id ? 'bg-[#edf7f6]' : 'hover:bg-[#f6f9fa]'}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#087f76]">
                      {item.code}
                    </span>
                    <StatusBadge status={item.state} />
                  </div>
                  <p className="mt-1 truncate text-sm font-semibold">
                    {itemClient?.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    PO {item.po} · {item.orderIds.length} FCL
                  </p>
                </button>
              );
            })}
          </div>
        </Card>
        {contract && client && totals && (
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e2e9ec] bg-[#fbfcfc] px-5 py-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{contract.code}</h2>
                  <StatusBadge status={contract.state} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {client.name} · PO {contract.po}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    notify('Borrador guardado en la sesión de demostración.')
                  }
                >
                  <Save size={16} />
                  Guardar borrador
                </Button>
                {contract.state === 'Borrador' && (
                  <Button onClick={() => onEmit(contract.id)}>
                    <Send size={16} />
                    Emitir contrato
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-6 p-5">
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Cliente" value={client.name} wide />
                <Field label="PO cliente" value={contract.po} />
                <Field label="Incoterm" value={contract.incoterm} />
                <Field label="Moneda" value={contract.currency} />
                <Field label="Fecha de emisión" value={contract.issuedAt} />
              </dl>
              <div>
                <h3 className="mb-3 text-sm font-bold">Líneas contractuales</h3>
                <div className="overflow-x-auto rounded-xl border border-[#e2e9ec]">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-[#f6f9fa] text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">Packaging</th>
                        <th className="px-4 py-3 text-right">Contratado</th>
                        <th className="px-4 py-3 text-right">Asignado</th>
                        <th className="px-4 py-3 text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e9ec]">
                      {contract.lines.map((line) => {
                        const product = products.find(
                          (item) => item.id === line.productId,
                        );
                        return (
                          <tr key={line.id}>
                            <td className="px-4 py-3">
                              <span className="font-bold">
                                {product?.species}
                              </span>
                              <span className="block text-xs text-slate-500">
                                {product?.code} · {product?.condition}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {line.packaging}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {formatKg(line.contractedKg)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {formatKg(line.assignedKg)}
                            </td>
                            <td className="px-4 py-3 text-right tabular-nums">
                              {formatMoney(line.pricePerKg, contract.currency)}
                              /kg
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-[#f6f9fa] p-4">
                  <span className="text-xs uppercase text-slate-500">
                    Kilos comprometidos
                  </span>
                  <strong className="mt-1 block text-lg">
                    {formatKg(totals.contracted)}
                  </strong>
                </div>
                <div className="rounded-xl bg-[#eef8f7] p-4">
                  <span className="text-xs uppercase text-slate-500">
                    Kilos asignados
                  </span>
                  <strong className="mt-1 block text-lg text-[#087f76]">
                    {formatKg(totals.assigned)}
                  </strong>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <span className="text-xs uppercase text-amber-700">
                    Kilos disponibles
                  </span>
                  <strong className="mt-1 block text-lg text-amber-900">
                    {formatKg(totals.contracted - totals.assigned)}
                  </strong>
                </div>
              </div>
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold">Pedidos / FCL generados</h3>
                  <span className="text-xs text-slate-500">
                    {contract.orderIds.length} unidades operativas
                  </span>
                </div>
                {contract.orderIds.length ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {contract.orderIds.map((orderId, index) => (
                      <button
                        onClick={() => onOpenOrder(orderId)}
                        key={orderId}
                        className="flex items-center justify-between rounded-xl border border-[#e2e9ec] p-3 text-left hover:border-[#78cfc7] hover:bg-[#f4fbfa]"
                      >
                        <span>
                          <span className="block text-sm font-bold text-[#087f76]">
                            {orderId.startsWith('ord-')
                              ? `FCL-${orderId.replace('ord-', '')}`
                              : orderId}
                          </span>
                          <span className="text-xs text-slate-500">
                            Línea {index + 1}
                          </span>
                        </span>
                        <Ship size={18} className="text-slate-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-[#cfdadd] p-5 text-center text-sm text-slate-500">
                    Los Pedidos / FCL se crearán al emitir el contrato.
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 border-t border-[#e2e9ec] pt-5">
                <Button variant="secondary" onClick={() => setModal('pdf')}>
                  <FileDown size={16} />
                  Generar PDF
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setModal('attachments')}
                >
                  <Paperclip size={16} />
                  Ver adjuntos ({contract.attachments.length})
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
      {modal === 'new' && (
        <Modal
          title="Nuevo contrato"
          description="Formulario demostrativo; no crea registros permanentes."
          onClose={() => setModal(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setModal(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setModal(null);
                  notify('Borrador de contrato creado para esta sesión.');
                }}
              >
                Guardar borrador
              </Button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Cliente
              <select className="mt-1.5 w-full rounded-xl border border-[#dce4e9] p-2.5 font-normal">
                {clients.map((item) => (
                  <option key={item.id}>{item.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Incoterm
              <input
                className="mt-1.5 w-full rounded-xl border border-[#dce4e9] p-2.5 font-normal"
                placeholder="Ej. FOB San Antonio"
              />
            </label>
            <label className="text-sm font-semibold">
              PO cliente
              <input
                className="mt-1.5 w-full rounded-xl border border-[#dce4e9] p-2.5 font-normal"
                placeholder="PO-DEMO-001"
              />
            </label>
            <label className="text-sm font-semibold">
              Moneda
              <select className="mt-1.5 w-full rounded-xl border border-[#dce4e9] p-2.5 font-normal">
                <option>USD</option>
                <option>EUR</option>
              </select>
            </label>
          </div>
        </Modal>
      )}
      {modal === 'pdf' && contract && (
        <Modal
          title="Vista previa del contrato"
          description="Documento simulado en modo demostración"
          onClose={() => setModal(null)}
          size="lg"
          footer={
            <Button
              onClick={() =>
                notify('Descarga simulada: no se generó ningún archivo real.')
              }
            >
              <FileDown size={16} />
              Descargar simulación
            </Button>
          }
        >
          <div className="mx-auto max-w-2xl border border-[#dce4e9] bg-white p-8 shadow-sm">
            <div className="flex justify-between">
              <div>
                <strong className="text-xl tracking-[.15em]">EVEREX</strong>
                <p className="text-xs text-slate-500">
                  Contrato de compraventa internacional
                </p>
              </div>
              <FileCheck2 className="text-[#0a9b8e]" />
            </div>
            <h3 className="mt-10 text-center text-xl font-bold">
              {contract.code}
            </h3>
            <p className="mt-6 text-sm leading-7 text-slate-600">
              Entre Everex Exportaciones Demo SpA y {client?.name}, se presenta
              la siguiente vista previa ficticia para fines de validación del
              flujo.
            </p>
            <div className="mt-6 rounded-lg bg-slate-50 p-4 text-sm">
              PO {contract.po} · {contract.incoterm} · {contract.currency}
            </div>
            <p className="mt-8 text-center text-xs font-semibold uppercase tracking-wide text-amber-700">
              Documento simulado · sin validez comercial
            </p>
          </div>
        </Modal>
      )}
      {modal === 'attachments' && contract && (
        <Modal
          title="Adjuntos del contrato"
          description="Archivos de muestra; no contienen información real."
          onClose={() => setModal(null)}
        >
          {contract.attachments.map((item) => (
            <button
              key={item}
              onClick={() => notify('Vista previa simulada abierta.')}
              className="mb-2 flex w-full items-center gap-3 rounded-xl border border-[#e2e9ec] p-3 text-left hover:bg-slate-50"
            >
              <Paperclip size={18} className="text-[#087f76]" />
              <span className="text-sm font-semibold">{item}</span>
            </button>
          ))}
        </Modal>
      )}
    </section>
  );
}
