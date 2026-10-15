# CLAUDE.md

## Proje

Gül Defteri: yalnızca üniversite dersleri için kişisel çalışma takip sitesi. `ders-takip` projesinin üniversite kısmından ayrıldı. Tasarım: toz pembe renk düzeni, beyaz lale ve gül motifleri. Kendim kullanacağım ve GitHub profilimde portfolyo projesi olarak duracak.

## Temel Özellikler

- Pomodoro zamanlayıcı
- Günlük çalışma süresi kaydı (ders/konu bazında)
- Dersler (dönemiyle) ve konular
- Grafiklerle ilerleme takibi (günlük, haftalık, ders ve konu bazında)
- Ana sayfada son 7 günün gül bahçesi

### Kapsam Dışı (şimdilik YAPILMAYACAK)

- Soru kaydı, test kitabı takibi, YKS/DGS hedefleri (bunlar `ders-takip` projesinde kalır)

## Kullanıcı Hakkında

- Bilgisayar programcılığı 2. sınıf öğrencisi, kodlamaya yeni başlıyor.
- Hedef: projeyi hem bitirmek hem de yaparken öğrenmek.
- Açıklamalar sade olmalı; jargon kullanılırsa kısaca açıklanmalı.

## Çalışma Kuralları

### İletişim

- Her zaman **Türkçe** cevap ver.
- Kod içindeki değişken ve fonksiyon isimleri İngilizce olabilir, **yorumlar Türkçe** olsun.
- Önemli kararları ve nedenini kısaca açıkla, kullanıcı öğrensin.

### İlerleme

- **Küçük adımlarla** ilerle. Bir seferde **tek bir özellik** üzerinde çalış.
- Yeni teknoloji eklemeden önce seçenekleri artı ve eksileriyle anlat, kararı birlikte ver.

### Git

- Çalışan her adımdan sonra **anlamlı bir mesajla commit** at.
- Çalışmayan veya test edilmemiş hâli commit'leme.

### Güvenlik

- API anahtarı, şifre gibi gizli bilgileri **asla koda yazma**.
- Gizli bilgiler için `.env` kullan ve `.env` dosyasını `.gitignore`'a ekle. Repoya örnek olarak `.env.example` konabilir (gerçek değer içermeden).

### Dokümantasyon

- Proje GitHub'da görüneceği için **README.md'yi güncel tut** (ne yaptığı, nasıl kurulur/çalıştırılır, özellikler).

### Doğrulama

- Bir şey "bitti" demeden önce **çalıştırıp test et**; sonucu dürüstçe bildir.

## Teknoloji ve Komutlar

### Teknoloji yığını

Sunucusuz, tamamen statik bir web uygulaması (PWA olarak yayınlanacak): React + Vite, React Router `HashRouter`, veriler tarayıcıda IndexedDB'de, elle çizilmiş SVG grafikler (kütüphanesiz), `@fontsource` ile gömülü yazı tipleri (Cormorant Garamond, Figtree), Vitest (test). Renkler `client/src/rose.css`, çiçek çizimleri `client/src/components/Flowers.jsx`.

### Komutlar (proje kökünden)

- `npm install`: bağımlılıkları kurar (npm workspace: `client`).
- `npm run dev`: Vite geliştirme sunucusu (`http://localhost:5173`).
- `npm run build` / `npm run preview`: derler (`client/dist`) / derlenmiş hâli dener (`http://localhost:4173`).
- `npm test`: tüm testler.

### Klasör yapısı

- `client/src/`: `pages/`, `components/`, `hooks/`, `context/` (Pomodoro sayacı, yedek klasörü), `lib/` (saf yardımcılar), `data/` (tarayıcıdaki veritabanı katmanı). Testler `client/tests/` (veri katmanı testleri `client/tests/data/`).
- `client/src/data/`: `database.js` (`createDatabase(storage)`), `storage.js` (IndexedDB ve bellek içi depo), `router.js` + `routes/` (eski API uçlarının yerel karşılığı), `validation.js`, `stats.js`, `seed.js`.
- `client/src/api.js`: `apiFetch('/api/...')` çağrıları aynen duruyor; artık sunucuya değil yerel veritabanına gider. Sayfalar bu yüzden değişmedi.

### Proje kuralları (kodda uyulan)

- **Doğrulama veri katmanındadır** (`client/src/data/`). Arayüz kontrolleri yalnızca kolaylıktır; her girdiyi veri katmanı Türkçe mesajla reddeder (`HttpError` 400 → `ApiError`).
- **Gün sınırı yereldir:** çalışma kayıtları UTC saklanır, istatistikler yerel güne (`sessionDay`) göre gruplanır.
- **Önce test:** veri katmanı mantığı ve saf arayüz fonksiyonları için önce başarısız test yazılır. Sayfaların görünümü tarayıcıda gerçekten açılıp denenir (testler görsel hataları yakalamaz).
- Silinen konuya bağlı kayıtlar silinmez, bağlantıları boşalır (veri katmanı bağlantıyı `null` yapar). Kaydı olan ders silinmez.
- **Hedef her zaman üniversitedir** (`DEFAULT_TRACK = "uni"`, `client/src/lib/tracks.js`). Veri katmanı `yks`/`dgs` derslerini yalnızca `ders-takip` yedekleri yüklenebilsin diye tanır: saklanır ama listelenmez. Hazır ders listesi yüklenmez; dersleri kullanıcı ekler.
- **Depolama adları `gul-` ile başlar** (IndexedDB, localStorage, önbellek): aynı alan adındaki `ders-takip` ile karışmasın.
- **Renk yazılmaz:** bileşenler yalnızca `rose.css` değişkenlerini kullanır; açık (toz pembe, varsayılan) ve koyu (gece gülü) tema.
