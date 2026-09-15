import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import { AlertCircle, CheckCircle2, LoaderCircle, X } from 'lucide-react';
import type { MacroStatus, ProcessState } from '../demo-data/types';

type StatusValue =
  | MacroStatus
  | ProcessState
  | 'Activo'
  | 'En revisión'
  | 'Habilitada'
  | 'Condicional'
  | 'Vigente'
  | 'Por vencer'
  | 'Vencido'
  | 'Emitido'
  | 'Casi completo'
  | 'Preparando'
  | 'Listo'
  | 'Pagada'
  | 'Parcial';

const toneMap: Record<string, string> = {
  Pendiente: 'bg-amber-50 text-amber-800 ring-amber-200',
  'En proceso': 'bg-sky-50 text-sky-800 ring-sky-200',
  'En Curso': 'bg-sky-50 text-sky-800 ring-sky-200',
  Recibido: 'bg-cyan-50 text-cyan-800 ring-cyan-200',
  Borrador: 'bg-slate-100 text-slate-700 ring-slate-200',
  'En revisión': 'bg-violet-50 text-violet-800 ring-violet-200',
  Aprobado: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Enviado: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  Despachado: 'bg-violet-50 text-violet-800 ring-violet-200',
  Cerrado: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Activo: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Habilitada: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Condicional: 'bg-amber-50 text-amber-800 ring-amber-200',
  Vigente: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  'Por vencer': 'bg-amber-50 text-amber-800 ring-amber-200',
  Vencido: 'bg-red-50 text-red-800 ring-red-200',
  Emitido: 'bg-sky-50 text-sky-800 ring-sky-200',
  'Casi completo': 'bg-violet-50 text-violet-800 ring-violet-200',
  Preparando: 'bg-amber-50 text-amber-800 ring-amber-200',
  Listo: 'bg-teal-50 text-teal-800 ring-teal-200',
  Pagada: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  Parcial: 'bg-amber-50 text-amber-800 ring-amber-200',
};

export function StatusBadge({ status }: { status: StatusValue }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${toneMap[status] ?? toneMap.Borrador}`}
    >
      {status}
    </span>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  loading,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-[#0a9b8e] text-white hover:bg-[#087f76] border-transparent',
    secondary: 'bg-white text-[#17364b] hover:bg-[#f5f9fa] border-[#d8e2e7]',
    ghost:
      'bg-transparent text-[#435667] hover:bg-[#edf3f5] border-transparent',
    danger: 'bg-[#b43a42] text-white hover:bg-[#982f36] border-transparent',
  };
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading ? <LoaderCircle size={17} className="animate-spin" /> : children}
    </button>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#dce4e9] bg-white shadow-[0_8px_24px_rgb(13_37_55/5%)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-1 text-sm font-semibold text-[#087f76]">{eyebrow}</p>
        <h1 className="text-2xl font-bold tracking-tight md:text-[30px]">
          {title}
        </h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e2e9ec] px-5 py-4">
      <div>
        <h2 className="font-bold">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Buscar…',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">Buscar</span>
      <svg
        className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#dce4e9] bg-[#f7f9fa] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#0a9b8e] focus:bg-white"
        placeholder={placeholder}
      />
    </label>
  );
}

export function EmptyState({
  title = 'Sin resultados',
  description = 'Prueba ajustando los filtros o el término de búsqueda.',
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="grid min-h-52 place-items-center p-8 text-center">
      <div>
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-400">
          <AlertCircle size={20} />
        </span>
        <h3 className="mt-3 font-semibold">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function Modal({
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const widths = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };
  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-[#061522]/60 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <dialog
        open
        aria-labelledby="modal-title"
        className={`relative m-0 max-h-[calc(100vh-2rem)] w-full overflow-hidden rounded-2xl bg-white p-0 text-[#10202f] shadow-2xl ${widths[size]}`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#e2e9ec] px-5 py-4">
          <div>
            <h2 id="modal-title" className="text-lg font-bold">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar diálogo"
          >
            <X size={20} />
          </button>
        </header>
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto p-5">
          {children}
        </div>
        {footer && (
          <footer className="flex flex-wrap justify-end gap-2 border-t border-[#e2e9ec] bg-[#fafcfc] px-5 py-4">
            {footer}
          </footer>
        )}
      </dialog>
    </div>
  );
}

export function Toast({
  message,
  kind = 'success',
  onClose,
}: {
  message: string;
  kind?: 'success' | 'error';
  onClose: () => void;
}) {
  return (
    <output
      className={`fixed bottom-5 right-5 z-[90] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl ${kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900' : 'border-red-200 bg-red-50 text-red-900'}`}
    >
      {kind === 'success' ? (
        <CheckCircle2 size={19} />
      ) : (
        <AlertCircle size={19} />
      )}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} aria-label="Cerrar aviso">
        <X size={17} />
      </button>
    </output>
  );
}

export function Field({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold leading-6 text-[#17364b]">
        {value}
      </dd>
    </div>
  );
}

export function InputField({
  label,
  required,
  error,
  ...props
}: {
  label: string;
  required?: boolean;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-semibold text-[#17364b]">
      {label}
      {required && <span className="text-red-600"> *</span>}
      <input
        {...props}
        className={`mt-1.5 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-normal outline-none ${error ? 'border-red-400' : 'border-[#dce4e9] focus:border-[#0a9b8e]'}`}
      />
      {error && (
        <span className="mt-1 block text-xs font-normal text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

export function formatKg(value: number) {
  return `${new Intl.NumberFormat('es-CL', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value)} kg`;
}

export function formatMoney(value: number, currency: 'USD' | 'EUR' = 'USD') {
  return `${currency} ${new Intl.NumberFormat('es-CL', { minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(value)}`;
}
