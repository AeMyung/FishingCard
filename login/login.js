const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const memberInput = document.getElementById("memberCode");
const loginBtn = document.getElementById("loginBtn");
const errorText = document.getElementById("error");

// 이미 로그인되어 있으면 메인으로 이동
const savedCode = localStorage.getItem("member_code");

if (savedCode) {
    location.href = "../menu/menu.html";
}

loginBtn.onclick = async () => {

    errorText.innerHTML = "";

    const code = memberInput.value.trim();

    if (code === "") {
        errorText.innerHTML = "회원코드를 입력해주세요.";
        return;
    }

    console.log("========== DEBUG ==========");
    console.log("URL :", SUPABASE_URL);
    console.log("CODE :", code);

    // 전체 조회 테스트
    const allResult = await sb
        .from("players")
        .select("*");

    console.log("전체조회");
    console.log(allResult);

    // 회원코드 조회
    const oneResult = await sb
        .from("players")
        .select("*")
        .eq("member_code", code);

    console.log("조건조회");
    console.log(oneResult);

    if (oneResult.error) {

        console.error(oneResult.error);

        errorText.innerHTML =
            "Supabase 오류가 발생했습니다.";

        return;
    }

    if (!oneResult.data || oneResult.data.length === 0) {

        errorText.innerHTML =
            "존재하지 않는 회원코드입니다.";

        return;
    }

    localStorage.setItem(
        "member_code",
        oneResult.data[0].member_code
    );

    location.href =
        "../menu/menu.html";
};