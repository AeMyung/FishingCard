const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let inventory = [];
let memberCode = "";

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

    const { data: player } = await sb
        .from("players")
        .select("nickname, gold")
        .eq("member_code", memberCode)
        .single();

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

    inventory = result.data || [];
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

                <div class="count">

                    보유 : ${item.count}

                </div>

            </div>

        `;

        shopList.appendChild(div);

    }

}


// ======================
// 구매 탭
// ======================

function loadBuy() {

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

const sellTab =
    document.getElementById(
        "sellTab"
    );

const buyTab =
    document.getElementById(
        "buyTab"
    );

sellTab.onclick = () => {

    sellTab.classList.add(
        "active"
    );

    buyTab.classList.remove(
        "active"
    );

    loadSell();

};

buyTab.onclick = () => {

    buyTab.classList.add(
        "active"
    );

    sellTab.classList.remove(
        "active"
    );

    loadBuy();

};