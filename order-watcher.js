/* ============================================================
   ORDER WATCHER — Notifikasi pop-up status pesanan real-time
   ============================================================
   Script ini otomatis "mendengarkan" perubahan status pesanan
   customer di Firestore, lalu menampilkan pop-up notifikasi di
   halaman manapun pada website ini (asal tab-nya masih terbuka).

   Cara kerja: setiap kali customer selesai memesan, ID pesanannya
   disimpan di localStorage (khusus di HP/browser dia sendiri).
   Selama tab website masih terbuka, script ini terus memantau
   status pesanan tsb ke Firestore dan menampilkan notifikasi
   begitu kasir mengubah statusnya.

   Catatan jujur: kalau customer benar-benar MENUTUP tab/browser-nya,
   notifikasi tidak akan muncul (ini keterbatasan website biasa,
   beda dengan aplikasi asli). Tapi selama tab dibiarkan terbuka
   di background, notifikasi tetap akan muncul.
   ============================================================ */

(function(){
  const STORAGE_KEY = 'ks_my_orders';
  const STATUS_CACHE_KEY = 'ks_order_status_cache';
  const MAX_AGE_MS = 24 * 60 * 60 * 1000; // simpan riwayat 24 jam

  function getMyOrders(){
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      const now = Date.now();
      const fresh = raw.filter(o => (now - o.createdAt) < MAX_AGE_MS);
      if(fresh.length !== raw.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    } catch(e){ return []; }
  }

  function getStatusCache(){
    try { return JSON.parse(localStorage.getItem(STATUS_CACHE_KEY) || '{}'); } catch(e){ return {}; }
  }
  function setStatusCache(cache){
    localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(cache));
  }

  const statusMsg = {
    processing: { icon:'☕', text:'sedang dibuat baristanya' },
    ready:      { icon:'✅', text:'siap diambil! Yuk ke kasir' },
    done:       { icon:'🎉', text:'sudah selesai. Terima kasih!' },
  };

  function ensureToastContainer(){
    let c = document.getElementById('ksToastContainer');
    if(!c){
      c = document.createElement('div');
      c.id = 'ksToastContainer';
      c.style.cssText = 'position:fixed; top:16px; right:16px; left:16px; z-index:99999; display:flex; flex-direction:column; align-items:flex-end; gap:10px; pointer-events:none;';
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(orderId, status){
    const info = statusMsg[status];
    if(!info) return;
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.style.cssText = `
      pointer-events:auto;
      max-width:380px; width:100%;
      background:#2A1810; color:#FBF3E5;
      border-radius:16px; padding:14px 16px;
      box-shadow:0 20px 45px rgba(0,0,0,0.35);
      font-family:'Plus Jakarta Sans', Arial, sans-serif;
      display:flex; align-items:center; gap:12px;
      cursor:pointer;
      transform:translateX(130%); transition:transform .45s cubic-bezier(.34,1.56,.64,1);
    `;
    toast.innerHTML = `
      <div style="font-size:26px; flex-shrink:0;">${info.icon}</div>
      <div style="flex:1; min-width:0;">
        <div style="font-weight:700; font-size:13.5px;">Pesanan #${orderId}</div>
        <div style="font-size:12.5px; opacity:0.82; margin-top:2px;">Pesananmu ${info.text}</div>
      </div>
      <div style="font-size:11px; opacity:0.55; flex-shrink:0;">✕</div>
    `;
    toast.addEventListener('click', () => {
      window.location.href = `cek-pesanan.html?id=${orderId}`;
    });
    container.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });

    setTimeout(() => {
      toast.style.transform = 'translateX(130%)';
      setTimeout(() => toast.remove(), 450);
    }, 7000);
  }

  function watchOrders(){
    if(typeof db === 'undefined') return; // firebase-config.js belum siap
    const orders = getMyOrders();
    const cache = getStatusCache();

    orders.forEach(o => {
      db.collection('orders').doc(o.id).onSnapshot((doc) => {
        if(!doc.exists) return;
        const status = doc.data().status || 'pending';
        const lastKnown = cache[o.id];

        if(status !== lastKnown){
          // Jangan pop-up untuk status 'pending' (baru dipesan, belum ada progres)
          // dan jangan pop-up di kunjungan pertama sebelum ada cache tersimpan.
          if(lastKnown !== undefined && status !== 'pending'){
            showToast(o.id, status);
          }
          cache[o.id] = status;
          setStatusCache(cache);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(watchOrders, 400); // beri jeda kecil biar firebase-config.js selesai load
  });

  // Dipanggil dari pesan.html setelah pesanan berhasil dibuat
  window.ksAddMyOrder = function(orderId){
    const orders = getMyOrders();
    orders.push({ id: orderId, createdAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    // langsung set cache awal ke 'pending' biar gak dobel notif nanti
    const cache = getStatusCache();
    cache[orderId] = 'pending';
    setStatusCache(cache);
  };
})();
