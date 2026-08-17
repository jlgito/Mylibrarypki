(function(){

  async function saveAnnotations() {
    const item = window.__currentPreview;
    if (!item) return alert("Aucun élément sélectionné");

    const tags = document.getElementById('previewTags').value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const desc = document.getElementById('previewDesc').value || '';

    if (window.APP_MODE === 'mock') {
      const arr = JSON.parse(localStorage.getItem('monapp_local') || '[]');
      const idx = arr.findIndex(x => x._localId === item._localId);

      if (idx !== -1) {
        arr[idx].tags = tags;
        arr[idx].description = desc;
        localStorage.setItem('monapp_local', JSON.stringify(arr));
        window.loadInventory();
        alert("Annotations enregistrées");
      }
      return;
    }

    // server mode: call update API
    try {
      const payload = { id: item.id, tags: tags, description: desc };
      const resp = await fetch('api/update.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert('Erreur lors de la sauvegarde: ' + (data.error || resp.statusText));
        return;
      }
      // apply to current preview
      item.tags = tags;
      item.description = desc;
      window.loadInventory();
      alert('Annotations enregistrées sur le serveur');
    } catch (e) {
      alert('Erreur réseau: ' + e.message);
    }
  }

  async function removeLocal() {
    const item = window.__currentPreview;
    if (!item) return alert("Aucun élément sélectionné");

    if (window.APP_MODE === 'mock') {
      let arr = JSON.parse(localStorage.getItem('monapp_local') || '[]');
      arr = arr.filter(x => x._localId !== item._localId);
      localStorage.setItem('monapp_local', JSON.stringify(arr));
      window.loadInventory();
      alert("Supprimé");
      return;
    }

    // server mode: call delete API
    if (!confirm('Confirmer la suppression de cet élément ?')) return;
    try {
      const payload = { id: item.id };
      const resp = await fetch('api/delete.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (!resp.ok) {
        alert('Erreur lors de la suppression: ' + (data.error || resp.statusText));
        return;
      }
      window.loadInventory();
      clearPreview();
      alert('Élément supprimé');
    } catch (e) {
      alert('Erreur réseau: ' + e.message);
    }
  }

  function exportPem() {
    const item = window.__currentPreview;
    if (!item) return alert("Aucun élément sélectionné");

    if (window.APP_MODE === 'mock') {
      const pem = item.pem || '';
      const blob = new Blob([pem], {type:'application/x-pem-file'});
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = item.filename || 'cert.pem';
      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
      return;
    }

    // server mode: fetch the PEM and save it with the original filename to avoid browser naming/caching issues
    // trigger a direct download served by the server so the file is delivered verbatim with server-provided headers
    const url = 'api/export.php?id=' + encodeURIComponent(item.id);
    // Open in a new invisible link to let the browser handle the download filename from headers
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function clearPreview() {
    window.__currentPreview = null;

    ['previewCN','previewIssuer','previewSAN','previewValidity','previewSHA']
      .forEach(id => {
        const e = document.getElementById(id);
        if (e) e.textContent = '—';
      });

    document.getElementById('previewTags').value = '';
    document.getElementById('previewDesc').value = '';

    ['saveBtn','removeBtn','exportPemBtn'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.disabled = true;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('saveBtn').addEventListener('click', saveAnnotations);
    document.getElementById('removeBtn').addEventListener('click', removeLocal);
    document.getElementById('exportPemBtn').addEventListener('click', exportPem);
  });

})();
