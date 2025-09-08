const slider = document.getElementById('slider');
  const totalSlides = slider.children.length;
  const dotsContainer = document.getElementById('dots');
  let currentIndex = 0;

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('div');
    dot.classList.add('dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  }

  function updateDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => dot.classList.remove('active'));
    dots[currentIndex].classList.add('active');
  }

  function goToSlide(index) {
    currentIndex = index;
    slider.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % totalSlides;
    goToSlide(currentIndex);
  }

  setInterval(nextSlide, 4000);


document.querySelector('.userName').innerHTML = `
<strong>Name:</strong> 

${localStorage.getItem("username")} `

document.querySelector('.userEmail').innerHTML = `
<strong>Email:</strong> 
 ${localStorage.getItem("email")}
`

const bookingButton = document.getElementById("logoutButton");

bookingButton.addEventListener("click", function() {
  window.location.href = "signlog.html";
  localStorage.clear()
});
