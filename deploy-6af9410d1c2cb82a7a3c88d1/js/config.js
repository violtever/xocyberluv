/* ==========================================================================
   ✦ LITTLE WORLD — CẤU HÌNH / CONFIGURATION
   --------------------------------------------------------------------------
   Đây là file DUY NHẤT bạn cần sửa để cá nhân hoá website.
   This is the ONLY file you need to edit to personalise the site.

   • Ảnh / images  → public/assets/images/
   • Âm thanh / audio → public/assets/audio/  (sfx/, music/, voice/)
   Đường dẫn (path) luôn tính từ thư mục public/, ví dụ "assets/images/avatar.jpg".
   ========================================================================== */

export const CONFIG = {
  /* ---------- 1. MÀU SẮC CHỦ ĐẠO / THEME COLOURS -------------------------- */
  theme: {
    deep: "#1d4ed8",      // xanh biển đậm — headings, strong accents
    primary: "#3b82f6",   // xanh biển — buttons, progress bar
    sky: "#7cc4ff",       // xanh da trời nhạt
    cyan: "#5ee7f2",      // xanh cyan — glow
    ice: "#e6f6ff",       // xanh băng — panels
    lavender: "#b9b4ff",  // một chút lavender
    pink: "#ffb8d9",      // điểm nhấn nhỏ (hearts, blush)
    ink: "#1e2a4a",       // màu chữ
  },

  /* ---------- 2. THÔNG TIN CHÍNH / PROFILE -------------------------------- */
  profile: {
    displayName: "xocyberluv",
    nickname: "@xocyberluv",
    // Thay ảnh: bỏ file vào assets/images/ rồi đổi tên ở đây (jpg/png/webp/svg đều được)
    avatar: "assets/images/avatar.svg",
    tagline: "collecting soft songs, rainy afternoons & tiny pixel things ☂",
    // Trạng thái: click vào chip trạng thái trên trang để đổi qua lại
    statuses: [
      { label: "online", emoji: "●", color: "#34d399" },
      { label: "listening to music", emoji: "♫", color: "#60a5fa" },
      { label: "chilling in the rain", emoji: "☂", color: "#a5b4fc" },
      { label: "daydreaming", emoji: "☁", color: "#f9a8d4" },
    ],
    tags: ["INFP", "night owl", "rain lover", "pixel collector"],
  },

  /* ---------- 3. ABOUT ME ------------------------------------------------- */
  about: [
    { label: "Name", value: "xocyberluv" },
    { label: "Nickname", value: "xocyberluv" },
    { label: "Birthday", value: "June 09" },
    { label: "Pronouns", value: "he / him" },
    { label: "Location", value: "Hà Nội, Việt Nam" },
    { label: "Personality", value: "quiet at first, then a lot of rambling about songs" },
    { label: "Hobbies", value: "making playlists, film photos, doodling, cafe hopping" },
    { label: "Interests", value: "K-pop, y2k web design, cozy games, rainy-day aesthetics" },
  ],

  /* ---------- 4. MY INTERESTS (card lật khi click) -------------------------
     icon: music | movies | games | camera | art | sparkle | heart | star | cloud */
  interests: [
    { icon: "music", title: "Music", blurb: "my whole personality, honestly",
      details: ["dreamy K-pop & city pop", "late-night lo-fi", "making mood playlists"] },
    { icon: "movies", title: "Movies", blurb: "soft films with pretty colours",
      details: ["coming-of-age stories", "Studio-style animation", "rainy-day rewatches"] },
    { icon: "games", title: "Games", blurb: "cozy & slow-paced worlds",
      details: ["life sims", "puzzle games", "anything with cute pixel art"] },
    { icon: "camera", title: "Photography", blurb: "chasing light through windows",
      details: ["film cameras", "blue-hour skies", "raindrops on glass"] },
    { icon: "art", title: "Art", blurb: "doodles in every notebook margin",
      details: ["digital painting", "stickers & zines", "pastel colour palettes"] },
    { icon: "sparkle", title: "Other things", blurb: "tiny joys collection",
      details: ["stationery", "bubble tea reviews", "collecting phone charms"] },
  ],

  /* ---------- 5. MY FAVORITES (bộ sưu tập mini) ----------------------------
     hue: màu bìa (0–360). Bỏ trống thì tự sinh màu. */
  favorites: {
    "Artists": [
      { title: "CHUU", sub: "soloist · forever comfort", hue: 205 },
      { title: "LOONA", sub: "group · the orbit era", hue: 230 },
      { title: "IU", sub: "soloist · lyric queen", hue: 260 },
      { title: "Lucy", sub: "band · summer energy", hue: 190 },
    ],
    "Albums": [
      { title: "Only Cry in the Rain", sub: "CHUU", hue: 200 },
      { title: "Howl", sub: "CHUU", hue: 215 },
      { title: "[&]", sub: "LOONA", hue: 250 },
      { title: "Palette", sub: "IU", hue: 280 },
    ],
    "Songs": [
      { title: "Heart Attack", sub: "CHUU", hue: 340 },
      { title: "Howl", sub: "CHUU", hue: 210 },
      { title: "Butterfly", sub: "LOONA", hue: 195 },
      { title: "Blueming", sub: "IU", hue: 220 },
    ],
    "Characters": [
      { title: "Cinnamoroll", sub: "cloud puppy", hue: 200 },
      { title: "Totoro", sub: "big fluffy friend", hue: 180 },
      { title: "Kiki", sub: "delivery witch", hue: 265 },
    ],
    "Aesthetics": [
      { title: "Rainy windows", sub: "blur & droplets", hue: 205 },
      { title: "Y2K desktop", sub: "pop-ups & pixels", hue: 190 },
      { title: "Ice blue", sub: "cold but soft", hue: 195 },
      { title: "Cloudcore", sub: "pastel skies", hue: 240 },
    ],
  },

  /* ---------- 6. SOCIAL LINKS ---------------------------------------------
     icon: camera | note | play | headphones | chat | mail | code | heart */
  socials: [
    { label: "Instagram", handle: "@little.rainie", url: "https://instagram.com/", icon: "camera" },
    { label: "TikTok", handle: "@rainie.wav", url: "https://tiktok.com/", icon: "note" },
    { label: "YouTube", handle: "rainie's room", url: "https://youtube.com/", icon: "play" },
    { label: "Spotify", handle: "my playlists", url: "https://open.spotify.com/", icon: "headphones" },
    { label: "Discord", handle: "rainie#0420", url: "https://discord.com/", icon: "chat" },
    { label: "Email", handle: "say hello", url: "mailto:hello@example.com", icon: "mail" },
  ],

  /* ---------- 7. EXTRA: STATUS, FACTS, MESSAGE ---------------------------- */
  currentStatus: {
    mood: "soft & sleepy",
    doing: "redesigning my little corner of the internet",
    weather: "light rain, 24°C (perfect)",
    socialBattery: 68, // 0–100
  },
  facts: [
    "I can fall asleep to the sound of rain in under 5 minutes.",
    "My camera roll is 40% sky photos.",
    "I name every houseplant after a song.",
    "Blue is my favourite colour, but specifically the 6pm-in-July kind.",
    "I've kept a playlist for every month since 2019.",
    "I always order the drink with the prettiest colour.",
    "I collect tiny charms and hang them on everything.",
  ],
  visitorMessage: {
    from: "Rainie",
    subject: "a little note for you ♡",
    body: [
      "Hi, thank you for wandering into my little world!",
      "This place is a small collection of the things that make me feel soft: songs, rain, skies and tiny pixels.",
      "Take your time, click around, and if something here made you smile, that already makes my day.",
      "Stay cozy and drink some water, okay? ☂",
    ],
  },

  /* ---------- 8. ÂM THANH / AUDIO -----------------------------------------
     Thay file trong assets/audio/ rồi cập nhật đường dẫn ở đây (mp3/ogg/wav/m4a). */
  audio: {
    // Giọng nói giới thiệu — phát 1 lần ở màn hình Welcome.
    // Bỏ file vào assets/audio/voice/ rồi ghi đường dẫn, ví dụ "assets/audio/voice/intro.mp3".
    // Để "" (trống) nếu chưa có → nút giọng nói sẽ tự ẩn.
    voiceIntro: "",
    voiceVolume: 1,

    // Nhạc nền — có thể thêm nhiều bài (tự chuyển bài kế tiếp).
    music: [
      { title: "little world lullaby", artist: "placeholder track", src: "assets/audio/music/little-world-lullaby.wav" },
      // { title: "Tên bài", artist: "Ca sĩ", src: "assets/audio/music/my-song.mp3" },
    ],
    musicVolume: 0.45,

    // Hiệu ứng âm thanh (ngắn, nhẹ). Để "" để tắt từng âm.
    sfx: {
      click: "assets/audio/sfx/click.wav",
      hover: "assets/audio/sfx/hover.wav",
      transition: "assets/audio/sfx/transition.wav",
      notification: "assets/audio/sfx/notification.wav",
    },
    sfxVolume: 0.5,
    hoverSound: false, // true = bật tiếng khi rê chuột lên card (không bắt buộc)
  },

  /* ---------- 9. KHÁC / MISC ---------------------------------------------- */
  siteTitle: "Rainie's little world",
  osName: "little world OS",
  // "auto" = dùng Netlify Image CDN cho ảnh jpg/png khi chạy trên Netlify
  imageCDN: "auto",
};
