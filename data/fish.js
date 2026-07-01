const LocationName = {
    0: "전체",
    1: "엘가시아",
    2: "슈샤이어",
    3: "페이튼",
    4: "림레이크",
    5: "로헨델",
    6: "아르데타인",
    7: "파푸니카",
    8: "루테란"
};

const GradeData = {
    common: {
        name: "일반",
        color: "#ffffff"
    },

    uncommon: {
        name: "고급",
        color: "#5ec45e"
    },

    rare: {
        name: "희귀",
        color: "#4aa3ff"
    },

    epic: {
        name: "영웅",
        color: "#b04cff"
    },

    legendary: {
        name: "전설",
        color: "#ffb400"
    },

    relic: {
        name: "유물",
        color: "#ff6a00"
    },

    ancient: {
        name: "고대",
        color: "#e0c48f"
    }
};

const FishData = [
    {
        id: "golden_mokoko",

        name: "황금 모코코",

        type: "fish",

        grade: "legendary",

        description:
            "황금빛으로 빛나는 특별한 모코코.\n매우 희귀하여 낚시꾼들 사이에서 전설로 불린다.",

        price: 100000,

        location: [0],

        image: "golden_mokoko.png",

        page: "golden_mokoko.html",

        weight: 10
    },

    {
        id: "shoe",

        name: "누군가의 신발",

        type: "trash",

        grade: "common",

        description:
            "누군가가 신었던 신발이다. 꾸리꾸리한 냄새가 난다.",

        price: 0,

        location: [0],

        image: "shoe.png",

        page: "shoe.html",

        weight: 300
    },

    {
        id: "can",

        name: "빈 깡통",

        type: "trash",

        grade: "common",

        description:
            "광고에 자주 나온 음료이다. 저당 음료! 달콤한 맛에 빠져보세요!",

        price: 0,

        location: [0],

        image: "can.png",

        page: "can.html",

        weight: 0
    },

    {
        id: "",

        name: "",

        type: "",

        grade: "",

        description:
            "",

        price: 0,

        location: [],

        image: ".png",

        page: ".html",

        weight: 0
    },
];