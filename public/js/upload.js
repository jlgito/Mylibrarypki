(function(){
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(r.error);
      r.readAsText(file);
    });
  }

  function detectTypeFromPage() {
    if (document.getElementById('pubList')) return 'pub';
    if (document.getElementById('privList')) return 'priv';
    return null;
  }

  async function handleAddLocalClick(ev) {
    ev.preventDefault();

    const input = document.getElementById('fileInput');
    if (!input || !input.files.length) {
      alert("Aucun fichier sélectionné");
      return;
    }

    const file = input.files[0];
    const pem = await readFileAsText(file);
    const filename = file.name;

    const desc = document.getElementById('preDesc')?.value || '';
    const tags = (document.getElementById('preTags')?.value || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    let typeField = document.getElementById('uploadType')?.value;
    let type = typeField || detectTypeFromPage() ||
      (filename.toLowerCase().includes('priv') || filename.toLowerCase().includes('key')
        ? 'priv'
        : 'pub');

    const payload = { filename, pem, type, description: desc, tags };

    // Détecter si le serveur API est joignable (utile si APP_MODE est encore en cache)
    let useServer = (window.APP_MODE === 'server');
    if (!useServer) {
      try {
        const ping = await fetch('api/stats.php', { cache: 'no-store' });
        useServer = ping && ping.ok;
      } catch (e) {
        useServer = false;
      }
    }

    if (!useServer) {
      // fallback local
      const arr = JSON.parse(localStorage.getItem('monapp_local') || '[]');
      payload._localId = 'id_' + Math.random().toString(36).slice(2,10);
      arr.unshift(payload);
      localStorage.setItem('monapp_local', JSON.stringify(arr));
      window.loadInventory();
      alert("Ajouté localement (mock)");
      return;
    }

    // Envoi au serveur
    try {
      const resp = await fetch('api/upload.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert('Erreur upload: ' + (data.error || resp.statusText));
        return;
      }
      alert('Upload réussi, id=' + data.id);
      if (window.loadInventory) window.loadInventory();
    } catch (e) {
      alert('Erreur réseau: ' + e.message);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('addLocalBtn');
    if (btn) btn.addEventListener('click', handleAddLocalClick);
  });
})();
