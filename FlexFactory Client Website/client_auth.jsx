// client_auth.jsx — buyer sign in / register / reset
const { useState: useCAuth } = React;

function CAuthShell({ children, heading, sub, wide, note }) {
  return (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--ff-fog)', position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}>
        <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
          <path d="M-60 620 L120 470 L360 470 L180 620 Z" fill="#0135F4" opacity="0.05" />
          <path d="M1200 -40 L1480 -40 L1480 240 L1320 240 Z" fill="#0135F4" opacity="0.05" />
          <path d="M980 760 L1180 600 L1180 940 L980 940 Z" fill="#0C3997" opacity="0.04" />
        </svg>
      </div>
      <div className="chamfer" style={{ width: '100%', maxWidth: wide ? 580 : 460, background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)', position: 'relative', zIndex: 2, '--chamfer': '22px', animation: 'ff-fade-up .42s cubic-bezier(.2,.8,.3,1)' }}>
        <div className="chamfer-tr" style={{ background: 'var(--ff-blue-deep)', padding: '28px 36px 30px', position: 'relative', overflow: 'hidden', '--chamfer': '36px' }}>
          <svg width="220" height="180" viewBox="0 0 220 180" style={{ position: 'absolute', right: -20, top: -10, opacity: 0.13 }} aria-hidden="true">
            <path d="M40 20 H120 V70 L92 96 H64 V180 H40 Z" fill="#070F41" />
            <path d="M140 20 H210 V70 L182 96 H150 V180 H140 V70 L150 60 H182 V36 H140 Z" fill="#070F41" />
          </svg>
          <div style={{ height: 4, width: 64, background: 'var(--ff-lime)', marginBottom: 18 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, position: 'relative' }}>
            <FFMark size={28} accent />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: '#fff', letterSpacing: '-0.02em' }}>Flex<span style={{ color: 'var(--ff-lime)' }}>Factory</span></span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Member</span>
          </div>
          <div style={{ marginTop: 16, color: '#fff', fontSize: 21, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-0.02em' }}>{heading}</div>
          {sub && <div style={{ marginTop: 4, color: 'rgba(255,255,255,0.6)', fontSize: 13.5 }}>{sub}</div>}
        </div>
        {note && <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 36px', background: 'rgba(1,53,244,0.05)', borderBottom: '1px solid var(--line)', fontSize: 13, color: 'var(--ff-blue-deep)', fontWeight: 600 }}><Icon name="alert" size={15} />{note}</div>}
        <div style={{ padding: '28px 36px 32px' }}>{children}</div>
      </div>
    </div>
  );
}

function ClLogin({ onLogin, go, note }) {
  const [email, setEmail] = useCAuth('layla@studio.sa');
  const [pw, setPw] = useCAuth('••••••••••');
  const [show, setShow] = useCAuth(false);
  const [busy, setBusy] = useCAuth(false);
  const submit = (e) => { e.preventDefault(); setBusy(true); setTimeout(() => { setBusy(false); onLogin(); }, 600); };
  return (
    <CAuthShell heading="Welcome back" sub="Sign in to book spaces and request quotes" note={note}>
      <form onSubmit={submit}>
        <div style={{ marginBottom: 18 }}><Field label="Email address"><TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} /></Field></div>
        <div style={{ marginBottom: 18 }}>
          <Field label="Password">
            <div style={{ position: 'relative' }}>
              <TextInput type={show ? 'text' : 'password'} value={pw} onChange={e => setPw(e.target.value)} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 6, top: 6, height: 30, width: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', color: 'var(--ink-3)' }}><Icon name={show ? 'eyeOff' : 'eye'} size={18} /></button>
            </div>
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 22 }}>
          <a href="#" onClick={e => { e.preventDefault(); go('reset'); }} style={{ fontSize: 13.5, color: 'var(--ff-blue)', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</a>
        </div>
        <Button kind="primary" size="lg" full iconRight={busy ? null : 'chevR'} onClick={submit} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid var(--line)', textAlign: 'center', fontSize: 13.5, color: 'var(--ink-3)' }}>
          New to FlexFactory? <a href="#" onClick={e => { e.preventDefault(); go('register'); }} style={{ color: 'var(--ff-blue)', fontWeight: 600, textDecoration: 'none' }}>Create an account</a>
        </div>
      </form>
    </CAuthShell>
  );
}

