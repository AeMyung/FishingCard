const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const sellPopup = document.getElementById("sellPopup");

const sellCount = document.getElementById("sellCount");

const cancelSell = document.getElementById("cancelSell");

const confirmSell = document.getElementById("confirmSell");

const minBtn = document.getElementById("minBtn");

const minusBtn = document.getElementById("minusBtn");

const plusBtn = document.getElementById("plusBtn");

const maxBtn = document.getElementById("maxBtn");

const buyPopup = document.getElementById("buyPopup");

const buyTitle = document.getElementById("buyTitle");

const buyPrice = document.getElementById("buyPrice");

const confirmBuy = document.getElementById("confirmBuy");

const cancelBuy = document.getElementById("cancelBuy");

const buyImage = document.getElementById("buyImage");

const buyCategory = document.getElementById("buyCategory");

const rodTab = document.getElementById("rodTab");

const baitTab = document.getElementById("baitTab");

const accessoryTab = document.getElementById("accessoryTab");

let selectedBuyItem = null;

let selectedItem = null;
let inventory = [];
let memberCode = "";
let player = null;

(async () => {

    // ======================
    // 로그인 확인
    // ======================

    memberCode =
        localStorage.getItem(
            "member_code"
        );

    if (!memberCode) {

        location.href =
            "../login/login.html";

        return;

    }

    // ======================
    // 플레이어 정보
    // ======================

    const { data } = await sb
        .from("players")
        .select("nickname, gold")
        .eq("member_code", memberCode)
        .single();

    player = data;

    if (!player) {

        localStorage.removeItem(
            "member_code"
        );

        location.href =
            "../login/login.html";

        return;

    }

    document.getElementById("goldBox").innerHTML =
        `💰 ${player.gold.toLocaleString()} G`;

    // ======================
    // 인벤토리 불러오기
    // ======================

    const result = await sb
        .from("inventory")
        .select("*")
        .eq("member_code", memberCode);

    inventory = sortInventory(result.data || []);

    const gradeOrder = {

        ancient: 7,
        relic: 6,
        legendary: 5,
        epic: 4,
        rare: 3,
        uncommon: 2,
        common: 1

    };

    inventory.sort((a, b) => {

        const fishA =
            FishData.find(
                x => x.id === a.fish_id
            );

        const fishB =
            FishData.find(
                x => x.id === b.fish_id
            );

        // 1순위 : 희귀도
        const gradeDiff =
            gradeOrder[fishB.grade] -
            gradeOrder[fishA.grade];

        if (gradeDiff !== 0)
            return gradeDiff;

        // 2순위 : 이름
        return fishA.name.localeCompare(
            fishB.name,
            "ko"
        );

    });
})();


// ======================
// 판매 탭
// ======================

function loadSell() {

    const shopList =
        document.getElementById(
            "shopList"
        );

    shopList.style.display = "block";
    shopList.innerHTML = "";

    for (const item of inventory) {

        const fish =
            FishData.find(
                x => x.id === item.fish_id
            );

        if (!fish)
            continue;

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "shopItem";

        div.innerHTML = `

            <img src="../images/${fish.image}">

            <div class="info">

                <div class="name">

                    ${fish.name}

                </div>

                <div class="price">

                    판매가 : ${fish.price.toLocaleString()} G

                </div>

                <div class="count">

                    보유 : ${item.count}

                </div>

            </div>

            <button class="sellBtn">

                판매

            </button>

        `;

        div.querySelector(".sellBtn").onclick = () => {

            console.log("판매 버튼 클릭");

            selectedItem = item;

            sellCount.value = item.count;

            sellCount.max = item.count;

            sellPopup.style.display = "flex";

        };

        shopList.appendChild(div);

    }

}


// ======================
// 구매 탭
// ======================

function loadBuyRod() {

    const shopList =
        document.getElementById(
            "shopList"
        );

    shopList.style.display = "block";

    shopList.innerHTML = "";

    for (const rod of RodData) {

        if (!rod.shop.sell)
            continue;

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "shopItem";

        div.innerHTML = `

            <img src="../images/${rod.image}">

            <div class="info">

                <div class="name">

                    ${rod.name}

                </div>

                <div class="price">

                    구매가 : ${rod.shop.price.toLocaleString()} G

                </div>

            </div>

            <div class="buyBtns">

                <button class="detailBtn">

                    상세

                </button>

                <button class="buyBtn">

                    구매

                </button>

            </div>

        `;

        div.querySelector(".buyBtn").onclick = () => {

            selectedBuyItem = rod;

            buyImage.src =
                `../images/${rod.image}`;

            buyTitle.innerHTML =
                rod.name;

            buyPrice.innerHTML =
                `${rod.shop.price.toLocaleString()} G`;

            buyPopup.style.display =
                "flex";

        };

        shopList.appendChild(div);

    }

}

