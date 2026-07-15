// client_app.jsx — marketplace shell: router, auth gate, tweaks
const { useState: useCApp, useEffect: useEffCApp } = React;

const CL_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0135F4",
  "chamfer": true
}/*EDITMODE-END*/;

function MobileMenu({ open, onClose, go, authed, onSignIn }) {
  if (!open) return null;
  return (
    <div className="mobile-only" style={{ position: 'fixed', inset: 0, zIndex: 800, display: 'flex' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(7,15,65,0.45)' }} />
      <div style={{ position: 'relative', marginLeft: 'auto', width: 280, maxWidth: '82vw', height: '100%', background: 'var(--surface)', boxShadow: 'var(--shadow-lg)', padding: 22, display: 'flex', flexDirection: 'column', gap: 6, animation: 'ff-fade .2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Wordmark />
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: 'var(--ink-3)' }}><Icon name="x" size={22} /></button>
        </div>
        {window.NAV_LINKS.map(l => <button key={l.id} onClick={() => { onClose(); l.id === 'subscription' ? go({ name: 'home', anchor: 'sub' }) : go({ name: 'browse', kind: l.kind || l.id }); }} style={{ border: 'none', background: 'transparent', textAlign: 'left', padding: '13px 6px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', borderBottom: '1px solid var(--line)' }}>{l.label}</button>)}
        <div style={{ marginTop: 16 }}>
          {authed ? <Button kind="secondary" full icon="users" onClick={() => { onClose(); go({ name: 'account' }); }}>My account</Button>
            : <Button kind="lime" full onClick={() => { onClose(); onSignIn(); }} style={{ fontWeight: 700 }}>SIGN IN</Button>}
        </div>
      </div>
    </div>
  );
}



/* ---------- cart page ---------- */
function CartPage({ cart, updateQty, removeItem, clearCart, go, requireAuth }) {
  const toast = useToast();
  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  const count = cart.reduce((s, x) => s + x.qty, 0);

  const checkout = () => requireAuth(() => go({ name: 'checkout' }));

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 28px 64px' }}>
        <h1 style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.025em' }}>Your cart</h1>
        <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '12px' }}>
          <Empty icon="cart" title="Your cart is empty" sub="Browse materials to add filament, sheet stock, components and more." />
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 24 }}>
            <Button kind="primary" iconRight="chevR" onClick={() => go({ name: 'browse', kind: 'material' })}>SHOP MATERIALS</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '28px 28px 64px' }}>
      <h1 style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 30, letterSpacing: '-0.025em' }}>Your cart <span style={{ fontSize: 16, color: 'var(--ink-3)', fontWeight: 500 }}>· {count} item{count === 1 ? '' : 's'}</span></h1>
      <div className="booking-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22, alignItems: 'start' }}>
        {/* line items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cart.map(it => (
            <div key={it.key} className="chamfer cart-line" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="chamfer-sm" style={{ width: 64, height: 64, flexShrink: 0, overflow: 'hidden' }}>
                <Thumb icon="box" tone="blue" h={64} image={it.image} alt={it.title} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{it.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{it.vendor}{it.variant ? ' · ' + it.variant : ''}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Riyal size={10} />{window.SAR(it.price)} / {it.unit}</div>
              </div>
              {/* qty stepper */}
              <div className="chamfer-sm" style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--line-strong)', flexShrink: 0 }}>
                <button onClick={() => updateQty(it.key, -1)} className="focus-lime" aria-label="Decrease quantity" style={{ width: 34, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="minus" size={15} /></button>
                <span className="mono-fig" style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{it.qty}</span>
                <button onClick={() => updateQty(it.key, 1)} className="focus-lime" aria-label="Increase quantity" style={{ width: 34, height: 36, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={15} /></button>
              </div>
              <span className="mono-fig" style={{ minWidth: 92, textAlign: 'right', fontWeight: 700, fontSize: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}><Riyal size={12} />{window.SAR2(it.price * it.qty)}</span>
              <button onClick={() => { removeItem(it.key); toast('Removed from cart'); }} className="focus-lime" aria-label="Remove item" style={{ width: 36, height: 36, flexShrink: 0, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--neg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="trash" size={18} /></button>
            </div>
          ))}
        </div>
        {/* summary */}
        <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 22px', position: 'sticky', top: 88 }}>
          <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>ORDER SUMMARY</h3>
          {[['Subtotal', subtotal], ['VAT (15%)', vat], ['Delivery', 0]].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderTop: '1px solid var(--line)', fontSize: 14 }}>
              <span style={{ color: 'var(--ink-3)' }}>{k}</span>
              {k === 'Delivery'
                ? <span style={{ fontWeight: 700, color: 'var(--pos)' }}>FREE</span>
                : <span className="mono-fig" style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Riyal size={11} />{window.SAR2(v)}</span>}
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '2px solid var(--ff-blue)', marginTop: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
            <span className="mono-fig" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--ff-blue)', letterSpacing: '-0.03em' }}><Riyal size={18} color="var(--ff-blue)" />{window.SAR2(total)}</span>
          </div>
          <Button kind="lime" full iconRight="chevR" onClick={checkout} style={{ fontWeight: 700, marginTop: 6 }}>CHECKOUT</Button>
          <div style={{ fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center', width: '100%' }}><Icon name="wallet" size={13} />Secure checkout · escrow protected</div>
        </div>
      </div>
    </div>
  );
}

function ClientApp() {
  const [t, setTweak] = useTweaks(CL_TWEAK_DEFAULTS);
  const [authed, setAuthed] = useCApp(false);
  const [route, setRoute] = useCApp({ name: 'home' });
  const [query, setQuery] = useCApp('');
  const [menu, setMenu] = useCApp(false);
  const [auth, setAuth] = useCApp(null);
  const [cart, setCart] = useCApp([]);

  const addToCart = (item, qty = 1, variant = null) => setCart(c => {
    const key = item.id + (variant ? '::' + variant : '');
    const ex = c.find(x => x.key === key);
    if (ex) return c.map(x => x.key === key ? { ...x, qty: x.qty + qty } : x);
    return [...c, { key, id: item.id, title: item.title, vendor: item.vendor, price: item.price, unit: item.unit, image: item.image, variant, qty }];
  });
  const updateQty = (key, d) => setCart(c => c.map(x => x.key === key ? { ...x, qty: Math.max(1, x.qty + d) } : x));
  const removeItem = (key) => setCart(c => c.filter(x => x.key !== key));
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);
  useEffCApp(() => { window.__ffAddToCart = addToCart; }, []);

  useEffCApp(() => {
    const r = document.documentElement.style;
    r.setProperty('--accent', t.accent); r.setProperty('--ff-blue', t.accent);
    r.setProperty('--chamfer', t.chamfer ? '14px' : '0px'); r.setProperty('--chamfer-sm', t.chamfer ? '8px' : '0px');
  }, [t.accent, t.chamfer]);

  const go = (next) => {
    setRoute(next);
    setTimeout(() => {
      if (next.anchor === 'sub') { const el = document.getElementById('sub'); if (el) { el.scrollIntoView({ behavior: 'smooth' }); return; } }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 10);
  };

  const requireAuth = (action) => {
    if (authed) { action && action(); return; }
    setAuth({ note: 'Sign in to start your booking', after: action });
  };
  const onLogin = () => { const after = auth && auth.after; setAuthed(true); setAuth(null); if (after) setTimeout(after, 60); };

  let body;
  if (route.name === 'home') body = <HomePage go={go} onAddToCart={addToCart} />;
  else if (route.name === 'browse') body = <BrowsePage key={'browse-' + (route.kind || 'job')} route={route} go={go} query={query} onAddToCart={addToCart} />;
  else if (route.name === 'detail') body = <DetailPage route={route} go={go} authed={authed} requireAuth={requireAuth} />;
  else if (route.name === 'job') body = <JobDetailPage route={route} go={go} authed={authed} requireAuth={requireAuth} />;
  else if (route.name === 'equipment') body = <EquipmentDetailPage route={route} go={go} authed={authed} requireAuth={requireAuth} />;
  else if (route.name === 'product') body = <ProductDetail route={route} go={go} onAddToCart={addToCart} />;
  else if (route.name === 'cart') body = <CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} clearCart={clearCart} go={go} requireAuth={requireAuth} />;
  else if (route.name === 'checkout') body = authed ? <CheckoutPage cart={cart} clearCart={clearCart} go={go} /> : <CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} clearCart={clearCart} go={go} requireAuth={requireAuth} />;
  else if (route.name === 'account') body = authed ? <AccountShell go={go} onSignOut={() => { setAuthed(false); go({ name: 'home' }); }} initialSub={route.sub} initialBooking={route.booking} initialOrder={route.order} initialQuote={route.quote} /> : <HomePage go={go} onAddToCart={addToCart} />;

  return (
    <ToastHost>
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <PublicHeader route={route} go={go} authed={authed} onSignIn={() => setAuth({ note: null, after: null })} onMenu={() => setMenu(true)} query={query} setQuery={setQuery} cartCount={cartCount} onCart={() => go({ name: 'cart' })} />
        <main style={{ flex: 1 }}>{body}</main>
        <PublicFooter go={go} />
      </div>
      <MobileMenu open={menu} onClose={() => setMenu(false)} go={go} authed={authed} onSignIn={() => setAuth({ note: null, after: null })} />
      {auth && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'var(--ff-fog)', overflow: 'auto', animation: 'ff-fade .2s ease' }}>
          <button onClick={() => setAuth(null)} className="focus-lime chamfer-sm" style={{ position: 'fixed', top: 22, right: 24, zIndex: 1001, width: 42, height: 42, border: '1px solid var(--line-strong)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-2)' }}><Icon name="x" size={20} /></button>
          <ClientAuth onLogin={onLogin} onCancel={() => setAuth(null)} note={auth.note} />
        </div>
      )}
      <ClTweakUI t={t} setTweak={setTweak} />
    </ToastHost>
  );
}

function ClTweakUI({ t, setTweak }) {
  return (
    <TweaksPanel>
      <TweakSection label="Brand" />
      <TweakColor label="Accent" value={t.accent} options={['#0135F4', '#0C3997', '#070F41', '#127E92']} onChange={v => setTweak('accent', v)} />
      <TweakSection label="Style" />
      <TweakToggle label="Chamfered corners" value={t.chamfer} onChange={v => setTweak('chamfer', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<ClientApp />);
