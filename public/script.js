/**
 * CareerPath Tracker - Enterprise Client Engine
 * Fully Responsive, Multi-Screen Adaptive UI (Suits iPhone, Android, Tablet, Laptop & Projected Screens)
 * Offers both offline "Sandbox Demo Mode" (Using localStorage database with mock states)
 * and full-featured "Live Node API Connected Mode" (Syncing with Express/Mongoose backend).
 */

// Global State
let connectionMode = localStorage.getItem("careerpath_mode") || "sandbox"; // 'sandbox' or 'live'
let currentUser = null; // Object containing name, email, lastName, location
let jobs = []; // Loaded job records
let stats = {
  interview: 0,
  pending: 0,
  declined: 0,
};
let monthlyApplication = []; // Temporal sequential graphs tracking

// Filters, Sorts & Pagination States
let searchQuery = "";
let activeStatusFilter = "all";
let activeTypeFilter = "all";
let activeSort = "latest";
let currentPage = 1;
let totalPages = 1;
let totalResultsCount = 0;

// Default initial visual mock data for Sandbox Demo Mode
const MOCK_PRESETS = [
  {
    _id: "mock-job-1",
    company: "Google",
    position: "Senior Frontend Specialist",
    status: "interview",
    jobType: "full-time",
    jobLocation: "Mountain View, CA",
    appliedDate: "2026-05-18",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    salary: "$185,000 + benefits & stock options",
    notes:
      "Initial recruiter questionnaire submitted. System design panel interview scheduled for next Thursday.",
  },
  {
    _id: "mock-job-2",
    company: "Stripe",
    position: "UI Developer",
    status: "pending",
    jobType: "remote",
    jobLocation: "Remote (North America)",
    appliedDate: "2026-05-14",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    salary: "$160,000 base",
    notes:
      "Passed hackerrank online assessment completely. Awaiting direct hiring manager follow-up team review.",
  },
  {
    _id: "mock-job-3",
    company: "Vercel",
    position: "Developer Advocate",
    status: "interview",
    jobType: "full-time",
    jobLocation: "London (Hybrid)",
    appliedDate: "2026-05-02",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    salary: "£120,000 + equity packages",
    notes:
      "Completed portfolio deep dive presentation. Call scheduled with the advocacy core group leads.",
  },
  {
    _id: "mock-job-4",
    company: "Figma",
    position: "Product Integrations Lead",
    status: "declined",
    jobType: "internship",
    jobLocation: "San Francisco, CA",
    appliedDate: "2026-04-12",
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    salary: "$45 / hour",
    notes:
      "Highly qualified pool, but decided to pursue other alignment profiles in this specific headcount quarter.",
  },
];

const MOCK_MONTHS_PRESETS = [
  { date: "Dec 2025", count: 3 },
  { date: "Jan 2026", count: 5 },
  { date: "Feb 2026", count: 8 },
  { date: "Mar 2026", count: 12 },
  { date: "Apr 2026", count: 7 },
  { date: "May 2026", count: 14 },
];

// --- 1. THEME MANAGEMENT WITH REPLICA SAVERS ---
function initTheme() {
  const isDarkMode =
    localStorage.getItem("theme") === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  applyTheme(isDarkMode);
}

function applyTheme(isDark) {
  const moonIcon = document.getElementById("theme-icon-moon");
  const sunIcon = document.getElementById("theme-icon-sun");

  if (isDark) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
    if (moonIcon) moonIcon.classList.add("hidden");
    if (sunIcon) sunIcon.classList.remove("hidden");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
    if (moonIcon) moonIcon.classList.remove("hidden");
    if (sunIcon) sunIcon.classList.add("hidden");
  }
}

function toggleTheme() {
  const isCurrentlyDark = document.documentElement.classList.contains("dark");
  applyTheme(!isCurrentlyDark);
}

