import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, Store, StoreInventoryItem } from '../../types';
import { evaluateProductAvailability, evaluateOrderReliability } from '../../services/aiEngine';
import {
  Search,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  Truck,
  Clock,
  Phone,
  Store as StoreIcon,
} from 'lucide-react';

export const CustomerView: React.FC = () => {
  const {
    stores,
    selectedStoreId,
    setSelectedStoreId,
    products,
    inventory,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    placeOrder,
    orders,
    selectedOrderId,
    setSelectedOrderId,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'browse' | 'orders'>('browse');
  const [isStoreSelectorOpen, setIsStoreSelectorOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [expandedConfidenceProductId, setExpandedConfidenceProductId] = useState<string | null>(null);

  // Checkout form state
  const [customerName, setCustomerName] = useState('Aarav Mehta');
  const [customerPhone, setCustomerPhone] = useState('+91 98410 77210');
  const [customerAddress, setCustomerAddress] = useState('Flat 402, Sai Residency, 6th Cross, Indiranagar, Bengaluru');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');

  const currentStore = stores.find(s => s.id === selectedStoreId) || stores[0];

  const categories = ['All', 'Dairy & Eggs', 'Staples & Grains', 'Fresh Produce', 'Snacks & Quick Bites', 'Beverages'];

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart calculations
  const cartWithProducts = cart.map(item => {
    const prod = products.find(p => p.id === item.productId)!;
    return { ...item, product: prod };
  });

  const cartTotalINR = cartWithProducts.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  // Cart pre-flight order reliability evaluation
  const orderReliability = evaluateOrderReliability(
    cartWithProducts.filter(item => item.product).map(item => ({ product: item.product, quantity: item.quantity })),
    currentStore,
    inventory,
    stores,
    products
  );

  // Active tracking order
  const trackingOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    const newOrder = placeOrder({
      name: customerName,
      phone: customerPhone,
      address: customerAddress,
    });
    setIsCheckoutOpen(false);
    setActiveTab('orders');
    setSelectedOrderId(newOrder.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Location & Store Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <StoreIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                Assigned Local Store
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">
                {currentStore.distanceKm} km · {currentStore.lastAuditMinutesAgo}m audit freshness
              </span>
            </div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              {currentStore.name}
              <span className="text-xs font-normal text-slate-400">({currentStore.area})</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Store Reliability: {currentStore.reliabilityScore}%</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Cancellation Rate: {currentStore.cancellationRate}%
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsStoreSelectorOpen(!isStoreSelectorOpen)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-white flex items-center gap-2 cursor-pointer transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Switch Nearby Store</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isStoreSelectorOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-30">
                <div className="text-[11px] font-semibold text-slate-400 px-3 py-1.5 font-mono uppercase">
                  Available Partner Stores in Bengaluru
                </div>
                <div className="space-y-1">
                  {stores.map(store => {
                    const isSelected = store.id === currentStore.id;
                    return (
                      <button
                        key={store.id}
                        onClick={() => {
                          setSelectedStoreId(store.id);
                          setIsStoreSelectorOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span>{store.name}</span>
                          <span className="font-mono text-emerald-400">{store.reliabilityScore}%</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                          <span>{store.area}</span>
                          <span>{store.distanceKm} km away</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main View Segmented Tabs: Browse Catalog vs Track Orders */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            Browse Products & Inventory Confidence
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>Live Order Tracking</span>
            {orders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-emerald-400 font-mono">
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'browse' && (
          <div className="text-xs text-slate-400 hidden sm:block font-mono">
            Showing verified items at {currentStore.name}
          </div>
        )}
      </div>

      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Search, Categories & Products Grid (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search milk, atta, oil, tomatoes, snacks, tea..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map(cat => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredProducts.map(product => {
                const storeInv = inventory.find(i => i.storeId === currentStore.id && i.productId === product.id);
                const confidence = evaluateProductAvailability(
                  product,
                  storeInv,
                  currentStore,
                  stores,
                  products,
                  inventory
                );

                const cartItem = cart.find(c => c.productId === product.id && c.storeId === currentStore.id);
                const isExpanded = expandedConfidenceProductId === product.id;

                return (
                  <div
                    key={product.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group"
                  >
                    <div>
                      {/* Product Header & Image */}
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl bg-slate-800/80 border border-slate-700/60 overflow-hidden shrink-0 relative flex items-center justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                            {product.brand} · {product.weightOrVolume}
                          </span>
                          <h4 className="text-xs font-bold text-white leading-snug line-clamp-2 mt-0.5">
                            {product.name}
                          </h4>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-sm font-extrabold text-white font-mono">
                              ₹{product.price}
                            </span>
                            {product.mrp > product.price && (
                              <span className="text-[11px] text-slate-500 line-through font-mono">
                                ₹{product.mrp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Nova Pulse Explainable Availability Badge */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                confidence.tier === 'high'
                                  ? 'bg-emerald-400'
                                  : confidence.tier === 'medium'
                                  ? 'bg-amber-400'
                                  : 'bg-rose-500'
                              }`}
                            />
                            <span
                              className={`text-[11px] font-semibold font-mono ${
                                confidence.tier === 'high'
                                  ? 'text-emerald-400'
                                  : confidence.tier === 'medium'
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {confidence.score}% {confidence.tier.toUpperCase()} CONFIDENCE
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              setExpandedConfidenceProductId(isExpanded ? null : product.id)
                            }
                            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                          >
                            <span>Why?</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        </div>

                        {/* Explainable AI Deep Dive Popover */}
                        {isExpanded && (
                          <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-2">
                            <p className="text-slate-300 leading-relaxed">{confidence.reason}</p>
                            <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                              <div>
                                <span className="block text-slate-500">Recency</span>
                                <span className="text-slate-300">{confidence.factors.auditRecencyScore}/40 pts</span>
                              </div>
                              <div>
                                <span className="block text-slate-500">History</span>
                                <span className="text-slate-300">{confidence.factors.stockoutHistoryScore}/30 pts</span>
                              </div>
                              <div>
                                <span className="block text-slate-500">Velocity Buffer</span>
                                <span className="text-slate-300">{confidence.factors.velocityBufferScore}/30 pts</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* If confidence is not High, offer Reliable Alternatives */}
                        {confidence.tier !== 'high' && confidence.recommendedAlternatives.length > 0 && (
                          <div className="mt-2.5 p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px]">
                            <div className="flex items-center gap-1 text-emerald-400 font-semibold mb-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Reliable Alternative Recommended:</span>
                            </div>
                            {confidence.recommendedAlternatives.slice(0, 1).map((alt, idx) => (
                              <div key={idx} className="space-y-1">
                                <p className="text-slate-300 text-[11px] font-medium leading-tight">
                                  {alt.productName} ({alt.storeName})
                                </p>
                                <p className="text-slate-400 text-[10px] leading-tight">{alt.reason}</p>
                                <button
                                  onClick={() => {
                                    if (alt.storeId !== currentStore.id) {
                                      setSelectedStoreId(alt.storeId);
                                    }
                                    addToCart(alt.productId, alt.storeId, 1);
                                  }}
                                  className="mt-1 px-2.5 py-1 bg-emerald-500 text-slate-950 rounded text-[10px] font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                                >
                                  Switch & Add Verified Item (₹{alt.price})
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Add to Cart Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {storeInv ? `${storeInv.stockCount} units on shelf` : 'Stock check active'}
                      </span>

                      {cartItem ? (
                        <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-1 border border-slate-700">
                          <button
                            onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono font-bold text-white px-1">
                            {cartItem.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-700 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product.id, currentStore.id, 1)}
                          disabled={storeInv && storeInv.stockCount === 0}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            storeInv && storeInv.stockCount === 0
                              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{storeInv && storeInv.stockCount === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Order Cart & Pre-Flight Reliability Safeguard (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sticky top-20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Your Cart</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-400 font-medium">Your cart is currently empty.</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Add groceries from {currentStore.name} to see the real-time order reliability score.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Cart Items List */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {cartWithProducts.map(item => {
                    if (!item.product) return null;
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white truncate">{item.product.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            ₹{item.product.price} × {item.quantity} = ₹{item.product.price * item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold text-white px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pre-Flight Order Reliability Analysis */}
                <div
                  className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    orderReliability.tier === 'high'
                      ? 'bg-emerald-950/30 border-emerald-500/30'
                      : orderReliability.tier === 'medium'
                      ? 'bg-amber-950/30 border-amber-500/30'
                      : 'bg-rose-950/30 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Nova Pulse Reliability Check
                    </span>
                    <span
                      className={`font-mono font-bold text-xs ${
                        orderReliability.tier === 'high'
                          ? 'text-emerald-400'
                          : orderReliability.tier === 'medium'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {orderReliability.score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">{orderReliability.breakdown}</p>
                </div>

                {/* Bill Summary */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Items Subtotal</span>
                    <span className="font-mono text-slate-200">₹{cartTotalINR}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Delivery Partner Fee (12m ETA)</span>
                    <span className="font-mono text-emerald-400">FREE (Pulse Pass)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reliability Handling</span>
                    <span className="font-mono text-slate-200">₹0</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                    <span>To Pay</span>
                    <span className="font-mono text-emerald-400">₹{cartTotalINR}</span>
                  </div>
                </div>

                {/* Checkout Trigger Button */}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Orders & Live Tracking View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Order Selector List (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              Your Orders ({orders.length})
            </h3>
            <div className="space-y-2">
              {orders.map(order => {
                const isSelected = order.id === trackingOrder?.id;
                return (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-white">#{order.id}</span>
                      <span
                        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                          order.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : order.status === 'cancelled'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 mt-1 font-medium">{order.storeName}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-mono">
                      <span>{order.items.length} items · ₹{order.totalAmount}</span>
                      <span className="text-emerald-400">{order.reliabilityScore}% reliability</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Order Live Tracker & Stepper (8 cols) */}
          {trackingOrder && (
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      #{trackingOrder.id}
                    </span>
                    <span className="text-xs text-slate-400">· Placed {trackingOrder.createdAt}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    Fulfilling from {trackingOrder.storeName}
                  </h3>
                  <p className="text-xs text-slate-400">{trackingOrder.customerAddress}</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Estimated ETA</div>
                  <div className="text-base font-extrabold text-white font-mono flex items-center gap-1 justify-end">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>{trackingOrder.estimatedDeliveryMinutes} mins</span>
                  </div>
                </div>
              </div>

              {/* Status Notice / Delay Alerts / Substitutions */}
              {trackingOrder.substitutionPending && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Proactive Stock Alert & Free Substitution Notice</span>
                  </div>
                  <p className="text-slate-300">
                    Original item: <span className="font-semibold">{trackingOrder.substitutionPending.originalProductName}</span> had a sudden stockout. Store proposed replacement: <span className="font-semibold text-white">{trackingOrder.substitutionPending.replacementProductName}</span> at zero extra charge to avoid order cancellation.
                  </p>
                </div>
              )}

              {/* Delivery Progress Stepper */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  Live Dispatch Progression
                </h4>
                <div className="space-y-3">
                  {trackingOrder.events.map((evt, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {evt.status === 'completed' ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                        ) : evt.status === 'current' ? (
                          <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center animate-pulse">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-slate-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${evt.status === 'completed' ? 'text-white' : evt.status === 'current' ? 'text-amber-300' : 'text-slate-500'}`}>
                            {evt.label}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">{evt.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{evt.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Partner Details */}
              {trackingOrder.deliveryPartner && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{trackingOrder.deliveryPartner.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Vehicle: {trackingOrder.deliveryPartner.vehicleNumber}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${trackingOrder.deliveryPartner.phone}`}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                  >
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>Call Rider</span>
                  </a>
                </div>
              )}

              {/* Ordered Items Table */}
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono mb-2">
                  Items in this Order
                </h4>
                <div className="space-y-1.5">
                  {trackingOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-slate-950/40 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">{item.productName}</span>
                        {item.substitutedFrom && (
                          <span className="ml-2 text-[10px] text-emerald-400 font-mono">
                            (Substituted from {item.substitutedFrom.originalProductName})
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-slate-300">
                        {item.quantity} × ₹{item.unitPrice} = ₹{item.subtotal}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Nova Pulse Instant Checkout</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`py-2 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Cash on Del.
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`py-2 px-2 rounded-lg border text-center font-medium cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Credit Card
                  </button>
                </div>
              </div>

              {/* Reliability Assurance Box */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Assigned Store:</span>
                  <span className="font-semibold text-white">{currentStore.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Stock Reliability Score:</span>
                  <span className="font-mono font-bold text-emerald-400">{orderReliability.score}%</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Order Total:</span>
                  <span className="font-mono font-bold text-white">₹{cartTotalINR}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 cursor-pointer text-xs"
              >
                Confirm Order with Stock Safeguard (₹{cartTotalINR})
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
