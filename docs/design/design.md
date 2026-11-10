[][]# Design System — Dark Lime SaaS / TrustData Reference

> **Purpose**: Dokumen ini menerjemahkan referensi visual website TrustData menjadi panduan desain yang dapat diimplementasikan. Fokusnya adalah karakter visual, sistem warna, tipografi, layout, komponen, pola dashboard, dan aturan responsif.
>
> **Interpretasi penting**: area lime yang mengapit website pada gambar referensi adalah latar/mockup presentasi. Kanvas website yang sebenarnya berwarna hampir hitam kehijauan. Jangan menerapkan lime sebagai warna latar seluruh halaman.

---

## 1. Design Direction

### 1.1 Karakter utama

Arah visual dapat dirangkum sebagai **Premium Dark SaaS with Organic Lime Accents**: antarmuka SaaS modern yang gelap, tenang, presisi, dan profesional, tetapi tidak terasa dingin karena diberi aksen hijau lime yang segar.

Kesan yang ingin dibangun:

- **Confident** — layout terstruktur, headline besar, dan dashboard yang langsung memperlihatkan kapabilitas produk.
- **Clear** — hierarki informasi mudah dipindai; headline, deskripsi, data, dan CTA memiliki peran yang jelas.
- **Intelligent** — grafik, status, statistik, dan mini-dashboard menjadi bagian dari bahasa visual, bukan dekorasi tambahan.
- **Fresh** — lime digunakan sebagai aksen energi dan penanda fokus, bukan sebagai warna yang mendominasi semua elemen.
- **Premium** — permukaan gelap, garis pembatas halus, ruang kosong yang cukup, dan efek glow yang terkontrol.

### 1.2 Prinsip desain

1. **Dark canvas first.** Mayoritas halaman menggunakan warna near-black dengan sedikit undertone hijau.
2. **Lime is a signal.** Gunakan lime untuk highlight kata, CTA utama, grafik aktif, ikon status, atau satu elemen fitur yang sengaja ditonjolkan.
3. **Product UI is the visual proof.** Grafik, kartu statistik, chips, dan panel produk membuktikan manfaat SaaS secara visual.
4. **Editorial typography.** Headline memiliki ukuran besar, bobot relatif ringan, dan line break yang direncanakan.
5. **Quiet surfaces.** Kartu tidak perlu memiliki bayangan tebal. Bedakan permukaan menggunakan pergeseran warna, border tipis, radius, dan sedikit glow.
6. **Alternating rhythm.** Variasikan section yang berorientasi pada headline, product preview, feature cards, dan daftar proses agar halaman panjang tidak monoton.
7. **One strong focal point per section.** Jangan memberi aksen lime penuh pada semua kartu sekaligus.

### 1.3 Yang perlu ditiru dan yang tidak

**Ambil sebagai pola visual:** dark-green canvas, lime accent, headline dua warna, dashboard preview, kartu analitik, section dua kolom, numbered process list, CTA panel lebar, serta footer multi-kolom.

**Jangan dianggap sebagai aturan wajib:** nama TrustData, copywriting, angka dashboard, label menu, atau detail bisnis yang terlihat di gambar. Ganti seluruh konten dengan konteks produk yang sedang dibangun. Jangan menyalin layout secara pixel-perfect; pertahankan prinsip visualnya.

---

## 2. Color System

Nilai warna berikut merupakan **perkiraan token hasil pembacaan screenshot**. Kompresi JPEG, glow, dan antialiasing dapat membuat piksel aktual sedikit berbeda. Gunakan token sebagai baseline, lalu lakukan penyesuaian berdasarkan contrast check di browser.

### 2.1 Core palette

