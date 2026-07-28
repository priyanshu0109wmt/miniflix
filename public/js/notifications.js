// Wait until DOM is fully loaded before attaching listeners
document.addEventListener("DOMContentLoaded", function () {
  const notifBell = document.getElementById("notifBell");
  const notifDropdown = document.getElementById("notifDropdown");
  const markReadBtn = document.getElementById("markReadBtn");

  // If bell doesn't exist on this page, exit silently
  if (!notifBell || !notifDropdown) return;

  async function loadNotifications() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Load unread count
      const countRes = await fetch("http://localhost:5000/api/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (countRes.ok) {
        const { count } = await countRes.json();
        const badge = document.getElementById("notifBadge");
        if (badge) {
          if (count > 0) {
            badge.textContent = count > 9 ? "9+" : count;
            badge.classList.remove("hidden");
          } else {
            badge.classList.add("hidden");
          }
        }
      }

      // Load notification list
      const listRes = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (listRes.ok) {
        const notifs = await listRes.json();
        const list = document.getElementById("notifList");
        if (list) {
          if (notifs.length === 0) {
            list.innerHTML = "<p class='notif-empty'>No notifications yet.</p>";
          } else {
            list.innerHTML = notifs.map(n => `
              <div class="notif-item ${n.is_read ? '' : 'unread'}">
                <p>${n.message}</p>
                <span class="notif-time">${new Date(n.created_at).toLocaleDateString()}</span>
              </div>
            `).join("");
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Toggle dropdown
  notifBell.addEventListener("click", function (e) {
    e.stopPropagation();
    notifDropdown.classList.toggle("hidden");
    loadNotifications();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function () {
    notifDropdown.classList.add("hidden");
  });

  // Prevent dropdown from closing when clicking inside it
  notifDropdown.addEventListener("click", function (e) {
    e.stopPropagation();
  });

  // Mark all as read
  if (markReadBtn) {
    markReadBtn.addEventListener("click", async function () {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        await fetch("http://localhost:5000/api/notifications/mark-read", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        loadNotifications();
      } catch (error) {
        console.error(error);
      }
    });
  }

  // Load on page init (only if logged in)
  if (localStorage.getItem("token")) {
    loadNotifications();
  }
});