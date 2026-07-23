// engines/core/machines.js
// DOM-free AM machine profile helpers. A process may define `machines[]`; older
// coefficient sets without it are represented as one synthesized fallback machine.

function dims3(bbox = {}) {
  return [bbox.x || 0, bbox.y || 0, bbox.z || 0];
}

function sortedDims(bbox = {}) {
  return dims3(bbox).sort((a, b) => b - a);
}

function envelopeVolume(envelope = {}) {
  return (envelope.x || 0) * (envelope.y || 0) * (envelope.z || 0);
}

export function fitsEnvelope(bbox_mm, envelope) {
  if (!bbox_mm || !envelope) return true;
  const part = sortedDims(bbox_mm);
  const cap = sortedDims(envelope);
  return part.every((d, i) => d <= cap[i] + 1e-9);
}

export function supportsMaterial(machine, materialKey) {
  return !machine.materials || !machine.materials.length || machine.materials.includes(materialKey);
}

export function fallbackMachine(process = {}, processKey = 'process') {
  return {
    id: `${processKey}-default`,
    name: process.name ? `${process.name} default` : 'Default machine',
    ratePerHour: process.hourlyRate ?? 0,
    envelope: process.envelope || null,
    materials: null,
    build: process.build || null,
    quality: 1.0,
    fallback: true,
  };
}

export function normalizeMachines(process = {}, processKey = 'process') {
  const base = fallbackMachine(process, processKey);
  const machines = Array.isArray(process.machines) && process.machines.length
    ? process.machines
    : [base];

  return machines.map((m, idx) => ({
    ...base,
    ...m,
    id: m.id || `${processKey}-machine-${idx + 1}`,
    name: m.name || base.name,
    ratePerHour: m.ratePerHour ?? m.hourlyRate ?? base.ratePerHour,
    envelope: m.envelope || base.envelope,
    materials: Array.isArray(m.materials) ? m.materials : base.materials,
    build: m.build || base.build,
    fallback: !!m.fallback || (!Array.isArray(process.machines) || !process.machines.length),
  }));
}

export function machineOption(machine, bbox_mm, materialKey, cost) {
  const fits = fitsEnvelope(bbox_mm, machine.envelope);
  const materialOk = supportsMaterial(machine, materialKey);
  return {
    id: machine.id,
    name: machine.name,
    fits,
    materialOk,
    feasible: fits && materialOk,
    ratePerHour: machine.ratePerHour,
    envelope: machine.envelope,
    unitPrice: Number.isFinite(cost) ? cost : null,
  };
}

/**
 * @param {Object} process
 * @param {{bbox_mm:Object, materialKey:string, overrideId?:string, processKey?:string}} ctx
 * @param {(machine:Object)=>number} [costFn]
 */
export function selectMachine(process, ctx = {}, costFn = () => 0) {
  const machines = normalizeMachines(process, ctx.processKey || 'process');
  const all = machines.map((machine) => machineOption(
    machine,
    ctx.bbox_mm,
    ctx.materialKey,
    costFn(machine)
  ));
  const feasible = all.filter((m) => m.feasible);
  const byId = new Map(machines.map((m) => [m.id, m]));

  let selectedOption = null;
  let reason = 'auto';
  let oversized = false;

  if (ctx.overrideId) {
    const override = feasible.find((m) => m.id === ctx.overrideId);
    if (override) {
      selectedOption = override;
      reason = 'override';
    }
  }

  if (!selectedOption && feasible.length) {
    selectedOption = [...feasible].sort((a, b) => (a.unitPrice ?? Infinity) - (b.unitPrice ?? Infinity))[0];
  }

  if (!selectedOption) {
    oversized = true;
    selectedOption = [...all].sort((a, b) =>
      envelopeVolume(b.envelope) - envelopeVolume(a.envelope)
    )[0] || null;
    reason = 'no machine fits - manual review / split';
  }

  return {
    machine: selectedOption ? byId.get(selectedOption.id) : null,
    feasible,
    all,
    oversized,
    reason,
  };
}
