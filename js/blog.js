/* ============================================================
   SHABRAN ASSOCIATES — Artikel & Perkongsian Fiqh
   ------------------------------------------------------------
   CARA TAMBAH ARTIKEL BARU:
   1. Tambah objek baru dalam senarai ARTICLES di bawah
   2. formatCover: gunakan warna kecerunan seperti contoh
      atau ganti "g:forest" dengan url gambar: "i:images/artikel1.jpg"
   3. Imej: letakkan fail dalam folder images/ dan guna "i:images/nama.jpg"
   ============================================================ */

const ARTICLES = [
  {
    id: "hibah-vs-wasiat",
    category: "Harta Pusaka",
    icon: "&#127978;",
    format: "g:golddeep",
    date: "12 Ogos 2026",
    title: "Hibah & Wasiat: Apa Bezanya dan Mana Sesuai Untuk Anda?",
    excerpt: "Ramai yang keliru antara hibah dan wasiat. Kedua-duanya adalah instrumen perancangan harta — tetapi berbeza dari segi hukum, proses dan masa ia berkuat kuasa.",
    content: "<p>Dalam perancangan harta menurut Islam, <b>hibah</b> dan <b>wasiat</b> sering menjadi pilihan utama masyarakat. Namun ramai yang masih keliru tentang perbezaan antara keduanya.</p><h3>Apa itu Hibah?</h3><p>Hibah ialah pemberian sesuatu harta secara sukarela oleh seseorang kepada orang lain <b>semasa hayatnya</b>, tanpa balasan. Hibah boleh dibuat kepada sesiapa sahaja termasuk anak, isteri, saudara, malah institusi. Kebaikan utama hibah ialah ia mengelakkan harta daripada terlibat dalam proses faraid dan pentadbiran pusaka yang panjang.</p><h3>Apa itu Wasiat?</h3><p>Wasiat pula adalah pengisytiharan pemberian harta yang <b>baru berkuat kuasa selepas kematian</b>. Menurut hukum syarak, wasiat hanya dibenarkan kepada bukan waris dan tidak melebihi satu pertiga (1/3) daripada keseluruhan harta, kecuali mendapat persetujuan semua waris.</p><h3>Panduan Ringkas</h3><ul style=\"padding-left:20px;list-style:disc;color:var(--ink-soft)\"><li>Harta untuk anak/isteri yang layak faraid → <b>hibah</b> (elak proses pusaka lama)</li><li>Derma kepada bukan waris / amal jariah → <b>wasiat</b> (had 1/3)</li><li>Kedua-duanya perlu didokumenkan dengan betul di sisi undang-undang agar tidak dipertikaikan</li></ul><p><i>Setiap keluarga mempunyai keadaan yang berbeza. Dapatkan nasihat khusus mengikut situasi anda.</i></p>"
  },
  {
    id: "faraid-pembahagian-pusaka",
    category: "Faraid",
    icon: "&#128203;",
    format: "g:forest",
    date: "5 Ogos 2026",
    title: "Faraid: Memahami Hak Setiap Waris Dalam Pembahagian Pusaka",
    excerpt: "Pembahagian faraid ditetapkan Allah dengan hikmah yang mendalam. Memahaminya lebih awal membantu keluarga membuat persediaan tanpa perselisihan.",
    content: "<p>Faraid adalah kaedah pembahagian harta pusaka yang telah ditetapkan oleh Allah SWT dalam Al-Quran. Ia bukan sekadar peraturan — ia menjamin keadilan hak setiap waris mengikut kedudukan mereka dalam keluarga.</p><h3>Waris Yang Berhak</h3><p>Waris dibahagikan kepada dua kategori utama: <b>waris fardhu</b> (menerima bahagian tetap seperti suami, isteri, ibu, anak perempuan) dan <b>waris asabah</b> (menerima baki selepas waris fardhu). Bahagian setiap waris ditentukan dengan teliti berdasarkan hubungan nasab dan perkahwinan.</p><h3>Mengapa Perlu Merancang?</h3><p>Apabila seseorang meninggal dunia tanpa perancangan, harta akan melalui proses pentadbiran pusaka yang mungkin mengambil masa berbulan-bulan hingga bertahun. Harta seperti tanah, rumah dan wang simpanan akan dibekukan sementara menunggu sijil faraid dikeluarkan.</p><p>Melalui perancangan awal (hibah, wasiat, atau dokumentasi yang lengkap), keluarga anda boleh mengelakkan kesulitan ini.</p><p><i>Panduan ini adalah maklumat am — sila rujuk peguam syarie untuk pengiraan yang tepat mengikut kes anda.</i></p>"
  },
  {
    id: "proses-perceraian-syarie",
    category: "Kekeluargaan",
    icon: "&#128110;",
    format: "g:deep",
    date: "28 Julai 2026",
    title: "Proses Perceraian di Mahkamah Syariah: Apa Yang Perlu Anda Tahu",
    excerpt: "Perceraian bukan sekadar lafaz — ia melibatkan prosedur mahkamah, dokumentasi dan hak-hak yang perlu dijaga kedua-dua pihak.",
    content: "<p>Perceraian adalah antara perkara yang paling berat dalam hidup seseorang. Sebagai peguam syarie, saya sering melihat klien yang tertekan bukan kerana keputusan itu sendiri, tetapi kerana <b>tidak memahami proses</b> yang bakal dilalui.</p><h3>Bentuk-Bentuk Perceraian</h3><p>Secara umumnya, perceraian di Mahkamah Syariah boleh berlaku melalui beberapa cara: <b>cerai taklik</b> (pelanggaran syarat yang ditaklikkan), <b>cerai talak</b> (lafaz oleh suami), <b>fasakh</b> (pembubaran oleh mahkamah atas sebab yang dibenarkan), dan <b>khuluk</b> (tebus talak dengan bayaran oleh isteri).</p><h3>Perkara Penting Dalam Proses Ini</h3><ul style=\"padding-left:20px;list-style:disc;color:var(--ink-soft)\"><li>Dokumentasi lafaz cerai mesti didaftarkan di Mahkamah Syariah dalam tempoh yang ditetapkan</li><li>Hak-hak seperti <b>nafkah eddah</b>, <b>harta sepencarian</b> dan <b>hak penjagaan anak</b> perlu dituntut dengan betul</li><li>Kegagalan mendaftarkan perceraian boleh membawa implikasi undang-undang yang serius</li></ul><p>Nasihat saya: jangan lalui proses ini seorang diri. Dapatkan bimbingan peguam supaya hak anda dan anak-anak terpelihara.</p>"
  },
  {
    id: "hak-penjagaan-anak",
    category: "Kekeluargaan",
    icon: "&#128106;",
    format: "g:emerald",
    date: "19 Julai 2026",
    title: "Hak Penjagaan Anak (Hadanah): Kepentingan Anak Terdahulu",
    excerpt: "Dalam kes perceraian, persoalan hak penjagaan anak adalah yang paling menyentuh hati. Bagaimana mahkamah menentukan hadanah?",
    content: "<p>Hadhanah atau hak penjagaan anak adalah antara isu paling sensitif dalam perceraian. Di sebalik pertelingkahan antara ibu bapa, prinsip utama yang dipegang mahkamah adalah <b>kebajikan dan kepentingan anak itu sendiri</b>.</p><h3>Prinsip Asas Hadanah</h3><p>Menurut Enakmen Undang-Undang Keluarga Islam di kebanyakan negeri, ibu lebih utama untuk menjaga anak lelaki sehingga umur mumaiyiz (biasanya 7 tahun) dan anak perempuan sehingga umur baligh — dengan syarat ibu berkelayakan dari segi agama, akhlak dan kebolehan menjaga.</p><h3>Faktor Yang Dinilai Mahkamah</h3><ul style=\"padding-left:20px;list-style:disc;color:var(--ink-soft)\"><li>Kebajikan dan kehendak anak (jika sudah mumaiyiz)</li><li>Kelayakan ibu bapa dari aspek agama, moral dan kesihatan</li><li>Keupayaan menyediakan pendidikan dan persekitaran yang selamat</li><li>Keadaan sosio-ekonomi kedua-dua pihak</li></ul><p>Hak penjagaan tidak menghalang pihak yang tidak mendapat penjagaan daripada <b>hak lawatan dan akses</b> kepada anak. Komunikasi yang baik antara ibu bapa selepas perceraian memberi kesan yang amat besar kepada perkembangan anak.</p>"
  },
  {
    id: "nafkah-hak-isteri",
    category: "Kekeluargaan",
    icon: "&#128176;",
    format: "g:golddeep",
    date: "10 Julai 2026",
    title: "Nafkah: Hak Isteri dan Tanggungjawab Suami Menurut Syarak",
    excerpt: "Nafkah bukan pemberian budi — ia hak yang ditetapkan syarak. Fahami jenis-jenis nafkah dan bagaimana ia dituntut di mahkamah.",
    content: "<p>Dalam Islam, nafkah adalah <b>kewajipan suami</b> dan <b>hak isteri</b>. Ia bukan ihsan atau budi bicara, tetapi tanggungjawab yang telah ditetapkan oleh syarak dan diperkuatkan oleh undang-undang keluarga Islam.</p><h3>Jenis-Jenis Nafkah</h3><ul style=\"padding-left:20px;list-style:disc;color:var(--ink-soft)\"><li><b>Nafkah semasa perkahwinan</b> — makanan, pakaian, tempat tinggal dan keperluan asas</li><li><b>Nafkah eddah</b> — nafkah selepas perceraian dalam tempoh eddah</li><li><b>Nafkah anak</b> — tanggungjawab berterusan sehingga anak dewasa atau berkahwin</li><li><b>Mut'ah</b> — pemberian saguhati kepada isteri yang diceraikan tanpa sebab yang wajar</li></ul><h3>Menuntut Nafkah di Mahkamah</h3><p>Jika nafkah tidak dibayar, isteri boleh memfailkan tuntutan di Mahkamah Syariah. Mahkamah akan menilai kadar nafkah berdasarkan status sosial, kemampuan suami dan keperluan isteri. Tunggakan nafkah juga boleh dituntut dan dikenakan tindakan penguatkuasaan.</p><p><i>Jika anda menghadapi isu nafkah, berbincanglah dengan peguam syarie untuk memahami hak anda dengan tepat.</i></p>"
  },
  {
    id: "harta-sepencarian",
    category: "Harta",
    icon: "&#127969;",
    format: "g:forest",
    date: "2 Julai 2026",
    title: "Harta Sepencarian: Hak yang Sering Disalahfaham",
    excerpt: "Harta sepencarian bukan sekadar rumah dan kereta — ia merangkumi sumbangan tidak langsung yang sering tidak didokumenkan.",
    content: "<p>Harta sepencarian adalah harta yang diperoleh oleh suami isteri <b>secara bersama</b> sepanjang tempoh perkahwinan melalui usaha dan sumbangan kedua-dua pihak — termasuk sumbangan tidak langsung seperti menjaga rumah tangga dan membesarkan anak.</p><h3>Apa Yang Termasuk?</h3><p>Mahkamah melihat kepada sumbangan <b>langsung</b> (kewangan) dan <b>tidak langsung</b> (bukan kewangan seperti pengurusan rumahtangga). Rumah, kereta, perniagaan, simpanan dan juga KWSP boleh dianggap sebagai harta sepencarian bergantung kepada cara ia diperoleh.</p><h3>Kenapa Perlu Dokumentasi?</h3><p>Ramai pasangan tidak menyimpan rekod pembelian dan pembayaran. Apabila berlaku perceraian atau kematian, isu timbul kerana tiada bukti. Saranan saya: simpan rekod kewangan dengan sistematik dan, jika perlu, buat perjanjian yang jelas bagi harta-harta utama.</p><p><i>Setiap kes dinilai berdasarkan fakta tersendiri. Rujuk peguam untuk tuntutan yang betul.</i></p>"
  }
];

