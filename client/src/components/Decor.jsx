import { useLocation } from 'react-router-dom';
import { Bouquet, CornerVine, FallenPetals, RoseBud, RoseStem, TulipPair, WhiteTulip } from './Flowers.jsx';

// Sayfaya göre çiçek düzeni: [sağ üst, sağ orta, sağ alt, sol üst, sol alt, sol menü altı].
// Beyaz laleler ve güller sırayla yer değiştirir; her sayfada aynı aile, farklı dizilim.
const BY_PAGE = {
  '/': [RoseStem, FallenPetals, TulipPair, WhiteTulip, RoseBud, Bouquet],
  '/pomodoro': [WhiteTulip, RoseBud, FallenPetals, RoseStem, TulipPair, WhiteTulip],
  '/gunluk': [TulipPair, FallenPetals, RoseStem, RoseBud, WhiteTulip, RoseStem],
  '/konular': [RoseBud, WhiteTulip, Bouquet, TulipPair, RoseStem, WhiteTulip],
  '/ilerleme': [RoseStem, TulipPair, FallenPetals, WhiteTulip, RoseBud, Bouquet],
  '/ayarlar': [Bouquet, FallenPetals, WhiteTulip, RoseBud, TulipPair, RoseStem],
};

// Süsler yalnızca içerik kutusunun DIŞINDAKİ boş kenar boşluklarında durur: sabit konum ve CSS'te
// ekran genişliği/yüksekliği şartları (dar ekranda gizlenir) sayesinde veri, form ve grafiklerin
// üstüne binmez. Dört köşede gül dalı, kenar boşluklarında sayfaya özel çiçekler bulunur.
export default function Decor() {
  const { pathname } = useLocation();
  const key = pathname.startsWith('/ilerleme') ? '/ilerleme' : pathname;
  const [R1, R2, R3, L1, L2, S] = BY_PAGE[key] ?? BY_PAGE['/'];

  return (
    <div className="decor" aria-hidden="true">
      <span className="decor-item corner corner-tl">
        <CornerVine />
      </span>
      <span className="decor-item corner corner-tr">
        <CornerVine />
      </span>
      <span className="decor-item corner corner-bl">
        <CornerVine />
      </span>
      <span className="decor-item corner corner-br">
        <CornerVine />
      </span>

      <span className="decor-item slot slot-r1">
        <R1 size={76} />
      </span>
      <span className="decor-item slot slot-r2">
        <R2 size={76} />
      </span>
      <span className="decor-item slot slot-r3">
        <R3 size={76} />
      </span>
      <span className="decor-item slot slot-l1">
        <L1 size={64} />
      </span>
      <span className="decor-item slot slot-l2">
        <L2 size={64} />
      </span>
      <span className="decor-item slot slot-side">
        <S size={60} />
      </span>
    </div>
  );
}
