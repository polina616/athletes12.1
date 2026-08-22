import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { IconTrend } from "./Icons"
import athleteImg from "@/imports/images-removebg-preview.png"
import { useAthletes } from "../contexts/Athletescontext"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabaseClient"
import { athleteTotalPoints, averageAge, resultsByMonth, teamPointsTrend, teamPointsDelta, progressLeaders, decliningAthletes } from "../lib/Scoring"
import { useState, useEffect } from "react"

const LIME = "#c6f135"

function EmptyRow({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "16px 12px",
        textAlign: "center",
        color: "#4b5563",
        fontSize: 12,
      }}
    >
      {text}
    </div>
  )
}

interface UpcomingEvent {
  id: string
  name: string
  date: string
  disciplineCount: number
}

export default function Dashboard() {
    const { athletes, results, injuries, loading } = useAthletes()
  const { coachProfile } = useAuth()
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])

useEffect(() => {
  if (!coachProfile) return
  const fetchEvents = async () => {
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await supabase
      .from('control_events')
      .select('id, name, date, disciplines')
      .eq('coach_id', coachProfile.id)
      .gte('date', today)
      .order('date', { ascending: true })
      .limit(3)
    if (error) {
      console.error('Ошибка загрузки зачётов:', error)
      setUpcomingEvents([])
      return
    }
    setUpcomingEvents((data || []).map(e => ({
      id: e.id,
      name: e.name,
      date: e.date,
      disciplineCount: Array.isArray(e.disciplines) ? e.disciplines.length : 0,
    })))
  }
  fetchEvents()
}, [coachProfile])

    const activeCount = athletes.filter(a => a.status === "active").length
      const injuredAthletes = athletes.filter(a => a.status === "injured" || injuries.some(i => i.athleteId === a.id && i.status === 'active')
  )
  const avgAge = averageAge(athletes)

  const scored = athletes
    .map(a => ({ athlete: a, pts: athleteTotalPoints(a, results) }))
    .filter(s => s.pts > 0)
  const avgPoints =
    scored.length > 0
      ? Math.round(scored.reduce((s, x) => s + x.pts, 0) / scored.length)
      : null

      const trend = teamPointsTrend(athletes, results)
const pointsDelta = teamPointsDelta(trend)
const progressList = progressLeaders(athletes, results, 4)
const declineList = decliningAthletes(athletes, results, 3)

const now = new Date()
const newAthletesThisMonth = athletes.filter(a => {
  if (!a.createdAt) return false
  const d = new Date(a.createdAt)
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}).length

const [monthlyTrainings, setMonthlyTrainings] = useState<{ count: number; avgAttendance: number }>({ count: 0, avgAttendance: 0 })

