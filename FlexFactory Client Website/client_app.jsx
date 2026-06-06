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
        {window.NAV_LINKS.map(l => <button key={l.id} onClick={() => { onClose(); l.id === 'subscription' ? go({ name: 'home', anchor: 'sub' }) : go({ name: 'browse', kind: l.id === 'jobs' ? 'job' : 'space' }); }} style={{ border: 'none', background: 'transparent', textAlign: 'left', padding: '13px 6px', fontSize: 16, fontWeight: 600, color: 'var(--ink)', borderBottom: '1px solid var(--line)' }}>{l.label}</button>)}
        <div style={{ marginTop: 16 }}>
          {authed ? <Button kind="secondary" full icon="users" onClick={() => { onClose(); go({ name: 'account' }); }}>My account</Button>
            : <Button kind="lime" full onClick={() => { onClose(); onSignIn(); }} style={{ fontWeight: 700 }}>SIGN IN</Button>}
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
  if (route.name === 'home') body = <HomePage go={go} />;
  else if (route.name === 'browse') body = <BrowsePage key={'browse-' + (route.kind || 'job')} route={route} go={go} query={query} />;
  else if (route.name === 'detail') body = <DetailPage route={route} go={go} authed={authed} requireAuth={requireAuth} />;
  else if (route.name === 'account') body = authed ? <AccountShell go={go} onSignOut={() => { setAuthed(false); go({ name: 'home' }); }} initialSub={route.sub} initialBooking={route.booking} /> : <HomePage go={go} />;

  return (
    <ToastHost>
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <PublicHeader route={route} go={go} authed={authed} onSignIn={() => setAuth({ note: null, after: null })} onMenu={() => setMenu(true)} query={query} setQuery={setQuery} />
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
