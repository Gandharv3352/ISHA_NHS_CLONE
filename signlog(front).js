const container = document.getElementById("container");
const registerBtn = document.querySelector(".register-btn");
const loginBtn = document.querySelector(".login-btn");

registerBtn.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn.addEventListener("click", () => {
  container.classList.remove("active");
});


const roleSelect = document.getElementById("roleSelect");
const doctorCodeContainer = document.getElementById("doctorCodeContainer");

roleSelect.addEventListener("change", () => {
  if (roleSelect.value === "doctor") {
    doctorCodeContainer.style.display = "block";
  } else {
    doctorCodeContainer.style.display = "none";
  }
});
