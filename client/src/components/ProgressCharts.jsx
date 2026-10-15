import { subjectLabel } from '../lib/tracks.js';
import { useEffect, useRef, useState } from 'react';
import { labelIndexes, niceTicks } from '../lib/scale.js';
import { formatDuration } from '../lib/format.js';

// İlerleme sayfasının grafikleri: Chart.js yerine elle çizilmiş SVG.
// Ortak kurallar: ince çizgi ve çubuklar, sessiz ızgara, metinler metin renginde,
// veri ucu yuvarlak, parçalar arasında 2px boşluk, üzerine gelince ayrıntı balonu.

const HEIGHT = 280;
const numberTr = (n) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });

// Kapsayıcının genişliğini izler: SVG her zaman tam genişlikte, bozulmadan çizilir
function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    setWidth(el.clientWidth);
    const observer = new ResizeObserver(() => setWidth(el.clientWidth));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

// Üstü yuvarlak, tabanı düz dikey çubuk
function columnPath(x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + radius} Q${x},${y} ${x + radius},${y} H${x + w - radius} Q${x + w},${y} ${x + w},${y + radius} V${y + h} Z`;
}

// Sağ ucu yuvarlak, tabanı düz yatay çubuk
function rowPath(x, y, w, h, r) {
  const radius = Math.min(r, h / 2, w);
  return `M${x},${y} H${x + w - radius} Q${x + w},${y} ${x + w},${y + radius} V${y + h - radius} Q${x + w},${y + h} ${x + w - radius},${y + h} H${x} Z`;
}

// Üzerine gelince çıkan ayrıntı balonu (HTML: metin düzgün sarılır, SVG'den bağımsız)
function Tip({ tip, width }) {
  if (!tip) return null;
  const left = Math.min(Math.max(tip.x, 8), Math.max(width - 168, 8));
  return (
    <div className="chart-tip" style={{ left, top: Math.max(tip.y - 8, 0) }} role="presentation">
      <span className="chart-tip-title">{tip.title}</span>
      {tip.lines.map((line) => (
        <span key={line.label ?? line.text} className="chart-tip-line">
          {line.color && <i style={{ background: line.color }} />}
          {line.label ? `${line.label}: ` : ''}
          <b>{line.text}</b>
        </span>
      ))}
    </div>
  );
}

// Yatay ızgara çizgileri ve sol eksen yazıları (dikey çubuk ve çizgi grafikleri için)
function ValueGrid({ ticks, y, left, right, format }) {
  return ticks.map((t) => (
    <g key={t}>
      <line x1={left} x2={right} y1={y(t)} y2={y(t)} className={t === ticks[0] ? 'axis-line' : 'grid-line'} />
      <text x={left - 8} y={y(t) + 4} textAnchor="end" className="axis-text">
        {format(t)}
      </text>
    </g>
  ));
}

function CategoryLabels({ labels, x, baseline, maxLabels }) {
  return labelIndexes(labels.length, maxLabels).map((i) => (
    <text key={i} x={x(i)} y={baseline + 18} textAnchor="middle" className="axis-text">
      {labels[i]}
    </text>
  ));
}

// Süre sütunları: Günlük (dakika) ve Haftalık (saat). `seconds` saniyedir.
export function DurationColumns({ labels, seconds, unit, ariaLabel }) {
  const [ref, width] = useWidth();
  const [tip, setTip] = useState(null);
  const [hover, setHover] = useState(null);

  const divisor = unit === 'saat' ? 3600 : 60;
  const values = seconds.map((s) => s / divisor);
  const { max, ticks } = niceTicks(Math.max(...values, 0), { count: 4 });
  const m = { top: 20, right: 8, bottom: 28, left: 36 };
  const plotW = Math.max(width - m.left - m.right, 10);
  const plotH = HEIGHT - m.top - m.bottom;
  const band = plotW / values.length;
  const barW = Math.min(Math.max(band * 0.42, 3), 12);
  const y = (v) => m.top + plotH - (v / max) * plotH;
  const x = (i) => m.left + band * i + band / 2;
  const peak = values.indexOf(Math.max(...values));

  return (
    <div ref={ref} className="svg-chart" onMouseLeave={() => (setTip(null), setHover(null))}>
      {width > 0 && (
        <svg width={width} height={HEIGHT} role="img" aria-label={ariaLabel}>
          <ValueGrid ticks={ticks} y={y} left={m.left} right={width - m.right} format={numberTr} />
          {values.map((v, i) => {
            const h = Math.max(plotH - (y(v) - m.top), 0);
            return (
              <g key={i}>
                {v > 0 && (
                  <path
                    d={columnPath(x(i) - barW / 2, y(v), barW, h, 3)}
                    className={hover === i ? 'mark mark-hover' : 'mark'}
                    fill="var(--series-1)"
                  />
                )}
                <rect
                  x={m.left + band * i}
                  y={m.top}
                  width={band}
                  height={plotH}
                  fill="transparent"
                  onMouseEnter={() => {
                    setHover(i);
                    setTip({
                      x: x(i) + 10,
                      y: Math.max(y(v), m.top + 64), // uzun çubukta balon grafik alanında kalsın
                      title: labels[i],
                      lines: [{ text: formatDuration(seconds[i]) }],
                    });
                  }}
                />
              </g>
            );
          })}
          {values[peak] > 0 && hover === null && (
            <text x={x(peak)} y={y(values[peak]) - 7} textAnchor="middle" className="value-text">
              {formatDuration(seconds[peak])}
            </text>
          )}
          <CategoryLabels labels={labels} x={x} baseline={m.top + plotH} maxLabels={Math.floor(plotW / 52)} />
        </svg>
      )}
      <Tip tip={tip} width={width} />
    </div>
  );
}

// Yatay çubuk satırları için ortak yerleşim: sol tarafta ders adları, sağda değer
function useRows(count, width) {
  const rowH = 34;
  const labelW = width < 460 ? 108 : 150;
  return {
    rowH,
    labelW,
    height: Math.max(count * rowH + 8, 60),
    plotLeft: labelW + 8,
    plotRight: Math.max(width - 64, labelW + 40),
  };
}

function RowLabel({ text, y, labelW, dim }) {
  // Uzun ders adları sığmazsa kısaltılır (tam adı balonda ve tabloda var)
  const max = Math.floor(labelW / 7);
  const shown = text.length > max ? `${text.slice(0, max - 1)}…` : text;
  return (
    <text x={labelW} y={y} textAnchor="end" className={dim ? 'axis-text dim' : 'row-text'}>
      {shown}
    </text>
  );
}

// Ders bazında süre: 8 ders olduğu için halka yerine yatay çubuk. Seçili ders varsa o vurgulanır.
export function SubjectTimeBars({ rows, highlightId, ariaLabel }) {
  const [ref, width] = useWidth();
  const [tip, setTip] = useState(null);
  const [hover, setHover] = useState(null);
  const layout = useRows(rows.length, width);
  const maxSeconds = Math.max(...rows.map((r) => r.totalSeconds), 1);
  const plotW = layout.plotRight - layout.plotLeft;

  return (
    <div ref={ref} className="svg-chart" onMouseLeave={() => (setTip(null), setHover(null))}>
      {width > 0 && (
        <svg width={width} height={layout.height} role="img" aria-label={ariaLabel}>
          {rows.map((r, i) => {
            const cy = i * layout.rowH + layout.rowH / 2 + 4;
            const w = Math.max((r.totalSeconds / maxSeconds) * plotW, 2);
            const faded = highlightId && r.subjectId !== highlightId;
            const name = subjectLabel(r.subjectName, r.examType);
            return (
              <g key={r.subjectId}>
                <RowLabel text={name} y={cy + 4} labelW={layout.labelW} dim={faded} />
                <path
                  d={rowPath(layout.plotLeft, cy - 4, w, 8, 4)}
                  fill={faded ? 'var(--series-dim)' : 'var(--series-1)'}
                  className={hover === i ? 'mark mark-hover' : 'mark'}
                />
                <text x={layout.plotLeft + w + 8} y={cy + 4} className="value-text">
                  {formatDuration(r.totalSeconds)}
                </text>
                <rect
                  x="0"
                  y={i * layout.rowH + 4}
                  width={width}
                  height={layout.rowH}
                  fill="transparent"
                  onMouseEnter={() => {
                    setHover(i);
                    setTip({
                      x: layout.plotLeft + w + 12,
                      y: cy,
                      title: name,
                      lines: [{ text: formatDuration(r.totalSeconds) }],
                    });
                  }}
                />
              </g>
            );
          })}
        </svg>
      )}
      <Tip tip={tip} width={width} />
    </div>
  );
}
