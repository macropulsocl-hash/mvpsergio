import { useEffect, useMemo, useState } from 'react';
import {
  Boxes,
  Building2,
  CalendarDays,
  CircleDollarSign,
  FileStack,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Ship,
  Users,
  X,
} from 'lucide-react';
import {
  clients,
  contracts as contractData,
  initialAlerts,
  initialDocuments,
  initialDocumentSets,
  initialInvoices,
  initialOrders,
  initialTasks,
} from './demo-data';
import type {
  MilestoneKey,
  Order,
  PageId,
  ProcessState,
} from './demo-data/types';
import { Toast } from './components/ui';
import DashboardPage from './pages/DashboardPage';
import DirectoryPage from './pages/DirectoryPage';
import ContractsPage from './pages/ContractsPage';
import OrdersPage from './pages/OrdersPage';
import DocumentsPage from './pages/DocumentsPage';
import CollectionsPage from './pages/CollectionsPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

const DEMO_USERNAME = 'sergio.demo';
const DEMO_PASSWORD = 'everex2026';
const DEMO_SESSION_KEY = 'everex-demo-authenticated';

const navItems: Array<{
  id: PageId;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Tablero', icon: LayoutDashboard },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'plants', label: 'Plantas', icon: Building2 },
  { id: 'products', label: 'Productos', icon: Boxes },
  { id: 'contracts', label: 'Contratos', icon: FileText },
  { id: 'orders', label: 'Pedidos / FCL', icon: Ship },
  { id: 'documents', label: 'Documentos', icon: FileStack },
  { id: 'collections', label: 'Cobranza', icon: CircleDollarSign },
  { id: 'settings', label: 'Configuración', icon: Settings },
];

