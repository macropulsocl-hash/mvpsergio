import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Download,
  FileCheck2,
  FileText,
  KeyRound,
  Leaf,
  LockKeyhole,
  PackageOpen,
  Plus,
  Send,
  Ship,
  Truck,
  Weight,
} from 'lucide-react';
import { clients, contracts, plants, products } from '../demo-data';
import type {
  Alert,
  DemoDocument,
  DocumentSet,
  MilestoneKey,
  Order,
  ProcessState,
} from '../demo-data/types';
import {
  Button,
  Card,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  SearchField,
  StatusBadge,
  formatKg,
  formatMoney,
} from '../components/ui';

type OrderTab =
  | 'Resumen'
  | 'Checklist Operacional'
  | 'Checklist Documental'
  | 'Documentos'
  | 'Sets Documentales'
  | 'Historial';

interface Props {
  orders: Order[];
  selectedOrderId?: string;
  documents: DemoDocument[];
  sets: DocumentSet[];
  alerts: Alert[];
  invoices: Array<{
    id: string;
    orderId: string;
    total: number;
    paid: number;
    currency: 'USD' | 'EUR';
  }>;
  onSelect: (id?: string) => void;
  onAdvance: (orderId: string, key: MilestoneKey) => void;
  onChecklist: (
    orderId: string,
    list: 'operational' | 'document',
    itemId: string,
    state: ProcessState,
  ) => void;
  onCompleteDocuments: (orderId: string) => void;
  onRegisterPayment: (orderId: string, full: boolean) => void;
  onCloseOrder: (orderId: string) => void;
  onApproveSet: (setId: string) => void;
  onSendSet: (setId: string) => void;
  notify: (message: string) => void;
}

const actions: Array<{ key: MilestoneKey; label: string }> = [
  { key: 'plant', label: 'Confirmar FTP' },
  { key: 'booking', label: 'Registrar Booking' },
  { key: 'instructions', label: 'Emitir Instructivo' },
  { key: 'loading', label: 'Confirmar Carga' },
  { key: 'departure', label: 'Confirmar Zarpe' },
  { key: 'delivery', label: 'Confirmar Entrega' },
  { key: 'payment', label: 'Registrar Pago' },
  { key: 'closure', label: 'Cerrar Pedido' },
];

