import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { disciplineMeta } from '../lib/controlEventUtils'; 
export interface Athlete {
  id: string;
  name: string;
  nameShort: string;
  birthDate: string;
  age: number | null;
  gender: 'M' | 'F';
  height: number | null;
  weight: number | null;
  armSpan: number | null;
  legLength: number | null;
  shoeSize: number | null;
  phone: string;
  parents: string;
  parentPhone: string;
  medicalNotes: string;
  allergies: string;
  grade: string;
  group: string;
  trainingStart: string;
  favoriteEvent: string;
  goals: string;
  coachComment: string;
  status: 'active' | 'injured' | 'inactive';
  photo: string;
  specialization: 'decathlon' | 'heptathlon' | 'sprints' | 'jumps' | 'throws' | 'distance';
  ageGroup: 'junior' | 'middle' | 'senior' | null;
   createdAt: string; 
}

export interface Result {
  id: string;
  athleteId: string;
  date: string;
  disciplineId: string;
  discipline: string;   // имя дисциплины, подтягивается через join с disciplines
  result: string;       // = result_display в БД
  resultValue: number;
  unit: string;         // подтягивается через join с disciplines
  location: string;
  type: 'training' | 'test';
  wind?: number;
  comment?: string;
  controlEventId?: string;
}

// Отдельный тип для вставки — не путать с Result (там id/discipline вычисляются)
export interface NewResultInput {
  athleteId: string;
  date: string;
  discipline: string;    // имя дисциплины (строка)
  result: string;
  resultValue: number;
  location?: string;
  type: 'training' | 'test';
  wind?: number;
  comment?: string;
  controlEventId?: string;
}

export interface Injury {
  id: string;
  athleteId: string;
  name: string;
  dateInjured: string;
  dateHealed: string | null;
  description: string;
  status: 'active' | 'healed';
}

export interface NewAthleteInput {
  name: string;
  nameShort?: string;
  birthDate?: string;
  gender: 'M' | 'F';
  grade?: string;
  group?: string;
  specialization: Athlete['specialization'];
  ageGroup?: 'junior' | 'middle' | 'senior';
  phone?: string;
  parents?: string;
  parentPhone?: string;
  height?: number;
  weight?: number;
  armSpan?: number;
  legLength?: number;
  shoeSize?: number;
  trainingStart?: string;
  photoFile?: File | null;
}

interface AthletesContextType {
  athletes: Athlete[];
  results: Result[];
  injuries: Injury[];
  loading: boolean;
  refresh: () => Promise<void>;
  addAthlete: (input: NewAthleteInput) => Promise<{ error: string | null }>;
  updateAthlete: (id: string, input: Partial<NewAthleteInput>) => Promise<{ error: string | null }>;
  deleteAthlete: (id: string) => Promise<{ error: string | null }>;
  addInjury: (athleteId: string, data: { name: string; dateInjured: string; dateHealed?: string; description?: string }) => Promise<{ error: string | null }>;
  updateInjury: (id: string, data: Partial<{ name: string; dateInjured: string; dateHealed: string; description: string; status: 'active' | 'healed' }>) => Promise<{ error: string | null }>;
  deleteInjury: (id: string) => Promise<{ error: string | null }>;
  addResult: (input: NewResultInput) => Promise<{ error: string | null }>;
  deleteResult: (id: string) => Promise<{ error: string | null }>;
}

const AthletesContext = createContext<AthletesContextType | undefined>(undefined);

/**
 * Переводит частые технические ошибки Supabase/сети в понятные пользователю сообщения.
 * Используется во всех местах, где мы показываем error.message напрямую.
 */
export function getFriendlySupabaseError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  if (message.includes('Load failed') || message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Не удалось подключиться к серверу. Проверьте интернет-соединение и повторите попытку.';
  }
  if (message.includes('duplicate key') || message.includes('already exists')) {
    return 'Такая запись уже существует.';
  }
  if (message.includes('violates foreign key constraint')) {
    return 'Невозможно выполнить действие: есть связанные данные (результаты, травмы и т.п.).';
  }
  if (message.includes('violates row-level security') || message.includes('RLS')) {
    return 'Недостаточно прав для этого действия.';
  }
  if (message.includes('JWT') || message.includes('expired')) {
    return 'Сессия истекла. Пожалуйста, войдите заново.';
  }
  return message;
}

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  if (isNaN(b.getTime())) return null;
  const diffMs = Date.now() - b.getTime();
  return Math.floor(diffMs / (365.25 * 24 * 3600 * 1000));
}

function generateShortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const lastName = parts[0];
  const firstInitial = parts[1]?.[0] || '';
  const middleInitial = parts[2]?.[0] || '';
  if (middleInitial) return `${firstInitial}.${middleInitial}. ${lastName}`;
  return `${firstInitial}. ${lastName}`;
}

function rowToAthlete(row: any): Athlete {
  return {
    id: row.id,
    name: row.name,
    nameShort: row.name_short || row.name,
    birthDate: row.birth_date || '',
    age: calcAge(row.birth_date),
    gender: row.gender || 'M',
    height: row.height,
    weight: row.weight,
    armSpan: row.arm_span,
    legLength: row.leg_length,
    shoeSize: row.shoe_size,
    phone: row.phone || '',
    parents: row.parents || '',
    parentPhone: row.parent_phone || '',
    medicalNotes: row.medical_notes || '',
    allergies: row.allergies || '',
    grade: row.grade || '',
    group: row.training_group || '',
    trainingStart: row.training_start || '',
    favoriteEvent: row.favorite_event || '',
    goals: row.goals || '',
    coachComment: row.coach_comment || '',
    status: row.status || 'active',
    photo: row.photo_url || '',
    specialization: row.specialization || 'decathlon',
    ageGroup: row.age_group || null,
    createdAt: row.created_at || '', 
  };
}

function rowToResult(row: any): Result {
  return {
    id: row.id,
    athleteId: row.athlete_id,
    date: row.date,
    disciplineId: row.discipline_id,
    discipline: row.disciplines?.name || '—',
    result: row.result_display,
    resultValue: Number(row.result_value),
    unit: row.disciplines?.unit || '',
    location: row.location || '',
    type: row.type,
    wind: row.wind ?? undefined,
    comment: row.comment ?? undefined,
    controlEventId: row.control_event_id ?? undefined,
  };
}

