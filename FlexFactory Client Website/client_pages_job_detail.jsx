// client_pages_job_detail.jsx — service detail + multi-step quote request
const { useState: usePJob, useRef: useRefJob, useEffect: useEffJob } = React;

/* ---------- gallery thumb ---------- */
function GallThumb({ label, image, active, onClick }) {
  return (
    <button onClick={onClick} style={{ border: active ? '2px solid var(--ff-blue)' : '2px solid transparent', background: 'transparent', padding: 0, cursor: 'pointer', flexShrink: 0, borderRadius: 2 }}>
      <Thumb icon="grid" tone={active ? 'blue' : 'fog'} h={60} image={image} alt={label} style={{ width: 80, height: 60, display: 'block' }} />
    </button>
  );
}

/* ---------- spec row ---------- */
function SpecRow({ label, value, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0', borderBottom: last ? 'none' : '1px solid var(--line)', gap: 16, fontSize: 14 }}>
      <span style={{ color: 'var(--ink-3)', flexShrink: 0 }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

/* ---------- pricing tier ---------- */
function PriceTier({ tier, selected, onSelect }) {
  return (
    <button onClick={onSelect} className="chamfer-sm"
      style={{ border: selected ? '2px solid var(--ff-blue)' : '2px solid var(--line)', background: selected ? 'rgba(1,53,244,0.05)' : 'var(--surface)', padding: '16px 18px', textAlign: 'left', cursor: 'pointer', position: 'relative', transition: 'border-color .15s, background .15s' }}>
      {tier.popular && <span className="chamfer-sm" style={{ position: 'absolute', top: -1, right: 12, height: 20, padding: '0 10px', background: 'var(--ff-blue)', color: '#fff', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center' }}>POPULAR</span>}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        {tier.price
          ? <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: selected ? 'var(--ff-blue)' : 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Riyal size={15} color={selected ? 'var(--ff-blue)' : 'var(--ink)'} />{window.SAR2(tier.price)}</span>
          : <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--ink-3)' }}>Custom</span>}
        <span style={{ fontSize: 12.5, color: 'var(--ink-3)', fontWeight: 500 }}>{tier.unit}</span>
        {tier.save && <span className="chamfer-sm" style={{ marginLeft: 'auto', height: 20, padding: '0 8px', background: 'var(--pos-bg)', color: 'var(--pos)', fontSize: 10.5, fontWeight: 700 }}>{tier.save}</span>}
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, marginTop: 4 }}>{tier.qty}</div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 2 }}>{tier.note}</div>
    </button>
  );
}

/* ---------- quote rail ---------- */
function QuoteRail({ d, selectedTier, onStart }) {
  const tier = d.pricing.find(p => p === selectedTier) || d.pricing[2];
  return (
    <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '22px 22px', position: 'sticky', top: 88 }}>
      <div style={{ height: 3, width: 48, background: 'var(--ff-lime)', marginBottom: 16 }} />
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 4, fontWeight: 600 }}>FROM</div>
      {tier.price
        ? <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 32, color: 'var(--ff-blue)', letterSpacing: '-0.03em', marginBottom: 4 }}>
            <Riyal size={22} color="var(--ff-blue)" />{window.SAR2(tier.price)}
            <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 500 }}>/ {tier.qty}</span>
          </div>
        : <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--ink)', marginBottom: 4 }}>Custom pricing</div>}
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 20 }}>Final quote after file review</div>
      <Button kind="lime" full size="lg" iconRight="chevR" onClick={onStart} style={{ fontWeight: 700 }}>REQUEST A QUOTE</Button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {[['clock', '5-day lead time'], ['check', 'Free design review'], ['check', 'IPC Class II certified']].map(([ic, txt]) => (
          <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--ink-2)' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ff-fog)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={13} style={{ color: 'var(--ff-blue)' }} /></span>
            {txt}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="chamfer-sm" style={{ width: 38, height: 38, background: 'var(--ff-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{d.vendor[0]}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.vendor}</div>
            <Stars value={d.rating} size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== FIXED ORDER RAIL + SHELL ===================== */

function OrderRail({ d, selTier, setSelTier, onStart }) {
  const tier = selTier || d.tiers[2];
  return (
    <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '22px 22px', position: 'sticky', top: 88 }}>
      <div style={{ height: 3, width: 48, background: 'var(--ff-lime)', marginBottom: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {d.tiers.map(t => {
          const on = selTier === t;
          return (
            <button key={t.qty} onClick={() => setSelTier(t)} className="chamfer-sm"
              style={{ border: on ? '2px solid var(--ff-blue)' : '2px solid var(--line)', background: on ? 'rgba(1,53,244,0.05)' : 'var(--bg)', padding: '10px 12px', cursor: 'pointer', textAlign: 'left', position: 'relative' }}>
              {t.popular && <span style={{ position: 'absolute', top: -8, right: 6, fontSize: 9, fontWeight: 700, background: 'var(--ff-blue)', color: '#fff', padding: '2px 6px', borderRadius: 2, letterSpacing: '0.06em' }}>POPULAR</span>}
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: on ? 'var(--ff-blue)' : 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Riyal size={11} color={on ? 'var(--ff-blue)' : 'var(--ink)'} />{window.SAR2(t.price)}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{t.label}</div>
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Total</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: 'var(--ff-blue)', letterSpacing: '-0.02em' }}>
          <Riyal size={16} color="var(--ff-blue)" />{window.SAR2(tier.price)}
        </span>
      </div>
      <Button kind="lime" full size="lg" iconRight="chevR" onClick={onStart} style={{ fontWeight: 700 }}>ORDER NOW</Button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {[['clock', '3-day lead time'], ['box', 'Ships to your door'], ['check', 'Quality checked before dispatch']].map(([ic, txt]) => (
          <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--ink-2)' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ff-fog)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={13} style={{ color: 'var(--ff-blue)' }} /></span>
            {txt}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="chamfer-sm" style={{ width: 38, height: 38, background: 'var(--ff-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{d.vendor[0]}</div>
          <div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.vendor}</div><Stars value={d.rating} size={12} /></div>
        </div>
      </div>
    </div>
  );
}

function InstantQuoteRail({ d, onStart }) {
  return (
    <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '22px 22px', position: 'sticky', top: 88 }}>
      <div style={{ height: 3, width: 48, background: 'var(--ff-lime)', marginBottom: 16 }} />
      <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 4, fontWeight: 600 }}>LIVE ENGINE</div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--ff-blue)', letterSpacing: '-0.02em', marginBottom: 6 }}>Instant quote</div>
      <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 20, lineHeight: 1.45 }}>Upload a model and tune process, material and quantity with live pricing.</div>
      <Button kind="lime" full size="lg" iconRight="arrowDn" onClick={onStart} style={{ fontWeight: 700 }}>GET INSTANT QUOTE</Button>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
        {[['upload', 'STL or STEP upload'], ['gear', 'Live process options'], ['check', 'Provider confirms before charge']].map(([ic, txt]) => (
          <div key={txt} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--ink-2)' }}>
            <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--ff-fog)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icon name={ic} size={13} style={{ color: 'var(--ff-blue)' }} /></span>
            {txt}
          </div>
        ))}
      </div>
      <div style={{ borderTop: '1px solid var(--line)', marginTop: 18, paddingTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="chamfer-sm" style={{ width: 38, height: 38, background: 'var(--ff-blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flexShrink: 0 }}>{d.vendor[0]}</div>
          <div><div style={{ fontWeight: 700, fontSize: 13.5 }}>{d.vendor}</div><Stars value={d.rating} size={12} /></div>
        </div>
      </div>
    </div>
  );
}

const ORDER_STEPS = ['Configure', 'Upload File', 'Review & Confirm'];

function FixedOrderShell({ d, selTier, onDone, onCancel }) {
  const [step, setStep] = usePJob(0);
  const [form, setForm] = usePJob({ tier: selTier || d.tiers[2], material: d.materials[0], colour: d.colours[0][0], finish: d.finishes[0], files: [] });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const [dragging, setDragging] = usePJob(false);

  const stepContent = [
    /* step 0: configure */
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 10 }}>Quantity</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {d.tiers.map(t => {
            const on = form.tier === t;
            return (
              <button key={t.qty} onClick={() => f('tier', t)} className="chamfer-sm"
                style={{ border: on ? '2px solid var(--ff-blue)' : '2px solid var(--line)', background: on ? 'rgba(1,53,244,0.05)' : 'var(--surface)', padding: '12px 10px', cursor: 'pointer', textAlign: 'center', position: 'relative' }}>
                {t.popular && <span style={{ position: 'absolute', top: -8, right: 4, fontSize: 9, fontWeight: 700, background: 'var(--ff-blue)', color: '#fff', padding: '2px 5px', letterSpacing: '0.06em' }}>POPULAR</span>}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: on ? 'var(--ff-blue)' : 'var(--ink)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Riyal size={11} color={on ? 'var(--ff-blue)' : 'var(--ink)'} />{window.SAR2(t.price)}</div>
                <div style={{ fontSize: 11.5, color: on ? 'var(--ff-blue)' : 'var(--ink-3)', marginTop: 2 }}>{t.label}</div>
                {t.save && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--pos)', marginTop: 2 }}>{t.save}</div>}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 10 }}>Material</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {d.materials.map(m => {
            const on = form.material === m;
            return <button key={m} onClick={() => f('material', m)} className="chamfer-sm" style={{ height: 36, padding: '0 14px', border: on ? '2px solid var(--ff-blue)' : '2px solid var(--line)', background: on ? 'rgba(1,53,244,0.05)' : 'var(--surface)', fontSize: 13.5, fontWeight: on ? 700 : 400, color: on ? 'var(--ff-blue)' : 'var(--ink)', cursor: 'pointer' }}>{m}</button>;
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 10 }}>Colour</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {d.colours.map(([name, hex]) => {
            const on = form.colour === name;
            return <button key={name} onClick={() => f('colour', name)} title={name} style={{ width: 34, height: 34, borderRadius: '50%', background: hex, border: on ? '3px solid var(--ff-blue)' : '3px solid transparent', outline: on ? '2px solid var(--ff-blue)' : 'none', outlineOffset: 2, cursor: 'pointer' }} />;
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 10 }}>Finish</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {d.finishes.map(fin => {
            const on = form.finish === fin;
            return (
              <button key={fin} onClick={() => f('finish', fin)} style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', padding: '2px 0', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + (on ? 'var(--ff-blue)' : 'var(--line-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{on && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ff-blue)' }} />}</span>
                <span style={{ fontWeight: on ? 700 : 400, color: on ? 'var(--ff-blue)' : 'var(--ink-2)' }}>{fin}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>,

    /* step 1: upload */
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); f('files', [...form.files, 'uploaded_model_' + (form.files.length + 1) + '.stl']); }}
        className="chamfer" style={{ border: '2px dashed ' + (dragging ? 'var(--ff-blue)' : 'var(--line-strong)'), background: dragging ? 'rgba(1,53,244,0.04)' : 'var(--bg)', padding: '36px 28px', textAlign: 'center', cursor: 'pointer' }}
        onClick={() => f('files', [...form.files, 'model_v' + (form.files.length + 1) + '.stl'])}>
        <Icon name="upload" size={36} style={{ color: 'var(--ff-blue)', margin: '0 auto 12px' }} />
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Drop your 3D file here</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Accepted: {d.fileTypes.join(', ')}</div>
      </div>
      {form.files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {form.files.map(fi => (
            <div key={fi} className="chamfer-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <Icon name="file" size={18} style={{ color: 'var(--ff-blue)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13.5 }}>{fi}</span>
              <button onClick={() => f('files', form.files.filter(x => x !== fi))} style={{ border: 'none', background: 'transparent', padding: 4, color: 'var(--ink-3)', cursor: 'pointer' }}><Icon name="x" size={14} /></button>
            </div>
          ))}
        </div>
      )}
      <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-3)' }}>Optional — required only for custom geometries. Skip if ordering a standard shape.</p>
    </div>,

    /* step 2: review */
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
        <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>ORDER SUMMARY</h3>
        {[['Service', d.title], ['Vendor', d.vendor + ' · ' + d.city], ['Quantity', form.tier.label], ['Material', form.material], ['Colour', form.colour], ['Finish', form.finish], ['Files', form.files.length ? form.files.join(', ') : 'None (standard geometry)'], ['Lead time', '3 working days'], ['Delivery', 'To your address']].map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '9px 0', borderTop: i ? '1px solid var(--line)' : 'none', fontSize: 14, gap: 16 }}>
            <span style={{ color: 'var(--ink-3)', flexShrink: 0 }}>{k}</span><span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--line)', marginTop: 4 }}>
          <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>Total</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--ff-blue)', letterSpacing: '-0.03em' }}>
            <Riyal size={20} color="var(--ff-blue)" />{window.SAR2(form.tier.price)}
          </span>
        </div>
      </div>
      <Button kind="lime" full size="lg" iconRight="send" onClick={onDone} style={{ fontWeight: 700 }}>CONFIRM ORDER</Button>
      <p style={{ margin: 0, fontSize: 12.5, color: 'var(--ink-3)', textAlign: 'center' }}>Payment collected on dispatch. Free cancellation before production starts.</p>
    </div>,
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 28px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <button onClick={onCancel} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Icon name="chevR" size={15} style={{ transform: 'rotate(180deg)' }} />Back to listing
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>Step {step + 1} of {ORDER_STEPS.length}</div>
      </div>
      <StepHeader step={step} total={ORDER_STEPS.length} labels={ORDER_STEPS} />
      <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '28px 32px' }}>
        <h2 style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>{ORDER_STEPS[step]}</h2>
        {stepContent[step]}
      </div>
      {step < ORDER_STEPS.length - 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
          <Button kind="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>BACK</Button>
          <Button kind="primary" iconRight="chevR" onClick={() => setStep(s => s + 1)}>CONTINUE</Button>
        </div>
      )}
    </div>
  );
}

