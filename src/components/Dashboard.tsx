import {
  athletes,
  results,
  competitions,
  trainings,
  progressData,
} from "../data/mockData"
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

const kpiCards = [
  {
    label: "Спортсменов",
    value: "6",
    sub: "+2 за сезон",
    up: true,
    accent: "#c6f135",
  },
  {
    label: "Средний возраст",
    value: "19.2",
    sub: "лет",
    up: null,
    accent: "#60a5fa",
  },
  {
    label: "Средние очки",
    value: "7 840",
    sub: "+4.8% к прошлому году",
    up: true,
    accent: "#a78bfa",
  },
  {
    label: "Тренировок / мес",
    value: "22",
    sub: "88% посещаемость",
    up: true,
    accent: "#fbbf24",
  },
]

const leaders = [
  {
    name: "А. Петров",
    event: "Десятиборье",
    pts: 8220,
    delta: "+380",
    up: true,
  },
  { name: "Д. Волков", event: "100 м", pts: 7910, delta: "+220", up: true },
  {
    name: "М. Соколова",
    event: "Семиборье",
    pts: 6850,
    delta: "+310",
    up: true,
  },
  {
    name: "И. Смирнов",
    event: "Десятиборье",
    pts: 7640,
    delta: "+190",
    up: true,
  },
]

const declining = [
  {
    name: "А. Козлова",
    event: "Прыжок в высоту",
    pts: 1.68,
    delta: "-0.07 м",
    up: false,
    reason: "Травма",
  },
  {
    name: "П. Новиков",
    event: "Прыжок в длину",
    pts: 7.05,
    delta: "-0.12 м",
    up: false,
    reason: "Усталость",
  },
]

const upcoming = [
  {
    name: "Зимний многоборный турнир",
    date: "15 Фев 2025",
    location: "Москва",
    level: "regional",
  },
  {
    name: "Первенство России U20",
    date: "25 Июн 2025",
    location: "Чебоксары",
    level: "national",
  },
]

const recentResults = results.slice(0, 6)

const LIME = "#c6f135"

export default function Dashboard() {
  return (
    <div style={{ animation: "fadeIn 0.35s ease forwards" }}>
      {/* Hero header with athlete */}
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
        {/* Grid bg */}
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
        {/* Lime bloom */}
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
        {/* Top accent */}
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

        {/* Athlete silhouette — right side */}
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
            Тренер Сергей Морозов · 6 спортсменов · 22 тренировки в месяц
          </p>
        </div>
      </div>

      {/* KPI Cards */}
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
              {c.value}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
              }}
            >
              {c.up !== null && (
                <span style={{ color: c.up ? "#c6f135" : "#f87171" }}>
                  <IconTrend up={c.up!} />
                </span>
              )}
              <span
                style={{
                  color:
                    c.up === true
                      ? "#c6f135"
                      : c.up === false
                        ? "#f87171"
                        : "#6b7280",
                }}
              >
                {c.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* Progress chart */}
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
                ПРОГРЕСС КОМАНДЫ
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                Средние очки в десятиборье
              </div>
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 22,
                fontWeight: 600,
                color: LIME,
              }}
            >
              8 220 <span style={{ fontSize: 11, color: "#6b7280" }}>pts</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={progressData}>
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
                domain={[7000, 8500]}
                tick={{
                  fill: "#6b7280",
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono'",
                }}
                axisLine={false}
                tickLine={false}
                width={50}
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
                dataKey="avg"
                stroke={LIME}
                strokeWidth={2}
                fill="url(#lime)"
                dot={{ fill: LIME, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Leaders */}
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
            ЛИДЕРЫ ПРОГРЕССА
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leaders.map((l, i) => (
              <div
                key={l.name}
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
                    {l.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#6b7280" }}>
                    {l.event}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#f0f2f5",
                    }}
                  >
                    {l.pts}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: LIME,
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      justifyContent: "flex-end",
                    }}
                  >
                    <IconTrend up={true} />
                    {l.delta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom grid */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}
      >
        {/* Upcoming competitions */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcoming.map((c) => (
              <div
                key={c.name}
                style={{
                  padding: "12px",
                  background: "rgba(20,23,32,0.6)",
                  borderRadius: 8,
                  border: "1px solid #1e2230",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: "#f0f2f5" }}
                  >
                    {c.name}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background:
                        c.level === "national"
                          ? "rgba(167,139,250,0.15)"
                          : "rgba(96,165,250,0.15)",
                      color: c.level === "national" ? "#a78bfa" : "#60a5fa",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {c.level === "national" ? "Россия" : "Регион"}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  {c.date} · {c.location}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Declining */}
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
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {declining.map((d) => (
              <div
                key={d.name}
                style={{
                  padding: "12px",
                  background: "rgba(248,113,113,0.04)",
                  borderRadius: 8,
                  border: "1px solid rgba(248,113,113,0.15)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#f0f2f5" }}
                  >
                    {d.name}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "#f87171",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <IconTrend up={false} />
                    {d.delta}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>
                  {d.event} · {d.reason}
                </div>
              </div>
            ))}
            <div
              style={{
                padding: "10px 12px",
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.15)",
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>
                ⚠ Медосмотр просрочен
              </div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                А. Козлова — 45 дней назад
              </div>
            </div>
          </div>
        </div>

        {/* Recent results */}
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
                      {athlete?.nameShort}
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
        </div>
      </div>
    </div>
  )
}