export const AthletesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { coachProfile, user } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [loading, setLoading] = useState(true);

    const refresh = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (!coachProfile) {
      setAthletes([]);
      setResults([]);
      setInjuries([]);
      setLoading(false);
      return;
    }
    if (!opts.silent) setLoading(true);

    const { data: athleteRows, error: athleteError } = await supabase
      .from('athletes')
      .select('*')
      .eq('coach_id', coachProfile.id)
      .order('created_at', { ascending: true });

    if (athleteError) {
      console.error('Ошибка загрузки спортсменов:', getFriendlySupabaseError(athleteError));
      setAthletes([]);
      setResults([]);
      setInjuries([]);
      setLoading(false);
      return;
    }

    const loadedAthletes = (athleteRows || []).map(rowToAthlete);
    setAthletes(loadedAthletes);

    const athleteIds = loadedAthletes.map(a => a.id);
    if (athleteIds.length === 0) {
      setResults([]);
      setInjuries([]);
      setLoading(false);
      return;
    }

    // Результаты и травмы теперь запрашиваются параллельно, а не по очереди.
    const [resultsRes, injuriesRes] = await Promise.all([
      supabase
        .from('results')
        .select('*, disciplines(name, unit)')
        .in('athlete_id', athleteIds)
        .order('date', { ascending: true }),
      supabase
        .from('injuries')
        .select('*')
        .in('athlete_id', athleteIds)
        .order('date_injured', { ascending: false }),
    ]);

    if (resultsRes.error) {
      console.error('Ошибка загрузки результатов:', getFriendlySupabaseError(resultsRes.error));
      setResults([]);
    } else {
      setResults((resultsRes.data || []).map(rowToResult));
    }

    if (injuriesRes.error) {
      console.error('Ошибка загрузки травм:', getFriendlySupabaseError(injuriesRes.error));
      setInjuries([]);
    } else {
      setInjuries((injuriesRes.data || []).map((row: any) => ({
        id: row.id,
        athleteId: row.athlete_id,
        name: row.name,
        dateInjured: row.date_injured,
        dateHealed: row.date_healed,
        description: row.description || '',
        status: row.status || 'active',
      })));
    }

    setLoading(false);
  }, [coachProfile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addAthlete = async (input: NewAthleteInput) => {
    if (!coachProfile?.id) return { error: 'Нет профиля тренера. Перезайдите в аккаунт.' };
    if (!input.name.trim()) return { error: 'Укажите имя спортсмена' };

    const { data: existing } = await supabase
      .from('athletes')
      .select('id')
      .eq('coach_id', coachProfile.id)
      .ilike('name', input.name.trim())
      .maybeSingle();

    if (existing) {
      return { error: 'Спортсмен с таким именем уже существует' };
    }

        let photoUrl = '';
    if ((input as any).photoDataUrl) {
      photoUrl = (input as any).photoDataUrl;
    } else if (input.photoFile) {
      photoUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(input.photoFile!);
      });
    }

    const { error } = await supabase.from('athletes').insert({
      coach_id: coachProfile.id,
      name: input.name.trim(),
      name_short: input.nameShort?.trim() || generateShortName(input.name),
      birth_date: input.birthDate || null,
      gender: input.gender,
      grade: input.grade || null,
      training_group: input.group || null,
      specialization: input.specialization,
      age_group: input.ageGroup || null,
      status: 'active',
      phone: input.phone || null,
      parents: input.parents || null,
      parent_phone: input.parentPhone || null,
      height: input.height || null,
      weight: input.weight || null,
      arm_span: input.armSpan || null,
      leg_length: input.legLength || null,
      shoe_size: input.shoeSize || null,
      training_start: input.trainingStart || null,
      photo_url: photoUrl || null,
    });
    if (error) {
      console.error('Ошибка добавления спортсмена:', error);
      return { error: getFriendlySupabaseError(error) };
    }
        await refresh({ silent: true });
    return { error: null };
  };

  const updateAthlete = async (id: string, input: Partial<NewAthleteInput>) => {
    if (!coachProfile?.id) return { error: 'Нет профиля тренера' };

        let photoUrl = '';
    if ((input as any).photoDataUrl) {
      photoUrl = (input as any).photoDataUrl;
    } else if (input.photoFile) {
      photoUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(input.photoFile!);
      });
    }

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name.trim();
    if (input.nameShort !== undefined) updateData.name_short = input.nameShort?.trim() || generateShortName(input.name || '');
    if (input.birthDate !== undefined) updateData.birth_date = input.birthDate || null;
    if (input.gender !== undefined) updateData.gender = input.gender;
    if (input.grade !== undefined) updateData.grade = input.grade || null;
    if (input.group !== undefined) updateData.training_group = input.group || null;
    if (input.specialization !== undefined) updateData.specialization = input.specialization;
    if (input.ageGroup !== undefined) updateData.age_group = input.ageGroup || null;
    if (input.phone !== undefined) updateData.phone = input.phone || null;
    if (input.parents !== undefined) updateData.parents = input.parents || null;
    if (input.parentPhone !== undefined) updateData.parent_phone = input.parentPhone || null;
    if (input.height !== undefined) updateData.height = input.height || null;
    if (input.weight !== undefined) updateData.weight = input.weight || null;
    if (input.armSpan !== undefined) updateData.arm_span = input.armSpan || null;
    if (input.legLength !== undefined) updateData.leg_length = input.legLength || null;
    if (input.shoeSize !== undefined) updateData.shoe_size = input.shoeSize || null;
    if (input.trainingStart !== undefined) updateData.training_start = input.trainingStart || null;
    if (photoUrl !== undefined) updateData.photo_url = photoUrl || null;

    const { error } = await supabase
      .from('athletes')
      .update(updateData)
      .eq('id', id)
      .eq('coach_id', coachProfile.id);

    if (error) {
      console.error('Ошибка обновления спортсмена:', error);
      return { error: getFriendlySupabaseError(error) };
    }
        await refresh({ silent: true });
    return { error: null };
  };

  const deleteAthlete = async (id: string) => {
    if (!coachProfile?.id) return { error: 'Нет профиля тренера' };

    // Порядок важен: сначала дочерние записи (результаты, травмы),
    // потом сам спортсмен — иначе упадём на FK-ограничении.
    const { error: resultsError } = await supabase
      .from('results')
      .delete()
      .eq('athlete_id', id);
    if (resultsError) return { error: getFriendlySupabaseError(resultsError) };

    const { error: injuriesError } = await supabase
      .from('injuries')
      .delete()
      .eq('athlete_id', id);
    if (injuriesError) return { error: getFriendlySupabaseError(injuriesError) };

    const { error } = await supabase
      .from('athletes')
      .delete()
      .eq('id', id)
      .eq('coach_id', coachProfile.id);
    if (error) return { error: getFriendlySupabaseError(error) };

        await refresh({ silent: true });
    return { error: null };
  };

  async function syncAthleteStatus(athleteId: string) {
    const { data } = await supabase
      .from('injuries')
      .select('id')
      .eq('athlete_id', athleteId)
      .eq('status', 'active');
    const hasActive = (data || []).length > 0;
    await supabase
      .from('athletes')
      .update({ status: hasActive ? 'injured' : 'active' })
      .eq('id', athleteId)
      .eq('coach_id', coachProfile!.id);
  }

  const addInjury = async (athleteId: string, data: { name: string; dateInjured: string; dateHealed?: string; description?: string }) => {
    if (!coachProfile?.id) return { error: 'Нет профиля тренера' };
    const { error } = await supabase.from('injuries').insert({
      athlete_id: athleteId,
      name: data.name.trim(),
      date_injured: data.dateInjured,
      date_healed: data.dateHealed || null,
      description: data.description?.trim() || null,
      status: data.dateHealed ? 'healed' : 'active',
    });
    if (error) return { error: getFriendlySupabaseError(error) };
    if (!data.dateHealed) {
      await syncAthleteStatus(athleteId);
    }
        await refresh({ silent: true });
    return { error: null };
  };

  const updateInjury = async (id: string, data: Partial<{ name: string; dateInjured: string; dateHealed: string; description: string; status: 'active' | 'healed' }>) => {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.dateInjured !== undefined) updateData.date_injured = data.dateInjured;
    if (data.dateHealed !== undefined) updateData.date_healed = data.dateHealed || null;
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.status !== undefined) updateData.status = data.status;

    const { data: existing } = await supabase.from('injuries').select('athlete_id').eq('id', id).single();
    const athleteId = existing?.athlete_id;

    const { error } = await supabase.from('injuries').update(updateData).eq('id', id);
    if (error) return { error: getFriendlySupabaseError(error) };

    if (athleteId) {
      await syncAthleteStatus(athleteId);
    }
        await refresh({ silent: true });
    return { error: null };
  };

  const deleteInjury = async (id: string) => {
    const { data: existing } = await supabase.from('injuries').select('athlete_id').eq('id', id).single();
    const athleteId = existing?.athlete_id;

    const { error } = await supabase.from('injuries').delete().eq('id', id);
    if (error) return { error: getFriendlySupabaseError(error) };

    if (athleteId) {
      await syncAthleteStatus(athleteId);
    }
        await refresh({ silent: true });
    return { error: null };
  };
 const addResult = async (input: NewResultInput) => {
  if (!coachProfile?.id || !user?.id) return { error: 'Нет профиля тренера' };

  // src/contexts/Athletescontext.tsx, внутри addResult

// 1. Найти существующую дисциплину по имени.
// .maybeSingle() падал с ошибкой, если по имени находится больше одной строки
// (например, дефолтная дисциплина + своя запись тренера с тем же названием) —
// именно из-за этого "Подтягивания"/"Отжимания" не сохранялись.
const { data: matchingDisciplines, error: findError } = await supabase
  .from('disciplines')
  .select('id, is_default')
  .or(`is_default.eq.true,coach_id.eq.${coachProfile.id}`)
  .eq('name', input.discipline)
  .order('is_default', { ascending: false })
  .limit(1);

if (findError) {
  console.error('Ошибка поиска дисциплины:', findError);
  return { error: getFriendlySupabaseError(findError) };
}

let disciplineId = matchingDisciplines?.[0]?.id as string | undefined;

  if (!disciplineId) {
    const { data: newDiscipline, error: createError } = await supabase
      .from('disciplines')
      .insert({
        name: input.discipline,
        unit: disciplineMeta(input.discipline).unit,
        is_default: false,
        coach_id: coachProfile.id,   // disciplines.coach_id по-прежнему ссылается на coaches — не трогаем
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Ошибка создания дисциплины:', createError);
      return { error: getFriendlySupabaseError(createError) };
    }
    disciplineId = newDiscipline.id;
  }

  // 2. Вставляем результат: coach_id теперь ссылается на profiles → пишем user.id (auth.uid())
  const { error } = await supabase.from('results').insert({
    coach_id: user.id,          // ← было coachProfile.id
    athlete_id: input.athleteId,
    discipline_id: disciplineId,
    date: input.date,
    result_value: input.resultValue,
    result_display: input.result,
    location: input.location || null,
    type: input.type,
    wind: input.wind ?? null,
    comment: input.comment ?? null,
    control_event_id: input.controlEventId ?? null,
  });

  if (error) {
    console.error('Ошибка добавления результата:', error);
    return { error: getFriendlySupabaseError(error) };
  }
  await refresh();
  return { error: null };
};

const deleteResult = async (id: string) => {
  const { error } = await supabase.from('results').delete().eq('id', id);
  if (error) return { error: getFriendlySupabaseError(error) };
  await refresh();
  return { error: null };
};

  return (
    <AthletesContext.Provider value={{ athletes, results, injuries, loading, refresh, addAthlete, updateAthlete, deleteAthlete, addInjury, updateInjury, deleteInjury, addResult, deleteResult }}>
      {children}
    </AthletesContext.Provider>
  );
};

export const useAthletes = () => {
  const ctx = useContext(AthletesContext);
  if (!ctx) throw new Error('useAthletes must be used within AthletesProvider');
  return ctx;
};
