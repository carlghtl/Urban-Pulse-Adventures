// enhanced client-side interactions: nav toggle, booking, and reveal animations
document.addEventListener('DOMContentLoaded', function(){
  const year = new Date().getFullYear();
  const y = document.getElementById('year');
  const y2 = document.getElementById('year2');
  if(y) y.textContent = year;
  if(y2) y2.textContent = year;

  // Enhanced booking form with validation
  const form = document.getElementById('bookingForm');
  const msg = document.getElementById('bookingMsg');
  if(form){
    // Set minimum date to today
    const dateInput = document.getElementById('bookingDate');
    if(dateInput){
      const today = new Date().toISOString().split('T')[0];
      dateInput.setAttribute('min', today);
    }
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if(input.parentElement.parentElement.classList.contains('error')){
          validateField(input);
        }
      });
    });
    
    function validateField(field){
      const group = field.closest('.form-group');
      if(!group) return true;
      
      let isValid = true;
      if(field.required && !field.value.trim()){
        isValid = false;
      }
      if(field.type === 'email' && field.value){
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      }
      
      if(isValid){
        group.classList.remove('error');
        const status = group.querySelector('.input-status');
        if(status){
          status.className = 'input-status valid';
        }
      }else{
        group.classList.add('error');
        const status = group.querySelector('.input-status');
        if(status){
          status.className = 'input-status invalid';
        }
      }
      return isValid;
    }
    
    form.addEventListener('submit', function(e){
      e.preventDefault();
      
      // Validate all fields
      let isFormValid = true;
      inputs.forEach(input => {
        if(!validateField(input)) isFormValid = false;
      });
      
      // Check consent
      const consent = document.getElementById('bookingConsent');
      if(consent && !consent.checked){
        isFormValid = false;
        alert('Please agree to the terms and conditions');
        return;
      }
      
      if(!isFormValid) return;
      
      // Show loading state
      const submitBtn = form.querySelector('.btn-submit');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;
      
      // Simulate form submission
      setTimeout(() => {
        const fm = new FormData(form);
        const name = fm.get('name') || 'friend';
        const tour = fm.get('tour');
        const date = fm.get('date');
        const time = fm.get('time');
        
        msg.innerHTML = `<strong>Booking Received!</strong><br>Thanks ${name} — your request for "${tour}" on ${date} at ${time} was received! We'll contact you within 24 hours.`;
        msg.className = 'booking-message success';
        
        form.reset();
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        
        // Clear validation status
        inputs.forEach(input => {
          const group = input.closest('.form-group');
          if(group){
            group.classList.remove('error');
            const status = group.querySelector('.input-status');
            if(status) status.className = 'input-status';
          }
        });
        
        // Scroll to message
        msg.scrollIntoView({behavior:'smooth', block:'center'});
      }, 1500);
    });
  }

  // mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.getElementById('mainNav');
  if(navToggle && mainNav){
    navToggle.addEventListener('click', function(){
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('open');
      mainNav.setAttribute('aria-hidden', String(expanded));
    });
  }

  // reveal cards on scroll
  const elems = document.querySelectorAll('.card');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('revealed');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elems.forEach(el => { el.classList.add('reveal'); io.observe(el); });

  // subtle tilt micro-interaction for cards
  document.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const rx = (y) * 6;
      const ry = (x) * -6;
      card.style.transform = `translateY(-6px) scale(1.01) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = '';
    });
  });
});
