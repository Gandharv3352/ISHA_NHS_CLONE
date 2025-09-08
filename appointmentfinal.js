// ====== CONFIG ======
const BASE = 'https://mistyrose-eagle-578690.hostingersite.com/';
const username = localStorage.getItem('username') || ''; // ожидается, что уже сохранено ранее

// ====== INIT ======
document.addEventListener('DOMContentLoaded', fetchAppointments);

// ====== FETCH & RENDER ======
async function fetchAppointments() {
  try {
    const res = await fetch(BASE + 'get_appointments.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username })
    });

    const data = await res.json();
    const tbody = document.getElementById('bodyy');
    tbody.innerHTML = '';

    data.forEach(app => {
      const row = document.createElement('tr');

      // безопасно получить HH:mm
      const timeHHMM = (app.time || '').slice(0, 5);

      row.innerHTML = `
        <td data-label="ID">${app.appointment_id}</td>
        <td data-label="Username">${app.username}</td>
        <td data-label="Phone">${app.phone_number}</td>

        <td data-label="Date">
          <input type="text" value="${app.date}" class="date-input" data-id="${app.appointment_id}" />
        </td>

        <td data-label="Time">
          <input type="text" value="${timeHHMM}" class="time-input" data-id="${app.appointment_id}" />
        </td>

        <td data-label="Doctor">${app.doctor_name}</td>
        <td data-label="Status" class="status-cell" data-id="${app.appointment_id}">${app.status}</td>
        <td data-label="Booked">${app.booking_datetime}</td>
        <td data-label="Type">${app.appointment_tye || ''}</td>

        <td data-label="Reason">
          <input type="text" value="${app.reason || ''}" class="reason-input" data-id="${app.appointment_id}" />
        </td>

        <td data-label="Check-in">
          <button class="btn-checkin checkin-btn" data-id="${app.appointment_id}">CHECK-IN</button>
          <div class="checkin-hint" data-id="${app.appointment_id}"></div>
        </td>

        <td data-label="Action">
          <button class="btn-save"   onclick="saveAppointment(${app.appointment_id}, this)">SAVE</button>
          <button class="btn-cancel" onclick="deleteAppointment(${app.appointment_id}, this)">CANCEL</button>
        </td>
      `;

      tbody.appendChild(row);
      setupCheckinWindow(app);
    });

    applyInputMasks();
  } catch (e) {
    alert('Failed to load appointments');
    console.error(e);
  }
}

// ====== SAVE / DELETE ======
function saveAppointment(id, btn) {
  const date   = document.querySelector(`.date-input[data-id="${id}"]`).value.trim();
  const time   = document.querySelector(`.time-input[data-id="${id}"]`).value.trim();
  const reason = document.querySelector(`.reason-input[data-id="${id}"]`).value.trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    alert('Invalid date or time format (use YYYY-MM-DD and HH:MM)');
    return;
  }

  btn.disabled = true;
  let countdown = 10;
  const originalText = btn.textContent;
  btn.textContent = `Wait ${countdown}s`;

  const interval = setInterval(() => {
    countdown--;
    btn.textContent = countdown > 0 ? `Wait ${countdown}s` : 'Save';
    if (countdown === 0) {
      clearInterval(interval);
      btn.disabled = false;
    }
  }, 1000);

  fetch(BASE + 'update_appointment.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ id, date, time, reason })
  })
    .then(r => r.json())
    .then(j => {
      if (!j.message) alert('Error: ' + (j.error || 'Unknown'));
    })
    .catch(() => alert('Network error'));
}

function deleteAppointment(id, btn) {
  if (!confirm(`Are you sure you want to delete appointment #${id}?`)) return;

  btn.disabled = true;
  fetch(BASE + 'delete_appointment.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ appointment_id: id })
  })
    .then(r => r.json())
    .then(j => {
      if (j.message) {
        fetchAppointments();
      } else {
        alert('Error: ' + (j.error || 'Unknown'));
        btn.disabled = false;
      }
    })
    .catch(() => {
      alert('Network error');
      btn.disabled = false;
    });
}

// ====== INPUT MASKS ======
function applyInputMasks() {
  document.querySelectorAll('.date-input').forEach(input => {
    input.addEventListener('input', () => {
      let v = input.value.replace(/\D/g, '');
      if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4);
      if (v.length > 7) v = v.slice(0, 7) + '-' + v.slice(7, 10);
      input.value = v.slice(0, 10);
    });
  });

  document.querySelectorAll('.time-input').forEach(input => {
    input.addEventListener('input', () => {
      let v = input.value.replace(/\D/g, '');
      if (v.length > 2) v = v.slice(0, 2) + ':' + v.slice(2, 4);
      input.value = v.slice(0, 5);
    });
  });
}

// ====== CHECK-IN WINDOW (T-20m ... T) ======
function setupCheckinWindow(app) {
  const id = app.appointment_id;
  const btn  = document.querySelector(`.checkin-btn[data-id="${id}"]`);
  const hint = document.querySelector(`.checkin-hint[data-id="${id}"]`);
  const statusCell = document.querySelector(`.status-cell[data-id="${id}"]`);

  if (!btn || !hint) return;

  // Если уже checked_in — заблокировать и показать статус
  if ((app.status || '').toLowerCase() === 'checked_in') {
    btn.disabled = true;
    btn.textContent = 'Checked-in';
    hint.textContent = '';
    return;
  }

  // Собираем локальную дату-время (ожидается, что app.date = YYYY-MM-DD, app.time = HH:MM:SS или HH:MM)
  const hhmm = (app.time || '').slice(0, 5);
  const dtStr = `${app.date}T${hhmm}:00`;
  const start = new Date(dtStr);
  if (isNaN(start.getTime())) {
    btn.disabled = true;
    hint.textContent = 'Invalid datetime';
    return;
  }

  const openFrom = new Date(start.getTime() - 20 * 60 * 1000); // T-20m
  const closeAt  = start; // до начала визита

  function fmt(ms) {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${String(s).padStart(2, '0')}s`;
  }

  function tick() {
    const now = new Date();

    if (now < openFrom) {
      btn.disabled = true;
      btn.textContent = 'CHECK-IN';
      hint.textContent = `Aviable in ${fmt(openFrom - now)}`;
    } else if (now >= openFrom && now <= closeAt) {
      btn.disabled = false;
      btn.textContent = 'CHECK-IN';
      hint.textContent = `Will be closing soon in ${fmt(closeAt - now)}`;
    } else {
      btn.disabled = true;
      btn.textContent = 'CHECK-IN';
      hint.textContent = 'Window closed';
    }
  }

  tick();
  const timer = setInterval(tick, 1000);

  btn.addEventListener('click', async () => {
    if (btn.disabled) return;
    btn.disabled = true;
    const prevText = btn.textContent;
    btn.textContent = '...';

    try {
      // если у тебя другой эндпоинт для статуса — поменяй путь ниже
      const res = await fetch(BASE + 'update_status.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ id, status: 'checked_in' })
      });
      const j = await res.json();

      if (j.message) {
        statusCell.textContent = 'checked_in';
        btn.textContent = 'Checked-in';
        hint.textContent = 'Checked-in';
        clearInterval(timer);
      } else {
        throw new Error(j.error || 'Unknown error');
      }
    } catch (e) {
      btn.textContent = prevText;
      btn.disabled = false; // таймер снова управляет состоянием
      hint.textContent = 'Ошибка: ' + e.message;
    }
  });
}
