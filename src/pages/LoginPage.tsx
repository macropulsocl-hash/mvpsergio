import { useState, type SyntheticEvent } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Ship,
} from 'lucide-react';

interface Props {
  onLogin: (username: string, password: string) => boolean;
}

export default function LoginPage({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Ingresa el usuario y la clave de demostración.');
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      const accepted = onLogin(username, password);
      setLoading(false);
      if (!accepted)
        setError('Usuario o clave incorrectos. Revisa los datos de prueba.');
    }, 450);
  };

  const useDemoCredentials = () => {
    setUsername('sergio.demo');
    setPassword('everex2026');
    setError('');
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071b2c] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_15%_20%,#0a9b8e_0,transparent_28%),radial-gradient(circle_at_90%_85%,#123d59_0,transparent_36%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[minmax(0,1fr)_560px]">
        <section className="hidden flex-col justify-between p-12 lg:flex xl:p-16">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0a9b8e] font-black tracking-tighter">
              EX
            </span>
            <span>
              <span className="block text-lg font-bold tracking-[.2em]">
                EVEREX
              </span>
              <span className="block text-[11px] uppercase tracking-[.24em] text-slate-400">
                Operations OS
              </span>
            </span>
          </div>

          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5ed1c7]/30 bg-[#0a9b8e]/10 px-3 py-1.5 text-xs font-semibold text-[#8ce6dd]">
              <ShieldCheck size={15} /> Entorno de demostración
            </span>
            <h1 className="mt-7 max-w-xl text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
              Control de la operación exportadora, de contrato a cierre.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
              Recorre clientes, plantas, productos, documentos, cobranza y el
              avance completo de cada Pedido / FCL.
            </p>
            <div className="mt-9 grid max-w-xl gap-3 sm:grid-cols-2">
              {[
                'Datos ficticios y locales',
                'Flujos editables de prueba',
                'Documentos simulados',
                'Sin servicios externos',
              ].map((item) => (
                <p
                  key={item}
                  className="flex items-center gap-2 text-sm text-slate-300"
                >
                  <CheckCircle2 size={16} className="text-[#5ed1c7]" /> {item}
                </p>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Everex OS · MVP no productivo
          </p>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[#f2f5f7] px-4 py-8 text-[#10202f] sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0a9b8e] font-black tracking-tighter text-white">
                EX
              </span>
              <span>
                <span className="block font-bold tracking-[.18em]">EVEREX</span>
                <span className="block text-[10px] uppercase tracking-[.22em] text-slate-500">
                  Operations OS
                </span>
              </span>
            </div>

            <div className="rounded-[1.4rem] border border-[#dce4e9] bg-white p-6 shadow-[0_28px_70px_rgb(7_27_44/12%)] sm:p-8">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dff5f1] text-[#087f76]">
                <LockKeyhole size={23} />
              </span>
              <h2 className="mt-5 text-2xl font-bold tracking-tight">
                Ingresar al demo
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Usa las credenciales de prueba para explorar Everex OS.
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                <label className="block text-sm font-semibold text-[#17364b]">
                  Usuario
                  <input
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setError('');
                    }}
                    autoComplete="username"
                    className="mt-1.5 w-full rounded-xl border border-[#dce4e9] bg-white px-3.5 py-3 font-normal outline-none transition focus:border-[#0a9b8e]"
                    placeholder="Ingresa el usuario demo"
                  />
                </label>
                <label className="block text-sm font-semibold text-[#17364b]">
                  Clave
                  <span className="relative mt-1.5 block">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError('');
                      }}
                      autoComplete="current-password"
                      className="w-full rounded-xl border border-[#dce4e9] bg-white px-3.5 py-3 pr-12 font-normal outline-none transition focus:border-[#0a9b8e]"
                      placeholder="Ingresa la clave demo"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword ? 'Ocultar clave' : 'Mostrar clave'
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0a9b8e] px-4 text-sm font-bold text-white transition hover:bg-[#087f76] disabled:cursor-wait disabled:opacity-70"
                >
                  {loading ? 'Validando acceso…' : 'Ingresar a Everex OS'}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              <div className="mt-5 rounded-xl border border-[#cde8e4] bg-[#f2fbfa] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#087f76]">
                      Acceso de prueba
                    </p>
                    <p className="mt-2 font-mono text-sm">
                      <span className="text-slate-500">Usuario:</span>{' '}
                      sergio.demo
                    </p>
                    <p className="mt-1 font-mono text-sm">
                      <span className="text-slate-500">Clave:</span> everex2026
                    </p>
                  </div>
                  <Ship size={20} className="text-[#0a9b8e]" />
                </div>
                <button
                  type="button"
                  onClick={useDemoCredentials}
                  className="mt-3 text-xs font-bold text-[#087f76] hover:underline"
                >
                  Completar automáticamente
                </button>
              </div>
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
              Acceso visual sin seguridad real. No se almacenan usuarios ni
              claves.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
