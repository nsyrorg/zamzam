import {
  SYRIAN_PROVINCES,
  WORLD_CURRENCIES,
  getData,
  formatTimestamp
} from "./storage.js";

const state = getData();

const syriaTableBody = document.querySelector("#syria-table tbody");
const feesTableBody = document.querySelector("#fees-table tbody");
const fxTableBody = document.querySelector("#fx-table tbody");

const metaSyria = document.getElementById("meta-syria");
const metaFees = document.getElementById("meta-fees");
const metaFx = document.getElementById("meta-fx");
const globalMeta = document.getElementById("global-meta");

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
    "آخر تحديث: " +
    (state.globalLastUpdatedAt
      ? `${formatTimestamp(state.globalLastUpdatedAt)} - ${state.globalLastUpdatedBy || "-"}`
      : "-");
}

function renderSyria() {
  syriaTableBody.innerHTML = "";
  SYRIAN_PROVINCES.forEach(province => {
    const row = document.createElement("tr");
    const data = state.syriaPrices[province] || { buy: "", sell: "" };
    row.innerHTML = `
      <td>${province}</td>
      <td>${data.buy || "-"}</td>
      <td>${data.sell || "-"}</td>
    `;
    syriaTableBody.appendChild(row);
  });
}

function renderFees() {
  feesTableBody.innerHTML = "";
  SYRIAN_PROVINCES.forEach(province => {
    const row = document.createElement("tr");
    const data = state.fees[province] || {
      usdPercent: "",
      sypPercent: ""
    };
    row.innerHTML = `
      <td>${province}</td>
      <td>${data.usdPercent ? data.usdPercent + "٪" : "-"}</td>
      <td>${data.sypPercent ? data.sypPercent + "٪" : "-"}</td>
    `;
    feesTableBody.appendChild(row);
  });
}

function renderFx() {
  fxTableBody.innerHTML = "";
  WORLD_CURRENCIES.forEach(currency => {
    const row = document.createElement("tr");
    const data = state.fx[currency.code] || { buy: "", sell: "" };
    row.innerHTML = `
      <td>${currency.name} (${currency.code})</td>
      <td>${data.buy || "-"}</td>
      <td>${data.sell || "-"}</td>
    `;
    fxTableBody.appendChild(row);
  });
}

renderMeta();
renderSyria();
renderFees();
renderFx();