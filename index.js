import { ensureInitialUsers, authenticate } from "./storage.js";

ensureInitialUsers();

const form = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const errorEl = document.getElementById("login-error");
const openPublicBtn = document.getElementById("open-public");

openPublicBtn.addEventListener("click", () => {
  window.location.href = "public.html";
});

form.addEventListener("submit", e => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    errorEl.textContent = "الرجاء إدخال اسم المستخدم وكلمة المرور";
    return;
  }

  const session = authenticate(username, password);
  if (!session) {
    errorEl.textContent = "بيانات الدخول غير صحيحة";
    return;
  }

  errorEl.textContent = "";
  window.location.href = "admin.html";
});

