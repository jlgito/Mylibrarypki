window.APP_MODE = 'server';

document.addEventListener('DOMContentLoaded', () => {
  console.log("Frontend ready — mode:", window.APP_MODE);

  // ping server and update status indicator if present
  async function updateServerStatus(){
    const el = document.getElementById('serverStatus');
    if (!el) return;
    try {
      const resp = await fetch('api/stats.php', { cache: 'no-store' });
      if (resp && resp.ok) {
        el.textContent = 'Server: OK';
        el.style.color = '#7ad';
      } else {
        el.textContent = 'Server: offline';
        el.style.color = '#a66';
      }
    } catch (e) {
      el.textContent = 'Server: offline';
      el.style.color = '#a66';
    }
  }

  updateServerStatus();
  setInterval(updateServerStatus, 30000); // refresh every 30s
});
