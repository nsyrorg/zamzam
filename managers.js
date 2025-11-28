import {
  requireAuthOrRedirect,
  getCurrentSession,
  getUsers,
  addUser,
  getPermissionsForUser
} from "./storage.js";

const session = requireAuthOrRedirect();
if (!session) {
  // تم التحويل لصفحة الدخول
} else {
  const currentPerms = getPermissionsForUser(session.username);
  if (!(currentPerms.isSuper || currentPerms.canManageUsers)) {
    // لا يملك صلاحية إدارة المدراء
    window.location.replace("./admin.html");
  }
}

const backBtn = document.getElementById("back-admin");
const addManagerBtn = document.getElementById("add-manager");

const nameInput = document.getElementById("new-manager-name");
const passInput = document.getElementById("new-manager-pass");
const permSuper = document.getElementById("perm-super");
const permSyria = document.getElementById("perm-syria");
const permFees = document.getElementById("perm-fees");
const permFx = document.getElementById("perm-fx");
const permManagers = document.getElementById("perm-managers");

const tableBody = document.getElementById("managers-table-body");

backBtn.addEventListener("click", () => {
  window.location.href = "admin.html";
});

permSuper.addEventListener("change", () => {
  const on = permSuper.checked;
  if (on) {
    permSyria.checked = true;
    permFees.checked = true;
    permFx.checked = true;
    permManagers.checked = true;
  }
});

function describeRole(perms) {
  if (perms.isSuper || (perms.canSyria && perms.canFees && perms.canFx && perms.canManageUsers)) {
    return "مدير عام";
  }
  const parts = [];
  if (perms.canSyria) parts.push("السوري");
  if (perms.canFees) parts.push("الأجور");
  if (perms.canFx) parts.push("العملات");
  if (perms.canManageUsers) parts.push("المدراء");
  if (!parts.length) return "بدون صلاحيات";
  return parts.join("، ");
}

function renderManagers() {
  const users = getUsers();
  tableBody.innerHTML = "";
  users.forEach(user => {
    const perms = getPermissionsForUser(user.username);
    const tr = document.createElement("tr");

    const role = describeRole(perms);
    const isAdmin = user.username === "admin";

    tr.innerHTML = `
      <td>${user.username}</td>
      <td><span class="role-pill">${isAdmin ? "مدير عام (أساسي)" : role}</span></td>
      <td>
        ${perms.canSyria || perms.isSuper ? "سوري، " : ""}
        ${perms.canFees || perms.isSuper ? "أجور، " : ""}
        ${perms.canFx || perms.isSuper ? "عملات، " : ""}
        ${perms.canManageUsers || perms.isSuper ? "مدراء" : ""}
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

addManagerBtn.addEventListener("click", () => {
  const username = nameInput.value;
  const password = passInput.value;

  const perms = {
    isSuper: permSuper.checked,
    canSyria: permSuper.checked || permSyria.checked,
    canFees: permSuper.checked || permFees.checked,
    canFx: permSuper.checked || permFx.checked,
    canManageUsers: permSuper.checked || permManagers.checked
  };

  const result = addUser(username, password, perms);
  if (!result.ok) {
    alert(result.message);
    return;
  }

  nameInput.value = "";
  passInput.value = "";
  permSuper.checked = false;
  permSyria.checked = false;
  permFees.checked = false;
  permFx.checked = false;
  permManagers.checked = false;

  renderManagers();
});

renderManagers();

