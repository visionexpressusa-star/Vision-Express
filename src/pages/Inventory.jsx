import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Modal from "../components/Modal.jsx";
import { Loading, Message, usePageTitle } from "../components/common.jsx";
import { useToast } from "../components/Toast.jsx";
import { formatDate, formatMoney } from "../lib/format.js";
import { supabase } from "../lib/supabase.js";

const CATEGORIES = ["Frame", "Sunglasses", "Lens", "Contact Lens", "Accessory", "Other"];
const REASONS_IN = ["Received shipment", "Customer return", "Count correction", "Other"];
const REASONS_OUT = ["Sold", "Damaged", "Count correction", "Used for repair", "Other"];

const EMPTY_ITEM = {
  category: "Frame", brand: "", model: "", color: "", size: "", sku: "",
  quantity: "0", low_stock_at: "2", cost: "", price: "", location: "", notes: "",
};

const text = (value) => (value === null || value === undefined ? "" : String(value));
const blank = (value) => (String(value).trim() === "" ? null : String(value).trim());

function itemName(item) {
  return [item.brand, item.model].filter(Boolean).join(" ");
}

function stockBadge(item) {
  if (!item.active) return <span className="badge-pill badge-neutral">Archived</span>;
  if (item.quantity === 0) return <span className="badge-pill badge-danger">Out of stock</span>;
  if (item.quantity <= item.low_stock_at) return <span className="badge-pill badge-warning">Low stock</span>;
  return <span className="badge-pill badge-success">In stock</span>;
}

// ---------- Add / edit item ----------

