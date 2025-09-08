const BASE_URL = 'https://mistyrose-eagle-578690.hostingersite.com/';


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('appointmentForm');
  const bookedList = document.getElementById('bookedAppointmentsList');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = new URLSearchParams({
      username: form.patientName.value.trim() ,
      phone_number: form.phoneNumber.value,
      date: form.appointmentDate.value,
      time: form.appointmentTime.value,
      doctor_name: form.doctorSelect.value.trim(),
      status: 'pending',
      appointment_tye: form.appointmentType.value,
      reason: form.reason.value.trim()
    });

    try {
      const res = await fetch(BASE_URL + 'create_appointment.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
      });



      form.reset();
      loadAppointments();
    } catch (err) {
      console.error(err);
    }
  });

const bookingButton = document.getElementById("bookingButton");

bookingButton.addEventListener("click", function() {
  window.location.href = "bookconfirm.html";
});

  

});