const clone = <T,>(value: T): T => structuredClone(value);
const eventStamp = () =>
  new Intl.DateTimeFormat('es-CL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => window.sessionStorage.getItem(DEMO_SESSION_KEY) === 'true',
  );
  const [page, setPage] = useState<PageId>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const [orders, setOrders] = useState(() => clone(initialOrders));
  const [contracts, setContracts] = useState(() => clone(contractData));
  const [documents, setDocuments] = useState(() => clone(initialDocuments));
  const [sets, setSets] = useState(() => clone(initialDocumentSets));
  const [alerts, setAlerts] = useState(() => clone(initialAlerts));
  const [tasks, setTasks] = useState(() => clone(initialTasks));
  const [invoices, setInvoices] = useState(() => clone(initialInvoices));
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();
  const [toast, setToast] = useState<{
    message: string;
    kind?: 'success' | 'error';
  } | null>(null);

  const notify = (message: string, kind: 'success' | 'error' = 'success') => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 4200);
  };

  const login = (username: string, password: string) => {
    const accepted =
      username.trim().toLowerCase() === DEMO_USERNAME &&
      password === DEMO_PASSWORD;
    if (accepted) {
      window.sessionStorage.setItem(DEMO_SESSION_KEY, 'true');
      setIsAuthenticated(true);
    }
    return accepted;
  };

  const logout = () => {
    window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    setIsAuthenticated(false);
    setPage('dashboard');
    setSelectedOrderId(undefined);
  };

  const navigate = (nextPage: PageId) => {
    setPage(nextPage);
    setMenuOpen(false);
    if (nextPage !== 'orders') setSelectedOrderId(undefined);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openOrder = (id: string) => {
    const exists = orders.some((order) => order.id === id);
    setPage('orders');
    setSelectedOrderId(exists ? id : undefined);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const searchResults = useMemo(() => {
    const term = globalQuery.trim().toLowerCase();
    if (!term) return [];
    return orders
      .filter((order) => {
        const client = clients.find((item) => item.id === order.clientId);
        return `${order.code} ${client?.name} ${order.destination}`
          .toLowerCase()
          .includes(term);
      })
      .slice(0, 5);
  }, [globalQuery, orders]);

  const addHistory = (order: Order, title: string, detail: string): Order => ({
    ...order,
    history: [
      {
        id: `history-${Date.now()}-${order.id}`,
        at: eventStamp(),
        title,
        detail,
        actor: 'Administrador Everex',
      },
      ...order.history,
    ],
  });

  const advanceOrder = (orderId: string, key: MilestoneKey) => {
    const labels: Record<MilestoneKey, string> = {
      plant: 'FTP confirmado',
      booking: 'Booking registrado',
      instructions: 'Instructivo emitido',
      loading: 'Carga confirmada',
      departure: 'Zarpe confirmado',
      documents: 'Documentación completada',
      arrival: 'Arribo confirmado',
      delivery: 'Entrega confirmada',
      payment: 'Pago registrado',
      closure: 'Pedido cerrado',
    };
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const index = order.milestones.findIndex((item) => item.key === key);
        const completionIndex = key === 'delivery' ? Math.max(index, 7) : index;
        const milestones = order.milestones.map((item, itemIndex) => ({
          ...item,
          state:
            itemIndex <= completionIndex
              ? ('Completado' as const)
              : itemIndex === completionIndex + 1
                ? ('Actual' as const)
                : ('Pendiente' as const),
          date:
            itemIndex <= completionIndex
              ? (item.date ?? eventStamp())
              : item.date,
        }));
        const macroStatus =
          key === 'instructions'
            ? ('En Curso' as const)
            : ['loading', 'departure', 'delivery'].includes(key)
              ? ('Despachado' as const)
              : order.macroStatus;
        const stageMap: Partial<Record<MilestoneKey, string>> = {
          plant: 'Booking pendiente',
          booking: 'Instructivo pendiente',
          instructions: 'Coordinación de carga',
          loading: 'Carga confirmada',
          departure: 'En tránsito · documentos',
          delivery: 'Entrega confirmada',
          payment: 'Pago confirmado',
        };
        let updated: Order = {
          ...order,
          milestones,
          macroStatus,
          stage: stageMap[key] ?? order.stage,
        };
        if (key === 'booking' && order.booking.booking === 'Pendiente')
          updated = {
            ...updated,
            booking: {
              ...order.booking,
              forwarder: 'Compass Freight (demo)',
              carrier: 'Pacific Meridian',
              booking: `PM-${order.code.replace('FCL-', '')}01`,
              vessel: 'MV Demo Pacific',
              voyage: 'DP-2609N',
              destinationPort: order.destination,
              stacking: '18 sep · 08:00–18:00',
              docsCutoff: '17 sep · 14:00',
              reeferCutoff: '18 sep · 05:00',
            },
          };
        if (key === 'loading' && order.loading.container === 'Pendiente')
          updated = {
            ...updated,
            loading: {
              transporter: 'Transporte Frío Demo',
              driver: 'Conductor Demo',
              truckPlate: 'DM-EX-26',
              trailerPlate: 'RF-IQ-18',
              container: 'EVXU 260915-0',
              seal: 'EVX-260915',
              thermograph: 'TG-DEMO-15',
              netKg: order.items.reduce((sum, item) => sum + item.kilograms, 0),
              grossKg: 23750,
              vgmKg: 27700,
              actualAt: eventStamp(),
            },
          };
        return addHistory(
          updated,
          labels[key],
          `Acción simulada completada para ${order.code}.`,
        );
      }),
    );
    const resolveByKey: Partial<Record<MilestoneKey, string[]>> = {
      booking: ['al-booking'],
      instructions: ['al-instruction'],
      departure: ['al-cold'],
    };
    const ids = resolveByKey[key] ?? [];
    setAlerts((current) =>
      current.map((alert) =>
        alert.orderId === orderId && ids.includes(alert.id)
          ? { ...alert, resolved: true }
          : alert,
      ),
    );
    if (key === 'booking')
      setTasks((current) =>
        current.map((task) =>
          task.orderId === orderId && task.title === 'Solicitar booking'
            ? { ...task, completed: true }
            : task,
        ),
      );
    notify(`${labels[key]} en modo demostración.`);
  };

  const updateChecklist = (
    orderId: string,
    list: 'operational' | 'document',
    itemId: string,
    state: ProcessState,
  ) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const key =
          list === 'operational' ? 'operationalChecklist' : 'documentChecklist';
        return {
          ...order,
          [key]: order[key].map((item) =>
            item.id === itemId ? { ...item, state } : item,
          ),
        };
      }),
    );
    notify(`Checklist actualizado a “${state}”.`);
  };

  const completeDocuments = (orderId: string) => {
    setDocuments((current) =>
      current.map((document) =>
        document.orderId === orderId && document.required
          ? {
              ...document,
              state: 'Aprobado',
              version:
                document.version === '—' ? 'Final demo' : document.version,
              updatedAt: eventStamp(),
            }
          : document,
      ),
    );
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const docsIndex = order.milestones.findIndex(
          (item) => item.key === 'documents',
        );
        const milestones = order.milestones.map((item, index) =>
          index <= docsIndex
            ? {
                ...item,
                state: 'Completado' as const,
                date: item.date ?? eventStamp(),
              }
            : index === docsIndex + 1
              ? { ...item, state: 'Actual' as const }
              : item,
        );
        return addHistory(
          { ...order, milestones, stage: 'Arribo y entrega' },
          'Documentación completada',
          'Documentos obligatorios aprobados en modo demostración.',
        );
      }),
    );
    setAlerts((current) =>
      current.map((alert) =>
        alert.orderId === orderId &&
        ['al-cold', 'al-nopic', 'al-coi'].includes(alert.id)
          ? { ...alert, resolved: true }
          : alert,
      ),
    );
    notify('Documentación obligatoria completada en modo demostración.');
  };

  const registerPayment = (orderId: string, full: boolean) => {
    setInvoices((current) =>
      current.map((invoice) => {
        if (invoice.orderId !== orderId) return invoice;
        const remaining = invoice.total - invoice.paid;
        const paid = full
          ? invoice.total
          : Math.min(invoice.total, invoice.paid + remaining / 2);
        return {
          ...invoice,
          paid,
          state: paid >= invoice.total ? 'Pagada' : 'Parcial',
        };
      }),
    );
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const invoice = invoices.find((item) => item.orderId === orderId);
        const willBePaid =
          !invoice ||
          full ||
          invoice.paid + (invoice.total - invoice.paid) / 2 >= invoice.total;
        const milestones = willBePaid
          ? order.milestones.map((item, index) =>
              item.key === 'payment'
                ? { ...item, state: 'Completado' as const, date: eventStamp() }
                : item.key === 'closure'
                  ? { ...item, state: 'Actual' as const }
                  : index < 8
                    ? { ...item, state: 'Completado' as const }
                    : item,
            )
          : order.milestones;
        return addHistory(
          {
            ...order,
            milestones,
            stage: willBePaid ? 'Listo para cierre' : 'Pago parcial registrado',
          },
          willBePaid ? 'Pago total registrado' : 'Pago parcial registrado',
          'Movimiento ficticio aplicado a la factura.',
        );
      }),
    );
    notify(
      full
        ? 'Saldo total pagado en modo demostración.'
        : 'Pago parcial registrado en modo demostración.',
    );
  };

  const closeOrder = (orderId: string) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? addHistory(
              {
                ...order,
                macroStatus: 'Cerrado',
                stage: 'Expediente archivado',
                archived: true,
                milestones: order.milestones.map((item) => ({
                  ...item,
                  state: 'Completado',
                  date: item.date ?? eventStamp(),
                })),
              },
              'Pedido cerrado',
              'Expediente marcado como archivado en modo demostración.',
            )
          : order,
      ),
    );
    notify('Pedido cerrado y expediente archivado visualmente.');
  };

  const emitContract = (contractId: string) => {
    const contract = contracts.find((item) => item.id === contractId);
    if (!contract || contract.state !== 'Borrador') return;
    const generatedIds = ['ord-26101', 'ord-26102'];
    setContracts((current) =>
      current.map((item) =>
        item.id === contractId
          ? {
              ...item,
              code: 'EVX-CT-26042',
              state: 'Emitido',
              orderIds: generatedIds,
              attachments: [...item.attachments, 'EVX-CT-26042-demo.pdf'],
              lines: item.lines.map((line) => ({
                ...line,
                assignedKg: Math.min(line.contractedKg, 22000),
              })),
            }
          : item,
      ),
    );
    const template = initialOrders[0];
    if (template) {
      const generated = generatedIds.map((id, index): Order => {
        const line = contract.lines[index];
        return {
          ...clone(template),
          id,
          code: id.replace('ord-', 'FCL-'),
          contractId,
          clientId: contract.clientId,
          destination: 'Yokohama, Japón',
          incoterm: contract.incoterm,
          items: [
            {
              ...template.items[0]!,
              id: `item-${id}`,
              productId: line?.productId ?? template.items[0]!.productId,
              packaging: line?.packaging ?? template.items[0]!.packaging,
              kilograms: Math.min(line?.contractedKg ?? 22000, 22000),
              organic: false,
            },
          ],
          alertIds: [],
          history: [
            {
              id: `history-${id}`,
              at: eventStamp(),
              title: 'Pedido / FCL creado',
              detail: 'Generado al emitir EVX-CT-26042.',
              actor: 'Administrador Everex',
            },
          ],
        };
      });
      setOrders((current) => [...generated, ...current]);
    }
    notify('Contrato EVX-CT-26042 emitido: PDF y 2 Pedidos / FCL simulados.');
  };

  const approveSet = (setId: string) =>
    setSets((current) =>
      current.map((set) =>
        set.id === setId
          ? { ...set, approvedAt: eventStamp(), state: 'Listo' }
          : set,
      ),
    );
  const sendSet = (setId: string) =>
    setSets((current) =>
      current.map((set) =>
        set.id === setId
          ? { ...set, sentAt: eventStamp(), state: 'Enviado' }
          : set,
      ),
    );
  const toggleTask = (id: string) =>
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  const resetDemo = () => {
    setOrders(clone(initialOrders));
    setContracts(clone(contractData));
    setDocuments(clone(initialDocuments));
    setSets(clone(initialDocumentSets));
    setAlerts(clone(initialAlerts));
    setTasks(clone(initialTasks));
    setInvoices(clone(initialInvoices));
    setSelectedOrderId(undefined);
    setPage('dashboard');
    notify('Sesión restaurada a los datos iniciales.');
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = async () => {
      await context.registerTool(
        {
          name: 'open_order_fcl',
          title: 'Abrir Pedido / FCL',
          description:
            'Abre la ficha visible de un Pedido / FCL ficticio por su código.',
          inputSchema: {
            type: 'object',
            properties: { code: { type: 'string' } },
            required: ['code'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute(input) {
            const value = input as { code?: unknown };
            if (typeof value.code !== 'string')
              throw new Error('code debe ser texto');
            const order = orders.find((item) => item.code === value.code);
            if (!order) throw new Error('Pedido / FCL no encontrado');
            setPage('orders');
            setSelectedOrderId(order.id);
            setMenuOpen(false);
            return { code: order.code, opened: true };
          },
        },
        { signal: lifecycle.signal },
      );
      await context.registerTool(
        {
          name: 'complete_order_milestone_demo',
          title: 'Completar hito demostrativo',
          description:
            'Completa el hito actual de un Pedido / FCL usando el mismo estado local de la interfaz.',
          inputSchema: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              milestone: {
                type: 'string',
                enum: [
                  'plant',
                  'booking',
                  'instructions',
                  'loading',
                  'departure',
                  'delivery',
                ],
              },
            },
            required: ['code', 'milestone'],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input) {
            const value = input as { code?: unknown; milestone?: unknown };
            if (
              typeof value.code !== 'string' ||
              typeof value.milestone !== 'string'
            )
              throw new Error('Entrada inválida');
            const order = orders.find((item) => item.code === value.code);
            const allowed: MilestoneKey[] = [
              'plant',
              'booking',
              'instructions',
              'loading',
              'departure',
              'delivery',
            ];
            if (!order || !allowed.includes(value.milestone as MilestoneKey))
              throw new Error('Pedido o hito inválido');
            advanceOrder(order.id, value.milestone as MilestoneKey);
            return {
              code: order.code,
              milestone: value.milestone,
              completed: true,
            };
          },
        },
        { signal: lifecycle.signal },
      );
    };
    void register().catch(() => undefined);
    return () => lifecycle.abort();
  }, [isAuthenticated, orders]);

  if (!isAuthenticated) return <LoginPage onLogin={login} />;

  return (
    <div className="min-h-screen bg-[#f2f5f7] text-[#10202f] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      {menuOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[270px] flex-col bg-[#071b2c] text-white transition-transform lg:sticky lg:top-0 lg:h-screen lg:w-auto ${menuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex h-[78px] items-center justify-between border-b border-white/10 px-6">
          <button
            className="flex items-center gap-3 text-left"
            onClick={() => navigate('dashboard')}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#0a9b8e] font-black tracking-tighter">
              EX
            </span>
            <span>
              <span className="block text-[17px] font-bold tracking-[.18em]">
                EVEREX
              </span>
              <span className="block text-[10px] uppercase tracking-[.24em] text-slate-400">
                Operations OS
              </span>
            </span>
          </button>
          <button
            className="rounded-lg p-2 text-slate-300 lg:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar navegación"
          >
            <X size={20} />
          </button>
        </div>
        <nav
          className="flex-1 space-y-1 overflow-y-auto px-3 py-5"
          aria-label="Navegación principal"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${page === item.id ? 'bg-white text-[#071b2c] shadow-lg' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
              >
                <Icon size={19} strokeWidth={1.8} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="m-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#63d7cc]">
            Entorno seguro
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Datos ficticios · sin conexiones externas
          </p>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 border-t border-white/10 pt-3 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <LogOut size={15} /> Cerrar sesión demo
          </button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-[78px] items-center gap-3 border-b border-[#dce4e9] bg-white/95 px-4 backdrop-blur md:px-7">
          <button
            className="rounded-xl border border-[#dce4e9] p-2.5 text-slate-600 lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir navegación"
          >
            <Menu size={20} />
          </button>
          <div className="relative hidden max-w-lg flex-1 sm:block">
            <label className="relative block">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={globalQuery}
                onChange={(event) => setGlobalQuery(event.target.value)}
                className="w-full rounded-xl border border-[#dce4e9] bg-[#f7f9fa] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0a9b8e] focus:bg-white"
                placeholder="Buscar pedido, cliente o destino…"
                aria-label="Buscar globalmente"
              />
            </label>
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-[#dce4e9] bg-white p-2 shadow-xl">
                {searchResults.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => {
                      openOrder(order.id);
                      setGlobalQuery('');
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-[#edf7f6]"
                  >
                    <span>
                      <span className="block text-sm font-bold text-[#087f76]">
                        {order.code}
                      </span>
                      <span className="text-xs text-slate-500">
                        {order.destination}
                      </span>
                    </span>
                    <span className="text-xs text-slate-400">
                      {order.macroStatus}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="ml-auto hidden items-center gap-2 text-sm text-slate-500 md:flex">
            <CalendarDays size={17} />
            15 septiembre 2026
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#fff7e8] px-3 py-1.5 text-xs font-semibold text-[#8a5c14]">
            <span className="h-2 w-2 rounded-full bg-[#e6a323]" />
            Modo demostración
          </span>
          <button
            onClick={logout}
            className="hidden items-center gap-2 border-l border-[#dce4e9] pl-4 text-left xl:flex"
            title="Cerrar sesión de demostración"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#dff5f1] text-sm font-bold text-[#087f76]">
              AE
            </span>
            <span>
              <span className="block text-sm font-semibold">
                Sergio · Administrador
              </span>
              <span className="block text-[11px] text-slate-400">
                Cerrar sesión
              </span>
            </span>
          </button>
        </header>
        <main className="px-4 py-6 md:px-7 md:py-7">
          {page === 'dashboard' && (
            <DashboardPage
              orders={orders}
              alerts={alerts}
              tasks={tasks}
              onNavigate={navigate}
              onOpenOrder={openOrder}
              onToggleTask={toggleTask}
            />
          )}
          {(page === 'clients' || page === 'plants' || page === 'products') && (
            <DirectoryPage page={page} notify={notify} />
          )}
          {page === 'contracts' && (
            <ContractsPage
              contracts={contracts}
              onEmit={emitContract}
              onOpenOrder={openOrder}
              notify={notify}
            />
          )}
          {page === 'orders' && (
            <OrdersPage
              orders={orders}
              selectedOrderId={selectedOrderId}
              documents={documents}
              sets={sets}
              alerts={alerts}
              invoices={invoices}
              onSelect={setSelectedOrderId}
              onAdvance={advanceOrder}
              onChecklist={updateChecklist}
              onCompleteDocuments={completeDocuments}
              onRegisterPayment={registerPayment}
              onCloseOrder={closeOrder}
              onApproveSet={approveSet}
              onSendSet={sendSet}
              notify={notify}
            />
          )}
          {page === 'documents' && (
            <DocumentsPage
              documents={documents}
              orders={orders}
              notify={notify}
            />
          )}
          {page === 'collections' && (
            <CollectionsPage
              invoices={invoices}
              orders={orders}
              onPayment={registerPayment}
              notify={notify}
            />
          )}
          {page === 'settings' && (
            <SettingsPage onReset={resetDemo} notify={notify} />
          )}
        </main>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;
