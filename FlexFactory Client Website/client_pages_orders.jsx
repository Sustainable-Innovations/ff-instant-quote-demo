// client_pages_orders.jsx — orders list + order detail with status tracker
const { useState: useOrders } = React;

/* ---------- status config ---------- */
const STATUS_CONFIG = {
  in_production: { label: 'In Production', tone: 'blue'    },
  ready:         { label: 'Ready',          tone: 'pos'     },
  completed:     { label: 'Completed',      tone: 'default' },
  pending_quote: { label: 'Pending Quote',  tone: 'warn'    },
  quoted:        { label: 'Quote Received', tone: 'purple'  },
  cancelled:     { label: 'Cancelled',      tone: 'neg'     },
};

/* ---------- status tracker ---------- */
function StatusTracker({ timeline }) {
  const lastDone = timeline.filter(t => t.done).length - 1;
  return (
    <div style={{ padding: '24px 26px' }}>
      {timeline.map((t, i) => {
        const isLast = i === timeline.length - 1;
        return (
          <div key={t.key} style={{ display: 'flex', gap: 14, position: 'relative' }}>
            {/* spine */}
            {!isLast && (
              <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: t.done && !t.active ? 'var(--ff-blue)' : 'var(--line)', zIndex: 0 }} />
            )}
            {/* dot */}
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.active ? 'var(--ff-blue)' : t.done ? 'var(--ff-blue)' : 'var(--bg)', border: t.active ? '2px solid var(--ff-blue)' : t.done ? 'none' : '2px solid var(--line)', transition: 'background .2s' }}>
              {t.done && !t.active
                ? <Icon name="check" size={14} stroke={3} style={{ color: '#fff' }} />
                : t.active
                  ? <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#fff' }} />
                  : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--line-strong)' }} />}
            </div>
            {/* content */}
            <div style={{ paddingBottom: isLast ? 0 : 22, paddingTop: 4, minWidth: 0 }}>
              <div style={{ fontWeight: t.active ? 700 : t.done ? 600 : 400, fontSize: 14, color: t.active ? 'var(--ff-blue)' : t.done ? 'var(--ink)' : 'var(--ink-3)' }}>{t.label}</div>
              {t.date && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{t.date}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- messages thread ---------- */
function MessagesThread({ messages }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0' }}>
      {messages.map((m, i) => {
        const isMe = m.from === 'You';
        return (
          <div key={i} style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap: 10, alignItems: 'flex-start' }}>
            <div className="chamfer-sm" style={{ width: 34, height: 34, flexShrink: 0, background: isMe ? 'var(--ff-lime)' : 'var(--ff-blue)', color: isMe ? 'var(--ff-navy)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>
              {isMe ? window.CLIENT.fullName[0] : m.from[0]}
            </div>
            <div style={{ maxWidth: '72%' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexDirection: isMe ? 'row-reverse' : 'row', marginBottom: 5 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700 }}>{m.from}</span>
                <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{m.time}</span>
              </div>
              <div className="chamfer-sm" style={{ background: isMe ? 'rgba(1,53,244,0.07)' : 'var(--surface)', border: '1px solid var(--line)', padding: '10px 14px', fontSize: 13.5, lineHeight: 1.55, color: 'var(--ink-2)' }}>
                {m.text}
              </div>
            </div>
          </div>
        );
      })}
      {/* reply box */}
      <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
        <input placeholder="Write a message to the provider…" className="chamfer-sm"
          style={{ flex: 1, height: 42, padding: '0 14px', border: '1px solid var(--line-strong)', fontSize: 14, background: 'var(--bg)', color: 'var(--ink)', outline: 'none' }} />
        <Button kind="primary" icon="send" size="md">SEND</Button>
      </div>
    </div>
  );
}

/* ---------- order detail ---------- */
function OrderDetail({ order, onBack }) {
  const toast = useToast();
  const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.in_production;
  return (
    <div>
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 22, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Account</button>
        <Icon name="chevR" size={13} />
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Orders</button>
        <Icon name="chevR" size={13} />
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{order.id}</span>
      </div>

      <div className="booking-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22, alignItems: 'start' }}>
        {/* main col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* header card */}
          <div className="chamfer" style={{ background: 'var(--ff-navy)', color: '#fff', padding: '26px 30px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -10, bottom: -20, opacity: 0.05, pointerEvents: 'none', transform: 'scale(5.5)', transformOrigin: 'bottom right' }}>
              <FFMark size={50} accent />
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', padding: '5px 14px', borderRadius: 20, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ff-lime)', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>SERVICE ORDER</span>
              </div>
              <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{order.service}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 30px', marginTop: 16 }}>
                {[['ORDER', order.id], ['VENDOR', order.vendor + ' · ' + order.city], ['QTY', order.qty], ['SUBMITTED', order.submitted]].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>{lbl}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ff-lime)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* quote breakdown */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>QUOTE BREAKDOWN</h3>
            {order.quote.breakdown.map(([item, price]) => (
              <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid var(--line)', fontSize: 14 }}>
                <span style={{ color: 'var(--ink-2)' }}>{item}</span>
                <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {price === 0 ? <span style={{ color: 'var(--pos)', fontWeight: 700 }}>Included</span> : <React.Fragment><Riyal size={11} />{window.SAR2(price)}</React.Fragment>}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '2px solid var(--ff-blue)', marginTop: 4 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--ff-blue)', letterSpacing: '-0.03em' }}>
                <Riyal size={20} color="var(--ff-blue)" />{window.SAR2(order.total)}
              </span>
            </div>
            {order.quote.note && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4, lineHeight: 1.5 }}>{order.quote.note}</div>}
          </div>

          {/* files */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>ATTACHED FILES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.files.map(f => (
                <div key={f} className="chamfer-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
                  <Icon name="file" size={18} style={{ color: 'var(--ff-blue)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{f}</span>
                  <Button kind="ghost" size="sm" icon="download" onClick={() => useToast && toast(f + ' download started')}>Download</Button>
                </div>
              ))}
            </div>
          </div>

          {/* messages */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>MESSAGES</h3>
            <MessagesThread messages={order.messages} />
          </div>
        </div>

        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* status */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>ORDER STATUS</h3>
              <Tag tone={st.tone}>{st.label}</Tag>
            </div>
            <StatusTracker timeline={order.timeline} />
          </div>
          {/* specs */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--ink-3)', marginBottom: 12 }}>SPECIFICATIONS</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{order.specs}</div>
          </div>
          {/* actions */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--ink-3)', marginBottom: 12 }}>ACTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button kind="primary" full icon="download" onClick={() => toast('Invoice downloading')}>Download Invoice</Button>
              {order.status === 'ready' && <Button kind="lime" full onClick={() => toast('Marked as received!')}>MARK AS RECEIVED</Button>}
              {(order.status === 'in_production' || order.status === 'pending_quote') && (
                <Button kind="ghost" full style={{ color: 'var(--neg)', border: '1px solid var(--neg)' }} onClick={() => toast('Cancellation requested')}>CANCEL ORDER</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- orders list ---------- */
function OrdersList({ onSelect }) {
  return (
    <div>
      <h2 style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>My Orders</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {window.MOCK_ORDERS.map(order => {
          const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.in_production;
          return (
            <button key={order.id} onClick={() => onSelect(order)}
              className="chamfer"
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ff-blue)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'border-color .15s, box-shadow .15s' }}>
              <div className="chamfer-sm" style={{ width: 48, height: 48, background: 'var(--ff-fog)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ff-blue)', flexShrink: 0 }}>
                <Icon name={order.icon} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{order.service}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{order.vendor} · {order.qty} · {order.specs}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{order.id} · Submitted {order.submitted}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <Tag tone={st.tone}>{st.label}</Tag>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
                  <Riyal size={12} />{window.SAR2(order.total)}
                </span>
              </div>
              <Icon name="chevR" size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- quote detail ---------- */
function QuoteDetail({ quote, onBack }) {
  const toast = useToast();
  const st = {
    quote_received: { label: 'Quote Received', tone: 'warn' },
    pending_review: { label: 'Pending Review', tone: 'blue' },
    approved:       { label: 'Approved',       tone: 'pos'  },
    declined:       { label: 'Declined',        tone: 'neg'  },
  }[quote.status] || { label: quote.status, tone: 'gray' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 22, flexWrap: 'wrap' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Account</button>
        <Icon name="chevR" size={13} />
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Quotes</button>
        <Icon name="chevR" size={13} />
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{quote.id}</span>
      </div>
      <div className="booking-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 22, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* header */}
          <div className="chamfer" style={{ background: 'var(--ff-navy)', color: '#fff', padding: '26px 30px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -10, bottom: -20, opacity: 0.05, pointerEvents: 'none', transform: 'scale(5.5)', transformOrigin: 'bottom right' }}><FFMark size={50} accent /></div>
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', padding: '5px 14px', borderRadius: 20, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ff-lime)', flexShrink: 0 }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>QUOTE REQUEST</span>
              </div>
              <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{quote.service}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 30px', marginTop: 16 }}>
                {[['QUOTE ID', quote.id], ['VENDOR', quote.vendor + ' · ' + quote.city], ['QTY', quote.qty], ['SUBMITTED', quote.submitted]].map(([lbl, val]) => (
                  <div key={lbl}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>{lbl}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ff-lime)' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* quote from provider */}
          {quote.providerQuote ? (
            <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>PROVIDER QUOTE</h3>
                <Tag tone="warn">Valid until {quote.providerQuote.validUntil}</Tag>
              </div>
              {quote.providerQuote.breakdown.map(([item, price]) => (
                <div key={item} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--line)', fontSize: 14 }}>
                  <span style={{ color: 'var(--ink-2)' }}>{item}</span>
                  <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {price === 0 ? <span style={{ color: 'var(--pos)' }}>Included</span> : <React.Fragment><Riyal size={11} />{window.SAR2(price)}</React.Fragment>}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '2px solid var(--ff-blue)', marginTop: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--ff-blue)', letterSpacing: '-0.03em' }}>
                  <Riyal size={20} color="var(--ff-blue)" />{window.SAR2(quote.providerQuote.amount)}
                </span>
              </div>
              {quote.providerQuote.note && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>{quote.providerQuote.note}</div>}
              {quote.status === 'quote_received' && (
                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <Button kind="lime" full iconRight="check" onClick={() => toast('Quote approved — order created!')}>APPROVE QUOTE</Button>
                  <Button kind="ghost" style={{ border: '1px solid var(--line-strong)', flexShrink: 0 }} onClick={() => toast('Revision requested')}>REQUEST REVISION</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="chamfer" style={{ background: 'var(--ff-fog)', border: '1px solid var(--line)', padding: '28px 24px', textAlign: 'center' }}>
              <Icon name="clock" size={32} style={{ color: 'var(--ff-blue)', margin: '0 auto 12px' }} />
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Waiting for provider quote</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{quote.vendor} is reviewing your files. You'll be notified when the quote is ready — typically within 24 hours.</div>
            </div>
          )}

          {/* files */}
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
            <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>ATTACHED FILES</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {quote.files.map(f => (
                <div key={f} className="chamfer-sm" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--line)' }}>
                  <Icon name="file" size={18} style={{ color: 'var(--ff-blue)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13.5 }}>{f}</span>
                  <Button kind="ghost" size="sm" icon="download" onClick={() => toast(f + ' downloading')}>Download</Button>
                </div>
              ))}
            </div>
          </div>

          {/* messages */}
          {quote.messages.length > 0 && (
            <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
              <h3 style={{ margin: '0 0 18px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>MESSAGES</h3>
              <MessagesThread messages={quote.messages} />
            </div>
          )}
        </div>

        {/* right rail */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em' }}>QUOTE STATUS</h3>
              <Tag tone={st.tone}>{st.label}</Tag>
            </div>
            {[['Service', quote.service], ['Quantity', quote.qty], ['Specs', quote.specs], ['Submitted', quote.submitted]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderTop: '1px solid var(--line)', fontSize: 14, gap: 12 }}>
                <span style={{ color: 'var(--ink-3)', flexShrink: 0 }}>{k}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 20px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--ink-3)', marginBottom: 12 }}>ACTIONS</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quote.status === 'pending_review' && <Button kind="ghost" full style={{ color: 'var(--neg)', border: '1px solid var(--neg)' }} onClick={() => toast('Quote request withdrawn')}>WITHDRAW REQUEST</Button>}
              {quote.status === 'quote_received' && <Button kind="ghost" full style={{ color: 'var(--neg)', border: '1px solid var(--neg)' }} onClick={() => toast('Quote declined')}>DECLINE QUOTE</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- quotes list ---------- */
function QuotesList({ onSelect, initialQuote }) {
  const stMap = {
    quote_received: { label: 'Quote Received', tone: 'warn' },
    pending_review: { label: 'Pending Review', tone: 'blue' },
    approved:       { label: 'Approved',       tone: 'pos'  },
  };
  return (
    <div>
      <h2 style={{ margin: '0 0 22px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em' }}>My Quotes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {window.MOCK_QUOTES.map(q => {
          const st = stMap[q.status] || { label: q.status, tone: 'gray' };
          return (
            <button key={q.id} onClick={() => onSelect(q)}
              className="chamfer"
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ff-blue)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
              style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'border-color .15s, box-shadow .15s' }}>
              <div className="chamfer-sm" style={{ width: 48, height: 48, background: 'var(--ff-fog)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ff-blue)', flexShrink: 0 }}>
                <Icon name={q.icon} size={22} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{q.service}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>{q.vendor} · {q.qty} · {q.specs}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 1 }}>{q.id} · Submitted {q.submitted}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <Tag tone={st.tone}>{st.label}</Tag>
                {q.providerQuote && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}><Riyal size={12} />{window.SAR2(q.providerQuote.amount)}</span>}
              </div>
              <Icon name="chevR" size={16} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { OrdersList, OrderDetail, QuotesList, QuoteDetail });

