export type UserRole = 'customer' | 'store' | 'operations' | 'simulator' | 'presentation';

export type ConfidenceTier = 'high' | 'medium' | 'low';

export interface Store {
  id: string;
  name: string;
  ownerName: string;
  area: string;
  city: string;
  distanceKm: number;
  rating: number;
  openTime: string;
  reliabilityScore: number; // 0 - 100
  cancellationRate: number; // percentage e.g. 4.2%
  lastAuditMinutesAgo: number;
  dailyOrdersFulfillmentRate: number; // e.g. 96%
  phone: string;
  address: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: 'Dairy & Eggs' | 'Staples & Grains' | 'Fresh Produce' | 'Snacks & Quick Bites' | 'Beverages';
  brand: string;
  weightOrVolume: string;
  price: number; // INR
  mrp: number; // INR
  image: string;
  description: string;
  popular?: boolean;
}

export interface StoreInventoryItem {
  storeId: string;
  productId: string;
  stockCount: number;
  lastStockAuditMinutesAgo: number;
  recentStockoutsLast7Days: number;
  salesVelocityPerHour: number; // average units per hour
  isUrgentAuditNeeded: boolean;
  auditUrgencyReason?: string;
}

export interface ConfidenceAssessment {
  score: number; // 0 - 100
  tier: ConfidenceTier;
  reason: string;
  factors: {
    auditRecencyScore: number; // e.g. 35/40
    stockoutHistoryScore: number; // e.g. 20/30
    velocityBufferScore: number; // e.g. 25/30
  };
  recommendedAlternatives: Array<{
    productId: string;
    productName: string;
    storeId: string;
    storeName: string;
    price: number;
    confidenceScore: number;
    reason: string;
  }>;
}

export interface CartItem {
  productId: string;
  storeId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  substitutedFrom?: {
    originalProductId: string;
    originalProductName: string;
    reason: string;
  };
}

export type OrderStatus = 'pending' | 'accepted' | 'packing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderEvent {
  timestamp: string;
  label: string;
  detail: string;
  status: 'completed' | 'current' | 'upcoming';
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  storeId: string;
  storeName: string;
  storeArea: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  reliabilityScore: number; // 0 - 100
  deliveryRiskTier: 'low' | 'medium' | 'high';
  deliveryRiskReason: string;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  deliveryPartner?: {
    name: string;
    phone: string;
    vehicleNumber: string;
  };
  substitutionPending?: {
    originalProductId: string;
    originalProductName: string;
    replacementProductId: string;
    replacementProductName: string;
    priceDifference: number; // e.g. 0 or +₹5
    storeReason: string;
  };
  events: OrderEvent[];
}

export interface AtRiskCustomer {
  id: string;
  name: string;
  area: string;
  phone: string;
  ordersCount: number;
  lifetimeValueINR: number;
  churnRiskScore: number; // 0 - 100
  churnTier: 'high' | 'medium' | 'low';
  failedOrdersCount: number;
  delayedOrdersCount: number;
  discountReliancePercent: number; // e.g. 70% buys only with big coupon
  reason: string;
  recommendedAction: string;
  actionTaken?: boolean;
}

export interface OpsAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'inventory' | 'cancellation' | 'delivery' | 'customer';
  title: string;
  description: string;
  storeId?: string;
  storeName?: string;
  productId?: string;
  suggestedAction: string;
  resolved: boolean;
}

export interface SimulatorParams {
  inventoryAccuracyPercent: number; // e.g. 74 -> 94
  cancellationRatePercent: number; // e.g. 14.5 -> 3.2
  repeatPurchaseRatePercent: number; // e.g. 26 -> 48
  deliveryReliabilityPercent: number; // e.g. 81 -> 96
  monthlyActiveOrders: number; // e.g. 120,000
  avgOrderValueINR: number; // e.g. 360
  couponSpendReductionPercent: number; // e.g. 35
}