function ClRegister({ onLogin, go, note }) {
  const toast = useToast();
  const [step, setStep] = useCAuth(0);
  const [acc, setAcc] = useCAuth({ email: '', pw: '', pw2: '' });
  const [me, setMe] = useCAuth({ fullName: '', phone: '', city: '' });
  const [err, setErr] = useCAuth({});
  const eStyle = (k) => err[k] ? { borderColor: 'var(--neg)' } : {};
  const eMsg = (k) => err[k] ? <div style={{ fontSize: 12, color: 'var(--neg)', marginTop: 5 }}>{err[k]}</div> : null;
  const next = () => {
    const e = {};
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(acc.email)) e.email = 'Enter a valid email';
    if (acc.pw.length < 8) e.pw = 'At least 8 characters';
    if (acc.pw !== acc.pw2) e.pw2 = 'Passwords don’t match';
    setErr(e); if (Object.keys(e).length === 0) setStep(1);
  };
  const finish = () => {
    const e = {};
    if (!me.fullName.trim()) e.fullName = 'Required';
    if (!me.phone.trim()) e.phone = 'Required';
    setErr(e); if (Object.keys(e).length) return;
    toast(`Welcome, ${me.fullName.split(' ')[0]} — your account is ready`); onLogin();
  };
  return (
    <CAuthShell wide heading="Create your account" sub="Two quick steps to start booking" note={note}>
      <div style={{ marginBottom: 26 }}><Stepper steps={['Account', 'Your details']} current={step} /></div>
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Email address"><TextInput type="email" value={acc.email} onChange={e => setAcc(a => ({ ...a, email: e.target.value }))} placeholder="you@email.sa" style={eStyle('email')} />{eMsg('email')}</Field>
          <FormGrid>
            <Field label="Password"><TextInput type="password" value={acc.pw} onChange={e => setAcc(a => ({ ...a, pw: e.target.value }))} placeholder="Create a password" style={eStyle('pw')} />{eMsg('pw')}</Field>
            <Field label="Confirm password"><TextInput type="password" value={acc.pw2} onChange={e => setAcc(a => ({ ...a, pw2: e.target.value }))} placeholder="Repeat password" style={eStyle('pw2')} />{eMsg('pw2')}</Field>
          </FormGrid>
        </div>
      )}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Full name"><TextInput value={me.fullName} onChange={e => setMe(m => ({ ...m, fullName: e.target.value }))} placeholder="e.g. Layla Hariri" style={eStyle('fullName')} />{eMsg('fullName')}</Field>
          <FormGrid>
            <Field label="Phone number"><TextInput value={me.phone} onChange={e => setMe(m => ({ ...m, phone: e.target.value }))} placeholder="+966 …" style={eStyle('phone')} />{eMsg('phone')}</Field>
            <Field label="City (optional)"><TextInput value={me.city} onChange={e => setMe(m => ({ ...m, city: e.target.value }))} placeholder="e.g. Riyadh" /></Field>
          </FormGrid>
          <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--ink-2)' }}>
            <span className="chamfer-sm" style={{ width: 20, height: 20, background: 'var(--ff-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><Icon name="check" size={13} stroke={3} /></span>
            I agree to the FlexFactory member terms
          </label>
        </div>
      )}
      <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
        {step === 0
          ? <Button kind="ghost" onClick={() => go('login')}>Cancel</Button>
          : <Button kind="secondary" icon="chevR" onClick={() => setStep(0)}>Back</Button>}
        <div style={{ flex: 1 }} />
        {step < 1 ? <Button kind="primary" iconRight="chevR" onClick={next}>Continue</Button> : <Button kind="accent" icon="check" onClick={finish}>Create account</Button>}
      </div>
    </CAuthShell>
  );
}

function ClReset({ go }) {
  const toast = useToast();
  const [stage, setStage] = useCAuth('request');
  const [email, setEmail] = useCAuth('');
  if (stage === 'request') return (
    <CAuthShell heading="Reset your password" sub="We'll email you a secure reset link">
      <form onSubmit={e => { e.preventDefault(); email && setStage('sent'); }}>
        <div style={{ marginBottom: 22 }}><Field label="Email address"><TextInput type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.sa" /></Field></div>
        <Button kind="primary" size="lg" full iconRight="send" onClick={() => email && setStage('sent')} disabled={!email}>Send reset link</Button>
        <div style={{ marginTop: 18, textAlign: 'center' }}><a href="#" onClick={e => { e.preventDefault(); go('login'); }} style={{ fontSize: 13.5, color: 'var(--ink-3)', fontWeight: 600, textDecoration: 'none' }}>← Back to sign in</a></div>
      </form>
    </CAuthShell>
  );
  return (
    <CAuthShell heading="Check your inbox" sub={`We sent a reset link to ${email || 'your email'}`}>
      <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
        <div style={{ display: 'inline-flex', padding: 16, background: 'var(--pos-bg)', color: 'var(--pos)', marginBottom: 16 }} className="chamfer-sm"><Icon name="mail" size={28} /></div>
        <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: '0 0 22px' }}>Click the link in the email to choose a new password.</p>
        <Button kind="primary" full size="lg" onClick={() => go('login')}>Back to sign in</Button>
      </div>
    </CAuthShell>
  );
}

function ClientAuth({ onLogin, onCancel, note }) {
  const [view, setView] = useCAuth('login');
  const go = (v) => v === 'cancel' ? onCancel && onCancel() : setView(v);
  if (view === 'register') return <ClRegister onLogin={onLogin} go={go} note={note} />;
  if (view === 'reset') return <ClReset go={go} />;
  return <ClLogin onLogin={onLogin} go={go} note={note} />;
}

Object.assign(window, { ClientAuth, CAuthShell });
