import { useMemo, useState } from 'react';
import { Download, FileCheck2, FileText, Layers3 } from 'lucide-react';
import { clients } from '../demo-data';
import type { DemoDocument, Order } from '../demo-data/types';
import {
  Button,
  Card,
  EmptyState,
  Modal,
  PageHeader,
  SearchField,
  StatusBadge,
} from '../components/ui';

export default function DocumentsPage({
  documents,
  orders,
  notify,
}: {
  documents: DemoDocument[];
  orders: Order[];
  notify: (message: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [state, setState] = useState('Todos');
  const [preview, setPreview] = useState<DemoDocument | null>(null);
  const visible = useMemo(
    () =>
      documents.filter((document) => {
        const order = orders.find((item) => item.id === document.orderId);
        const client = clients.find((item) => item.id === order?.clientId);
        return (
          `${document.name} ${order?.code} ${client?.name}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (state === 'Todos' || document.state === state)
        );
      }),
    [documents, orders, query, state],
  );

  return (
    <section className="page-enter mx-auto max-w-[1560px]">
      <PageHeader
        eyebrow="Control documental"
        title="Documentos"
        description="Repositorio visual de documentos externos e internos vinculados a cada Pedido / FCL."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700">
            <FileText size={18} />
          </span>
          <p className="mt-3 text-2xl font-bold">{documents.length}</p>
          <p className="text-xs text-slate-500">Documentos registrados</p>
        </Card>
        <Card className="p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
            <FileCheck2 size={18} />
          </span>
          <p className="mt-3 text-2xl font-bold">
            {
              documents.filter((item) =>
                ['Aprobado', 'Recibido', 'Enviado'].includes(item.state),
              ).length
            }
          </p>
          <p className="text-xs text-slate-500">Completos o enviados</p>
        </Card>
        <Card className="p-4">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-700">
            <Layers3 size={18} />
          </span>
          <p className="mt-3 text-2xl font-bold">
            {documents.filter((item) => item.setIds.length > 1).length}
          </p>
          <p className="text-xs text-slate-500">Compartidos entre sets</p>
        </Card>
      </div>
      <Card className="mt-5 overflow-hidden">
        <div className="grid gap-3 border-b border-[#e2e9ec] p-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Buscar documento, FCL o cliente…"
          />
          <select
            aria-label="Filtrar documentos por estado"
            value={state}
            onChange={(event) => setState(event.target.value)}
            className="rounded-xl border border-[#dce4e9] bg-white px-3 py-2 text-sm"
          >
            <option>Todos</option>
            <option>Pendiente</option>
            <option>En proceso</option>
            <option>Borrador</option>
            <option>En revisión</option>
            <option>Recibido</option>
            <option>Aprobado</option>
            <option>Enviado</option>
          </select>
        </div>
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-[#f6f9fa] text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Documento</th>
                  <th className="px-4 py-3">Pedido / FCL</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Versión</th>
                  <th className="px-4 py-3">Sets</th>
                  <th className="px-4 py-3" aria-label="Acciones"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e9ec]">
                {visible.map((document) => {
                  const order = orders.find(
                    (item) => item.id === document.orderId,
                  );
                  const client = clients.find(
                    (item) => item.id === order?.clientId,
                  );
                  return (
                    <tr key={document.id}>
                      <td className="px-5 py-3.5 font-semibold">
                        {document.name}
                        {document.required && (
                          <span className="ml-2 text-[11px] text-red-600">
                            Obligatorio
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#087f76]">
                        {order?.code}
                      </td>
                      <td className="px-4 py-3.5">{client?.name}</td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {document.kind}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={document.state} />
                      </td>
                      <td className="px-4 py-3.5">{document.version}</td>
                      <td className="px-4 py-3.5">{document.setIds.length}</td>
                      <td className="px-4 py-3.5">
                        <Button
                          variant="ghost"
                          onClick={() => setPreview(document)}
                        >
                          Ver
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
      {preview && (
        <Modal
          title={preview.name}
          description="Documento simulado en modo demostración"
          onClose={() => setPreview(null)}
          footer={
            <Button
              onClick={() =>
                notify('Descarga simulada: no se creó ningún archivo real.')
              }
            >
              <Download size={16} />
              Descargar simulación
            </Button>
          }
        >
          <div className="min-h-72 border border-[#dce4e9] p-7 text-center">
            <strong className="tracking-[.15em]">EVEREX</strong>
            <h3 className="mt-12 text-xl font-bold">{preview.name}</h3>
            <p className="mt-2 text-sm text-slate-500">
              Contenido ficticio para validar la experiencia documental.
            </p>
            <p className="mt-14 text-xs font-bold uppercase text-amber-700">
              Sin validez comercial
            </p>
          </div>
        </Modal>
      )}
    </section>
  );
}