useEffect(() => {
  if (!coachProfile) return
  const fetchMonthlyTrainings = async () => {
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const { data, error } = await supabase
      .from('trainings')
      .select('id, athlete_ids, attended_ids')
      .eq('coach_id', coachProfile.id)
      .gte('date', monthStart)
    if (error) {
      console.error('Ошибка загрузки тренировок:', error)
      setMonthlyTrainings({ count: 0, avgAttendance: 0 })
      return
    }
    const rows = data || []
    const avg = rows.length > 0
      ? Math.round(rows.reduce((s, t) => s + ((t.attended_ids?.length || 0) / Math.max(1, t.athlete_ids?.length || 1) * 100), 0) / rows.length)
      : 0
    setMonthlyTrainings({ count: rows.length, avgAttendance: avg })
  }
  fetchMonthlyTrainings()
}, [coachProfile])

  const leaders = [...scored].sort((a, b) => b.pts - a.pts).slice(0, 4)

  const recentResults = [...results]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  const activity = resultsByMonth(results)

  const kpiCards = [
  {
    label: "Спортсменов",
    value: String(athletes.length),
    sub: newAthletesThisMonth > 0 ? `+${newAthletesThisMonth} за месяц` : `${activeCount} активных`,
    up: newAthletesThisMonth > 0 ? true : null,
    accent: "#c6f135",
  },
  {
    label: "Средний возраст",
    value: avgAge !== null ? String(avgAge) : "—",
    sub: "лет",
    up: null,
    accent: "#60a5fa",
  },
  {
    label: "Средние очки",
    value: avgPoints !== null ? avgPoints.toLocaleString("ru") : "—",
    sub: pointsDelta
      ? `${pointsDelta.up ? "+" : ""}${pointsDelta.percent}% к прошлому месяцу`
      : (scored.length > 0 ? "по многоборью" : "нет данных"),
    up: pointsDelta ? pointsDelta.up : null,
    accent: "#a78bfa",
  },
  {
    label: "Тренировок / мес",
    value: String(monthlyTrainings.count),
    sub: monthlyTrainings.count > 0 ? `${monthlyTrainings.avgAttendance}% посещаемость` : "нет тренировок",
    up: null,
    accent: "#fbbf24",
  },
]

  return (
    <div style={{ animation: "fadeIn 0.35s ease forwards" }}>
      <div
        style={{
          position: "relative",
          background:
            "linear-gradient(135deg, rgba(15,17,23,0.95) 0%, rgba(12,16,8,0.95) 100%)",
          border: "1px solid #1e2230",
          borderRadius: 14,
          padding: "28px 32px",
          marginBottom: 24,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(198,241,53,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(198,241,53,0.03) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -40,
            right: 120,
            width: 260,
            height: 260,
            background:
              "radial-gradient(circle, rgba(198,241,53,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, #c6f135, rgba(198,241,53,0.2), transparent)",
          }}
        />

        <img
          src={athleteImg}
          alt=""
          aria-hidden
          style={{
            position: "absolute",
            bottom: -8,
            right: 24,
            height: 130,
            width: "auto",
            filter:
              "brightness(0) saturate(100%) invert(88%) sepia(60%) saturate(600%) hue-rotate(29deg) brightness(1.05)",
            opacity: 0.55,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              fontSize: 11,
              color: "#c6f135",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            Сезон 2024–2025
          </div>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 42,
              fontWeight: 900,
              color: "#f0f2f5",
              margin: 0,
              letterSpacing: "0.01em",
              lineHeight: 1,
            }}
          >
            ПАНЕЛЬ УПРАВЛЕНИЯ
          </h1>
          <p style={{ color: "#4b5563", fontSize: 13, margin: "8px 0 0" }}>
            {athletes.length > 0
              ? `${athletes.length} спортсменов · ${results.length} результатов внесено`
              : "Пока нет спортсменов — добавьте первого в разделе «Спортсмены»"}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {kpiCards.map((c) => (
          <div
            key={c.label}
            style={{
              background: "rgba(15,17,23,0.8)",
              border: "1px solid #1e2230",
              borderRadius: 12,
              padding: "20px 20px 16px",
              backdropFilter: "blur(12px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, ${c.accent}, transparent)`,
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 38,
                fontWeight: 800,
                color: "#f0f2f5",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {loading ? "—" : c.value}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              {c.sub}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: "rgba(15,17,23,0.8)",
            border: "1px solid #1e2230",
            borderRadius: 12,
            padding: "20px 24px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 20,
            }}
          >
            <div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: "#f0f2f5", letterSpacing: "0.04em", marginBottom: 16 }}>
  ЛИДЕРЫ ПРОГРЕССА
</div>
{progressList.length > 0 ? (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {progressList.map((p, i) => (
      <div key={p.athlete.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "rgba(20,23,32,0.6)", borderRadius: 8, border: "1px solid #1e2230" }}>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: i === 0 ? LIME : "#6b7280", fontWeight: 600, width: 18 }}>
          #{i + 1}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f5" }}>{p.athlete.nameShort || p.athlete.name}</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{p.event}</div>
        </div>
        <div style={{ fontSize: 11, color: LIME, display: "flex", alignItems: "center", gap: 3 }}>
          <IconTrend up={true} />
          {p.deltaLabel}
        </div>
      </div>
    ))}
  </div>
) : (
  <EmptyRow text="Пока недостаточно данных для оценки прогресса" />
)}
        </div>

        <div
          style={{
            background: "rgba(15,17,23,0.8)",
            border: "1px solid #1e2230",
            borderRadius: 12,
            padding: "20px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#f0f2f5",
              letterSpacing: "0.04em",
              marginBottom: 16,
            }}
          >
            ЛИДЕРЫ ПО ОЧКАМ
          </div>
          {leaders.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {leaders.map((l, i) => (
                <div
                  key={l.athlete.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    background: "rgba(20,23,32,0.6)",
                    borderRadius: 8,
                    border: "1px solid #1e2230",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      color: i === 0 ? LIME : "#6b7280",
                      fontWeight: 600,
                      width: 18,
                    }}
                  >
                    #{i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f5" }}
                    >
                      {l.athlete.nameShort || l.athlete.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>
                      {l.athlete.gender === "F" ? "Семиборье" : "Десятиборье"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#f0f2f5",
                    }}
                  >
                    {l.pts.toLocaleString("ru")}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow text="Нет данных для рейтинга" />
          )}
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
      >
        <div
          style={{
            background: "rgba(15,17,23,0.8)",
            border: "1px solid #1e2230",
            borderRadius: 12,
            padding: "20px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 16, fontWeight: 700, color: '#f0f2f5', letterSpacing: '0.04em', marginBottom: 16 }}>
  БЛИЖАЙШИЕ ЗАЧЁТЫ
</div>
{upcomingEvents.length > 0 ? (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {upcomingEvents.map(e => (
      <div key={e.id} style={{ padding: '10px 12px', background: 'rgba(20,23,32,0.5)', borderRadius: 8, border: '1px solid #1e2230' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f2f5' }}>{e.name}</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
          {new Date(e.date).toLocaleDateString('ru-RU')} · {e.disciplineCount} дисциплин
        </div>
      </div>
    ))}
  </div>
) : (
  <EmptyRow text="Нет предстоящих зачётов" />
)}
        </div>

        <div
          style={{
            background: "rgba(15,17,23,0.8)",
            border: "1px solid #1e2230",
            borderRadius: 12,
            padding: "20px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#f0f2f5",
              letterSpacing: "0.04em",
              marginBottom: 16,
            }}
          >
            ТРЕБУЮТ ВНИМАНИЯ
          </div>
          {(injuredAthletes.length > 0 || declineList.length > 0) ? (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {injuredAthletes.map((a) => (
      <div key={a.id} style={{ padding: "12px", background: "rgba(248,113,113,0.04)", borderRadius: 8, border: "1px solid rgba(248,113,113,0.15)" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f5" }}>{a.name}</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Травма{a.medicalNotes ? ` · ${a.medicalNotes}` : ""}</div>
      </div>
    ))}
    {declineList.map((d, i) => (
      <div key={`${d.athlete.id}-${i}`} style={{ padding: "12px", background: "rgba(251,191,36,0.04)", borderRadius: 8, border: "1px solid rgba(251,191,36,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f5" }}>{d.athlete.nameShort || d.athlete.name}</span>
          <span style={{ fontSize: 11, color: "#fbbf24", display: "flex", alignItems: "center", gap: 3 }}>
            <IconTrend up={false} />
            {d.deltaLabel}
          </span>
        </div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>{d.discipline} · ухудшение результата</div>
      </div>
    ))}
  </div>
) : (
  <EmptyRow text="Все спортсмены допущены и показывают стабильный результат" />
)}
        </div>

        <div
          style={{
            background: "rgba(15,17,23,0.8)",
            border: "1px solid #1e2230",
            borderRadius: 12,
            padding: "20px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#f0f2f5",
              letterSpacing: "0.04em",
              marginBottom: 16,
            }}
          >
            ПОСЛЕДНИЕ РЕЗУЛЬТАТЫ
          </div>
          {recentResults.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recentResults.map((r) => {
                const athlete = athletes.find((a) => a.id === r.athleteId)
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      background: "rgba(20,23,32,0.5)",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#9ca3af" }}>
                        {athlete?.nameShort || athlete?.name || "—"}
                      </div>
                      <div style={{ fontSize: 11, color: "#6b7280" }}>
                        {r.discipline}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        fontWeight: 600,
                        color: LIME,
                      }}
                    >
                      {r.result}{" "}
                      <span style={{ fontSize: 10, color: "#6b7280" }}>
                        {r.unit}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        padding: "2px 5px",
                        borderRadius: 3,
                        background: "rgba(96,165,250,0.1)",
color: "#60a5fa",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 600,
                      }}
                    >
                      Тест
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyRow text="Результатов пока нет" />
          )}
        </div>
      </div>
    </div>
  )
}
