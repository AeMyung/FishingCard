const memberCode =
    localStorage.getItem("member_code");

if(!memberCode){

    location.href =
        "../login/login.html";

}

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );

logoutBtn.onclick = () => {

    if(confirm("로그아웃 하시겠습니까?")){

        localStorage.removeItem(
            "member_code"
        );

        location.href =
            "../login/login.html";

    }

};