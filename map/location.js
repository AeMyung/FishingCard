const Background = {

    1: "elgacia.png",

    2: "shushire.png",

    3: "payton.png",

    4: "rimlake.png",

    5: "rohendel.png",

    6: "arthentine.png",

    7: "papunika.png",

    8: "luterra.png"

};

const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const memberCode = localStorage.getItem("member_code");

if (!memberCode) {
    location.href = "../login/login.html";
}

const fishBtn = document.getElementById("fishBtn");
const miniGame = document.getElementById("miniGame");
const message = document.getElementById("message");
const catchPopup = document.getElementById("catchPopup");
const catchCard = document.getElementById("catchCard");
const closePopup = document.getElementById("closePopup");
const inventoryBtn = document.getElementById("inventoryBtn");
const toolBtn = document.getElementById("toolBtn");
const toolPopup = document.getElementById("toolPopup");
const rodList = document.getElementById("rodList");
const baitList = document.getElementById("baitList");
const toolApplyBtn = document.getElementById("toolApplyBtn");
const toolCancelBtn = document.getElementById("toolCancelBtn");


// 실제 사용 중인 장비
let selectedRod = null;
let selectedBait = null;


// 팝업에서 선택 중인 장비
let tempRod = null;
let tempBait = null;


// DB에서 가져온 장비
let fishingItems = [];

// ======================
// 장비 목록 펼침 상태
// ======================

let rodListOpen = false;
let baitListOpen = false;

inventoryBtn.onclick = () => {

    window.location.href =
        "../inventory/inventory.html";

};

const params = new URLSearchParams(window.location.search);
const locationId = Number(params.get("location")) || 1;
document.body.style.backgroundImage = `url("../images/${Background[locationId]}")`;

let isFishing = false;
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

fishBtn.onclick = () => {

    if (isFishing) {

        stopFishing();

    } else {

        startFishing();

    }

};

function stopFishing() {

    clearTimeout(fishingTimer);
    clearTimeout(failTimer);

    miniGame.style.display = "none";
    message.style.display = "none";

    isFishing = false;

    fishBtn.innerHTML = "🎣 낚시하기";

}

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

async function successFishing() {

    const fish = randomFish(locationId);

    await addFish(fish.id);

    catchPopup.style.display = "block";

    catchCard.src = "../images/" + fish.id + ".png";

    isFishing = false;
    fishBtn.innerHTML = "🎣 낚시하기";

}

// ======================
// 낚시 실패
// ======================

function failFishing() {

    miniGame.style.display = "none";

    message.style.display = "block";

    message.innerHTML = "❌<br><br>물고기를 놓쳤습니다.";

    isFishing = false;
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

    isFishing = true;

    fishBtn.innerHTML = "❌ 낚시 중단";

    message.style.display = "none";

    const wait = 3000 + Math.random() * 5000;

    fishingTimer =
        setTimeout(
            startMiniGame,
            wait
        );

}

async function addFish(fishId) {

    const { data, error } = await sb
        .from("inventory")
        .select("count")
        .eq("member_code", memberCode)
        .eq("fish_id", fishId)
        .maybeSingle();

    if (error) {
        console.error(error);
        return;
    }

    if (data) {

        // 이미 있으면 개수 증가
        const { error: updateError } = await sb
            .from("inventory")
            .update({
                count: data.count + 1
            })
            .eq("member_code", memberCode)
            .eq("fish_id", fishId);

        if (updateError) {
            console.error(updateError);
        }

    } else {

        // 처음 잡은 물고기면 INSERT
        const { error: insertError } = await sb
            .from("inventory")
            .insert({
                member_code: memberCode,
                fish_id: fishId,
                count: 1
            });

        if (insertError) {
            console.error(insertError);
        }

    }

}

// ======================
// 낚시도구 DB 조회
// ======================

async function loadFishingItems() {

    const { data, error } =
        await sb
            .from("item_inventory")
            .select("*")
            .eq(
                "member_code",
                memberCode
            )
            .in(
                "item_type",
                ["rod", "bait"]
            );


    if (error) {

        console.error(error);

        alert(
            "낚시도구를 불러오지 못했습니다."
        );

        return false;

    }


    fishingItems =
        data || [];


    return true;

}


