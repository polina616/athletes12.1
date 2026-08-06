import { IconPlus, IconTrash } from './Icons';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Discipline {
  id: string;
  name: string;
  unit: string;
  category?: string;
  is_default?: boolean;
}

export default function Disciplines() {
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const fetchDisciplines = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('disciplines')
      .select('*')
      .order('name');
    if (error) {
      console.error(error);
    } else {
      setDisciplines(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  const addDiscipline = async () => {
    if (!newName.trim() || !newUnit.trim()) return;
    const { error } = await supabase
      .from('disciplines')
      .insert({
        name: newName.trim(),
        unit: newUnit.trim(),
        category: newCategory.trim() || null,
        is_default: false,
      });
    if (error) {
      alert('Ошибка добавления: ' + error.message);
    } else {
      setNewName('');
      setNewUnit('');
      setNewCategory('');
      setShowModal(false);
      fetchDisciplines();
    }
  };

  const deleteDiscipline = async (id: string) => {
    if (!confirm('Удалить дисциплину?')) return;
    const { error } = await supabase
      .from('disciplines')
      .delete()
      .eq('id', id);
    if (error) {
      alert('Ошибка удаления: ' + error.message);
    } else {
      fetchDisciplines();
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: 0 }}>
            ДИСЦИПЛИНЫ
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            Управляйте списком дисциплин для тестирований
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px',
            background: '#c6f135',
            border: 'none',
            borderRadius: 8,
            color: '#080a0f',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          <IconPlus /> Добавить
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#6b7280' }}>Загрузка...</div>
      ) : (
        <div style={{
          background: 'rgba(15,17,23,0.8)',
          border: '1px solid #1e2230',
          borderRadius: 12,
          overflow: 'hidden',
          backdropFilter: 'blur(12px)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2230' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Название</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Единица</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Категория</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', color: '#6b7280', fontWeight: 500, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {disciplines.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: i < disciplines.length - 1 ? '1px solid rgba(30,34,48,0.5)' : 'none' }}>
                  <td style={{ padding: '12px 16px', color: '#f0f2f5', fontWeight: 500 }}>
                    {d.name}
                    {d.is_default && <span style={{ marginLeft: 8, fontSize: 10, color: '#6b7280', background: '#1e2230', padding: '2px 6px', borderRadius: 4 }}>по умолч.</span>}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{d.unit}</td>
                  <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{d.category || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {!d.is_default && (
                      <button
                        onClick={() => deleteDiscipline(d.id)}
                        style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}
                      >
                        <IconTrash />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {disciplines.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                    Нет дисциплин. Добавьте первую.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Модалка добавления */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)',
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#141720', border: '1px solid #1e2230', borderRadius: 16,
            padding: '32px', maxWidth: 420, width: '100%',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, color: '#f0f2f5', margin: '0 0 16px' }}>
              Новая дисциплина
            </h2>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Название *</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Единица измерения *</label>
              <input
                value={newUnit}
                onChange={e => setNewUnit(e.target.value)}
                placeholder="сек, м, очки, раз..."
                style={{ width: '100%', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Категория (опционально)</label>
              <input
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="бег, прыжки, метания..."
                style={{ width: '100%', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #1e2230', borderRadius: 6, color: '#9ca3af', cursor: 'pointer' }}>
                Отмена
              </button>
              <button onClick={addDiscipline} style={{ padding: '8px 16px', background: '#c6f135', border: 'none', borderRadius: 6, color: '#080a0f', fontWeight: 600, cursor: 'pointer' }}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}