/* ---------- Render ---------- */
function blogCover(style) {
  if (style && style.indexOf("i:") === 0) {
    return '<img src="' + style.slice(2) + '" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" onerror="this.remove()">';
  }
  const g = {
    golddeep: "linear-gradient(135deg,#8a6a2b,#c9a24b 60%,#e8c76a)",
    forest: "linear-gradient(135deg,#0a0a0a,#1a1a1a 60%,#2b2b2b)",
    deep: "linear-gradient(135deg,#0a0a0a,#111111 55%,#1a1a1a)",
    emerald: "linear-gradient(135deg,#111111,#232323 55%,#3a3a3a)"
  }[style] || "linear-gradient(135deg,#111111,#1a1a1a)";
  return '<div style="position:absolute;inset:0;background:' + g + '"></div>';
}

function blogCard(a, delay) {
  return '<article class="blog-card reveal" data-delay="' + (delay || 0) + '">' +
    '<div class="blog-cover" style="background:linear-gradient(135deg,#111111,#1a1a1a)">' +
    blogCover(a.format) +
    '<span class="ico">' + a.icon + '</span>' +
    '<span class="cat">' + a.category + '</span>' +
    '</div>' +
    '<div class="blog-body">' +
    '<span class="date">' + a.date + '</span>' +
    '<h3>' + a.title + '</h3>' +
    '<p>' + a.excerpt + '</p>' +
    '<a class="more" href="blog.html?artikel=' + a.id + '">Baca Selanjutnya <span class="arr">&#8594;</span></a>' +
    '</div></article>';
}

