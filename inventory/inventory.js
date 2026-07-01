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

    for (const item of inventory) {

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

})();