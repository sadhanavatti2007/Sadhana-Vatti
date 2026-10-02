import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Store,
  Product,
  StoreInventoryItem,
  Order,
  CartItem,
  AtRiskCustomer,
  OpsAlert,
  SimulatorParams,
  OrderStatus,
} from '../types';
import {
  INITIAL_STORES,
  INITIAL_PRODUCTS,
  INITIAL_INVENTORY,
  INITIAL_ORDERS,
  INITIAL_AT_RISK_CUSTOMERS,
  INITIAL_ALERTS,
} from '../data/mockData';
import { evaluateOrderReliability, evaluateDeliveryRisk } from '../services/aiEngine';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedStoreId: string;
  setSelectedStoreId: (storeId: string) => void;
  stores: Store[];
  products: Product[];
  inventory: StoreInventoryItem[];
  orders: Order[];
  cart: CartItem[];
  atRiskCustomers: AtRiskCustomer[];
  alerts: OpsAlert[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  simulatorParams: SimulatorParams;
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => void;
  dismissToast: (id: string) => void;

  // Actions
  addToCart: (productId: string, storeId?: string, qty?: number) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (customer: { name: string; phone: string; address: string }) => Order;
  updateStock: (storeId: string, productId: string, deltaOrExact: number, isExact?: boolean) => void;
  verifyShelfStock: (storeId: string, productId: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  acceptOrderWithSubstitution: (orderId: string, originalProdId: string, replacementProdId: string) => void;
  takeRetentionAction: (customerId: string) => void;
  resolveAlert: (alertId: string) => void;
  updateSimulatorParams: (params: Partial<SimulatorParams>) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nova_pulse_hackathon_state_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store_indiranagar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>('NC-BLR-8921');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persistent / Mock States
  const [stores, setStores] = useState<Store[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_stores`);
    return saved ? JSON.parse(saved) : INITIAL_STORES;
  });

  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  const [inventory, setInventory] = useState<StoreInventoryItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_inventory`);
    return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_orders`);
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_cart`);
    return saved ? JSON.parse(saved) : [
      { productId: 'prod_amul_taaza', storeId: 'store_indiranagar', quantity: 2 },
      { productId: 'prod_fresh_tomato', storeId: 'store_indiranagar', quantity: 1 },
    ];
  });

  const [atRiskCustomers, setAtRiskCustomers] = useState<AtRiskCustomer[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_customers`);
    return saved ? JSON.parse(saved) : INITIAL_AT_RISK_CUSTOMERS;
  });

  const [alerts, setAlerts] = useState<OpsAlert[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_alerts`);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [simulatorParams, setSimulatorParams] = useState<SimulatorParams>({
    inventoryAccuracyPercent: 92,
    cancellationRatePercent: 3.5,
    repeatPurchaseRatePercent: 44,
    deliveryReliabilityPercent: 95,
    monthlyActiveOrders: 100000,
    avgOrderValueINR: 380,
    couponSpendReductionPercent: 40,
  });

  // Save to localStorage when key states change
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_stores`, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_inventory`, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_orders`, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_cart`, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_customers`, JSON.stringify(atRiskCustomers));
  }, [atRiskCustomers]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_alerts`, JSON.stringify(alerts));
  }, [alerts]);

  const showToast = (type: 'success' | 'info' | 'warning' | 'error', title: string, message: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-3), { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Cart actions
  const addToCart = (productId: string, storeId: string = selectedStoreId, qty: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId && item.storeId === storeId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId && item.storeId === storeId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { productId, storeId, quantity: qty }];
    });
    const prod = products.find(p => p.id === productId);
    showToast('success', 'Added to Cart', `${prod ? prod.name : 'Item'} added to cart.`);
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => (item.productId === productId ? { ...item, quantity: qty } : item)));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    showToast('info', 'Item Removed', 'Product removed from cart.');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Place Order with pre-flight reliability evaluation
  const placeOrder = (customer: { name: string; phone: string; address: string }): Order => {
    const activeStore = stores.find(s => s.id === selectedStoreId) || stores[0];

    // Build order items
    const orderItems = cart.map(cartItem => {
      const prod = products.find(p => p.id === cartItem.productId)!;
      return {
        productId: prod.id,
        productName: prod.name,
        brand: prod.brand,
        quantity: cartItem.quantity,
        unitPrice: prod.price,
        subtotal: prod.price * cartItem.quantity,
      };
    });

    const totalAmount = orderItems.reduce((acc, curr) => acc + curr.subtotal, 0);

    const reliability = evaluateOrderReliability(
      orderItems.map(item => ({
        product: products.find(p => p.id === item.productId)!,
        quantity: item.quantity,
      })),
      activeStore,
      inventory,
      stores,
      products
    );

    const delivery = evaluateDeliveryRisk(activeStore, orderItems.length);

    const newOrder: Order = {
      id: `NC-BLR-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      storeId: activeStore.id,
      storeName: activeStore.name,
      storeArea: activeStore.area,
      items: orderItems,
      totalAmount,
      status: 'pending',
      reliabilityScore: reliability.score,
      deliveryRiskTier: delivery.tier,
      deliveryRiskReason: delivery.reason,
      estimatedDeliveryMinutes: delivery.estimatedMinutes,
      createdAt: 'Just now',
      deliveryPartner: {
        name: 'Kiran Gowda',
        phone: '+91 98450 11994',
        vehicleNumber: 'KA 05 MN 9231',
      },
      events: [
        {
          timestamp: 'Just now',
          label: 'Order Placed & Stock Safeguarded',
          detail: `Pre-flight reliability checked: ${reliability.score}% confidence at ${activeStore.name}`,
          status: 'completed',
        },
        {
          timestamp: 'Pending',
          label: 'Store Confirmation',
          detail: `${activeStore.ownerName} notified for instant pick`,
          status: 'current',
        },
      ],
    };

    // Deduct stock from inventory
    setInventory(prev =>
      prev.map(inv => {
        const itemOrdered = orderItems.find(oi => oi.productId === inv.productId && inv.storeId === activeStore.id);
        if (itemOrdered) {
          const newStock = Math.max(0, inv.stockCount - itemOrdered.quantity);
          const isUrgent = newStock <= 2 && inv.salesVelocityPerHour >= 2.0;
          return {
            ...inv,
            stockCount: newStock,
            isUrgentAuditNeeded: isUrgent,
            auditUrgencyReason: isUrgent
              ? `Safety buffer breached: only ${newStock} units remaining after recent customer orders.`
              : inv.auditUrgencyReason,
          };
        }
        return inv;
      })
    );

    setOrders(prev => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    clearCart();

    showToast(
      'success',
      'Order Confirmed!',
      `Order #${newOrder.id} placed. Stock reserved with ${reliability.score}% confidence.`
    );

    return newOrder;
  };

  // Stock update from Partner Store
  const updateStock = (storeId: string, productId: string, deltaOrExact: number, isExact: boolean = false) => {
    setInventory(prev =>
      prev.map(inv => {
        if (inv.storeId === storeId && inv.productId === productId) {
          const newCount = isExact ? Math.max(0, deltaOrExact) : Math.max(0, inv.stockCount + deltaOrExact);
          const isUrgent = newCount <= 3 && inv.salesVelocityPerHour >= 2.0;
          return {
            ...inv,
            stockCount: newCount,
            lastStockAuditMinutesAgo: 0,
            isUrgentAuditNeeded: isUrgent,
            auditUrgencyReason: isUrgent ? 'Low shelf count under high sales demand.' : undefined,
          };
        }
        return inv;
      })
    );

    // Update store audit recency
    setStores(prev =>
      prev.map(s => (s.id === storeId ? { ...s, lastAuditMinutesAgo: 0, reliabilityScore: Math.min(99, s.reliabilityScore + 1) } : s))
    );

    const prod = products.find(p => p.id === productId);
    showToast('info', 'Inventory Synchronized', `${prod?.name || 'Item'} stock updated to live shelves.`);
  };

  // 1-Click Shelf Stock Verification (Pulse Audit)
  const verifyShelfStock = (storeId: string, productId: string) => {
    setInventory(prev =>
      prev.map(inv => {
        if (inv.storeId === storeId && inv.productId === productId) {
          return {
            ...inv,
            lastStockAuditMinutesAgo: 0,
            isUrgentAuditNeeded: false,
            auditUrgencyReason: undefined,
          };
        }
        return inv;
      })
    );

    setStores(prev =>
      prev.map(s => (s.id === storeId ? { ...s, lastAuditMinutesAgo: 0, reliabilityScore: Math.min(98, s.reliabilityScore + 2) } : s))
    );

    const prod = products.find(p => p.id === productId);
    showToast(
      'success',
      'Nova Pulse Verified',
      `Shelf stock for ${prod?.name || 'Item'} verified. Confidence boosted to 98%!`
    );
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedEvents = [...ord.events];
          if (status === 'accepted') {
            updatedEvents.push({
              timestamp: 'Just now',
              label: 'Accepted by Store',
              detail: 'Items picked from shelves and queued for packing',
              status: 'completed',
            });
          } else if (status === 'packing') {
            updatedEvents.push({
              timestamp: 'Just now',
              label: 'Packing Items',
              detail: 'Bag sealed and barcode matched with invoice',
              status: 'completed',
            });
          } else if (status === 'out_for_delivery') {
            updatedEvents.push({
              timestamp: 'Just now',
              label: 'Out for Delivery',
              detail: `${ord.deliveryPartner?.name || 'Rider'} is en route via fastest corridor`,
              status: 'current',
            });
          } else if (status === 'delivered') {
            updatedEvents.push({
              timestamp: 'Just now',
              label: 'Delivered Successfully',
              detail: 'Handed over to customer with zero missing items',
              status: 'completed',
            });
          } else if (status === 'cancelled') {
            updatedEvents.push({
              timestamp: 'Just now',
              label: 'Order Cancelled',
              detail: 'Failed fulfillment; customer retention mitigation triggered',
              status: 'completed',
            });
          }
          return {
            ...ord,
            status,
            events: updatedEvents,
          };
        }
        return ord;
      })
    );

    showToast('info', 'Order Updated', `Order #${orderId} marked as ${status.replace('_', ' ').toUpperCase()}`);
  };

  // Accept order with AI smart substitution
  const acceptOrderWithSubstitution = (orderId: string, originalProdId: string, replacementProdId: string) => {
    const replacementProd = products.find(p => p.id === replacementProdId);
    const originalProd = products.find(p => p.id === originalProdId);

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map(item => {
            if (item.productId === originalProdId && replacementProd) {
              return {
                ...item,
                productId: replacementProd.id,
                productName: replacementProd.name,
                brand: replacementProd.brand,
                unitPrice: replacementProd.price,
                subtotal: replacementProd.price * item.quantity,
                substitutedFrom: {
                  originalProductId: originalProdId,
                  originalProductName: originalProd?.name || 'Original Item',
                  reason: 'Stock substituted with verified equivalent item to prevent cancellation.',
                },
              };
            }
            return item;
          });

          return {
            ...ord,
            status: 'accepted',
            items: updatedItems,
            substitutionPending: undefined,
            reliabilityScore: 92,
            events: [
              ...ord.events,
              {
                timestamp: 'Just now',
                label: 'Smart Substitution Applied',
                detail: `Replaced ${originalProd?.name} with ${replacementProd?.name}. Order saved from cancellation!`,
                status: 'completed',
              },
            ],
          };
        }
        return ord;
      })
    );

    showToast(
      'success',
      'Smart Substitution Approved',
      `Item substituted with ${replacementProd?.name || 'replacement'}. Customer notified seamlessly.`
    );
  };

  // Operations: Retention action on at-risk customer
  const takeRetentionAction = (customerId: string) => {
    setAtRiskCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            actionTaken: true,
            churnRiskScore: Math.max(20, c.churnRiskScore - 35),
            churnTier: 'low',
          };
        }
        return c;
      })
    );

    const cust = atRiskCustomers.find(c => c.id === customerId);
    showToast(
      'success',
      'Retention Safeguard Deployed',
      `Applied proactive guarantee pass for ${cust?.name || 'customer'}. Churn risk reduced.`
    );
  };

  // Operations: Resolve alert
  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, resolved: true } : a)));
    showToast('info', 'Alert Resolved', 'Action logged in Nova Pulse operations audit.');
  };

  const updateSimulatorParams = (params: Partial<SimulatorParams>) => {
    setSimulatorParams(prev => ({ ...prev, ...params }));
  };

  // Reset demo data to pristine state
  const resetDemoData = () => {
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_stores`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_inventory`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_orders`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_cart`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_customers`);
    localStorage.removeItem(`${LOCAL_STORAGE_KEY}_alerts`);

    setStores(INITIAL_STORES);
    setInventory(INITIAL_INVENTORY);
    setOrders(INITIAL_ORDERS);
    setAtRiskCustomers(INITIAL_AT_RISK_CUSTOMERS);
    setAlerts(INITIAL_ALERTS);
    setSelectedOrderId('NC-BLR-8921');
    setCart([
      { productId: 'prod_amul_taaza', storeId: 'store_indiranagar', quantity: 2 },
      { productId: 'prod_fresh_tomato', storeId: 'store_indiranagar', quantity: 1 },
    ]);

    showToast('info', 'Demo State Reset', 'Pristine hackathon scenario restored.');
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        selectedStoreId,
        setSelectedStoreId,
        stores,
        products,
        inventory,
        orders,
        cart,
        atRiskCustomers,
        alerts,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedOrderId,
        setSelectedOrderId,
        simulatorParams,
        toasts,
        showToast,
        dismissToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        placeOrder,
        updateStock,
        verifyShelfStock,
        updateOrderStatus,
        acceptOrderWithSubstitution,
        takeRetentionAction,
        resolveAlert,
        updateSimulatorParams,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
