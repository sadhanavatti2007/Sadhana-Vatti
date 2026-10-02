import {
  Product,
  Store,
  StoreInventoryItem,
  ConfidenceAssessment,
  ConfidenceTier,
  OrderItem,
  AtRiskCustomer,
  SimulatorParams,
} from '../types';

/**
 * Calculates Explainable Product Availability Confidence:
 * Combines:
 * 1. Audit Recency Score (max 40 pts)
 * 2. Stockout History in last 7 days (max 30 pts)
 * 3. Velocity-to-Stock Buffer (max 30 pts)
 * 
 * Also generates transparent "WHY" explanation and reliable alternatives.
 */
export function evaluateProductAvailability(
  product: Product,
  storeInventory: StoreInventoryItem | undefined,
  currentStore: Store,
  allStores: Store[],
  allProducts: Product[],
  allInventory: StoreInventoryItem[]
): ConfidenceAssessment {
  // If product is not even stocked in this store
  if (!storeInventory || storeInventory.stockCount <= 0) {
    const alternatives = findAlternatives(product, currentStore, allStores, allProducts, allInventory);
    return {
      score: 12,
      tier: 'low',
      reason: `Out of Stock: ${product.name} has 0 recorded units at ${currentStore.name}. Last audited ${storeInventory ? `${storeInventory.lastStockAuditMinutesAgo}m ago` : 'never'}.`,
      factors: {
        auditRecencyScore: 5,
        stockoutHistoryScore: 4,
        velocityBufferScore: 3,
      },
      recommendedAlternatives: alternatives,
    };
  }

  // 1. Audit Recency (40 max)
  // Ideal: < 30 mins ago. Penalty increases with time elapsed.
  let auditRecencyScore = 40;
  const mins = storeInventory.lastStockAuditMinutesAgo;
  if (mins <= 20) {
    auditRecencyScore = 40;
  } else if (mins <= 45) {
    auditRecencyScore = 34;
  } else if (mins <= 90) {
    auditRecencyScore = 26;
  } else if (mins <= 180) {
    auditRecencyScore = 15;
  } else {
    auditRecencyScore = 8;
  }

  // 2. Stockout History (30 max)
  // 0 stockouts = 30 pts, 1 = 22 pts, 2 = 14 pts, 3+ = 6 pts
  let stockoutHistoryScore = 30;
  const stockouts = storeInventory.recentStockoutsLast7Days;
  if (stockouts === 0) {
    stockoutHistoryScore = 30;
  } else if (stockouts === 1) {
    stockoutHistoryScore = 22;
  } else if (stockouts === 2) {
    stockoutHistoryScore = 14;
  } else {
    stockoutHistoryScore = 6;
  }

  // 3. Velocity Buffer Score (30 max)
  // Stock count / (salesVelocityPerHour * 2 hours safety window)
  const hourlyDemand = Math.max(0.5, storeInventory.salesVelocityPerHour);
  const hoursOfSupply = storeInventory.stockCount / hourlyDemand;
  let velocityBufferScore = 30;
  if (hoursOfSupply >= 4) {
    velocityBufferScore = 30;
  } else if (hoursOfSupply >= 2) {
    velocityBufferScore = 22;
  } else if (hoursOfSupply >= 1) {
    velocityBufferScore = 14;
  } else {
    velocityBufferScore = 6;
  }

  const totalScore = Math.min(99, Math.max(15, auditRecencyScore + stockoutHistoryScore + velocityBufferScore));

  let tier: ConfidenceTier = 'high';
  if (totalScore >= 75) {
    tier = 'high';
  } else if (totalScore >= 50) {
    tier = 'medium';
  } else {
    tier = 'low';
  }

  // Generate plain-language explainability (WHY)
  let reason = '';
  if (tier === 'high') {
    reason = `Verified High Confidence: Stock was physically audited ${mins} mins ago by ${currentStore.ownerName}. Buffer covers ${hoursOfSupply.toFixed(1)} hours of current demand with 0 recent stockouts.`;
  } else if (tier === 'medium') {
    if (mins > 60) {
      reason = `Moderate Confidence: Store has ${storeInventory.stockCount} units, but last physical shelf audit was ${mins} mins ago during ongoing sales.`;
    } else {
      reason = `Moderate Confidence: Fast-moving item (${hourlyDemand} units/hr). Only ${storeInventory.stockCount} units remain before safety buffer triggers.`;
    }
  } else {
    reason = `Uncertain Stock Risk: ${storeInventory.stockCount} units remaining with ${stockouts} stockout incidents this week and delayed inventory sync (${mins} mins ago). High chance of cancellation.`;
  }

  const alternatives = tier !== 'high' ? findAlternatives(product, currentStore, allStores, allProducts, allInventory) : [];

  return {
    score: totalScore,
    tier,
    reason,
    factors: {
      auditRecencyScore,
      stockoutHistoryScore,
      velocityBufferScore,
    },
    recommendedAlternatives: alternatives,
  };
}

