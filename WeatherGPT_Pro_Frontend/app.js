
/* =========================================================
   WeatherGPT Authentication Guard
   ========================================================= */
(() => {
  "use strict";
  const PUBLIC = ["login.html","signup.html","forgot-password.html"];
  const page = location.pathname.split("/").pop() || "index.html";
  const session =
    (() => { try {
      return JSON.parse(sessionStorage.getItem("weathergpt_session") || localStorage.getItem("weathergpt_session") || "null");
    } catch { return null; } })();

  if (!PUBLIC.includes(page) && !session) {
    location.replace("login.html");
    return;
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!session) return;

    document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = session.name || "User");
    document.querySelectorAll("[data-user-email]").forEach(el => el.textContent = session.email || "");
    document.querySelectorAll("[data-user-initials]").forEach(el => {
      el.textContent = (session.name || "User").split(/\s+/).map(x => x[0]).join("").slice(0,2).toUpperCase();
    });

    document.querySelectorAll("[data-logout]").forEach(btn => {
      btn.addEventListener("click", () => {
        localStorage.removeItem("weathergpt_session");
        sessionStorage.removeItem("weathergpt_session");
        location.replace("login.html");
      });
    });
  });
})();


/* =========================================================
   WeatherGPT - Application JavaScript
   UI interactions only; no backend required.
   ========================================================= */

