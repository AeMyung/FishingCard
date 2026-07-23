const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

(async () => {

    // ======================
    // 로그인 확인
    // ======================

    const memberCode = localStorage.getItem("member_code");

    if (!memberCode) {
        location.href = "../login/login.html";
        return;
    }

    const { data: player } = await sb
        .from("players")
        .select("nickname, gold")
        .eq("member_code", memberCode)
        .single();

    if (!player) {
        localStorage.removeItem("member_code");
        location.href = "../login/login.html";
        return;
    }

    document.getElementById("title").innerHTML = `
    🎒 ${player.nickname}님의 가방
    <span id="goldBox">
        💰 ${player.gold.toLocaleString()} G
    </span>
`;

    // ======================
    // 인벤토리 조회
    // ======================

    const { data: inventory, error } = await sb
        .from("inventory")
        .select("*")
        .eq("member_code", memberCode);

    // ======================
    // 장비 인벤토리 조회
    // ======================

    const {
        data: itemInventory,
        error: itemError
    } = await sb
        .from("item_inventory")
        .select("*")
        .eq("member_code", memberCode)
        .order("id", {
            ascending: true
        });

    if (itemError) {

        console.error(itemError);

    }

    const sortedInventory = sortInventory(inventory);

    if (error) {
        console.error(error);
        return;
    }

    const list =
        document.getElementById(
            "inventoryList"
        );

    list.innerHTML = "";

    // ======================
    // 장비 세부 탭
    // ======================

    const equipmentTabs =
        document.getElementById(
            "equipmentTabs"
        );

    const rodTab =
        document.getElementById(
            "rodTab"
        );

    const baitTab =
        document.getElementById(
            "baitTab"
        );

    const accessoryTab =
        document.getElementById(
            "accessoryTab"
        );


    // 현재 선택된 장비 종류
    let selectedEquipmentType =
        "rod";

    // ======================
    // 아이템 출력
    // ======================
    function loadFish() {

        list.style.display = "block";

        list.innerHTML = "";

        for (const item of sortedInventory) {

            const fish =
                FishData.find(
                    x => x.id === item.fish_id
                );

            if (!fish) continue;

            const div =
                document.createElement(
                    "div"
                );

            div.className = "item";

            div.innerHTML = `
            <img src="../images/${fish.image}">

            <div class="info">

                <div class="name">
                    ${fish.name}
                </div>

                <div class="desc">
                    ${fish.description}
                </div>

            </div>

            <div class="count">
                x${item.count}
            </div>
        `;

            list.appendChild(div);

        }

    }

    // ======================
    // 장비 출력
    // ======================

    function loadItem(
        type = selectedEquipmentType
    ) {

        selectedEquipmentType =
            type;

        list.style.display =
            "block";

        list.innerHTML =
            "";


        // ======================
        // 해당 종류만 가져오기
        // ======================

        const filteredInventory =
            itemInventory.filter(
                inventoryItem =>
                    inventoryItem.item_type ===
                    type
            );


        // ======================
        // item.js 기준 출력 순서
        // ======================

        let dataOrder = [];


        if (type === "rod") {

            dataOrder =
                RodData;

        }

        else if (type === "bait") {

            dataOrder =
                BaitData;

        }

        else if (type === "accessory") {

            dataOrder =
                AccessoryData;

        }


        // ======================
        // item.js 순서대로 정렬
        // ======================

        filteredInventory.sort(
            (a, b) => {

                const aIndex =
                    dataOrder.findIndex(
                        item =>
                            item.id ===
                            a.item_id
                    );

                const bIndex =
                    dataOrder.findIndex(
                        item =>
                            item.id ===
                            b.item_id
                    );

                return aIndex - bIndex;

            }
        );


        // ======================
        // 보유 아이템 없음
        // ======================

        if (
            filteredInventory.length === 0
        ) {

            let typeName = "";


            if (type === "rod") {

                typeName =
                    "낚싯대";

            }

            else if (type === "bait") {

                typeName =
                    "미끼";

            }

            else {

                typeName =
                    "장신구";

            }


            list.innerHTML = `

            <h2 class="emptyMessage">

                보유한 ${typeName}가 없습니다.

            </h2>

        `;

            return;

        }


        // ======================
        // 아이템 출력
        // ======================

        for (
            const inventoryItem
            of filteredInventory
        ) {

            const item =
                ItemData.find(
                    x =>
                        x.id ===
                        inventoryItem.item_id
                );


            if (!item)
                continue;


            const div =
                document.createElement(
                    "div"
                );

            div.className =
                "item";


            let rightInfo =
                "";


            // ======================
            // 낚싯대
            // ======================

            if (type === "rod") {

                const durabilityText =
                    item.infiniteDurability
                        ? "∞"
                        : `${inventoryItem.durability} / ${item.maxDurability}`;


                rightInfo = `

                    <div class="durability">

                        내구도

                        <strong>
                            ${durabilityText}
                        </strong>

                    </div>

                `;

            }


            // ======================
            // 미끼
            // ======================

            else if (type === "bait") {

                rightInfo = `

                <div class="count">

                    x${inventoryItem.count}

                </div>

            `;

            }


            // ======================
            // 장신구
            // ======================

            else if (
                type === "accessory"
            ) {

                rightInfo = `

                <button
                    class="
                        equipBtn
                        ${inventoryItem.equipped
                        ? "equipped"
                        : ""
                    }
                    "
                >

                    ${inventoryItem.equipped
                        ? "착용 해제"
                        : "착용"
                    }

                </button>

            `;

            }


            // ======================
            // 아이템 UI
            // ======================

            div.innerHTML = `

            <img
                src="../images/${item.image}"
            >

            <div class="info">

                <div class="name">
                    ${item.name}
                </div>

                <div class="desc">
                    ${item.description}
                </div>

            </div>

            ${rightInfo}

        `;


            // ======================
            // 장신구 착용 버튼
            // ======================

            if (
                type ===
                "accessory"
            ) {

                const equipBtn =
                    div.querySelector(
                        ".equipBtn"
                    );


                equipBtn.onclick =
                    async () => {

                        await toggleAccessory(
                            inventoryItem
                        );

                    };

            }


            list.appendChild(
                div
            );

        }

    }

    // ======================
    // 장신구 착용 / 해제
    // ======================

    async function toggleAccessory(
        inventoryItem
    ) {

        const newEquipped =
            !inventoryItem.equipped;


        const { error } =
            await sb
                .from("item_inventory")
                .update({

                    equipped:
                        newEquipped

                })
                .eq(
                    "id",
                    inventoryItem.id
                )
                .eq(
                    "member_code",
                    memberCode
                )
                .eq(
                    "item_type",
                    "accessory"
                );


        if (error) {

            console.error(error);

            alert(
                "장신구 상태 변경 중 오류가 발생했습니다."
            );

            return;

        }


        inventoryItem.equipped =
            newEquipped;


        // 현재 장신구 탭 다시 출력
        loadItem(
            "accessory"
        );

    }

    // ======================
    // 장비 세부 탭 선택
    // ======================

    function setEquipmentTab(
        selectedTab
    ) {

        rodTab.classList.remove(
            "active"
        );

        baitTab.classList.remove(
            "active"
        );

        accessoryTab.classList.remove(
            "active"
        );


        selectedTab.classList.add(
            "active"
        );

    }

    const fishTab =
        document.getElementById(
            "fishTab"
        );

    const itemTab =
        document.getElementById(
            "itemTab"
        );

    fishTab.onclick = () => {

        fishTab.classList.add(
            "active"
        );

        itemTab.classList.remove(
            "active"
        );

        equipmentTabs.style.display =
            "none";

        loadFish();

    };

    itemTab.onclick = () => {

        itemTab.classList.add(
            "active"
        );

        fishTab.classList.remove(
            "active"
        );


        // 장비 세부 탭 표시
        equipmentTabs.style.display =
            "flex";


        // 장비를 처음 열면 낚싯대
        selectedEquipmentType =
            "rod";

        setEquipmentTab(
            rodTab
        );

        loadItem(
            "rod"
        );

    };

    // ======================
    // 낚싯대 탭
    // ======================

    rodTab.onclick = () => {

        setEquipmentTab(
            rodTab
        );

        loadItem(
            "rod"
        );

    };


    // ======================
    // 미끼 탭
    // ======================

    baitTab.onclick = () => {

        setEquipmentTab(
            baitTab
        );

        loadItem(
            "bait"
        );

    };


    // ======================
    // 장신구 탭
    // ======================

    accessoryTab.onclick = () => {

        setEquipmentTab(
            accessoryTab
        );

        loadItem(
            "accessory"
        );

    };
})();