const STEP_LABELS = ['Project Details', 'Specifications', 'Upload Files', 'Timeline', 'Review & Submit'];

function StepHeader({ step, total, labels }) {
  const labs = labels || STEP_LABELS;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28, overflowX: 'auto' }}>
      {labs.map((l, i) => {
        const done = i < step, active = i === step;
        return (
          <React.Fragment key={l}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: active ? '2px solid var(--ff-blue)' : done ? 'none' : '2px solid var(--line)', background: done ? 'var(--ff-blue)' : active ? 'transparent' : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                {done ? <Icon name="check" size={15} stroke={3} style={{ color: '#fff' }} /> : <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--ff-blue)' : 'var(--ink-3)' }}>{i + 1}</span>}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? 'var(--ff-blue)' : done ? 'var(--ink-2)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>{l}</span>
            </div>
            {i < total - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--ff-blue)' : 'var(--line)', minWidth: 20, margin: '0 4px', marginBottom: 22, transition: 'background .3s' }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* --- step 1: project details --- */
function StepDetails({ form, setForm }) {
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Project name <span style={{ color: 'var(--neg)' }}>*</span></label>
        <input value={form.name || ''} onChange={e => f('name', e.target.value)} placeholder="e.g. Motor driver v2 — 100 pcs"
          className="chamfer-sm" style={{ width: '100%', height: 44, padding: '0 14px', border: '1px solid var(--line-strong)', fontSize: 14.5, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Description <span style={{ color: 'var(--neg)' }}>*</span></label>
        <textarea value={form.description || ''} onChange={e => f('description', e.target.value)} placeholder="Describe what you need, intended use, any special requirements…" rows={4}
          className="chamfer-sm" style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line-strong)', fontSize: 14, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Quantity <span style={{ color: 'var(--neg)' }}>*</span></label>
          <select value={form.qty || '100 pcs'} onChange={e => f('qty', e.target.value)}
            className="chamfer-sm" style={{ width: '100%', height: 44, padding: '0 14px', border: '1px solid var(--line-strong)', fontSize: 14, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', appearance: 'none' }}>
            {['5 pcs', '10 pcs', '25 pcs', '50 pcs', '100 pcs', '250 pcs', '500 pcs', '1000+ pcs'].map(q => <option key={q}>{q}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Priority</label>
          <select value={form.priority || 'Standard (5 days)'} onChange={e => f('priority', e.target.value)}
            className="chamfer-sm" style={{ width: '100%', height: 44, padding: '0 14px', border: '1px solid var(--line-strong)', fontSize: 14, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', appearance: 'none' }}>
            {['Standard (5 days)', 'Express (2 days) +30%', '24-hour +60%'].map(q => <option key={q}>{q}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

/* --- step 2: specs --- */
function StepSpecs({ form, setForm, d }) {
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 10 }}>Material</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {d.materials.map(m => {
            const on = (form.material || 'FR4 Standard') === m;
            return (
              <button key={m} onClick={() => f('material', m)} className="chamfer-sm"
                style={{ border: on ? '2px solid var(--ff-blue)' : '2px solid var(--line)', background: on ? 'rgba(1,53,244,0.05)' : 'var(--surface)', padding: '10px 14px', fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? 'var(--ff-blue)' : 'var(--ink)', cursor: 'pointer', textAlign: 'left' }}>
                {m}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 10 }}>Surface finish</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {d.finishes.map(fin => {
            const on = (form.finish || d.finishes[0]) === fin;
            return (
              <button key={fin} onClick={() => f('finish', fin)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, border: 'none', background: 'transparent', padding: '4px 0', fontSize: 14, textAlign: 'left', cursor: 'pointer' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid ' + (on ? 'var(--ff-blue)' : 'var(--line-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {on && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--ff-blue)' }} />}
                </span>
                <span style={{ fontWeight: on ? 700 : 400, color: on ? 'var(--ff-blue)' : 'var(--ink-2)' }}>{fin}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Soldermask colour</label>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[['Green', '#2E7D32'], ['Red', '#C62828'], ['Blue', '#1565C0'], ['Black', '#212121'], ['White', '#E0E0E0'], ['Yellow', '#F9A825']].map(([name, hex]) => {
            const on = (form.smask || 'Green') === name;
            return (
              <button key={name} onClick={() => f('smask', name)} title={name}
                style={{ width: 36, height: 36, borderRadius: '50%', background: hex, border: on ? '3px solid var(--ff-blue)' : '3px solid transparent', outline: on ? '2px solid var(--ff-blue)' : 'none', outlineOffset: 2, cursor: 'pointer', transition: 'border .15s' }} />
            );
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Additional notes</label>
        <textarea value={form.specNotes || ''} onChange={e => f('specNotes', e.target.value)} placeholder="Controlled impedance, edge connectors, special stackup requirements…" rows={3}
          className="chamfer-sm" style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line-strong)', fontSize: 14, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>
    </div>
  );
}

/* --- step 3: file upload --- */
function StepFiles({ form, setForm, d }) {
  const [dragging, setDragging] = usePJob(false);
  const mockFiles = form.files || [];
  const addFile = name => setForm(p => ({ ...p, files: [...(p.files || []), name] }));
  const removeFile = name => setForm(p => ({ ...p, files: (p.files || []).filter(f => f !== name) }));
  const handleDrop = e => { e.preventDefault(); setDragging(false); addFile('uploaded_gerber_' + Date.now() + '.zip'); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* drop zone */}
      <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}
        className="chamfer" style={{ border: '2px dashed ' + (dragging ? 'var(--ff-blue)' : 'var(--line-strong)'), background: dragging ? 'rgba(1,53,244,0.04)' : 'var(--bg)', padding: '36px 28px', textAlign: 'center', transition: 'border-color .15s, background .15s', cursor: 'pointer' }}
        onClick={() => addFile('gerber_files_' + (mockFiles.length + 1) + '.zip')}>
        <Icon name="upload" size={36} style={{ color: 'var(--ff-blue)', margin: '0 auto 12px' }} />
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Drop files here or click to upload</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Accepted: {d.fileTypes.join(', ')}</div>
      </div>
      {/* file list */}
      {mockFiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {mockFiles.map(f => (
            <div key={f} className="chamfer-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--line)' }}>
              <Icon name="file" size={18} style={{ color: 'var(--ff-blue)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{f}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{(Math.random() * 4 + 0.5).toFixed(1)} MB</span>
              <button onClick={() => removeFile(f)} style={{ border: 'none', background: 'transparent', padding: 4, color: 'var(--ink-3)', cursor: 'pointer' }}><Icon name="x" size={14} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="chamfer-sm" style={{ background: 'rgba(1,53,244,0.05)', border: '1px solid rgba(1,53,244,0.15)', padding: '12px 16px', display: 'flex', gap: 10 }}>
        <Icon name="alert" size={16} style={{ color: 'var(--ff-blue)', flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Circuit Guild will perform a free DFM (design-for-manufacture) review on your files before issuing the final quote.</div>
      </div>
    </div>
  );
}

/* --- step 4: timeline --- */
function StepTimeline({ form, setForm }) {
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const opts = ['ASAP — start immediately', 'Within 1 week', 'Within 2 weeks', 'Flexible — no rush'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 12 }}>When do you need this?</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {opts.map(o => {
            const on = (form.timeline || opts[0]) === o;
            return (
              <button key={o} onClick={() => f('timeline', o)} className="chamfer-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 12, border: on ? '2px solid var(--ff-blue)' : '2px solid var(--line)', background: on ? 'rgba(1,53,244,0.05)' : 'var(--surface)', padding: '13px 16px', fontSize: 14.5, fontWeight: on ? 700 : 500, color: on ? 'var(--ff-blue)' : 'var(--ink)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid ' + (on ? 'var(--ff-blue)' : 'var(--line-strong)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {on && <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--ff-blue)' }} />}
                </span>
                {o}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Delivery preference</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {['Pickup at workshop', 'Delivery to my address'].map(opt => {
            const on = (form.delivery || 'Delivery to my address') === opt;
            return (
              <button key={opt} onClick={() => f('delivery', opt)} className="chamfer-sm"
                style={{ flex: 1, border: on ? '2px solid var(--ff-blue)' : '2px solid var(--line)', background: on ? 'rgba(1,53,244,0.05)' : 'var(--surface)', padding: '12px 14px', fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? 'var(--ff-blue)' : 'var(--ink)', cursor: 'pointer', textAlign: 'center' }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>Message to provider <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(optional)</span></label>
        <textarea value={form.message || ''} onChange={e => f('message', e.target.value)} placeholder="Any extra context for the provider — reference designs, special handling, questions…" rows={3}
          className="chamfer-sm" style={{ width: '100%', padding: '12px 14px', border: '1px solid var(--line-strong)', fontSize: 14, background: 'var(--bg)', color: 'var(--ink)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
      </div>
    </div>
  );
}

/* --- step 5: review --- */
function StepReview({ form, d, onSubmit }) {
  const tier = d.pricing.find(p => p.qty === form.qty) || d.pricing[2];
  const rows = [
    ['Service', d.title], ['Vendor', d.vendor + ' · ' + d.city],
    ['Quantity', form.qty || '100 pcs'], ['Priority', form.priority || 'Standard (5 days)'],
    ['Material', form.material || 'FR4 Standard'], ['Finish', form.finish || d.finishes[0]],
    ['Soldermask', form.smask || 'Green'],
    ['Files', (form.files || []).length + ' file(s) attached'],
    ['Timeline', form.timeline || 'ASAP — start immediately'],
    ['Delivery', form.delivery || 'Delivery to my address'],
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
        <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>QUOTE SUMMARY</h3>
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '9px 0', borderTop: i ? '1px solid var(--line)' : 'none', fontSize: 14, gap: 16 }}>
            <span style={{ color: 'var(--ink-3)', flexShrink: 0 }}>{k}</span>
            <span style={{ fontWeight: 600, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
        {tier.price && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--line)', marginTop: 4 }}>
            <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>Estimated total</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 26, color: 'var(--ff-blue)', letterSpacing: '-0.03em' }}>
              <Riyal size={18} color="var(--ff-blue)" />{window.SAR2(tier.price)}
            </span>
          </div>
        )}
      </div>
      <div className="chamfer-sm" style={{ background: 'rgba(1,53,244,0.05)', border: '1px solid rgba(1,53,244,0.15)', padding: '12px 16px', display: 'flex', gap: 10 }}>
        <Icon name="alert" size={16} style={{ color: 'var(--ff-blue)', flexShrink: 0, marginTop: 1 }} />
        <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>Submitting this request is free. The provider will review your files and send a binding quote within 24 hours. You only pay after approving the quote.</div>
      </div>
      <Button kind="lime" full size="lg" iconRight="send" onClick={onSubmit} style={{ fontWeight: 700, marginTop: 4 }}>SUBMIT QUOTE REQUEST</Button>
    </div>
  );
}

/* ===================== QUOTE REQUEST SHELL ===================== */
function QuoteRequestShell({ d, onDone, onCancel }) {
  const [step, setStep] = usePJob(0);
  const [form, setForm] = usePJob({ qty: '100 pcs', priority: 'Standard (5 days)', material: 'FR4 Standard', finish: d.finishes[0], smask: 'Green', timeline: 'ASAP — start immediately', delivery: 'Delivery to my address', files: [] });
  const canNext = step === 0 ? (form.name && form.description) : step === 2 ? form.files && form.files.length > 0 : true;

  const stepContent = [
    <StepDetails form={form} setForm={setForm} />,
    <StepSpecs form={form} setForm={setForm} d={d} />,
    <StepFiles form={form} setForm={setForm} d={d} />,
    <StepTimeline form={form} setForm={setForm} />,
    <StepReview form={form} d={d} onSubmit={onDone} />,
  ];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 28px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
        <button onClick={onCancel} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <Icon name="chevR" size={15} style={{ transform: 'rotate(180deg)' }} />Back to listing
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>Step {step + 1} of {STEP_LABELS.length}</div>
      </div>
      <StepHeader step={step} total={STEP_LABELS.length} />
      <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '28px 32px' }}>
        <h2 style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>{STEP_LABELS[step]}</h2>
        {stepContent[step]}
      </div>
      {step < STEP_LABELS.length - 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, gap: 12 }}>
          <Button kind="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>BACK</Button>
          <Button kind="primary" iconRight="chevR" onClick={() => setStep(s => s + 1)} disabled={!canNext}>CONTINUE</Button>
        </div>
      )}
    </div>
  );
}

/* ===================== JOB DETAIL PAGE ===================== */
function JobDetailPage({ route, item, go, authed, requireAuth }) {
  const routeId = route && route.id;
  const job = item || (window.JOBS || []).find(j => j.id === routeId) || (window.JOBS || [])[0];
  const legacyQuote = job ? ((window.JOB_DETAILS || {})[job.id] || null) : null;
  const hasInstantQuote = !!(legacyQuote && legacyQuote.quote);
  const isFixed = job ? job.fixed && !hasInstantQuote : false;
  const d = hasInstantQuote ? window.JOB_DETAIL_FIXED : isFixed ? window.JOB_DETAIL_FIXED : window.JOB_DETAIL;
  const [imgIdx, setImgIdx] = usePJob(0);
  const [selTier, setSelTier] = usePJob((hasInstantQuote || isFixed) ? d.tiers[2] : d.pricing[2]);
  const [ordering, setOrdering] = usePJob(false);
  const [quoting, setQuoting] = usePJob(false);
  const quoteRef = useRefJob(null);
  const galleryImages = d.galleryImages || [];
  const quoteUrl = '../Flex%20Factory%20Instant%20Quote%20_standalone_.html';
  const quoteVersion = 'c733ed2';
  const embedUrl = quoteUrl + '?embed=1&v=' + quoteVersion + (legacyQuote && legacyQuote.quoteProcess ? '&process=' + legacyQuote.quoteProcess : '');

  const startOrder = () => requireAuth(() => { setOrdering(true); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  const startQuote = () => requireAuth(() => { setQuoting(true); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  const scrollToQuote = () => quoteRef.current && window.scrollTo({ top: quoteRef.current.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });

  if (ordering) return <FixedOrderShell d={d} selTier={selTier} onDone={() => go({ name: 'account', sub: 'orders', order: window.MOCK_ORDERS[1] })} onCancel={() => setOrdering(false)} />;
  if (quoting) return <QuoteRequestShell d={d} onDone={() => go({ name: 'account', sub: 'quotes', quote: window.MOCK_QUOTES[0] })} onCancel={() => setQuoting(false)} />;

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 28px 80px' }}>
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 18, flexWrap: 'wrap' }}>
        {d.crumb.map((c, i) => (
          <React.Fragment key={c}>
            {i > 0 && <Icon name="chevR" size={12} />}
            <span style={{ color: i === d.crumb.length - 1 ? 'var(--ink)' : 'var(--ink-3)', fontWeight: i === d.crumb.length - 1 ? 600 : 400 }}>{c}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'flex-start' }}>
        {/* left col */}
        <div>
          {/* gallery */}
          <div className="chamfer" style={{ overflow: 'hidden', marginBottom: 24 }}>
            <Thumb icon="grid" tone="blue" h={400} image={galleryImages[imgIdx]} alt={d.gallery[imgIdx] || d.title} loading="eager" style={{ width: '100%', height: 400 }} />
            <div style={{ display: 'flex', gap: 8, padding: '10px 12px', background: 'var(--surface)', overflowX: 'auto' }}>
              {d.gallery.map((g, i) => <GallThumb key={g} label={g} image={galleryImages[i]} active={i === imgIdx} onClick={() => setImgIdx(i)} />)}
            </div>
          </div>
          {/* title row */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {d.badges.map(b => <Tag key={b.l} tone={b.t}>{b.l}</Tag>)}
            </div>
            <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 34, letterSpacing: '-0.03em' }}>{d.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Stars value={d.rating} size={14} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{d.rating.toFixed(1)}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>({d.orders} orders)</span>
              </div>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-3)' }} />
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{d.vendor} · {d.city}</span>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-3)' }} />
              <span style={{ fontSize: 13, color: 'var(--pos)', fontWeight: 600 }}>● {d.available}</span>
            </div>
          </div>
          {/* about */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px', marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>ABOUT THIS SERVICE</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>{d.blurb}</p>
          </div>
          {/* tech specs */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px', marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>TECHNICAL SPECIFICATIONS</h2>
            {d.specs.map(([k, v], i) => <SpecRow key={k} label={k} value={v} last={i === d.specs.length - 1} />)}
          </div>
          {hasInstantQuote && (
            <section ref={quoteRef} style={{ marginBottom: 20 }}>
              <div style={{ height: 4, width: 56, background: 'var(--ff-lime)', marginBottom: 14 }} />
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>Instant quote</h2>
                  <p style={{ margin: '5px 0 0', fontSize: 13.5, color: 'var(--ink-3)' }}>Upload your part — the price updates live as you change process, material and quantity. No account needed.</p>
                </div>
                <a href={quoteUrl} target="_blank" rel="noreferrer" className="focus-lime" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--ff-blue)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Open full screen <Icon name="external" size={15} stroke={2.2} /></a>
              </div>
              <div className="chamfer" style={{ border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)', overflow: 'hidden', background: 'var(--surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 16px', borderBottom: '1px solid var(--line)', background: 'var(--surface-2)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ff-lime)' }} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>FF Instant-Quote Engine · Live</span>
                </div>
                <iframe src={embedUrl} title="FlexFactory Instant Quote" loading="lazy" style={{ width: '100%', height: 820, border: 0, display: 'block' }} />
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>Prices are indicative, generated in your browser from the uploaded geometry. {d.vendor} confirms a firm quote — covering manufacturability, finish and tolerances — before anything is charged.</p>
            </section>
          )}
          {/* pricing section */}
          {!hasInstantQuote && <div className="chamfer" ref={quoteRef} style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px', marginBottom: 20 }}>
            <h2 style={{ margin: '0 0 16px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>PRICING</h2>
            {isFixed
              ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }} className="tier-grid">
                  {d.tiers.map(tier => <PriceTier key={tier.qty} tier={tier} selected={selTier === tier} onSelect={() => setSelTier(tier)} />)}
                </div>
              : <React.Fragment>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }} className="tier-grid">
                    {d.pricing.map(tier => <PriceTier key={tier.qty} tier={tier} selected={selTier === tier} onSelect={() => setSelTier(tier)} />)}
                  </div>
                  <div style={{ marginTop: 16, fontSize: 13, color: 'var(--ink-3)' }}>Prices are estimates. Final quote issued after file review. Platform fee 12% included.</div>
                </React.Fragment>}
          </div>}
          {/* file types accepted */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
            <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>ACCEPTED FILE FORMATS</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {d.fileTypes.map(ft => (
                <span key={ft} className="chamfer-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 12px', background: 'var(--ff-fog)', color: 'var(--ff-blue)', fontSize: 13, fontWeight: 600 }}>
                  <Icon name="file" size={13} />{ft}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* right rail */}
        {hasInstantQuote
          ? <InstantQuoteRail d={d} onStart={scrollToQuote} />
          : isFixed
          ? <OrderRail d={d} selTier={selTier} setSelTier={setSelTier} onStart={startOrder} />
          : <QuoteRail d={d} selectedTier={selTier} onStart={startQuote} />}
      </div>
    </div>
  );
}

Object.assign(window, { JobDetailPage, QuoteRequestShell });
