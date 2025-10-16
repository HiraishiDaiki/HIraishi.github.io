
const circleCanvas = document.getElementById("CircleCanvas");
const circleCtx = circleCanvas.getContext("2d");
const circles = [] //クリックで生成した円を管理する配列


//リセットボタン
const resetButton = document.getElementById("ResetButton");

let Mode = document.getElementById("mode-switch")


//各パラメータ設定
circleCanvas.width = circleCanvas.clientWidth;
circleCanvas.height = circleCanvas.clientHeight;

const rodnumber = document.getElementById("rodnumber");
let number = rodnumber.value;

const centerX = circleCanvas.width/2;
const centerY = circleCanvas.height/2;
const radius  = Math.min(circleCanvas.height,circleCanvas.width) / 2.5;
const clickradius  = Math.min(circleCanvas.height,circleCanvas.width) * 0.03;
const color_black = "rgb(0,0,0)";
const color_red = "rgb(255,0,0)"
// 選択されたマーカーのインデックスを保存する変数 (-1は誰も選択されていない状態)
let selectedMarkerIndex = -1;

// 値が保存されたマーカーのインデックスを2つまで保存する配列
let savedMarkerIndices = [];

// 計算結果を保存する変数
let calculationResult = 0;


//描画設定
function drawCircle(){
    circleCtx.clearRect(0,0,circleCanvas.width,circleCanvas.height);
    circleCtx.beginPath();
    circleCtx.arc(centerX,centerY,radius,0,2*Math.PI);
    circleCtx.strokeStyle = color_black;
    circleCtx.lineWidth = 4;
    circleCtx.closePath();
    circleCtx.stroke();
    // console.log("draw circle! color:black");
    // circleCtx.beginPath();
    // circleCtx.arc(centerX,centerY,radius*0.8,0,2*Math.PI);
    // circleCtx.strokeStyle = "rgb(64,64,64)"
    // circleCtx.clientWidth = 2;
    // circleCtx.closePath();
    // circleCtx.stroke();

    // console.log("number = %d", number);

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

    // うなり解消モードでの挙動
    if(Mode.checked){
        savedMarkerIndices.forEach(index =>{
            const marker = circles[index];
            if(marker && marker.savedValue !== null){
                const text = `${marker.savedValue.toFixed(2)}Hz`;

                circleCtx.font = "30px Arial";

                circleCtx.strokeStyle = "white";
                circleCtx.strokeText(text,marker.x + clickradius + 5, marker.y);
                
                circleCtx.fillStyle = "black";
                circleCtx.fillText(text,marker.x + clickradius + 5, marker.y);
            }
        });
    }
    

}
drawCircle();

