// ─── Shared Data Types ────────────────────────────────────────────────────────

export interface IAddress {
  name: string
  street1: string
  street2?: string
  city: string
  state: string
  zip: string
  country: string // ISO 3166-1 alpha-2, e.g. "NG", "US"
  phone?: string
  email?: string
}

export interface IParcel {
  /** Weight in kg */
  weightKg: number
  /** Length in cm */
  lengthCm: number
  /** Width in cm */
  widthCm: number
  /** Height in cm */
  heightCm: number
}

// ─── Rate Quotes ──────────────────────────────────────────────────────────────

export interface IGetRatesPayload {
  from: IAddress
  to: IAddress
  parcel: IParcel
}

export interface IShipmentRate {
  /** Unique rate ID from the carrier/provider */
  rateId: string
  /** Human-readable carrier name, e.g. "DHL Express" */
  carrier: string
  /** Service level, e.g. "Priority Mail" */
  service: string
  /** Cost in the seller's base currency (NGN) */
  amountNGN: number
  /** Estimated delivery time description, e.g. "3-5 business days" */
  estimatedDays: string
  /** Which provider returned this rate */
  provider: 'sendbox' | 'shippo'
}

// ─── Create Shipment ──────────────────────────────────────────────────────────

export interface ICreateShipmentPayload {
  /** Rate ID returned from getRates — used to book the exact rate */
  rateId: string
  from: IAddress
  to: IAddress
  parcel: IParcel
  /** Your order reference */
  orderId: number
  /** Item description for customs */
  description?: string
  /** Declared value in NGN */
  valueNGN?: number
}

export interface IShipmentResult {
  /** Tracking number from carrier */
  trackingNumber: string
  /** Carrier name */
  carrier: string
  /** URL to download the shipping label (PDF or ZPL) */
  labelUrl: string
  /** Provider that created this shipment */
  provider: 'sendbox' | 'shippo'
  /** Estimated delivery description */
  estimatedDays: string
}

// ─── Tracking ─────────────────────────────────────────────────────────────────

export type TrackingStatus =
  | 'UNKNOWN'
  | 'PRE_TRANSIT'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'FAILURE'

export interface ITrackingEvent {
  timestamp: string // ISO 8601
  status: TrackingStatus
  description: string
  location?: string
}

export interface ITrackingResult {
  trackingNumber: string
  carrier: string
  currentStatus: TrackingStatus
  estimatedDelivery?: string
  events: ITrackingEvent[]
}

// ─── Provider Interface (Strategy Pattern) ────────────────────────────────────
// To swap providers: implement this interface and update server/utils/shipping/index.ts

export interface IShippingProvider {
  /** Identifier for logging / DB storage */
  readonly name: 'sendbox' | 'shippo'
  /** Get live rate quotes for a shipment */
  getRates(payload: IGetRatesPayload): Promise<IShipmentRate[]>
  /** Book a shipment and get a label */
  createShipment(payload: ICreateShipmentPayload): Promise<IShipmentResult>
  /** Get real-time tracking for an existing shipment */
  trackShipment(
    trackingNumber: string,
    carrier?: string,
  ): Promise<ITrackingResult>
}
