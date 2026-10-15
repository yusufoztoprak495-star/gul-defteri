import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api.js';
import { EmptyChart, RoseHead, RoseLeaf } from '../components/Flowers.jsx';
import EmptyState from '../components/EmptyState.jsx';
import BackupReminder from '../components/BackupReminder.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { fillMissingDays, summarize } from '../lib/charts.js';
import { daysAgo, toLocalDateString } from '../lib/dates.js';
import { formatDuration, formatShortDate } from '../lib/format.js';
import { addDays, studyStreak, topSubjectOfDay, weeklyChange } from '../lib/insights.js';
import { quoteOfDay } from '../lib/quotes.js';
import { bloomStage } from '../lib/garden.js';

// Seri ve haftalık karşılaştırma için bu kadar geriye bakılır (daha uzun seriler "365+" yazılır)
const HISTORY_DAYS = 365;

// Son 7 günün gül bahçesi: her gün bir gül. Sapın boyu o günün çalışma süresine göre uzar;
// gül, haftanın en uzun gününe göre gonca → yarı açmış → tam açmış hâle gelir.
// Hiç çalışılmayan günde yalnızca toprakta küçük bir filiz durur. Bugünün gülü daha koyu.
function RoseGarden({ days }) {
  const max = Math.max(...days.map((d) => d.totalSeconds), 1);
  const gap = 58;
  const ground = 132;
  return (
    <svg
      className="rose-garden flower"
      viewBox={`0 0 ${(days.length - 1) * gap + 60} ${ground + 26}`}
      role="img"
      aria-label={`Son 7 günün çalışma süresi: ${days
        .map((d) => `${formatShortDate(d.date)} ${formatDuration(d.totalSeconds)}`)
        .join(', ')}`}
    >
      <path className="ground" d={`M4 ${ground} C${gap * 2} ${ground - 4} ${gap * 5} ${ground - 4} ${(days.length - 1) * gap + 56} ${ground}`} />
      {days.map((day, i) => {
        const x = 30 + i * gap;
        const stage = bloomStage(day.totalSeconds, max);
        const isToday = i === days.length - 1;
        const label = (
          <text x={x} y={ground + 20} textAnchor="middle" className={isToday ? 'bar-label today' : 'bar-label'}>
            {isToday ? 'Bugün' : formatShortDate(day.date)}
          </text>
        );
        if (stage === 'none') {
          return (
            <g key={day.date}>
              <path className="stem" d={`M${x} ${ground} L${x} ${ground - 8}`} />
              <RoseLeaf x={x} y={ground - 6} rotate={-40} scale={0.45} />
              {label}
            </g>
          );
        }
        // Sap boyu 34–100 birim arası
        const top = ground - (34 + (day.totalSeconds / max) * 66);
        return (
          <g key={day.date}>
            <path className="stem" d={`M${x} ${ground} C${x - 3} ${ground - 30} ${x + 3} ${top + 30} ${x} ${top + 10}`} />
            <RoseLeaf x={x} y={ground - 22} rotate={i % 2 ? -32 : -148} scale={0.6} />
            <RoseHead x={x} y={top} scale={stage === 'full' ? 1.05 : 1} stage={stage} deep={isToday} />
            {label}
          </g>
        );
      })}
    </svg>
  );
}

// Haftalık değişimin yazısı: ↑ %24, ↓ %12, "Değişmedi" ya da "Yeni"
function changeText(change) {
  if (change.direction === 'up') return `↑ %${change.percent}`;
  if (change.direction === 'down') return `↓ %${Math.abs(change.percent)}`;
  if (change.direction === 'new') return 'Yeni';
  return 'Değişmedi';
}

// Günün sözü: her gün farklı bir söz; "Başka söz" ile sıradakine geçilir
function DailyQuote({ date }) {
  const [offset, setOffset] = useState(0);
  const quote = quoteOfDay(date, offset);
  return (
    <figure className="daily-quote">
      <span className="panel-label">Günün sözü</span>
      <blockquote>{quote.text}</blockquote>
      <figcaption>
        <span>
          {quote.author}
          {quote.source && <cite>, {quote.source}</cite>}
        </span>
        <button type="button" className="secondary small" onClick={() => setOffset((o) => o + 1)}>
          Başka söz
        </button>
      </figcaption>
    </figure>
  );
}

