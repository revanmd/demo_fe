const DEPARTMENTS = [
  { name: "Engineering", manager: "Dimas Prasetyo", color: "#7c5cff" },
  { name: "Marketing", manager: "Aulia Rahma", color: "#ff6ec7" },
  { name: "Sales", manager: "Bagus Wicaksono", color: "#4cd8ff" },
  { name: "Human Resources", manager: "Citra Ayu", color: "#ffb84c" },
  { name: "Finance", manager: "Eko Saputra", color: "#4cff9e" },
  { name: "Design", manager: "Nadia Putri", color: "#ff5c7a" },
];

const FIRST_NAMES = ["Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hadi", "Indra", "Joko", "Kartika", "Lestari", "Made", "Nia", "Oscar", "Putri", "Rian", "Sari", "Taufik", "Umar", "Vina", "Wulan", "Yoga", "Zaskia"];
const LAST_NAMES = ["Saputra", "Wijaya", "Kurniawan", "Santoso", "Pratama", "Hidayat", "Setiawan", "Nugroho", "Permata", "Anggraini", "Firmansyah", "Wibowo"];
const POSITIONS = {
  Engineering: ["Software Engineer", "Frontend Developer", "Backend Developer", "QA Engineer", "DevOps Engineer"],
  Marketing: ["Marketing Specialist", "Content Writer", "SEO Specialist", "Brand Manager"],
  Sales: ["Sales Executive", "Account Manager", "Business Development"],
  "Human Resources": ["HR Generalist", "Recruiter", "People Partner"],
  Finance: ["Finance Analyst", "Accountant", "Tax Specialist"],
  Design: ["UI/UX Designer", "Graphic Designer", "Product Designer"],
};
const LEAVE_TYPES = ["Cuti Tahunan", "Sakit", "Cuti Melahirkan", "Izin Pribadi"];

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function generateEmployees(count) {
  const rand = seededRandom(42);
  const employees = [];
  for (let i = 1; i <= count; i++) {
    const dept = DEPARTMENTS[Math.floor(rand() * DEPARTMENTS.length)];
    const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const name = `${first} ${last}`;
    const positions = POSITIONS[dept.name];
    const position = positions[Math.floor(rand() * positions.length)];
    const isActive = rand() > 0.12;
    const today = new Date();
    let joinYear, joinMonth, joinDay;
    if (i > count - 3) {
      const recent = new Date(today);
      recent.setDate(recent.getDate() - Math.floor(rand() * 25));
      joinYear = recent.getFullYear();
      joinMonth = recent.getMonth() + 1;
      joinDay = recent.getDate();
    } else {
      joinYear = 2019 + Math.floor(rand() * 7);
      joinMonth = 1 + Math.floor(rand() * 12);
      joinDay = 1 + Math.floor(rand() * 28);
    }
    const bMonth = 1 + Math.floor(rand() * 12);
    const bDay = 1 + Math.floor(rand() * 28);

    employees.push({
      id: i,
      name,
      initials: (first[0] + last[0]).toUpperCase(),
      email: `${first.toLowerCase()}.${last.toLowerCase()}@nexacorp.id`,
      phone: `08${Math.floor(100000000 + rand() * 899999999)}`,
      department: dept.name,
      position,
      status: isActive ? "active" : "inactive",
      joinDate: `${joinYear}-${String(joinMonth).padStart(2, "0")}-${String(joinDay).padStart(2, "0")}`,
      leaveBalance: Math.floor(rand() * 15),
      birthMonth: bMonth,
      birthDay: bDay,
      color: dept.color,
    });
  }
  return employees;
}

const EMPLOYEES = generateEmployees(48);

function generateLeaveRequests() {
  const rand = seededRandom(7);
  const statuses = ["pending", "approved", "rejected"];
  const requests = [];
  const activeEmployees = EMPLOYEES.filter((e) => e.status === "active");
  for (let i = 1; i <= 14; i++) {
    const emp = activeEmployees[Math.floor(rand() * activeEmployees.length)];
    const type = LEAVE_TYPES[Math.floor(rand() * LEAVE_TYPES.length)];
    const startDay = 1 + Math.floor(rand() * 24);
    const duration = 1 + Math.floor(rand() * 4);
    const status = i <= 5 ? "pending" : statuses[Math.floor(rand() * statuses.length)];
    requests.push({
      id: i,
      employeeId: emp.id,
      employeeName: emp.name,
      initials: emp.initials,
      department: emp.department,
      type,
      startDay,
      duration,
      status,
      reason: type === "Sakit" ? "Demam dan perlu istirahat" : type === "Cuti Melahirkan" ? "Persalinan anak pertama" : "Keperluan keluarga",
    });
  }
  return requests;
}

const LEAVE_REQUESTS = generateLeaveRequests();