| Token | Hex | Penggunaan |
|---|---|---|
| `color.page` | `#0B100C` | Background utama halaman; near-black dengan undertone hijau. |
| `color.surface` | `#101610` | Kartu dan panel dasar yang sedikit terangkat dari background. |
| `color.surface-raised` | `#171C16` | Panel interaktif, input, dropdown, atau area dashboard yang lebih menonjol. |
| `color.surface-soft` | `#1D231B` | Hover surface, panel sekunder, atau area chart yang sangat subtle. |
| `color.border` | `#252D22` | Border kartu dan pembatas antarkolom. Gunakan opacity rendah bila diperlukan. |
| `color.border-subtle` | `#1B211A` | Divider horizontal dan outline yang tidak boleh menarik perhatian. |
| `color.lime` | `#AEDA2D` | Aksen utama, tombol primary, highlighted words, dan data aktif. |
| `color.lime-hover` | `#BCEB3B` | Hover/focus pada elemen lime. Sedikit lebih terang dari warna utama. |
| `color.lime-muted` | `#64753E` | Aksen hijau redup, glow yang gelap, dan grafik sekunder. |
| `color.text-primary` | `#F0F2EC` | Headline, judul kartu, dan teks utama. |
| `color.text-secondary` | `#A8AFA2` | Paragraf, deskripsi, dan teks isi. |
| `color.text-muted` | `#747D70` | Metadata, label kecil, timestamp, dan keterangan sekunder. |
| `color.text-on-lime` | `#11160B` | Teks pada tombol atau kartu lime agar tetap terbaca. |
| `color.chart-neutral` | `#D9DED4` | Garis grafik, ikon netral, atau data pembanding. |

### 2.2 Color usage ratio

Sebagai patokan visual awal, bukan batas matematis:

- **75–85%**: background dan surface gelap.
- **10–18%**: putih/off-white dan teks abu-abu.
- **3–7%**: lime dan aksen hijau.

Lime harus terlihat cukup kuat untuk mengarahkan mata, tetapi tetap terasa spesial. Bila setiap tombol, ikon, border, dan kartu berwarna lime, hierarki akan hilang.

### 2.3 Background treatment

- Gunakan `#0B100C` sebagai warna dasar yang relatif rata.
- Tambahkan radial glow hijau yang sangat lembut di belakang hero atau bagian tertentu, misalnya `rgba(100, 117, 62, 0.18)` dengan blur besar.
- Glow boleh membentuk kesan halo atau horizon melengkung di belakang dashboard preview. Jangan membuatnya menjadi blob besar yang menutupi teks.
- Section biasa tidak harus memiliki gradient. Ruang gelap yang bersih merupakan bagian penting dari desain.
- Kartu gelap dibedakan dari background melalui surface sedikit lebih terang dan border tipis, bukan shadow hitam yang tidak terlihat.

### 2.4 Gradient dan glow

**Hero halo (arah visual):**

- Pusat cahaya ditempatkan di area bawah headline/di belakang dashboard preview.
- Warna inti dapat memakai lime yang telah diturunkan opacity-nya, lalu memudar ke transparent.
- Untuk kesan lengkung/horizon, gunakan radial gradient lebar atau pseudo-element berbentuk arc dengan blur.
- Pastikan gradient tidak mengurangi keterbacaan dashboard.

**CTA panel (arah visual):**

- Panel tetap dominan gelap.
- Beri vignette hijau-olive tipis pada sisi kiri dan kanan.
- Bagian tengah paling tenang agar judul dan tombol menjadi fokus.

---

## 3. Typography System

### 3.1 Karakter tipografi

Referensi menggunakan sans-serif modern dengan karakter **clean, geometric, dan sedikit humanist**. Bentuk hurufnya tidak terlalu dekoratif. Headline terlihat ringan hingga medium, bukan bold berat. Judul besar mengandalkan ukuran dan komposisi baris, bukan ketebalan ekstrem.

Jenis font persis tidak dapat dipastikan hanya dari screenshot. Pilih salah satu keluarga sans-serif modern yang memiliki bentuk bersih dan rendering bagus di berbagai ukuran, misalnya:

