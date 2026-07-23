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

const FishingGradeOrder = {

    common: 1,
    uncommon: 2,
    rare: 3,
    epic: 4,
    legendary: 5,
    relic: 6,
    ancient: 7

};

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
const shopBtn = document.getElementById("shopBtn");
const catchCountText = document.getElementById("catchCount");


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
let autoCatchTimer = null;

let rodBroken = false;
let baitDepleted = false;
let currentRodEffect = null;
let currentBaitEffect = null;

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

    // ======================
    // 현재 지역 출현 목록
    // ======================

    let list =
        getFishByLocation(location)
            .filter(
                fish =>
                    fish.id &&
                    fish.weight > 0
            )
            .map(
                fish => ({
                    ...fish
                })
            );

    // ======================
    // 미끼 없음 패널티
    // 쓰레기 가중치 3배
    // ======================

    if (!currentBaitEffect) {

        list.forEach(fish => {

            if (fish.type === "trash") {

                fish.weight *= 3;

            }

        });

    }


    // ======================
    // 미끼 효과 적용
    // ======================

    if (currentBaitEffect) {

        // ======================
        // 등급 확률 증가
        // ======================

        if (
            currentBaitEffect.type ===
            EffectType.GRADE
        ) {

            const targetGrade =
                FishingGradeOrder[
                currentBaitEffect.target
                ];


            list.forEach(fish => {

                // 쓰레기는 등급 미끼 효과 제외
                if (
                    fish.type !== "fish"
                ) {

                    return;

                }


                const fishGrade =
                    FishingGradeOrder[
                    fish.grade
                    ];


                // target 등급 이상
                if (
                    fishGrade >= targetGrade
                ) {

                    fish.weight *=
                        1 +
                        currentBaitEffect.value /
                        100;

                }

            });

        }

    }


    // ======================
    // 전체 가중치 계산
    // ======================

    const totalWeight =
        list.reduce(
            (sum, fish) =>
                sum + fish.weight,
            0
        );


    if (
        list.length === 0 ||
        totalWeight <= 0
    ) {

        console.error(
            "낚을 수 있는 물고기가 없습니다."
        );

        return null;

    }


    // ======================
    // 랜덤 추첨
    // ======================

    let random =
        Math.random() *
        totalWeight;


    for (const fish of list) {

        random -=
            fish.weight;


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

    clearTimeout(
        autoCatchTimer
    );

    autoCatchTimer =
        null;

    miniGame.style.display = "none";
    message.style.display = "none";

    isFishing = false;

    fishBtn.innerHTML = "🎣 낚시하기";

    setFishingMenuDisabled(false);

}

// ======================
// 미니게임 시작
// ======================

async function startMiniGame() {

    const success =
        await consumeFishingTools();


    if (!success) {

        stopFishing();

        return;

    }


    // ======================
    // 자동 낚싯대
    // ======================

    if (
        currentRodEffect &&
        currentRodEffect.type ===
        EffectType.AUTO
    ) {

        await successFishing();

        return;

    }


    // ======================
    // 일반 미니게임
    // ======================

    miniGame.style.display =
        "block";


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

    const fish =
        randomFish(locationId);


    // 기본 1마리
    let catchCount = 1;


    // ======================
    // DOUBLE 효과
    // ======================

    if (
        currentRodEffect &&
        currentRodEffect.type ===
        EffectType.DOUBLE
    ) {

        const chance =
            currentRodEffect.value;


        if (
            Math.random() * 100 <
            chance
        ) {

            catchCount = 2;

        }

    }


    // ======================
    // 물고기 지급
    // ======================

    for (
        let i = 0;
        i < catchCount;
        i++
    ) {

        await addFish(
            fish.id
        );

    }


    // ======================
    // 획득 팝업
    // ======================

    catchPopup.style.display =
        "block";

    catchCard.src =
        "../images/" +
        fish.id +
        ".png";


    // 2배 획득 표시
    if (catchCount === 2) {

        catchCountText.innerHTML =
            "x2";

    } else {

        catchCountText.innerHTML =
            "";

    }


    isFishing = false;

    fishBtn.innerHTML =
        "🎣 낚시하기";

    // ======================
    // 자동 낚싯대
    // 획득창 3초 후 자동 진행
    // ======================

    if (
        currentRodEffect &&
        currentRodEffect.type === EffectType.AUTO
    ) {

        clearTimeout(autoCatchTimer);

        autoCatchTimer =
            setTimeout(() => {

                catchPopup.style.display =
                    "none";


                // 마지막 내구도로
                // 낚싯대가 부러진 경우
                if (rodBroken) {

                    rodBroken =
                        false;

                    alert(
                        "낚싯대가 부러졌습니다.\n다른 낚싯대를 사용해주세요."
                    );

                    stopFishing();

                    return;
                }

                // ======================
                // 미끼 소진
                // ======================

                if (baitDepleted) {

                    baitDepleted = false;

                    alert(
                        "사용 중인 미끼를 모두 소진했습니다.\n다음 낚시부터 미끼 없이 진행됩니다."
                    );

                }


                // 다음 낚시 자동 시작
                startFishing();

            }, 3000);

    }

}

