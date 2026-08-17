async function fetchStats() {
    try {
        const res = await fetch('/api/stats.php');
        if (!res.ok) {
            console.error("Erreur API stats:", res.status);
            return;
        }

        const data = await res.json();

        document.getElementById('statTotal').textContent = data.total;
        document.getElementById('statPub').textContent = data.pub;
        document.getElementById('statPriv').textContent = data.priv;

        document.getElementById('statExp30').textContent = data.exp30;
        document.getElementById('statExp90').textContent = data.exp90;

        const ul = document.getElementById('statRecent');
        ul.innerHTML = '';

        data.recent.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.filename} (${item.type})`;
            ul.appendChild(li);
        });

    } catch (err) {
        console.error("Erreur JS dashboard:", err);
    }
}

fetchStats();
