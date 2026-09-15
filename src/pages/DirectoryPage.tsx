import { useMemo, useState } from 'react';
import {
  Building2,
  Globe2,
  Leaf,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  Users,
} from 'lucide-react';
import { clients, plants, products } from '../demo-data';
import type { Client, PageId, Plant, Product } from '../demo-data/types';
import {
  Button,
  Card,
  EmptyState,
  Field,
  InputField,
  Modal,
  PageHeader,
  SearchField,
  StatusBadge,
} from '../components/ui';

interface Props {
  page: Extract<PageId, 'clients' | 'plants' | 'products'>;
  notify: (message: string) => void;
}

type DirectoryRecord = Client | Plant | Product;
const recordName = (record: DirectoryRecord) =>
  'name' in record ? record.name : record.species;

const copy = {
  clients: {
    eyebrow: 'Maestros comerciales',
    title: 'Clientes',
    description:
      'Condiciones comerciales, contactos y requisitos documentales por destino.',
  },
  plants: {
    eyebrow: 'Red productiva',
    title: 'Plantas',
    description:
      'Habilitaciones, contactos y vigencia documental de plantas chilenas.',
  },
  products: {
    eyebrow: 'Catálogo IQF',
    title: 'Productos',
    description:
      'Especies, programas, condición y especificación del producto maestro.',
  },
};

function ContactList({ contacts }: { contacts: Client['contacts'] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="rounded-xl border border-[#e2e9ec] p-3.5"
        >
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#087f76]">
            {contact.role}
          </span>
          <p className="mt-1.5 text-sm font-bold">{contact.name}</p>
          <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <Mail size={13} />
            {contact.email}
          </p>
          <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <Phone size={13} />
            {contact.phone}
          </p>
        </div>
      ))}
    </div>
  );
}

