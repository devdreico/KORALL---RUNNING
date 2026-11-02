const pages = [...document.querySelectorAll("[data-page]")];
const navigation = [...document.querySelectorAll("[data-page-link]")];
const modal = document.querySelector("#session-modal");
const toast = document.querySelector(".toast");
const today = new Date();
const monday = new Date(today);
monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
monday.setHours(0, 0, 0, 0);

function dateAtOffset(offset) {
  const date = new Date(monday);
  date.setDate(monday.getDate() + offset);
  return date;
}

function isoWeek(date) {
  const thursday = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  thursday.setUTCDate(thursday.getUTCDate() + 4 - (thursday.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 1));
  return Math.ceil(((thursday - yearStart) / 86400000 + 1) / 7);
}

function shortDate(date) {
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" }).replace(".", "").toUpperCase();
}

function localDateValue(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function showPage(name) {
  pages.forEach((page) => page.classList.toggle("is-visible", page.dataset.page === name));
  navigation.forEach((button) => {
    const active = button.dataset.pageLink === name;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

navigation.forEach((button) => button.addEventListener("click", () => showPage(button.dataset.pageLink)));
document.querySelectorAll("[data-go-page]").forEach((button) => button.addEventListener("click", () => showPage(button.dataset.goPage)));
document.querySelectorAll("[data-open-modal]").forEach((button) => button.addEventListener("click", () => modal.showModal()));

const runners = [
  ["Alex López", "Capitán · Fondo", "42.8", "AL"],
  ["Marina Ruiz", "Velocidad · Series", "38.2", "MR"],
  ["Javi Costa", "Fondo · Trail", "31.5", "JC"],
  ["Lucía Martín", "Media distancia", "28.0", "LM"],
  ["Pablo Serrano", "Fondo · Trail", "24.6", "PS"],
  ["Nerea Vidal", "Velocidad", "21.3", "NV"],
  ["Diego Flores", "Media distancia", "18.8", "DF"],
  ["Sara Campos", "Fondo", "16.2", "SC"],
  ["Mateo Gil", "Velocidad · Series", "14.5", "MG"],
  ["Elena Ríos", "Media distancia", "12.4", "ER"],
  ["Hugo León", "Fondo", "10.8", "HL"],
  ["Irene Soler", "Recuperación", "8.6", "IS"],
];

const roster = document.querySelector("#roster-grid");
function renderRunners(query = "") {
  const filtered = runners.filter(([name, role]) => `${name} ${role}`.toLowerCase().includes(query.toLowerCase()));
  roster.innerHTML = filtered.length
    ? filtered.map(([name, role, distance, initials]) => `<article class="runner-card glass-panel"><span class="runner-avatar">${initials}</span><span class="runner-info"><strong>${name}</strong><span>${role}</span></span><span class="runner-km"><strong>${distance} km</strong><small>ESTA SEMANA</small></span></article>`).join("")
    : '<p class="empty-state">No encontramos a ningún corredor.</p>';
}
renderRunners();
document.querySelector("#team-search").addEventListener("input", (event) => renderRunners(event.target.value));

const weekDays = [
  { day: "LUN", sessions: [["Rodaje progresivo", "07:00"]] },
  { day: "MAR", sessions: [["Descanso activo", "—"]] },
  { day: "MIÉ", sessions: [["Series en pista", "19:00"]] },
  { day: "JUE", sessions: [["Rodaje suave", "07:00"]] },
  { day: "VIE", sessions: [["Movilidad + trote", "18:30"]] },
  { day: "SÁB", sessions: [] },
  { day: "DOM", sessions: [["Fondo · 16 km", "08:00"]] },
];
const weekGrid = document.querySelector("#week-grid");
weekGrid.innerHTML = weekDays.map(({ day, sessions }, index) => {
  const date = dateAtOffset(index);
  const isToday = date.toDateString() === today.toDateString();
  return `<div class="week-day ${isToday ? "is-today" : ""}"><span>${day}</span><strong>${date.toLocaleDateString("es-ES", { day: "2-digit" })}</strong>${sessions.map(([title, time]) => `<div class="calendar-event"><strong>${title}</strong><span>${time}</span></div>`).join("")}</div>`;
}).join("");

const weekNumber = isoWeek(today);
const weekStart = dateAtOffset(0);
const weekEnd = dateAtOffset(6);
const startMonth = weekStart.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
const endMonth = weekEnd.toLocaleDateString("es-ES", { month: "short" }).replace(".", "");
const rangeMonth = weekEnd.toLocaleDateString("es-ES", { month: "long" });
const weekRange = weekStart.getMonth() === weekEnd.getMonth()
  ? `${weekStart.getDate()} — ${weekEnd.getDate()} ${rangeMonth} ${weekEnd.getFullYear()}`
  : `${weekStart.getDate()} ${startMonth} — ${weekEnd.getDate()} ${endMonth} ${weekEnd.getFullYear()}`;
document.querySelector("#calendar-week-label").textContent = `SEMANA ${weekNumber} · ${weekEnd.getFullYear()}`;
document.querySelector("#calendar-range").textContent = weekRange;
document.querySelector("#stats-week-label").textContent = `SEMANA ${weekNumber} · DEL ${weekStart.getDate()} AL ${weekEnd.getDate()} DE ${rangeMonth.toUpperCase()}`;
document.querySelectorAll("[data-session-offset]").forEach((element) => {
  const date = dateAtOffset(Number(element.dataset.sessionOffset));
  const strong = element.querySelector(".session-date strong, .day-badge strong");
  const label = element.querySelector(".session-date span, .day-badge small");
  strong.textContent = date.toLocaleDateString("es-ES", { day: "2-digit" });
  label.textContent = element.classList.contains("day-badge")
    ? date.toLocaleDateString("es-ES", { month: "short" }).replace(".", "").toUpperCase()
    : `${shortDate(date).slice(3)} · ${date.toLocaleDateString("es-ES", { weekday: "short" }).replace(".", "").toUpperCase()}`;
});

let activeFilter = "all";
function filterSessions() {
  const query = document.querySelector("#session-search").value.trim().toLowerCase();
  document.querySelectorAll(".session-list-row").forEach((row) => {
    const matchesStatus = activeFilter === "all" || row.dataset.status === activeFilter;
    const matchesSearch = row.textContent.toLowerCase().includes(query);
    row.hidden = !(matchesStatus && matchesSearch);
  });
}
document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => {
  activeFilter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((tab) => tab.classList.toggle("is-selected", tab === button));
  filterSessions();
}));
document.querySelector("#session-search").addEventListener("input", filterSessions);

let toastTimer;
function announce(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
}

document.querySelector("#session-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const title = data.get("title").toString().trim();
  const location = data.get("location").toString().trim();
  const date = data.get("date").toString();
  const time = data.get("time").toString();
  const formattedDate = new Date(`${date}T12:00:00`).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }).replace(".", "").toUpperCase();
  const row = document.createElement("article");
  row.className = "session-list-row";
  row.dataset.status = "upcoming";
  row.innerHTML = `<div class="session-date"><strong>${date.slice(-2)}</strong><span>${formattedDate}</span></div><div class="session-list-info"><strong></strong><span></span></div><span class="session-type"></span><span class="session-attendance"><i data-lucide="users-round"></i> 0 / 18</span><button class="icon-button" aria-label="Ver sesión"><i data-lucide="arrow-up-right"></i></button>`;
  row.querySelector(".session-list-info strong").textContent = title;
  row.querySelector(".session-list-info span").textContent = `${time} · ${location} · Alex López`;
  row.querySelector(".session-type").textContent = data.get("type").toString().toUpperCase();
  document.querySelector("#session-list").prepend(row);
  if (window.lucide) window.lucide.createIcons();
  event.currentTarget.reset();
  modal.close();
  showPage("sessions");
  announce("Entrenamiento agendado para el equipo.");
});

document.querySelector(".invite-button").addEventListener("click", () => announce("La invitación de corredores estará disponible pronto."));
document.querySelector(".notification-button").addEventListener("click", () => announce("Estás al día con la actividad del equipo."));
document.querySelector(".period-button").addEventListener("click", () => announce("Mostrando el resumen de esta semana."));

document.querySelector("#today-label").innerHTML = `${today.toLocaleDateString("es-ES", { weekday: "long", day: "2-digit", month: "long" }).toUpperCase()} <span class="eyebrow-line"></span> SEMANA ${weekNumber}`;
const dateInput = document.querySelector('#session-form input[name="date"]');
dateInput.min = localDateValue(today);
dateInput.value = localDateValue(dateAtOffset(2));
if (window.lucide) window.lucide.createIcons();