// Gül Defteri'nin çiçek çizimleri: beyaz laleler ve güller (hazır ikon paketi yok, hepsi elle çizildi).
// Ortak dil: ince gül kurusu kontur (--ink), lale yaprakları beyaz, güller toz pembe tonlarında,
// sap ve yapraklar adaçayı yeşili. Renkler CSS değişkenlerinden gelir (rose.css), açık/koyu temaya uyar.
// Gül ayrıntıları: sarmal iç taç, katlanan dış yapraklar, çanak yapraklar, testere dişli yaprak
// kenarları, sapta dikenler ve düşmüş taç yaprakları.

function Botanical({ width, height, viewBox, children, className = '' }) {
  return (
    <svg
      className={`flower ${className}`}
      viewBox={viewBox}
      width={width}
      height={height}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

// --- Parçalar (başka çizimlerin içinde tekrar kullanılır) ---

// Testere dişli gül yaprağı: (0,0) noktasından sağa doğru uzanır; ortada damar ve yan damarlar
export function RoseLeaf({ x = 0, y = 0, rotate = 0, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path
        className="leaf"
        d="M0 0 C3 -5 8 -7.5 12 -7 L13 -8.6 L14.6 -6.6 L16.4 -7.2 L17.2 -5.4 L19.4 -5 L19.4 -3.2 L21.6 -2.2 L21 -0.6 L23 0 L21 0.8 L21.4 2.6 L19.2 3 L18.8 4.8 L16.6 4.8 L15.6 6.4 L13.6 5.8 L12 7 C8 7.4 3 5 0 0 Z"
      />
      <path className="vein" d="M0 0 L21 0 M7 0 L10 -4 M11 0 L14 -4.4 M15 0 L17.6 -3 M7 0 L10 4 M11 0 L14 4.2 M15 0 L17.6 3" />
    </g>
  );
}

// Sapta küçük, kancalı diken
function Thorn({ x, y, flip = false }) {
  const d = flip ? `M${x} ${y} L${x + 3.4} ${y - 1.6} L${x} ${y + 1.4}` : `M${x} ${y} L${x - 3.4} ${y - 1.6} L${x} ${y + 1.4}`;
  return <path className="thorn" d={d} />;
}

// Açmış gül başı, merkezi (0,0), yarıçapı ~15. stage: 'bud' | 'half' | 'full'
// deep: daha koyu gül (bugünün gülü gibi vurgular için)
export function RoseHead({ x = 0, y = 0, scale = 1, stage = 'full', deep = false }) {
  const tone = deep ? ' deep' : '';
  if (stage === 'bud') {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <path className={`petal-rose${tone}`} d="M0 -13 C-7 -6 -8 4 0 8 C8 4 7 -6 0 -13 Z" />
        <path className="ink-fine" d="M-4 2 C-2 -3 1 -6 1 -11" />
        <path className="sepal" d="M0 9 C-5 6 -8 1 -8 -5 C-5 -1 -3 2 0 4 C3 2 5 -1 8 -5 C8 1 5 6 0 9 Z" />
      </g>
    );
  }
  if (stage === 'half') {
    return (
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <path className={`petal-rose${tone}`} d="M-10 -8 C-9 -15 -2 -16 0 -12 C2 -16 9 -15 10 -8 C11 2 6 8 0 8 C-6 8 -11 2 -10 -8 Z" />
        <path className={`petal-rose-light${tone}`} d="M-5 -7 C-4 -12 4 -12 5 -7 C4 -4 -4 -4 -5 -7 Z" />
        <path className="ink-fine" d="M-10 -6 C-6 0 6 0 10 -6 M-7 3 C-3 6 3 6 7 3" />
        <path className="sepal" d="M-6 7 L-11 13 L-2 9 Z M6 7 L11 13 L2 9 Z M0 8 L0 13" />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* Arka taç yaprakları: kenarları hafif dışa kıvrık */}
      <path className={`petal-rose${tone}`} d="M-15 -2 C-17 -11 -10 -16 -4 -14 C-2 -18 6 -18 8 -13 C14 -15 18 -8 15 -2 Z" />
      {/* Dış çanak: gülün kâse biçimi */}
      <path
        className={`petal-rose${tone}`}
        d="M-16 -3 C-16 9 -8 15 0 15 C8 15 16 9 16 -3 C12 2 6 4 0 2 C-6 4 -12 2 -16 -3 Z"
      />
      {/* İç taç ve sarmal */}
      <path className={`petal-rose-light${tone}`} d="M-9 -4 C-9 -11 -3 -13 1 -12 C7 -11 9 -6 8 -2 C5 2 -5 2 -9 -4 Z" />
      <path className="ink-fine" d="M-4 -5 C-4 -9 1 -10 3 -8 C5 -6 4 -3 1 -3 C-1 -3 -2 -5 0 -6.5" />
      {/* Katlanan yaprak kenarları */}
      <path className="ink-fine" d="M-14 0 C-9 7 -3 8 0 8 C3 8 9 7 14 0 M-9 9 C-4 12 4 12 9 9 M-16 -3 C-12 -1 -9 -2 -8 -4 M16 -3 C12 -1 9 -2 8 -4" />
      {/* Çanak yapraklar */}
      <path className="sepal" d="M-5 14 L-12 20 L-1 16 Z M5 14 L12 20 L1 16 Z M0 15 L-1 21 L2 16 Z" />
    </g>
  );
}

// Beyaz lale başı: tabanı (0,0)'da, yukarı doğru ~26 birim
export function TulipHead({ x = 0, y = 0, scale = 1, rotate = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      {/* Arkadaki orta yaprak */}
      <path className="petal-white back" d="M-6 -16 C-4 -22 -1 -26 0 -27 C1 -26 4 -22 6 -16 C4 -12 -4 -12 -6 -16 Z" />
      {/* Kâse */}
      <path className="petal-white" d="M-11 -20 C-12 -9 -8 0 0 0 C8 0 12 -9 11 -20 C8 -16 4 -15 2 -18 C0 -14 -4 -14 -11 -20 Z" />
      {/* Öndeki yaprak */}
      <path className="petal-white" d="M-6 -19 C-7 -9 -4 -1 0 0 C4 -1 7 -9 6 -19 C4 -16 2 -15 0 -20 C-2 -15 -4 -16 -6 -19 Z" />
      <path className="ink-fine" d="M0 -16 L0 -3 M-3 -12 C-3 -8 -2 -5 -1 -3 M3 -12 C3 -8 2 -5 1 -3" />
    </g>
  );
}

// --- Kenar boşluklarındaki çizimler ---

// Tek beyaz lale, uzun yapraklarıyla
export const WhiteTulip = ({ size = 76 }) => (
  <Botanical width={size} height={size * 1.5} viewBox="0 0 64 96">
    <path className="stem" d="M32 32 C31 50 33 70 32 94" />
    <path className="leaf" d="M31 92 C20 80 15 62 18 46 C25 58 29 72 32 84 Z" />
    <path className="vein" d="M31 88 C24 76 20 62 19 50" />
    <path className="leaf" d="M33 94 C43 86 49 72 47 56 C41 68 36 78 33 88 Z" />
    <TulipHead x={32} y={34} scale={1.05} />
  </Botanical>
);

// İki beyaz lale, biri hafif eğik
export const TulipPair = ({ size = 76 }) => (
  <Botanical width={size} height={size * 1.5} viewBox="0 0 64 96">
    <path className="stem" d="M24 36 C25 54 28 74 30 94" />
    <path className="stem" d="M44 44 C42 60 36 78 32 94" />
    <path className="leaf" d="M29 92 C16 82 10 66 13 50 C20 62 25 76 30 86 Z" />
    <path className="leaf" d="M33 94 C46 88 54 74 52 60 C45 72 39 82 33 88 Z" />
    <TulipHead x={24} y={38} rotate={-8} />
    <TulipHead x={44} y={46} rotate={10} scale={0.9} />
  </Botanical>
);

// Dikenli sapıyla açmış gül
export const RoseStem = ({ size = 76 }) => (
  <Botanical width={size} height={size * 1.5} viewBox="0 0 64 96">
    <path className="stem" d="M32 44 C30 58 34 74 31 94" />
    <Thorn x={31.2} y={54} />
    <Thorn x={32.6} y={66} flip />
    <Thorn x={32.2} y={80} />
    <RoseLeaf x={31.6} y={60} rotate={-150} scale={0.95} />
    <RoseLeaf x={32.8} y={72} rotate={-28} scale={0.9} />
    <RoseLeaf x={31.4} y={86} rotate={-160} scale={0.7} />
    <RoseHead x={32} y={26} scale={1.05} />
  </Botanical>
);

// Gonca: henüz açmamış gül
export const RoseBud = ({ size = 64 }) => (
  <Botanical width={size} height={size * 1.5} viewBox="0 0 64 96">
    <path className="stem" d="M32 40 C33 58 30 76 33 94" />
    <Thorn x={32.6} y={56} flip />
    <Thorn x={31.4} y={72} />
    <RoseLeaf x={32.4} y={64} rotate={-30} scale={0.85} />
    <RoseLeaf x={31.8} y={80} rotate={-155} scale={0.75} />
    <RoseHead x={32} y={30} scale={1.2} stage="bud" />
  </Botanical>
);

// Düşmüş gül yaprakları
export const FallenPetals = ({ size = 64 }) => (
  <Botanical width={size} height={size} viewBox="0 0 64 64">
    <path className="petal-rose" d="M14 20 C10 12 18 6 24 10 C28 14 24 22 14 20 Z" />
    <path className="ink-fine" d="M15 18 C18 15 21 13 23 11" />
    <path className="petal-rose-light" d="M36 34 C34 26 44 24 47 30 C49 36 42 40 36 34 Z" />
    <path className="ink-fine" d="M37 33 C40 31 43 30 46 30" />
    <path className="petal-rose" d="M18 46 C16 40 24 38 26 42 C28 47 22 50 18 46 Z" />
    <path className="petal-rose-light" d="M44 52 C44 48 49 47 50 50 C51 53 47 55 44 52 Z" />
  </Botanical>
);

// Vazoda gül ve laleler (Ayarlar gibi sakin sayfalar için)
export const Bouquet = ({ size = 76 }) => (
  <Botanical width={size} height={size * 1.5} viewBox="0 0 64 96">
    <path className="stem" d="M32 64 C30 52 22 44 20 34" />
    <path className="stem" d="M32 64 C33 50 34 40 33 28" />
    <path className="stem" d="M32 64 C35 54 42 46 46 38" />
    <RoseLeaf x={27} y={50} rotate={-140} scale={0.6} />
    <RoseLeaf x={37} y={52} rotate={-40} scale={0.6} />
    <TulipHead x={20} y={36} rotate={-14} scale={0.8} />
    <TulipHead x={46} y={40} rotate={16} scale={0.8} />
    <RoseHead x={33} y={22} scale={0.85} />
    <path className="vase" d="M22 64 L42 64 C43 72 46 76 46 84 C46 91 40 94 32 94 C24 94 18 91 18 84 C18 76 21 72 22 64 Z" />
    <path className="ink-fine" d="M22 68 L42 68" />
  </Botanical>
);

// Köşe süsü: köşeden kıvrılan dikenli gül dalı, yaprakları ve ucunda gonca
export const CornerVine = ({ size = 92 }) => (
  <Botanical width={size} height={size} viewBox="0 0 100 100">
    <path className="stem" d="M4 4 C10 30 26 44 50 48 C66 50 76 58 80 70" />
    <path className="stem thin" d="M50 48 C44 58 46 70 54 76" />
    <Thorn x={18} y={30} flip />
    <Thorn x={36} y={44} />
    <Thorn x={66} y={53} flip />
    <RoseLeaf x={12} y={20} rotate={-20} scale={0.7} />
    <RoseLeaf x={28} y={39} rotate={120} scale={0.7} />
    <RoseLeaf x={58} y={49} rotate={-50} scale={0.6} />
    <RoseLeaf x={72} y={60} rotate={100} scale={0.55} />
    <RoseHead x={80} y={78} scale={0.62} stage="bud" />
    <RoseHead x={56} y={80} scale={0.5} stage="half" />
  </Botanical>
);

// --- Boş durumlar (büyük, sayfanın ortasında) ---

// Henüz grafik/kayıt yok: toprağa yeni dikilmiş lale ve gül
export const EmptyChart = ({ width = 180 }) => (
  <Botanical width={width} height={width * 0.7} viewBox="0 0 120 84">
    <path className="ground" d="M10 76 C30 72 90 72 110 76" />
    <path className="stem" d="M46 76 C45 60 47 46 46 34" />
    <path className="leaf" d="M45 74 C36 66 33 56 35 46 C40 54 43 62 46 70 Z" />
    <TulipHead x={46} y={36} />
    <path className="stem" d="M74 76 C75 66 73 56 74 48" />
    <Thorn x={74.4} y={64} flip />
    <RoseLeaf x={74} y={60} rotate={-30} scale={0.75} />
    <RoseHead x={74} y={42} stage="bud" />
  </Botanical>
);

// Henüz çalışma kaydı yok: açık defterin üstünde bir gül
export const EmptyNote = ({ width = 180 }) => (
  <Botanical width={width} height={width * 0.7} viewBox="0 0 120 84">
    <path className="paper" d="M14 60 C30 54 48 56 60 62 C72 56 90 54 106 60 L106 76 C90 70 72 72 60 78 C48 72 30 70 14 76 Z" />
    <path className="ink-fine" d="M60 62 L60 78 M22 64 C32 61 42 62 52 65 M68 65 C78 62 88 61 98 64" />
    <path className="stem" d="M30 56 C46 50 62 46 78 44" />
    <Thorn x={46} y={50.4} flip />
    <RoseLeaf x={56} y={47.6} rotate={-120} scale={0.7} />
    <RoseHead x={86} y={40} scale={0.85} />
  </Botanical>
);

// Derste konu yok: tek gonca
export const EmptyBook = ({ width = 180 }) => (
  <Botanical width={width} height={width * 0.7} viewBox="0 0 120 84">
    <path className="ground" d="M30 76 C50 73 70 73 90 76" />
    <path className="stem" d="M60 76 C59 62 61 50 60 40" />
    <Thorn x={60.4} y={60} flip />
    <RoseLeaf x={59.6} y={66} rotate={-150} scale={0.8} />
    <RoseLeaf x={60.6} y={54} rotate={-30} scale={0.7} />
    <RoseHead x={60} y={30} scale={1.1} stage="bud" />
  </Botanical>
);
