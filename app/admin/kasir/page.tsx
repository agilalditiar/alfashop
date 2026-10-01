'use client';

import { useMemo, useState } from 'react';
import { Banknote, Minus, Plus, ShoppingBag, Trash2, Utensils, Coffee, Cookie, PackageOpen, Check } from 'lucide-react';

const products = [
  { id: 1, name: 'Iced Matcha Latte', category: 'Drinks', price: 28000, tone: 'from-emerald-100 to-lime-50', icon: Coffee },
  { id: 2, name: 'Caramel Macchiato', category: 'Drinks', price: 32000, tone: 'from-amber-100 to-orange-50', icon: Coffee },
  { id: 3, name: 'Crispy Chicken Wrap', category: 'Food', price: 42000, tone: 'from-orange-100 to-yellow-50', icon: Utensils },
  { id: 4, name: 'Avocado Toast', category: 'Food', price: 36000, tone: 'from-green-100 to-emerald-50', icon: Utensils },
  { id: 5, name: 'Sea Salt Croissant', category: 'Snacks', price: 24000, tone: 'from-yellow-100 to-amber-50', icon: Cookie },
  { id: 6, name: 'Chocolate Chip Cookie', category: 'Snacks', price: 18000, tone: 'from-orange-100 to-rose-50', icon: Cookie },
  { id: 7, name: 'Berry Smoothie', category: 'Drinks', price: 30000, tone: 'from-pink-100 to-rose-50', icon: Coffee },
  { id: 8, name: 'Classic Pancakes', category: 'Food', price: 39000, tone: 'from-yellow-100 to-orange-50', icon: Utensils },
];

const formatPrice = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

type CartItem = (typeof products)[number] & { quantity: number };

export default function KasirPOSPage() {
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([products[0], products[4]].map((product) => ({ ...product, quantity: 1 })));
  const [paid, setPaid] = useState(false);

  const filteredProducts = category === 'All' ? products : products.filter((product) => product.category === category);
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const addToCart = (product: (typeof products)[number]) => {
    setPaid(false);
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...product, quantity: 1 }];
    });
    if (navigator.vibrate) navigator.vibrate(35);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((current) => current.flatMap((item) => item.id === id
      ? item.quantity + delta > 0 ? [{ ...item, quantity: item.quantity + delta }] : []
      : [item]));
  };

  return (
    <div className="flex h-dvh min-h-[620px] overflow-hidden bg-[#f8faf9] text-slate-950">
      <section className="flex min-w-0 flex-1 flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex flex-wrap items-center justify-between gap-5 pb-7">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[#153c35] text-white shadow-lg shadow-[#153c35]/15"><ShoppingBag className="size-5" /></div>
            <div><p className="text-xl font-black tracking-tight">Alfa<span className="text-[#e66b3d]">shop</span></p><p className="text-xs font-semibold text-slate-500">Counter 01 · Open</p></div>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500">Tuesday, Oct 1 · 10:24 AM</div>
        </header>

        <div className="mb-7 flex items-center justify-between gap-4">
          <div><h1 className="text-2xl font-black tracking-tight sm:text-3xl">Good morning, Alex</h1><p className="mt-1 text-sm text-slate-500">Select products to add them to the order.</p></div>
          <div className="hidden rounded-xl bg-white px-4 py-3 text-right shadow-sm ring-1 ring-slate-200/70 sm:block"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Today&apos;s sales</p><p className="text-lg font-black text-[#153c35]">Rp 4.280.000</p></div>
        </div>

        <nav aria-label="Product categories" className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {['All', 'Drinks', 'Food', 'Snacks'].map((item) => <button key={item} onClick={() => setCategory(item)} className={`min-h-11 rounded-xl px-5 text-sm font-bold transition-all active:scale-95 ${category === item ? 'bg-[#153c35] text-white shadow-md shadow-[#153c35]/20' : 'border border-slate-200 bg-white text-slate-500 hover:border-[#153c35]/30 hover:text-[#153c35]'}`}>{item}</button>)}
        </nav>

        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4 pb-6 sm:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => { const Icon = product.icon; return <button key={product.id} onClick={() => addToCart(product)} className="group flex min-h-[220px] flex-col rounded-2xl bg-white p-3 text-left shadow-sm ring-1 ring-slate-200/80 transition-all duration-150 hover:-translate-y-1 hover:shadow-lg hover:ring-[#153c35]/20 active:scale-[0.96]">
              <div className={`relative flex aspect-[1.15] w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${product.tone}`}><Icon className="size-14 text-slate-700/30 transition-transform duration-300 group-hover:scale-110" /><span className="absolute bottom-2 left-2 rounded-md bg-white/70 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">{product.category}</span></div>
              <div className="flex flex-1 flex-col px-1 pt-3"><h2 className="font-bold leading-tight text-slate-800">{product.name}</h2><p className="mt-auto pt-3 text-lg font-black text-[#153c35]">{formatPrice(product.price)}</p></div>
            </button>; })}
          </div>
        </div>
      </section>

      <aside className="flex w-[360px] max-w-[38%] shrink-0 flex-col border-l border-slate-200 bg-[#eef2f0] px-5 py-6 sm:px-7">
        <div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Current order</p><h2 className="mt-1 text-2xl font-black tracking-tight">Order summary</h2></div><div className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#153c35]">#{String(1284).padStart(4, '0')}</div></div>
        <div className="mt-7 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {cart.length === 0 ? <div className="flex flex-1 flex-col items-center justify-center text-center text-slate-400"><PackageOpen className="mb-3 size-10" /><p className="font-bold">Your cart is empty</p><p className="mt-1 text-sm">Tap a product to start an order.</p></div> : cart.map((item) => <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60"><div className="flex justify-between gap-3"><div><p className="font-bold text-slate-800">{item.name}</p><p className="mt-1 text-xs font-semibold text-slate-400">{formatPrice(item.price)} each</p></div><p className="font-black text-[#153c35]">{formatPrice(item.price * item.quantity)}</p></div><div className="mt-3 flex items-center gap-2"><button aria-label={`Decrease ${item.name}`} onClick={() => updateQuantity(item.id, -1)} className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 active:scale-90"><Minus className="size-4" /></button><span className="w-8 text-center font-black">{item.quantity}</span><button aria-label={`Increase ${item.name}`} onClick={() => updateQuantity(item.id, 1)} className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 active:scale-90"><Plus className="size-4" /></button><button aria-label={`Remove ${item.name}`} onClick={() => updateQuantity(item.id, -item.quantity)} className="ml-auto flex size-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"><Trash2 className="size-4" /></button></div></div>)}
        </div>
        <div className="mt-5 border-t border-slate-300/70 pt-5"><div className="flex justify-between text-sm font-semibold text-slate-500"><span>Subtotal · {itemCount} items</span><span>{formatPrice(subtotal)}</span></div><div className="mt-3 flex justify-between text-sm font-semibold text-slate-500"><span>Tax (10%)</span><span>{formatPrice(tax)}</span></div><div className="mt-5 flex items-end justify-between"><span className="font-black text-slate-800">Grand total</span><span className="text-2xl font-black text-[#153c35]">{formatPrice(total)}</span></div><button onClick={() => cart.length > 0 && setPaid(true)} className={`mt-5 flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl text-lg font-black tracking-wide text-white shadow-xl transition-all active:scale-[0.97] ${paid ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-[#e66b3d] shadow-[#e66b3d]/25 hover:bg-[#d95e31]'}`}>{paid ? <><Check className="size-6" /> PAYMENT COMPLETE</> : <><Banknote className="size-6" /> PAY NOW</>}</button></div>
      </aside>
    </div>
  );
}
