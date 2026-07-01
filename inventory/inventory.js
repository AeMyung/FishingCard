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