function SummaryBlock({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[#e2e9ec] px-4 py-3.5 text-sm font-bold text-[#17364b]">
        {icon}
        {title}
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

function OrdersList({
  orders,
  onSelect,
}: {
  orders: Order[];
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Todos');
  const visible = useMemo(
    () =>
      orders.filter((order) => {
        const client = clients.find((item) => item.id === order.clientId);
        return (
          `${order.code} ${client?.name} ${order.destination}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (filter === 'Todos' || order.macroStatus === filter)
        );
      }),
    [filter, orders, query],
  );
  return (
    <section className="page-enter mx-auto max-w-[1560px]">
      <PageHeader
        eyebrow="Ejecución exportadora"
        title="Pedidos / FCL"
        description="Una unidad operativa para coordinar planta, carga, documentos, cobranza y cierre."
        actions={
          <Button onClick={() => onSelect(orders[0]?.id ?? '')}>
            <Plus size={17} />
            Nuevo Pedido / FCL
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="grid gap-3 border-b border-[#e2e9ec] p-4 sm:grid-cols-[minmax(0,1fr)_220px]">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Buscar código, cliente o destino…"
          />
          <select
            aria-label="Filtrar pedidos por estado"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded-xl border border-[#dce4e9] bg-white px-3.5 py-2.5 text-sm"
          >
            <option>Todos</option>
            <option>Pendiente</option>
            <option>En Curso</option>
            <option>Despachado</option>
            <option>Cerrado</option>
          </select>
        </div>
        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#f6f9fa] text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Pedido / FCL</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Ruta</th>
                  <th className="px-4 py-3">FRC / FTP</th>
                  <th className="px-4 py-3">ETD / ETA</th>
                  <th className="px-4 py-3">Kilos</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" aria-label="Abrir pedido"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e9ec]">
                {visible.map((order) => {
                  const client = clients.find(
                    (item) => item.id === order.clientId,
                  );
                  return (
                    <tr
                      key={order.id}
                      onClick={() => onSelect(order.id)}
                      className="cursor-pointer hover:bg-[#f5fbfa]"
                    >
                      <td className="px-5 py-4">
                        <span className="font-bold text-[#087f76]">
                          {order.code}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {order.stage}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-semibold">
                        {client?.name}
                      </td>
                      <td className="px-4 py-4">
                        {order.destination}
                        <span className="block text-xs text-slate-500">
                          {order.incoterm}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block">{order.dates.frc}</span>
                        <span className="text-xs text-slate-500">
                          {order.dates.ftp}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="block">{order.dates.etd}</span>
                        <span className="text-xs text-slate-500">
                          {order.dates.eta}
                        </span>
                      </td>
                      <td className="px-4 py-4 tabular-nums">
                        {formatKg(
                          order.items.reduce(
                            (sum, item) => sum + item.kilograms,
                            0,
                          ),
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={order.macroStatus} />
                      </td>
                      <td className="px-4 py-4">
                        <ChevronRight size={18} className="text-slate-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </section>
  );
}

function CheckList({
  order,
  kind,
  onChecklist,
}: {
  order: Order;
  kind: 'operational' | 'document';
  onChecklist: Props['onChecklist'];
}) {
  const list =
    kind === 'operational'
      ? order.operationalChecklist
      : order.documentChecklist;
  const states: ProcessState[] = [
    'Pendiente',
    'En proceso',
    'Recibido',
    'Borrador',
    'En revisión',
    'Aprobado',
    'Enviado',
  ];
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-[#e2e9ec] px-5 py-4">
        <h3 className="font-bold">
          Checklist {kind === 'operational' ? 'Operacional' : 'Documental'}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Actualiza los estados para simular seguimiento colaborativo.
        </p>
      </div>
      <div className="divide-y divide-[#e2e9ec]">
        {list.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 px-5 py-4 md:grid-cols-[minmax(0,1fr)_150px_170px] md:items-center"
          >
            <div>
              <p className="text-sm font-semibold">{item.label}</p>
              <p className="mt-1 text-xs text-slate-500">
                Responsable: {item.owner} · vence {item.dueAt}
              </p>
            </div>
            <StatusBadge status={item.state} />
            <select
              aria-label={`Actualizar estado de ${item.label}`}
              value={item.state}
              onChange={(event) =>
                onChecklist(
                  order.id,
                  kind,
                  item.id,
                  event.target.value as ProcessState,
                )
              }
              className="rounded-lg border border-[#dce4e9] bg-white px-3 py-2 text-sm"
            >
              {states.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </Card>
  );
}

function DocumentsTab({
  order,
  documents,
  onComplete,
  notify,
}: {
  order: Order;
  documents: DemoDocument[];
  onComplete: () => void;
  notify: (message: string) => void;
}) {
  const orderDocs = documents.filter((item) => item.orderId === order.id);
  const [preview, setPreview] = useState<DemoDocument | null>(null);
  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e9ec] px-5 py-4">
          <div>
            <h3 className="font-bold">Documentos del Pedido / FCL</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Externos e internos, con una sola fuente por documento.
            </p>
          </div>
          <Button variant="secondary" onClick={onComplete}>
            <FileCheck2 size={16} />
            Completar documentación demo
          </Button>
        </div>
        {orderDocs.length === 0 ? (
          <EmptyState
            title="Aún no hay documentos"
            description="Se crearán al emitir el instructivo de la operación."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#f6f9fa] text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Documento</th>
                  <th className="px-4 py-3">Origen</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Versión</th>
                  <th className="px-4 py-3">Sets</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e9ec]">
                {orderDocs.map((document) => (
                  <tr key={document.id}>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold">{document.name}</span>
                      {document.required && (
                        <span className="ml-2 text-xs text-red-600">
                          Obligatorio
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {document.kind}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={document.state} />
                    </td>
                    <td className="px-4 py-3.5">{document.version}</td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs">
                        {document.setIds.length} set(s)
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        onClick={() => setPreview(document)}
                      >
                        {document.state === 'Pendiente' ? (
                          <>
                            <FileText size={15} />
                            Generar
                          </>
                        ) : (
                          <>
                            <Download size={15} />
                            Ver
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
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
          size="lg"
          footer={
            <Button
              onClick={() =>
                notify('Descarga simulada: no se generó ningún archivo real.')
              }
            >
              <Download size={16} />
              Descargar simulación
            </Button>
          }
        >
          <div className="mx-auto min-h-[430px] max-w-2xl border border-[#dce4e9] p-8 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <strong className="text-xl tracking-[.14em]">EVEREX</strong>
                <p className="text-xs text-slate-500">Export operations</p>
              </div>
              <span className="rounded-lg bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                SIMULACIÓN
              </span>
            </div>
            <h3 className="mt-12 text-center text-2xl font-bold">
              {preview.name}
            </h3>
            <p className="mt-3 text-center text-sm text-slate-500">
              {order.code} · {order.destination}
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-5 text-sm">
              <span>
                <small className="block text-slate-400">Versión</small>
                {preview.version}
              </span>
              <span>
                <small className="block text-slate-400">Actualizado</small>
                {preview.updatedAt}
              </span>
            </div>
            <p className="mt-16 text-center text-xs text-slate-400">
              Vista previa ficticia, sin validez documental ni comercial.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}

function SetsTab({
  order,
  sets,
  documents,
  onApprove,
  onSend,
  notify,
}: {
  order: Order;
  sets: DocumentSet[];
  documents: DemoDocument[];
  onApprove: (id: string) => void;
  onSend: (id: string) => void;
  notify: (message: string) => void;
}) {
  const orderSets = sets.filter((item) => item.orderId === order.id);
  const [approve, setApprove] = useState<DocumentSet | null>(null);
  const [send, setSend] = useState<DocumentSet | null>(null);
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  return (
    <>
      {orderSets.length === 0 ? (
        <Card>
          <EmptyState
            title="Sin sets documentales"
            description="Los sets aparecerán cuando existan documentos para distribuir."
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {orderSets.map((set) => (
            <Card key={set.id} className="overflow-hidden">
              <div className="flex items-start justify-between gap-3 border-b border-[#e2e9ec] p-4">
                <div>
                  <h3 className="font-bold">{set.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {set.documentIds.length} documentos ·{' '}
                    {set.recipients.length} destinatario(s)
                  </p>
                </div>
                <StatusBadge status={set.state} />
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-1.5">
                  {set.documentIds.map((id) => {
                    const document = documents.find((item) => item.id === id);
                    return (
                      <span
                        key={id}
                        className="rounded-md bg-[#f0f4f5] px-2 py-1 text-xs text-slate-600"
                      >
                        {document?.name ?? id}
                      </span>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-slate-500">
                  Destinatarios: {set.recipients.join(', ')}
                </p>
                {set.approvedAt && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
                    <CheckCircle2 size={14} />
                    Aprobado con clave · {set.approvedAt}
                  </p>
                )}
                {set.sentAt && (
                  <p className="mt-1 flex items-center gap-2 text-xs text-indigo-700">
                    <Send size={14} />
                    Enviado · {set.sentAt}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={Boolean(set.approvedAt)}
                    onClick={() => setApprove(set)}
                  >
                    <KeyRound size={16} />
                    Aprobar con clave
                  </Button>
                  <Button
                    disabled={!set.approvedAt || set.state === 'Enviado'}
                    onClick={() => setSend(set)}
                  >
                    <Send size={16} />
                    Enviar set
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-4 rounded-xl border border-[#bfe5df] bg-[#f0fbf9] p-4 text-sm text-[#315e5a]">
        <strong>Sin duplicación:</strong> Packing List y Commercial Invoice
        aparecen en varios sets, pero cada uno conserva un único documento y
        versión.
      </div>
      {approve && (
        <Modal
          title={`Aprobar ${approve.name}`}
          description="Confirmación simulada con registro de auditoría visual."
          onClose={() => {
            setApprove(null);
            setError('');
            setKey('');
          }}
          footer={
            <>
              <Button variant="secondary" onClick={() => setApprove(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (key.length < 4) {
                    setError('Ingresa al menos 4 caracteres.');
                    return;
                  }
                  onApprove(approve.id);
                  setApprove(null);
                  setKey('');
                  notify(
                    'Set aprobado. Auditoría agregada al historial local.',
                  );
                }}
              >
                <LockKeyhole size={16} />
                Confirmar aprobación
              </Button>
            </>
          }
        >
          <label className="block text-sm font-semibold">
            Clave de demostración
            <input
              type="password"
              value={key}
              onChange={(event) => {
                setKey(event.target.value);
                setError('');
              }}
              className={`mt-1.5 w-full rounded-xl border p-2.5 ${error ? 'border-red-400' : 'border-[#dce4e9]'}`}
              placeholder="Cualquier clave de 4+ caracteres"
            />
            {error && (
              <span className="mt-1 block text-xs text-red-600">{error}</span>
            )}
          </label>
          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <strong>Auditoría prevista</strong>
            <br />
            Administrador Everex · fecha y hora local · Modo demostración
          </div>
        </Modal>
      )}
      {send && (
        <Modal
          title={`Enviar ${send.name}`}
          description="Envío ficticio; no se contactará a ninguna dirección."
          onClose={() => setSend(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSend(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  onSend(send.id);
                  setSend(null);
                  notify(
                    'Set enviado de forma simulada y trazabilidad actualizada.',
                  );
                }}
              >
                <Send size={16} />
                Confirmar envío simulado
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-600">Se mostrará un envío a:</p>
          <ul className="mt-3 space-y-2">
            {send.recipients.map((recipient) => (
              <li
                key={recipient}
                className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold"
              >
                {recipient}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Esta acción solo actualiza el estado visual de la maqueta. No usa
            correo ni servicios externos.
          </p>
        </Modal>
      )}
    </>
  );
}

function OrderDetail(props: Props & { order: Order }) {
  const {
    order,
    documents,
    sets,
    alerts,
    invoices,
    onSelect,
    onAdvance,
    onChecklist,
    onCompleteDocuments,
    onRegisterPayment,
    onCloseOrder,
    onApproveSet,
    onSendSet,
    notify,
  } = props;
  const [tab, setTab] = useState<OrderTab>('Resumen');
  const [paymentModal, setPaymentModal] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const client = clients.find((item) => item.id === order.clientId);
  const contract = contracts.find((item) => item.id === order.contractId);
  const invoice = invoices.find((item) => item.orderId === order.id);
  const orderAlerts = alerts.filter(
    (item) => order.alertIds.includes(item.id) && !item.resolved,
  );
  const requiredDocs = documents.filter(
    (item) => item.orderId === order.id && item.required,
  );
  const docsComplete =
    requiredDocs.length > 0 &&
    requiredDocs.every((item) =>
      ['Aprobado', 'Enviado', 'Recibido'].includes(item.state),
    );
  const delivered =
    order.milestones.find((item) => item.key === 'delivery')?.state ===
    'Completado';
  const zeroBalance = !invoice || invoice.total - invoice.paid <= 0;
  const readyToClose = delivered && docsComplete && zeroBalance;
  const activeIndex = order.milestones.findIndex(
    (item) => item.state === 'Actual',
  );
  const canAction = (key: MilestoneKey) => {
    const index = order.milestones.findIndex((item) => item.key === key);
    if (key === 'delivery') return activeIndex >= 5 && docsComplete;
    if (key === 'payment') return delivered;
    if (key === 'closure') return readyToClose;
    return index === activeIndex;
  };
  const tabs: OrderTab[] = [
    'Resumen',
    'Checklist Operacional',
    'Checklist Documental',
    'Documentos',
    'Sets Documentales',
    'Historial',
  ];

  return (
    <section className="page-enter mx-auto max-w-[1560px]">
      <button
        onClick={() => onSelect(undefined)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#087f76]"
      >
        <ArrowLeft size={17} />
        Volver a Pedidos / FCL
      </button>
      <Card className="overflow-hidden">
        <div className="bg-[#071b2c] px-5 py-5 text-white md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                  {order.code}
                </h1>
                <StatusBadge status={order.macroStatus} />
              </div>
              <p className="mt-2 text-sm text-slate-300">
                {client?.name} · {contract?.code} · {order.destination}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {orderAlerts.map((alert) => (
                <span
                  key={alert.id}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-2.5 py-1.5 text-xs font-semibold text-red-100 ring-1 ring-red-400/30"
                >
                  <AlertTriangle size={14} />
                  {alert.title}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid border-b border-[#e2e9ec] sm:grid-cols-4">
          {Object.entries(order.dates).map(([key, value], index) => (
            <div
              key={key}
              className="relative border-b border-[#e2e9ec] px-5 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {key.toUpperCase()}
              </span>
              <p className="mt-1 text-sm font-bold">{value}</p>
              {index < 3 && (
                <span className="absolute right-0 top-1/2 hidden h-px w-5 bg-[#b9dcd8] sm:block" />
              )}
            </div>
          ))}
        </div>
        <div className="overflow-x-auto px-4 pt-4">
          <div className="flex min-w-max gap-1">
            {tabs.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`rounded-t-xl border-b-2 px-4 py-3 text-sm font-semibold transition ${tab === item ? 'border-[#0a9b8e] bg-[#edf7f6] text-[#087f76]' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-5">
        {tab === 'Resumen' && (
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="border-b border-[#e2e9ec] px-5 py-4">
                <h2 className="font-bold">Progreso del Pedido / FCL</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Secuencia desde confirmación de planta hasta archivo del
                  expediente.
                </p>
              </div>
              <div className="overflow-x-auto p-5">
                <div className="flex min-w-[900px] items-start">
                  {order.milestones.map((milestone, index) => (
                    <div
                      key={milestone.key}
                      className="relative flex flex-1 flex-col items-center text-center"
                    >
                      <div
                        className={`absolute left-0 top-3.5 h-0.5 w-full ${index === 0 ? 'hidden' : ''} ${milestone.state === 'Pendiente' ? 'bg-slate-200' : 'bg-[#62bdb4]'}`}
                      />
                      <span
                        className={`relative z-10 grid h-7 w-7 place-items-center rounded-full ring-4 ring-white ${milestone.state === 'Completado' ? 'bg-[#0a9b8e] text-white' : milestone.state === 'Actual' ? 'border-2 border-[#0a9b8e] bg-white text-[#0a9b8e]' : 'border-2 border-slate-200 bg-white text-slate-300'}`}
                      >
                        {milestone.state === 'Completado' ? (
                          <Check size={14} />
                        ) : (
                          <CircleDot size={12} />
                        )}
                      </span>
                      <span
                        className={`mt-2 max-w-[90px] text-[11px] font-semibold ${milestone.state === 'Pendiente' ? 'text-slate-400' : 'text-[#17364b]'}`}
                      >
                        {milestone.label}
                      </span>
                      {milestone.date && (
                        <span className="mt-0.5 text-[10px] text-slate-400">
                          {milestone.date}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
            <div className="grid gap-4 xl:grid-cols-2">
              <SummaryBlock
                title="Ítems y asignación"
                icon={<PackageOpen size={18} className="text-[#087f76]" />}
              >
                <div className="space-y-4">
                  {order.items.map((item) => {
                    const product = products.find(
                      (candidate) => candidate.id === item.productId,
                    );
                    const plant = plants.find(
                      (candidate) => candidate.id === item.plantId,
                    );
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl bg-[#f7f9fa] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold">
                              {product?.species} · {product?.type}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {plant?.name}
                            </p>
                          </div>
                          {item.organic && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              <Leaf size={13} />
                              Orgánico
                            </span>
                          )}
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <Field
                            label="Packaging"
                            value={item.packaging}
                            wide
                          />
                          <Field
                            label="Kilos"
                            value={formatKg(item.kilograms)}
                          />
                          <Field
                            label="Pallets / cajas"
                            value={`${item.pallets} / ${item.boxes}`}
                          />
                          <Field label="Lote" value={item.lot} />
                        </dl>
                      </div>
                    );
                  })}
                </div>
              </SummaryBlock>
              <SummaryBlock
                title="Booking y ruta marítima"
                icon={<Ship size={18} className="text-[#087f76]" />}
              >
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Forwarder" value={order.booking.forwarder} />
                  <Field label="Naviera" value={order.booking.carrier} />
                  <Field label="Booking" value={order.booking.booking} />
                  <Field
                    label="Nave / voyage"
                    value={`${order.booking.vessel} · ${order.booking.voyage}`}
                  />
                  <Field label="Stacking" value={order.booking.stacking} />
                  <Field
                    label="Puertos"
                    value={`${order.booking.originPort} → ${order.booking.destinationPort}`}
                  />
                  <Field
                    label="Cut-off documental"
                    value={order.booking.docsCutoff}
                  />
                  <Field
                    label="Cut-off reefer"
                    value={order.booking.reeferCutoff}
                  />
                  <Field
                    label="Temperatura"
                    value={order.booking.temperature}
                  />
                  <Field
                    label="Ventilación"
                    value={order.booking.ventilation}
                  />
                </dl>
              </SummaryBlock>
              <SummaryBlock
                title="Carga y contenedor"
                icon={<Truck size={18} className="text-[#087f76]" />}
              >
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Transporte" value={order.loading.transporter} />
                  <Field label="Chofer" value={order.loading.driver} />
                  <Field
                    label="Patentes"
                    value={`${order.loading.truckPlate} / ${order.loading.trailerPlate}`}
                  />
                  <Field label="Contenedor" value={order.loading.container} />
                  <Field label="Sello" value={order.loading.seal} />
                  <Field label="Termógrafo" value={order.loading.thermograph} />
                  <Field
                    label="Peso neto / bruto"
                    value={`${formatKg(order.loading.netKg)} / ${formatKg(order.loading.grossKg)}`}
                  />
                  <Field
                    label="VGM / carga real"
                    value={`${formatKg(order.loading.vgmKg)} · ${order.loading.actualAt}`}
                  />
                </dl>
              </SummaryBlock>
              <SummaryBlock
                title="Cobranza y condición de cierre"
                icon={<Weight size={18} className="text-[#087f76]" />}
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <div
                    className={`rounded-xl p-3 ${delivered ? 'bg-emerald-50' : 'bg-slate-50'}`}
                  >
                    <span className="text-xs text-slate-500">Entrega</span>
                    <strong className="mt-1 block text-sm">
                      {delivered ? 'Confirmada' : 'Pendiente'}
                    </strong>
                  </div>
                  <div
                    className={`rounded-xl p-3 ${docsComplete ? 'bg-emerald-50' : 'bg-amber-50'}`}
                  >
                    <span className="text-xs text-slate-500">Documentos</span>
                    <strong className="mt-1 block text-sm">
                      {docsComplete ? 'Completos' : 'Pendientes'}
                    </strong>
                  </div>
                  <div
                    className={`rounded-xl p-3 ${zeroBalance ? 'bg-emerald-50' : 'bg-amber-50'}`}
                  >
                    <span className="text-xs text-slate-500">Saldo</span>
                    <strong className="mt-1 block text-sm">
                      {invoice
                        ? formatMoney(
                            invoice.total - invoice.paid,
                            invoice.currency,
                          )
                        : 'Sin factura'}
                    </strong>
                  </div>
                </div>
                {order.customsBroker && (
                  <p className="mt-4 rounded-xl bg-[#f6f9fa] p-3 text-sm">
                    <strong>Customs Broker:</strong> {order.customsBroker}
                  </p>
                )}
                <div
                  className={`mt-4 rounded-xl p-3 text-sm font-semibold ${readyToClose ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}
                >
                  {readyToClose
                    ? 'Listo para cierre'
                    : 'El cierre se habilita con entrega, documentos completos y saldo cero.'}
                </div>
              </SummaryBlock>
            </div>
            <Card className="p-4">
              <h3 className="mb-3 text-sm font-bold">Acciones del flujo</h3>
              <div className="flex flex-wrap gap-2">
                {actions.map((action) => {
                  const complete =
                    order.milestones.find((item) => item.key === action.key)
                      ?.state === 'Completado';
                  const enabled = canAction(action.key) && !complete;
                  return (
                    <Button
                      key={action.key}
                      variant={
                        action.key === 'closure'
                          ? 'danger'
                          : complete
                            ? 'ghost'
                            : 'secondary'
                      }
                      disabled={!enabled}
                      onClick={() => {
                        if (action.key === 'payment') setPaymentModal(true);
                        else if (action.key === 'closure') setCloseModal(true);
                        else onAdvance(order.id, action.key);
                      }}
                    >
                      {complete ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <CalendarClock size={16} />
                      )}
                      {action.label}
                    </Button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
        {tab === 'Checklist Operacional' && (
          <CheckList
            order={order}
            kind="operational"
            onChecklist={onChecklist}
          />
        )}
        {tab === 'Checklist Documental' && (
          <CheckList order={order} kind="document" onChecklist={onChecklist} />
        )}
        {tab === 'Documentos' && (
          <DocumentsTab
            order={order}
            documents={documents}
            onComplete={() => onCompleteDocuments(order.id)}
            notify={notify}
          />
        )}
        {tab === 'Sets Documentales' && (
          <SetsTab
            order={order}
            sets={sets}
            documents={documents}
            onApprove={onApproveSet}
            onSend={onSendSet}
            notify={notify}
          />
        )}
        {tab === 'Historial' && (
          <Card className="overflow-hidden">
            <div className="border-b border-[#e2e9ec] px-5 py-4">
              <h3 className="font-bold">Historial y trazabilidad</h3>
            </div>
            <div className="divide-y divide-[#e2e9ec]">
              {order.history.map((event) => (
                <div key={event.id} className="flex gap-4 px-5 py-4">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#0a9b8e] ring-4 ring-[#dff5f1]" />
                  <div>
                    <p className="text-sm font-bold">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {event.detail}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {event.at} · {event.actor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
      {paymentModal && invoice && (
        <Modal
          title="Registrar pago"
          description={`${invoice.id} · saldo ${formatMoney(invoice.total - invoice.paid, invoice.currency)}`}
          onClose={() => setPaymentModal(false)}
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setPaymentModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  onRegisterPayment(order.id, false);
                  setPaymentModal(false);
                }}
              >
                Abono 50%
              </Button>
              <Button
                onClick={() => {
                  onRegisterPayment(order.id, true);
                  setPaymentModal(false);
                }}
              >
                Pagar saldo total
              </Button>
            </>
          }
        >
          <p className="text-sm leading-6 text-slate-600">
            Selecciona un pago demostrativo. No se procesa dinero ni se conecta
            a bancos.
          </p>
        </Modal>
      )}
      {closeModal && (
        <Modal
          title={`Cerrar ${order.code}`}
          description="El expediente se archivará visualmente en esta sesión."
          onClose={() => setCloseModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setCloseModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                disabled={!readyToClose}
                onClick={() => {
                  onCloseOrder(order.id);
                  setCloseModal(false);
                }}
              >
                Confirmar cierre
              </Button>
            </>
          }
        >
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              {delivered ? (
                <CheckCircle2 className="text-emerald-600" size={17} />
              ) : (
                <AlertTriangle className="text-amber-600" size={17} />
              )}
              Entrega confirmada
            </p>
            <p className="flex items-center gap-2">
              {docsComplete ? (
                <CheckCircle2 className="text-emerald-600" size={17} />
              ) : (
                <AlertTriangle className="text-amber-600" size={17} />
              )}
              Documentos obligatorios completos
            </p>
            <p className="flex items-center gap-2">
              {zeroBalance ? (
                <CheckCircle2 className="text-emerald-600" size={17} />
              ) : (
                <AlertTriangle className="text-amber-600" size={17} />
              )}
              Saldo por cobrar en cero
            </p>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default function OrdersPage(props: Props) {
  const order = props.orders.find((item) => item.id === props.selectedOrderId);
  return order ? (
    <OrderDetail {...props} order={order} />
  ) : (
    <OrdersList orders={props.orders} onSelect={(id) => props.onSelect(id)} />
  );
}
