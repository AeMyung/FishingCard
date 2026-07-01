const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

(async () => {

    const memberCode = localStorage.getItem("member_code");

    if (!memberCode) {
        location.href = "../login/login.html";
        return;
    }

    const { data } = await sb
        .from("players")
        .select("member_code")
        .eq("member_code", memberCode)
        .single();

    if (!data) {
        localStorage.removeItem("member_code");
        location.href = "../login/login.html";
        return;
    }

})();

const list =
    document.getElementById(
        "inventoryList"
    );

const inventory =
    JSON.parse(
        localStorage.getItem(
            "inventory"
        )
    ) || [];

for (const item of inventory) {

    const fish =
        FishData.find(
            x => x.id === item.id
        );

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