// ======================
// 낚싯대 출력
// ======================

// ======================
// 낚싯대 출력
// ======================

function renderRodList() {

    rodList.innerHTML = "";


    const rods =
        fishingItems
            .filter(
                item =>
                    item.item_type === "rod"
            )
            .sort((a, b) => {

                const aIndex =
                    RodData.findIndex(
                        rod =>
                            rod.id === a.item_id
                    );

                const bIndex =
                    RodData.findIndex(
                        rod =>
                            rod.id === b.item_id
                    );

                return aIndex - bIndex;

            });


    // ======================
    // 낚싯대 없음
    // ======================

    if (rods.length === 0) {

        rodList.innerHTML = `

            <div class="toolEmpty">
                보유한 낚싯대가 없습니다.
            </div>

        `;

        return;

    }


    // ======================
    // 현재 임시 선택 낚싯대
    // ======================

    const currentRod =
        tempRod
            ? rods.find(
                rod =>
                    rod.id === tempRod.id
            )
            : null;


    // ======================
    // 목록이 닫혀 있을 때
    // 현재 선택된 낚싯대만 표시
    // ======================

    if (!rodListOpen) {

        if (!currentRod) {

            const empty =
                document.createElement("div");

            empty.className =
                "toolCurrent empty";

            empty.innerHTML = `

                <div class="toolItemInfo">

                    <div class="toolItemName">
                        낚싯대를 선택해주세요.
                    </div>

                </div>

                <div class="toolArrow">
                    ▼
                </div>

            `;


            empty.onclick = () => {

                rodListOpen = true;

                renderRodList();

            };


            rodList.appendChild(
                empty
            );

            return;

        }


        const item =
            RodData.find(
                rod =>
                    rod.id === currentRod.item_id
            );


        if (!item)
            return;


        const div =
            document.createElement("div");

        div.className =
            "toolCurrent";


        div.innerHTML = `

            <img
                src="../images/${item.image}"
            >

            <div class="toolItemInfo">

                <div class="toolItemName">
                    ${item.name}
                </div>

                <div class="toolItemDesc">
                    ${item.description}
                </div>

            </div>

            <div class="toolItemState">

                ${currentRod.durability}
                /
                ${item.maxDurability}

            </div>

            <div class="toolArrow">
                ▼
            </div>

        `;


        div.onclick = () => {

            rodListOpen = true;

            renderRodList();

        };


        rodList.appendChild(
            div
        );

        return;

    }


    // ======================
    // 목록이 열려 있을 때
    // ======================

    for (const inventoryItem of rods) {

        const item =
            RodData.find(
                rod =>
                    rod.id === inventoryItem.item_id
            );


        if (!item)
            continue;


        const div =
            document.createElement("div");

        div.className =
            "toolItem";


        if (
            tempRod &&
            tempRod.id === inventoryItem.id
        ) {

            div.classList.add(
                "selected"
            );

        }


        div.innerHTML = `

            <img
                src="../images/${item.image}"
            >

            <div class="toolItemInfo">

                <div class="toolItemName">
                    ${item.name}
                </div>

                <div class="toolItemDesc">
                    ${item.description}
                </div>

            </div>

            <div class="toolItemState">

                ${inventoryItem.durability}
                /
                ${item.maxDurability}

            </div>

        `;


        div.onclick = () => {

            tempRod =
                inventoryItem;

            rodListOpen =
                false;

            renderRodList();

        };


        rodList.appendChild(
            div
        );

    }

}


// ======================
// 미끼 출력
// ======================

// ======================
// 미끼 출력
// ======================

