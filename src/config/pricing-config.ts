export interface PricingTier {
  min: number;
  rate: number;
}

// Graduated pricing: each tier defines the marginal rate for conversations
// from this tier's min up to the next tier's min (like tax brackets)
export const CONVERSATION_TIERS: PricingTier[] = [
  { min: 6000, rate: 0.06 },   // 6001+ at $0.06/conv
  { min: 3000, rate: 0.12 },   // 3001-6000 at $0.12/conv
  { min: 1000, rate: 0.05 },   // 1001-3000 at $0.05/conv
  { min: 0, rate: 0.50 },      // 0-1000 at $0.50/conv
];

export const EXTRAS_CONFIG = {
  INSTAGRAM_COMMENTS: {
    price: 35,
    label: "Comentarios Instagram ilimitados",
  },
  PROSPECTOR: {
    pricePerUnit: 150,
    unitSize: 1000,
    label: "Prospectador",
  },
  BULK_MESSAGES: {
    pricePerMessage: 0.06,
    minMessages: 1000,
    label: "Envíos masivos",
  },
  AGENTS: {
    included: 3,
    extraPrice: 5,
    label: "Agentes",
  },
  LINES: {
    included: 3,
    extraPrice: 10,
    label: "Líneas WhatsApp e Instagram",
  },
  FOLLOWUP_RULES: {
    included: 3,
    extraPrice: 5,
    label: "Seguimientos IA por chat",
  },
  ABANDONED_CART: {
    price: 180,
    label: "Carrito Abandonado por WhatsApp",
    show: false,
  },
};

export interface CouponConfig {
  discount: number;
  expiresInHours?: number; // Displayed expiry for urgency
  isValid: () => boolean;
  message: string;
}

export const COUPONS: Record<string, CouponConfig> = {
  RODOLFO: {
    discount: 0.20,
    isValid: () => {
      return true;
    },
    message: "20% de descuento (SOLO HOY!)",
  },
  RODOLFO24: {
    discount: 0.30,
    isValid: () => {
      return true;
    },
    message: "30% de descuento (SOLO HOY!)",
  },
  RODOLFO10: {
    discount: 0.10,
    isValid: () => {
      return true;
    },
    message: "10% de descuento Abonando en la semana",
  },
  RODO48: {
    discount: 0.20,
    expiresInHours: 48,
    isValid: () => {
      return true;
    },
    message: "20% OFF exclusivo - Válido por 48hs",
  },
  RODO48PLUS: {
    discount: 0.45,
    expiresInHours: 48,
    isValid: () => {
      return true;
    },
    message: "45% OFF exclusivo - Válido por 48hs",
  },
};