function renderBlogList() {
  const grid = $("#blogList");
  if (!grid) return;
  grid.innerHTML = ARTICLES.map(function (a, i) {
    return blogCard(a, i % 3);
  }).join("");
  initReveal();
}

/* ---------- Paparan artikel penuh ---------- */
function renderArticle(id) {
  const a = ARTICLES.filter(function (x) { return x.id === id; })[0];
  if (!a) return false;

  document.title = a.title + " | Shabran Associates";
  const hero = $(".page-hero");
  if (hero) {
    hero.querySelector("h1").textContent = a.title;
    hero.querySelector("p").textContent = a.category + " &bull; " + a.date;
  }

  const section = document.querySelector(".section .container");
  if (section) {
    section.innerHTML =
      '<article style="background:var(--paper);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow-md);padding:clamp(28px,5vw,64px);max-width:820px;margin:0 auto">' +
      '<div style="display:flex;gap:14px;align-items:center;margin-bottom:26px;flex-wrap:wrap">' +
      '<span style="background:linear-gradient(135deg,var(--forest),var(--deep));color:var(--gold-light);padding:7px 16px;border-radius:999px;font-size:12px;letter-spacing:1.6px;text-transform:uppercase;font-weight:600">' + a.category + '</span>' +
      '<span style="font-size:12.5px;color:var(--ink-soft);letter-spacing:1px">' + a.date + '</span>' +
      '</div>' +
      '<h1 style="font-family:var(--serif);font-size:clamp(30px,4vw,42px);color:var(--deep);line-height:1.15;margin-bottom:22px">' + a.title + '</h1>' +
      '<div class="ornament" style="justify-content:flex-start;margin-bottom:30px"><span class="ln"></span><span>&#10022;</span></div>' +
      '<div style="color:var(--ink-soft);line-height:2;font-size:16px">' +
      a.content +
      '</div>' +
      '<div style="margin-top:40px;padding-top:26px;border-top:1px solid var(--line);text-align:center">' +
      '<p style="font-size:13px;color:var(--ink-soft);margin-bottom:16px">Perlukan nasihat khusus untuk kes anda?</p>' +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' +
      '<a href="booking.html" class="btn btn-gold btn-sm">&#128197; Tempah Konsultasi</a>' +
      '<a href="blog.html" class="btn btn-ghost btn-sm">&#8592; Semua Artikel</a>' +
      '</div></div></article>';
  }
  return true;
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const params = new URLSearchParams(window.location.search);
  const artId = params.get("artikel");
  if (artId) {
    if (!renderArticle(artId)) renderBlogList();
  } else {
    renderBlogList();
  }
});
