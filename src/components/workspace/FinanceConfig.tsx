import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { formatShekel } from '../../utils/formatters';
import type { FinanceConfig as IFinanceConfig, AttractionService } from '../../types';

interface Props {
  config: IFinanceConfig;
  editable: boolean;
  onSave: (config: IFinanceConfig) => Promise<void>;
}

export default function FinanceConfig({ config, editable, onSave }: Props) {
  const [dishPrice, setDishPrice] = useState(config.dishPrice);
  const [attractions, setAttractions] = useState<AttractionService[]>(config.attractions);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setDishPrice(config.dishPrice);
    setAttractions(config.attractions);
    setDirty(false);
  }, [config]);

  function addAttraction() {
    const newItem: AttractionService = { id: `${Date.now()}`, name: '', price: 0 };
    setAttractions((prev) => [...prev, newItem]);
    setDirty(true);
  }

  function updateAttraction(id: string, key: keyof Omit<AttractionService, 'id'>, value: string | number) {
    setAttractions((prev) => prev.map((a) => a.id === id ? { ...a, [key]: value } : a));
    setDirty(true);
  }

  function removeAttraction(id: string) {
    setAttractions((prev) => prev.filter((a) => a.id !== id));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    await onSave({ dishPrice, attractions });
    setSaving(false);
    setDirty(false);
  }

  const attractionTotal = attractions.reduce((s, a) => s + (a.price ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">מחיר מנה (למבוגר)</h3>
        <div className="flex items-center gap-3">
          <span className="text-lg text-gray-500">₪</span>
          {editable ? (
            <input
              type="number"
              min={0}
              value={dishPrice}
              onChange={(e) => { setDishPrice(parseFloat(e.target.value) || 0); setDirty(true); }}
              className="border rounded-lg px-3 py-2 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              dir="ltr"
            />
          ) : (
            <span className="text-xl font-bold text-gray-800">{formatShekel(dishPrice)}</span>
          )}
          <span className="text-sm text-gray-400">לאורח</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-700">שירותי אטרקציה / ספקים</h3>
          {editable && (
            <button
              onClick={addAttraction}
              className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              <Plus size={15} />
              הוסף ספק
            </button>
          )}
        </div>

        {attractions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">אין ספקים רשומים</p>
        ) : (
          <div className="space-y-3">
            {attractions.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                {editable ? (
                  <>
                    <input
                      type="text"
                      value={a.name}
                      onChange={(e) => updateAttraction(a.id, 'name', e.target.value)}
                      placeholder="שם הספק (DJ, צלמים...)"
                      className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">₪</span>
                      <input
                        type="number"
                        min={0}
                        value={a.price}
                        onChange={(e) => updateAttraction(a.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-28 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        dir="ltr"
                      />
                    </div>
                    <button onClick={() => removeAttraction(a.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-gray-700">{a.name}</span>
                    <span className="text-sm font-medium text-gray-800">{formatShekel(a.price)}</span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {attractions.length > 0 && (
          <div className="mt-4 pt-4 border-t flex justify-between text-sm font-semibold text-gray-700">
            <span>סה"כ ספקים</span>
            <span>{formatShekel(attractionTotal)}</span>
          </div>
        )}
      </div>

      {editable && dirty && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium px-5 py-2.5 rounded-xl transition-colors"
        >
          <Save size={15} />
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>
      )}
    </div>
  );
}