// 円の中をタップした時の動作
circleCanvas.addEventListener("click", (event) => {
    if(Mode.checked){
        const rect = circleCanvas.getBoundingClientRect();
        const scaleX = circleCanvas.width / rect.width;
        const scaleY = circleCanvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // いったん選択をリセット
        selectedMarkerIndex = -1; 
        
        // クリックされたマーカーを探す
        for (let i = 0; i < circles.length; i++) {
            const clickdistance = Math.sqrt((x - circles[i].x)**2 + (y - circles[i].y)**2);
            if (clickdistance <= clickradius) {
                selectedMarkerIndex = i; // 見つけたらインデックスを保存
                break; // ループを抜ける
            }
        }

        if (selectedMarkerIndex !== -1){
            const isAlreadySaved = savedMarkerIndices.includes(selectedMarkerIndex);

            if(isAlreadySaved){
                // 保存を解除
                circles[selectedMarkerIndex].savedValue = null;
                savedMarkerIndices = savedMarkerIndices.filter(index => index !== selectedMarkerIndex);
            }else{
                // 新規保存
                if(savedMarkerIndices.length<2){
                    circles[selectedMarkerIndex].savedValue = vertexX;
                    savedMarkerIndices.push(selectedMarkerIndex);
                }
            }
            drawCircle(); // 再描画して選択状態と値を反映
            runAnalyze2();
        }

       
    }else{
        const rect = circleCanvas.getBoundingClientRect();
    
        // 表示サイズと描画領域のスケールを考慮した座標計算
        const scaleX = circleCanvas.width / rect.width;
        const scaleY = circleCanvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;

        // --- 既存マーカーの削除処理 (安全なループに修正) ---
        // ユーザーは新しいマーカーを置くつもりでも、既存のマーカーに近ければ削除を優先
        for (let i = circles.length - 1; i >= 0; i--) {
            const clickdistance = Math.sqrt((x - circles[i].x)**2 + (y - circles[i].y)**2);
            if (clickdistance <= clickradius) {
                console.log("marker removed");
                circles.splice(i, 1); // マーカーを配列から削除
                drawCircle(); // 再描画
                return; // 削除したら、新しいマーカーを追加せずに処理を終了
            }
        }

        // --- 新しいマーカーの追加処理 ---
        const distance = Math.sqrt((x - centerX)**2 + (y - centerY)**2);

        // 円の内側をクリックした場合のみ、新しいマーカーを追加する
        if (distance <= radius) {
            
            // 1. 中心からクリック地点への角度を計算
            const angle = Math.atan2(y - centerY, x - centerX);

            // 2. マーカーの設置位置を指定(円周の8割の場所)
            const newRadius = radius * 0.8;

            // 3. 角度と新しい半径から、マーカーを置くべき座標を計算
            const newX = centerX + newRadius * Math.cos(angle);
            const newY = centerY + newRadius * Math.sin(angle);

            // 4. 計算した座標にマーカーを追加
            circles.push({ x: newX, y: newY, savedValue: null });
            
            // 再描画
            drawCircle(); 
        }

        // 4つ置かれたら解析を実行
        if (circles.length === 4) {
            runAnalyze();
        }
    }
    
});

function runAnalyze(){
    //=====================================================
    //重心への角度
    //=====================================================
    const vectorCOG =  culicrateAngle(circles);
    const rodnumber = document.getElementById("rodnumber");
    let number = rodnumber.value;
    
    //重心への線を赤で描画
    circleCtx.beginPath();
    circleCtx.strokeStyle = "red";
    circleCtx.moveTo(centerX,centerY);
    circleCtx.lineTo(vectorCOG.x,vectorCOG.y);
    circleCtx.closePath();
    circleCtx.stroke();
    

    circleCtx.beginPath();
    circleCtx.fillStyle = "red";
    circleCtx.arc(vectorCOG.x,vectorCOG.y,radius*0.05,0,2*Math.PI);
    circleCtx.fill();

    COGdistance =Math.sqrt((vectorCOG.x - centerX)**2 + (vectorCOG.y - centerY)**2);
    console.log("COG distance is %d",COGdistance);


    if(COGdistance > 5){

        // 角度の差が最小のインデックスを計算する。
        console.log("angle is %d",vectorCOG.angle);
        minIndex  = DifferenceAngle(vectorCOG);

        // 最小インデックスをもとにして矢印を描画
        drawCircularArrow(circleCtx,
                        centerX + radius*Math.cos(2*minIndex*Math.PI/number),
                        centerY + radius*Math.sin(2*minIndex*Math.PI/number),
                        radius*0.20,"#ff0000",6,true,-Math.PI / 12);

        drawCircularArrow(circleCtx,
                        centerX + radius*Math.cos(2*(minIndex + (number/2))*Math.PI/number),
                        centerY + radius*Math.sin(2*(minIndex + (number/2))*Math.PI/number),
                        radius*0.20,"#0000ff",6,false,Math.PI / 12);
    }
}

