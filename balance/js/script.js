// script.js

let audioContext;
let analyser;
let dataArray;
let bufferLength;
let stream;
let source;
let animationId;

let isRecording = false;//録音をしているかどうかの変数
let trace = document.getElementById("switch"); //軌跡のON,OFFを切り替える
let Rec = document.getElementById("switch2");//撮影モードと切り替える
let save = document.getElementById("switch3");//減衰曲線を打点に保存するかどうか

const division = 1000;
let Time = 0;
const line = []; //古い線のパス座標を保存する
let vertexX = 0;

document.getElementById('StartButton').addEventListener('click', async () => {
    const toggleButton = document.getElementById('StartButton');

    let startTime = Date.now();

    if (!isRecording) {
        // 録音を開始
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 4096 * 4; //FFTサイズ
        analyser.smoothingTimeConstant = 0; //スムージングの強さ
        bufferLength = analyser.frequencyBinCount;//周波数データのバッファサイズ
        dataArray = new Uint8Array(bufferLength);
        
        
        stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                autoGainControl: false,
                noiseSuppression: false,
                echoCancellation: false,
            }
        });
        source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        //波形表示
        const volumeCanvas = document.getElementById('volumeCanvas');
        const volumeCtx = volumeCanvas.getContext('2d');
        volumeCanvas.width = volumeCanvas.clientWidth;
        volumeCanvas.height = volumeCanvas.clientHeight;

        //スペクトル表示
        const frequencyCanvas = document.getElementById('frequencyCanvas');
        const frequencyCtx = frequencyCanvas.getContext('2d');
        frequencyCanvas.width = frequencyCanvas.clientWidth;
        frequencyCanvas.height = frequencyCanvas.clientHeight;

        //減衰曲線(現在の)
        const amplitudeCanvas = document.getElementById('amplitudeCanvas');
        const amplitudeCtx = amplitudeCanvas.getContext('2d',{ willReadFrequently: true });
        amplitudeCanvas.width = amplitudeCanvas.clientWidth;
        amplitudeCanvas.height = amplitudeCanvas.clientHeight;

        //パラメータ設定部分
        const sampleRate = audioContext.sampleRate;//サンプリングレート(変更不可？) 48000
        const maxDisplayFrequency = 1000; //表示する最大周波数
        const nyquistFrequency = sampleRate / 2; // ナイキスト周波数 (最大周波数)
        const resetTime = 5; //減衰曲線の表示をリセットする時間

        function draw() {
            animationId = requestAnimationFrame(draw);

            analyser.getByteTimeDomainData(dataArray);//波形データ
            volumeCtx.clearRect(0, 0, volumeCanvas.width, volumeCanvas.height);
            volumeCtx.lineWidth = 1;
            volumeCtx.strokeStyle = 'black';
            volumeCtx.beginPath();

            const sliceWidth = volumeCanvas.width / bufferLength;
            let x = 0;
            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * volumeCanvas.height) / 2;
                if (i === 0) {
                    volumeCtx.moveTo(x, y);
                } else {
                    volumeCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }
            volumeCtx.lineTo(volumeCanvas.width, volumeCanvas.height / 2);
            volumeCtx.stroke();
            

            analyser.getByteFrequencyData(dataArray);//周波数データ
            frequencyCtx.clearRect(0, 0, frequencyCanvas.width, frequencyCanvas.height);
            const barWidth = (frequencyCanvas.width / maxDisplayFrequency) * (nyquistFrequency / bufferLength); // グラフの幅を調整
            let barHeight;
            let barX = barWidth;
            
            //最大周波数を探す
                maxval = 0;
                maxfrequency = 0; //最大値を持つ周波数
                maxFreqFirst = 0; //最小周波数のピーク
                firstindex = 0; //ピークのインデックス
            

            
            for (let i = 0; i < bufferLength; i++) {

                barHeight = dataArray[i];//iのグラフの高さ
                const frequency = i * sampleRate / analyser.fftSize;//i番目の周波数

                //指定した周波数より上は処理しない
                if(frequency > maxDisplayFrequency){
                    break;
                }

                //グラフの描画
                frequencyCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
                frequencyCtx.fillRect(barX, frequencyCanvas.height - barHeight / 2, barWidth, barHeight / 2);
                barX +=  barWidth;

                //最高値の更新
                //このままだと(1,2)modeとかのほうが残りやすく判別しにくい
                if(barHeight >= maxval){
                    maxval = barHeight;
                    maxfrequency = frequency;
                }
            }

            //最小の周波数ピークを探す
            for(j = 1; j < dataArray.length - 1; j++){
                if(dataArray[j] > dataArray[j - 1] && dataArray[j] > dataArray[j + 1] && dataArray[j] >= 255 * 0.6){
                    maxFreqFirst = j * sampleRate / analyser.fftSize;
                    firstindex = j;
                    mode = true;
                    break;//最初のピークを見つけたら終了
                }
            }

            //console.log("maxFreqFirst is " + maxFreqFirst);

            //最小の周波数ピークを探す。(二次関数)
            //1.最高値の(x,y)座標,その両隣の座標を使って二次関数を推定する。
                // 最高値の座標
                x1 = firstindex * sampleRate / analyser.fftSize;
                y1 = dataArray[firstindex]; 

                // 左隣の座標
                x2 = (firstindex - 1) * sampleRate / analyser.fftSize;
                y2 = dataArray[firstindex - 1];

                // 右隣の座標
                x3 = (firstindex + 1) * sampleRate / analyser.fftSize;
                y3 = dataArray[firstindex + 1];

            //2.頂点を求める
                let denominator = (x1 - x2) * (x1 - x3) * (x2 - x3);

                let a = (y1 * (x2 - x3) + y2 * (x3 - x1) + y3 * (x1 - x2)) / denominator;
                let b = (y1 * (x3**2 - x2**2) + y2 * (x1**2 - x3**2) + y3 * (x2**2 - x1**2)) / denominator;
                let c = (y1 * (x2 * x3 * (x3 - x2)) + y2 * (x3 * x1 * (x1 - x3)) + y3 * (x1 * x2 * (x2 - x1))) / denominator;

            // 頂点の x 座標は -b / (2a), y 座標はその x を二次関数に代入
                vertexX = -b / (2 * a);
                let vertexY = a * vertexX**2 + b * vertexX + c;

            //3.デバッグ用
                //console.log("samplelate is " + sampleRate);
                //console.log("(1,1)mode's peak is (" + vertexX + "," + vertexY + ")");

                //console.log("x1:", x1, "y1:", y1);
                //console.log("x2:", x2, "y2:", y2);
                //console.log("x3:", x3, "y3:", y3);

            frequencyCtx.fillStyle = "rgb(51 51 51)";
            frequencyCtx.font = "20px sanserif";
            //frequencyCtx.fillText("Max: " + maxfrequency.toFixed(2) + " Hz", 20, 20);
            frequencyCtx.fillText("(1,1)mode:" + vertexX.toFixed(2) + "Hz",20,20);
            //frequencyCtx.fillText("Max index:" + maxIndex, 200, 20);
            //デバッグ
            //console.log("dataarray: %d", dataArray[maxIndex]);
            //console.log("1st max frequency: %d" ,maxFreqFirst);
            
            //減衰曲線
            let Time = (Date.now()- startTime) / 1000;
            let xPos = (Time % resetTime) / resetTime * amplitudeCanvas.width;

            const textbox =document.getElementById("textbox");
            const frequencyTarget = textbox.value;
            let targetIndex = Math.floor(frequencyTarget*analyser.fftSize/sampleRate);
            
            // 右端に到達したらリセット
            if (xPos >= amplitudeCanvas.width * 0.99) {
                if(Rec.checked){
                    // 録音を停止
                    //枠線を描画
                    amplitudeCtx.strokeStyle = "black";
                    amplitudeCtx.lineWidth = 5;
                    amplitudeCtx.strokeRect(0, 0, amplitudeCanvas.width, amplitudeCanvas.height);
                    cancelAnimationFrame(animationId);
                    stream.getTracks().forEach(track => track.stop());
                    audioContext.close();

                    toggleButton.textContent = "Start";
                    isRecording = false;
                    isBeating = false;
                }else{
                    startTime = Date.now();
                    amplitudeCtx.clearRect(0, 0, amplitudeCanvas.width, amplitudeCanvas.height);
                    amplitudeCtx.beginPath(); // リセット時に新しいパスを開始
                    amplitudeCtx.moveTo(0, amplitudeCanvas.height - dataArray[targetIndex] / 255 * amplitudeCanvas.height);
                    xPos = 0;
                    Sound = false;
                    minypos = 255;
                    console.log("reset!");
                }                
            }

            //一つ前のラインを描画
            if(trace.checked){
                if (xPos == 0){
                    for(let i = 0; i < line.length; i++){
                        amplitudeCtx.lineTo(line[i][0], line[i][1]);
                    }
                    amplitudeCtx.strokeStyle = "rgb(51 51 51 / 50%)";
                    amplitudeCtx.lineWidth = 0.5;
                    amplitudeCtx.stroke();
                    line.length = 0;
                    amplitudeCtx.beginPath();
                    console.log("trace");
                }
            }else{
                if(xPos==0){
                    line.length = 0;
                }
                
            }
            
            // ラインの描画
            let yPosi = dataArray[targetIndex] / 255 * amplitudeCanvas.height; //数値
            let yPos = amplitudeCanvas.height - yPosi; //座標

            //Posの値を配列に保存
            Position = [xPos,yPos];
            line.push(Position);

            //最新のラインを描画
            amplitudeCtx.lineTo(xPos, yPos);
            amplitudeCtx.strokeStyle = "black";
            amplitudeCtx.lineWidth = 2.0;
            amplitudeCtx.stroke();            
        }

        draw();
        toggleButton.textContent = "Stop";
        isRecording = true;
        
    } else {
        // 録音を停止
        cancelAnimationFrame(animationId);
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();

        toggleButton.textContent = "Start";
        isRecording = false;
        isBeating = false;
    }
});

//スクリーンショット用の処理
document.querySelectorAll('.saveBtn').forEach(button =>{
    button.addEventListener("click",function(){
        const canvasId = this.getAttribute("data-canvas-id");
        const canvas = document.getElementById(canvasId);
        console.log("saveBtn is clicked")

        html2canvas(canvas).then(function (screenshotCanvas){
            const link = document.createElement("a");
            link.href = screenshotCanvas.toDataURL("image/png");

            //日時を取得してフォーマット
            const now = new Date();
            const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}-${now.getMinutes().toString().padStart(2, '0')}-${now.getSeconds().toString().padStart(2, '0')}`;

            //　canvasIDを取得してファイル名に使用
            const canvasId = canvas.id || "canvas"; // canvas に ID が設定されていない場合は "canvas" を使用
            link.download = `${canvasId}_${timestamp}.png`;
            link.click();;
        });
    });
});
