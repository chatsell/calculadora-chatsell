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
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

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
      {/* Hidden Printable Section */}
      <div className="pdf-hidden">
        <div
          ref={printableRef}
          id="printable-quote"
          className="p-12 bg-[#ffffff] text-[#000000] min-h-[1100px] w-[800px]"
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-12 bg-[#0f0f0f] -m-12 p-12 mb-8">
            <div>
              <img src="/logo.png" alt="Chatsell" className="h-10 mb-2" />
              <p className="text-[#9ca3af] text-xs">Automatización Inteligente para tu Negocio</p>
            </div>
            <div className="text-right">
              <h2 className="text-[#ffffff] text-xl font-bold tracking-tight">
                PRESUPUESTO {clientName ? `- ${clientName.toUpperCase()}` : ''}
              </h2>
              <p className="text-[#6b7280] text-xs mt-1 lowercase">chatsell.net</p>
            </div>
          </div>

          <div className="flex justify-between mb-12 px-2">
            <div>
              <h3 className="text-[#6b7280] uppercase text-[10px] font-bold tracking-widest mb-2">Detalles del Presupuesto</h3>
              <p className="text-sm font-bold">Fecha: {mounted ? dateStr : ''}</p>
              <p className="text-sm">Hora: {mounted ? timeStr : ''}</p>
            </div>
            <div className="text-right">
              <h3 className="text-[#6b7280] uppercase text-[10px] font-bold tracking-widest mb-2">ID de Seguimiento</h3>
              <p className="text-sm font-mono text-[#2563eb]">{mounted ? trackingId : 'CS-...'}</p>
            </div>
          </div>

          <table className="w-full mb-12 border-collapse">
            <thead>
              <tr className="border-b-2 border-[#f3f4f6] text-left">
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-[#6b7280]">Descripción</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-[#6b7280] text-center">Cantidad</th>
                <th className="py-4 text-xs font-bold uppercase tracking-wider text-[#6b7280] text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#f9fafb]">
                <td className="py-5">
                  <p className="font-bold text-sm">Plan Base de Conversaciones</p>
                  <p className="text-xs text-[#6b7280] italic">Tarifa aplicada: ${result.base.rate.toFixed(2)}/conv</p>
                </td>
                <td className="py-5 text-sm text-center">{state.conversations.toLocaleString()}</td>
                <td className="py-5 text-sm font-bold text-right">{formatCurrency(result.base.subtotal)}</td>
              </tr>
              {result.extrasBreakdown.map((item, idx) => (
                <tr key={idx} className="border-b border-[#f9fafb]">
                  <td className="py-5">
                    <p className="font-bold text-sm">{item.label}</p>
                    {item.unitPrice && <p className="text-xs text-[#6b7280] italic">Unitario: ${item.unitPrice}/u</p>}
                  </td>
                  <td className="py-5 text-sm text-center">{item.qty > 1 ? item.qty.toLocaleString() : '-'}</td>
                  <td className="py-5 text-sm font-bold text-right">{formatCurrency(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-24 pr-2">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b7280]">Subtotal</span>
                <span className="font-bold">{formatCurrency(result.subtotal)}</span>
              </div>
              {result.discount && (
                <div className="flex justify-between text-sm text-[#16a34a]">
                  <span>Descuento ({result.discount.code})</span>
                  <span className="font-bold">-{formatCurrency(result.discount.amount)}</span>
                </div>
              )}
              <div className="pt-4 border-t-2 border-[#111827] flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-tighter">Total Mensual</span>
                <span className="text-2xl font-black text-[#2563eb] leading-none">
                  {formatCurrency(result.total)}
                </span>
              </div>
              {result.discount && (
                <p className="text-[10px] text-right text-[#9ca3af] italic mt-2">
                  * {COUPONS[result.discount.code as keyof typeof COUPONS]?.message}
                </p>
              )}
              {result.couponExpiresAt && (
                <div className="mt-4 p-3 border-2 border-[#dc2626] rounded-lg text-center">
                  <p className="text-[11px] font-black text-[#dc2626] uppercase tracking-wide">
                    Oferta válida hasta: {result.couponExpiresAt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })} {result.couponExpiresAt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-[#e5e7eb] pt-8">
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-[#111827]">Términos y Condiciones</h4>
            <ul className="text-[10px] text-[#4b5563] space-y-2 leading-relaxed">
              <li>1. Este presupuesto tiene una validez de {result.couponExpiresAt ? '48 horas' : '7 días naturales'} a partir de su emisión.</li>
              <li>2. Los precios están expresados en Dólares Estadounidenses (USD).</li>
              <li>3. El servicio se factura de forma mensual y prepaga.</li>
              <li>4. Chatsell garantiza un uptime del 99.9% en sus servicios de automatización.</li>
              <li>5. Los agentes y líneas adicionales se ajustan proporcionalmente si se solicitan a mitad del ciclo.</li>
            </ul>
            <p className="text-center text-[9px] text-[#9ca3af] mt-12 italic">
              Este es un presupuesto informativo generado automáticamente por el sistema de Chatsell.
            </p>
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