// --- 2. PREMIUM DYNAMIC TOAST SERVICE ---
function showToast(message, type = "success") {
  const rail = document.getElementById("toast-rail");
  if (!rail) return;

  const toast = document.createElement("div");
  // Design fully responsive, touch targeted alert container
  toast.className = `toast-animate pointer-events-auto p-4 rounded-2xl shadow-lg border flex items-start gap-3.5 transition-all max-w-sm w-full bg-white dark:bg-slate-900 border-gray-150 dark:border-slate-800 ${
    type === "success"
      ? "border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
      : type === "error"
        ? "border-rose-500/30 text-rose-800 dark:text-rose-400"
        : "border-indigo-500/20 text-slate-700 dark:text-slate-300"
  }`;

  let iconSvg = "";
  if (type === "success") {
    iconSvg = `
      <div class="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/55 text-emerald-600 dark:text-emerald-400 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
      </div>`;
  } else if (type === "error") {
    iconSvg = `
      <div class="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/55 text-rose-600 dark:text-rose-400 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      </div>`;
  } else {
    iconSvg = `
      <div class="p-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/55 text-indigo-650 dark:text-indigo-400 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      </div>`;
  }

  toast.innerHTML = `
    ${iconSvg}
    <div class="flex-1 text-xs font-semibold leading-relaxed pt-0.5">${message}</div>
    <button class="p-0.5 text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer toast-close-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  const closeBtn = toast.querySelector(".toast-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      toast.remove();
    });
  }

  rail.appendChild(toast);

  // Clear animation trigger fallback
  setTimeout(() => {
    toast.classList.add("opacity-0", "translate-x-12");
    setTimeout(() => toast.remove(), 250);
  }, 5000);
}

// --- 3. MODE SELECTOR CONTROLLERS (SANDBOX VS LIVE API MODE) ---
function updateModeButtons() {
  const sandboxBtn = document.getElementById("mode-sandbox");
  const liveBtn = document.getElementById("mode-live");

  if (connectionMode === "live") {
    sandboxBtn.className =
      "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-500 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white";
    liveBtn.className =
      "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-indigo-600 dark:bg-indigo-900 text-white shadow-xs border border-indigo-500/20";
    showToast(
      "Switched to Live Node API mode. Synchronizing requests directly with backend servers.",
      "info",
    );
  } else {
    sandboxBtn.className =
      "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-gray-150 dark:border-slate-850";
    liveBtn.className =
      "px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer text-gray-500 dark:text-slate-400 hover:text-gray-950 dark:hover:text-white";
    showToast(
      "Switched to Sandbox Mode. Storing documents cleanly in your secure browser Local Storage.",
      "info",
    );
  }

  localStorage.setItem("careerpath_mode", connectionMode);
  checkSession();
}

// Helper to configure authorization headers automatically
function getAuthHeaders() {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("careerpath_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Exception resolver to capture exact REST API backend message outputs
async function parseBackendError(response) {
  try {
    const errorJson = await response.json();
    return (
      errorJson.msg ||
      errorJson.message ||
      `API exception triggered (Status ${response.status})`
    );
  } catch (err) {
    return `Network transaction error (Status ${response.status}). Ensure your server is active on Port 3000.`;
  }
}

// --- 4. SESSION SYSTEM MANAGER ---
function checkSession() {
  // Check tokens mapping
  if (connectionMode === "live") {
    const token = localStorage.getItem("careerpath_token");
    const cachedUser = localStorage.getItem("careerpath_user");

    if (token && cachedUser) {
      try {
        currentUser = JSON.parse(cachedUser);
        loadDashboard();
      } catch (e) {
        clearAuthData();
        showAuthView();
      }
    } else {
      showAuthView();
    }
  } else {
    // Sandbox uses simple credential structures
    const cachedUser = localStorage.getItem("careerpath_sandbox_user");
    if (cachedUser) {
      try {
        currentUser = JSON.parse(cachedUser);
        loadDashboard();
      } catch (e) {
        currentUser = null;
        showAuthView();
      }
    } else {
      showAuthView();
    }
  }
}

function showAuthView() {
  document.getElementById("auth-container").classList.remove("hidden");
  document.getElementById("dashboard-container").classList.add("hidden");
}

function loadDashboard() {
  document.getElementById("auth-container").classList.add("hidden");
  document.getElementById("dashboard-container").classList.remove("hidden");

  // Set avatar initials & username representation
  const avatarLetter = currentUser.name
    ? currentUser.name.charAt(0).toUpperCase()
    : "U";
  document.getElementById("user-avatar").innerText = avatarLetter;
  document.getElementById("dashboard-user-name").innerText =
    currentUser.name || "User";

  // Auto prep date input
  const dateInput = document.getElementById("form-applied-date");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }

  // Refresh records and graphics layout
  currentPage = 1;
  syncData();
}

function clearAuthData() {
  if (connectionMode === "live") {
    localStorage.removeItem("careerpath_token");
    localStorage.removeItem("careerpath_user");
  } else {
    localStorage.removeItem("careerpath_sandbox_user");
  }
  currentUser = null;
  jobs = [];
}

function handleLogOut() {
  clearAuthData();
  showToast("Session disconnected successfully.", "info");
  showAuthView();
  closeAllModals();
}

// --- 5. DATA SYNCRONIZATION PIPELINE (FETCH COUPLERS) ---
async function syncData() {
  const spinner = document.getElementById("jobs-list-spinner");
  const emptyPlaceholder = document.getElementById("jobs-list-empty");
  const listContainer = document.getElementById("jobs-grid-container");

  if (spinner) spinner.classList.remove("hidden");
  if (emptyPlaceholder) emptyPlaceholder.classList.add("hidden");
  if (listContainer) listContainer.innerHTML = "";

  if (connectionMode === "live") {
    try {
      // 1. Fetch dynamic aggregation statistics
      const statsResponse = await fetch("/api/v1/jobs/stats", {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        // Backend maps stats as defaultStats: { interview, pending, declined }
        stats = {
          interview: statsData.defaultStats?.interview || 0,
          pending: statsData.defaultStats?.pending || 0,
          declined: statsData.defaultStats?.declined || 0,
        };
        // Backend maps monthly application arrays as: monthlyApplication: [ { date, count } ]
        monthlyApplication = statsData.monthlyApplication || [];
      } else {
        // Fallback error logs
        const errMsg = await parseBackendError(statsResponse);
        console.warn("Stats API sync skipped:", errMsg);
      }

      // 2. Fetch structural paginated lists
      // Build search-query routes matching API requirements
      const statusParam =
        activeStatusFilter === "all" ? "" : activeStatusFilter;
      const typeParam = activeTypeFilter === "all" ? "" : activeTypeFilter;

      const queryParams = new URLSearchParams({
        search: searchQuery,
        status: statusParam,
        jobType: typeParam,
        sort: activeSort,
        page: currentPage,
        limit: 10,
      });

      const response = await fetch(`/api/v1/jobs?${queryParams.toString()}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const payload = await response.json();
        // Backend output: { jobs: [...], totalJobs: Number, numOfPages: Number }
        jobs = payload.jobs || [];
        totalResultsCount = payload.totalJobs || jobs.length;
        totalPages = payload.numOfPages || 1;

        renderDOM();
      } else {
        const errMsg = await parseBackendError(response);
        showToast(errMsg, "error");
        // Fallback to local sandbox mock data to avoid empty lock screen in preview!
        showToast(
          "Backend Server returned error code. Showing client sandbox replica data to review interface layout.",
          "info",
        );
        loadSandboxFallback();
      }
    } catch (error) {
      console.error("Critical API request failed:", error);
      showToast(
        "Could not communicate with your Live Node.js backend. Retaining interactive sandboxed emulator.",
        "error",
      );
      loadSandboxFallback();
    }
  } else {
    // Standard Local Storage Emulator Synchronization
    loadSandbox();
  }
}

