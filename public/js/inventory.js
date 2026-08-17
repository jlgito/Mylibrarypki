(function(){

  function createItemNode(item) {
    const el = document.createElement('div');
    el.className = 'item';
    el.dataset.itemId = item._localId || ('id_' + (item.id || Math.random().toString(36).slice(2,10)));

    const left = document.createElement('div');
    left.style.display = 'flex';
    left.style.alignItems = 'center';
    left.style.gap = '10px';

    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.className = 'item-checkbox';
    chk.dataset.itemId = item._localId || ('id_' + (item.id || Math.random().toString(36).slice(2,10)));

    chk.addEventListener('change', () => {
      document.querySelectorAll('.item-checkbox').forEach(c => {
        if (c !== chk) {
          c.checked = false;
          c.closest('.item')?.classList.remove('selected');
        }
      });

      if (chk.checked) {
        el.classList.add('selected');
        ensureFullAndPreview(item);
      } else {
        el.classList.remove('selected');
        clearPreview();
      }
    });

    // Helper: when "Voir" clicked, ensure we have full data then preview
    async function ensureFullAndPreview(item) {
      // if item already has pem, just preview
      if (item.pem) {
        setPreview(item);
        return;
      }

      // otherwise try to fetch full record from server
      if (!item.id) {
        setPreview(item);
        return;
      }

      try {
        const resp = await fetch('api/get.php?id=' + encodeURIComponent(item.id));
        if (!resp.ok) {
          setPreview(item);
          return;
        }
        const full = await resp.json();
        try {
          full.tags = JSON.parse(full.tags);
        } catch(e) {
          full.tags = (full.tags || '').split(',').map(s => s.trim()).filter(Boolean);
        }
        // merge into item and preview
        Object.assign(item, full);
        setPreview(item);
      } catch (e) {
        console.error('Failed to load full item', e);
        setPreview(item);
      }
    }

    const meta = document.createElement('div');
    meta.className = 'meta';

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = item.filename;

    const sub = document.createElement('div');
    sub.className = 'sub';
    const tagsText = Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || '');
    sub.textContent = (item.description || '') + (tagsText ? ' • ' + tagsText : '');

    meta.appendChild(name);
    meta.appendChild(sub);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const btnView = document.createElement('button');
    btnView.className = 'btn';
    btnView.textContent = 'Voir';
    btnView.addEventListener('click', () => {
      chk.checked = true;
      el.classList.add('selected');
      setPreview(item);
    });

    actions.appendChild(btnView);

    left.appendChild(chk);
    left.appendChild(meta);

    el.appendChild(left);
    el.appendChild(actions);

    return el;
  }

  function setPreview(item) {
    window.__currentPreview = item;

    const set = (id, val) => {
      const e = document.getElementById(id);
      if (e) e.textContent = val || '—';
    };

    set('previewCN', item.cn);
    set('previewIssuer', item.issuer);
    set('previewSAN', item.san);
    set('previewValidity', item.validity);
    set('previewSHA', item.sha256 || item.sha);

    document.getElementById('previewTags').value =
      Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || '');

    document.getElementById('previewDesc').value = item.description || '';

    enablePreviewButtons(true);
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

    enablePreviewButtons(false);
  }

  function enablePreviewButtons(state) {
    ['saveBtn','removeBtn','exportPemBtn'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.disabled = !state;
    });
  }

  window.loadInventory = async function() {
    const list = document.getElementById('pubList') || document.getElementById('privList');
    const isPub = !!document.getElementById('pubList');
    const isPriv = !!document.getElementById('privList');

    list.innerHTML = '';

    // detect server availability if APP_MODE is not explicitly 'server'
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
      const arr = JSON.parse(localStorage.getItem('monapp_local') || '[]');

      const filtered = arr.filter(it => {
        if (isPub) return it.type === 'pub';
        if (isPriv) return it.type === 'priv';
        return true;
      });

      if (!filtered.length) {
        list.innerHTML = '<div class="item"><div class="meta"><div class="name">Aucun élément</div></div></div>';
        enablePreviewButtons(false);
        return;
      }

      filtered.forEach(it => {
        const node = createItemNode(it);
        list.appendChild(node);
      });

      enablePreviewButtons(false);
      return;
    }

    // server mode
    try {
      const q = isPub ? 'pub' : (isPriv ? 'priv' : '');
      const url = 'api/list.php' + (q ? '?type=' + encodeURIComponent(q) : '');
      const resp = await fetch(url);
      if (!resp.ok) {
        list.innerHTML = '<div class="item"><div class="meta"><div class="name">Erreur lors du chargement</div></div></div>';
        enablePreviewButtons(false);
        return;
      }
      const data = await resp.json();
      if (!Array.isArray(data) || !data.length) {
        list.innerHTML = '<div class="item"><div class="meta"><div class="name">Aucun élément</div></div></div>';
        enablePreviewButtons(false);
        return;
      }

      data.forEach(it => {
        try {
          it.tags = JSON.parse(it.tags);
        } catch(e) {
          it.tags = (it.tags || '').split(',').map(s => s.trim()).filter(Boolean);
        }
        it._localId = 'id_' + it.id;
        const node = createItemNode(it);
        list.appendChild(node);
      });

      enablePreviewButtons(false);
    } catch (e) {
      list.innerHTML = '<div class="item"><div class="meta"><div class="name">Erreur réseau</div></div></div>';
      enablePreviewButtons(false);
    }
  };

  document.addEventListener('DOMContentLoaded', window.loadInventory);
})();