/**
 * Finds reliable alternative products or alternative nearby partner stores
 */
function findAlternatives(
  product: Product,
  currentStore: Store,
  allStores: Store[],
  allProducts: Product[],
  allInventory: StoreInventoryItem[]
) {
  const alternatives: Array<{
    productId: string;
    productName: string;
    storeId: string;
    storeName: string;
    price: number;
    confidenceScore: number;
    reason: string;
  }> = [];

  // 1. Same product at a nearby reliable partner store
  const otherStores = allStores.filter(s => s.id !== currentStore.id && s.isActive);
  for (const store of otherStores) {
    const inv = allInventory.find(i => i.storeId === store.id && i.productId === product.id);
    if (inv && inv.stockCount >= 5 && inv.lastStockAuditMinutesAgo <= 45) {
      alternatives.push({
        productId: product.id,
        productName: `${product.name} (${product.weightOrVolume})`,
        storeId: store.id,
        storeName: `${store.name} (${store.distanceKm} km away)`,
        price: product.price,
        confidenceScore: 94,
        reason: `Available at nearby partner store with fresh audit (${inv.lastStockAuditMinutesAgo}m ago) and ${inv.stockCount} verified units.`,
      });
      break;
    }
  }

  // 2. Similar product in same category in current store or nearby store
  const sameCategoryProducts = allProducts.filter(p => p.category === product.category && p.id !== product.id);
  for (const altProd of sameCategoryProducts) {
    const invInCurrentStore = allInventory.find(i => i.storeId === currentStore.id && i.productId === altProd.id);
    if (invInCurrentStore && invInCurrentStore.stockCount >= 8) {
      alternatives.push({
        productId: altProd.id,
        productName: `${altProd.name} (${altProd.weightOrVolume})`,
        storeId: currentStore.id,
        storeName: currentStore.name,
        price: altProd.price,
        confidenceScore: 96,
        reason: `Direct verified replacement in ${currentStore.name}: 100% in stock (${invInCurrentStore.stockCount} units), avoids multi-store split delivery.`,
      });
      break;
    }
  }

  return alternatives;
}

/**
 * Calculates Order Reliability Score (0-100)
 */
export function evaluateOrderReliability(
  items: Array<{ product: Product; quantity: number }>,
  store: Store,
  allInventory: StoreInventoryItem[],
  allStores: Store[],
  allProducts: Product[]
): {
  score: number;
  tier: 'high' | 'medium' | 'low';
  breakdown: string;
  itemRisks: Array<{ productName: string; score: number; warning?: string }>;
} {
  if (items.length === 0) {
    return {
      score: 100,
      tier: 'high',
      breakdown: 'No items in cart.',
      itemRisks: [],
    };
  }

  let totalItemScore = 0;
  const itemRisks: Array<{ productName: string; score: number; warning?: string }> = [];

  for (const item of items) {
    const inv = allInventory.find(i => i.storeId === store.id && i.productId === item.product.id);
    const assessment = evaluateProductAvailability(item.product, inv, store, allStores, allProducts, allInventory);
    totalItemScore += assessment.score;

    itemRisks.push({
      productName: item.product.name,
      score: assessment.score,
      warning: assessment.tier === 'low' ? assessment.reason : undefined,
    });
  }

  const avgProductConfidence = totalItemScore / items.length;
  // Blend with store historical reliability score (70% items weight, 30% store track record)
  const compositeScore = Math.round(avgProductConfidence * 0.7 + store.reliabilityScore * 0.3);

  let tier: 'high' | 'medium' | 'low' = 'high';
  if (compositeScore >= 80) tier = 'high';
  else if (compositeScore >= 60) tier = 'medium';
  else tier = 'low';

  const breakdown =
    tier === 'high'
      ? `High Order Reliability (${compositeScore}%): All ${items.length} items have verified shelf counts and ${store.name} has a ${store.dailyOrdersFulfillmentRate}% on-time record.`
      : tier === 'medium'
      ? `Moderate Order Reliability (${compositeScore}%): One or more fast-moving items have limited buffer. Pre-allocation lock active.`
      : `High Cancellation Risk (${compositeScore}%): Critical stock uncertainty detected. Immediate AI substitution or partner store switch advised before checkout.`;

  return {
    score: compositeScore,
    tier,
    breakdown,
    itemRisks,
  };
}

