var startButton = document.getElementById("RecStart");
var stopButton = document.getElementById("RecStop");
var mediaRecorder;
var audioChunks = [];

startButton.onclick = function() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = function(event) {
                audioChunks.push(event.data);
            };
            mediaRecorder.start();
            console.log("Recording started");
        }).catch(function(err) {
            console.log("Error: " + err);
        });
};

stopButton.onclick = function() {
    mediaRecorder.stop();
    console.log("Recording stopped");
    mediaRecorder.onstop = function() {
        // Blobデータを生成
        var audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

        // WebMをWAVに変換
        convertToWAV(audioBlob).then(function(wavBlob) {
            var wavURL = URL.createObjectURL(wavBlob);

            // ダウンロードリンクを生成してクリック
            var link = document.createElement("a");
            link.href = wavURL;
            link.download = "recording.wav";
            link.click();
        });

        // 録音データをリセット
        audioChunks = [];
    };
};

// WebMをWAVに変換する関数
function convertToWAV(blob) {
    return new Promise((resolve) => {
        var reader = new FileReader();
        reader.onload = function(event) {
            var audioBuffer;
            var audioContext = new (window.AudioContext || window.webkitAudioContext)();
            audioContext.decodeAudioData(event.target.result, function(buffer) {
                audioBuffer = buffer;

                // WAV形式に変換
                var wavBuffer = encodeWAV(audioBuffer);
                resolve(new Blob([wavBuffer], { type: 'audio/wav' }));
            });
        };
        reader.readAsArrayBuffer(blob);
    });
}

// WAVエンコーダー
function encodeWAV(audioBuffer) {
    var numberOfChannels = audioBuffer.numberOfChannels;
    var sampleRate = audioBuffer.sampleRate;
    var length = audioBuffer.length * numberOfChannels * 2 + 44;
    var buffer = new ArrayBuffer(length);
    var view = new DataView(buffer);

    // WAVヘッダー作成
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + audioBuffer.length * numberOfChannels * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, audioBuffer.length * numberOfChannels * 2, true);

    // PCMデータを書き込み
    var offset = 44;
    for (var i = 0; i < audioBuffer.length; i++) {
        for (var channel = 0; channel < numberOfChannels; channel++) {
            var sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    return buffer;
}

// ヘルパー関数
function writeString(view, offset, string) {
    for (var i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
