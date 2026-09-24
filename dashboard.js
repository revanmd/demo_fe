const state = {
  view: "overview",
  empSearch: "",
  empDept: "",
  empStatus: "",
  sortKey: "name",
  sortDir: 1,
  page: 1,
  pageSize: 8,
  leaveRequests: LEAVE_REQUESTS.map((r) => ({ ...r })),
};

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

/* ---------------- Navigation ---------------- */
const navItems = document.querySelectorAll(".nav-item");
const views = document.querySelectorAll(".view");
const pageTitle = document.getElementById("pageTitle");
const TITLES = { overview: "Ringkasan", employees: "Karyawan", leave: "Absensi & Cuti", orgchart: "Struktur Organisasi" };

navItems.forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    state.view = view;
    navItems.forEach((b) => b.classList.toggle("active", b === btn));
    views.forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
    pageTitle.textContent = TITLES[view];
    closeSidebarMobile();
  });
});

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
document.getElementById("menuToggle").addEventListener("click", () => {
  sidebar.classList.add("open");
  sidebarOverlay.classList.add("show");
});
sidebarOverlay.addEventListener("click", closeSidebarMobile);
function closeSidebarMobile() {
  sidebar.classList.remove("open");
  sidebarOverlay.classList.remove("show");
}

/* ---------------- Overview ---------------- */
function animateCount(el, target) {
  const duration = 800;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderOverview() {
  const total = EMPLOYEES.length;
  const active = EMPLOYEES.filter((e) => e.status === "active").length;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const newHires = EMPLOYEES.filter((e) => new Date(e.joinDate) >= cutoff).length;
  const pendingLeave = state.leaveRequests.filter((r) => r.status === "pending").length;

  const values = [total, active, newHires, pendingLeave];
  document.querySelectorAll(".stat-value[data-count]").forEach((el, i) => animateCount(el, values[i]));

  updatePendingBadge(pendingLeave);
  renderDeptChart();
  renderStatusDonut(active, total - active);
  renderBirthdayList();
}

function renderDeptChart() {
  const container = document.getElementById("deptChart");
  const counts = DEPARTMENTS.map((d) => ({
    ...d,
    count: EMPLOYEES.filter((e) => e.department === d.name).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);
  container.innerHTML = counts
    .sort((a, b) => b.count - a.count)
    .map(
      (d) => `
      <div class="bar-row">
        <span>${d.name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(d.count / max) * 100}%;background:${d.color}"></div></div>
        <span class="bar-count">${d.count}</span>
      </div>`
    )
    .join("");
}

function renderStatusDonut(active, inactive) {
  const total = active + inactive;
  const activePct = total ? (active / total) * 100 : 0;
  const donut = document.getElementById("statusDonut");
  donut.style.background = `conic-gradient(#22c58b 0% ${activePct}%, #ef4565 ${activePct}% 100%)`;
  document.getElementById("statusLegend").innerHTML = `
    <div class="legend-item"><span class="legend-dot" style="background:#22c58b"></span> Aktif <strong>${active}</strong></div>
    <div class="legend-item"><span class="legend-dot" style="background:#ef4565"></span> Nonaktif <strong>${inactive}</strong></div>
  `;
}

function renderBirthdayList() {
  const today = new Date();
  const month = today.getMonth() + 1;
  const items = EMPLOYEES.filter((e) => e.birthMonth === month).slice(0, 6);
  const container = document.getElementById("birthdayList");
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">Tidak ada perayaan bulan ini.</div>`;
    return;
  }
  container.innerHTML = items
    .map((e) => {
      const joinYear = new Date(e.joinDate).getFullYear();
      const years = today.getFullYear() - joinYear;
      const isAnniversary = years > 0 && Math.random() > 0.5;
      return `
      <div class="activity-item">
        <div class="avatar-mini" style="background:${e.color}">${e.initials}</div>
        <div class="activity-info">
          <strong>${e.name}</strong>
          <small>${e.department} · ${e.position}</small>
        </div>
        <span class="activity-tag ${isAnniversary ? "tag-anniversary" : "tag-birthday"}">
          ${isAnniversary ? `${years} thn kerja` : `${e.birthDay} ${MONTH_NAMES[e.birthMonth - 1]}`}
        </span>
      </div>`;
    })
    .join("");
}

function updatePendingBadge(count) {
  const badge = document.getElementById("pendingBadge");
  badge.textContent = count;
  badge.classList.toggle("show", count > 0);
}

/* ---------------- Employees table ---------------- */
const deptFilter = document.getElementById("deptFilter");
DEPARTMENTS.forEach((d) => {
  const opt = document.createElement("option");
  opt.value = d.name;
  opt.textContent = d.name;
  deptFilter.appendChild(opt);
});

document.getElementById("empSearch").addEventListener("input", (e) => {
  state.empSearch = e.target.value.toLowerCase();
  state.page = 1;
  renderEmployeeTable();
});
deptFilter.addEventListener("change", (e) => { state.empDept = e.target.value; state.page = 1; renderEmployeeTable(); });
document.getElementById("statusFilter").addEventListener("change", (e) => { state.empStatus = e.target.value; state.page = 1; renderEmployeeTable(); });
document.getElementById("globalSearch").addEventListener("input", (e) => {
  document.getElementById("empSearch").value = e.target.value;
  state.empSearch = e.target.value.toLowerCase();
  state.page = 1;
  document.querySelector('.nav-item[data-view="employees"]').click();
  renderEmployeeTable();
});

document.querySelectorAll(".data-table th[data-sort]").forEach((th) => {
  th.addEventListener("click", () => {
    const key = th.dataset.sort;
    if (state.sortKey === key) state.sortDir *= -1;
    else { state.sortKey = key; state.sortDir = 1; }
    renderEmployeeTable();
  });
});

function getFilteredEmployees() {
  return EMPLOYEES.filter((e) => {
    const matchSearch = !state.empSearch || e.name.toLowerCase().includes(state.empSearch) || e.position.toLowerCase().includes(state.empSearch);
    const matchDept = !state.empDept || e.department === state.empDept;
    const matchStatus = !state.empStatus || e.status === state.empStatus;
    return matchSearch && matchDept && matchStatus;
  }).sort((a, b) => {
    const av = a[state.sortKey];
    const bv = b[state.sortKey];
    return av > bv ? state.sortDir : av < bv ? -state.sortDir : 0;
  });
}

function renderEmployeeTable() {
  const filtered = getFilteredEmployees();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
  const start = (state.page - 1) * state.pageSize;
  const pageItems = filtered.slice(start, start + state.pageSize);

  const tbody = document.getElementById("empTableBody");
  if (!pageItems.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state">Tidak ada karyawan yang cocok.</div></td></tr>`;
  } else {
    tbody.innerHTML = pageItems
      .map(
        (e) => `
      <tr data-id="${e.id}">
        <td>
          <div class="emp-cell">
            <div class="avatar-mini" style="background:${e.color}">${e.initials}</div>
            <div class="emp-cell-info"><strong>${e.name}</strong><small>${e.email}</small></div>
          </div>
        </td>
        <td>${e.department}</td>
        <td>${e.position}</td>
        <td>${formatDate(e.joinDate)}</td>
        <td><span class="badge ${e.status === "active" ? "badge-active" : "badge-inactive"}">${e.status === "active" ? "Aktif" : "Nonaktif"}</span></td>
        <td><button class="row-action" aria-label="Lihat detail">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button></td>
      </tr>`
      )
      .join("");
  }

  tbody.querySelectorAll("tr[data-id]").forEach((row) => {
    row.addEventListener("click", () => openEmployeeModal(Number(row.dataset.id)));
  });

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const container = document.getElementById("pagination");
  let html = "";
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === state.page ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  container.innerHTML = html;
  container.querySelectorAll(".page-btn").forEach((btn) => {
    btn.addEventListener("click", () => { state.page = Number(btn.dataset.page); renderEmployeeTable(); });
  });
}

function formatDate(iso) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

/* ---------------- Employee modal ---------------- */
const empModalOverlay = document.getElementById("empModalOverlay");
document.getElementById("empModalClose").addEventListener("click", closeEmployeeModal);
empModalOverlay.addEventListener("click", (e) => { if (e.target === empModalOverlay) closeEmployeeModal(); });

function openEmployeeModal(id) {
  const emp = EMPLOYEES.find((e) => e.id === id);
  if (!emp) return;
  document.getElementById("empModalContent").innerHTML = `
    <div class="modal-emp-header">
      <div class="avatar-mini" style="background:${emp.color}">${emp.initials}</div>
      <h3>${emp.name}</h3>
      <p>${emp.position} · ${emp.department}</p>
      <span class="badge ${emp.status === "active" ? "badge-active" : "badge-inactive"}" style="margin-top:8px">${emp.status === "active" ? "Aktif" : "Nonaktif"}</span>
    </div>
    <div class="modal-info-grid">
      <div class="modal-info-item"><label>Email</label><span>${emp.email}</span></div>
      <div class="modal-info-item"><label>Telepon</label><span>${emp.phone}</span></div>
      <div class="modal-info-item"><label>Tgl Bergabung</label><span>${formatDate(emp.joinDate)}</span></div>
      <div class="modal-info-item"><label>Sisa Cuti</label><span>${emp.leaveBalance} hari</span></div>
    </div>
  `;
  empModalOverlay.classList.add("open");
}
function closeEmployeeModal() { empModalOverlay.classList.remove("open"); }

document.getElementById("addEmpBtn").addEventListener("click", () => {
  document.getElementById("empModalContent").innerHTML = `
    <div class="modal-emp-header">
      <h3>Tambah Karyawan</h3>
      <p>Fitur form tambah karyawan bisa disambungkan ke backend di sini.</p>
    </div>
  `;
  empModalOverlay.classList.add("open");
});

/* ---------------- Leave management ---------------- */
function renderLeaveView() {
  const pending = state.leaveRequests.filter((r) => r.status === "pending").length;
  const approved = state.leaveRequests.filter((r) => r.status === "approved").length;
  const rejected = state.leaveRequests.filter((r) => r.status === "rejected").length;
  document.getElementById("leavePendingCount").textContent = pending;
  document.getElementById("leaveApprovedCount").textContent = approved;
  document.getElementById("leaveRejectedCount").textContent = rejected;
  updatePendingBadge(pending);

  const container = document.getElementById("leaveList");
  const sorted = [...state.leaveRequests].sort((a, b) => (a.status === "pending" ? -1 : 1) - (b.status === "pending" ? -1 : 1));
  container.innerHTML = sorted
    .map((r) => {
      const emp = EMPLOYEES.find((e) => e.id === r.employeeId);
      return `
      <div class="leave-item" data-id="${r.id}">
        <div class="avatar-mini" style="background:${emp ? emp.color : "#999"}">${r.initials}</div>
        <div class="leave-info">
          <div class="leave-name">${r.employeeName} <span style="color:var(--muted);font-weight:400">— ${r.type}</span></div>
          <small>${r.department} · ${r.duration} hari · ${r.reason}</small>
        </div>
        ${
          r.status === "pending"
            ? `<div class="leave-actions">
                <button class="leave-btn approve" data-action="approve">Setujui</button>
                <button class="leave-btn reject" data-action="reject">Tolak</button>
               </div>`
            : `<span class="badge badge-${r.status}">${r.status === "approved" ? "Disetujui" : "Ditolak"}</span>`
        }
      </div>`;
    })
    .join("");

  container.querySelectorAll(".leave-item").forEach((item) => {
    const id = Number(item.dataset.id);
    item.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const req = state.leaveRequests.find((r) => r.id === id);
        req.status = btn.dataset.action === "approve" ? "approved" : "rejected";
        renderLeaveView();
        renderOverview();
      });
    });
  });
}