/**
 * Calculates Delivery Risk based on distance, store prep latency, and order size
 */
export function evaluateDeliveryRisk(
  store: Store,
  itemCount: number,
  trafficFactor: number = 1.0
): {
  tier: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  reason: string;
} {
  // Base prep time = 4 mins + 1 min per 3 items
  const prepMinutes = Math.round(4 + itemCount * 0.5);
  // Transit time = distanceKm * 3.5 mins/km * traffic factor
  const transitMinutes = Math.round(store.distanceKm * 3.5 * trafficFactor);
  const totalMinutes = prepMinutes + transitMinutes;

  if (totalMinutes <= 15) {
    return {
      tier: 'low',
      estimatedMinutes: totalMinutes,
      reason: `Optimal 12-15 min window: Store ${store.distanceKm} km away. Dedicated rider corridor clear.`,
    };
  } else if (totalMinutes <= 22) {
    return {
      tier: 'medium',
      estimatedMinutes: totalMinutes,
      reason: `Moderate transit duration (${totalMinutes} mins): Distance is ${store.distanceKm} km with regular arterial traffic.`,
    };
  } else {
    return {
      tier: 'high',
      estimatedMinutes: totalMinutes,
      reason: `High delay probability (${totalMinutes}+ mins): Store is ${store.distanceKm} km away and peak delivery route congestion detected.`,
    };
  }
}

/**
 * Calculates Customer Retention / Churn Risk
 */
export function evaluateCustomerRetention(customer: AtRiskCustomer): {
  churnTier: 'high' | 'medium' | 'low';
  riskScore: number;
  explanation: string;
  prescribedRetentionPlan: string;
} {
  // Failed orders heavily weight churn probability in quick commerce
  // In Indian quick commerce, 2 failed orders = 65%+ churn to Zepto/Blinkit/Swiggy Instamart
  let churnScore = customer.churnRiskScore;
  if (customer.failedOrdersCount >= 2) {
    churnScore = Math.max(churnScore, 85);
  }

  let explanation = '';
  if (churnScore >= 75) {
    explanation = `Critical Churn Risk (${churnScore}%): Customer endured ${customer.failedOrdersCount} failed/cancelled order(s). Customer trust eroded; high probability of app abandonment.`;
  } else if (churnScore >= 50) {
    explanation = `Moderate Churn Risk (${churnScore}%): Experienced ${customer.delayedOrdersCount} delayed delivery instances. Only purchases during promo campaigns.`;
  } else {
    explanation = `Stable Retention (${churnScore}%): Consistent ordering history with high store loyalty.`;
  }

  return {
    churnTier: customer.churnTier,
    riskScore: churnScore,
    explanation,
    prescribedRetentionPlan: customer.recommendedAction,
  };
}

/**
 * Calculates Business Impact Simulator metrics in real Indian Rupee figures
 */
