const sb =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

const memberInput =
    document.getElementById(
        "memberCode"
    );

const loginBtn =
    document.getElementById(
        "loginBtn"
    );

const error =
    document.getElementById(
        "error"
    );


// 이미 로그인되어 있으면 이동
const savedCode =
    localStorage.getItem(
        "member_code"
    );

if (savedCode) {

    location.href =
        "../main/main.html";

}


loginBtn.onclick = async () => {

    const code =
        memberInput.value.trim();

    if (code == "") {

        error.innerHTML =
            "회원코드를 입력해주세요.";

        return;

    }

    const { data, error: dbError } =
        await sb
            .from("players")

            .select("*")

            .eq("member_code", code)

            .single();


    if (dbError || !data) {

        error.innerHTML =
            "존재하지 않는 회원코드입니다.";

        return;

    }

    localStorage.setItem(
        "member_code",
        data.member_code
    );

    location.href =
        "../main/main.html";

};