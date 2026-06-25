const fishBtn = document.getElementById("fishBtn");

const miniGame = document.getElementById("miniGame");

const message = document.getElementById("message");

let failTimer;

fishBtn.onclick = () => {

    fishBtn.disabled = true;

    fishBtn.innerHTML = "🎣 낚시 중...";

    const wait = 3000 + Math.random() * 5000;

    setTimeout(startMiniGame, wait);

};

function startMiniGame(){

    miniGame.style.display = "block";

    failTimer = setTimeout(failFishing,2000);

}

miniGame.onclick = () => {

    clearTimeout(failTimer);

    miniGame.style.display="none";

    successFishing();

};

function successFishing(){

    message.style.display="block";

    message.innerHTML="🎉 낚시에 성공했습니다!";

    fishBtn.disabled=false;

    fishBtn.innerHTML="🎣 낚시하기";

    setTimeout(()=>{

        message.style.display="none";

    },2000);

}

function failFishing(){

    miniGame.style.display="none";

    message.style.display="block";

    message.innerHTML="❌ 물고기를 놓쳤습니다.";

    fishBtn.disabled=false;

    fishBtn.innerHTML="🎣 낚시하기";

    setTimeout(()=>{

        message.style.display="none";

    },2000);

}