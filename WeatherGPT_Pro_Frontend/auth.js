
(() => {
  "use strict";

  const KEYS = {
    users: "weathergpt_users",
    session: "weathergpt_session",
    pendingReset: "weathergpt_pending_reset"
  };

  const $ = (s, root=document) => root.querySelector(s);

  function toast(message){
    const el = $("#toast");
    if(!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.__wgToast);
    window.__wgToast = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function getUsers(){
    try { return JSON.parse(localStorage.getItem(KEYS.users) || "[]"); }
    catch { return []; }
  }

  function saveUsers(users){
    localStorage.setItem(KEYS.users, JSON.stringify(users));
  }

  function setSession(user, remember=true){
    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      createdAt: Date.now(),
      remember
    };
    localStorage.setItem(KEYS.session, JSON.stringify(session));
  }

  function clearSession(){
    localStorage.removeItem(KEYS.session);
    sessionStorage.removeItem(KEYS.session);
  }

  function getSession(){
    try {
      const persistent = localStorage.getItem(KEYS.session);
      const temporary = sessionStorage.getItem(KEYS.session);
      return JSON.parse(temporary || persistent || "null");
    } catch {
      return null;
    }
  }

  function escapeHTML(value){
    return String(value).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[c]));
  }

  function isAuthPage(){
    return ["login.html","signup.html","forgot-password.html"].includes(location.pathname.split("/").pop());
  }

  function redirectIfAuthenticated(){
    const session = getSession();
    if(session && isAuthPage() && !location.pathname.endsWith("forgot-password.html")){
      location.replace("index.html");
    }
  }

  function protectApp(){
    const page = location.pathname.split("/").pop() || "index.html";
    const publicPages = ["login.html","signup.html","forgot-password.html"];
    if(!publicPages.includes(page) && !getSession()){
      location.replace("login.html");
    }
  }

  function fieldError(id, message){
    const el = $(`[data-error-for="${id}"]`);
    if(el) el.textContent = message || "";
    const input = document.getElementById(id);
    input?.classList.toggle("invalid", Boolean(message));
  }

  function validEmail(value){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function bindPasswordToggles(){
    document.querySelectorAll("[data-password-target]").forEach(btn => {
      btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.passwordTarget);
        if(!input) return;
        const showing = input.type === "text";
        input.type = showing ? "password" : "text";
        btn.textContent = showing ? "Show" : "Hide";
      });
    });
  }

  function initLogin(){
    const form = $("#loginForm");
    if(!form) return;

    $("#demoLogin")?.addEventListener("click", () => {
      const users = getUsers();
      let user = users.find(u => u.email === "demo@weathergpt.app");
      if(!user){
        user = { id: crypto.randomUUID?.() || String(Date.now()), name: "Demo User", email: "demo@weathergpt.app", password: "demo123" };
        users.push(user);
        saveUsers(users);
      }
      setSession(user, true);
      toast("Demo account signed in");
      setTimeout(() => location.replace("index.html"), 500);
    });

    form.addEventListener("submit", e => {
      e.preventDefault();

      const email = $("#loginEmail").value.trim().toLowerCase();
      const password = $("#loginPassword").value;
      let ok = true;

      fieldError("loginEmail", !validEmail(email) ? "Enter a valid email address." : "");
      fieldError("loginPassword", password.length < 6 ? "Password must be at least 6 characters." : "");
      ok = validEmail(email) && password.length >= 6;
      if(!ok) return;

      const user = getUsers().find(u => u.email === email && u.password === password);
      if(!user){
        toast("Incorrect email or password.");
        fieldError("loginPassword", "Email or password is incorrect.");
        return;
      }

      const remember = $("#rememberMe").checked;
      if(remember) setSession(user, true);
      else {
        clearSession();
        sessionStorage.setItem(KEYS.session, JSON.stringify({
          userId:user.id,name:user.name,email:user.email,createdAt:Date.now(),remember:false
        }));
      }

      toast("Signed in successfully");
      setTimeout(() => location.replace("index.html"), 450);
    });
  }

  function initSignup(){
    const form = $("#signupForm");
    if(!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();

      const name = $("#signupName").value.trim();
      const email = $("#signupEmail").value.trim().toLowerCase();
      const password = $("#signupPassword").value;
      const confirm = $("#signupConfirm").value;
      const terms = $("#acceptTerms").checked;

      let valid = true;

      fieldError("signupName", name.length < 2 ? "Enter your full name." : "");
      fieldError("signupEmail", !validEmail(email) ? "Enter a valid email address." : "");
      fieldError("signupPassword", password.length < 6 ? "Use at least 6 characters." : "");
      fieldError("signupConfirm", password !== confirm ? "Passwords do not match." : "");
      fieldError("acceptTerms", !terms ? "Please accept the terms to continue." : "");

      valid = name.length >= 2 && validEmail(email) && password.length >= 6 && password === confirm && terms;
      if(!valid) return;

      const users = getUsers();
      if(users.some(u => u.email === email)){
        toast("An account with this email already exists.");
        fieldError("signupEmail", "Email is already registered.");
        return;
      }

      const user = {
        id: crypto.randomUUID?.() || `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name, email, password,
        createdAt: new Date().toISOString()
      };

      users.push(user);
      saveUsers(users);
      setSession(user, true);
      localStorage.setItem("weathergpt_profile", JSON.stringify({name,email}));

      toast("Account created successfully");
      setTimeout(() => location.replace("index.html"), 500);
    });
  }

  function initForgot(){
    const form = $("#forgotForm");
    if(!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const email = $("#forgotEmail").value.trim().toLowerCase();
      fieldError("forgotEmail", !validEmail(email) ? "Enter a valid email address." : "");
      if(!validEmail(email)) return;

      const exists = getUsers().some(u => u.email === email);
      const message = $("#resetMessage");
      if(exists){
        localStorage.setItem(KEYS.pendingReset, JSON.stringify({email, createdAt:Date.now()}));
        message.innerHTML = `<strong>Reset request created.</strong><br>In a real application, an email with a secure reset token would be sent to <b>${escapeHTML(email)}</b>.`;
      } else {
        message.innerHTML = `<strong>Check your email.</strong><br>If an account exists for <b>${escapeHTML(email)}</b>, a reset message would be sent.`;
      }
      message.classList.remove("hidden");
      toast("Reset flow completed in demo mode");
    });
  }

  function updateUserUI(){
    const session = getSession();
    if(!session) return;

    document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = session.name || "User");
    document.querySelectorAll("[data-user-email]").forEach(el => el.textContent = session.email || "");
    document.querySelectorAll("[data-user-initials]").forEach(el => {
      const initials = (session.name || "User").split(/\s+/).map(x => x[0]).join("").slice(0,2).toUpperCase();
      el.textContent = initials;
    });

    const logout = $("#logoutBtn");
    logout?.addEventListener("click", () => {
      clearSession();
      toast("Signed out");
      setTimeout(() => location.replace("login.html"), 350);
    });
  }

  function init(){
    protectApp();
    redirectIfAuthenticated();
    bindPasswordToggles();
    initLogin();
    initSignup();
    initForgot();
    updateUserUI();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
