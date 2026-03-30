import { CONVERSATION_TIERS, EXTRAS_CONFIG, COUPONS, CouponConfig } from "@/config/pricing-config";

export interface CalculatorState {
    conversations: number;
    instagramComments: boolean;
    abandonedCart: boolean;
    prospectorContacts: number;
    bulkMessages: {
        enabled: boolean;
        count: number;
    };
    agentsTotal: number;
    linesTotal: number;
    followupRulesTotal: number;
    couponCode: string;
}

export interface BreakdownItem {
    key: string;
    label: string;
    qty: number;
    unitPrice?: number;
    subtotal: number;
}

export interface CalculationResult {
    base: {
        rate: number;
        subtotal: number;
    };
    extrasBreakdown: BreakdownItem[];
    subtotal: number;
    discount: {
        code: string;
        percentage: number;
        amount: number;
    } | null;
    total: number;
    couponExpiresAt: Date | null;
}

// Graduated pricing: calculates total by applying each tier's rate
// only to the conversations within that bracket (like tax brackets)
export function calculateGraduatedBase(n: number): { total: number; avgRate: number } {
    let total = 0;
    let remaining = n;

    // Tiers must be sorted by min descending
    const sorted = [...CONVERSATION_TIERS].sort((a, b) => b.min - a.min);

    for (const tier of sorted) {
        if (remaining > tier.min) {
            const slice = remaining - tier.min;
            total += slice * tier.rate;
            remaining = tier.min;
        }
    }

    const avgRate = n > 0 ? total / n : 0;
    return { total, avgRate };
}

export function calculatePricing(state: CalculatorState): CalculationResult {
    // 1. Base Calculation (graduated)
    const { total: baseSubtotal, avgRate: rate } = calculateGraduatedBase(state.conversations);

    // 2. Extras Breakdown
    const extrasBreakdown: BreakdownItem[] = [];

    if (state.instagramComments) {
        extrasBreakdown.push({
            key: "instagram_comments",
            label: EXTRAS_CONFIG.INSTAGRAM_COMMENTS.label,
            qty: 1,
            subtotal: EXTRAS_CONFIG.INSTAGRAM_COMMENTS.price,
        });
    }

    if (state.abandonedCart) {
        extrasBreakdown.push({
            key: "abandoned_cart",
            label: EXTRAS_CONFIG.ABANDONED_CART.label,
            qty: 1,
            subtotal: EXTRAS_CONFIG.ABANDONED_CART.price,
        });
    }

    if (state.prospectorContacts > 0) {
        const units = Math.ceil(state.prospectorContacts / EXTRAS_CONFIG.PROSPECTOR.unitSize);
        extrasBreakdown.push({
            key: "prospector",
            label: EXTRAS_CONFIG.PROSPECTOR.label,
            qty: state.prospectorContacts,
            unitPrice: EXTRAS_CONFIG.PROSPECTOR.pricePerUnit,
            subtotal: units * EXTRAS_CONFIG.PROSPECTOR.pricePerUnit,
        });
    }

    if (state.bulkMessages.enabled && state.bulkMessages.count > 0) {
        const count = Math.max(state.bulkMessages.count, EXTRAS_CONFIG.BULK_MESSAGES.minMessages);
        extrasBreakdown.push({
            key: "bulk_messages",
            label: EXTRAS_CONFIG.BULK_MESSAGES.label,
            qty: count,
            unitPrice: EXTRAS_CONFIG.BULK_MESSAGES.pricePerMessage,
            subtotal: count * EXTRAS_CONFIG.BULK_MESSAGES.pricePerMessage,
        });
    }

    if (state.agentsTotal > EXTRAS_CONFIG.AGENTS.included) {
        const extraQty = state.agentsTotal - EXTRAS_CONFIG.AGENTS.included;
        extrasBreakdown.push({
            key: "agents",
            label: `${EXTRAS_CONFIG.AGENTS.label} extra`,
            qty: extraQty,
            unitPrice: EXTRAS_CONFIG.AGENTS.extraPrice,
            subtotal: extraQty * EXTRAS_CONFIG.AGENTS.extraPrice,
        });
    }

    if (state.linesTotal > EXTRAS_CONFIG.LINES.included) {
        const extraQty = state.linesTotal - EXTRAS_CONFIG.LINES.included;
        extrasBreakdown.push({
            key: "lines",
            label: `${EXTRAS_CONFIG.LINES.label} extra`,
            qty: extraQty,
            unitPrice: EXTRAS_CONFIG.LINES.extraPrice,
            subtotal: extraQty * EXTRAS_CONFIG.LINES.extraPrice,
        });
    }

    if (state.followupRulesTotal > EXTRAS_CONFIG.FOLLOWUP_RULES.included) {
        const extraQty = state.followupRulesTotal - EXTRAS_CONFIG.FOLLOWUP_RULES.included;
        extrasBreakdown.push({
            key: "followup_rules",
            label: `${EXTRAS_CONFIG.FOLLOWUP_RULES.label} extra`,
            qty: extraQty,
            unitPrice: EXTRAS_CONFIG.FOLLOWUP_RULES.extraPrice,
            subtotal: extraQty * EXTRAS_CONFIG.FOLLOWUP_RULES.extraPrice,
        });
    }

    const extrasSubtotal = extrasBreakdown.reduce((sum, item) => sum + item.subtotal, 0);
    let subtotal = baseSubtotal + extrasSubtotal;

    // 3. Discount
    let discount = null;
    let couponExpiresAt: Date | null = null;
    const upperCode = state.couponCode.toUpperCase();
    const coupon: CouponConfig | undefined = COUPONS[upperCode];

    if (coupon && coupon.isValid()) {
        const amount = subtotal * coupon.discount;
        discount = {
            code: upperCode,
            percentage: coupon.discount,
            amount: amount,
        };

        if (coupon.expiresInHours) {
            couponExpiresAt = new Date(Date.now() + coupon.expiresInHours * 60 * 60 * 1000);
        }
    }

    const total = subtotal - (discount?.amount || 0);

    return {
        base: {
            rate,
            subtotal: baseSubtotal,
        },
        extrasBreakdown,
        subtotal,
        discount,
        total,
        couponExpiresAt,
    };
}
