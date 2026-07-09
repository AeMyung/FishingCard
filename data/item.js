// ======================
// 효과 타입
// ======================

const EffectType = {

    // 낚싯대
    NONE: "none",
    TIME: "time",
    DOUBLE: "double",
    AUTO: "auto",

    // 장신구
    GOLD: "gold",

    // 미끼
    GRADE: "grade",
    LOCATION: "location",
    FISH: "fish",
    HIDDEN: "hidden"

};

// ======================
// 낚싯대
// ======================

const RodData = [

    {

        id: "basic_rod",

        name: "기본 낚싯대",

        description:
            "평범한 낚싯대.",

        price: 0,

        image: "basic_rod.png",

        maxDurability: 100,

        effect: {

            type: EffectType.NONE,

            value: 0

        }

    },

    {

        id: "speed_rod",

        name: "숙련자의 낚싯대",

        description:
            "낚시 시간이 30% 감소한다.",

        price: 5000,

        image: "speed_rod.png",

        maxDurability: 120,

        effect: {

            type: EffectType.TIME,

            value: 30

        }

    },

    {

        id: "double_rod",

        name: "풍요의 낚싯대",

        description:
            "15% 확률로 같은 물고기를 한 마리 더 낚는다.",

        price: 20000,

        image: "double_rod.png",

        maxDurability: 80,

        effect: {

            type: EffectType.DOUBLE,

            value: 15

        }

    },

    {

        id: "auto_rod",

        name: "자동 낚싯대",

        description:
            "30초 동안 자동 낚시를 진행한다.",

        price: 100000,

        image: "auto_rod.png",

        maxDurability: 60,

        effect: {

            type: EffectType.AUTO,

            value: 30

        }

    }

];

// ======================
// 미끼
// ======================

const BaitData = [

    {

        id: "worm",

        name: "지렁이",

        description:
            "일반(Common) 물고기의 출현 확률이 증가한다.",

        price: 100,

        image: "worm.png",

        effect: {

            type: EffectType.GRADE,

            target: "common",

            value: 50

        }

    },

    {

        id: "shrimp",

        name: "새우 미끼",

        description:
            "희귀(Rare) 물고기의 출현 확률이 증가한다.",

        price: 500,

        image: "shrimp.png",

        effect: {

            type: EffectType.GRADE,

            target: "rare",

            value: 100

        }

    },

    {

        id: "hidden_bait",

        name: "신비한 미끼",

        description:
            "히든 물고기의 출현 확률이 증가한다.",

        price: 3000,

        image: "hidden_bait.png",

        effect: {

            type: EffectType.HIDDEN,

            value: 20

        }

    }

];

// ======================
// 장신구
// ======================

const AccessoryData = [

    {

        id: "gold_ring",

        name: "황금 반지",

        description:
            "물고기 판매 골드가 20% 증가한다.",

        price: 50000,

        image: "gold_ring.png",

        effect: {

            type: EffectType.GOLD,

            value: 20

        }

    }

];

// ======================
// 전체 아이템
// ======================

const ItemData = [

    ...RodData,

    ...BaitData,

    ...AccessoryData

];