- **Geist Sans** — pilihan aman untuk UI SaaS modern.
- **Inter** — netral dan mudah dibaca.
- **Manrope** — sedikit lebih rounded dan ramah.
- **Plus Jakarta Sans** — alternatif dengan karakter modern dan proporsi nyaman.

Gunakan satu keluarga utama untuk seluruh UI. Jangan mencampurkan banyak font display yang membuat tampilan kehilangan konsistensi.

### 3.2 Weight dan hierarchy

| Role | Desktop guideline | Weight | Karakter |
|---|---:|---:|---|
| Hero headline | `clamp(2.8rem, 5vw, 4.5rem)` | 400–500 | Besar, rapat, 2–3 baris, highlight kata tertentu dengan lime. |
| Section headline | `clamp(2.2rem, 3.7vw, 3.5rem)` | 400–500 | Editorial, line-height rapat, alignment bervariasi. |
| Card heading | `1.15rem–1.45rem` | 500–600 | Jelas, ringkas, biasanya 1–2 baris. |
| Body copy | `0.9rem–1rem` | 400 | Tidak terlalu lebar; line-height 1.5–1.7. |
| Navigation | `0.8rem–0.9rem` | 450–500 | Ringkas dan low-profile. |
| Label / metadata | `0.68rem–0.78rem` | 500–600 | Secondary, tetap terbaca. |
| Button | `0.78rem–0.9rem` | 600 | Padat, pendek, kontras jelas. |

Angka di atas merupakan rekomendasi skala implementasi desktop, bukan hasil pengukuran font dari file sumber. Untuk mobile, gunakan `clamp()` atau breakpoint agar headline tidak meluber.

### 3.3 Headline treatment

Ciri paling kuat pada referensi adalah **headline dua warna**:

- Warna default: off-white.
- Kata/frasa yang membawa manfaat utama: lime.
- Lime disisipkan pada bagian kalimat, bukan seluruh judul.
- Line break disusun untuk menciptakan ritme dan fokus, bukan mengikuti lebar teks secara otomatis.
- Gunakan weight 400 atau 500. Hindari extra-bold yang membuat tampilan terasa seperti template marketing generik.

Contoh pola (gunakan hanya sebagai pola, bukan copy wajib):

```text
Smart Systems, [Highlighted Verb]
[Highlighted Outcome], Succeed Efficiently
```

### 3.4 Paragraphs

- Deskripsi hero memiliki lebar pendek, idealnya sekitar `45–60ch`.
- Paragraf section lebih nyaman jika sekitar `45–58ch`.
- Warna body copy lebih redup daripada headline, tetapi jangan terlalu gelap sampai gagal terbaca.
- Hindari paragraf panjang di dalam kartu. Gunakan 2–4 baris ringkas.
- Teks kecil pada dashboard boleh lebih padat karena berfungsi sebagai metadata, tetapi tetap harus terbaca saat diperbesar.

### 3.5 Text alignment

- Hero: center.
- Heading fitur: sering left-aligned untuk memberi rasa editorial.
- Heading value proposition: center.
- Process section: heading dan intro dapat memakai dua kolom.
- Footer: left-aligned per kolom.

---

## 4. Layout & Grid System

### 4.1 Overall page structure

Halaman menggunakan **single long-form landing page** dengan urutan konten yang jelas. Konten berada di satu container utama yang relatif sempit dibanding viewport, tetapi tetap memiliki ruang tepi yang nyaman.

Rekomendasi implementasi:

```css
.page-shell {
  width: min(100% - 3rem, 78rem);
  margin-inline: auto;
}

.section {
  padding-block: clamp(5rem, 9vw, 9rem);
}
```