function renderBaitList() {

    baitList.innerHTML = "";


    const baits =
        fishingItems
            .filter(
                item =>
                    item.item_type === "bait" &&
                    item.count > 0
            )
            .sort((a, b) => {

                const aIndex =
                    BaitData.findIndex(
                        bait =>
                            bait.id === a.item_id
                    );

                const bIndex =
                    BaitData.findIndex(
                        bait =>
                            bait.id === b.item_id
                    );

                return aIndex - bIndex;

            });


    // ======================
    // 목록 닫힘
    // ======================

    if (!baitListOpen) {

        const div =
            document.createElement("div");

        div.className =
            "toolCurrent";


        // 미끼 사용 안 함
        if (!tempBait) {

            div.innerHTML = `

                <div class="toolItemInfo">

                    <div class="toolItemName">
                        미끼 사용 안 함
                    </div>

                    <div class="toolItemDesc">
                        미끼 효과 없이 낚시합니다.
                    </div>

                </div>

                <div class="toolArrow">
                    ▼
                </div>

            `;

        }

        // 선택된 미끼
        else {

            const inventoryItem =
                baits.find(
                    bait =>
                        bait.id === tempBait.id
                );


            const item =
                inventoryItem
                    ? BaitData.find(
                        bait =>
                            bait.id === inventoryItem.item_id
                    )
                    : null;


            if (!inventoryItem || !item) {

                tempBait = null;

                renderBaitList();

                return;

            }


            div.innerHTML = `

                <img
                    src="../images/${item.image}"
                >

                <div class="toolItemInfo">

                    <div class="toolItemName">
                        ${item.name}
                    </div>

                    <div class="toolItemDesc">
                        ${item.description}
                    </div>

                </div>

                <div class="toolItemState">
                    x${inventoryItem.count}
                </div>

                <div class="toolArrow">
                    ▼
                </div>

            `;

        }


        div.onclick = () => {

            baitListOpen = true;

            renderBaitList();

        };


        baitList.appendChild(
            div
        );

        return;

    }


    // ======================
    // 목록 열림
    // 미끼 사용 안 함
    // ======================

    const none =
        document.createElement("div");

    none.className =
        "toolItem";


    if (!tempBait) {

        none.classList.add(
            "selected"
        );

    }


    none.innerHTML = `

        <div class="toolItemInfo">

            <div class="toolItemName">
                미끼 사용 안 함
            </div>

            <div class="toolItemDesc">
                미끼 효과 없이 낚시합니다.
            </div>

        </div>

    `;


    none.onclick = () => {

        tempBait = null;

        baitListOpen = false;

        renderBaitList();

    };


    baitList.appendChild(
        none
    );


    // ======================
    // 보유 미끼
    // ======================

    for (const inventoryItem of baits) {

        const item =
            BaitData.find(
                bait =>
                    bait.id === inventoryItem.item_id
            );


        if (!item)
            continue;


        const div =
            document.createElement("div");

        div.className =
            "toolItem";


        if (
            tempBait &&
            tempBait.id === inventoryItem.id
        ) {

            div.classList.add(
                "selected"
            );

        }


        div.innerHTML = `

            <img
                src="../images/${item.image}"
            >

            <div class="toolItemInfo">

                <div class="toolItemName">
                    ${item.name}
                </div>

                <div class="toolItemDesc">
                    ${item.description}
                </div>

            </div>

            <div class="toolItemState">
                x${inventoryItem.count}
            </div>

        `;


        div.onclick = () => {

            tempBait =
                inventoryItem;

            baitListOpen =
                false;

            renderBaitList();

        };


        baitList.appendChild(
            div
        );

    }

}


// ======================
// 낚시도구 버튼
// ======================

toolBtn.onclick =
    async () => {

        const success =
            await loadFishingItems();


        if (!success)
            return;


        // 현재 사용 중인 장비를
        // 팝업 임시 선택값으로 복사

        tempRod =
            selectedRod;

        tempBait =
            selectedBait;

        rodListOpen = false;
        baitListOpen = false;


        renderRodList();

        renderBaitList();


        toolPopup.style.display =
            "flex";

    };


// ======================
// 취소
// ======================

toolCancelBtn.onclick = () => {

    toolPopup.style.display =
        "none";

};


// ======================
// 적용
// ======================

toolApplyBtn.onclick = () => {

    // 낚싯대는 필수

    if (!tempRod) {

        alert(
            "사용할 낚싯대를 선택해주세요."
        );

        return;

    }


    selectedRod =
        tempRod;

    selectedBait =
        tempBait;


    toolPopup.style.display =
        "none";

};

window.addEventListener("pageshow", () => {

    clearTimeout(fishingTimer);
    clearTimeout(failTimer);

    fishBtn.disabled = false;
    fishBtn.innerHTML = "🎣 낚시하기";

    miniGame.style.display = "none";
    message.style.display = "none";
    catchPopup.style.display = "none";

});