// ======================
// 낚시 실패
// ======================

function failFishing() {

    miniGame.style.display = "none";

    message.style.display = "block";

    message.innerHTML = "❌<br><br>물고기를 놓쳤습니다.";

    if (rodBroken) {

        rodBroken = false;

        alert(
            "물고기가 도망갔고 낚싯대가 부러졌습니다.\n다른 낚싯대를 사용해주세요."
        );

    }

    if (baitDepleted) {

        baitDepleted = false;

        alert(
            "사용 중인 미끼를 모두 소진했습니다.\n다음 낚시부터 미끼 없이 진행됩니다."
        );

    }

    stopFishing();

    isFishing = false;
    fishBtn.innerHTML = "🎣 낚시하기";

    setTimeout(() => {

        message.style.display = "none";

    }, 2000);

}

closePopup.onclick = () => {

    clearTimeout(
        autoCatchTimer
    );

    autoCatchTimer =
        null;

    catchPopup.style.display =
        "none";


    // ======================
    // 낚싯대 파괴
    // ======================

    if (rodBroken) {

        rodBroken = false;

        alert(
            "낚싯대가 부러졌습니다.\n다른 낚싯대를 사용해주세요."
        );

        stopFishing();

        return;
    }


    // ======================
    // 미끼 소진
    // ======================

    if (baitDepleted) {

        baitDepleted = false;

        alert(
            "사용 중인 미끼를 모두 소진했습니다.\n다음 낚시부터 미끼 없이 진행됩니다."
        );

    }


    startFishing();
};

