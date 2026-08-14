import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMaterialsList } from '../api/materials';
import { getPurchaseOrders } from '../api/purchaseOrders';
import { getVendorsList } from '../api/vendors';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ materials: [], pos: [], vendors: [] });
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ materials: [], pos: [], vendors: [] });
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      Promise.all([
        getMaterialsList({ search: query, page_size: 5 }),
        getPurchaseOrders({ search: query, page_size: 5 }),
        getVendorsList({ search: query, page_size: 5 })
      ])
        .then(([mats, pos, vends]) => {
          setResults({
            materials: mats.items || [],
            pos: pos.items || [],
            vendors: vends.items || []
          });
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-background/80 backdrop-blur-xs p-4">
      <div className="bg-surface border-2 border-outline-variant w-full max-w-2xl flex flex-col shadow-2xl">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
          <div className="flex items-center gap-3 w-full">
            <span className="material-symbols-outlined text-primary">search</span>
            <input
              type="text"
              autoFocus
              placeholder="Global Search (Materials, POs, Vendors)..."
              className="bg-transparent border-none text-on-surface font-data-lg w-full focus:outline-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 flex flex-col gap-4">
          {loading && (
            <div className="text-center font-data-sm text-on-surface-variant py-6">
              Querying SAP Backend...
            </div>
          )}

          {!loading && query && results.materials.length === 0 && results.pos.length === 0 && results.vendors.length === 0 && (
            <div className="text-center font-data-sm text-on-surface-variant py-6">
              No matching records found across SAP materials, POs, or vendors.
            </div>
          )}

          {/* Materials Section */}
          {results.materials.length > 0 && (
            <div>
              <div className="font-label text-label text-primary uppercase tracking-widest mb-2 border-b border-outline-variant/30 pb-1">
                Materials ({results.materials.length})
              </div>
              <div className="flex flex-col gap-1">
                {results.materials.map((m) => (
                  <div
                    key={m.material_id}
                    onClick={() => {
                      navigate(`/materials/${m.material_id}`);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-surface-container-highest cursor-pointer border border-outline-variant/30 flex justify-between items-center transition-colors"
                  >
                    <div>
                      <span className="font-data-lg text-primary mr-2 font-mono">{m.material_id}</span>
                      <span className="font-body-sm text-on-surface">{m.description}</span>
                    </div>
                    <span className="font-label text-[10px] text-on-surface-variant uppercase border border-outline-variant px-1.5 py-0.5">
                      {m.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Purchase Orders Section */}
          {results.pos.length > 0 && (
            <div>
              <div className="font-label text-label text-secondary uppercase tracking-widest mb-2 border-b border-outline-variant/30 pb-1">
                Purchase Orders ({results.pos.length})
              </div>
              <div className="flex flex-col gap-1">
                {results.pos.map((po) => (
                  <div
                    key={po.po_number}
                    onClick={() => {
                      navigate(`/purchase-orders`);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-surface-container-highest cursor-pointer border border-outline-variant/30 flex justify-between items-center transition-colors"
                  >
                    <div>
                      <span className="font-data-lg text-secondary mr-2 font-mono">{po.po_number}</span>
                      <span className="font-body-sm text-on-surface">{po.material_description}</span>
                    </div>
                    <span className="font-label text-[10px] text-outline uppercase border border-outline-variant px-1.5 py-0.5 font-mono">
                      {po.vendor_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vendors Section */}
          {results.vendors.length > 0 && (
            <div>
              <div className="font-label text-label text-tertiary uppercase tracking-widest mb-2 border-b border-outline-variant/30 pb-1">
                Vendors ({results.vendors.length})
              </div>
              <div className="flex flex-col gap-1">
                {results.vendors.map((v) => (
                  <div
                    key={v.vendor_id}
                    onClick={() => {
                      navigate(`/vendors`);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-surface-container-highest cursor-pointer border border-outline-variant/30 flex justify-between items-center transition-colors"
                  >
                    <div>
                      <span className="font-data-lg text-tertiary mr-2 font-mono">{v.vendor_id}</span>
                      <span className="font-body-sm text-on-surface">{v.name}</span>
                    </div>
                    <span className="font-label text-[10px] text-primary uppercase border border-outline-variant px-1.5 py-0.5 font-mono">
                      Rating: {v.rating}★
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
