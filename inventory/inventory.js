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

    function loadItem() {

        list.style.display = "block";

        list.innerHTML = "";


        // ======================
        // 보유 장비 없음
        // ======================

        if (
            !itemInventory ||
            itemInventory.length === 0
        ) {

            list.innerHTML = `

            <h2 class="emptyMessage">
                보유한 장비가 없습니다.
            </h2>

        `;

            return;

        }


        // ======================
        // 장비 출력
        // ======================

        for (const inventoryItem of itemInventory) {

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


            // ======================
            // 오른쪽 정보
            // ======================

            let rightInfo = "";


            // 낚싯대
            if (
                inventoryItem.item_type ===
                "rod"
            ) {

                rightInfo = `

                <div class="durability">

                    내구도<br>

                    <strong>
                        ${inventoryItem.durability}
                        /
                        ${item.maxDurability}
                    </strong>

                </div>

            `;

            }


            // 미끼
            else if (
                inventoryItem.item_type ===
                "bait"
            ) {

                rightInfo = `

                <div class="count">
                    x${inventoryItem.count}
                </div>

            `;

            }


            // 장신구
            else if (
                inventoryItem.item_type ===
                "accessory"
            ) {

                rightInfo = `

                    <button
                        class="equipBtn
                        ${inventoryItem.equipped ? "equipped" : ""}"
                        data-id="${inventoryItem.id}"
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
            // 장신구 착용 / 해제
            // ======================

            if (
                inventoryItem.item_type ===
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


            // ======================
            // JS 데이터도 변경
            // ======================

            inventoryItem.equipped =
                newEquipped;


            // ======================
            // 장비 목록 다시 출력
            // ======================

            loadItem();

        }

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

        loadFish();

    };

    itemTab.onclick = () => {

        itemTab.classList.add(
            "active"
        );

        fishTab.classList.remove(
            "active"
        );

        loadItem();

    };
})();