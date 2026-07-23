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

const detailPopup = document.getElementById("detailPopup");

const detailImage = document.getElementById("detailImage");

const detailTitle = document.getElementById("detailTitle");

const detailDescription = document.getElementById("detailDescription");

const detailDurability = document.getElementById("detailDurability");

const closeDetail = document.getElementById("closeDetail");

const baitBuyPopup = document.getElementById("baitBuyPopup");

const baitBuyImage = document.getElementById("baitBuyImage");

const baitBuyTitle = document.getElementById("baitBuyTitle");

const baitUnitPrice = document.getElementById("baitUnitPrice");

const baitBuyCount = document.getElementById("baitBuyCount");

const baitTotalPrice = document.getElementById("baitTotalPrice");

const baitMinBtn = document.getElementById("baitMinBtn");

const baitMinusBtn = document.getElementById("baitMinusBtn");

const baitPlusBtn = document.getElementById("baitPlusBtn");

const baitMaxBtn = document.getElementById("baitMaxBtn");

const confirmBaitBuy = document.getElementById("confirmBaitBuy");

const cancelBaitBuy = document.getElementById("cancelBaitBuy");

let selectedBait = null;

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

        div.querySelector(".detailBtn").onclick = () => {

            showDetail(rod);

        };

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

    shopList.style.display = "block";

    shopList.innerHTML = "";

    for (const bait of BaitData) {

        if (!bait.shop.sell)
            continue;

        const div =
            document.createElement(
                "div"
            );

        div.className =
            "shopItem";

        div.innerHTML = `

            <img src="../images/${bait.image}">

            <div class="info">

                <div class="name">

                    ${bait.name}

                </div>

                <div class="price">

                    구매가 : ${bait.shop.price.toLocaleString()} G

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

        div.querySelector(".detailBtn").onclick = () => {

            showDetail(bait);

        };

        div.querySelector(".buyBtn").onclick = () => {

            selectedBait = bait;

            baitBuyImage.src =
                `../images/${bait.image}`;

            baitBuyTitle.innerHTML =
                bait.name;

            baitUnitPrice.innerHTML =
                `개당 ${bait.shop.price.toLocaleString()} G`;

            baitBuyCount.value = 1;

            updateBaitTotalPrice();

            baitBuyPopup.style.display =
                "flex";

        };

        shopList.appendChild(div);

    }

}

// ======================
// 장신구 구매 목록
// ======================

async function loadBuyAccessory() {

    shopList.innerHTML = "";

    // ======================
    // 내가 보유한 장신구 조회
    // ======================

    const {
        data: ownedAccessories,
        error
    } = await sb
        .from("item_inventory")
        .select("item_id")
        .eq("member_code", memberCode)
        .eq("item_type", "accessory");


    if (error) {

        console.error(error);

        alert(
            "보유 장신구 정보를 불러오지 못했습니다."
        );

        return;

    }


    // ======================
    // 보유 장신구 ID 목록
    // ======================

    const ownedIds =
        new Set(
            ownedAccessories.map(
                item => item.item_id
            )
        );


    // ======================
    // 판매 중인 장신구
    // ======================

    const accessories =
        AccessoryData.filter(
            item =>
                item.shop?.sell === true
        );


    // ======================
    // 장신구 출력
    // ======================

    for (const accessory of accessories) {

        const owned =
            ownedIds.has(
                accessory.id
            );


        const div =
            document.createElement(
                "div"
            );

        div.className =
            "shopItem";


        div.innerHTML = `

            <img
                src="../images/${accessory.image}"
            >

            <div class="info">

                <div class="name">
                    ${accessory.name}
                </div>

                <div class="price">
                    구매가 :
                    ${accessory.shop.price.toLocaleString()} G
                </div>

            </div>


            <button class="detailBtn">
                상세
            </button>


            <button
                class="buyBtn ${owned ? "purchased" : ""}"
                ${owned ? "disabled" : ""}
            >
                ${owned ? "구매 완료" : "구매"}
            </button>
        `;


        // ======================
        // 상세 버튼
        // ======================

        div.querySelector(
            ".detailBtn"
        ).onclick = () => {

            showDetail(
                accessory
            );

        };


        // ======================
        // 구매 버튼
        // ======================

        if (!owned) {

            div.querySelector(
                ".buyBtn"
            ).onclick = () => {

                selectedBuyItem =
                    accessory;

                buyImage.src =
                    `../images/${accessory.image}`;

                buyTitle.innerHTML =
                    accessory.name;

                buyPrice.innerHTML =
                    `${accessory.shop.price.toLocaleString()} G`;

                buyPopup.style.display =
                    "flex";

            };

        }


        shopList.appendChild(
            div
        );

    }

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

// ======================
// 낚싯대 / 장신구 구매 확정
// ======================

confirmBuy.onclick = async () => {

    if (!selectedBuyItem)
        return;

    // ======================
    // 화면상 골드 검사
    // ======================

    if (
        selectedBuyItem.shop.price >
        player.gold
    ) {

        alert(
            "보유 골드가 부족합니다."
        );

        return;

    }

    // ======================
    // DB 구매 처리
    // ======================

    const { data, error } =
        await sb.rpc(
            "buy_shop_item",
            {

                p_member_code:
                    memberCode,

                p_item_id:
                    selectedBuyItem.id,

                p_count:
                    1

            }
        );

    // ======================
    // 오류 처리
    // ======================

    if (error) {

        console.error(error);

        if (
            error.message.includes(
                "NOT_ENOUGH_GOLD"
            )
        ) {

            alert(
                "보유 골드가 부족합니다."
            );

        }

        else if (
            error.message.includes(
                "ITEM_NOT_FOR_SALE"
            )
        ) {

            alert(
                "현재 구매할 수 없는 아이템입니다."
            );

        }

        else {

            alert(
                "구매 중 오류가 발생했습니다."
            );

        }

        return;

    }

    // ======================
    // DB에서 반환된 골드 적용
    // ======================

    player.gold =
        Number(data);

    document.getElementById(
        "goldBox"
    ).innerHTML =
        `💰 ${player.gold.toLocaleString()} G`;

    // ======================
    // 구매 완료
    // ======================

    const itemName =
        selectedBuyItem.name;

    const itemType =
        selectedBuyItem.type;


    buyPopup.style.display =
        "none";

    selectedBuyItem = null;


    // ======================
    // 장신구 구매 목록 갱신
    // ======================

    if (itemType === "accessory") {

        await loadBuyAccessory();

    }


    alert(
        `${itemName}을(를) 구매했습니다.`
    );

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

function showDetail(item) {

    detailImage.src =
        `../images/${item.image}`;

    detailTitle.innerHTML =
        item.name;

    detailDescription.innerHTML =
        item.description;

    // 낚싯대처럼 maxDurability가 있는 아이템만 표시
    if (item.maxDurability !== undefined) {

        detailDurability.innerHTML =
            `내구도 : ${item.maxDurability}`;

        detailDurability.style.display =
            "block";

    }

    else {

        detailDurability.style.display =
            "none";

    }

    detailPopup.style.display =
        "flex";

}

closeDetail.onclick = () => {

    detailPopup.style.display =
        "none";

};

function updateBaitTotalPrice() {

    if (!selectedBait)
        return;

    let count =
        Number(baitBuyCount.value);

    if (!count || count < 1)
        count = 1;

    const total =
        selectedBait.shop.price * count;

    baitTotalPrice.innerHTML =
        `총 가격 : ${total.toLocaleString()} G`;

}

baitMinBtn.onclick = () => {

    baitBuyCount.value = 1;

    updateBaitTotalPrice();

};

baitMinusBtn.onclick = () => {

    let count =
        Number(baitBuyCount.value);

    if (count > 1) {

        baitBuyCount.value =
            count - 1;

    }

    updateBaitTotalPrice();

};

baitPlusBtn.onclick = () => {

    let count =
        Number(baitBuyCount.value);

    if (!count || count < 1)
        count = 1;

    baitBuyCount.value =
        count + 1;

    updateBaitTotalPrice();

};

baitMaxBtn.onclick = () => {

    if (!selectedBait)
        return;

    const maxCount =
        Math.floor(
            player.gold /
            selectedBait.shop.price
        );

    if (maxCount < 1) {

        baitBuyCount.value = 1;

    }

    else {

        baitBuyCount.value =
            maxCount;

    }

    updateBaitTotalPrice();

};

baitBuyCount.addEventListener(
    "input",
    () => {

        baitBuyCount.value =
            baitBuyCount.value.replace(
                /[^0-9]/g,
                ""
            );

        updateBaitTotalPrice();

    }
);

cancelBaitBuy.onclick = () => {

    baitBuyPopup.style.display =
        "none";

    selectedBait = null;

};

// ======================
// 미끼 구매 확정
// ======================

confirmBaitBuy.onclick = async () => {

    if (!selectedBait)
        return;

    const count =
        Number(baitBuyCount.value);

    // ======================
    // 1. 수량 검사
    // ======================

    if (!count || count < 1) {

        alert(
            "1개 이상 구매해야 합니다."
        );

        return;

    }

    // ======================
    // 화면상 총 가격 계산
    // ======================

    const totalPrice =
        selectedBait.shop.price *
        count;

    // ======================
    // 2. 화면상 골드 검사
    // ======================

    if (totalPrice > player.gold) {

        alert(
            "보유 골드가 부족합니다.\n\n" +
            `필요 골드 : ${totalPrice.toLocaleString()} G\n` +
            `보유 골드 : ${player.gold.toLocaleString()} G`
        );

        return;

    }

    // ======================
    // DB 구매 처리
    // ======================

    const { data, error } =
        await sb.rpc(
            "buy_shop_item",
            {

                p_member_code:
                    memberCode,

                p_item_id:
                    selectedBait.id,

                p_count:
                    count

            }
        );

    // ======================
    // 오류 처리
    // ======================

    if (error) {

        console.error(error);

        if (
            error.message.includes(
                "NOT_ENOUGH_GOLD"
            )
        ) {

            alert(
                "보유 골드가 부족합니다."
            );

        }

        else if (
            error.message.includes(
                "INVALID_COUNT"
            )
        ) {

            alert(
                "구매 수량이 올바르지 않습니다."
            );

        }

        else if (
            error.message.includes(
                "ITEM_NOT_FOR_SALE"
            )
        ) {

            alert(
                "현재 구매할 수 없는 아이템입니다."
            );

        }

        else {

            alert(
                "구매 중 오류가 발생했습니다."
            );

        }

        return;

    }

    // ======================
    // DB에서 반환된 골드 적용
    // ======================

    player.gold =
        Number(data);

    document.getElementById(
        "goldBox"
    ).innerHTML =
        `💰 ${player.gold.toLocaleString()} G`;

    // ======================
    // 구매 완료
    // ======================

    const baitName =
        selectedBait.name;

    baitBuyPopup.style.display =
        "none";

    selectedBait = null;

    alert(
        `${baitName} ${count}개를 구매했습니다.`
    );

};