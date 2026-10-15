import { useEffect } from 'react';
import { Link, Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { BackupProvider } from './context/BackupContext.jsx';
import { PomodoroProvider, usePomodoro } from './context/PomodoroContext.jsx';
import { formatTime } from './lib/pomodoro.js';
import { requestPersistence } from './lib/persistence.js';
import Settings from './pages/Settings.jsx';
import Home from './pages/Home.jsx';
import Pomodoro from './pages/Pomodoro.jsx';
import StudyLog from './pages/StudyLog.jsx';
import Topics from './pages/Topics.jsx';
import Progress from './pages/Progress.jsx';
import ProgressSubject from './pages/ProgressSubject.jsx';
import Decor from './components/Decor.jsx';
import { useTheme } from './hooks/useTheme.js';

import {
  HomeIcon,
  MoonIcon,
  LogIcon,
  ProgressIcon,
  SettingsIcon,
  SunIcon,
  TimerIcon,
  TopicsIcon,
} from './components/Icons.jsx';

// Menü öğeleri: her yeni sayfa eklendiğinde buraya bir satır ve aşağıya bir <Route> eklenir
const NAV_ITEMS = [
  { to: '/', label: 'Ana Sayfa', short: 'Ana', Icon: HomeIcon },
  { to: '/pomodoro', label: 'Pomodoro', short: 'Sayaç', Icon: TimerIcon },
  { to: '/gunluk', label: 'Çalışma Günlüğü', short: 'Günlük', Icon: LogIcon },
  { to: '/konular', label: 'Dersler ve Konular', short: 'Dersler', Icon: TopicsIcon },
  { to: '/ilerleme', label: 'İlerleme', short: 'İlerleme', Icon: ProgressIcon },
  { to: '/ayarlar', label: 'Ayarlar', short: 'Ayarlar', Icon: SettingsIcon },
];

// Menü bağlantıları
function NavLinks() {
  return NAV_ITEMS.map(({ to, label, short, Icon }) => (
    <NavLink key={to} to={to} end={to === '/'} title={label}>
      <Icon />
      <span className="nav-label">{label}</span>
      <span className="nav-short">{short}</span>
    </NavLink>
  ));
}

// Sayaç çalışırken başka sayfadayken de kalan süreyi menüde gösterir
function NavTimer() {
  const { phase, remaining } = usePomodoro();
  if (!phase) return null;
  return (
    <Link to="/pomodoro" className="nav-timer">
      {phase.kind === 'work' ? 'Çalışma' : 'Mola'} {formatTime(remaining)}
    </Link>
  );
}

// Menüdeki site adı ve altında kısa açıklama
function Brand() {
  return (
    <span className="brand">
      Gül Defteri
      <span className="brand-track">Üniversite ders takibi</span>
    </span>
  );
}

// Sayfalar. Kaldırılmış eski adreslerle (soru kaydı, kaynaklar) gelinirse ana sayfaya dönülür.
function Pages() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pomodoro" element={<Pomodoro />} />
      <Route path="/gunluk" element={<StudyLog />} />
      <Route path="/konular" element={<Topics />} />
      <Route path="/ilerleme" element={<Progress />} />
      <Route path="/ilerleme/ders/:subjectId" element={<ProgressSubject />} />
      <Route path="/ayarlar" element={<Settings />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();
  // Açılışta kalıcı depolama izni istenir (sonuç Ayarlar sayfasında gösterilir)
  useEffect(() => {
    requestPersistence();
  }, []);
  const goingLight = theme === 'dark';
  const toggleLabel = goingLight ? 'Açık temaya geç' : 'Koyu temaya geç';
  return (
    <BackupProvider>
    <PomodoroProvider>
      <nav className="nav" aria-label="Ana menü">
        <div className="brand-row">
          <Brand />
          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={toggleLabel}
            title={toggleLabel}
          >
            {goingLight ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
        <NavLinks />
        <NavTimer />
      </nav>
      <Decor />
      <main className="page">
        <Pages />
      </main>
    </PomodoroProvider>
    </BackupProvider>
  );
}
