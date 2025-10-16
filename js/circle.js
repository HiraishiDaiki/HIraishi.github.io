
const circleCanvas = document.getElementById("CircleCanvas");
const circleCtx = circleCanvas.getContext("2d");
const circles = [] //クリックで生成した円を管理する配列


//リセットボタン
const resetButton = document.getElementById("ResetButton");


//各パラメータ設定
circleCanvas.width = circleCanvas.clientWidth;
circleCanvas.height = circleCanvas.clientHeight;

const centerX = circleCanvas.width/2;
const centerY = circleCanvas.height/2;
const radius  = Math.min(circleCanvas.height,circleCanvas.width) / 2.5;
const clickradius  = Math.min(circleCanvas.height,circleCanvas.width) * 0.03;
const color_black = "rgb(3,3,3)";
const color_red = "rgb(255,0,0)"

//描画設定
function drawCircle(){
    circleCtx.clearRect(0,0,circleCanvas.width,circleCanvas.height);
    circleCtx.beginPath();
    circleCtx.arc(centerX,centerY,radius,0,2*Math.PI);
    circleCtx.strokeStyle = color_black;
    circleCtx.lineWidth = 4;
    circleCtx.closePath();
    circleCtx.stroke();
    console.log("draw circle! color:black");

    //ロッドナンバー取得
    const rodnumber = document.getElementById("rodnumber");
    let number = rodnumber.value;
    console.log("number = %d", number);

    //ロッドの描画
    for( var i = 0; i < number; i++){
        circleCtx.fillStyle = color_black;
        circleCtx.beginPath();
        circleCtx.arc(centerX + radius*Math.cos(2*i*Math.PI/number), centerY + radius*Math.sin(2*i*Math.PI/number),radius*0.08,0,2*Math.PI);
        circleCtx.fill();
    }



    //circles内の円を描写
    circleCtx.fillStyle = "blue";
    for(var i = 0; i < circles.length; i++){
        const circle = circles[i];
        circleCtx.beginPath();
        circleCtx.arc(circle.x, circle.y, clickradius,0, 2*Math.PI);
        circleCtx.fill();
    }
    

}
drawCircle(); //円とロッドを描画

//円の中をタップした時の動作
circleCanvas.addEventListener("click",(event) => {
    const rect = circleCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    //console.log("your click is: %d & %d",x,y);

    circles.push({x: x, y: y});

    const distance = Math.sqrt((x - centerX)**2 + (y - centerY)**2);
    
    //円の中心からの距離が半径以内であれば点をプロットする
    if(distance <= radius){
        circleCtx.fillStyle = "blue";
        circleCtx.beginPath();
        circleCtx.arc(x,y,clickradius,0,2 * Math.PI);
        circleCtx.fill();
    }

    //タップした場所がすでに存在する円の内部であったらその円を消去する
    for(var i = 0; i < circles.length - 1; i++){
       const clickdistance = Math.sqrt((x - circles[i].x)**2+(y - circles[i].y)**2 );
       //タップ位置が円の内側かどうか判断する。
       if(clickdistance <= clickradius){
            console.log("your click is inside clickcircle");
            circles.splice(i,1);
            circles.pop();
            drawCircle();
       }
    }
});

//リセットボタンをタップした時の動作
resetButton.addEventListener("click",async() =>{
    if(circles.length >= 0){
        circleCtx.clearRect(0,0,circleCanvas.width,circleCanvas.height);
        circles.length = 0;
        drawCircle();
        console.log("circles is empty")
    }
})

