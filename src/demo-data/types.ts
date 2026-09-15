export type PageId =
  | 'dashboard'
  | 'clients'
  | 'plants'
  | 'products'
  | 'contracts'
  | 'orders'
  | 'documents'
  | 'collections'
  | 'settings';

export type MacroStatus = 'Pendiente' | 'En Curso' | 'Despachado' | 'Cerrado';
export type ProcessState =
  | 'Pendiente'
  | 'En proceso'
  | 'Recibido'
  | 'Borrador'
  | 'En revisión'
  | 'Aprobado'
  | 'Enviado';
export type ContractState = 'Borrador' | 'Emitido' | 'Casi completo';
export type ContactRole = 'Comercial' | 'Logística' | 'Documentación/Cobranza';
export type PaymentTerm = 'CAD Directo' | 'CAD Bancario' | 'Crédito Directo';

export interface Contact {
  id: string;
  name: string;
  role: ContactRole;
  email: string;
  phone: string;
}

export interface Client {
  id: string;
  name: string;
  country: string;
  taxId: string;
  address: string;
  paymentTerm: PaymentTerm;
  creditDays: number;
  contacts: Contact[];
  documentRequirements: string[];
  qualityRequirements: string[];
  status: 'Activo' | 'En revisión';
}

export interface PermanentDocument {
  id: string;
  name: string;
  expiresAt: string;
  state: 'Vigente' | 'Por vencer' | 'Vencido';
}

export interface Plant {
  id: string;
  name: string;
  city: string;
  region: string;
  taxId: string;
  exportCode: string;
  contacts: Contact[];
  permanentDocuments: PermanentDocument[];
  status: 'Habilitada' | 'Condicional';
}

export interface Product {
  id: string;
  code: string;
  program: string;
  species: string;
  condition: 'Convencional' | 'Orgánico';
  type: string;
  caliber: string;
  quality: string;
  status: 'Activo' | 'Temporada cerrada';
}

export interface ContractLine {
  id: string;
  productId: string;
  packaging: string;
  contractedKg: number;
  assignedKg: number;
  pricePerKg: number;
}

export interface Contract {
  id: string;
  code: string;
  clientId: string;
  po: string;
  incoterm: string;
  currency: 'USD' | 'EUR';
  issuedAt: string;
  state: ContractState;
  lines: ContractLine[];
  orderIds: string[];
  attachments: string[];
}

export interface OrderItem {
  id: string;
  productId: string;
  plantId: string;
  packaging: string;
  kilograms: number;
  pallets: number;
  boxes: number;
  lot: string;
  organic: boolean;
}

export interface OrderDates {
  frc: string;
  ftp: string;
  etd: string;
  eta: string;
}

export interface BookingDetails {
  forwarder: string;
  carrier: string;
  booking: string;
  vessel: string;
  voyage: string;
  stacking: string;
  originPort: string;
  destinationPort: string;
  docsCutoff: string;
  reeferCutoff: string;
  temperature: string;
  ventilation: string;
}

export interface LoadingDetails {
  transporter: string;
  driver: string;
  truckPlate: string;
  trailerPlate: string;
  container: string;
  seal: string;
  thermograph: string;
  netKg: number;
  grossKg: number;
  vgmKg: number;
  actualAt: string;
}

export type MilestoneKey =
  | 'plant'
  | 'booking'
  | 'instructions'
  | 'loading'
  | 'departure'
  | 'documents'
  | 'arrival'
  | 'delivery'
  | 'payment'
  | 'closure';

export interface Milestone {
  key: MilestoneKey;
  label: string;
  state: 'Completado' | 'Actual' | 'Pendiente';
  date?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  owner: string;
  dueAt: string;
  state: ProcessState;
}

export interface HistoryEvent {
  id: string;
  at: string;
  title: string;
  detail: string;
  actor: string;
}

export interface Order {
  id: string;
  code: string;
  contractId: string;
  clientId: string;
  destination: string;
  incoterm: string;
  macroStatus: MacroStatus;
  stage: string;
  dates: OrderDates;
  items: OrderItem[];
  booking: BookingDetails;
  loading: LoadingDetails;
  milestones: Milestone[];
  operationalChecklist: ChecklistItem[];
  documentChecklist: ChecklistItem[];
  alertIds: string[];
  customsBroker?: string;
  invoiceId?: string;
  archived: boolean;
  history: HistoryEvent[];
}

export interface DemoDocument {
  id: string;
  orderId: string;
  name: string;
  kind: 'Externo' | 'Interno';
  state: ProcessState;
  required: boolean;
  version: string;
  updatedAt: string;
  setIds: string[];
}

export interface DocumentSet {
  id: string;
  orderId: string;
  name:
    | 'Set Cliente'
    | 'Set Agencia de Aduanas'
    | 'Set Banco/Cobranza'
    | 'Set Customs Broker';
  documentIds: string[];
  state: 'Preparando' | 'Listo' | 'Enviado';
  recipients: string[];
  approvedAt?: string;
  sentAt?: string;
}

export interface Alert {
  id: string;
  orderId: string;
  title: string;
  detail: string;
  severity: 'Crítica' | 'Alta' | 'Media';
  dueLabel: string;
  resolved: boolean;
}

export interface Task {
  id: string;
  orderId: string;
  title: string;
  owner: string;
  dueLabel: string;
  completed: boolean;
}

export interface Invoice {
  id: string;
  code: string;
  orderId: string;
  clientId: string;
  issuedAt: string;
  dueAt: string;
  paymentTerm: PaymentTerm;
  currency: 'USD' | 'EUR';
  total: number;
  paid: number;
  state: 'Pendiente' | 'Parcial' | 'Pagada';
}
