const BASE = 'https://mistyrose-eagle-578690.hostingersite.com/';
const doctor = "muhammadrizzo"; // Заменить на имя врача

async function fetchAppointments() {
  const res = await fetch(BASE + 'get_appointments.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ doctor })
  });

  const data = await res.json();
  const tbody = document.getElementById('bodyy');
  tbody.innerHTML = '';

  data.forEach(app => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${app.appointment_id}</td>
      <td>${app.username}</td>
      <td>${app.phone_number}</td>
      <td>${app.date}</td>
      <td>${app.time.slice(0, 5)}</td>
      <td>
        <select data-id="${app.appointment_id}">
          <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>pending</option>
          <option value="confirmed" ${app.status === 'confirmed' ? 'selected' : ''}>confirmed</option>
          <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>rejected</option>
        </select>
      </td>
      <td>${app.appointment_tye || ''}</td>
      <td>${app.reason || ''}</td>
      <td class="action-buttons">
        <button class="save-btn" disabled>Save</button>
      </td>
    `;

    const select = row.querySelector('select');
    const saveBtn = row.querySelector('.save-btn');

    select.addEventListener('change', () => {
      saveBtn.disabled = false;
    });

    saveBtn.addEventListener('click', async () => {
      const id = select.dataset.id;
      const newStatus = select.value;

      const res = await fetch(BASE + 'update_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, status: newStatus })
      });

      const result = await res.json();
      if (result.message) {
        saveBtn.disabled = true;
      } else {
        alert("Error: " + result.error);
      }
    });

    tbody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', fetchAppointments);