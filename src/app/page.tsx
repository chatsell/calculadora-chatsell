'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Instagram,
  Search,
  Send,
  Users,
  Globe,
  Zap,
  CreditCard,
  Percent,
  ChevronRight,
  ShoppingCart,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { calculatePricing, CalculatorState, CalculationResult } from '@/lib/pricing-engine';
import { EXTRAS_CONFIG, COUPONS } from '@/config/pricing-config';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Calculator() {
  const [state, setState] = useState<CalculatorState>({
    conversations: 1000,
    instagramComments: false,
    abandonedCart: false,
    prospectorContacts: 0,
    bulkMessages: { enabled: false, count: 0 },
    agentsTotal: 3,
    linesTotal: 3,
    followupRulesTotal: 3,
    couponCode: '',
  });

  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [clientName, setClientName] = useState('');
  const printableRef = useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const [timeStr, setTimeStr] = useState('');
  const [trackingId, setTrackingId] = useState('');

  useEffect(() => {
    setMounted(true);
    setDateStr(new Date().toLocaleDateString());
    setTimeStr(new Date().toLocaleTimeString());
    setTrackingId(`CS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  }, []);

  const result: CalculationResult = useMemo(() => {
    return calculatePricing({ ...state, couponCode: appliedCoupon });
  }, [state, appliedCoupon]);

  const updateState = (key: keyof CalculatorState, value: CalculatorState[keyof CalculatorState]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = async () => {
    if (!printableRef.current) return;

    if (!clientName.trim()) {
      alert('Por favor ingresa el nombre del cliente antes de generar el presupuesto.');
      return;
    }

    console.log('Generating PDF for client:', clientName);

    setIsExporting(true);
    try {
      // Small delay to ensure any layout shifts are settled
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(printableRef.current, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const hiddenDiv = clonedDoc.querySelector('.pdf-hidden') as HTMLElement;
          if (hiddenDiv) {
            hiddenDiv.style.visibility = 'visible';
            hiddenDiv.style.position = 'absolute';
            hiddenDiv.style.zIndex = 'auto'; // Ensure it renders on top in the clone
            hiddenDiv.style.left = '0';
            hiddenDiv.style.top = '0';
          }
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', [pdfWidth, pdfHeight]);

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const safeClientName = clientName.trim().replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const dateFilename = new Date().toISOString().split('T')[0];
      const finalFilename = `presupuesto_chatsell_${safeClientName}_${dateFilename}.pdf`;

      console.log('Saving PDF with filename:', finalFilename);
      pdf.save(finalFilename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <main className="min-h-screen py-12 px-4 md:px-8 max-w-6xl mx-auto">
      {/* Hidden Printable Section - New Professional Format */}
      <div className="pdf-hidden">
        <div
          ref={printableRef}
          id="printable-quote"
          style={{ width: '800px', background: '#ffffff', fontFamily: "'Golos Text', sans-serif", color: '#111827', margin: 0, padding: 0 }}
        >
          {/* 1. HEADER */}
          <div style={{ background: '#0F172A', borderBottom: '2.5px solid #3B82F6', padding: '14px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M5 7C5 5.34 6.34 4 8 4h8c1.66 0 3 1.34 3 3v6c0 1.66-1.34 3-3 3h-2l-4 3.5V16H8c-1.66 0-3-1.34-3-3V7z" fill="white" opacity="0.45"/>
                <path d="M13 12c-1.66 0-3 1.34-3 3v6c0 1.66 1.34 3 3 3h2v3.5l4-3.5h5c1.66 0 3-1.34 3-3v-6c0-1.66-1.34-3-3-3H13z" fill="white"/>
              </svg>
              <span style={{ color: 'white', fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px' }}>chatsell</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#94A3B8', fontSize: '11px', marginBottom: '2px' }}>chatsell.net</div>
              <div style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>Automatizacion Inteligente</div>
              <div style={{ color: '#94A3B8', fontSize: '12px' }}>para tu Negocio</div>
            </div>
          </div>

          {/* 2. PARTNERS BAR */}
          <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', padding: '14px 40px', textAlign: 'center' }}>
            <div style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>PARTNERS OFICIALES</div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '60px' }}>
              {/* OpenAI Logo */}
              <svg width="100" height="24" viewBox="0 0 100 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2c1.86 0 3.55.68 4.88 1.78L8.24 17.54A7.96 7.96 0 014 12c0-4.42 3.58-8 8-8zm0 16a7.96 7.96 0 01-4.88-1.78l8.64-11.76A7.96 7.96 0 0120 12c0 4.42-3.58 8-8 8z" fill="#1A1A1A"/>
                <text x="28" y="16" fontFamily="'Golos Text', sans-serif" fontSize="14" fontWeight="600" fill="#1A1A1A">OpenAI</text>
              </svg>
              {/* Meta Logo */}
              <svg width="80" height="28" viewBox="0 0 80 28" fill="none">
                <path d="M8 6c-4 0-6 4-6 8s2.5 8 6 8c2.5 0 4-1.5 6-4.5 2 3 3.5 4.5 6 4.5 3.5 0 6-4 6-8s-2-8-6-8c-2.5 0-4 1.5-6 4.5C12 7.5 10.5 6 8 6zm0 3c1.5 0 2.8 1.2 4.5 4-1.7 2.8-3 4-4.5 4-2.2 0-3.5-2.8-3.5-5s1.3-3 3.5-3zm12 0c2.2 0 3.5 1 3.5 3s-1.3 5-3.5 5c-1.5 0-2.8-1.2-4.5-4 1.7-2.8 3-4 4.5-4z" fill="#0668E1"/>
                <text x="32" y="18" fontFamily="'Golos Text', sans-serif" fontSize="14" fontWeight="700" fill="#0668E1">Meta</text>
              </svg>
            </div>
          </div>

          {/* 3. TITULO Y DATOS DEL PRESUPUESTO */}
          <div style={{ padding: '28px 40px 0 40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0 }}>PRESUPUESTO</h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#6B7280', fontSize: '11px', marginBottom: '2px' }}>Preparado para</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{clientName ? clientName.toUpperCase() : ''}</div>
              </div>
            </div>
            {/* 4 metric cards */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
              <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '4px', borderTop: '3px solid #9CA3AF', padding: '10px 12px' }}>
                <div style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>FECHA</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{mounted ? dateStr : ''}</div>
              </div>
              <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '4px', borderTop: '3px solid #9CA3AF', padding: '10px 12px' }}>
                <div style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>HORA</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{mounted ? timeStr : ''}</div>
              </div>
              <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '4px', borderTop: '3px solid #3B82F6', padding: '10px 12px' }}>
                <div style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>ID SEGUIMIENTO</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#3B82F6' }}>{mounted ? trackingId : 'CS-...'}</div>
              </div>
              <div style={{ flex: 1, background: '#F9FAFB', borderRadius: '4px', borderTop: '3px solid #F59E0B', padding: '10px 12px' }}>
                <div style={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>VALIDEZ</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>7 dias</div>
              </div>
            </div>
          </div>

          {/* 4. DETALLE DEL SERVICIO */}
          <div style={{ padding: '0 40px 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '3.5px', height: '20px', background: '#3B82F6', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#111827', margin: 0, letterSpacing: '0.5px' }}>DETALLE DEL SERVICIO</h2>
            </div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginLeft: '14px', marginBottom: '16px', marginTop: '2px' }}>Automatizacion multicanal con inteligencia artificial</p>
            <div style={{ borderTop: '1px solid #E5E7EB' }}>
              {[
                { name: 'WhatsApp Business', desc: 'Automatizacion completa de respuestas, seguimiento y cierre de ventas.' },
                { name: 'Instagram DM', desc: 'Respuestas automaticas a mensajes directos. Convierte seguidores en clientes.' },
                { name: 'Facebook Messenger', desc: 'Atencion automatizada via tu pagina de Facebook. Respuestas 24/7.' },
                { name: 'Web Chat', desc: 'Widget embebido en tu sitio web. Captura leads en tiempo real.' },
              ].map((channel, i) => (
                <div key={i} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #E5E7EB', background: i % 2 === 0 ? '#F9FAFB' : 'white' }}>
                  <div style={{ width: '180px', fontWeight: 700, fontSize: '12px', color: '#111827', padding: '0 12px' }}>{channel.name}</div>
                  <div style={{ flex: 1, fontSize: '12px', color: '#4B5563', padding: '0 12px' }}>{channel.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. DESGLOSE DE INVERSION */}
          <div style={{ padding: '0 40px 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '3.5px', height: '20px', background: '#3B82F6', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#111827', margin: 0, letterSpacing: '0.5px' }}>DESGLOSE DE INVERSION</h2>
            </div>
            {/* Table header */}
            <div style={{ display: 'flex', background: '#0F172A', color: 'white', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 14px', borderRadius: '4px 4px 0 0' }}>
              <div style={{ flex: 2 }}>DESCRIPCION</div>
              <div style={{ flex: 1, textAlign: 'center' }}>TARIFA</div>
              <div style={{ flex: 1, textAlign: 'center' }}>CANTIDAD</div>
              <div style={{ flex: 1, textAlign: 'right' }}>MONTO</div>
            </div>
            {/* Base plan row */}
            <div style={{ display: 'flex', padding: '14px', borderBottom: '1px solid #E5E7EB', alignItems: 'center' }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>Plan Base de Conversaciones</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Conversaciones automatizadas con IA en todos los canales</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#374151' }}>${result.base.rate.toFixed(2)}/conv</div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#374151' }}>{state.conversations.toLocaleString()}</div>
              <div style={{ flex: 1, textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{formatCurrency(result.base.subtotal)}</div>
            </div>
            {/* Extra rows */}
            {result.extrasBreakdown.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', padding: '12px 14px', borderBottom: '1px solid #E5E7EB', alignItems: 'center', background: idx % 2 === 0 ? '#F9FAFB' : 'white' }}>
                <div style={{ flex: 2 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{item.label}</div>
                </div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#374151' }}>
                  {item.unitPrice ? `$${item.unitPrice}/u` : '-'}
                </div>
                <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: '#374151' }}>
                  {item.qty > 1 ? item.qty.toLocaleString() : '-'}
                </div>
                <div style={{ flex: 1, textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{formatCurrency(item.subtotal)}</div>
              </div>
            ))}
            {/* Subtotal, Discount, Total */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 14px' }}>
                <div style={{ width: '260px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#374151' }}>Subtotal</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{formatCurrency(result.subtotal)}</span>
                </div>
              </div>
              {result.discount && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 14px' }}>
                  <div style={{ width: '260px', display: 'flex', justifyContent: 'space-between', fontSize: '13px', alignItems: 'center' }}>
                    <span style={{ color: '#374151' }}>
                      Descuento<br/>
                      <span style={{ fontSize: '11px' }}>({result.discount.code})</span><br/>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>-{(result.discount.percentage * 100).toFixed(0)}%</span>
                    </span>
                    <span style={{ fontWeight: 700, color: '#10B981' }}>-{formatCurrency(result.discount.amount)}</span>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 14px', marginTop: '8px' }}>
                <div style={{ width: '260px', borderTop: '3px solid #0F172A', background: '#ECFDF5', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '0 0 4px 4px' }}>
                  <span style={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', color: '#0F172A' }}>TOTAL<br/>MENSUAL</span>
                  <span>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: '#059669' }}>{formatCurrency(result.total)}</span>
                    <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '4px' }}>USD</span>
                  </span>
                </div>
              </div>
              {result.discount && (
                <div style={{ textAlign: 'right', padding: '8px 14px 0 0' }}>
                  <span style={{ fontSize: '10px', color: '#10B981', fontStyle: 'italic', fontWeight: 600 }}>
                    * Descuento del {(result.discount.percentage * 100).toFixed(0)}% con codigo {result.discount.code}. Oferta por tiempo limitado.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 6. QUE INCLUYE TU PLAN */}
          <div style={{ padding: '8px 40px 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '3.5px', height: '20px', background: '#10B981', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#111827', margin: 0, letterSpacing: '0.5px' }}>QUE INCLUYE TU PLAN</h2>
            </div>
            <div style={{ display: 'flex', gap: '24px' }}>
              {/* Left column */}
              <div style={{ flex: 1 }}>
                {[
                  { title: 'Conversaciones con IA', desc: `Hasta ${state.conversations.toLocaleString()} conversaciones automatizadas al mes en todos tus canales.` },
                  { title: 'Onboarding Asistido', desc: 'Configuracion completa: personalizacion del bot, integracion de canales y capacitacion.' },
                  { title: 'Soporte Dedicado via WhatsApp', desc: 'Lunes a viernes de 9 a 18hs. Una persona dedicada exclusivamente a tu cuenta.' },
                  { title: 'CRM Integrado', desc: 'Gestion de contactos, historial de conversaciones, etiquetas y seguimiento de cada cliente desde la plataforma.' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: '#10B981', fontWeight: 700, fontSize: '14px', lineHeight: '18px' }}>&#10003;</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '12px', color: '#111827', marginBottom: '2px' }}>{item.title}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: '1.4' }}>{item.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Right column */}
              <div style={{ flex: 1 }}>
                {[
                  { title: 'Panel de Analiticas', desc: 'Metricas de conversaciones, tasas de respuesta y reportes exportables en tiempo real.' },
                  { title: 'Actualizaciones', desc: 'Acceso a mejoras y nuevas funcionalidades sin costo adicional durante tu suscripcion.' },
                  { title: 'Multicanal Unificado', desc: 'WhatsApp, Instagram, Messenger y Web Chat gestionados desde una sola plataforma.' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: '#10B981', fontWeight: 700, fontSize: '14px', lineHeight: '18px' }}>&#10003;</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '12px', color: '#111827', marginBottom: '2px' }}>{item.title}</div>
                        <div style={{ fontSize: '11px', color: '#6B7280', lineHeight: '1.4' }}>{item.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 7. PREGUNTAS FRECUENTES */}
          <div style={{ padding: '8px 40px 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '3.5px', height: '20px', background: '#1E293B', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#111827', margin: 0, letterSpacing: '0.5px' }}>PREGUNTAS FRECUENTES</h2>
            </div>
            <div style={{ borderTop: '1px solid #E5E7EB' }}>
              {[
                { q: 'Como funciona el cobro por conversacion?', a: 'Cada interaccion completa con un usuario cuenta como una conversacion. Sin limite de mensajes internos; solo se cuenta una vez por usuario por sesion.' },
                { q: 'Que pasa si supero el limite?', a: 'Te notificamos con anticipacion. Podras adquirir un paquete adicional a la misma tarifa o ajustar tu plan. El servicio nunca se interrumpe sin aviso.' },
                { q: 'Cuanto tiempo toma el desarrollo?', a: 'Los desarrollos toman entre 15 y 30 dias segun la complejidad del proyecto y la rapidez de respuesta del cliente. Incluye configuracion, integracion y capacitacion.' },
                { q: 'Puedo personalizar las respuestas?', a: 'Si. Definimos junto a vos el tono, estilo y contenido. Podes pedir ajustes en cualquier momento via soporte sin costo adicional.' },
                { q: 'Puedo cancelar o cambiar mi plan?', a: 'Si. Facturacion mensual y prepaga. Podes cancelar, ajustar o escalar al finalizar cada ciclo sin penalidades.' },
                { q: 'Como protegen los datos?', a: 'Encriptacion de extremo a extremo. La informacion de tus clientes nunca se comparte con terceros ni se usa para otros fines.' },
              ].map((faq, i) => (
                <div key={i} style={{ display: 'flex', padding: '10px 0', borderBottom: '1px solid #E5E7EB', background: i % 2 === 0 ? '#F9FAFB' : 'white' }}>
                  <div style={{ width: '33%', padding: '0 12px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', minWidth: '8px', borderRadius: '50%', background: '#3B82F6', marginTop: '4px' }} />
                    <span style={{ fontWeight: 700, fontSize: '11px', color: '#111827' }}>{faq.q}</span>
                  </div>
                  <div style={{ width: '67%', padding: '0 12px', fontSize: '11px', color: '#4B5563', lineHeight: '1.5', textAlign: 'justify' }}>{faq.a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 8. GARANTIAS Y COMPROMISOS */}
          <div style={{ padding: '8px 40px 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '3.5px', height: '20px', background: '#10B981', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#111827', margin: 0, letterSpacing: '0.5px' }}>GARANTIAS Y COMPROMISOS</h2>
            </div>
            <div style={{ display: 'flex', gap: '0', border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
              {[
                { color: '#10B981', title: '99.9% Uptime', desc: 'Disponibilidad garantizada.' },
                { color: '#3B82F6', title: 'Soporte WhatsApp', desc: 'Lun a Vie 9-18hs. Persona dedicada.' },
                { color: '#F59E0B', title: 'Sin Permanencia', desc: 'Sin contratos ni clausulas de salida.' },
                { color: '#0F172A', title: 'Seguridad Total', desc: 'Encriptacion extremo a extremo.' },
              ].map((g, i) => (
                <div key={i} style={{ flex: 1, background: '#F9FAFB', padding: '16px 12px', textAlign: 'center', borderRight: i < 3 ? '1px solid #E5E7EB' : 'none' }}>
                  <div style={{ display: 'inline-block', width: '10px', height: '10px', background: g.color, borderRadius: '2px', marginBottom: '8px' }} />
                  <div style={{ fontWeight: 700, fontSize: '12px', color: '#111827', marginBottom: '4px' }}>{g.title}</div>
                  <div style={{ fontSize: '10px', color: '#6B7280', lineHeight: '1.4' }}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 9. TERMINOS Y CONDICIONES */}
          <div style={{ padding: '8px 40px 24px 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '3.5px', height: '20px', background: '#9CA3AF', borderRadius: '2px' }} />
              <h2 style={{ fontSize: '15px', fontWeight: 700, textTransform: 'uppercase', color: '#111827', margin: 0, letterSpacing: '0.5px' }}>TERMINOS Y CONDICIONES</h2>
            </div>
            <p style={{ fontSize: '10px', color: '#6B7280', lineHeight: '1.6', margin: 0 }}>
              <strong>1.</strong> Presupuesto valido por 7 dias desde la emision. Precios en USD. <strong>2.</strong> Facturacion mensual y prepaga. Ciclo desde la activacion del servicio. <strong>3.</strong> Uptime garantizado del 99.9%. Credito proporcional en caso de incumplimiento. <strong>4.</strong> Desarrollo e implementacion: 15 a 30 dias segun complejidad y respuesta del cliente. <strong>5.</strong> Tarifas modificables con 30 dias de aviso. Cancelacion: 5 dias antes del siguiente ciclo. <strong>6.</strong> El cliente debe proveer accesos a sus canales para la correcta integracion.
            </p>
          </div>

          {/* 10. CTA */}
          <div style={{ padding: '0 40px 16px 40px' }}>
            <div style={{ background: '#ECFDF5', border: '1px solid #10B981', borderRadius: '6px', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827', marginBottom: '4px' }}>Listo para automatizar tu negocio?</div>
                <div style={{ fontSize: '12px', color: '#4B5563' }}>Contactanos para activar tu plan. Respuesta inmediata por WhatsApp.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#059669', marginBottom: '2px' }}>WhatsApp: +54 9 351 737 3811</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Instagram: @chatsellapp | Web: chatsell.net</div>
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '9px', color: '#9CA3AF', fontStyle: 'italic', marginTop: '10px' }}>
              Presupuesto informativo generado por Chatsell. Para confirmar, comunicate con nuestro equipo comercial.
            </p>
          </div>

          {/* 11. FOOTER */}
          <div style={{ background: '#0F172A', borderTop: '2px solid #3B82F6', padding: '16px 40px', textAlign: 'center' }}>
            <div style={{ color: 'white', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>Chatsell | Automatizacion Inteligente para tu Negocio</div>
            <div style={{ color: '#94A3B8', fontSize: '10px' }}>WhatsApp: +54 9 351 737 3811 / +54 9 351 747 5321 | Instagram: @chatsellapp | Web: chatsell.net</div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Calculadora de Costos <span className="gradient-text">Chatsell</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-6">
          Diseña el plan perfecto para tu negocio. Ajusta las conversaciones y features para obtener un presupuesto a medida.
        </p>
        <Link
          href="/presupuesto"
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-6 py-3 rounded-xl font-bold transition-all"
        >
          <FileText size={20} />
          Crear Presupuesto Personalizado
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls */}
        <div className="lg:col-span-2 space-y-8">

          {/* Section A: Plan Base */}
          <section className="glass-card p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Conversaciones por mes</h2>
                <p className="text-sm text-gray-400">Selecciona el volumen de interacciones mensuales</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-3xl font-bold">{state.conversations.toLocaleString()}</span>
                <span className="text-blue-400 font-medium">USD {result.base.rate.toFixed(2)} / conv</span>
              </div>
              <input
                type="range"
                min="1000"
                max="20000"
                step="500"
                value={state.conversations}
                onChange={(e) => updateState('conversations', parseInt(e.target.value))}
                className="w-full"
                style={{ '--range-progress': `${((state.conversations - 1000) / (20000 - 1000)) * 100}%` } as React.CSSProperties}
              />
              <div className="relative h-10 flex items-center">
                <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                  {[0, 1000, 3000, 6000, 10000].map((v) => (
                    <div key={v} className="flex flex-col items-center">
                      <div className={`w-1 h-3 rounded-full mb-1 ${state.conversations >= v ? 'bg-blue-500' : 'bg-white/10'}`} />
                      <span className="text-[10px] text-gray-500 font-bold">{v >= 1000 ? `${v / 1000}k` : v}</span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center">
                    <div className={`w-1 h-3 rounded-full mb-1 ${state.conversations >= 20000 ? 'bg-blue-500' : 'bg-white/10'}`} />
                    <span className="text-[10px] text-gray-500 font-bold">20k+</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section B: Extras */}
          <section className="glass-card p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                <Zap size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Features Extra</h2>
                <p className="text-sm text-gray-400">Potencia tu estrategia con herramientas adicionales</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Instagram Comments */}
              <div className={`p-5 rounded-2xl border transition-all ${state.instagramComments ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500">
                    <Instagram size={20} />
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={state.instagramComments}
                      onChange={(e) => updateState('instagramComments', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <h3 className="font-bold mb-1">{EXTRAS_CONFIG.INSTAGRAM_COMMENTS.label}</h3>
                <p className="text-sm text-gray-400">Automatiza respuestas en posts</p>
                <div className="mt-4 font-bold text-primary">USD {EXTRAS_CONFIG.INSTAGRAM_COMMENTS.price} / mes</div>
              </div>

              {/* Prospector */}
              <div className={`p-5 rounded-2xl border transition-all ${state.prospectorContacts > 0 ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                    <Search size={20} />
                  </div>
                  <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded">USD 150 c/ 1000</span>
                </div>
                <h3 className="font-bold mb-1">{EXTRAS_CONFIG.PROSPECTOR.label}</h3>
                <input
                  type="number"
                  value={state.prospectorContacts}
                  onChange={(e) => updateState('prospectorContacts', Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="Cantidad de contactos"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-2 outline-none focus:border-primary/50"
                />
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wide">Múltiplos de 1,000</p>
              </div>

              {/* Bulk Messages */}
              <div className={`p-5 rounded-2xl border transition-all ${state.bulkMessages.enabled ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                    <Send size={20} />
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={state.bulkMessages.enabled}
                      onChange={(e) => updateState('bulkMessages', { ...state.bulkMessages, enabled: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <h3 className="font-bold mb-1">{EXTRAS_CONFIG.BULK_MESSAGES.label}</h3>
                {state.bulkMessages.enabled && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                    <input
                      type="number"
                      value={state.bulkMessages.count}
                      onChange={(e) => updateState('bulkMessages', { ...state.bulkMessages, count: Math.max(0, parseInt(e.target.value) || 0) })}
                      placeholder="Mínimo 1,000"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 mt-2 outline-none focus:border-primary/50"
                    />
                    <div className="mt-2 text-xs font-medium text-blue-400">USD 0.06 / envío</div>
                  </motion.div>
                )}
                {!state.bulkMessages.enabled && <p className="text-sm text-gray-400">Envíos masivos a contactos</p>}
              </div>

              {/* Abandoned Cart */}
              {EXTRAS_CONFIG.ABANDONED_CART.show && (
                <div className={`p-5 rounded-2xl border transition-all ${state.abandonedCart ? 'border-primary bg-primary/5' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                      <ShoppingCart size={20} />
                    </div>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={state.abandonedCart}
                        onChange={(e) => updateState('abandonedCart', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <h3 className="font-bold mb-1">{EXTRAS_CONFIG.ABANDONED_CART.label}</h3>
                  <p className="text-sm text-gray-400">Recupera ventas perdidas automáticamente</p>
                  <div className="mt-4 font-bold text-primary">USD {EXTRAS_CONFIG.ABANDONED_CART.price} / mes</div>
                </div>
              )}

            </div>

            {/* Incremental Extras */}
            <div className="mt-8 space-y-6 pt-8 border-t border-white/5">

              {/* Agents */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{EXTRAS_CONFIG.AGENTS.label}</h3>
                    <p className="text-xs text-gray-400">{EXTRAS_CONFIG.AGENTS.included} incluidos. USD {EXTRAS_CONFIG.AGENTS.extraPrice} / extra</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateState('agentsTotal', Math.max(1, state.agentsTotal - 1))} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">-</button>
                  <span className="w-12 text-center text-xl font-bold">{state.agentsTotal}</span>
                  <button onClick={() => updateState('agentsTotal', state.agentsTotal + 1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">+</button>
                </div>
              </div>

              {/* Lines */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-500">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{EXTRAS_CONFIG.LINES.label}</h3>
                    <p className="text-xs text-gray-400">{EXTRAS_CONFIG.LINES.included} incluidas. USD {EXTRAS_CONFIG.LINES.extraPrice} / extra</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateState('linesTotal', Math.max(1, state.linesTotal - 1))} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">-</button>
                  <span className="w-12 text-center text-xl font-bold">{state.linesTotal}</span>
                  <button onClick={() => updateState('linesTotal', state.linesTotal + 1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">+</button>
                </div>
              </div>

              {/* Followup Rules */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{EXTRAS_CONFIG.FOLLOWUP_RULES.label}</h3>
                    <p className="text-xs text-gray-400">{EXTRAS_CONFIG.FOLLOWUP_RULES.included} incluidas. USD {EXTRAS_CONFIG.FOLLOWUP_RULES.extraPrice} / extra</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateState('followupRulesTotal', Math.max(1, state.followupRulesTotal - 1))} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">-</button>
                  <span className="w-12 text-center text-xl font-bold">{state.followupRulesTotal}</span>
                  <button onClick={() => updateState('followupRulesTotal', state.followupRulesTotal + 1)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">+</button>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 sticky top-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CreditCard size={24} className="text-primary" />
              Resumen
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Base ({state.conversations} conv)</span>
                <span className="font-medium">{formatCurrency(result.base.subtotal)}</span>
              </div>

              <AnimatePresence>
                {result.extrasBreakdown.map((item) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-400">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="font-bold">Subtotal</span>
                <span className="font-bold">{formatCurrency(result.subtotal)}</span>
              </div>

              {/* Coupon Section */}
              <div className="pt-4 space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Código de cupón"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/50"
                    onChange={(e) => updateState('couponCode', e.target.value)}
                    value={state.couponCode}
                  />
                  <button
                    onClick={() => setAppliedCoupon(state.couponCode)}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                  >
                    Aplicar
                  </button>
                </div>

                {result.discount && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-500/10 text-green-500 p-3 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Percent size={14} />
                    <span className="flex-1">Cupón <strong>{result.discount.code}</strong> aplicado</span>
                    <span>-{formatCurrency(result.discount.amount)}</span>
                  </motion.div>
                )}

                {result.couponExpiresAt && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-red-500/10 text-red-400 p-3 rounded-lg text-xs text-center font-bold"
                  >
                    Oferta válida hasta {result.couponExpiresAt.toLocaleDateString('es-AR')} {result.couponExpiresAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </motion.div>
                )}

                {state.couponCode && appliedCoupon === state.couponCode && !result.discount && (
                  <p className="text-red-400 text-xs px-1">Cupón inválido o expirado</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Total Mensual</p>
                <div className="text-5xl font-black gradient-text">
                  {formatCurrency(result.total)}
                </div>
              </div>

              {/* Client Name Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Nombre del Cliente</label>
                <input
                  type="text"
                  placeholder="Empresa o Cliente"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 outline-none focus:border-primary/50 transition-all font-bold"
                />
              </div>

              <button
                onClick={handleExport}
                disabled={isExporting}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? 'Generando...' : 'Quiero este plan'}
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[10px] text-center text-gray-500 px-4">
                * Los precios están expresados en USD y no incluyen impuestos locales si aplican.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
