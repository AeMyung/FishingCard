const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

(async()=>{

    const memberCode =
        localStorage.getItem("member_code");

    if(!memberCode){

        location.href="../login/login.html";
        return;

    }

    const {data:player}=await sb
        .from("players")
        .select("nickname,gold")
        .eq("member_code",memberCode)
        .single();

    if(!player){

        localStorage.removeItem("member_code");

        location.href="../login/login.html";

        return;

    }

    document.getElementById("nickname").innerHTML=
        `👤 ${player.nickname}`;

    document.getElementById("gold").innerHTML=
        `💰 ${player.gold.toLocaleString()} G`;

})();

document.getElementById("logoutBtn").onclick=()=>{

    if(!confirm("로그아웃 하시겠습니까?"))
        return;

    localStorage.removeItem("member_code");

    location.href="../login/login.html";

};