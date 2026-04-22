const DB_NAME    = 'KathmanduTransitDB';
const DB_VERSION = 3;

const STORE_ROUTES    = 'busRoutes';
const STORE_PENDING   = 'pendingRoutes';
const STORE_RECENT    = 'recentSearches';
const STORE_USERS     = 'users';
const STORE_COMMUNITY = 'communityPosts';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE_ROUTES))
        d.createObjectStore(STORE_ROUTES,  { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains(STORE_PENDING))
        d.createObjectStore(STORE_PENDING, { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains(STORE_RECENT))
        d.createObjectStore(STORE_RECENT,  { keyPath: 'id', autoIncrement: true });
      if (!d.objectStoreNames.contains(STORE_USERS))
        d.createObjectStore(STORE_USERS,   { keyPath: 'username' });
      if (!d.objectStoreNames.contains(STORE_COMMUNITY))
        d.createObjectStore(STORE_COMMUNITY, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function dbGetAll(db, storeName) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}
function dbGet(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readonly').objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}
function dbAdd(db, storeName, item) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).add(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}
function dbPut(db, storeName, item) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).put(item);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}
function dbDelete(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).delete(id);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}
function dbClear(db, storeName) {
  return new Promise((resolve, reject) => {
    const req = db.transaction(storeName, 'readwrite').objectStore(storeName).clear();
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

async function seedSampleRoutes(db) {
  const existing = await dbGetAll(db, STORE_ROUTES);
  if (existing.length > 0) return;
  const samples = [
    {
      name: "Bagbazar – Bhaktapur Bus Park",
      frequency: 8, status: 'approved', color: '#38bdf8',
      stops: [
        { lat: 27.7045, lon: 85.3140, name: "Bagbazar" },
        { lat: 27.6989, lon: 85.3189, name: "Maitighar" },
        { lat: 27.6967, lon: 85.3234, name: "Singha Durbar Gate" },
        { lat: 27.6945, lon: 85.3289, name: "Babarmahal" },
        { lat: 27.6923, lon: 85.3334, name: "Teku Dobhan" },
        { lat: 27.6901, lon: 85.3389, name: "Kalopul" },
        { lat: 27.6878, lon: 85.3445, name: "Sinamangal" },
        { lat: 27.6823, lon: 85.3556, name: "Airport Gate" },
        { lat: 27.6778, lon: 85.3634, name: "Koteshwor" },
        { lat: 27.6734, lon: 85.3756, name: "Tinkune" },
        { lat: 27.6712, lon: 85.3845, name: "Jadibuti" },
        { lat: 27.6689, lon: 85.3934, name: "Lokanthali" },
        { lat: 27.6667, lon: 85.4023, name: "Thimi Chowk" },
        { lat: 27.6645, lon: 85.4089, name: "Radheradhe" },
        { lat: 27.6623, lon: 85.4145, name: "Kamalbinayak" },
        { lat: 27.6601, lon: 85.4189, name: "Suryamadhi" },
        { lat: 27.6578, lon: 85.4256, name: "Bhaktapur Bus Park" },
      ]
    },
    {
      name: "Maitighar – Radheradhe (Thimi)",
      frequency: 12, status: 'approved', color: '#a78bfa',
      stops: [
        { lat: 27.6989, lon: 85.3189, name: "Maitighar" },
        { lat: 27.6945, lon: 85.3289, name: "Babarmahal" },
        { lat: 27.6923, lon: 85.3334, name: "Teku Dobhan" },
        { lat: 27.6878, lon: 85.3445, name: "Sinamangal" },
        { lat: 27.6823, lon: 85.3556, name: "Airport Gate" },
        { lat: 27.6778, lon: 85.3634, name: "Koteshwor" },
        { lat: 27.6734, lon: 85.3756, name: "Tinkune" },
        { lat: 27.6712, lon: 85.3845, name: "Jadibuti" },
        { lat: 27.6689, lon: 85.3934, name: "Lokanthali" },
        { lat: 27.6667, lon: 85.4023, name: "Thimi Chowk" },
        { lat: 27.6645, lon: 85.4089, name: "Radheradhe" },
      ]
    },
    {
      name: "Bagbazar – Koteshwor Express",
      frequency: 6, status: 'approved', color: '#34d399',
      stops: [
        { lat: 27.7045, lon: 85.3140, name: "Bagbazar" },
        { lat: 27.6989, lon: 85.3189, name: "Maitighar" },
        { lat: 27.6967, lon: 85.3234, name: "Singha Durbar Gate" },
        { lat: 27.6945, lon: 85.3289, name: "Babarmahal" },
        { lat: 27.6923, lon: 85.3334, name: "Teku Dobhan" },
        { lat: 27.6901, lon: 85.3389, name: "Kalopul" },
        { lat: 27.6878, lon: 85.3445, name: "Sinamangal" },
        { lat: 27.6823, lon: 85.3556, name: "Koteshwor" },
      ]
    },
    {
      name: "Ratna Park – Balaju",
      frequency: 10, status: 'approved', color: '#fb923c',
      stops: [
        { lat: 27.7045, lon: 85.3140, name: "Ratna Park" },
        { lat: 27.7089, lon: 85.3156, name: "Bhotahity" },
        { lat: 27.7125, lon: 85.3167, name: "Ason Tole" },
        { lat: 27.7172, lon: 85.3189, name: "Indrachowk" },
        { lat: 27.7223, lon: 85.3201, name: "Chabahil" },
        { lat: 27.7289, lon: 85.3156, name: "Balaju" },
      ]
    }
  ];
  for (const s of samples) { const id = await dbAdd(db, STORE_ROUTES, s); s.id = id; }
}

const SESSION_KEY = 'ktm_session';
function getSession()    { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; } }
function setSession(u) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function clearSession()  { sessionStorage.removeItem(SESSION_KEY); }
function requireRole(roles, redirectTo = 'login.html') {
  const s = getSession();
  if (!s || !roles.includes(s.role)) { window.location.href = redirectTo; return null; }
  return s;
}
function isLoggedIn() { return !!getSession(); }
async function seedUsers(_db) {  }

function waitForSupabase() {
  return new Promise(resolve => {
    if (window.sb) { resolve(window.sb); return; }
    window.addEventListener('supabase-ready', () => resolve(window.sb), { once: true });
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function showToast(msg, type='') {
  let t = document.getElementById('toast');
  if (!t) { t=document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className='toast'; }, 2800);
}