function loadBuyBait() {

    const shopList =
        document.getElementById(
            "shopList"
        );

    shopList.innerHTML = `
        <h2 style="text-align:center;">
            준비중입니다.
        </h2>
    `;

}

function loadBuyAccessory() {

    const shopList =
        document.getElementById(
            "shopList"
        );

    shopList.innerHTML = `
        <h2 style="text-align:center;">
            준비중입니다.
        </h2>
    `;

}

const sellTab = document.getElementById("sellTab");

const buyTab = document.getElementById("buyTab");

sellTab.onclick = () => {

    buyCategory.style.display = "none";

    sellTab.classList.add("active");

    buyTab.classList.remove("active");

    loadSell();

};

buyTab.onclick = () => {

    buyTab.classList.add("active");

    sellTab.classList.remove("active");

    buyCategory.style.display = "flex";

    rodTab.click();

};

cancelSell.onclick = () => {

    sellPopup.style.display = "none";

};

confirmSell.onclick = async () => {

    const sell =
        Number(sellCount.value);

    // ======================
    // 입력 검사
    // ======================

    if (sell < 1) {

        alert("1개 이상 판매해야 합니다.");

        return;

    }

    if (sell > selectedItem.count) {

        alert("보유 개수보다 많이 판매할 수 없습니다.");

        return;

    }

    // ======================
    // 남은 개수
    // ======================

    const remain = selectedItem.count - sell;

    // ======================
    // inventory 수정
    // ======================

    if (remain == 0) {

        await sb
            .from("inventory")
            .delete()
            .eq("member_code", memberCode)
            .eq("fish_id", selectedItem.fish_id);

    }

    else {

        await sb
            .from("inventory")
            .update({

                count: remain

            })
            .eq("member_code", memberCode)
            .eq("fish_id", selectedItem.fish_id);

    }

    // ======================
    // 판매 금액 계산
    // ======================

    const fish = FishData.find(x => x.id === selectedItem.fish_id);

    const earn = fish.price * sell;

    // ======================
    // 플레이어 골드 증가
    // ======================

    player.gold += earn;

    await sb
        .from("players")
        .update({

            gold: player.gold

        })
        .eq("member_code", memberCode);

    // ======================
    // 골드 갱신
    // ======================

    document.getElementById("goldBox").innerHTML = `💰 ${player.gold.toLocaleString()} G`;

    // ======================
    // inventory 다시 불러오기
    // ======================

    const result = await sb
        .from("inventory")
        .select("*")
        .eq("member_code", memberCode);

    inventory = sortInventory(result.data || []);

    const gradeOrder = {

        ancient: 7,
        relic: 6,
        legendary: 5,
        epic: 4,
        rare: 3,
        uncommon: 2,
        common: 1

    };

    inventory.sort((a, b) => {

        const fishA = FishData.find(x => x.id === a.fish_id);

        const fishB = FishData.find(x => x.id === b.fish_id);

        // 1순위 : 희귀도
        const gradeDiff = gradeOrder[fishB.grade] - gradeOrder[fishA.grade];

        if (gradeDiff !== 0)
            return gradeDiff;

        // 2순위 : 이름
        return fishA.name.localeCompare(fishB.name, "ko");

    });

    // ======================
    // 팝업 닫기
    // ======================

    sellPopup.style.display = "none";

    // ======================
    // 판매 목록 새로고침
    // ======================

    loadSell();

};

minBtn.onclick = () => {

    sellCount.value = 1;

};

minusBtn.onclick = () => {

    let value =
        Number(sellCount.value);

    if (value > 1) {

        sellCount.value =
            value - 1;

    }

};

plusBtn.onclick = () => {

    let value =
        Number(sellCount.value);

    let max =
        Number(sellCount.max);

    if (value < max) {

        sellCount.value =
            value + 1;

    }

};

maxBtn.onclick = () => {

    sellCount.value =
        sellCount.max;

};

sellCount.addEventListener("input", () => {

    sellCount.value =
        sellCount.value.replace(/[^0-9]/g, "");

});

cancelBuy.onclick = () => {

    buyPopup.style.display =
        "none";

};

rodTab.onclick = () => {

    rodTab.classList.add("active");

    baitTab.classList.remove("active");

    accessoryTab.classList.remove("active");

    loadBuyRod();

};

baitTab.onclick = () => {

    baitTab.classList.add("active");

    rodTab.classList.remove("active");

    accessoryTab.classList.remove("active");

    loadBuyBait();

};

accessoryTab.onclick = () => {

    accessoryTab.classList.add("active");

    rodTab.classList.remove("active");

    baitTab.classList.remove("active");

    loadBuyAccessory();

};