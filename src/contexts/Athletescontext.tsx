import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

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
}

export interface Result {
  id: string;
  athleteId: string;
  date: string;
  discipline: string;
  result: string;
  resultValue: number;
  unit: string;
  location: string;
  type: 'training' | 'competition' | 'test';
  wind?: number;
  surface?: string;
  shoes?: string;
  comment?: string;
  weather?: string;
  feeling?: number;
  rpe?: number;
}

export interface NewAthleteInput {
  name: string;
  nameShort?: string;
  birthDate?: string;
  gender: 'M' | 'F';
  grade?: string;
  group?: string;
  specialization: Athlete['specialization'];
}

interface AthletesContextType {
  athletes: Athlete[];
  results: Result[];
  loading: boolean;
  refresh: () => Promise<void>;
  addAthlete: (input: NewAthleteInput) => Promise<{ error: string | null }>;
  deleteAthlete: (id: string) => Promise<{ error: string | null }>;
}

const AthletesContext = createContext<AthletesContextType | undefined>(undefined);

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
  };
}

function rowToResult(row: any): Result {
  return {
    id: row.id,
    athleteId: row.athlete_id,
    date: row.date,
    discipline: row.discipline,
    result: row.result,
    resultValue: Number(row.result_value),
    unit: row.unit,
    location: row.location || '',
    type: row.type,
    wind: row.wind ?? undefined,
    surface: row.surface ?? undefined,
    shoes: row.shoes ?? undefined,
    comment: row.comment ?? undefined,
    weather: row.weather ?? undefined,
    feeling: row.feeling ?? undefined,
    rpe: row.rpe ?? undefined,
  };
}

export const AthletesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { coachProfile } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!coachProfile) {
      setAthletes([]);
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const { data: athleteRows, error: athleteError } = await supabase
      .from('athletes')
      .select('*')
      .eq('coach_id', coachProfile.id)
      .order('created_at', { ascending: true });

    if (athleteError) {
      console.error('Ошибка загрузки спортсменов:', athleteError);
      setAthletes([]);
      setResults([]);
      setLoading(false);
      return;
    }

    const loadedAthletes = (athleteRows || []).map(rowToAthlete);
    setAthletes(loadedAthletes);

    const athleteIds = loadedAthletes.map(a => a.id);
    if (athleteIds.length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const { data: resultRows, error: resultError } = await supabase
      .from('results')
      .select('*')
      .in('athlete_id', athleteIds)
      .order('date', { ascending: true });

    if (resultError) {
      console.error('Ошибка загрузки результатов:', resultError);
      setResults([]);
    } else {
      setResults((resultRows || []).map(rowToResult));
    }
    setLoading(false);
  }, [coachProfile]);

  useEffect(() => {
    refresh();
  }, [refresh]);

    const addAthlete = async (input: NewAthleteInput) => {
    if (!coachProfile) return { error: 'Нет профиля тренера. Выйдите и войдите снова.' };
    if (!coachProfile.id) return { error: 'Ошибка профиля тренера (нет ID). Выйдите и войдите снова.' };
    if (!input.name.trim()) return { error: 'Укажите имя спортсмена' };

    // Проверка на дубликат
    const { data: existing } = await supabase
      .from('athletes')
      .select('id')
      .eq('coach_id', coachProfile.id)
      .ilike('name', input.name.trim())
      .maybeSingle();

    if (existing) {
      return { error: 'Спортсмен с таким именем уже существует' };
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
      status: 'active',
    });
    if (error) {
      console.error('Ошибка добавления спортсмена:', error);
      return { error: error.message };
    }
    await refresh();
    return { error: null };
  };

  const deleteAthlete = async (id: string) => {
    if (!coachProfile?.id) return { error: 'Нет профиля тренера' };
    
    // Сначала удаляем все результаты спортсмена
    const { error: resultsError } = await supabase
      .from('results')
      .delete()
      .eq('athlete_id', id);
    if (resultsError) return { error: resultsError.message };

    // Потом удаляем самого спортсмена
    const { error } = await supabase
      .from('athletes')
      .delete()
      .eq('id', id)
      .eq('coach_id', coachProfile.id); // защита: удаляем только своего
    if (error) return { error: error.message };
    
    await refresh();
    return { error: null };
  };

  return (
    <AthletesContext.Provider value={{ athletes, results, loading, refresh, addAthlete, deleteAthlete }}>
      {children}
    </AthletesContext.Provider>
  );
};

export const useAthletes = () => {
  const ctx = useContext(AthletesContext);
  if (!ctx) throw new Error('useAthletes must be used within AthletesProvider');
  return ctx;
};