function ClientDetail({ client }: { client: Client }) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Razón social" value={client.name} wide />
        <Field label="País" value={client.country} />
        <Field label="Identificación tributaria" value={client.taxId} />
        <Field label="Dirección" value={client.address} wide />
        <Field label="Condición de pago" value={client.paymentTerm} />
        <Field label="Días de crédito" value={`${client.creditDays} días`} />
      </dl>
      <div>
        <h3 className="mb-3 text-sm font-bold">Contactos por categoría</h3>
        <ContactList contacts={client.contacts} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-[#f6f9fa] p-4">
          <h3 className="text-sm font-bold">Requisitos documentales</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
            {client.documentRequirements.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-[#f6f9fa] p-4">
          <h3 className="text-sm font-bold">Análisis de calidad</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">
            {client.qualityRequirements.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function PlantDetail({
  plant,
  notify,
}: {
  plant: Plant;
  notify: (message: string) => void;
}) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Razón social" value={plant.name} wide />
        <Field
          label="Ciudad / región"
          value={`${plant.city}, ${plant.region}`}
        />
        <Field label="RUT" value={plant.taxId} />
        <Field label="Código exportador" value={plant.exportCode} />
        <Field label="Estado" value={<StatusBadge status={plant.status} />} />
      </dl>
      <div>
        <h3 className="mb-3 text-sm font-bold">Contactos</h3>
        <ContactList contacts={plant.contacts} />
      </div>
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold">Documentos permanentes</h3>
          <span className="text-xs text-slate-500">Vigencia revisada hoy</span>
        </div>
        <div className="overflow-x-auto rounded-xl border border-[#e2e9ec]">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-[#f6f9fa] text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Documento</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e9ec]">
              {plant.permanentDocuments.map((document) => (
                <tr key={document.id}>
                  <td className="px-4 py-3 font-semibold">{document.name}</td>
                  <td className="px-4 py-3">{document.expiresAt}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={document.state} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {document.state !== 'Vigente' && (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          notify(
                            `Solicitud de renovación simulada para ${document.name}.`,
                          )
                        }
                      >
                        <RefreshCw size={15} />
                        Solicitar renovación
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="space-y-5">
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Código" value={product.code} />
        <Field label="Programa" value={product.program} />
        <Field label="Especie" value={product.species} />
        <Field
          label="Condición"
          value={
            <span className="flex items-center gap-2">
              {product.condition === 'Orgánico' && (
                <Leaf size={16} className="text-emerald-600" />
              )}
              {product.condition}
            </span>
          }
        />
        <Field label="Tipo" value={product.type} />
        <Field label="Calibre" value={product.caliber} />
        <Field label="Calidad" value={product.quality} />
        <Field
          label="Estado"
          value={
            <StatusBadge
              status={product.status === 'Activo' ? 'Activo' : 'Borrador'}
            />
          }
        />
      </dl>
      <div className="rounded-xl border border-[#bfe5df] bg-[#f0fbf9] p-4 text-sm text-[#315e5a]">
        <strong className="block text-[#087f76]">
          Packaging en la línea contractual
        </strong>
        <span className="mt-1 block">
          El envase y la presentación se acuerdan por cliente y contrato. No
          forman parte del producto maestro.
        </span>
      </div>
    </div>
  );
}

export default function DirectoryPage({ page, notify }: Props) {
  const dataset: DirectoryRecord[] =
    page === 'clients' ? clients : page === 'plants' ? plants : products;
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Todos');
  const [selectedId, setSelectedId] = useState(dataset[0]?.id ?? '');
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const filtered = useMemo(
    () =>
      dataset.filter((record) => {
        const searchable =
          page === 'products'
            ? `${(record as Product).code} ${(record as Product).species} ${(record as Product).condition}`
            : `${recordName(record)} ${page === 'clients' ? (record as Client).country : (record as Plant).city}`;
        const recordStatus = (record as Client | Plant | Product).status;
        return (
          searchable.toLowerCase().includes(query.toLowerCase()) &&
          (status === 'Todos' || recordStatus === status)
        );
      }),
    [dataset, page, query, status],
  );
  const selected =
    dataset.find((record) => record.id === selectedId) ?? filtered[0];
  const statusOptions =
    page === 'clients'
      ? ['Todos', 'Activo', 'En revisión']
      : page === 'plants'
        ? ['Todos', 'Habilitada', 'Condicional']
        : ['Todos', 'Activo', 'Temporada cerrada'];
  const Icon =
    page === 'clients' ? Users : page === 'plants' ? Building2 : Package;

  const createRecord = () => {
    if (!name.trim()) {
      setError('Ingresa un nombre para continuar.');
      return;
    }
    notify(
      `${page === 'clients' ? 'Cliente' : page === 'plants' ? 'Planta' : 'Producto'} “${name}” creado solo para esta demostración.`,
    );
    setName('');
    setError('');
    setShowNew(false);
  };

  return (
    <section className="page-enter mx-auto max-w-[1560px]">
      <PageHeader
        {...copy[page]}
        actions={
          <Button onClick={() => setShowNew(true)}>
            <Plus size={17} />
            Nuevo registro
          </Button>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="h-fit overflow-hidden">
          <div className="space-y-3 border-b border-[#e2e9ec] p-4">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder={`Buscar ${copy[page].title.toLowerCase()}…`}
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-[#dce4e9] bg-white px-3.5 py-2.5 text-sm"
              aria-label="Filtrar por estado"
            >
              {statusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="max-h-[620px] divide-y divide-[#e7edef] overflow-y-auto p-2">
              {filtered.map((record) => {
                const subtitle =
                  page === 'clients'
                    ? (record as Client).country
                    : page === 'plants'
                      ? `${(record as Plant).city}, ${(record as Plant).region}`
                      : `${(record as Product).code} · ${(record as Product).condition}`;
                return (
                  <button
                    key={record.id}
                    onClick={() => setSelectedId(record.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${selected?.id === record.id ? 'bg-[#edf7f6]' : 'hover:bg-[#f6f9fa]'}`}
                  >
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${selected?.id === record.id ? 'bg-white text-[#087f76]' : 'bg-slate-100 text-slate-500'}`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold">
                        {page === 'products'
                          ? (record as Product).species
                          : recordName(record)}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500">
                        {subtitle}
                      </span>
                    </span>
                    <StatusBadge
                      status={
                        (record as Client | Plant).status as
                          | 'Activo'
                          | 'En revisión'
                          | 'Habilitada'
                          | 'Condicional'
                      }
                    />
                  </button>
                );
              })}
            </div>
          )}
        </Card>
        <Card className="overflow-hidden">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e2e9ec] bg-[#fbfcfc] px-5 py-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#dff5f1] text-[#087f76]">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h2 className="text-lg font-bold">
                      {page === 'products'
                        ? (selected as Product).species
                        : recordName(selected)}
                    </h2>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500">
                      {page === 'clients' ? (
                        <>
                          <Globe2 size={14} />
                          {(selected as Client).country}
                        </>
                      ) : page === 'plants' ? (
                        <>
                          <MapPin size={14} />
                          {(selected as Plant).city}
                        </>
                      ) : (
                        <>{(selected as Product).code}</>
                      )}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() =>
                    notify(
                      'Edición simulada: los cambios no se guardan al recargar.',
                    )
                  }
                >
                  Editar ficha
                </Button>
              </div>
              <div className="p-5">
                {page === 'clients' ? (
                  <ClientDetail client={selected as Client} />
                ) : page === 'plants' ? (
                  <PlantDetail plant={selected as Plant} notify={notify} />
                ) : (
                  <ProductDetail product={selected as Product} />
                )}
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </Card>
      </div>
      {showNew && (
        <Modal
          title={`Nuevo ${page === 'clients' ? 'cliente' : page === 'plants' ? 'planta' : 'producto'}`}
          description="Registro local para explorar el flujo. No se envía información."
          onClose={() => {
            setShowNew(false);
            setError('');
          }}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowNew(false)}>
                Cancelar
              </Button>
              <Button onClick={createRecord}>Crear registro demo</Button>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <InputField
              label="Nombre"
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError('');
              }}
              error={error}
              placeholder="Nombre ficticio"
            />
            <InputField
              label={
                page === 'products'
                  ? 'Código'
                  : page === 'clients'
                    ? 'País'
                    : 'Ciudad'
              }
              placeholder="Dato demostrativo"
            />
            <InputField
              label="Identificación"
              placeholder="Código local ficticio"
            />
            <InputField
              label="Contacto principal"
              type="email"
              placeholder="contacto@example.com"
            />
          </div>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800">
            Los datos de este diálogo viven solo en la sesión actual. Al
            recargar se restauran los registros iniciales.
          </p>
        </Modal>
      )}
    </section>
  );
}
