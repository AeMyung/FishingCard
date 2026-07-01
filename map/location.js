const fishBtn = document.getElementById("fishBtn");
const miniGame = document.getElementById("miniGame");
const message = document.getElementById("message");
const catchPopup = document.getElementById("catchPopup");
const catchCard = document.getElementById("catchCard");
const closePopup = document.getElementById("closePopup");
const inventoryBtn =
    document.getElementById(
        "inventoryBtn"
    );

inventoryBtn.onclick = () => {

    window.location.href =
        "../inventory/inventory.html";

};

const params = new URLSearchParams(window.location.search);
const locationId = Number(params.get("location")) || 1;

let failTimer;
let fishingTimer;

// ======================
// 지역별 물고기 목록
// ======================

function getFishByLocation(location) {

    return FishData.filter(fish =>
        fish.location.includes(0) ||
        fish.location.includes(location)
    );

}

// ======================
// 랜덤 뽑기
// ======================

function randomFish(location) {

    const list =
        getFishByLocation(location);

    const totalWeight =
        list.reduce(
            (sum, fish) =>
                sum + fish.weight,
            0
        );

    let random =
        Math.random() * totalWeight;

    for (const fish of list) {

        random -= fish.weight;

        if (random <= 0) {
            return fish;
        }

    }

    return list[0];
}

// ======================
// 낚시 시작
// ======================

fishBtn.onclick = startFishing;

// ======================
// 미니게임 시작
// ======================

function startMiniGame() {

    miniGame.style.display = "block";

    failTimer =
        setTimeout(
            failFishing,
            2000
        );

}

// ======================
// 미니게임 성공
// ======================

miniGame.onclick = () => {

    clearTimeout(failTimer);

    miniGame.style.display = "none";

    successFishing();

};

// ======================
// 낚시 성공
// ======================

function successFishing() {

    const fish = randomFish(locationId);

    addFish(fish.id);

    catchPopup.style.display = "block";

    catchCard.src = "../images/" + fish.id + ".png";

    fishBtn.disabled = false;
    fishBtn.innerHTML = "🎣 낚시하기";

}

// ======================
// 낚시 실패
// ======================

function failFishing() {

    miniGame.style.display = "none";

    message.style.display = "block";

    message.innerHTML = "❌<br><br>물고기를 놓쳤습니다.";

    fishBtn.disabled = false;
    fishBtn.innerHTML = "🎣 낚시하기";

    setTimeout(() => {

        message.style.display = "none";

    }, 2000);

}

closePopup.onclick = () => {

    catchPopup.style.display = "none";

    startFishing();

};

function startFishing() {

    fishBtn.disabled = true;

    fishBtn.innerHTML = "🎣 낚시 중...";

    message.style.display = "none";

    const wait = 3000 + Math.random() * 5000;

    fishingTimer =
        setTimeout(
            startMiniGame,
            wait
        );

}

function getInventory() {

    return JSON.parse(
        localStorage.getItem("inventory")
    ) || [];

}

function saveInventory(inventory) {

    localStorage.setItem(
        "inventory",
        JSON.stringify(inventory)
    );

}

function addFish(fishId) {

    const inventory =
        getInventory();

    const item =
        inventory.find(
            x => x.id === fishId
        );

    if (item) {

        item.count++;

    }
    else {

        inventory.push({
            id: fishId,
            count: 1
        });

    }

    saveInventory(inventory);

}

window.addEventListener("pageshow", () => {

    clearTimeout(fishingTimer);
    clearTimeout(failTimer);

    fishBtn.disabled = false;
    fishBtn.innerHTML = "🎣 낚시하기";

    miniGame.style.display = "none";
    message.style.display = "none";
    catchPopup.style.display = "none";

});