- Maksimum lebar container desktop: sekitar `72rem–80rem`.
- Padding horizontal desktop: `2rem–3rem`.
- Padding horizontal mobile: `1.25rem–1.5rem`.
- Gunakan grid 12 kolom sebagai dasar, tetapi jangan memaksakan semua section menjadi 12 kolom yang sama.
- Ritme vertikal harus lega; jarak antarsection lebih besar daripada jarak antar elemen dalam satu section.

### 4.2 Header / navbar

**Komposisi:**

- Logo kecil di kiri.
- Menu utama berada di tengah atau sedikit ke kanan dari titik tengah.
- CTA utama berada di sisi kanan.
- Header berbentuk panel horizontal gelap, sangat tipis, dengan radius tinggi/capsule atau rounded rectangle.
- Tinggi relatif rendah; navbar bukan hero kedua.

**Styling:**

- Background gelap semi-solid.
- Border tipis dan subtle.
- Menu dalam ukuran kecil dan warna secondary.
- Item aktif boleh sedikit lebih terang.
- CTA navbar berukuran compact, bukan tombol besar.

**Responsive:**

- Tablet/mobile: ganti menu desktop dengan menu trigger.
- Jangan memaksa semua link tetap terlihat dalam satu baris.
- Jaga logo dan CTA/toggle tetap memiliki ruang sentuh yang cukup.

### 4.3 Hero section

Hero adalah pusat perhatian pertama dan memiliki urutan visual berikut:

1. Navbar compact.
2. Small eyebrow badge/pill dengan ikon kecil.
3. Headline besar, rata tengah, 2–3 baris.
4. Supporting copy pendek.
5. Dua CTA: primary lime dan secondary dark/outlined.
6. Dashboard preview yang melebar di bawah hero.
7. Halo/arc lime yang berada di belakang dashboard preview.

**Catatan layout:**

- Beri ruang atas dan bawah agar headline tidak terlalu dekat dengan navbar atau dashboard.
- Headline tidak boleh selebar viewport; batasi max-width agar line break terkontrol.
- Dashboard preview menjadi jembatan visual antara hero dan section berikutnya.
- Hindari menaruh ilustrasi stok besar yang tidak menjelaskan produk. Referensi lebih mengandalkan UI produk sebagai hero visual.

### 4.4 Dashboard preview strip

Preview awal terdiri dari tiga panel horizontal:

- Dua panel informasi/overview yang lebih kecil.
- Satu panel analytics/graph yang lebih lebar.

Gunakan proporsi yang tidak seragam, misalnya `1fr 1fr 1.55fr`. Setiap panel berisi:

- Icon atau label kecil.
- Judul singkat.
- Angka, deskripsi, atau grafik.
- Detail sekunder berwarna muted.

Panel chart dapat memuat area chart lime dengan garis/grid sangat tipis. Panel ini harus tetap terasa seperti produk sungguhan, bukan sekadar dekorasi.

### 4.5 Feature spotlight / two-column section

Section setelah hero memperlihatkan pola dua kolom:

- **Kolom kiri:** headline besar dengan highlighted phrases, body copy, dan CTA kecil.
- **Kolom kanan:** mini product interface, seperti chip kategori, panel input/response, dan dua kartu status/analytics.

Kolom kiri menjadi narasi; kolom kanan menjadi bukti produk.

Pada desktop, gunakan rasio kira-kira `0.9fr 1.1fr` atau `1fr 1fr`. Pada mobile, susun vertikal dengan heading lebih dahulu lalu interface preview.

### 4.6 Value proposition / feature cards

Section ini memiliki:

- Heading di tengah, 2 baris.
- Tiga kartu dengan lebar seimbang.
- Kartu pertama menjadi **featured card** dengan latar lime terang dan teks gelap.
- Kartu kedua dan ketiga tetap dark, masing-masing menampilkan visualisasi data.

Isi visual yang sesuai:

1. **Process / automation** — bar chart sederhana atau kolom bertingkat.
2. **Performance / analytics** — line chart terang di atas area gelap.
3. **Strategy / status** — donut chart dengan lime dan neutral green.

