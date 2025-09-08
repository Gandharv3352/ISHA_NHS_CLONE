const regForm = document.getElementById('regForm');
const loginForm = document.getElementById('loginForm');
const roleSelect = document.getElementById('roleSelect');
const doctorCodeContainer = document.getElementById('doctorCodeContainer');
let signedIn = false;

roleSelect.addEventListener('change', () => {
  doctorCodeContainer.style.display = roleSelect.value === 'doctor' ? 'block' : 'none';
});

regForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new URLSearchParams({
    username: form.username.value,
    email: form.email.value,
    password: form.password.value,
    role: form.role.value
  });

  if (form.role.value === 'doctor') {
    formData.append('doctor_code', form.doctor_code.value);
  }

  try {
    const res = await fetch('https://mistyrose-eagle-578690.hostingersite.com/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    const text = await res.text();

    if (text === "User registered successfully") {
      document.getElementById("loginButton").click();
      form.reset();
    } else {
      console.warn("Server response:", text); // Optional: show alert or UI message
    }

  } catch (err) {
    console.error('Registration error:', err);
  }
});





loginForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new URLSearchParams({
    email: loginForm.email.value,
    password: loginForm.password.value
  });

  try {
    const res = await fetch('https://mistyrose-eagle-578690.hostingersite.com/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

    const data = await res.json();

    if (data.error) {
      console.error('Login failed:', data.error);
      signedIn = false
      return;
    }

    const userInfo = {
      username: data.username,
      role: data.role,
      email: data.email
    };

    localStorage.setItem("username", userInfo.username);
    localStorage.setItem("email", userInfo.email);
    
    console.log('LOGIN SUCCESS:', userInfo);

   if (userInfo.username && userInfo.role && userInfo.email !== null) {
    if (userInfo.role == "doctor") {window.location.href = "doctorappoint.html"}

    else {signedIn = true;}
} else {
  signedIn = false;
}
   if (signedIn) {
  window.location.href = "dashboard_user.html";
}

  } catch (err) {
    console.error('Login error:', err);

  }
});