//=========================================================
//点の数を決めて、重心が中央からどれくらいの角度でずれているか計算する
//=========================================================
// 重心ベクトルの計算
function culicrateAngle(points){
    // 1.重心を計算する
    if(points.length < 2) return null;
    const n = points.length;
    let sumx = 0,sumy = 0,avex = 0,avey = 0;

    for(let i =0; i < points.length; i++) {
        sumx += points[i].x;
        sumy += points[i].y;
    };

    avex = sumx / n;
    avey = sumy / n;

    // 2. 中心から重心までのベクトルを計算する。
    const vecx = avex - centerX, vecy = avey - centerY;
    

    // 3. ベクトルから角度を計算する
    let angleDeg = Math.atan2(vecy,vecx) * 180 / Math.PI;
    if(angleDeg < 0){
        angleDeg += 360;
    }
    console.log("COG's angle is %d degree",angleDeg);

    // 4. 重心の位置と角度を返す
    const vec = {x:vecx + centerX,y:vecy + centerY, angle:angleDeg};
    return vec

}

// 各ロッドとの角度の差を計算する
function DifferenceAngle(vector){
    
    let minIndex = -1, minAng = 400;
    for(let i = 0; i < number; i++){
        difference = Math.abs(i * (360 / number) - vector.angle);
        if(difference > 180){
            difference = 360 - difference
        }
        if(difference < minAng){
            minAng = difference;
            minIndex = i;
        }
        console.log("difference vector with number %d is %d",i,difference);
    }

    console.log("minIndex is %d, minAng is %d",minIndex,minAng);
    return minIndex
}

function DifferenceAngle2(vector){
    let minIndex = -1, minAng = 400;
    for(let i = 0; i < number *2; i++){
        difference = Math.abs(i * (360 / (number * 2)) - vector.angle);
        if(difference < minAng){
            minAng = difference;
            minIndex = i;
        }
    }
    console.log("lminIndex is %d, minAng is %d",minIndex,minAng);
    return minIndex;
}


// 矢印を表示する関数
function drawCircularArrow(ctx, x, y, radius, color, lineWidth, clockwise = true, headRotation = 0) {
            // --- パラメータ設定 ---
            const headLength = 20;
            const headAngle = Math.PI / 6;

            // --- 描画方向に応じた角度設定 ---
            const gapStartAngle = 1.9 * Math.PI;
            const gapEndAngle = 0.2 * Math.PI;

            let startAngle, endAngle;

            if (clockwise) {
                startAngle = gapEndAngle;
                endAngle = gapStartAngle;
            } else {
                startAngle = gapStartAngle;
                endAngle = gapEndAngle;
            }

            // --- スタイル設定 ---
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // --- 矢印の頭の座標を計算 ---
            const arrowTipX = x + radius * Math.cos(endAngle);
            const arrowTipY = y + radius * Math.sin(endAngle);
            // 接線の角度に headRotation を加えて、頭の向きを調整する
            const tangentAngle = endAngle + (clockwise ? Math.PI / 2 : -Math.PI / 2) + headRotation;
            const angle1 = tangentAngle - Math.PI + headAngle;
            const angle2 = tangentAngle - Math.PI - headAngle;
            const arrowBaseX1 = arrowTipX + headLength * Math.cos(angle1);
            const arrowBaseY1 = arrowTipY + headLength * Math.sin(angle1);
            const arrowBaseX2 = arrowTipX + headLength * Math.cos(angle2);
            const arrowBaseY2 = arrowTipY + headLength * Math.sin(angle2);

            // --- 矢印全体の描画（単一パス） ---
            ctx.beginPath();
            // 1. 円弧（本体）を描画
            ctx.arc(x, y, radius, startAngle, endAngle, !clockwise);
            
            // 2. 矢印の頭の片側を円弧の終点から描画
            ctx.lineTo(arrowBaseX1, arrowBaseY1);
            
            // 3. ペンを円弧の終点（矢印の先端）に戻す
            ctx.moveTo(arrowTipX, arrowTipY);
            
            // 4. 矢印の頭のもう片側を描画
            ctx.lineTo(arrowBaseX2, arrowBaseY2);
            
            // 5. パス全体を一度に描画
            ctx.stroke();

            console.log("arrow is painted")
}