Jaga agar grafik menjadi ilustrasi sederhana yang mudah dibaca pada pandangan pertama. Jangan menambahkan grid, tick, legend, dan label terlalu banyak.

### 4.7 Process / journey section

Section ini menggabungkan intro dan daftar proses:

- Bagian intro menggunakan layout dua kolom: headline di kiri dan penjelasan/CTA di kanan.
- Small section tag dapat ditempatkan sebelum daftar.
- Daftar proses ditampilkan sebagai **numbered horizontal rows**.
- Setiap row memiliki nomor kecil di kiri, nama tahap besar di tengah, dan penjelasan singkat di kanan.
- Setiap row dipisahkan oleh garis tipis.
- Satu row aktif dapat menampilkan detail atau tombol tambahan, sementara row lain tetap ringkas.

Gunakan pola ini untuk alur 4–6 tahap. Jangan membungkus setiap row menjadi kartu terpisah; garis pemisah yang halus menghasilkan tampilan lebih editorial dan ringan.

### 4.8 CTA closing panel

Menjelang footer terdapat panel CTA lebar:

- Background dark dengan vignette hijau di sisi-sisi.
- Radius besar, tetapi tidak seperti pill.
- Headline center dengan beberapa kata lime.
- Deskripsi singkat.
- Satu tombol primary yang menonjol.
- Lebar penuh container dan tinggi cukup untuk memberi ruang napas.

Panel ini menjadi satu momen fokus yang kuat sebelum footer.

### 4.9 Footer

Footer menggunakan empat kelompok informasi:

1. Brand mark, deskripsi singkat, dan social links.
2. Menu navigasi.
3. Daftar layanan/fitur.
4. Informasi kontak.

Di bawahnya, gunakan divider tipis dan legal row dengan copyright serta policy links. Tipografi footer kecil dan muted, tetapi keterbacaan tetap dijaga.

Pada layar kecil, ubah grid menjadi dua kolom atau satu kolom. Jangan biarkan daftar footer terlalu rapat.

---

## 5. Component Styling

### 5.1 Buttons

**Primary button**

- Background: `color.lime`.
- Text: `color.text-on-lime`.
- Radius: pill atau rounded-full.
- Font: medium/semibold.
- Tinggi desktop: sekitar `2.5rem–3rem` untuk CTA standar.
- Padding horizontal cukup lebar; label tetap pendek.
- Hover: sedikit lebih terang, dapat disertai transform `translateY(-1px)`.
- Focus: visible outline dengan kontras yang cukup.

**Secondary button**

- Background: transparent atau `color.surface-raised`.
- Border: `color.border`.
- Text: off-white.
- Radius dan tinggi serupa primary.
- Hover: surface sedikit lebih terang.

**White/neutral action**

Pada beberapa bagian, tombol netral putih dipakai sebagai CTA sekunder pada baris proses. Gunakan hanya bila konteksnya memang membutuhkan kontras netral yang berbeda dari tombol utama.

### 5.2 Cards

- Radius rekomendasi: `0.85rem–1.15rem`.
- Border: `1px solid color.border` atau dengan opacity rendah.
- Background: `color.surface`.
- Padding konsisten, idealnya `1.25rem–1.75rem` pada desktop.
- Hindari shadow tebal.
- Hover card boleh sedikit naik atau border menjadi lebih terang, tetapi efek ini bukan kewajiban untuk semua kartu.

**Featured lime card:**

- Background `color.lime`.
- Text `color.text-on-lime`.
- Chart memakai kombinasi dark-green, translucent white, dan pale lime.
- Jangan gunakan white text pada lime jika contrast tidak cukup.

### 5.3 Pills, badges, and chips

- Bentuk capsule.
- Background gelap sedikit terangkat atau transparent.
- Border halus.
- Label kecil.
- Icon opsional dengan warna lime.
- Chip terpilih dapat menggunakan fill yang lebih terang; jangan semua chip memiliki status aktif.

