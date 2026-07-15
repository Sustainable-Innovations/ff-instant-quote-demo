// client_pages_product.jsx — material product detail with variants + quantity + add to cart
const { useState: useProd } = React;

// Variant options derived from category (keeps mock data lean).
function materialVariants(item) {
  if (item.variants) return item.variants;
  const byCat = {
    'Filament': { label: 'Color', options: ['Black', 'White', 'Grey', 'Red', 'Blue', 'Lime'] },
    'Resin': { label: 'Shade', options: ['Grey', 'Clear', 'Black'] },
    'Sheet Stock': { label: 'Size', options: ['600 × 400 mm', '300 × 300 mm', 'A4'] },
    'Metal': { label: 'Length', options: ['1 m', '0.5 m'] },
    'Electronics': { label: 'Pack', options: ['Pack of 5', 'Pack of 10'] },
  };
  return byCat[item.cat] || null;
}

function ProductDetail({ route, go, onAddToCart }) {
  const toast = useToast();
  const item = (window.MATERIALS || []).find(m => m.id === route.id) || window.MATERIALS[0];
  const variants = materialVariants(item);
  const [variant, setVariant] = useProd(variants ? variants.options[0] : null);
  const [qty, setQty] = useProd(1);
  const related = (window.MATERIALS || []).filter(m => m.cat === item.cat && m.id !== item.id).slice(0, 4);
  const lowStock = item.stock != null && item.stock <= 80;

  const add = () => { onAddToCart(item, qty, variant); toast(`Added ${qty} × ${item.title}${variant ? ' (' + variant + ')' : ''} to cart`); };

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '24px 28px 64px' }}>
      {/* breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', marginBottom: 18, flexWrap: 'wrap' }}>
        <button onClick={() => go({ name: 'home' })} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Home</button>
        <Icon name="chevR" size={13} />
        <button onClick={() => go({ name: 'browse', kind: 'material' })} style={{ border: 'none', background: 'transparent', padding: 0, color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Shop</button>
        <Icon name="chevR" size={13} />
        <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{item.title}</span>
      </div>

      <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' }}>
        {/* main */}
        <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="chamfer" style={{ overflow: 'hidden', border: '1px solid var(--line)', background: 'var(--surface)' }}>
            <Thumb icon={item.icon} tone="blue" h={380} image={item.image} alt={item.title} imageFit="contain" />
          </div>
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
            <h2 style={{ margin: '0 0 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>ABOUT THIS MATERIAL</h2>
            <p style={{ margin: 0, fontSize: 14.5, color: 'var(--ink-2)', lineHeight: 1.7 }}>{item.blurb}</p>
          </div>
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '20px 24px' }}>
            <h2 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', color: 'var(--ff-blue)' }}>CATALOG SPECIFICATIONS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="incl-grid">
              {[
                ['Dimensions', item.dimensions],
                ['Grade / spec', item.grade],
                ['Finish', item.finish],
                ['Cut to size', item.cutToSize ? 'Available' : 'Stock size only'],
              ].map(([k, v]) => (
                <div key={k} className="chamfer-sm" style={{ background: 'var(--ff-fog)', border: '1px solid var(--line)', padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{k}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 700, marginTop: 4, lineHeight: 1.35 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {related.length > 0 && (
            <div>
              <h2 style={{ margin: '4px 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>More in {item.cat}</h2>
              <div className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'stretch' }}>
                {related.map(it => <ListingCard key={it.id} item={it} onOpen={() => go({ name: 'product', id: it.id, kind: 'material' })} onAdd={(m) => onAddToCart(m)} />)}
              </div>
            </div>
          )}
        </div>

        {/* rail */}
        <div className="detail-rail" style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="chamfer" style={{ background: 'var(--surface)', border: '1px solid var(--line)', padding: '22px 24px' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {item.tags.map(t => <Tag key={t} tone="blue">{t}</Tag>)}
            </div>
            <h1 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em' }}>{item.title}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <Stars value={item.rating} reviews={item.reviews} />
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--ink-3)' }} />
              <span style={{ fontSize: 12.5, color: lowStock ? 'var(--warn)' : 'var(--pos)', fontWeight: 700 }}>{lowStock ? 'Low stock' : 'In stock'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 18 }}>
              <Price value={item.price} unit={'/ ' + item.unit} size={30} color="var(--ff-blue)" />
              {item.off > 0 && <span className="chamfer-sm" style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'var(--neg)', padding: '2px 8px', marginLeft: 4 }}>{item.off}% OFF</span>}
            </div>
            <div className="chamfer-sm" style={{ background: 'var(--ff-fog)', border: '1px solid var(--line)', padding: '12px 14px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Dimensions', item.dimensions],
                ['Grade', item.grade],
                ['Finish', item.finish],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
                  <span style={{ color: 'var(--ink-3)', fontWeight: 700 }}>{k}</span>
                  <span style={{ color: 'var(--ink)', fontWeight: 700, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: item.cutToSize ? 'var(--pos)' : 'var(--ink-3)', fontWeight: 700, paddingTop: 2 }}>
                <Icon name={item.cutToSize ? 'check' : 'box'} size={13} stroke={2.5} />{item.cutToSize ? 'Cut-to-size available' : 'Ships in stock size'}
              </div>
            </div>

            {variants && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--ink-3)', marginBottom: 8 }}>{variants.label.toUpperCase()}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {variants.options.map(o => {
                    const on = variant === o;
                    return (
                      <button key={o} onClick={() => setVariant(o)} className="chamfer-sm focus-lime" style={{ height: 34, padding: '0 13px', fontSize: 13, fontWeight: 600, border: '1.5px solid ' + (on ? 'var(--ff-blue)' : 'var(--line-strong)'), background: on ? 'rgba(1,53,244,0.05)' : 'var(--surface)', color: on ? 'var(--ff-blue)' : 'var(--ink-2)', cursor: 'pointer', transition: 'border-color .15s' }}>{o}</button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.09em', color: 'var(--ink-3)', marginBottom: 8 }}>QUANTITY</div>
              <div className="chamfer-sm" style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line-strong)' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="focus-lime" aria-label="Decrease quantity" style={{ width: 40, height: 42, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="minus" size={16} /></button>
                <span className="mono-fig" style={{ minWidth: 40, textAlign: 'center', fontWeight: 700, fontSize: 16 }}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="focus-lime" aria-label="Increase quantity" style={{ width: 40, height: 42, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--ink-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="plus" size={16} /></button>
              </div>
            </div>

            <Button kind="lime" full icon="cart" onClick={add} style={{ fontWeight: 700, height: 50 }}>ADD TO CART · <span className="mono-fig" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Riyal size={13} />{window.SAR2(item.price * qty)}</span></Button>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', textAlign: 'center', marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 5, justifyContent: 'center', width: '100%' }}><Icon name="truck" size={13} />Free delivery over <Riyal size={10} />200 · ships in 2 days</div>
          </div>
          {/* trust */}
          <div className="chamfer" style={{ background: 'var(--ff-fog)', border: '1px solid var(--line)', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[['check', 'Verified vendor — ' + item.vendor], ['wallet', 'Secure, escrow-protected checkout'], ['refresh', '14-day returns on unopened stock']].map(([ic, t]) => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                <Icon name={ic} size={16} style={{ color: 'var(--ff-blue)', flexShrink: 0 }} />{t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ProductDetail });