/* ---------------- Org chart ---------------- */
function renderOrgChart() {
  const container = document.getElementById("orgChart");
  container.innerHTML = DEPARTMENTS.map((dept) => {
    const members = EMPLOYEES.filter((e) => e.department === dept.name && e.status === "active");
    return `
      <div class="org-dept">
        <div class="org-dept-header">
          <span class="org-dept-dot" style="background:${dept.color}"></span>
          <strong>${dept.name}</strong>
          <span>${members.length} anggota</span>
        </div>
        <div class="org-manager">
          <div class="avatar-mini" style="background:${dept.color}">${initialsOf(dept.manager)}</div>
          <div>
            <strong style="font-size:13px">${dept.manager}</strong>
            <div style="font-size:11.5px;color:var(--muted)">Department Manager</div>
          </div>
        </div>
        <div class="org-members">
          ${members
            .slice(0, 10)
            .map((m) => `<div class="org-member"><div class="avatar-mini" style="background:${m.color}">${m.initials}</div>${m.name}</div>`)
            .join("")}
          ${members.length > 10 ? `<div class="org-member">+${members.length - 10} lainnya</div>` : ""}
        </div>
      </div>`;
  }).join("");
}

function initialsOf(name) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

/* ---------------- Init ---------------- */
renderOverview();
renderEmployeeTable();
renderLeaveView();
renderOrgChart();