### 5.4 Dashboard panels

- Panel tampak rapat, padat informasi, dan lebih teknis dibanding section marketing.
- Label kecil menggunakan uppercase bila cocok, tetapi jangan berlebihan.
- Angka utama lebih terang daripada metadata.
- Status aktif/positive menggunakan lime.
- Informasi nonaktif menggunakan gray/olive.
- Semua chart tetap memiliki ruang kosong yang cukup.

### 5.5 Data visualization

Gaya chart pada referensi bersifat minimal:

- **Area chart:** fill lime dengan opacity/gradient turun ke transparan; garis atas lebih terang.
- **Line chart:** stroke off-white atau lime, cukup tebal untuk terbaca; grid hampir tidak terlihat.
- **Bar chart:** bar vertical dengan variasi tinggi dan beberapa lapisan tone dark-to-light.
- **Donut chart:** ring tebal, satu segmen lime dominan, satu segmen muted green/gray.
- Legend minimal dan diletakkan dekat visualisasi.
- Gunakan data dummy yang masuk akal hanya untuk prototype; jangan menyajikan angka ilustratif sebagai data aktual.

### 5.6 Dividers and borders

- Gunakan 1px divider dengan warna `#1B211A` atau sejenis.
- Divider harus memisahkan konten tanpa membentuk grid yang terlalu dominan.
- Border kartu sedikit lebih terlihat daripada divider section.
- Jangan menggunakan garis putih terang untuk semua panel.

---

## 6. Spacing, Radius, and Sizing Tokens

Skala awal yang disarankan:

```css
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  --radius-sm: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-pill: 999px;
}
```

Aturan penggunaan:

- Komponen yang saling terkait: `0.5rem–1rem`.
- Padding kartu: `1.25rem–1.75rem`.
- Jarak antarkolom: `1rem–1.5rem`.
- Jarak antarsection: `5rem–9rem` berdasarkan ukuran layar.
- Gunakan satu sistem radius yang konsisten. Jangan mencampur radius tajam, pill, dan super-rounded tanpa alasan komposisi.

---

## 7. Motion & Interaction Direction

Screenshot adalah referensi statis; animasi aslinya **tidak dapat dipastikan** dari gambar. Arah berikut adalah rekomendasi implementasi yang selaras dengan karakter visualnya, bukan klaim bahwa animasi tersebut sudah ada pada website sumber.

### 7.1 Motion principles

- Halus, pendek, dan purposeful.
- Hindari animasi berlebihan yang mengganggu pembacaan dashboard.
- Utamakan opacity, transform kecil, dan perubahan border/background.
- Jangan membuat semua elemen bergerak secara bersamaan.

### 7.2 Suggested interactions

| Element | Interaction yang disarankan |
|---|---|
| Navbar | Background/border berubah sedikit saat scroll; menu memiliki hover state halus. |
| Primary CTA | Brightness naik dan bergerak 1–2px ke atas saat hover. |
| Hero dashboard | Reveal ringan saat halaman masuk; chart dapat dianimasikan sekali saat terlihat. |
| Feature cards | Hover lift kecil (`-2px` sampai `-4px`) dan border lebih jelas. |
| Chart | Bar/line masuk dengan durasi singkat; jangan loop tanpa tujuan. |
| Process rows | Active row memperlihatkan detail tambahan melalui height/opacity transition. |
| CTA panel | Glow bergerak sangat pelan atau tetap statis; jangan sampai mengalihkan fokus. |

### 7.3 Timing guidance

- Micro-interaction: `150–220ms`.
- Hover/focus transition: `180–260ms`.
- Section reveal: `350–650ms`.
- Stagger antarelemen: `50–100ms`.
- Gunakan easing seperti `cubic-bezier(0.22, 1, 0.36, 1)` untuk gerakan yang lembut.