// Karşılama sayfası: bugünün özeti, haftalık değişim, çalışma serisi, günün dersi ve son haftanın ritmi
export default function Home() {
  const [history, setHistory] = useState(null);
  const [todaySubjects, setTodaySubjects] = useState(null);
  const [error, setError] = useState(null);
  const today = toLocalDateString(new Date());

  useEffect(() => {
    const now = new Date();
    const to = toLocalDateString(now);
    Promise.all([
      apiFetch(`/api/stats/daily?from=${daysAgo(HISTORY_DAYS - 1, now)}&to=${to}`),
      apiFetch(`/api/stats/by-subject?from=${to}&to=${to}`),
    ])
      .then(([daily, subjects]) => {
        setHistory(daily);
        setTodaySubjects(subjects);
      })
      .catch((e) => setError(e.message));
  }, []);

  const view = useMemo(() => {
    if (!history || !todaySubjects) return null;
    const week = fillMissingDays(history, addDays(today, -6), today);
    return {
      week,
      todaySummary: summarize(week.slice(-1)),
      change: weeklyChange(history, today),
      streak: studyStreak(history, today),
      topSubject: topSubjectOfDay(todaySubjects),
      weekSeconds: week.reduce((t, d) => t + d.totalSeconds, 0),
      weekDays: week.filter((d) => d.totalSeconds > 0).length,
    };
  }, [history, todaySubjects, today]);

  return (
    <section>
      <h1>Bugün</h1>
      <DailyQuote date={today} />
      <ErrorBanner message={error} />
      <BackupReminder />

      {view && (
        <>
          <div className="panels">
            <article className="panel panel-wide">
              <h2 className="panel-label">Bugünün özeti</h2>
              <div className="today-grid">
                <div>
                  <span className="value">{formatDuration(view.todaySummary.totalSeconds)}</span>
                  <span className="label">Çalışma süresi</span>
                </div>
                <div>
                  <span className="value">{formatDuration(view.weekSeconds)}</span>
                  <span className="label">Son 7 gün</span>
                </div>
                <div>
                  <span className="value">{view.weekDays}<small> / 7</small></span>
                  <span className="label">Çalışılan gün</span>
                </div>
              </div>
            </article>

            <article className="panel">
              <h2 className="panel-label">Haftalık değişim</h2>
              <span className={`value change-${view.change.direction}`}>{changeText(view.change)}</span>
              <p className="panel-note">
                Son 7 gün {formatDuration(view.change.current)}
                <br />
                Önceki 7 gün {formatDuration(view.change.previous)}
              </p>
            </article>

            <article className="panel">
              <h2 className="panel-label">Seri</h2>
              <span className="value">
                {view.streak.count >= HISTORY_DAYS ? `${HISTORY_DAYS}+` : view.streak.count}
                <small> gün</small>
              </span>
              <p className="panel-note">
                {view.streak.activeToday
                  ? 'Bugün de çalıştın.'
                  : view.streak.count > 0
                    ? 'Bugün henüz kayıt yok, seriyi sürdür.'
                    : 'Bugün başlarsan seri başlar.'}
              </p>
            </article>

            <article className="panel panel-wide">
              <h2 className="panel-label">Günün dersi</h2>
              {view.topSubject ? (
                <>
                  <span className="value">
                    {view.topSubject.subjectName}{' '}
                    {view.topSubject.examType && <small>({view.topSubject.examType})</small>}
                  </span>
                  <p className="panel-note">Bugün en çok bu derse çalıştın: {formatDuration(view.topSubject.totalSeconds)}</p>
                </>
              ) : (
                <>
                  <span className="value muted">—</span>
                  <p className="panel-note">Bugün henüz bir derse çalışma kaydı yok.</p>
                </>
              )}
            </article>
          </div>

          <h2>Son 7 gün</h2>
          {view.week.every((d) => d.totalSeconds === 0) ? (
            <EmptyState
              Doodle={EmptyChart}
              title="Bu hafta henüz kayıt yok"
              hint="Bir Pomodoro başlat ya da çalışma günlüğüne süre gir; son 7 günün burada görünür."
            />
          ) : (
            <RoseGarden days={view.week} />
          )}

          <p className="home-actions">
            <Link to="/pomodoro" className="button-link">
              Pomodoro başlat
            </Link>
            <Link to="/ilerleme" className="text-link">
              Tüm grafikler
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
