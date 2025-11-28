import {
  SYRIAN_PROVINCES,
  WORLD_CURRENCIES,
  getData,
  saveData,
  requireAuthOrRedirect,
  logout,
  formatTimestamp,
  getPermissionsForUser
} from "./storage.js";

const session = requireAuthOrRedirect();
if (!session) {
  // تم التحويل
} else {
  const currentUserNameEl = document.getElementById("current-user-name");
  currentUserNameEl.textContent = session.username;

  const syriaRowsContainer = document.getElementById("syria-rows");
  const feesRowsContainer = document.getElementById("fees-rows");
  const fxRowsContainer = document.getElementById("fx-rows");

  const metaSyria = document.getElementById("meta-syria");
  const metaFees = document.getElementById("meta-fees");
  const metaFx = document.getElementById("meta-fx");
  const globalMeta = document.getElementById("global-meta");

  const saveSyriaBtn = document.getElementById("save-syria");
  const saveFeesBtn = document.getElementById("save-fees");
  const saveFxBtn = document.getElementById("save-fx");

  const openPublicBtn = document.getElementById("open-public");
  const logoutBtn = document.getElementById("logout");
  const openManagersBtn = document.getElementById("open-managers");

  openPublicBtn.addEventListener("click", () => {
    window.location.href = "public.html";
  });

  logoutBtn.addEventListener("click", () => {
    logout();
    window.location.href = "index.html";
  });

  openManagersBtn.addEventListener("click", () => {
    window.location.href = "managers.html";
  });

  let state = getData();
  const permissions = getPermissionsForUser(session.username);

  function renderMeta() {
    metaSyria.textContent =
      "آخر تعديل: " +
      (state.lastUpdatedSyriaAt
        ? `${formatTimestamp(state.lastUpdatedSyriaAt)} - ${state.lastUpdatedSyriaBy || "-"}`
        : "-");
    metaFees.textContent =
      "آخر تعديل: " +
      (state.lastUpdatedFeesAt
        ? `${formatTimestamp(state.lastUpdatedFeesAt)} - ${state.lastUpdatedFeesBy || "-"}`
        : "-");
    metaFx.textContent =
      "آخر تعديل: " +
      (state.lastUpdatedFxAt
        ? `${formatTimestamp(state.lastUpdatedFxAt)} - ${state.lastUpdatedFxBy || "-"}`
        : "-");
    globalMeta.textContent =
      "آخر تحديث عام: " +
      (state.globalLastUpdatedAt
        ? `${formatTimestamp(state.globalLastUpdatedAt)} - ${state.globalLastUpdatedBy || "-"}`
        : "-");
  }

  function attachNumericFilter(input, { max = null } = {}) {
    input.addEventListener("input", () => {
      let v = input.value;

      // السماح فقط بالأرقام والنقطة
      v = v.replace(/[^\d.]/g, "");

      // منع أكثر من نقطة عشرية
      const firstDot = v.indexOf(".");
      if (firstDot !== -1) {
        const before = v.slice(0, firstDot + 1);
        const after = v
          .slice(firstDot + 1)
          .replace(/\./g, ""); // إزالة أي نقاط إضافية
        v = before + after;
      }

      // منع القيم السالبة
      if (v.startsWith("-")) v = v.replace(/-/g, "");

      // تطبيق حد أعلى إن وجد (للـ % فقط)
      if (max !== null && v !== "") {
        const num = Number(v);
        if (!isNaN(num) && num > max) {
          v = String(max);
        }
        if (!isNaN(num) && num < 0) {
          v = "0";
        }
      }

      input.value = v;
    });
  }

  function createSyriaInputs() {
    syriaRowsContainer.innerHTML = "";
    SYRIAN_PROVINCES.forEach(province => {
      const row = document.createElement("div");
      row.className = "row";

      const label = document.createElement("span");
      label.textContent = province;

      const buyInput = document.createElement("input");
      buyInput.placeholder = "شراء";
      buyInput.value = state.syriaPrices[province]?.buy || "";
      buyInput.dataset.province = province;
      buyInput.dataset.field = "buy";
      attachNumericFilter(buyInput);

      const sellInput = document.createElement("input");
      sellInput.placeholder = "مبيع";
      sellInput.value = state.syriaPrices[province]?.sell || "";
      sellInput.dataset.province = province;
      sellInput.dataset.field = "sell";
      attachNumericFilter(sellInput);

      row.appendChild(label);
      row.appendChild(buyInput);
      row.appendChild(sellInput);
      syriaRowsContainer.appendChild(row);
    });
  }

  function createFeesInputs() {
    feesRowsContainer.innerHTML = "";
    SYRIAN_PROVINCES.forEach(province => {
      const wrapper = document.createElement("div");
      wrapper.style.marginBottom = "4px";

      const label = document.createElement("div");
      label.className = "row-label";
      label.textContent = province;
      wrapper.appendChild(label);

      const row = document.createElement("div");
      row.className = "row";

      const usdPercent = document.createElement("input");
      usdPercent.placeholder = "نسبة الأجور % بالدولار";
      usdPercent.value = state.fees[province]?.usdPercent || "";
      usdPercent.dataset.province = province;
      usdPercent.dataset.field = "usdPercent";
      attachNumericFilter(usdPercent, { max: 100 });

      const sypPercent = document.createElement("input");
      sypPercent.placeholder = "نسبة الأجور % بالليرة السورية";
      sypPercent.value = state.fees[province]?.sypPercent || "";
      sypPercent.dataset.province = province;
      sypPercent.dataset.field = "sypPercent";
      attachNumericFilter(sypPercent, { max: 100 });

      row.appendChild(usdPercent);
      row.appendChild(sypPercent);

      wrapper.appendChild(row);
      feesRowsContainer.appendChild(wrapper);
    });
  }

  function createFxInputs() {
    fxRowsContainer.innerHTML = "";
    WORLD_CURRENCIES.forEach(currency => {
      const row = document.createElement("div");
      row.className = "row";

      const label = document.createElement("span");
      label.textContent = `${currency.name} (${currency.code})`;

      const buy = document.createElement("input");
      buy.placeholder = "شراء";
      buy.value = state.fx[currency.code]?.buy || "";
      buy.dataset.code = currency.code;
      buy.dataset.field = "buy";
      attachNumericFilter(buy);

      const sell = document.createElement("input");
      sell.placeholder = "مبيع";
      sell.value = state.fx[currency.code]?.sell || "";
      sell.dataset.code = currency.code;
      sell.dataset.field = "sell";
      attachNumericFilter(sell);

      row.appendChild(label);
      row.appendChild(buy);
      row.appendChild(sell);

      fxRowsContainer.appendChild(row);
    });
  }

  function collectSyriaForm() {
    const inputs = syriaRowsContainer.querySelectorAll("input");
    const syriaPrices = { ...state.syriaPrices };
    inputs.forEach(input => {
      const province = input.dataset.province;
      const field = input.dataset.field;
      if (!syriaPrices[province]) syriaPrices[province] = { buy: "", sell: "" };
      syriaPrices[province][field] = input.value.trim();
    });
    return syriaPrices;
  }

  function collectFeesForm() {
    const inputs = feesRowsContainer.querySelectorAll("input");
    const fees = { ...state.fees };
    inputs.forEach(input => {
      const province = input.dataset.province;
      const field = input.dataset.field;
      if (!fees[province]) {
        fees[province] = {
          usdPercent: "",
          sypPercent: ""
        };
      }
      fees[province][field] = input.value.trim();
    });
    return fees;
  }

  function collectFxForm() {
    const inputs = fxRowsContainer.querySelectorAll("input");
    const fx = { ...state.fx };
    inputs.forEach(input => {
      const code = input.dataset.code;
      const field = input.dataset.field;
      if (!fx[code]) fx[code] = { buy: "", sell: "" };
      fx[code][field] = input.value.trim();
    });
    return fx;
  }

  function applyPermissions() {
    const sectionSyria = document.getElementById("section-syria");
    const sectionFees = document.getElementById("section-fees");
    const sectionFx = document.getElementById("section-fx");

    const canSyria = permissions.isSuper || permissions.canSyria;
    const canFees = permissions.isSuper || permissions.canFees;
    const canFx = permissions.isSuper || permissions.canFx;

    if (!canSyria) {
      sectionSyria.classList.add("section-disabled");
      sectionSyria.querySelectorAll("input").forEach(i => (i.disabled = true));
      saveSyriaBtn.disabled = true;
    }

    if (!canFees) {
      sectionFees.classList.add("section-disabled");
      sectionFees.querySelectorAll("input").forEach(i => (i.disabled = true));
      saveFeesBtn.disabled = true;
    }

    if (!canFx) {
      sectionFx.classList.add("section-disabled");
      sectionFx.querySelectorAll("input").forEach(i => (i.disabled = true));
      saveFxBtn.disabled = true;
    }

    if (!(permissions.isSuper || permissions.canManageUsers)) {
      openManagersBtn.style.display = "none";
    }
  }

  saveSyriaBtn.addEventListener("click", () => {
    if (!(permissions.isSuper || permissions.canSyria)) return;
    const syriaPrices = collectSyriaForm();
    state = saveData({ syriaPrices }, "syria", session.username);
    renderMeta();
  });

  saveFeesBtn.addEventListener("click", () => {
    if (!(permissions.isSuper || permissions.canFees)) return;
    const fees = collectFeesForm();
    state = saveData({ fees }, "fees", session.username);
    renderMeta();
  });

  saveFxBtn.addEventListener("click", () => {
    if (!(permissions.isSuper || permissions.canFx)) return;
    const fx = collectFxForm();
    state = saveData({ fx }, "fx", session.username);
    renderMeta();
  });

  createSyriaInputs();
  createFeesInputs();
  createFxInputs();
  renderMeta();
  applyPermissions();
}