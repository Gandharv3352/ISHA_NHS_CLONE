async function fetchAppointments() {
  try {
    const res = await fetch('https://mistyrose-eagle-578690.hostingersite.com/get_appointments.php', {
      method: 'POST'
    });
    const data = await res.json();
    data ? console.log(data) : null;

    const tbody = document.querySelector('#bodyy');
    tbody.innerHTML = '';

    const pending = data.filter(app => app.status?.toLowerCase() === 'pending');
    const completed = data.filter(app => app.status?.toLowerCase() === 'completed');
    const others = data.filter(app => app.status?.toLowerCase() !== 'pending' && app.status?.toLowerCase() !== 'completed');

   
    const sortedAppointments = [...pending, ...others, ...completed];

    sortedAppointments.forEach(app => {
      const row = `
        <tr>
          <td>${app.appointment_id}</td>
          <td>${app.username}</td>
          <td>${app.phone_number}</td>
          <td>${app.date}</td>
          <td>${app.time}</td>
          <td>${app.doctor_name}</td>
          <td>${app.status}</td>
          <td>${app.booking_datetime}</td>
          <td>${app.appointment_tye || ''}</td>
          <td>${app.reason || ''}</td>
        </tr>
      `;
      tbody.insertAdjacentHTML('beforeend', row);
    });
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

document.addEventListener('DOMContentLoaded', fetchAppointments);
