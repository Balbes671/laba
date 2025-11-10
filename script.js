
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = "land"; // land | water
        this.moisture = 0;  // 0..1
        this.plant = null;
        this.element = document.createElement("div");
        this.element.classList.add("cell");
        this.updateAppearance();
        this.element.addEventListener("click", () => this.onClick());
    }

    updateMoisture(grid) {
        if (this.type === "water") {
            this.moisture = 1;
            return;
        }
        // Рассчитываем влажность по расстоянию до ближайшей воды
        let minDist = Infinity;
        for (let row of grid) {
            for (let cell of row) {
                if (cell.type === "water") {
                    let d = Math.abs(cell.x - this.x) + Math.abs(cell.y - this.y);
                    if (d < minDist) minDist = d;
                }
            }
        }
        this.moisture = minDist === Infinity ? 0 : Math.max(0, 1 - minDist * 0.2);
    }

    updateAppearance() {
        if (this.type === "water") {
            this.element.className = "cell water";
            this.element.textContent = "";
        } else {
            this.element.className = "cell";
            // цвет земли от желтого (#e0c060) до коричневого (#4b2e00)
            let m = this.moisture;
            let r = Math.round(224 - 120 * m);
            let g = Math.round(192 - 100 * m);
            let b = Math.round(96 - 96 * m);
            this.element.style.backgroundColor = `rgb(${r},${g},${b})`;
            this.element.textContent = this.plant ? this.plant.icon : "";
        }
    }
tick() {
    if (this.plant) {
        this.plant.grow(this.moisture);
        if (!this.plant.alive) this.plant = null;
    }
    this.updateAppearance(); // здесь всё ок
        }
    onClick() {
    if (currentTool === "shovel") {
        this.plant = null;
        if (this.type === "water") {
            this.type = "land";
        }
    } else if (currentTool === "bucket") {
        this.type = this.type === "water" ? "land" : "water";
    } else if (currentTool === "seed" && this.type === "land" && !this.plant) {
        let seedType = document.getElementById("seedSelect").value;
        if (seedType === "swamp") this.plant = new SwampPlant();
        if (seedType === "potato") this.plant = new PotatoPlant();
        if (seedType === "cactus") this.plant = new CactusPlant();
    }
    this.updateAppearance(); // ← это уже правильно стоит
    }

class Plant {
    constructor(icon, minMoisture, maxMoisture) {
        this.icon = icon;
        this.minMoisture = minMoisture;
        this.maxMoisture = maxMoisture;
        this.growth = 0;
        this.alive = true;
    }

    grow(moisture) {
        if (moisture < this.minMoisture || moisture > this.maxMoisture) {
            this.alive = false;
            return;
        }
        this.growth++;
        // Можно менять иконку по стадиям роста
        if (this.growth > 5) this.icon = "🌿";
    }
}

class SwampPlant extends Plant {
    constructor() {
        super("🪴", 0.6, 1.0);
    }
}
class PotatoPlant extends Plant {
    constructor() {
        super("🥔", 0.3, 0.7);
    }
}
class CactusPlant extends Plant {
    constructor() {
        super("🌵", 0.0, 0.4);
    }
}

const gridSize = 10;
let grid = [];
let gridElement = document.getElementById("grid");
let currentTool = "seed";

for (let y = 0; y < gridSize; y++) {
    let row = [];
    for (let x = 0; x < gridSize; x++) {
        let cell = new Cell(x, y);
        row.push(cell);
        gridElement.appendChild(cell.element);
    }
    grid.push(row);
}

document.getElementById("shovel").onclick = () => currentTool = "shovel";
document.getElementById("bucket").onclick = () => currentTool = "bucket";
document.getElementById("seedSelect").onchange = () => currentTool = "seed";

function gameTick() {
    for (let row of grid) {
        for (let cell of row) {
            cell.updateMoisture(grid);
        }
    }
    for (let row of grid) {
        for (let cell of row) {
            cell.tick();
        }
    }
}

setInterval(gameTick, 1000);