function ItemForm({ item, onClose, onSaved }) {
  const editing = Boolean(item);
  const toast = useToast();
  const [form, setForm] = useState(
    editing ? Object.fromEntries(Object.keys(EMPTY_ITEM).map((key) => [key, text(item[key])])) : EMPTY_ITEM
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.brand.trim()) return setError("Brand is required.");
    const numbers = { quantity: "Quantity", low_stock_at: "Low-stock level" };
    for (const [key, label] of Object.entries(numbers)) {
      if (!/^\d+$/.test(String(form[key]).trim())) return setError(`${label} must be a whole number, 0 or more.`);
    }
    for (const [key, label] of [["cost", "Cost"], ["price", "Price"]]) {
      if (blank(form[key]) !== null && !(Number(form[key]) >= 0)) return setError(`${label} must be 0 or more.`);
    }

    const row = {
      category: form.category,
      brand: form.brand.trim(),
      model: blank(form.model),
      color: blank(form.color),
      size: blank(form.size),
      sku: blank(form.sku),
      low_stock_at: Number(form.low_stock_at),
      cost: blank(form.cost) === null ? null : Number(form.cost),
      price: blank(form.price) === null ? null : Number(form.price),
      location: blank(form.location),
      notes: blank(form.notes),
    };
    if (!editing) row.quantity = Number(form.quantity);

    setSaving(true);
    const { error: saveError } = editing
      ? await supabase.from("inventory_items").update(row).eq("id", item.id)
      : await supabase.from("inventory_items").insert(row);
    setSaving(false);
    if (saveError) {
      setError(saveError.code === "23505" ? "Another item already uses that SKU." : saveError.message);
      return;
    }
    toast(editing ? `${itemName(row)} updated.` : `${itemName(row)} added to inventory.`);
    onSaved();
  }

  return (
    <Modal title={editing ? `Edit ${itemName(item)}` : "Add inventory item"} onClose={onClose}>
      <Message type="error">{error}</Message>
      <form onSubmit={submit}>
        <div className="form-grid">
          <div className="field-group">
            <label htmlFor="inv-category">Category</label>
            <select id="inv-category" className="form-control" value={form.category} onChange={set("category")}>
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </div>
          <div className="field-group">
            <label htmlFor="inv-sku">SKU / barcode</label>
            <input id="inv-sku" className="form-control" value={form.sku} onChange={set("sku")} placeholder="Optional" />
          </div>
          <div className="field-group">
            <label htmlFor="inv-brand">Brand *</label>
            <input id="inv-brand" className="form-control" required value={form.brand} onChange={set("brand")} autoFocus />
          </div>
          <div className="field-group">
            <label htmlFor="inv-model">Model</label>
            <input id="inv-model" className="form-control" value={form.model} onChange={set("model")} />
          </div>
          <div className="field-group">
            <label htmlFor="inv-color">Color</label>
            <input id="inv-color" className="form-control" value={form.color} onChange={set("color")} />
          </div>
          <div className="field-group">
            <label htmlFor="inv-size">Size</label>
            <input id="inv-size" className="form-control" value={form.size} onChange={set("size")} placeholder="e.g. 52-18-140" />
          </div>
          {!editing && (
            <div className="field-group">
              <label htmlFor="inv-qty">Opening quantity</label>
              <input id="inv-qty" className="form-control" type="number" min="0" step="1" value={form.quantity} onChange={set("quantity")} />
            </div>
          )}
          <div className="field-group">
            <label htmlFor="inv-low">Warn when stock is at or below</label>
            <input id="inv-low" className="form-control" type="number" min="0" step="1" value={form.low_stock_at} onChange={set("low_stock_at")} />
          </div>
          <div className="field-group">
            <label htmlFor="inv-cost">Cost ($)</label>
            <input id="inv-cost" className="form-control" type="number" min="0" step="0.01" value={form.cost} onChange={set("cost")} />
          </div>
          <div className="field-group">
            <label htmlFor="inv-price">Selling price ($)</label>
            <input id="inv-price" className="form-control" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} />
          </div>
          <div className="field-group wide">
            <label htmlFor="inv-location">Location</label>
            <input id="inv-location" className="form-control" value={form.location} onChange={set("location")} placeholder="e.g. Wall display B, drawer 3" />
          </div>
          <div className="field-group wide">
            <label htmlFor="inv-notes">Notes</label>
            <textarea id="inv-notes" className="form-control" rows={2} value={form.notes} onChange={set("notes")} />
          </div>
        </div>
        {editing && <p className="muted small">To change the quantity, use the + / − buttons so every change is logged.</p>}
        <div className="modal-actions">
          <button className="toolbar-button secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="toolbar-button create-button" type="submit" disabled={saving}>
            {saving ? "Saving…" : editing ? "Save changes" : "Add item"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------- Stock in / out ----------

function AdjustForm({ item, direction, onClose, onSaved }) {
  const toast = useToast();
  const [mode, setMode] = useState(direction);
  const [amount, setAmount] = useState("1");
  const [reason, setReason] = useState(direction === "in" ? REASONS_IN[0] : REASONS_OUT[0]);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const reasons = mode === "in" ? REASONS_IN : REASONS_OUT;

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!/^\d+$/.test(amount.trim()) || Number(amount) === 0) return setError("Enter how many, as a whole number above 0.");
    const change = mode === "in" ? Number(amount) : -Number(amount);
    if (item.quantity + change < 0) return setError(`Only ${item.quantity} in stock.`);
    const fullReason = note.trim() ? `${reason} – ${note.trim()}` : reason;
    setSaving(true);
    const { data, error: adjustError } = await supabase.rpc("adjust_inventory", {
      item_id: item.id, change, reason: fullReason,
    });
    setSaving(false);
    if (adjustError) return setError(adjustError.message);
    toast(`${itemName(item)}: ${change > 0 ? "+" : ""}${change}, now ${data} in stock.`);
    onSaved();
  }

  return (
    <Modal title={itemName(item)} onClose={onClose} narrow>
      <Message type="error">{error}</Message>
      <form onSubmit={submit}>
        <div className="segmented" role="group" aria-label="Stock in or out">
          <button type="button" className={mode === "in" ? "active" : ""}
            onClick={() => { setMode("in"); setReason(REASONS_IN[0]); }}>+ Stock in</button>
          <button type="button" className={mode === "out" ? "active" : ""}
            onClick={() => { setMode("out"); setReason(REASONS_OUT[0]); }}>− Stock out</button>
        </div>
        <p className="muted small">Currently in stock: <strong>{item.quantity}</strong></p>
        <div className="form-grid">
          <div className="field-group">
            <label htmlFor="adj-amount">How many</label>
            <input id="adj-amount" className="form-control" type="number" min="1" step="1" value={amount}
              onChange={(event) => setAmount(event.target.value)} autoFocus />
          </div>
          <div className="field-group">
            <label htmlFor="adj-reason">Reason</label>
            <select id="adj-reason" className="form-control" value={reason} onChange={(event) => setReason(event.target.value)}>
              {reasons.map((option) => <option key={option}>{option}</option>)}
            </select>
          </div>
          <div className="field-group wide">
            <label htmlFor="adj-note">Note (optional)</label>
            <input id="adj-note" className="form-control" value={note} onChange={(event) => setNote(event.target.value)}
              placeholder="e.g. invoice number, patient account ID" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="toolbar-button secondary-button" type="button" onClick={onClose}>Cancel</button>
          <button className="toolbar-button create-button" type="submit" disabled={saving}>
            {saving ? "Saving…" : mode === "in" ? "Add stock" : "Remove stock"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------- History ----------

function History({ item, onClose }) {
  const [rows, setRows] = useState(null);
  useEffect(() => {
    supabase
      .from("inventory_adjustments")
      .select("id, change, quantity_after, reason, adjusted_by, adjusted_at")
      .eq("item_id", item.id)
      .order("adjusted_at", { ascending: false })
      .limit(100)
      .then(({ data }) => setRows(data ?? []));
  }, [item.id]);

  return (
    <Modal title={`Stock history – ${itemName(item)}`} onClose={onClose}>
      {rows === null ? <Loading /> : rows.length === 0 ? (
        <p className="empty-note">No stock changes yet.</p>
      ) : (
        <ul className="history-list">
          {rows.map((row) => (
            <li key={row.id}>
              <span className={`history-change ${row.change > 0 ? "up" : "down"}`}>{row.change > 0 ? `+${row.change}` : row.change}</span>
              <span>
                {row.reason}
                <div className="muted small">{formatDate(row.adjusted_at)} · {row.adjusted_by ?? "—"}</div>
              </span>
              <span className="muted small">→ {row.quantity_after}</span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

// ---------- Page ----------

export default function Inventory() {
  usePageTitle("Inventory Tracking");
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [dialog, setDialog] = useState(null);
  const lowOnly = params.get("low") === "1";

  const load = useCallback(async () => {
    const { data, error: loadError } = await supabase
      .from("inventory_items")
      .select("*")
      .order("category")
      .order("brand")
      .order("model");
    if (loadError) setError(loadError.message);
    setItems(data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (items ?? []).filter((item) => {
      if (!showArchived && !item.active) return false;
      if (category && item.category !== category) return false;
      if (lowOnly && !(item.active && item.quantity <= item.low_stock_at)) return false;
      if (!term) return true;
      return [item.brand, item.model, item.sku, item.color, item.size, item.location]
        .some((value) => value && value.toLowerCase().includes(term));
    });
  }, [items, search, category, showArchived, lowOnly]);

  const active = (items ?? []).filter((item) => item.active);
  const totals = {
    items: active.length,
    units: active.reduce((sum, item) => sum + item.quantity, 0),
    low: active.filter((item) => item.quantity <= item.low_stock_at).length,
    value: active.reduce((sum, item) => sum + item.quantity * Number(item.price ?? 0), 0),
  };

  async function setArchived(item, archived) {
    const { error: archiveError } = await supabase.from("inventory_items").update({ active: !archived }).eq("id", item.id);
    if (archiveError) return toast(archiveError.message, "error");
    toast(archived ? `${itemName(item)} archived.` : `${itemName(item)} restored.`);
    load();
  }

  const close = () => setDialog(null);
  const saved = () => {
    setDialog(null);
    load();
  };

  return (
    <section className="users-page" aria-labelledby="inventory-heading">
      <div className="page-heading">
        <div>
          <h1 id="inventory-heading">Inventory Tracking</h1>
          <p className="page-subtitle">Frames, lenses and supplies in the store. Every stock change is logged.</p>
        </div>
        <button className="toolbar-button create-button" type="button" onClick={() => setDialog({ type: "item" })}>
          + Add item
        </button>
      </div>

      <Message type="error">{error}</Message>

      {items === null ? <Loading /> : (
        <>
          <div className="inventory-summary">
            <div className="stat-card"><span className="stat-label">Items</span><span className="stat-value">{totals.items}</span></div>
            <div className="stat-card"><span className="stat-label">Units in stock</span><span className="stat-value">{totals.units}</span></div>
            <button type="button" className={`stat-card ${totals.low > 0 ? "accent-red" : "accent-green"}`}
              style={{ textAlign: "left", cursor: "pointer", font: "inherit" }}
              onClick={() => setParams(lowOnly ? {} : { low: "1" })}>
              <span className="stat-label">Low or out of stock</span>
              <span className="stat-value">{totals.low}</span>
              <span className="stat-note">{lowOnly ? "Showing only these · click to show all" : "Click to show only these"}</span>
            </button>
            <div className="stat-card"><span className="stat-label">Retail value</span><span className="stat-value">{formatMoney(totals.value)}</span></div>
          </div>

          <div className="inventory-filters">
            <input type="search" className="form-control" placeholder="Search brand, model, SKU, color, location"
              aria-label="Search inventory" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="form-control" aria-label="Category" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {CATEGORIES.map((option) => <option key={option}>{option}</option>)}
            </select>
            <label className="inline-check">
              <input type="checkbox" checked={lowOnly} onChange={() => setParams(lowOnly ? {} : { low: "1" })} /> Low stock only
            </label>
            <label className="inline-check">
              <input type="checkbox" checked={showArchived} onChange={(event) => setShowArchived(event.target.checked)} /> Show archived
            </label>
          </div>

          <div className="users-table-wrapper">
            <table className="users-table inventory-table">
              <thead>
                <tr>
                  <th scope="col">Item</th>
                  <th scope="col">Category</th>
                  <th scope="col">Color / size</th>
                  <th scope="col">Price</th>
                  <th scope="col">Stock</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="actions-heading">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr key={item.id} className={item.active ? "" : "archived"}>
                    <td className="patient-cell">
                      <strong>{itemName(item)}</strong>
                      <span>{[item.sku && `SKU ${item.sku}`, item.location].filter(Boolean).join(" · ") || "—"}</span>
                    </td>
                    <td>{item.category}</td>
                    <td>{[item.color, item.size].filter(Boolean).join(" · ") || "—"}</td>
                    <td>{item.price === null ? "—" : formatMoney(Number(item.price))}</td>
                    <td>
                      <span className="qty-cell">
                        <button type="button" className="qty-button" aria-label={`Remove stock of ${itemName(item)}`}
                          disabled={!item.active || item.quantity === 0}
                          onClick={() => setDialog({ type: "adjust", item, direction: "out" })}>−</button>
                        <span className="qty-value">{item.quantity}</span>
                        <button type="button" className="qty-button" aria-label={`Add stock of ${itemName(item)}`}
                          disabled={!item.active}
                          onClick={() => setDialog({ type: "adjust", item, direction: "in" })}>+</button>
                      </span>
                    </td>
                    <td>{stockBadge(item)}</td>
                    <td className="row-actions">
                      <button type="button" className="table-action edit" onClick={() => setDialog({ type: "item", item })}>Edit</button>
                      <button type="button" className="table-action edit" onClick={() => setDialog({ type: "history", item })}>History</button>
                      {item.active ? (
                        <button type="button" className="table-action deactivate" onClick={() => setArchived(item, true)}>Archive</button>
                      ) : (
                        <button type="button" className="table-action activate" onClick={() => setArchived(item, false)}>Restore</button>
                      )}
                    </td>
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr>
                    <td className="empty-results" colSpan={7}>
                      {items.length === 0 ? "No items yet. Click “+ Add item” to start your inventory." : "No items match these filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {dialog?.type === "item" && <ItemForm item={dialog.item} onClose={close} onSaved={saved} />}
      {dialog?.type === "adjust" && <AdjustForm item={dialog.item} direction={dialog.direction} onClose={close} onSaved={saved} />}
      {dialog?.type === "history" && <History item={dialog.item} onClose={close} />}
    </section>
  );
}