Hormati `prefers-reduced-motion`. Dalam mode reduced motion, hilangkan parallax, gerakan dekoratif, dan animasi chart yang tidak esensial.

---

## 8. Responsive Behavior

### Desktop (≥ 1024px)

- Navbar lengkap.
- Hero centered dengan dashboard preview horizontal.
- Feature section dua kolom.
- Tiga kartu fitur dalam satu baris.
- Process rows menggunakan tiga zona: number, title, description.
- Footer empat kolom.

### Tablet (768px–1023px)

- Container dan spacing dipersempit.
- Hero preview dapat tetap horizontal dengan proporsi yang lebih rapat atau berubah menjadi dua panel.
- Section dua kolom boleh menggunakan rasio lebih seimbang.
- Tiga feature cards dapat menjadi dua kolom lalu satu kartu featured melebar.
- Footer menjadi dua kolom.

### Mobile (< 768px)

- Navbar berubah menjadi compact menu.
- Headline rata tengah dengan batas lebar yang aman.
- CTA dapat stack atau tetap inline hanya jika masing-masing masih nyaman disentuh.
- Dashboard preview ditata ulang menjadi stack atau carousel horizontal; jangan mengecilkan tiga panel desktop hingga teks tidak terbaca.
- Semua section dua kolom berubah menjadi satu kolom.
- Feature cards stack; featured card tetap menjadi satu-satunya kartu lime penuh.
- Process rows menjadi susunan number + title, dengan description di bawahnya.
- CTA panel tetap center dengan padding yang cukup.
- Footer menjadi satu kolom atau dua kolom yang rapi.

**Prinsip utama responsive:** pertahankan hierarki dan keterbacaan, bukan bentuk desktop secara paksa.

---

## 9. Accessibility & Quality Checks

- Pastikan teks body, label, dan tombol memiliki kontras yang memadai di atas permukaan gelap maupun lime.
- Jangan memakai warna sebagai satu-satunya indikator status; sertakan label, ikon, atau teks.
- Semua tombol, menu, dan chip interaktif harus dapat diakses dengan keyboard.
- Focus state harus terlihat jelas.
- Target sentuh mobile minimal sekitar `44px` untuk kontrol utama.
- Jangan membuat teks dashboard terlalu kecil hanya demi meniru kepadatan visual screenshot.
- Gunakan semantic heading hierarchy (`h1`, `h2`, `h3`) sesuai struktur halaman.
- Grafik harus memiliki label atau ringkasan tekstual yang menyampaikan informasi penting.
- Pastikan glow dekoratif tidak menurunkan keterbacaan.
- Periksa tampilan pada viewport sempit, zoom 200%, dan reduced-motion mode.

---

## 10. Do & Don't

### Do

- Gunakan background near-black kehijauan sebagai fondasi.
- Gunakan lime secara selektif untuk highlight yang punya makna.
- Buat headline besar dengan line break yang disengaja.
- Gunakan UI dashboard sebagai product proof.
- Variasikan layout antara centered, split-column, cards, dan process rows.
- Beri ruang kosong di antara section.
- Gunakan border tipis, chart minimal, dan glow yang subtle.
- Jaga konsistensi radius, spacing, serta warna teks.

### Don't

- Jangan memakai lime sebagai background seluruh website.
- Jangan memberi fill lime pada semua kartu.
- Jangan memakai glow besar di setiap section.
- Jangan membuat setiap section menjadi grid tiga kartu yang sama.
- Jangan memakai headline extra-bold secara berlebihan.
- Jangan memenuhi halaman dengan glassmorphism atau shadow tebal.
- Jangan memasukkan terlalu banyak data ke dashboard preview.
- Jangan mengecilkan font hingga tidak terbaca demi meniru screenshot yang ukurannya kecil.
- Jangan menganggap animasi tertentu sudah ada hanya karena screenshot memperlihatkan efek glow.