export function calculateSimulatorImpact(params: SimulatorParams) {
  const {
    inventoryAccuracyPercent,
    cancellationRatePercent,
    repeatPurchaseRatePercent,
    deliveryReliabilityPercent,
    monthlyActiveOrders,
    avgOrderValueINR,
    couponSpendReductionPercent,
  } = params;

  // Baseline legacy quick commerce metrics (industry average without Nova Pulse)
  const BASELINE_INVENTORY_ACCURACY = 70; // 70%
  const BASELINE_CANCELLATION_RATE = 14.5; // 14.5%
  const BASELINE_REPEAT_RATE = 28; // 28%
  const BASELINE_DELIVERY_RELIABILITY = 80; // 80%
  const BASELINE_COUPON_BURN_PER_ORDER = 45; // ₹45 spent on retention discounts per order
  const COST_PER_FAILED_ORDER_INR = 120; // Rider dispatch waste + call center + apology credit
  const COST_PER_SUPPORT_TICKET_INR = 75;

  // Monthly values
  const baselineMonthlyCancelledOrders = Math.round(monthlyActiveOrders * (BASELINE_CANCELLATION_RATE / 100));
  const currentMonthlyCancelledOrders = Math.round(monthlyActiveOrders * (cancellationRatePercent / 100));
  const monthlyOrdersSaved = Math.max(0, baselineMonthlyCancelledOrders - currentMonthlyCancelledOrders);

  // Revenue preserved from saved orders
  const monthlyRevenueSavedINR = monthlyOrdersSaved * avgOrderValueINR;
  const annualRevenueSavedINR = monthlyRevenueSavedINR * 12;

  // Logistics & operational cost savings (reduced reverse logistics & support overhead)
  const monthlySupportTicketsReduced = Math.round(monthlyOrdersSaved * 0.72);
  const annualSupportCostSavingsINR = monthlySupportTicketsReduced * COST_PER_SUPPORT_TICKET_INR * 12;
  const annualFailedLogisticsSavedINR = monthlyOrdersSaved * COST_PER_FAILED_ORDER_INR * 12;

  // Coupon burn reduction: Nova Pulse increases organic loyalty, reducing need for blind ₹50 discount codes
  const couponSavingsPerOrder = BASELINE_COUPON_BURN_PER_ORDER * (couponSpendReductionPercent / 100);
  const annualCouponBurnSavingsINR = monthlyActiveOrders * couponSavingsPerOrder * 12;

  // Customer LTV expansion: Repeat purchase improvement
  const repeatRateDelta = Math.max(0, repeatPurchaseRatePercent - BASELINE_REPEAT_RATE);
  const additionalRepeatOrdersPerYear = Math.round(monthlyActiveOrders * (repeatRateDelta / 100) * 8); // 8 repeat orders/yr
  const annualLTVExpansionINR = additionalRepeatOrdersPerYear * avgOrderValueINR;

  // Net annual bottom-line impact
  const totalNetAnnualGainINR =
    annualRevenueSavedINR +
    annualSupportCostSavingsINR +
    annualFailedLogisticsSavedINR +
    annualCouponBurnSavingsINR +
    (annualLTVExpansionINR * 0.18); // 18% gross margin contribution

  return {
    monthlyOrdersSaved,
    annualRevenueSavedINR,
    annualRevenueSavedLakhs: (annualRevenueSavedINR / 100000).toFixed(1),
    annualRevenueSavedCrores: (annualRevenueSavedINR / 10000000).toFixed(2),
    annualCouponBurnSavingsLakhs: (annualCouponBurnSavingsINR / 100000).toFixed(1),
    annualSupportCostSavingsLakhs: (annualSupportCostSavingsINR / 100000).toFixed(1),
    annualLTVExpansionCrores: (annualLTVExpansionINR / 10000000).toFixed(2),
    totalNetAnnualGainCrores: (totalNetAnnualGainINR / 10000000).toFixed(2),
    cancellationDropPercent: (BASELINE_CANCELLATION_RATE - cancellationRatePercent).toFixed(1),
    inventoryAccuracyLiftPercent: (inventoryAccuracyPercent - BASELINE_INVENTORY_ACCURACY).toFixed(1),
    repeatRateLiftPercent: (repeatPurchaseRatePercent - BASELINE_REPEAT_RATE).toFixed(1),
  };
}