function loadSandboxFallback() {
  // Load mock presets dynamically directly into stats/tables to prevent blank iframe blocks
  stats = {
    interview: MOCK_PRESETS.filter((j) => j.status === "interview").length,
    pending: MOCK_PRESETS.filter((j) => j.status === "pending").length,
    declined: MOCK_PRESETS.filter((j) => j.status === "declined").length,
  };
  monthlyApplication = [...MOCK_MONTHS_PRESETS];
  jobs = [...MOCK_PRESETS];
  totalResultsCount = jobs.length;
  totalPages = 1;
  renderDOM();
}

function loadSandbox() {
  // Load emulator collections from localStorage
  const key = `careerpath_sandbox_jobs_${currentUser.email}`;
  let sandboxedCollection = [];
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      sandboxedCollection = JSON.parse(raw);
    } else {
      sandboxedCollection = [...MOCK_PRESETS];
      localStorage.setItem(key, JSON.stringify(sandboxedCollection));
    }
  } catch (err) {
    sandboxedCollection = [...MOCK_PRESETS];
  }

  // Calculate aggregation fields
  stats = {
    pending: sandboxedCollection.filter((j) => j.status === "pending").length,
    interview: sandboxedCollection.filter((j) => j.status === "interview")
      .length,
    declined: sandboxedCollection.filter((j) => j.status === "declined").length,
  };

  // Pre-fill monthly application count graph
  monthlyApplication = [...MOCK_MONTHS_PRESETS];

  // Perform local search, filtering and sorting mimicking database pipelines
  let results = sandboxedCollection.filter((job) => {
    const matchesStatus =
      activeStatusFilter === "all" || job.status === activeStatusFilter;
    const matchesType =
      activeTypeFilter === "all" || job.jobType === activeTypeFilter;

    const matchesSearch =
      !searchQuery ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.jobLocation &&
        job.jobLocation.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesType && matchesSearch;
  });

  // Database ordering
  if (activeSort === "latest") {
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (activeSort === "oldest") {
    results.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (activeSort === "a-z") {
    results.sort((a, b) => a.position.localeCompare(b.position));
  } else if (activeSort === "z-a") {
    results.sort((a, b) => b.position.localeCompare(a.position));
  }

  // Local Pagination
  totalResultsCount = results.length;
  const itemsPerPage = 8;
  totalPages = Math.max(Math.ceil(totalResultsCount / itemsPerPage), 1);
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  jobs = results.slice(startIndex, startIndex + itemsPerPage);

  renderDOM();
}

// --- 6. RENDER LAYOUT CONTROLLER (DOM POPULATOR) ---
function renderDOM() {
  const spinner = document.getElementById("jobs-list-spinner");
  const emptyPlaceholder = document.getElementById("jobs-list-empty");
  const listContainer = document.getElementById("jobs-grid-container");

  if (spinner) spinner.classList.add("hidden");

  // Update Dynamic Metrics Widgets
  document.getElementById("stat-val-pending").innerText = stats.pending;
  document.getElementById("stat-val-interview").innerText = stats.interview;
  document.getElementById("stat-val-declined").innerText = stats.declined;

  // Render SVG Applications Temporal Graph
  drawSvgGraph();

  // Update Results Found tags
  document.getElementById("master-results-count").innerText = totalResultsCount;

  // Check Empty logs states
  if (jobs.length === 0) {
    if (emptyPlaceholder) emptyPlaceholder.classList.remove("hidden");
    if (listContainer) listContainer.innerHTML = "";
    updatePaginationDOM(true);
    return;
  }

  if (emptyPlaceholder) emptyPlaceholder.classList.add("hidden");

  // Draw Grid listings
  listContainer.innerHTML = jobs
    .map((job) => {
      let statusClass = "";
      let statusName = "";

      switch (job.status) {
        case "pending":
          statusClass =
            "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50 dark:border-amber-900/20";
          statusName = "Applied / Pending";
          break;
        case "interview":
          statusClass =
            "bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200/50 dark:border-purple-900/20";
          statusName = "Interview Stage";
          break;
        case "declined":
          statusClass =
            "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/50 dark:border-rose-900/20";
          statusName = "Declined / Archived";
          break;
        default:
          statusClass =
            "bg-slate-50 text-slate-800 dark:bg-slate-900/50 dark:text-slate-200 border-gray-200/50 dark:border-slate-800";
          statusName = job.status || "Tracked";
      }

      const typeLabel = job.jobType
        ? job.jobType.replace("-", " ")
        : "Full Time";
      const cleanDate = job.appliedDate
        ? new Date(job.appliedDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "Just now";

      return `
      <div class="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-150 dark:border-slate-850 hover:border-indigo-500/30 dark:hover:border-indigo-500/20 shadow-xs hover:shadow-md transition-all flex flex-col justify-between" id="job-card-${job._id}">
        
        <div class="space-y-3.5">
          <!-- Card Header layout -->
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <span class="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border font-mono ${statusClass}">
                ${statusName}
              </span>
              <h4 class="text-base font-extrabold text-slate-905 dark:text-white leading-tight mt-1.5">${job.company}</h4>
              <p class="text-xs text-indigo-650 dark:text-indigo-400 font-bold">${job.position}</p>
            </div>
            
            <!-- Quick edit actions trigger -->
            <div class="flex items-center gap-1">
              <button data-action="edit" data-id="${job._id}" class="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition-all cursor-pointer" title="Edit listing details">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </button>
              <button data-action="delete" data-id="${job._id}" class="p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-455 hover:bg-slate-50 dark:hover:bg-slate-950 rounded-xl transition-all cursor-pointer" title="Remove application">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6"/></svg>
              </button>
            </div>
          </div>

          <!-- Workplace parameters row grid -->
          <div class="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-gray-150/40 dark:border-slate-800/50 text-[11px] font-sans">
            <div>
              <span class="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Contract Mode</span>
              <span class="font-extrabold text-slate-700 dark:text-slate-300 capitalize truncate block">${typeLabel}</span>
            </div>
            <div>
              <span class="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Logged Date</span>
              <span class="font-medium text-slate-700 dark:text-slate-300 truncate block">${cleanDate}</span>
            </div>
            <div class="col-span-2 border-t border-gray-200/50 dark:border-slate-850/60 pt-2 mt-1.5">
              <span class="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest block font-mono">Job Location</span>
              <span class="font-bold text-slate-755 dark:text-slate-355 truncate block flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" class="text-indigo-505" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>${job.jobLocation || "Not localizable / Remote"}</span>
              </span>
            </div>
          </div>

          <!-- Recruiter notes,CV links optional values -->
          ${
            job.notes
              ? `
            <div class="p-3 bg-slate-50/50 dark:bg-slate-950/20 text-[11px] leading-relaxed text-gray-500 dark:text-slate-400 border border-gray-150/40 dark:border-slate-800/30 rounded-xl max-h-[80px] overflow-y-auto">
              <span class="font-extrabold text-[8px] uppercase tracking-widest text-slate-400 block font-mono">Timeline Instruction Notes</span>
              <p class="mt-1 font-sans whitespace-pre-wrap">${job.notes}</p>
            </div>
          `
              : ""
          }
        </div>

        <!-- Meta list url anchors -->
        ${
          job.salary || job.url
            ? `
          <div class="pt-3.5 border-t border-gray-100 dark:border-slate-850 flex justify-between items-center text-xs">
            <span class="font-bold text-indigo-650 dark:text-indigo-400 font-mono text-[11px]" title="Listed salary parameter">
              ${job.salary ? job.salary : "Comp pending"}
            </span>
            ${
              job.url
                ? `
              <a href="${job.url}" target="_blank" rel="noopener noreferrer" class="font-bold text-indigo-550 dark:text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[11px]">
                <span>Listing Details</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="shrink-0"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/></svg>
              </a>
            `
                : ""
            }
          </div>
        `
            : ""
        }

      </div>
    `;
    })
    .join("");

  updatePaginationDOM(false);
}

function updatePaginationDOM(isEmpty) {
  const pag = document.getElementById("pagination-controls");
  const btnPrev = document.getElementById("pag-prev");
  const btnNext = document.getElementById("pag-next");
  const curSpan = document.getElementById("pag-current");
  const totSpan = document.getElementById("pag-total");

  if (isEmpty) {
    if (pag) pag.classList.add("hidden");
    return;
  }

  if (pag) pag.classList.remove("hidden");
  if (curSpan) curSpan.innerText = currentPage;
  if (totSpan) totSpan.innerText = totalPages;

  if (btnPrev) {
    if (currentPage <= 1) {
      btnPrev.setAttribute("disabled", "true");
      btnPrev.classList.add("opacity-40", "pointer-events-none");
    } else {
      btnPrev.removeAttribute("disabled");
      btnPrev.classList.remove("opacity-40", "pointer-events-none");
    }
  }

  if (btnNext) {
    if (currentPage >= totalPages) {
      btnNext.setAttribute("disabled", "true");
      btnNext.classList.add("opacity-40", "pointer-events-none");
    } else {
      btnNext.removeAttribute("disabled");
      btnNext.classList.remove("opacity-40", "pointer-events-none");
    }
  }
}

function drawSvgGraph() {
  const container = document.getElementById("chart-bars-container");
  if (!container) return;

  // Render month bars using computed aggregate lengths
  if (monthlyApplication.length === 0) {
    monthlyApplication = [...MOCK_MONTHS_PRESETS];
  }

  const maxVal = Math.max(...monthlyApplication.map((item) => item.count), 1);

  // Clear vertical grids
  container.innerHTML = `
    <!-- SVG grid lines -->
    <div class="absolute inset-x-0 top-1/4 border-b border-gray-150/40 dark:border-slate-805/30 pointer-events-none"></div>
    <div class="absolute inset-x-0 top-2/4 border-b border-gray-150/40 dark:border-slate-805/30 pointer-events-none"></div>
    <div class="absolute inset-x-0 top-3/4 border-b border-gray-150/40 dark:border-slate-805/30 pointer-events-none"></div>
  `;

  monthlyApplication.forEach((item) => {
    const rawPercentage = (item.count / maxVal) * 100;
    // Cap minimum representation bar so we still display 0s as nice baseline indices
    const barHeight = Math.max(rawPercentage, 8);

    const verticalBar = document.createElement("div");
    verticalBar.className =
      "flex-1 flex flex-col items-center justify-end h-full group z-10 select-none";
    verticalBar.innerHTML = `
      <div class="relative w-8 sm:w-11 bg-indigo-600/10 dark:bg-indigo-501/10 group-hover:bg-indigo-600/15 dark:group-hover:bg-indigo-400/20 border border-indigo-600/20 dark:border-indigo-400/25 rounded-t-lg flex items-end justify-center transition-all duration-300" style="height: ${barHeight}%">
        <span class="absolute -top-7 scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold transition-all duration-200 z-50 pointer-events-none shadow-sm whitespace-nowrap">
          ${item.count} log${item.count === 1 ? "" : "s"}
        </span>
        <div class="w-full bg-gradient-to-t from-indigo-600 to-indigo-500 dark:from-indigo-600 dark:to-indigo-400 h-full rounded-t-md transition-all duration-300 shadow-sm shadow-indigo-600/10"></div>
      </div>
      <span class="text-[9px] font-bold text-gray-400 dark:text-slate-500 mt-2 font-mono text-center tracking-tight truncate max-w-[50px] sm:max-w-none uppercase">
        ${item.date}
      </span>
    `;
    container.appendChild(verticalBar);
  });
}

// --- 7. AUTH SERVICE HANDLERS ---
async function handleAuthSubmit(event) {
  event.preventDefault();

  const isRegistering = document
    .getElementById("auth-tab-register")
    .classList.contains("border-indigo-600");
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;

  if (!email || !password) {
    showToast("Email address and password are required credentials.", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters.", "error");
    return;
  }

  // Live Server Authenticator
  if (connectionMode === "live") {
    if (isRegistering) {
      const name = document.getElementById("auth-name").value.trim();
      const lastName =
        document.getElementById("auth-lastname").value.trim() || "Last Name";
      const location =
        document.getElementById("auth-location").value.trim() || "My City";

      if (!name) {
        showToast(
          "First Name attribute is required to instantiate accounts.",
          "error",
        );
        return;
      }

      try {
        const payload = { name, email, password, lastName, location };
        const response = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          // Backend output: { user: { name, email, lastName, location }, token }
          localStorage.setItem("careerpath_token", data.token);
          localStorage.setItem("careerpath_user", JSON.stringify(data.user));

          currentUser = data.user;
          showToast(
            `Account created successfully! Welcome, ${currentUser.name}.`,
          );
          event.target.reset();
          loadDashboard();
        } else {
          const errMsg = await parseBackendError(response);
          showToast(errMsg, "error");
        }
      } catch (err) {
        console.error(err);
        showToast(
          "Could not communicate with Account Services. Server appears down on Port 3000.",
          "error",
        );
      }
    } else {
      // Login flow
      try {
        const payload = { email, password };
        const response = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("careerpath_token", data.token);
          localStorage.setItem("careerpath_user", JSON.stringify(data.user));

          currentUser = data.user;
          showToast(`Signed-in successfully! Syncing records.`);
          event.target.reset();
          loadDashboard();
        } else {
          const errMsg = await parseBackendError(response);
          showToast(errMsg, "error");
        }
      } catch (err) {
        console.error(err);
        showToast(
          "Could not sync authentication. Verify that your Mongoose local instance is active.",
          "error",
        );
      }
    }
  } else {
    // Sandbox emulator authenticator
    if (isRegistering) {
      const name =
        document.getElementById("auth-name").value.trim() ||
        email.split("@")[0];
      const lastName =
        document.getElementById("auth-lastname").value.trim() || "Lastname";
      const location =
        document.getElementById("auth-location").value.trim() || "Remoteville";

      const userObject = { name, email, lastName, location };
      localStorage.setItem(
        "careerpath_sandbox_user",
        JSON.stringify(userObject),
      );
      currentUser = userObject;
      showToast("A account was successfully created locally in Sandbox Mode.");
      event.target.reset();
      loadDashboard();
    } else {
      // Mock log in
      const defaultUserObject = {
        name: email.split("@")[0],
        email: email,
        lastName: "Developer",
        location: "Co-working Office",
      };
      localStorage.setItem(
        "careerpath_sandbox_user",
        JSON.stringify(defaultUserObject),
      );
      currentUser = defaultUserObject;
      showToast(
        `Logged in successfully inside local emulator workspace. Welcome!`,
      );
      event.target.reset();
      loadDashboard();
    }
  }
}

// --- 8. JOB DIALOG HANDLERS (LOG NEW / EDIT PRE-FILLS) ---
function openJobModal(editingJobId = null) {
  const modal = document.getElementById("job-modal");
  const card = document.getElementById("job-modal-card");
  const title = document.getElementById("job-modal-title");
  const submitBtn = document.getElementById("job-modal-submit");

  if (!modal || !card) return;

  // Reset Errors
  document.getElementById("form-error-banner").classList.add("hidden");
  document.getElementById("job-form").reset();
  document.getElementById("form-job-id").value = "";

  // Select defaults
  selectFormStatus("pending");
  selectFormType("full-time");

  if (editingJobId) {
    const jobObj = jobs.find((j) => j._id === editingJobId);
    if (!jobObj) return;

    title.innerHTML = `Modify <strong>${jobObj.company}</strong> Application`;
    submitBtn.innerText = "Save Changes";

    // Prepopulate
    document.getElementById("form-job-id").value = jobObj._id;
    document.getElementById("form-company").value = jobObj.company;
    document.getElementById("form-position").value = jobObj.position;
    document.getElementById("form-job-location").value =
      jobObj.jobLocation || "";

    // Custom non-schema tracking values can hold in local storages or just safe keys
    // In index.html we have hidden salary or notes fields, let's inject if they exist
    // Check if form has notes or url/salary
    const salInput = document.getElementById("form-salary");
    if (salInput) salInput.value = jobObj.salary || "";

    const urlInput = document.getElementById("form-url");
    if (urlInput) urlInput.value = jobObj.url || "";

    const notesTxt = document.getElementById("form-notes");
    if (notesTxt) notesTxt.value = jobObj.notes || "";

    selectFormStatus(jobObj.status || "pending");
    selectFormType(jobObj.jobType || "full-time");
  } else {
    title.innerText = "Track New Job Application";
    submitBtn.innerText = "Track Application";
  }

  // Open Transitions
  modal.classList.remove("hidden");
  setTimeout(() => {
    card.classList.remove("scale-95", "opacity-0");
    card.classList.add("scale-100", "opacity-100");
  }, 10);
}

function selectFormStatus(val) {
  const buttons = document.querySelectorAll(
    "#form-status-selector .status-btn",
  );
  buttons.forEach((btn) => {
    const matches = btn.getAttribute("data-val") === val;
    if (matches) {
      btn.className =
        "status-btn px-4 py-2 rounded-xl text-xs font-bold border bg-indigo-600 border-indigo-600 text-white shadow-sm ring-1 ring-indigo-500 cursor-pointer";
    } else {
      btn.className =
        "status-btn px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer";
    }
  });
  document
    .getElementById("form-status-selector")
    .setAttribute("data-selected", val);
}

function selectFormType(val) {
  const buttons = document.querySelectorAll("#form-type-selector .jobtype-btn");
  buttons.forEach((btn) => {
    const matches = btn.getAttribute("data-val") === val;
    if (matches) {
      btn.className =
        "jobtype-btn px-3.5 py-2 rounded-xl text-xs font-bold border bg-indigo-600 border-indigo-600 text-white shadow-sm ring-1 ring-indigo-500 cursor-pointer";
    } else {
      btn.className =
        "jobtype-btn px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer";
    }
  });
  document
    .getElementById("form-type-selector")
    .setAttribute("data-selected", val);
}

function closeJobModal() {
  const modal = document.getElementById("job-modal");
  const card = document.getElementById("job-modal-card");
  if (!modal || !card) return;

  card.classList.remove("scale-100", "opacity-100");
  card.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 200);
}

