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

        type: "rod",

        name: "기본 낚싯대",

        description:
            "평범한 낚싯대.",

        image: "basic_rod.png",

        shop: {

            sell: false,

            price: 0

        },

        maxDurability: 100,

        effect: {

            type: EffectType.NONE,

            value: 0

        }

    },

    {

        id: "speed_rod",

        type: "rod",

        name: "숙련자의 낚싯대",

        description:
            "낚시 시간이 30% 감소한다.",

        image: "speed_rod.png",

        shop: {

            sell: true,

            price: 5000

        },

        maxDurability: 120,

        effect: {

            type: EffectType.TIME,

            value: 30

        }

    },

    {

        id: "double_rod",

        type: "rod",

        name: "풍요의 낚싯대",

        description:
            "15% 확률로 같은 물고기를 한 마리 더 낚는다.",

        image: "double_rod.png",

        shop: {

            sell: true,

            price: 20000

        },

        maxDurability: 80,

        effect: {

            type: EffectType.DOUBLE,

            value: 15

        }

    },

    {

        id: "auto_rod",

        type: "rod",

        name: "자동 낚싯대",

        description:
            "자동 낚시를 진행한다.",

        image: "auto_rod.png",

        shop: {

            sell: true,

            price: 100000

        },

        maxDurability: 60,

        effect: {

            type: EffectType.AUTO,

            value: 0

        }

    }

];

// ======================
// 미끼
// ======================

const BaitData = [

    {

        id: "worm",

        type: "bait",

        name: "지렁이",

        description:
            "낚시할 때 사용하는 흔한 미끼.",

        image: "worm.png",

        shop: {

            sell: true,

            price: 10

        },

        effect: {

            type: EffectType.GRADE,

            target: "common",

            value: 0

        }

    },

    {

        id: "shrimp",

        type: "bait",

        name: "새우 미끼",

        description:
            "희귀등급 이상 물고기의 출현 확률이 증가한다.",

        image: "shrimp.png",

        shop: {

            sell: true,

            price: 50

        },

        effect: {

            type: EffectType.GRADE,

            target: "rare",

            value: 100

        }

    }

];

// ======================
// 장신구
// ======================

const AccessoryData = [

    {

        id: "gold_ring",

        type: "accessory",

        name: "황금 반지",

        description:
            "물고기 판매 골드가 20% 증가한다.",

        image: "gold_ring.png",

        shop: {

            sell: true,

            price: 50000

        },

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