import { subjectLabel } from '../lib/tracks.js';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api.js';
import ChartCard from '../components/ChartCard.jsx';
import { EmptyChart } from '../components/Flowers.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import { SubjectTimeBars } from '../components/ProgressCharts.jsx';
import RangeFilter from '../components/RangeFilter.jsx';
import StatList from '../components/StatList.jsx';
import TimeSeriesCharts from '../components/TimeSeriesCharts.jsx';
import { useDailyStats } from '../hooks/useDailyStats.js';
import { daysAgo, toLocalDateString } from '../lib/dates.js';
import { formatDuration } from '../lib/format.js';

const rowLabel = (r) => subjectLabel(r.subjectName, r.examType);

// Ana ilerleme sayfası (1. katman): tüm derslerin özeti. Bir derse tıklayınca ders sayfası açılır.
// Seçilen aralıkta en az bir dakika çalışılan gün sayısı
const studiedDays = (view) => view.days.filter((d) => d.totalSeconds > 0).length;

export default function Progress() {
  const [subjects, setSubjects] = useState([]);
  const [range, setRange] = useState(14);
  const [subjectId, setSubjectId] = useState('all');
  const [bySubject, setBySubject] = useState(null);
  const [subjectError, setSubjectError] = useState(null);

  useEffect(() => {
    apiFetch('/api/subjects')
      .then(setSubjects)
      .catch((e) => setSubjectError(e.message));
  }, []);

  // Zaman grafikleri ve göstergeler, seçili derse (ya da tüm derslere) göre
  const { view, loading, error } = useDailyStats(range, subjectId === 'all' ? null : Number(subjectId));

  // Ders listesi ve ders karşılaştırma grafikleri her zaman tüm dersleri gösterir
  useEffect(() => {
    let cancelled = false;
    const today = new Date();
    apiFetch(`/api/stats/by-subject?from=${daysAgo(range - 1, today)}&to=${toLocalDateString(today)}`)
      .then((rows) => !cancelled && setBySubject(rows))
      .catch((e) => !cancelled && setSubjectError(e.message));
    return () => {
      cancelled = true;
    };
  }, [range]);

  const rows = useMemo(() => {
    if (!bySubject) return null;
    return {
      time: bySubject.filter((r) => r.totalSeconds > 0).sort((a, b) => b.totalSeconds - a.totalSeconds),
    };
  }, [bySubject]);

  // Seçili aralıkta hiç kayıt yoksa grafikler yerine tek bir boş durum gösterilir
  const noData =
    view &&
    rows &&
    view.summary.totalSeconds === 0 &&
    rows.time.length === 0;

  const highlightId = subjectId === 'all' ? null : Number(subjectId);
  const chosen = subjects.find((s) => String(s.id) === subjectId);
  const scope = chosen ? subjectLabel(chosen.name, chosen.examType) : 'tüm dersler';

  return (
    <section>
      <h1>İlerleme</h1>
      <ErrorBanner message={error || subjectError} />

      <div className="filters">
        <RangeFilter range={range} onChange={setRange} />
        <label className="subject-filter">
          Ders
          <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="all">Tüm dersler</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {subjectLabel(s.name, s.examType)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted filter-note">
        Ders seçersen göstergeler ve zaman grafikleri o dersi gösterir; ders karşılaştırmalarında seçtiğin ders vurgulanır.
      </p>

      {view && (
        <div className={loading ? 'is-loading' : undefined}>
          <div className="kpis">
            <div className="tile">
              <span className="muted">Çalışma süresi</span>
              <strong>{formatDuration(view.summary.totalSeconds)}</strong>
            </div>
            <div className="tile">
              <span className="muted">Çalışılan gün</span>
              <strong>{studiedDays(view)}</strong>
            </div>
          </div>

          {bySubject && (
            <>
              <h2>Dersler</h2>
              <p className="muted filter-note">Ayrıntı için bir derse tıkla.</p>
              <StatList
                columns={['Ders', 'Süre']}
                rows={bySubject.map((r) => ({
                  key: r.subjectId,
                  to: `/ilerleme/ders/${r.subjectId}`,
                  name: rowLabel(r),
                  cells: [formatDuration(r.totalSeconds)],
                }))}
              />
            </>
          )}

          {noData ? (
            <EmptyState
              Doodle={EmptyChart}
              title="Bu aralıkta henüz kayıt yok"
              hint="Bir Pomodoro başlat ya da çalışma günlüğüne süre gir; grafikler burada belirir."
            />
          ) : (
            <>
          <h2>Grafikler</h2>
          <div className="chart-grid">
            <TimeSeriesCharts view={view} range={range} scope={scope} totalNote={chosen ? '' : ' (toplam)'} />

            {rows && (
              <>
                <ChartCard
                  title="Derse göre çalışma süresi (saat)"
                  subtitle={`Son ${range} gün`}
                  empty={rows.time.length === 0}
                  headers={['Ders', 'Süre']}
                  rows={rows.time.map((r) => [rowLabel(r), formatDuration(r.totalSeconds)])}
                >
                  <SubjectTimeBars
                    rows={rows.time}
                    highlightId={highlightId}
                    ariaLabel={`Son ${range} günde derse göre çalışma süresi`}
                  />
                </ChartCard>
              </>
            )}
          </div>
            </>
          )}
        </div>
      )}
      {!view && !error && <p className="muted">Yükleniyor…</p>}
    </section>
  );
}
