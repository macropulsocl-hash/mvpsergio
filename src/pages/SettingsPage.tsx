import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  CloudOff,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { Button, Card, PageHeader } from '../components/ui';

export default function SettingsPage({
  onReset,
  notify,
}: {
  onReset: () => void;
  notify: (message: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const simulateLoad = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      notify('Carga simulada completada correctamente.');
    }, 900);
  };
  return (
    <section className="page-enter mx-auto max-w-[1180px]">
      <PageHeader
        eyebrow="Entorno de maqueta"
        title="Configuración"
        description="Controles explícitos para validar estados de interfaz sin integraciones ni persistencia."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <ShieldCheck className="text-[#087f76]" />
          <h2 className="mt-4 font-bold">Seguridad del demo</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Datos ficticios locales
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Sin autenticación real
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Sin correos, firma, SII ni storage
            </p>
            <p className="flex items-center gap-2">
              <CloudOff size={16} className="text-slate-500" />
              Sin conexión a Supabase o APIs
            </p>
          </div>
        </Card>
        <Card className="p-5">
          <RotateCcw className="text-[#087f76]" />
          <h2 className="mt-4 font-bold">Restaurar sesión</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Devuelve pedidos, hitos, tareas, documentos, sets y pagos a su
            estado inicial.
          </p>
          <Button variant="secondary" className="mt-4" onClick={onReset}>
            <RotateCcw size={16} />
            Restaurar datos demo
          </Button>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Estados de interfaz</h2>
          <p className="mt-1 text-sm text-slate-500">
            Comprueba carga, éxito y error simulado.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="secondary"
              loading={loading}
              onClick={simulateLoad}
            >
              {loading ? (
                'Cargando…'
              ) : (
                <>
                  <LoaderCircle size={16} />
                  Simular carga
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                notify('Operación demostrativa completada con éxito.')
              }
            >
              Simular éxito
            </Button>
            <Button variant="danger" onClick={() => setError(true)}>
              Simular error
            </Button>
          </div>
          {error && (
            <div
              role="alert"
              className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <span>
                <strong className="block">
                  No fue posible completar la acción
                </strong>
                Error intencional de demostración. No se perdió información.
              </span>
              <button
                className="ml-auto font-bold"
                onClick={() => setError(false)}
              >
                ×
              </button>
            </div>
          )}
        </Card>
        <Card className="p-5">
          <h2 className="font-bold">Publicación</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            La aplicación está preparada como sitio estático para GitHub Pages.
            El workflow incluido compila y publica solo cuando se habilita Pages
            y se ejecuta desde GitHub.
          </p>
          <div className="mt-4 rounded-xl bg-[#f6f9fa] p-3 font-mono text-xs text-slate-600">
            npm run build → dist/
          </div>
        </Card>
      </div>
    </section>
  );
}
