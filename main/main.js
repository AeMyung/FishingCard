const memberCode =
    localStorage.getItem(
        "member_code"
    );

if (!memberCode) {

    location.href =
        "../login/login.html";

}

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

logoutBtn.onclick = () => {

    const ok =
        confirm(
            "로그아웃 하시겠습니까?"
        );

    if (!ok) return;

    localStorage.removeItem(
        "member_code"
    );

    location.replace(
        "../login/login.html"
    );

};