function startFishing() {

    if (!selectedRod) {

        alert(
            "장착된 낚시대가 없습니다. 낚시도구에서 낚싯대를 장착해주세요."
        );

        return;
    }

    // 다른 메뉴 잠금
    setFishingMenuDisabled(true);


    // ======================
    // 이번 낚시에 사용할 효과 저장
    // ======================

    const rodData =
        RodData.find(
            rod =>
                rod.id === selectedRod.item_id
        );

    const baitData =
        selectedBait
            ? BaitData.find(
                bait =>
                    bait.id === selectedBait.item_id
            )
            : null;


    currentRodEffect =
        rodData
            ? { ...rodData.effect }
            : null;

    currentBaitEffect =
        baitData
            ? { ...baitData.effect }
            : null;


    isFishing = true;

    fishBtn.innerHTML =
        "❌ 낚시 중단";

    message.style.display =
        "none";


    // 기본 입질 시간
    let wait =
        3000 +
        Math.random() * 5000;


    // ======================
    // TIME 효과
    // ======================

    if (
        currentRodEffect &&
        currentRodEffect.type ===
        EffectType.TIME
    ) {

        wait *=
            1 -
            currentRodEffect.value / 100;

    }


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
// 낚시도구 소모
// ======================

async function consumeFishingTools() {

    const usedRod =
        selectedRod;

    const usedBait =
        selectedBait;


    const { data, error } =
        await sb.rpc(
            "consume_fishing_tools",
            {
                p_member_code:
                    memberCode,

                p_rod_id:
                    usedRod.id,

                p_bait_id:
                    usedBait
                        ? usedBait.id
                        : null
            }
        );


    if (error) {

        console.error(error);

        alert(
            "낚시도구 소모 중 오류가 발생했습니다."
        );

        return false;

    }


    // ======================
    // 낚싯대 상태 갱신
    // ======================

    if (data.rod_deleted) {

        fishingItems =
            fishingItems.filter(
                item =>
                    item.id !== usedRod.id
            );

        selectedRod = null;

        rodBroken = true;

    }

    else {

        usedRod.durability =
            data.rod_durability;

    }


    // ======================
    // 미끼 상태 갱신
    // ======================

    if (usedBait) {

        if (data.bait_deleted) {

            fishingItems =
                fishingItems.filter(
                    item =>
                        item.id !== usedBait.id
                );

            selectedBait =
                null;

            baitDepleted =
                true;

        }

        else {

            usedBait.count =
                data.bait_count;

        }

    }


    return true;

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

                ${item.infiniteDurability
                    ? "∞"
                    : `${currentRod.durability} / ${item.maxDurability}`
                }

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

                ${item.infiniteDurability
                    ? "∞"
                    : `${inventoryItem.durability} / ${item.maxDurability}`
                }

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


        // DB의 equipped 상태로 복원
        restoreEquippedFishingItems();


        // 현재 장착 장비를
        // 임시 선택값으로 복사

        tempRod =
            selectedRod;

        tempBait =
            selectedBait;


        rodListOpen =
            false;

        baitListOpen =
            false;


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

toolApplyBtn.onclick =
    async () => {

        // ======================
        // 낚싯대 필수
        // ======================

        if (!tempRod) {

            alert(
                "사용할 낚싯대를 선택해주세요."
            );

            return;

        }


        // 중복 클릭 방지
        toolApplyBtn.disabled = true;


        // ======================
        // Supabase 장착 저장
        // ======================

        const { error } =
            await sb.rpc(
                "equip_fishing_tools",
                {
                    p_member_code:
                        memberCode,

                    p_rod_id:
                        tempRod.id,

                    p_bait_id:
                        tempBait
                            ? tempBait.id
                            : null
                }
            );


        if (error) {

            console.error(error);

            alert(
                "낚시도구 적용 중 오류가 발생했습니다."
            );

            toolApplyBtn.disabled = false;

            return;

        }


        // ======================
        // 현재 JS 상태 갱신
        // ======================

        fishingItems.forEach(
            item => {

                if (
                    item.item_type === "rod" ||
                    item.item_type === "bait"
                ) {

                    item.equipped =
                        false;

                }

            }
        );


        tempRod.equipped =
            true;


        if (tempBait) {

            tempBait.equipped =
                true;

        }


        selectedRod =
            tempRod;

        selectedBait =
            tempBait;


        // ======================
        // 창 닫기
        // ======================

        toolPopup.style.display =
            "none";


        toolApplyBtn.disabled =
            false;

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

function restoreEquippedFishingItems() {

    // ======================
    // 장착 낚싯대
    // ======================

    selectedRod =
        fishingItems.find(
            item =>
                item.item_type === "rod" &&
                item.equipped === true
        ) || null;


    // ======================
    // 장착 미끼
    // ======================

    selectedBait =
        fishingItems.find(
            item =>
                item.item_type === "bait" &&
                item.equipped === true &&
                item.count > 0
        ) || null;

}

// ======================
// 페이지 진입 시 장착 장비 복원
// ======================

async function initializeFishingTools() {

    const success =
        await loadFishingItems();


    if (!success)
        return;


    restoreEquippedFishingItems();

}

initializeFishingTools();

shopBtn.onclick = () => {

    window.location.href =
        "../shop/shop.html";

};

function setFishingMenuDisabled(disabled) {

    toolBtn.disabled =
        disabled;

    inventoryBtn.disabled =
        disabled;

    shopBtn.disabled =
        disabled;

}