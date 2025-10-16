const saveDecayToDotButton = document.getElementById("saveBtn");
const ampCanvas = document.getElementById("amplitudeCanvas");
const number2Pre = document.getElementById("rodnumber");


//減衰曲線描画用パラメータ
const subCanvasSize = circleCanvas.width * 0.015;
const subCanvasHeight = 9 * subCanvasSize;
const subCanvasWidth  = 16 * subCanvasSize;
const amplitudeCanvas = document.getElementById('amplitudeCanvas');



if (saveDecayToDotButton) {
    saveDecayToDotButton.addEventListener('click', () => {
        if (selectedDotIndex !== -1) {
            let number2 = parseInt(number2Pre.value,10);
            const dotInfo = dotInfos[selectedDotIndex];//選択された打点のインデックスを取得
            const ind = dotInfo.index;
            const angle2 = ind * Math.PI / 4;

            let decayX = centerX + radius * Math.cos(angle2) * 1.1;
            let decayY = centerY + radius * Math.sin(angle2) * 1.1;

            //ここから取得したIndex番号による場合分け
            if(ind == 0){
                //右
                decayX += 0;
                decayY -= subCanvasHeight / 2;
            }else if(ind == 1 || ind ==100  ){
                //右下
                decayX += 0;
                decayY += 0;
            }else if(ind == 2){
                //真下
                decayX -= subCanvasWidth / 2;
                decayY += 0;
            }else if(ind == 3 || ind ==100){
                //左下
                decayX -= subCanvasWidth;
                decayY += 0;
            }else if(ind == 4){
                //左
                decayX -= subCanvasWidth;
                decayY -= subCanvasHeight / 2;
            }else if(ind == 5 || ind ==8){
                //左上
                decayX -= subCanvasWidth; 
                decayY -= subCanvasHeight;
            }else if(ind == 6){
                //真上
                decayX -= subCanvasWidth / 2;
                decayY -= subCanvasHeight;
            }else if(ind == 7 || ind == 11){
                decayX += 0;
                decayY -= subCanvasHeight;
            }
            
           
            //選択されたあたりに長方形を描画
            circleCtx.fillStyle = "black";
            circleCtx.lineWidth = 2;
            circleCtx.beginPath();
            circleCtx.rect(decayX,decayY,subCanvasWidth,subCanvasHeight);
            circleCtx.stroke();
           
            //amplitudeCanvasの内容を長方形内に描画
            circleCtx.drawImage(amplitudeCanvas, 0, 0, amplitudeCanvas.width, amplitudeCanvas.height, decayX, decayY, subCanvasWidth, subCanvasHeight);
        
            selectedDotIndex = -1; // 選択状態をリセット

            //デバッグ用
            // console.log("angle2:"+ angle2);
            // console.log("decayX:"+ decayX);
            // console.log("decayY:"+ decayY);
            // console.log(`減衰曲線を打点 ${selectedDotIndex} の近くに保存しました`);
            
            //drawCircle(); // 再描画して選択状態を解除

            
        } else {
            alert('打点が選択されていません。');
        }
    });
}