const dialContainer = document.querySelector('.dial-container');
const circleCanvas = document.getElementById('CircleCanvas');
const circleCtx = circleCanvas.getContext("2d");
const circles = []; //クリックで生成した円を管理する配列
const createDecayCanvases = []; //作成したcanvas要素を保存する配列

//リセットボタン
const resetButton = document.getElementById("ResetButton");

//各パラメータ設定
circleCanvas.width = circleCanvas.clientWidth;
circleCanvas.height = circleCanvas.clientHeight;

const centerX = circleCanvas.width / 2;
const centerY = circleCanvas.height / 2;
const radius = Math.min(circleCanvas.height, circleCanvas.width) / 4;
const clickradius = Math.min(circleCanvas.height, circleCanvas.width) * 0.03;
const color_black = "rgb(3,3,3)";
const color_red = "rgb(255,0,0,0.75)";

//保存用
let selectedDotIndex = -1; // 選択された打点のインデックスを保持（-1は未選択）
const dotInfos = []; // 打点の情報を保持する配列(x,y,radius, index)

//描画設定
function drawCircle() {
    circleCtx.clearRect(0, 0, circleCanvas.width, circleCanvas.height);
    circleCtx.beginPath();
    circleCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    circleCtx.strokeStyle = color_black;
    circleCtx.lineWidth = 4;
    circleCtx.closePath();
    circleCtx.stroke();
    console.log("draw circle! color:black");

    //ロッドナンバー取得
    const rodnumber = document.getElementById("rodnumber");
    let number = parseInt(rodnumber.value, 10);
    console.log("number = %d", number);

    dotInfos.length = 0; //配列リセット

    //ロッドの描画
    for (var i = 0; i < number; i++) {
        circleCtx.fillStyle = color_black;
        circleCtx.beginPath();
        circleCtx.arc(centerX + radius * Math.cos(2 * i * Math.PI / number), centerY + radius * Math.sin(2 * i * Math.PI / number), radius * 0.08, 0, 2 * Math.PI);
        circleCtx.fill();
    }

    //打点の描画-後で４をnumberに変更
    circleCtx.fillStyle = "black"; //選択された打点の色を変更
    for (var i = 0; i < 2 * 4; i++) {
        //打点描画用パラメータ
        const angle = i * Math.PI / 4;
        const dotX = centerX + radius * Math.cos(angle) * 0.8;
        const dotY = centerY + radius * Math.sin(angle) * 0.8;
        const dotRadius = radius * 0.05;

        circleCtx.beginPath();
        circleCtx.arc(dotX, dotY, dotRadius, 0, 2 * Math.PI);
        circleCtx.fill();

        //dotInfosに各パラメータを追加
        dotInfos.push({ x: dotX, y: dotY, radius: dotRadius, index: i });
    }

    
}

//保存用イベントリスナ
circleCanvas.addEventListener('mousedown', (event) => {
    const rect = circleCanvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    for (const dot of dotInfos) {
        //クリックした場所と打点の距離を計算
        const distance = Math.sqrt((clickX - dot.x) ** 2 + (clickY - dot.y) ** 2);
        if (distance < dot.radius) {
            selectedDotIndex = dot.index;
            circleCtx.fillStyle = "red";
            circleCtx.beginPath();
            circleCtx.arc(dot.x,dot.y,radius*0.07,0,2 * Math.PI);
            circleCtx.fill();
            console.log('打点 ' + selectedDotIndex + ' が選択されました');
            break;
        }
    }
});

//リセットボタンをタップした時の動作
resetButton.addEventListener("click", async () => {
    if (circles.length >= 0) {
        circleCtx.clearRect(0, 0, circleCanvas.width, circleCanvas.height);
        circles.length = 0;
        drawCircle();
        //console.log("circles is empty")
    }
});
drawCircle(); // 円とロッド、打点を描画