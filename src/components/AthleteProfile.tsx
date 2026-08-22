import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAthletes, Injury } from '../contexts/Athletescontext';
import { calcDecathlonPoints, decathlonEvents, heptathlonEvents } from '../data/mockData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { IconArrowLeft, IconUser } from './Icons';

const LIME = '#c6f135';

export default function AthleteProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { athletes, results, injuries, updateAthlete, addInjury, updateInjury, deleteInjury } = useAthletes();
  const [tab, setTab] = useState<'results' | 'decathlon' | 'chart' | 'injuries'>('results');
  const [showEdit, setShowEdit] = useState(false);

  const athlete = athletes.find(a => a.id === id);
  if (!athlete) return <div style={{ color: '#6b7280', padding: 40 }}>Спортсмен не найден</div>;

  const athleteResults = results.filter(r => r.athleteId === id);
  const athleteInjuries = injuries.filter((i: Injury) => i.athleteId === id);

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2230' }}>
      <span style={{ color: '#6b7280', fontSize: 12 }}>{label}</span>
      <span style={{ color: '#f0f2f5', fontSize: 12, fontWeight: 500 }}>{value || '—'}</span>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
        <IconArrowLeft /> Назад
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Left card */}
        <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '24px', backdropFilter: 'blur(12px)', height: 'fit-content' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            {athlete.photo ? (
              <img src={athlete.photo} alt="" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(198,241,53,0.3)' }} />
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#1e2230', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#6b7280' }}>
                <IconUser />
              </div>
            )}
          </div>

          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, color: '#f0f2f5', textAlign: 'center', marginBottom: 2 }}>
            {athlete.nameShort || athlete.name}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
            {athlete.specialization === 'decathlon' ? 'Десятиборье' : athlete.specialization === 'heptathlon' ? 'Семиборье' : athlete.specialization} · {athlete.gender === 'M' ? 'М' : 'Ж'}
          </div>

                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
            {(() => {
              const hasInjury = athleteInjuries.some((i: Injury) => i.status === 'active');
              const displayStatus = athlete.status === 'injured' || hasInjury ? 'injured' : athlete.status;
              return (
                <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: displayStatus === 'active' ? 'rgba(198,241,53,0.08)' : 'rgba(248,113,113,0.1)', color: displayStatus === 'active' ? LIME : '#f87171', fontWeight: 600 }}>
                  {displayStatus === 'active' ? 'Активен' : displayStatus === 'injured' ? 'Травма' : 'Неактивен'}
                </span>
              );
            })()}
            {athlete.grade && (
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'rgba(96,165,250,0.1)', color: '#60a5fa', fontWeight: 600 }}>
                {athlete.grade}
              </span>
            )}
          </div>

          <button
            onClick={() => setShowEdit(true)}
            style={{
              width: '100%', padding: '8px', background: 'rgba(198,241,53,0.08)',
              border: '1px solid rgba(198,241,53,0.2)', borderRadius: 6,
              color: LIME, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 16,
            }}
          >
            ✎ Редактировать
          </button>

          <InfoRow label="Дата рождения" value={athlete.birthDate} />
          <InfoRow label="Возраст" value={athlete.age !== null ? `${athlete.age} лет` : ''} />
          <InfoRow label="Телефон" value={athlete.phone} />
          <InfoRow label="Родители" value={athlete.parents} />
          <InfoRow label="Тел. родителей" value={athlete.parentPhone} />
          <InfoRow label="Группа" value={athlete.group} />
          <InfoRow label="С нами" value={athlete.trainingStart} />

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1e2230' }}>
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Антропометрия</div>
            <InfoRow label="Рост" value={athlete.height ? `${athlete.height} см` : ''} />
            <InfoRow label="Вес" value={athlete.weight ? `${athlete.weight} кг` : ''} />
            <InfoRow label="Размах рук" value={athlete.armSpan ? `${athlete.armSpan} см` : ''} />
            <InfoRow label="Длина ноги" value={athlete.legLength ? `${athlete.legLength} см` : ''} />
            <InfoRow label="Размер обуви" value={athlete.shoeSize ? String(athlete.shoeSize) : ''} />
          </div>

          {athleteInjuries.filter(i => i.status === 'active').length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #1e2230' }}>
              <div style={{ fontSize: 11, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Активные травмы</div>
              {athleteInjuries.filter(i => i.status === 'active').map(i => (
                <div key={i.id} style={{ fontSize: 12, color: '#f87171', marginBottom: 4 }}>
                  • {i.name} ({i.dateInjured})
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right content */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'results', label: 'Результаты' },
              { key: 'decathlon', label: athlete.gender === 'F' ? 'Семиборье' : 'Десятиборье' },
              { key: 'chart', label: 'График' },
              { key: 'injuries', label: `Травмы (${athleteInjuries.filter(i => i.status === 'active').length})` },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                style={{
                  padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: tab === t.key ? 'rgba(198,241,53,0.12)' : 'rgba(20,23,32,0.6)',
                  color: tab === t.key ? LIME : '#9ca3af',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ background: 'rgba(15,17,23,0.8)', border: '1px solid #1e2230', borderRadius: 12, padding: '20px', backdropFilter: 'blur(12px)' }}>
            {tab === 'results' && <ResultsTab results={athleteResults} />}
            {tab === 'decathlon' && <DecathlonTab athlete={athlete} results={athleteResults} />}
            {tab === 'chart' && <ChartTab results={athleteResults} />}
            {tab === 'injuries' && <InjuriesTab athleteId={athlete.id} />}
          </div>
        </div>
      </div>

      {showEdit && <EditModal athlete={athlete} onClose={() => setShowEdit(false)} onSave={() => setShowEdit(false)} />}
    </div>
  );
}

/* ========== Edit Modal ========== */
function EditModal({ athlete, onClose, onSave }: { athlete: any; onClose: () => void; onSave: () => void }) {
  const { updateAthlete } = useAthletes();
  const [formError, setFormError] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(athlete.photo || null);

  const [form, setForm] = useState({
    name: athlete.name,
    nameShort: athlete.nameShort,
    birthDate: athlete.birthDate,
    gender: athlete.gender,
    grade: athlete.grade,
    group: athlete.group,
    specialization: athlete.specialization,
    phone: athlete.phone,
    parents: athlete.parents,
    parentPhone: athlete.parentPhone,
    height: athlete.height ?? '',
    weight: athlete.weight ?? '',
    armSpan: athlete.armSpan ?? '',
    legLength: athlete.legLength ?? '',
    shoeSize: athlete.shoeSize ?? '',
    trainingStart: athlete.trainingStart,
    status: athlete.status,
    photoFile: null as File | null,
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm({ ...form, photoFile: file });
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setFormError('');
    const { error } = await updateAthlete(athlete.id, {
      name: form.name,
      nameShort: form.nameShort,
      birthDate: form.birthDate || undefined,
      gender: form.gender,
      grade: form.grade || undefined,
      group: form.group || undefined,
      specialization: form.specialization,
      phone: form.phone || undefined,
      parents: form.parents || undefined,
      parentPhone: form.parentPhone || undefined,
      height: form.height ? Number(form.height) : undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      armSpan: form.armSpan ? Number(form.armSpan) : undefined,
      legLength: form.legLength ? Number(form.legLength) : undefined,
      shoeSize: form.shoeSize ? Number(form.shoeSize) : undefined,
      trainingStart: form.trainingStart || undefined,
      photoFile: form.photoFile || undefined,
    });
    if (error) {
      setFormError(error);
    } else {
      onSave();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, backdropFilter: 'blur(4px)',
    }} onClick={onClose}>
      <div style={{
        background: '#141720', border: '1px solid #1e2230', borderRadius: 16,
        padding: '32px', maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 24, fontWeight: 700, color: '#f0f2f5', margin: '0 0 20px' }}>
          Редактировать спортсмена
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
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>ФИО</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Короткое имя</label>
            <input value={form.nameShort} onChange={e => setForm({ ...form, nameShort: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Пол</label>
            <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value as 'M' | 'F' })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}>
              <option value="M">Мужской</option>
              <option value="F">Женский</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Дата рождения</label>
            <input type="date" value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Статус</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}>
              <option value="active">Активен</option>
              <option value="injured">Травма</option>
              <option value="inactive">Неактивен</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Разряд</label>
            <input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Группа</label>
            <input value={form.group} onChange={e => setForm({ ...form, group: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
          </div>
        </div>

        {/* Контакты */}
        <div style={{ marginBottom: 12, padding: '12px', background: 'rgba(20,23,32,0.5)', borderRadius: 8, border: '1px solid #1e2230' }}>
          <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Контакты</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Телефон спортсмена</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Телефон родителей</label>
              <input value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>Родители (ФИО)</label>
              <input value={form.parents} onChange={e => setForm({ ...form, parents: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
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
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>С нами с</label>
          <input type="date" value={form.trainingStart} onChange={e => setForm({ ...form, trainingStart: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5' }} />
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #1e2230', borderRadius: 6, color: '#9ca3af', cursor: 'pointer' }}>
            Отмена
          </button>
          <button onClick={handleSubmit} style={{ padding: '8px 16px', background: '#c6f135', border: 'none', borderRadius: 6, color: '#080a0f', fontWeight: 600, cursor: 'pointer' }}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== Tabs ========== */
function ResultsTab({ results }: { results: any[] }) {
  if (results.length === 0) return <EmptyState text="Нет результатов" />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {results.map(r => (
        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(20,23,32,0.5)', borderRadius: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f2f5' }}>{r.discipline}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{r.date} · {r.location}</div>
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 700, color: LIME }}>
            {r.result} <span style={{ fontSize: 11, color: '#6b7280' }}>{r.unit}</span>
          </div>
          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: r.type === 'competition' ? 'rgba(167,139,250,0.15)' : 'rgba(96,165,250,0.1)', color: r.type === 'competition' ? '#a78bfa' : '#60a5fa', textTransform: 'uppercase', fontWeight: 600 }}>
            {r.type === 'competition' ? 'Старт' : 'Тест'}
          </span>
        </div>
      ))}
    </div>
  );
}

function DecathlonTab({ athlete, results }: { athlete: any; results: any[] }) {
  const events = athlete.gender === 'F' ? heptathlonEvents : decathlonEvents;
  const best: Record<string, { val: number; pts: number }> = {};

  results.forEach(r => {
    const ev = events.find(e => e.name === r.discipline || e.id === r.discipline);
    if (!ev) return;
    const pts = calcDecathlonPoints(ev, r.resultValue);
    if (!best[r.discipline] || pts > best[r.discipline].pts) {
      best[r.discipline] = { val: r.resultValue, pts };
    }
  });

  const total = Object.values(best).reduce((s, b) => s + b.pts, 0);
  const entries = Object.entries(best).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.pts - a.pts);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 800, color: '#f0f2f5' }}>
          {total.toLocaleString('ru')} <span style={{ fontSize: 14, color: '#6b7280' }}>очков</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {entries.map((e, i) => (
          <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(20,23,32,0.5)', borderRadius: 8 }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6b7280', width: 24 }}>#{i + 1}</span>
            <div style={{ flex: 1, fontSize: 13, color: '#f0f2f5' }}>{e.name}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, color: LIME }}>{e.val}</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#9ca3af', width: 50, textAlign: 'right' }}>{e.pts} pts</div>
          </div>
        ))}
        {entries.length === 0 && <EmptyState text="Нет данных для расчёта" />}
      </div>
    </div>
  );
}