(() => {
  "use strict";

  const STORAGE = {
    theme: "weathergpt_theme",
    savedPlans: "weathergpt_saved_plans",
    settings: "weathergpt_settings"
  };

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function showToast(message) {
    let toast = $("#toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function getCurrentPage() {
    const file = location.pathname.split("/").pop();
    return file || "index.html";
  }

  function activateNavigation() {
    const current = getCurrentPage();
    $$(".nav a").forEach(link => {
      link.classList.toggle("active", link.getAttribute("href") === current);
    });
  }

  function initMobileMenu() {
    const sidebar = $(".sidebar");
    const overlay = $(".overlay");
    const menuBtn = $(".mobile-menu-btn");
    if (!sidebar || !overlay || !menuBtn) return;

    const close = () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("show");
    };
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("show");
    });
    overlay.addEventListener("click", close);
    $$(".nav a").forEach(a => a.addEventListener("click", close));
  }

  function initClock() {
    const dateEl = $("#currentDate");
    const timeEl = $("#currentTime");
    if (!dateEl || !timeEl) return;

    const update = () => {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      });
      timeEl.textContent = now.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit"
      });
    };
    update();
    window.setInterval(update, 1000);
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "light") {
      root.style.setProperty("--bg", "#eef6fd");
      root.style.setProperty("--bg-soft", "#f4faff");
      root.style.setProperty("--panel", "#ffffff");
      root.style.setProperty("--panel-2", "#eaf5ff");
      root.style.setProperty("--panel-3", "#e7f2fb");
      root.style.setProperty("--text", "#0a2035");
      root.style.setProperty("--muted", "#526d84");
      document.body.style.background = "linear-gradient(180deg,#eef6fd,#dcebf7)";
      showToast("Light theme enabled");
    } else {
      root.style.setProperty("--bg", "#021426");
      root.style.setProperty("--bg-soft", "#031b30");
      root.style.setProperty("--panel", "#062844");
      root.style.setProperty("--panel-2", "#07365b");
      root.style.setProperty("--panel-3", "#082d4d");
      root.style.setProperty("--text", "#f7fbff");
      root.style.setProperty("--muted", "#9fb8cf");
      document.body.style.background = "";
      showToast("Dark theme enabled");
    }

    $$(".theme-toggle button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.theme === theme);
    });
    localStorage.setItem(STORAGE.theme, theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(STORAGE.theme) || "dark";
    // The supplied design is dark-first; light mode remains available as a JS interaction.
    applyTheme(saved);
    $$(".theme-toggle button").forEach(btn => {
      btn.addEventListener("click", () => applyTheme(btn.dataset.theme));
    });
  }

  function initActivities() {
    const buttons = $$(".activity");
    if (!buttons.length) return;

    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("active"));
        button.classList.add("active");
        const activityName = button.textContent.replace(/\s+/g, " ").trim();
        const activityField = $("#activityDisplay");
        if (activityField) activityField.textContent = activityName;
        showToast(`${activityName} selected`);
      });
    });
  }

  function getPlanData() {
    return {
      activity: $("#activityDisplay")?.textContent?.trim() || "Outdoor Activity",
      location: $("#planLocation")?.value?.trim() || "Mumbai, Maharashtra",
      date: $("#planDate")?.value || "Tomorrow",
      time: $("#planTime")?.value?.trim() || "5:00 PM – 9:00 PM",
      risk: 76
    };
  }

  function initPlanner() {
    const analyze = $("#analyzePlan");
    const save = $("#savePlan");
    if (!analyze && !save) return;

    analyze?.addEventListener("click", () => {
      const data = getPlanData();
      if (!data.location) {
        showToast("Please enter a location first.");
        return;
      }
      const resultText = $("#planResult");
      if (resultText) {
        resultText.textContent = `${data.activity} for ${data.location} — selected time has high rain risk. Recommended window: 3:00 PM – 6:00 PM.`;
      }
      const resultCard = $("#planResultCard");
      if (resultCard) resultCard.classList.remove("hidden");
      showToast("Weather plan analyzed");
    });

    save?.addEventListener("click", () => {
      const data = getPlanData();
      const saved = JSON.parse(localStorage.getItem(STORAGE.savedPlans) || "[]");
      saved.unshift({ ...data, id: Date.now() });
      localStorage.setItem(STORAGE.savedPlans, JSON.stringify(saved.slice(0, 20)));
      showToast("Plan saved successfully");
      renderSavedPlans();
    });
  }

  function initExampleButton() {
    const btn = $("#tryExample");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const city = $("#planLocation");
      const time = $("#planTime");
      if (city) city.value = "Mumbai, Maharashtra";
      if (time) time.value = "5:00 PM – 9:00 PM";
      $$(".activity").forEach(b => b.classList.remove("active"));
      const outdoor = $$(".activity").find(b => b.dataset.activity === "Outdoor Activity");
      outdoor?.classList.add("active");
      const activity = $("#activityDisplay");
      if (activity) activity.textContent = "Outdoor Activity";
      showToast("Example plan loaded");
    });
  }

  function initForecastFilters() {
    const buttons = $$(".forecast-filter");
    if (!buttons.length) return;
    buttons.forEach(btn => btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.target;
      $$(".forecast-block").forEach(block => {
        block.classList.toggle("hidden", target !== "all" && block.dataset.forecast !== target);
      });
    }));
  }

  function initSearch() {
    const search = $("#globalSearch");
    if (!search) return;

    search.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      const value = search.value.trim();
      if (!value) {
        showToast("Type a city or weather question.");
        return;
      }
      showToast(`Searching WeatherGPT for "${value}"`);
      const suggestions = $("#searchResult");
      if (suggestions) {
        suggestions.textContent = `AI preview: WeatherGPT is ready to analyze "${value}". Connect an API later for live data.`;
        suggestions.classList.remove("hidden");
      }
    });
  }

  function initAIChat() {
    const input = $("#aiInput");
    const send = $("#aiSend");
    const chat = $("#chatMessages");
    if (!input || !send || !chat) return;

    const answerFor = text => {
      const lower = text.toLowerCase();
      if (lower.includes("umbrella") || lower.includes("rain")) {
        return "Rain probability is currently high for the selected evening window. Carry an umbrella or choose an earlier time.";
      }
      if (lower.includes("run") || lower.includes("outdoor")) {
        return "For outdoor activity, 3 PM – 6 PM currently looks better than 5 PM – 9 PM because the weather risk is lower.";
      }
      if (lower.includes("travel") || lower.includes("lonavala")) {
        return "For travel, check rain, visibility and wind together. The current demo suggests travelling earlier and avoiding peak rain periods.";
      }
      return "I can help with travel, outdoor activities, rain, wind, temperature and time-of-day recommendations.";
    };

    const sendMessage = () => {
      const text = input.value.trim();
      if (!text) return;

      const user = document.createElement("div");
      user.className = "ai-bubble";
      user.style.marginTop = "8px";
      user.innerHTML = `<strong>You</strong><br>${escapeHTML(text)}`;
      chat.appendChild(user);

      window.setTimeout(() => {
        const bot = document.createElement("div");
        bot.className = "ai-bubble";
        bot.style.marginTop = "8px";
        bot.innerHTML = `<strong>WeatherGPT</strong><br>${escapeHTML(answerFor(text))}`;
        chat.appendChild(bot);
        chat.scrollTop = chat.scrollHeight;
      }, 350);

      input.value = "";
      chat.scrollTop = chat.scrollHeight;
    };

    send.addEventListener("click", sendMessage);
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") sendMessage();
    });

    $$(".chip").forEach(chip => {
      chip.addEventListener("click", () => {
        input.value = chip.textContent.trim();
        input.focus();
      });
    });
  }

  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, char => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[char]));
  }

  function renderSavedPlans() {
    const container = $("#savedPlans");
    if (!container) return;

    const saved = JSON.parse(localStorage.getItem(STORAGE.savedPlans) || "[]");
    if (!saved.length) {
      container.innerHTML = `<div class="mini-row"><span>No saved plans yet.</span><span>—</span></div>`;
      return;
    }

    container.innerHTML = saved.map(plan => `
      <div class="mini-row">
        <span>${escapeHTML(plan.activity)} • ${escapeHTML(plan.location)}</span>
        <button class="secondary-btn delete-plan" data-id="${plan.id}" style="width:auto;margin:0;padding:0 10px">Delete</button>
      </div>
    `).join("");

    $$(".delete-plan", container).forEach(btn => {
      btn.addEventListener("click", () => {
        const id = Number(btn.dataset.id);
        const next = saved.filter(plan => plan.id !== id);
        localStorage.setItem(STORAGE.savedPlans, JSON.stringify(next));
        renderSavedPlans();
        showToast("Saved plan deleted");
      });
    });
  }

  function initSettings() {
    const switches = $$(".switch");
    if (!switches.length) return;

    switches.forEach(sw => {
      sw.addEventListener("click", () => {
        sw.classList.toggle("off");
        const key = sw.dataset.setting;
        const current = JSON.parse(localStorage.getItem(STORAGE.settings) || "{}");
        current[key || `setting_${switches.indexOf(sw)}`] = !sw.classList.contains("off");
        localStorage.setItem(STORAGE.settings, JSON.stringify(current));
        showToast(sw.classList.contains("off") ? "Setting disabled" : "Setting enabled");
      });
    });
  }

  function initCompare() {
    const add = $("#compareAdd");
    const cityInput = $("#compareCity");
    const tableBody = $("#compareBody");
    if (!add || !cityInput || !tableBody) return;

    const demo = {
      "Mumbai": ["29°C","78%","22 km/h","84"],
      "Pune": ["27°C","55%","13 km/h","73"],
      "Nashik": ["25°C","31%","11 km/h","62"],
      "Thane": ["28°C","64%","15 km/h","76"]
    };

    add.addEventListener("click", () => {
      const city = cityInput.value.trim();
      if (!city) {
        showToast("Enter a city name.");
        return;
      }
      const values = demo[city] || ["28°C","50%","12 km/h","70"];
      const row = document.createElement("tr");
      row.innerHTML = `<td>${escapeHTML(city)}</td><td>${values[0]}</td><td>${values[1]}</td><td>${values[2]}</td><td>${values[3]}</td>`;
      tableBody.appendChild(row);
      cityInput.value = "";
      showToast(`${city} added to comparison`);
    });
  }

  function initMap() {
    $$(".map-dot").forEach(dot => {
      dot.addEventListener("click", () => {
        showToast(dot.dataset.city ? `${dot.dataset.city}: ${dot.dataset.temp}` : "Weather point selected");
      });
    });
  }

  function init() {
    activateNavigation();
    initMobileMenu();
    initClock();
    initTheme();
    initActivities();
    initPlanner();
    initExampleButton();
    initForecastFilters();
    initSearch();
    initAIChat();
    initSettings();
    initCompare();
    initMap();
    renderSavedPlans();
  }

  document.addEventListener("DOMContentLoaded", () => { init(); initAccountMenu(); });

function initAccountMenu(){
  document.querySelectorAll(".account-menu").forEach(menu => {
    const avatar = menu.querySelector(".account-avatar");
    const name = menu.querySelector(".account-name");
    const toggle = () => menu.classList.toggle("open");
    avatar?.addEventListener("click", toggle);
    name?.addEventListener("click", toggle);
    document.addEventListener("click", e => {
      if(!menu.contains(e.target)) menu.classList.remove("open");
    });
  });
}

})();
