"use strict";

// ---------- Konfiguration ----------

const RANGES = {
  B: [1, 15],
  I: [16, 30],
  N: [31, 45],
  G: [46, 60],
  O: [61, 75],
};
const LETTERS = ["B", "I", "N", "G", "O"];

// ---------- Zustand ----------

let pool = [];        // noch nicht gezogene Zahlen
let drawn = [];        // gezogene Zahlen in Reihenfolge
let gameRunning = false;

// ---------- DOM-Referenzen ----------

const btnNeu = document.getElementById("btnNeu");
const btnZiehen = document.getElementById("btnZiehen");
const btnAbbruch = document.getElementById("btnAbbruch");

const drawDisplay = document.getElementById("drawDisplay");
const currentLetterEl = document.getElementById("currentLetter");
const currentNumberEl = document.getElementById("currentNumber");
const lastDrawnEl = document.getElementById("lastDrawn");
const drawnCountEl = document.getElementById("drawnCount");

const rowEls = {};
LETTERS.forEach((l) => (rowEls[l] = document.getElementById("row-" + l)));

// ---------- Hilfsfunktionen ----------

function letterFor(n) {
  for (const l of LETTERS) {
    const [min, max] = RANGES[l];
    if (n >= min && n <= max) return l;
  }
  return "?";
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildBoard() {
  LETTERS.forEach((l) => {
    const [min, max] = RANGES[l];
    const container = rowEls[l];
    container.innerHTML = "";
    for (let n = min; n <= max; n++) {
      const chip = document.createElement("span");
      chip.className = "num-chip";
      chip.textContent = n;
      chip.id = "chip-" + n;
      container.appendChild(chip);
    }
  });
}

function updateButtons() {
  btnNeu.disabled = gameRunning;
  btnZiehen.disabled = !gameRunning || pool.length === 0;
  btnAbbruch.disabled = !gameRunning;
}

function resetDisplay() {
  currentLetterEl.textContent = "";
  currentNumberEl.textContent = "";
  lastDrawnEl.textContent = "–";
  drawnCountEl.textContent = "0";
}

// ---------- Spielsteuerung ----------

function neuesSpiel() {
  pool = [];
  for (let n = 1; n <= 75; n++) pool.push(n);
  shuffle(pool);
  drawn = [];
  gameRunning = true;

  buildBoard();
  resetDisplay();
  updateButtons();
}

function zahlZiehen() {
  if (!gameRunning || pool.length === 0) return;

  const n = pool.pop();
  drawn.push(n);
  const letter = letterFor(n);

  // vorherige "zuletzt gezogen"-Markierung entfernen
  document.querySelectorAll(".num-chip.latest").forEach((el) => el.classList.remove("latest"));

  const chip = document.getElementById("chip-" + n);
  if (chip) {
    chip.classList.add("drawn");
    chip.classList.add("latest");
  }

  currentLetterEl.textContent = letter;
  currentNumberEl.textContent = n;
  lastDrawnEl.textContent = letter + "-" + n;
  drawnCountEl.textContent = drawn.length;

  drawDisplay.classList.remove("flash");
  // reflow erzwingen, damit die Animation erneut abspielt
  void drawDisplay.offsetWidth;
  drawDisplay.classList.add("flash");

  updateButtons();

  if (pool.length === 0) {
    currentLetterEl.textContent = "Fertig";
  }
}

function abbruch() {
  gameRunning = false;
  pool = [];
  drawn = [];

  document.querySelectorAll(".num-chip").forEach((el) => {
    el.classList.remove("drawn");
    el.classList.remove("latest");
  });

  resetDisplay();
  updateButtons();
}

// ---------- Initialisierung ----------

btnNeu.addEventListener("click", neuesSpiel);
btnZiehen.addEventListener("click", zahlZiehen);
btnAbbruch.addEventListener("click", abbruch);

// Leertaste zieht eine Zahl, wenn ein Spiel läuft (bequem für den Beamer-Betrieb)
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" && !btnZiehen.disabled) {
    e.preventDefault();
    zahlZiehen();
  }
});

buildBoard();
resetDisplay();
updateButtons();
