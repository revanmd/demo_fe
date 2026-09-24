const form = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');
const togglePass = document.getElementById('togglePass');
const submitBtn = document.getElementById('submitBtn');
const card = document.getElementById('card');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

togglePass.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  togglePass.querySelector('.eye-open').style.display = isPassword ? 'none' : 'block';
  togglePass.querySelector('.eye-closed').style.display = isPassword ? 'block' : 'none';
  togglePass.setAttribute('aria-label', isPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
});

function setFieldState(inputEl, errorEl, message) {
  const field = inputEl.closest('.field');
  if (message) {
    field.classList.add('invalid');
    errorEl.textContent = message;
  } else {
    field.classList.remove('invalid');
    errorEl.textContent = '';
  }
}

function validateEmail() {
  const value = emailInput.value.trim();
  if (!value) {
    setFieldState(emailInput, emailError, 'Email wajib diisi.');
    return false;
  }
  if (!emailRegex.test(value)) {
    setFieldState(emailInput, emailError, 'Format email tidak valid.');
    return false;
  }
  setFieldState(emailInput, emailError, '');
  return true;
}

function validatePassword() {
  const value = passwordInput.value;
  if (!value) {
    setFieldState(passwordInput, passwordError, 'Kata sandi wajib diisi.');
    return false;
  }
  if (value.length < 6) {
    setFieldState(passwordInput, passwordError, 'Minimal 6 karakter.');
    return false;
  }
  setFieldState(passwordInput, passwordError, '');
  return true;
}

emailInput.addEventListener('blur', validateEmail);
passwordInput.addEventListener('blur', validatePassword);
emailInput.addEventListener('input', () => { if (emailInput.closest('.field').classList.contains('invalid')) validateEmail(); });
passwordInput.addEventListener('input', () => { if (passwordInput.closest('.field').classList.contains('invalid')) validatePassword(); });

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const emailOk = validateEmail();
  const passwordOk = validatePassword();

  if (!emailOk || !passwordOk) {
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    return;
  }

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;

  setTimeout(() => {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-text').textContent = 'Berhasil masuk';
    setTimeout(() => {
      submitBtn.querySelector('.btn-text').textContent = 'Masuk';
    }, 1800);
  }, 1400);
});
