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
import { athleteTotalPoints, averageAge, resultsByMonth } from "../lib/Scoring"
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

// Уровни соревнований — должны совпадать 1-в-1 со значениями,
// которые пишет форма создания в Competitions.tsx.
type CompLevel = 'city' | 'district' | 'region' | 'republic' | 'school'

interface Competition {
  id: string
  name: string
  date: string
  location: string
  level: CompLevel
}

const levelColors: Record<CompLevel, string> = {
  city: '#60a5fa',
  district: '#a78bfa',
  region: '#fbbf24',
  republic: '#c6f135',
  school: '#f87171',
}
const levelLabels: Record<CompLevel, string> = {
  city: 'Город',
  district: 'Район',
  region: 'Область',
  republic: 'Республика',
  school: 'Школа',
}

export default function Dashboard() {
    const { athletes, results, injuries, loading } = useAthletes()
  const { coachProfile } = useAuth()
  const [upcomingComps, setUpcomingComps] = useState<Competition[]>([])

  useEffect(() => {
    if (!coachProfile) return
    const fetchComps = async () => {
      const today = new Date().toISOString().slice(0, 10)
      const { data, error } = await supabase
        .from('competitions')
        .select('id, name, date, location, level')
        .eq('coach_id', coachProfile.id)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(3)
      if (error) {
        console.error('Ошибка загрузки соревнований:', error)
        setUpcomingComps([])
        return
      }
      setUpcomingComps((data || []).map(c => ({
        id: c.id,
        name: c.name,
        date: c.date,
        location: c.location || '',
        level: (c.level as CompLevel) || 'city',
      })))
    }
    fetchComps()
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

  const leaders = [...scored].sort((a, b) => b.pts - a.pts).slice(0, 4)

  const recentResults = [...results]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  const activity = resultsByMonth(results)

  const kpiCards = [
    {
      label: "Спортсменов",
      value: String(athletes.length),
      sub: `${activeCount} активных`,
      up: null as boolean | null,
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
      sub: scored.length > 0 ? "по многоборью" : "нет данных",
      up: null,
      accent: "#a78bfa",
    },
    {
      label: "Результатов внесено",
      value: String(results.length),
      sub: "тестов и стартов",
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
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#f0f2f5",
                  letterSpacing: "0.02em",
                }}
              >
                АКТИВНОСТЬ РЕЗУЛЬТАТОВ
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Количество внесённых результатов по месяцам
              </div>
            </div>
          </div>
          {activity.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={activity}>
                <defs>
                  <linearGradient id="lime" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c6f135" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#c6f135" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 11, fontFamily: "Inter" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: "#6b7280",
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono'",
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip
                  contentStyle={{
                    background: "#141720",
                    border: "1px solid #1e2230",
                    borderRadius: 8,
                    color: "#f0f2f5",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#9ca3af" }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Результатов"
                  stroke={LIME}
                  strokeWidth={2}
                  fill="url(#lime)"
                  dot={{ fill: LIME, r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyRow text="Пока нет внесённых результатов" />
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
            БЛИЖАЙШИЕ СТАРТЫ
          </div>
          {upcomingComps.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcomingComps.map(c => (
                <div key={c.id} style={{ padding: '10px 12px', background: 'rgba(20,23,32,0.5)', borderRadius: 8, border: '1px solid #1e2230' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f2f5' }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{c.date} · {c.location}</div>
                  <span style={{
                    fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 700,
                    background: `${levelColors[c.level]}18`,
                    color: levelColors[c.level],
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    marginTop: 6, display: 'inline-block',
                  }}>{levelLabels[c.level]}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow text="Нет предстоящих соревнований" />
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
          {injuredAthletes.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {injuredAthletes.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: "12px",
                    background: "rgba(248,113,113,0.04)",
                    borderRadius: 8,
                    border: "1px solid rgba(248,113,113,0.15)",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f5" }}>
                    {a.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                    Травма{a.medicalNotes ? ` · ${a.medicalNotes}` : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyRow text="Все спортсмены допущены к тренировкам" />
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
                        background:
                          r.type === "competition"
                            ? "rgba(167,139,250,0.15)"
                            : "rgba(96,165,250,0.1)",
                        color: r.type === "competition" ? "#a78bfa" : "#60a5fa",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        fontWeight: 600,
                      }}
                    >
                      {r.type === "competition" ? "Соревн" : "Тест"}
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
