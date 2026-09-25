import { useState } from 'react';
import { IconPlus, IconSearch, IconTrash, IconUser } from './Icons';
import { useAthletes, NewAthleteInput } from '../contexts/Athletescontext';
import { useNavigate } from 'react-router-dom';
import DateInput from './DateInput'
import { resizeImageFile } from '../lib/imageUtils';

const LIME = '#c6f135';
const specLabels: Record<string, string> = {
  decathlon: 'Десятиборье',
  heptathlon: 'Семиборье',
  sprints: 'Спринт',
  jumps: 'Прыжки',
  throws: 'Метания',
  distance: 'Бег на средние/длинные',
};
const ageGroupLabels: Record<string, string> = {
  junior: 'Младшая',
  middle: 'Средняя',
  senior: 'Старшая',
};

export default function Athletes() {
  const { athletes, injuries, loading, addAthlete, deleteAthlete } = useAthletes();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterSpec, setFilterSpec] = useState<string>('all');
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState<NewAthleteInput & { nameShort: string }>({
    name: '',
    nameShort: '',
    birthDate: '',
    gender: 'M',
    grade: '',
    group: '',
    specialization: 'decathlon',
    ageGroup: 'middle',
    phone: '',
    parents: '',
    parentPhone: '',
    height: undefined,
    weight: undefined,
    armSpan: undefined,
    legLength: undefined,
    shoeSize: undefined,
    trainingStart: '',
    photoFile: null,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const filtered = athletes.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.nameShort.toLowerCase().includes(search.toLowerCase());
    const matchesSpec = filterSpec === 'all' || a.specialization === filterSpec;
    const matchesAgeGroup = filterAgeGroup === 'all' || a.ageGroup === filterAgeGroup;
    return matchesSearch && matchesSpec && matchesAgeGroup;
  });

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) {
      setForm({ ...form, photoFile: null, photoDataUrl: undefined });
      setPhotoPreview(null);
      return;
    }
    try {
      const resized = await resizeImageFile(file);
      setPhotoPreview(resized);
      setForm({ ...form, photoFile: file, photoDataUrl: resized });
    } catch {
      alert('Не удалось обработать фото');
    }
  };

  const handleSubmit = async () => {
    setFormError('');
    const input: NewAthleteInput = {
      name: form.name,
      nameShort: form.nameShort || undefined,
      birthDate: form.birthDate || undefined,
      gender: form.gender,
      grade: form.grade || undefined,
      group: form.group || undefined,
      specialization: form.specialization,
      ageGroup: form.ageGroup,
      phone: form.phone || undefined,
      parents: form.parents || undefined,
      parentPhone: form.parentPhone || undefined,
      height: form.height,
      weight: form.weight,
      armSpan: form.armSpan,
      legLength: form.legLength,
      shoeSize: form.shoeSize,
      trainingStart: form.trainingStart || undefined,
      photoFile: form.photoFile,
      photoDataUrl: form.photoDataUrl, // добавлено — раньше сжатое превью терялось
    };
    const { error } = await addAthlete(input);
    if (error) {
      setFormError(error);
    } else {
      setShowModal(false);
      setForm({
        name: '', nameShort: '', birthDate: '', gender: 'M', grade: '', group: '',
        specialization: 'decathlon', ageGroup: 'middle', phone: '', parents: '', parentPhone: '',
        height: undefined, weight: undefined, armSpan: undefined,
        legLength: undefined, shoeSize: undefined, trainingStart: '', photoFile: null,
      });
      setPhotoPreview(null);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 36, fontWeight: 800, color: '#f0f2f5', margin: 0 }}>
            СПОРТСМЕНЫ
          </h1>
          <p style={{ color: '#6b7280', fontSize: 13, margin: '4px 0 0' }}>
            {athletes.length} спортсменов
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 18px', background: LIME, border: 'none', borderRadius: 8,
          color: '#080a0f', fontSize: 13, fontWeight: 700,
          fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.06em',
          textTransform: 'uppercase', cursor: 'pointer',
        }}>
          <IconPlus /> Добавить
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <IconSearch />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени..."
            style={{ width: '100%', padding: '8px 12px 8px 32px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 8, color: '#f0f2f5' }}
          />
        </div>
        <select
          value={filterSpec}
          onChange={e => setFilterSpec(e.target.value)}
          style={{ padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 8, color: '#f0f2f5' }}
        >
          <option value="all">Все специализации</option>
          {Object.entries(specLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterAgeGroup}
          onChange={e => setFilterAgeGroup(e.target.value)}
          style={{ padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 8, color: '#f0f2f5' }}
        >
          <option value="all">Все возрастные группы</option>
          {Object.entries(ageGroupLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ color: '#6b7280' }}>Загрузка...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: '#6b7280', padding: '40px 0', textAlign: 'center' }}>
          {athletes.length === 0 ? 'Нет спортсменов. Добавьте первого.' : 'Ничего не найдено'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(a => (
            <div
              key={a.id}
              onClick={() => navigate(`/athlete/${a.id}`)}
              style={{
                background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12,
                padding: '20px', cursor: 'pointer', backdropFilter: 'blur(12px)',
                transition: 'transform 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(198,241,53,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e2230'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                {a.photo ? (
                  <img src={a.photo} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1e2230' }} />
                ) : (
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1e2230', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                    <IconUser />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f0f2f5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {a.nameShort || a.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {specLabels[a.specialization]} · {a.gender === 'M' ? 'М' : 'Ж'}{a.age ? ` · ${a.age} лет` : ''}
                  </div>
                </div>
              </div>

                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {a.grade && (
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(198,241,53,0.08)', color: LIME, fontWeight: 600 }}>
                    {a.grade}
                  </span>
                )}
                                {a.ageGroup && (
                  <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontWeight: 600 }}>
                    {ageGroupLabels[a.ageGroup]}
                  </span>
                )}
                
                {(() => {
                  const hasInjury = injuries.some(i => i.athleteId === a.id && i.status === 'active');
                  const displayStatus = a.status === 'injured' || hasInjury ? 'injured' : a.status;
                  return (
                    <span style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 4, fontWeight: 600,
                      background: displayStatus === 'active' ? 'rgba(198,241,53,0.08)' : displayStatus === 'injured' ? 'rgba(248,113,113,0.1)' : 'rgba(107,114,128,0.1)',
                      color: displayStatus === 'active' ? LIME : displayStatus === 'injured' ? '#f87171' : '#9ca3af',
                    }}>
                      {displayStatus === 'active' ? 'Активен' : displayStatus === 'injured' ? 'Травма' : 'Неактивен'}
                    </span>
                  );
                })()}
              </div>

              <button
                onClick={e => { e.stopPropagation(); deleteAthlete(a.id); }}
                style={{
                  marginTop: 12, width: '100%', padding: '6px', background: 'transparent',
                  border: '1px solid #1e2230', borderRadius: 6, color: '#6b7280',
                  fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <IconTrash /> Удалить
              </button>
            </div>
          ))}
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
            padding: '32px', maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, color: '#f0f2f5', margin: '0 0 20px' }}>
              Новый спортсмен
            </h2>

            {formError && (
              <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, color: '#f87171', fontSize: 13, marginBottom: 16 }}>
                {formError}
              </div>
            )}

            {/* Фото */}
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 8px', overflow: 'hidden', background: '#1e2230', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #2a3040' }}>
                {photoPreview ? (
                  <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#6b7280', fontSize: 24 }}>📷</span>
                )}
              </div>
              <label style={{ cursor: 'pointer', fontSize: 12, color: LIME, textDecoration: 'underline' }}>
                {photoPreview ? 'Изменить фото' : 'Загрузить фото'}
                <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>ФИО *</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Короткое имя</label>
                <input value={form.nameShort} onChange={e => setForm({ ...form, nameShort: e.target.value })} placeholder="И. Иванов" style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
              </div>
            </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Пол</label>
                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as 'M' | 'F' })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}>
                  <option value="M">Мужской</option>
                  <option value="F">Женский</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Дата рождения</label>
                <DateInput value={form.birthDate} onChange={v => setForm({ ...form, birthDate: v })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Специализация</label>
                <select value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value as any })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}>
                  {Object.entries(specLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Возрастная группа *</label>
                <select value={form.ageGroup} onChange={e => setForm({ ...form, ageGroup: e.target.value as any })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}>
                  {Object.entries(ageGroupLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Разряд</label>
                <input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} placeholder="КМС, 1-й разряд..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Группа</label>
                <input value={form.group} onChange={e => setForm({ ...form, group: e.target.value })} placeholder="Основная, юниоры..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
              </div>
            </div>

            {/* Контакты */}
            <div style={{ marginBottom: 12, padding: '12px', background: 'rgba(20,23,32,0.5)', borderRadius: 8, border: '1px solid #1e2230' }}>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Контакты</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Телефон спортсмена</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Телефон родителей</label>
                  <input value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} placeholder="+7..." style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Родители (ФИО)</label>
                  <input value={form.parents} onChange={e => setForm({ ...form, parents: e.target.value })} placeholder="Иванов Иван Иванович" style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
                </div>
              </div>
            </div>

            {/* Антропометрия */}
            <div style={{ marginBottom: 12, padding: '12px', background: 'rgba(20,23,32,0.5)', borderRadius: 8, border: '1px solid #1e2230' }}>
              <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Антропометрия</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {[
                  { label: 'Рост, см', key: 'height' as const },
                  { label: 'Вес, кг', key: 'weight' as const },
                  { label: 'Размах, см', key: 'armSpan' as const },
                  { label: 'Нога, см', key: 'legLength' as const },
                  { label: 'Обувь', key: 'shoeSize' as const },
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{field.label}</label>
                    <input
                      type="number"
                      value={form[field.key] ?? ''}
                      onChange={e => setForm({ ...form, [field.key]: e.target.value ? Number(e.target.value) : undefined })}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>С нами с</label>
                <DateInput value={form.trainingStart} onChange={v => setForm({ ...form, trainingStart: v })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #1e2230', borderRadius: 6, color: '#9ca3af', cursor: 'pointer' }}>
                Отмена
              </button>
              <button onClick={handleSubmit} style={{ padding: '8px 16px', background: '#c6f135', border: 'none', borderRadius: 6, color: '#080a0f', fontWeight: 600, cursor: 'pointer' }}>
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