// --- 9. PROFILE MANAGEMENT DIALOG ---
function openProfileModal() {
  const modal = document.getElementById("profile-modal");
  const card = document.getElementById("profile-modal-card");
  if (!modal || !card) return;

  // Populate actual data
  document.getElementById("profile-name").value = currentUser.name || "";
  document.getElementById("profile-lastname").value =
    currentUser.lastName === "Last Name" ? "" : currentUser.lastName || "";
  document.getElementById("profile-email").value = currentUser.email || "";
  document.getElementById("profile-location").value =
    currentUser.location === "My City" ? "" : currentUser.location || "";

  modal.classList.remove("hidden");
  setTimeout(() => {
    card.classList.remove("scale-95", "opacity-0");
    card.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closeProfileModal() {
  const modal = document.getElementById("profile-modal");
  const card = document.getElementById("profile-modal-card");
  if (!modal || !card) return;

  card.classList.remove("scale-100", "opacity-100");
  card.classList.add("scale-95", "opacity-0");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 200);
}

async function handleProfileSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("profile-name").value.trim();
  const lastName =
    document.getElementById("profile-lastname").value.trim() || "Last Name";
  const email = document.getElementById("profile-email").value.trim();
  const location =
    document.getElementById("profile-location").value.trim() || "My City";

  if (!name || !email) {
    showToast("Name and email are required properties.", "error");
    return;
  }

  if (connectionMode === "live") {
    try {
      const payload = { name, lastName, email, location };
      const response = await fetch("/api/v1/auth/update", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        // Returns { user: { name, email, lastName, location }, token }
        localStorage.setItem("careerpath_token", data.token);
        localStorage.setItem("careerpath_user", JSON.stringify(data.user));

        currentUser = data.user;
        document.getElementById("dashboard-user-name").innerText =
          currentUser.name;
        document.getElementById("user-avatar").innerText = currentUser.name
          .charAt(0)
          .toUpperCase();

        showToast("Profile data synchronized successfully.");
        event.target.reset();
        closeProfileModal();
        syncData();
      } else {
        const errMsg = await parseBackendError(response);
        showToast(errMsg, "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to connect to profile servers on Port 3000.", "error");
    }
  } else {
    // Sandbox save
    currentUser = { name, lastName, email, location };
    localStorage.setItem(
      "careerpath_sandbox_user",
      JSON.stringify(currentUser),
    );

    document.getElementById("dashboard-user-name").innerText = currentUser.name;
    document.getElementById("user-avatar").innerText = currentUser.name
      .charAt(0)
      .toUpperCase();

    showToast("Profile credentials written to sandbox memory.");
    event.target.reset();
    closeProfileModal();
    syncData();
  }
}

// --- 10. CRUD WRAPPERS ---
async function handleJobSubmit(event) {
  event.preventDefault();

  const company = document.getElementById("form-company").value.trim();
  const position = document.getElementById("form-position").value.trim();
  const status =
    document
      .getElementById("form-status-selector")
      .getAttribute("data-selected") || "pending";
  const jobType =
    document
      .getElementById("form-type-selector")
      .getAttribute("data-selected") || "full-time";
  const jobLocation =
    document.getElementById("form-job-location").value.trim() || "my city";
  const jobId = document.getElementById("form-job-id").value;

  // Auxiliary fields
  const salary = document.getElementById("form-salary")?.value.trim() || "";
  const url = document.getElementById("form-url")?.value.trim() || "";
  const notes = document.getElementById("form-notes")?.value.trim() || "";

  if (!company || !position) {
    document.getElementById("form-error-banner").innerText =
      "Company name and job position/role are strictly required.";
    document.getElementById("form-error-banner").classList.remove("hidden");
    return;
  }

  if (connectionMode === "live") {
    try {
      const payload = { company, position, status, jobType, jobLocation };

      // Since the API only returns job structure, the auxiliary data can be submitted.
      // Safe to pass additional model attributes, we can save them as well!
      payload.salary = salary;
      payload.url = url;
      payload.notes = notes;

      let response;
      if (jobId) {
        // Update model patch
        response = await fetch(`/api/v1/jobs/${jobId}`, {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        // Create model post
        response = await fetch("/api/v1/jobs", {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        showToast(
          jobId
            ? "Updated listing parameters on database server."
            : "Successfully tracked next job on system server.",
        );
        event.target.reset();
        closeJobModal();
        syncData();
      } else {
        const errorMsg = await parseBackendError(response);
        document.getElementById("form-error-banner").innerText = errorMsg;
        document.getElementById("form-error-banner").classList.remove("hidden");
        showToast(errorMsg, "error");
      }
    } catch (err) {
      console.error(err);
      showToast(
        "Failing to submit. Verify your API middleware authentication settings.",
        "error",
      );
    }
  } else {
    // Sandbox mode CRUD
    const key = `careerpath_sandbox_jobs_${currentUser.email}`;
    let items = [];
    try {
      items = JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      items = [];
    }

    if (jobId) {
      const index = items.findIndex((j) => j._id === jobId);
      if (index !== -1) {
        items[index] = {
          _id: jobId,
          company,
          position,
          status,
          jobType,
          jobLocation,
          appliedDate: new Date().toISOString().split("T")[0],
          createdAt: items[index].createdAt || new Date().toISOString(),
          salary,
          url,
          notes,
        };
        showToast("Logged modification inside emulator datastore.");
      }
    } else {
      const newItem = {
        _id: "job-" + Date.now(),
        company,
        position,
        status,
        jobType,
        jobLocation,
        appliedDate: new Date().toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        salary,
        url,
        notes,
      };
      items.unshift(newItem);
      showToast("Added tracking event record into sandbox timeline.");
    }

    localStorage.setItem(key, JSON.stringify(items));
    event.target.reset();
    closeJobModal();
    syncData();
  }
}

async function triggerEditForm(id) {
  openJobModal(id);
}

// Global scope mapping for onclick commands inside parsed arrays
window.triggerEditForm = triggerEditForm;

async function triggerDeleteRecord(id) {
  const match = jobs.find((j) => j._id === id);
  if (!match) return;

  if (
    confirm(
      `Do you wish to permanently remove tracking for "${match.company}"?`,
    )
  ) {
    if (connectionMode === "live") {
      try {
        const response = await fetch(`/api/v1/jobs/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });

        if (response.ok) {
          showToast(`Purged application with ${match.company} from DB.`);
          syncData();
        } else {
          const errMsg = await parseBackendError(response);
          showToast(errMsg, "error");
        }
      } catch (err) {
        console.error(err);
        showToast(
          "Error processing. Verify DB network ingress configurations.",
          "error",
        );
      }
    } else {
      // Sandbox delete
      const key = `careerpath_sandbox_jobs_${currentUser.email}`;
      let items = JSON.parse(localStorage.getItem(key)) || [];
      items = items.filter((j) => j._id !== id);
      localStorage.setItem(key, JSON.stringify(items));
      showToast(`Removed application with ${match.company} from sandbox.`);
      syncData();
    }
  }
}

window.triggerDeleteRecord = triggerDeleteRecord;

function closeAllModals() {
  closeJobModal();
  closeProfileModal();
}

// --- 11. EVENT LISTENERS COUPLERS IN DOM ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. Bright theme loaders
  initTheme();
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  // 2. Switched connection formats
  const sandBtn = document.getElementById("mode-sandbox");
  const liveBtn = document.getElementById("mode-live");

  if (sandBtn)
    sandBtn.addEventListener("click", () => {
      connectionMode = "sandbox";
      updateModeButtons();
    });
  if (liveBtn)
    liveBtn.addEventListener("click", () => {
      connectionMode = "live";
      updateModeButtons();
    });

  // 3. Tab selectors inside Auth window
  const tabLogin = document.getElementById("auth-tab-login");
  const tabRegister = document.getElementById("auth-tab-register");
  const specialFields = document.getElementById("register-special-fields");
  const submitText = document.getElementById("auth-submit-text");
  const formTitle = document.getElementById("auth-form-title");
  const formHelp = document.getElementById("auth-form-help");

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", () => {
      tabLogin.className =
        "flex-1 py-4 text-sm font-bold text-gray-905 dark:text-white border-b-2 border-indigo-600 bg-slate-50/40 dark:bg-slate-950/10 cursor-pointer";
      tabRegister.className =
        "flex-1 py-4 text-sm font-bold text-gray-400 dark:text-slate-500 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-slate-300 cursor-pointer";
      specialFields.classList.add("hidden");
      submitText.innerText = "Sign In";
      formTitle.innerText = "Login Credentials";
      formHelp.innerText =
        "Provide your personal registered email credentials to load your dashboard timelines.";
    });

    tabRegister.addEventListener("click", () => {
      tabRegister.className =
        "flex-1 py-4 text-sm font-bold text-gray-905 dark:text-white border-b-2 border-indigo-600 bg-slate-50/40 dark:bg-slate-950/10 cursor-pointer";
      tabLogin.className =
        "flex-1 py-4 text-sm font-bold text-gray-400 dark:text-slate-500 border-b-2 border-transparent hover:text-gray-700 dark:hover:text-slate-300 cursor-pointer";
      specialFields.classList.remove("hidden");
      submitText.innerText = "Create Free Account";
      formTitle.innerText = "Account Instantiation";
      formHelp.innerText =
        "Register a personal credential set to initialize your customized tracker timeline.";
    });
  }

  // 4. Password toggles
  const passToggle = document.getElementById("auth-password-toggle-btn");
  const passInput = document.getElementById("auth-password");
  const eyeOpen = document.getElementById("auth-eye-open");
  const eyeClosed = document.getElementById("auth-eye-closed");

  if (passToggle && passInput) {
    passToggle.addEventListener("click", () => {
      if (passInput.type === "password") {
        passInput.type = "text";
        eyeOpen.classList.remove("hidden");
        eyeClosed.classList.add("hidden");
      } else {
        passInput.type = "password";
        eyeOpen.classList.add("hidden");
        eyeClosed.classList.remove("hidden");
      }
    });
  }

  // 5. Auth inputs submit hooks
  const authForm = document.getElementById("auth-form");
  if (authForm) authForm.addEventListener("submit", handleAuthSubmit);

  // 6. Sign out buttons
  const signoutBtn = document.getElementById("auth-signout");
  if (signoutBtn) signoutBtn.addEventListener("click", handleLogOut);

  // 7. Profile modifications actions
  const profileTrigger = document.getElementById("profile-trigger-btn");
  if (profileTrigger)
    profileTrigger.addEventListener("click", openProfileModal);

  const profileClose = document.getElementById("profile-modal-close");
  if (profileClose) profileClose.addEventListener("click", closeProfileModal);

  const profileCancel = document.getElementById("profile-modal-cancel");
  if (profileCancel) profileCancel.addEventListener("click", closeProfileModal);

  const profileBackdrop = document.getElementById("profile-modal-backdrop");
  if (profileBackdrop)
    profileBackdrop.addEventListener("click", closeProfileModal);

  const profileForm = document.getElementById("profile-form");
  if (profileForm) profileForm.addEventListener("submit", handleProfileSubmit);

  // 8. Filters Workspace state hooks
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim();
      currentPage = 1;
      syncData();
    });
  }

  const statFilter = document.getElementById("filter-status");
  if (statFilter) {
    statFilter.addEventListener("change", (e) => {
      activeStatusFilter = e.target.value;
      currentPage = 1;
      syncData();
    });
  }

  const typeFilter = document.getElementById("filter-jobtype");
  if (typeFilter) {
    typeFilter.addEventListener("change", (e) => {
      activeTypeFilter = e.target.value;
      currentPage = 1;
      syncData();
    });
  }

  const sortFilter = document.getElementById("filter-sort");
  if (sortFilter) {
    sortFilter.addEventListener("change", (e) => {
      activeSort = e.target.value;
      currentPage = 1;
      syncData();
    });
  }

  const resetFiltersBtn = document.getElementById("clear-filters");
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      searchQuery = "";
      activeStatusFilter = "all";
      activeTypeFilter = "all";
      activeSort = "latest";
      currentPage = 1;

      if (searchInput) searchInput.value = "";
      if (statFilter) statFilter.value = "all";
      if (typeFilter) typeFilter.value = "all";
      if (sortFilter) sortFilter.value = "latest";

      showToast("Workspace filters reset.", "info");
      syncData();
    });
  }

  // 9. Sync loaders buttons
  const refreshStats = document.getElementById("refresh-stats-btn");
  if (refreshStats) {
    refreshStats.addEventListener("click", () => {
      const icon = document.getElementById("refresh-icon");
      if (icon) icon.classList.add("animate-spin");
      showToast("Synchronizing indices on the server cluster...", "info");
      syncData().finally(() => {
        setTimeout(() => {
          if (icon) icon.classList.remove("animate-spin");
        }, 600);
      });
    });
  }

  // 10. Toggle temporal stats dashboards
  const analyticsPanel = document.getElementById("analytics-panel");
  const toggleAnalyticsBtn = document.getElementById("toggle-stats-visual-btn");
  if (toggleAnalyticsBtn && analyticsPanel) {
    toggleAnalyticsBtn.addEventListener("click", () => {
      analyticsPanel.classList.toggle("hidden");
      if (!analyticsPanel.classList.contains("hidden")) {
        showToast(
          "Analyzing system ingress logs and temporal series metrics.",
          "info",
        );
        drawSvgGraph();
      }
    });
  }

  // 11. Modal dialogue logs triggers
  const createTrigger = document.getElementById("create-job-trigger");
  if (createTrigger)
    createTrigger.addEventListener("click", () => openJobModal());

  const emptyAddTrigger = document.getElementById("empty-add-trigger");
  if (emptyAddTrigger)
    emptyAddTrigger.addEventListener("click", () => openJobModal());

  const jobFormEl = document.getElementById("job-form");
  if (jobFormEl) jobFormEl.addEventListener("submit", handleJobSubmit);

  const jobClose = document.getElementById("job-modal-close");
  if (jobClose) jobClose.addEventListener("click", closeJobModal);

  const jobCancel = document.getElementById("job-modal-cancel");
  if (jobCancel) jobCancel.addEventListener("click", closeJobModal);

  const jobOverlay = document.getElementById("job-modal-backdrop");
  if (jobOverlay) jobOverlay.addEventListener("click", closeJobModal);

  // Status/jobType inline button selectors
  const statusPickers = document.querySelectorAll(
    "#form-status-selector .status-btn",
  );
  statusPickers.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectFormStatus(btn.getAttribute("data-val"));
    });
  });

  const typePickers = document.querySelectorAll(
    "#form-type-selector .jobtype-btn",
  );
  typePickers.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectFormType(btn.getAttribute("data-val"));
    });
  });

  // 12. Dynamic pagination buttons triggers
  const pagPrev = document.getElementById("pag-prev");
  if (pagPrev) {
    pagPrev.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        syncData();
      }
    });
  }

  const pagNext = document.getElementById("pag-next");
  if (pagNext) {
    pagNext.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        syncData();
      }
    });
  }

  // 13. Dynamic card actions delegation listener (resilient to CSP / unsafes)
  const listContainer = document.getElementById("jobs-grid-container");
  if (listContainer) {
    listContainer.addEventListener("click", (e) => {
      const editBtn = e.target.closest('[data-action="edit"]');
      const deleteBtn = e.target.closest('[data-action="delete"]');

      if (editBtn) {
        const id = editBtn.getAttribute("data-id");
        triggerEditForm(id);
      } else if (deleteBtn) {
        const id = deleteBtn.getAttribute("data-id");
        triggerDeleteRecord(id);
      }
    });
  }

  // Load first state setup modes
  localStorage.setItem("careerpath_mode", connectionMode);
  updateModeButtons();
});