---

## 11. Implementation Starter Tokens

Berikut baseline CSS variables yang dapat langsung diterjemahkan ke CSS/Tailwind theme. Nilai dapat disesuaikan setelah melihat hasil di browser.

```css
:root {
  color-scheme: dark;

  --color-page: #0B100C;
  --color-surface: #101610;
  --color-surface-raised: #171C16;
  --color-surface-soft: #1D231B;
  --color-border: #252D22;
  --color-border-subtle: #1B211A;

  --color-accent: #AEDA2D;
  --color-accent-hover: #BCEB3B;
  --color-accent-muted: #64753E;

  --color-text-primary: #F0F2EC;
  --color-text-secondary: #A8AFA2;
  --color-text-muted: #747D70;
  --color-text-on-accent: #11160B;

  --font-sans: "Geist", "Inter", "Plus Jakarta Sans", sans-serif;

  --radius-card: 1rem;
  --radius-panel: 0.875rem;
  --radius-pill: 999px;

  --page-max-width: 78rem;
  --section-space: clamp(5rem, 9vw, 9rem);
}

html {
  background: var(--color-page);
}

body {
  margin: 0;
  background: var(--color-page);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.page-shell {
  width: min(calc(100% - 3rem), var(--page-max-width));
  margin-inline: auto;
}

.section {
  padding-block: var(--section-space);
}

.text-accent {
  color: var(--color-accent);
}

.surface-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
}
```

---

## 12. Page Blueprint at a Glance

| Order | Section | Layout | Visual priority |
|---:|---|---|---|
| 1 | Navbar | Compact horizontal bar | Logo, navigation, compact CTA |
| 2 | Hero | Centered | Eyebrow, two-tone headline, short copy, dual CTA |
| 3 | Dashboard preview | Three-panel horizontal strip | Overview cards + lime area chart + halo |
| 4 | Feature spotlight | Two columns | Editorial headline + product interface preview |
| 5 | Value proposition | Center heading + three cards | One lime featured card + two dark chart cards |
| 6 | Journey / process intro | Two columns | Headline on left, explanation and CTA on right |
| 7 | Process list | Numbered horizontal rows | Large stage names + subtle dividers |
| 8 | Closing CTA | Wide centered panel | Dark vignette, highlighted headline, primary CTA |
| 9 | Footer | Four columns + legal row | Brand summary, links, services, contact |

---

## 13. Handoff Notes for an AI Agent / Developer

Gunakan dokumen ini sebagai **visual source of truth** saat membangun landing page yang terinspirasi oleh referensi.

Sebelum implementasi:

1. Petakan setiap section ke komponen yang reusable.
2. Buat design tokens untuk warna, typography, spacing, radius, dan container.
3. Implementasikan struktur desktop terlebih dahulu, lalu adaptasi mobile tanpa mengorbankan keterbacaan.
4. Buat dashboard preview sebagai UI yang konsisten dengan sistem produk, bukan gambar dekoratif yang tidak relevan.
5. Pastikan lime hanya muncul pada elemen yang memiliki prioritas atau makna.
6. Periksa hasil pada browser dengan screenshot full-page dan viewport mobile.

Saat melakukan visual QA, nilai lima aspek ini:

- Apakah halaman tetap terasa dominan dark dan premium?
- Apakah lime berfungsi sebagai penuntun fokus, bukan warna dominan?
- Apakah headline dan section memiliki ritme editorial yang mirip referensi?
- Apakah dashboard preview terlihat seperti produk yang benar-benar bekerja?
- Apakah layout memiliki variasi dan whitespace yang cukup dari hero sampai footer?

**Target akhir:** tampilan SaaS yang rapi, modern, percaya diri, dan data-oriented; menggunakan dark green-black sebagai fondasi, lime sebagai aksen identitas, serta dashboard UI sebagai bukti utama kapabilitas produk.