function ChartTab({ results }: { results: any[] }) {
  if (results.length < 2) return <EmptyState text="Недостаточно данных для графика" />;
  const data = results.map(r => ({ date: r.date.slice(5), value: r.resultValue }));
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#141720', border: '1px solid #1e2230', borderRadius: 8, color: '#f0f2f5' }} />
        <Line type="monotone" dataKey="value" stroke={LIME} strokeWidth={2} dot={{ fill: LIME, r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ========== Injuries Tab ========== */
function InjuriesTab({ athleteId }: { athleteId: string }) {
  const { injuries, addInjury, updateInjury, deleteInjury } = useAthletes();
  const [showAdd, setShowAdd] = useState(false);

  const athleteInjuries = injuries.filter(i => i.athleteId === athleteId);

  const [form, setForm] = useState({
    name: '',
    dateInjured: '',
    dateHealed: '',
    description: '',
  });

  const handleAdd = async () => {
    if (!form.name.trim() || !form.dateInjured) return;
    const { error } = await addInjury(athleteId, {
      name: form.name,
      dateInjured: form.dateInjured,
      dateHealed: form.dateHealed || undefined,
      description: form.description,
    });
    if (!error) {
      setShowAdd(false);
      setForm({ name: '', dateInjured: '', dateHealed: '', description: '' });
    }
  };

  const handleHeal = async (id: string) => {
    const today = new Date().toISOString().slice(0, 10);
    await updateInjury(id, { status: 'healed', dateHealed: today });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          {athleteInjuries.filter(i => i.status === 'active').length} активных · {athleteInjuries.filter(i => i.status === 'healed').length} перенесённых
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            padding: '6px 14px', background: 'rgba(198,241,53,0.08)',
            border: '1px solid rgba(198,241,53,0.2)', borderRadius: 6,
            color: LIME, fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          + Добавить травму
        </button>
      </div>

      {showAdd && (
        <div style={{
          padding: '16px', background: 'rgba(20,23,32,0.6)', borderRadius: 10,
          border: '1px solid #1e2230', marginBottom: 16,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Название травмы *</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Растяжение связок" style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5', fontSize: 12 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Дата получения *</label>
              <input type="date" value={form.dateInjured} onChange={e => setForm({ ...form, dateInjured: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5', fontSize: 12 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Дата излечения</label>
              <input type="date" value={form.dateHealed} onChange={e => setForm({ ...form, dateHealed: e.target.value })} style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5', fontSize: 12 }} />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>Описание / лечение</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Описание травмы, назначенное лечение..." rows={2} style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: '#0f1117', border: '1px solid #1e2230', borderRadius: 6, color: '#f0f2f5', fontSize: 12, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #1e2230', borderRadius: 6, color: '#9ca3af', cursor: 'pointer', fontSize: 12 }}>Отмена</button>
            <button onClick={handleAdd} style={{ padding: '6px 12px', background: '#c6f135', border: 'none', borderRadius: 6, color: '#080a0f', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Добавить</button>
          </div>
        </div>
      )}

      {athleteInjuries.length === 0 ? (
        <EmptyState text="Травм не зафиксировано" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {athleteInjuries.map(injury => (
            <div key={injury.id} style={{
              padding: '12px 14px', background: 'rgba(20,23,32,0.5)', borderRadius: 8,
              border: `1px solid ${injury.status === 'active' ? 'rgba(248,113,113,0.2)' : '#1e2230'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: injury.status === 'active' ? '#f87171' : '#9ca3af' }}>
                      {injury.name}
                    </span>
                    <span style={{
                      fontSize: 9, padding: '2px 6px', borderRadius: 3, fontWeight: 600,
                      background: injury.status === 'active' ? 'rgba(248,113,113,0.12)' : 'rgba(107,114,128,0.12)',
                      color: injury.status === 'active' ? '#f87171' : '#6b7280',
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {injury.status === 'active' ? 'Активная' : 'Перенесённая'}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                    Получена: {injury.dateInjured}
                    {injury.dateHealed && ` · Излечена: ${injury.dateHealed}`}
                  </div>
                  {injury.description && (
                    <div style={{ fontSize: 12, color: '#9ca3af', fontStyle: 'italic' }}>
                      {injury.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {injury.status === 'active' && (
                    <button
                      onClick={() => handleHeal(injury.id)}
                      style={{
                        padding: '4px 10px', background: 'rgba(198,241,53,0.08)',
                        border: '1px solid rgba(198,241,53,0.2)', borderRadius: 5,
                        color: LIME, fontSize: 11, cursor: 'pointer', fontWeight: 600,
                      }}
                    >
                      Вылечена
                    </button>
                  )}
                  <button
                    onClick={() => deleteInjury(injury.id)}
                    style={{
                      padding: '4px 10px', background: 'transparent',
                      border: '1px solid #1e2230', borderRadius: 5,
                      color: '#6b7280', fontSize: 11, cursor: 'pointer',
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ textAlign: 'center', padding: '40px 0', color: '#4b5563', fontSize: 13 }}>{text}</div>;
}