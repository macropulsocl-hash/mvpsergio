import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  PackageCheck,
  Ship,
} from 'lucide-react';
import { clients } from '../demo-data';
import type {
  Alert,
  MacroStatus,
  Order,
  PageId,
  Task,
} from '../demo-data/types';
import {
  Card,
  EmptyState,
  PageHeader,
  StatusBadge,
  formatKg,
} from '../components/ui';

interface Props {
  orders: Order[];
  alerts: Alert[];
  tasks: Task[];
  onNavigate: (page: PageId) => void;
  onOpenOrder: (id: string) => void;
  onToggleTask: (id: string) => void;
}

export default function DashboardPage({
  orders,
  alerts,
  tasks,
  onNavigate,
  onOpenOrder,
  onToggleTask,
}: Props) {
  const [filter, setFilter] = useState<MacroStatus | 'Todos'>('Todos');
  const [query, setQuery] = useState('');
  const visible = useMemo(
    () =>
      orders.filter((order) => {
        const client = clients.find((item) => item.id === order.clientId);
        const term = query.trim().toLowerCase();
        return (
          (filter === 'Todos' || order.macroStatus === filter) &&
          (!term ||
            `${order.code} ${client?.name} ${order.destination}`
              .toLowerCase()
              .includes(term))
        );
      }),
    [filter, orders, query],
  );
  const activeAlerts = alerts.filter((item) => !item.resolved);
  const totalKg = orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce((subtotal, item) => subtotal + item.kilograms, 0),
    0,
  );
  const dispatchedKg = orders
    .filter((order) => ['Despachado', 'Cerrado'].includes(order.macroStatus))
    .reduce(
      (sum, order) =>
        sum +
        order.items.reduce((subtotal, item) => subtotal + item.kilograms, 0),
      0,
    );

  return (
    <section className="page-enter mx-auto max-w-[1560px]">
      <PageHeader
        eyebrow="Control operativo"
        title="Tablero de Pedidos / FCL"
        description="Prioridades, vencimientos y próximos hitos de la operación exportadora."
        actions={
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0a9b8e] px-4 text-sm font-semibold text-white hover:bg-[#087f76]"
            onClick={() => onNavigate('orders')}
          >
            <Ship size={17} />
            Ver todos los pedidos
          </button>
        }
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(
          [
            ['Pendiente', ClipboardCheck, 'Sin instructivo emitido'],
            ['En Curso', Clock3, 'Instructivo emitido'],
            ['Despachado', PackageCheck, 'Carga confirmada'],
            ['Cerrado', Archive, 'Pagados y archivados'],
          ] as const
        ).map(([status, Icon, note]) => (
          <button
            key={status}
            onClick={() => setFilter(filter === status ? 'Todos' : status)}
            className={`group rounded-2xl border bg-white p-4 text-left shadow-[0_8px_24px_rgb(13_37_55/5%)] transition hover:-translate-y-0.5 hover:border-[#93d9d2] ${filter === status ? 'border-[#0a9b8e] ring-2 ring-[#0a9b8e]/10' : 'border-[#dce4e9]'}`}
          >
            <div className="flex items-start justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#edf7f6] text-[#087f76]">
                <Icon size={20} />
              </span>
              <ChevronRight
                className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0a9b8e]"
                size={18}
              />
            </div>
            <div className="mt-5 flex items-baseline gap-2">
              <strong className="text-3xl tracking-tight">
                {orders.filter((order) => order.macroStatus === status).length}
              </strong>
              <span className="text-sm font-semibold">{status}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{note}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            'Kilos contratados',
            formatKg(totalKg + 22000),
            '+8,4% vs. mes anterior',
          ],
          [
            'Kilos despachados',
            formatKg(dispatchedKg),
            `${Math.round((dispatchedKg / (totalKg + 22000)) * 100)}% del total`,
          ],
          ['Documentos pendientes', '7', '3 críticos para zarpe'],
          ['Saldo por cobrar', 'USD 16.500,000', '1 factura parcial'],
        ].map(([label, value, note]) => (
          <Card key={label} className="px-4 py-3.5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{note}</p>
          </Card>
        ))}
      </div>
      <div className="mt-5 grid gap-5 2xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce4e9] px-5 py-4">
            <div>
              <h2 className="font-bold">Pedidos activos</h2>
              <p className="text-xs text-slate-500">
                {visible.length} resultados · filtro {filter.toLowerCase()}
              </p>
            </div>
            <div className="flex gap-2">
              <input
                aria-label="Buscar pedidos activos"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 rounded-lg border border-[#dce4e9] px-3 py-2 text-sm"
                placeholder="Buscar…"
              />
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value as MacroStatus | 'Todos')
                }
                className="rounded-lg border border-[#dce4e9] bg-white px-3 py-2 text-sm"
                aria-label="Filtrar por estado"
              >
                <option>Todos</option>
                <option>Pendiente</option>
                <option>En Curso</option>
                <option>Despachado</option>
                <option>Cerrado</option>
              </select>
            </div>
          </div>
          {visible.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[780px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#f7f9fa] text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-3 font-semibold">Pedido / FCL</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Destino</th>
                    <th className="px-4 py-3 font-semibold">ETD / ETA</th>
                    <th className="px-4 py-3 font-semibold">Kilos</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7edef]">
                  {visible.map((order) => {
                    const client = clients.find(
                      (item) => item.id === order.clientId,
                    );
                    return (
                      <tr
                        key={order.id}
                        onClick={() => onOpenOrder(order.id)}
                        className="cursor-pointer text-sm transition hover:bg-[#f6fbfa]"
                      >
                        <td className="px-5 py-4">
                          <span className="font-bold text-[#087f76]">
                            {order.code}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {order.stage}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {client?.name}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {order.destination}
                        </td>
                        <td className="px-4 py-4">
                          <span className="block">{order.dates.etd}</span>
                          <span className="text-xs text-slate-400">
                            ETA {order.dates.eta}
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
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <div className="space-y-5">
          <Card className="overflow-hidden border-[#f0d9db]">
            <div className="flex items-center justify-between border-b border-[#f0d9db] px-5 py-4">
              <h2 className="flex items-center gap-2 font-bold">
                <AlertTriangle className="text-[#b43a42]" size={18} />
                Alertas críticas
              </h2>
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-bold text-red-700">
                {activeAlerts.length}
              </span>
            </div>
            <div className="divide-y divide-[#f1e5e6]">
              {activeAlerts.slice(0, 5).map((alert) => (
                <button
                  key={alert.id}
                  className="w-full p-4 text-left hover:bg-red-50/40"
                  onClick={() => onOpenOrder(alert.orderId)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold">{alert.title}</p>
                    <span className="shrink-0 rounded-md bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">
                      {alert.dueLabel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {alert.detail}
                  </p>
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <div className="border-b border-[#dce4e9] px-5 py-4">
              <h2 className="font-bold">Tareas del día</h2>
            </div>
            <div className="space-y-1 p-3">
              {tasks
                .filter((task) => !task.completed)
                .slice(0, 4)
                .map((task) => (
                  <label
                    key={task.id}
                    aria-label={task.title}
                    className="flex cursor-pointer gap-3 rounded-xl p-2.5 hover:bg-[#f6f9fa]"
                  >
                    <input
                      checked={task.completed}
                      onChange={() => onToggleTask(task.id)}
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-[#0a9b8e]"
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {task.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-500">
                        {task.owner} · {task.dueLabel}
                      </span>
                    </span>
                  </label>
                ))}
            </div>
          </Card>
          <Card>
            <div className="border-b border-[#dce4e9] px-5 py-4">
              <h2 className="font-bold">Próximos 5 días</h2>
            </div>
            <div className="space-y-3 p-4">
              {orders
                .filter((order) => order.macroStatus !== 'Cerrado')
                .slice(0, 3)
                .map((order, index) => (
                  <button
                    onClick={() => onOpenOrder(order.id)}
                    key={order.id}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">
                      {16 + index}
                      <small className="ml-0.5">sep</small>
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">
                        {order.code} ·{' '}
                        {index === 0 ? 'FTP' : index === 1 ? 'ETD' : 'Cut-off'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.destination}
                      </span>
                    </span>
                  </button>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