// うなりの解消を提示する関数
function runAnalyze2(){
    // 値が保存されたマーカーが2つなければ結果を0にして終了
    if (savedMarkerIndices.length < 2){
        calculationResult = 0;
        return;
    }

    // 2つのマーカーとその値を取得
    const marker1 = circles[savedMarkerIndices[0]];
    const marker2 = circles[savedMarkerIndices[1]];
    const value1 = marker1.savedValue;
    const value2 = marker2.savedValue;

    // ２つの周波数の差を計算
    const diff = value1 - value2;
    const threshold = 0.5
    let markervec ={x:0,y:0,angle:0};
    if(diff < -1 * threshold){
        // marker1.value < marker2.value
        const markerX = marker1.x - centerX , markerY = marker1.y - centerY;
        let angleDeg = Math.atan2(markerY,markerX) * 180 / Math.PI;
        if(angleDeg < 0){
            angleDeg += 360;
        }
        markervec = {x: markerX, y: markerY, angle:angleDeg};
        
    }else if(diff > threshold){
        // marker1.value > marker2.value
        const markerX = marker2.x - centerX , markerY = marker2.y - centerY;
        let angleDeg = Math.atan2(markerY,markerX) * 180 / Math.PI;
        if(angleDeg < 0){
            angleDeg += 360;
        }
        markervec = {x: markerX, y: markerY, angle:angleDeg};
        
    }else if(diff >= -1 * threshold && diff <= threshold){
        console.log("beating is completed")
    }

    // 周波数が低いほうのマーカーがどこに近いか計算
    let closeIndex = DifferenceAngle2(markervec);
    console.log("number is %d",number)
    if(closeIndex % 2 == 0){
        // 偶数（ロッド自身に近いとき）
        console.log("close index is even number")
        drawCircularArrow(circleCtx,
                        centerX + radius*Math.cos(2*closeIndex*Math.PI/(number*2)),
                        centerY + radius*Math.sin(2*closeIndex*Math.PI/(number*2)),
                        radius*0.20,"#ff0000",6,true,-Math.PI / 12);
        drawCircularArrow(circleCtx,
                        centerX + radius*Math.cos(2*closeIndex*Math.PI/(number*2) + Math.PI ),
                        centerY + radius*Math.sin(2*closeIndex*Math.PI/(number*2) + Math.PI ),
                        radius*0.20,"#ff0000",6,true,-Math.PI / 12);
    }else{
        // 奇数(ロッド同士の間に近いとき)
        console.log("close index is odd number")
        drawCircularArrow(circleCtx,
                        centerX + radius*Math.cos(2*(closeIndex + 3)*Math.PI/(number*2)),
                        centerY + radius*Math.sin(2*(closeIndex + 3)*Math.PI/(number*2)),
                        radius*0.20,"#0000ff",6,false,Math.PI / 12);
        drawCircularArrow(circleCtx,
                        centerX + radius*Math.cos(2*((closeIndex + 3)*Math.PI/(number*2)) + Math.PI ),
                        centerY + radius*Math.sin(2*((closeIndex + 3)*Math.PI/(number*2)) + Math.PI ),
                        radius*0.20,"#0000ff",6,false,Math.PI / 12);
    }


    calculationResult = diff;
   

}

// リセットボタンをタップした時の動作
resetButton.addEventListener("click",async() =>{
    if(circles.length >= 0){
        circleCtx.clearRect(0,0,circleCanvas.width,circleCanvas.height);
        circles.length = 0;
        drawCircle();
        // 選択されたマーカーのインデックスを保存する変数 (-1は誰も選択されていない状態)
        selectedMarkerIndex = -1;

        // 値が保存されたマーカーのインデックスを2つまで保存する配列
        savedMarkerIndices = [];

        // 計算結果を保存する変数
        calculationResult = 0;
    }
})

