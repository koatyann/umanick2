// 初期化関数
init = async function () {
    // 初期化メッセージを表示　
    console.log("init");
    document.getElementById("message").innerText = "準備中です";
    // スタートボタンを非表示にし、結果の表示領域を表示
    document.getElementById("start-button").style.display="none";
    document.getElementById("wrap").style.display = "block";
    document.getElementById("button-conntena").innerHTML = `<button type="button" onclick="location.href='index_beef.html'" id="beef-button">牛肉用</button>
    <button type="button" onclick="location.href='index_pig.html'" id="pig-button">豚肉用</button>
    <button type="button" onclick="location.href='index_chicken.html'" id="chicken-button">鶏肉用</button>`;
    // モデルとメタデータのURLを設定
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // モデルをロード
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // ウェブカメラをセットアップ
    const flip = true; // 画像を反転させるかどうか
    webcam = new tmImage.Webcam(450, 300); // カメラのサイズを指定
    await webcam.setup({facingMode: "environment"}); // カメラをセットアップ
    await webcam.play(); // カメラを起動

    // ループ関数を呼び出し
    window.requestAnimationFrame(loop);

    // カメラのキャンバスを表示領域に追加
    document.getElementById("webcam-container").appendChild(webcam.canvas);

    // ラベルと結果の表示コンテナを取得
    labelContainer = document.getElementById("label-container");
    resultContainer = document.getElementById("result-container");

    // ラベル用のdiv要素を作成してラベルコンテナに追加
    for (let i = 0; i < maxPredictions; i++) { 
        labelContainer.appendChild(document.createElement("div"));
    }
}

// メインのループ関数
async function loop() {
    // ウェブカメラのフレームを更新
    webcam.update();
    // 予測を行い、予測が成功したら再度ループを呼び出す
    if (await predict()) {
        window.requestAnimationFrame(loop);
    }
}

// 予測を行う関数
async function predict() {
    try {
        // カメラのキャンバスを使用して予測を行う
        const prediction = await model.predict(webcam.canvas);
        let area = ["-","-"];
        let tmp_max = { probability: 0, className: "" };

        // 各クラスの予測結果を表示
        for (let i = 0; i < maxPredictions; i++) {
            let probability = prediction[i].probability.toFixed(2);
            let className = prediction[i].className;
            
            // 最も確率が高いクラスを取得
            if (tmp_max.probability < probability) {
                tmp_max = { probability: probability, className: className };
            }
            
            // ラベルコンテナに予測結果を表示
            const classPrediction = className + ": " + probability;
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }

        // 予測結果に基づいてエリアの状態を判断し、結果コンテナを更新
        const pred_result = (tmp_max.className==='焼肉');
        let insert_html = "<table>";
        insert_html += "<tr><td>焼き状況</td></tr>";
        insert_html += "<tr>"+ 
                        (pred_result ? "<td class='occupied'>焼肉</td>" : "<td class='vacant'>生肉</td>") +
                        "</tr>";
        insert_html += "</table>";
        resultContainer.innerHTML = insert_html;

        // 正常終了メッセージを表示
        document.getElementById("message").innerText = "正常に予測しています。終了するにはリロードかブラウザを閉じて下さい";
        return true;
    } catch (e) {
        // エラーが発生した場合はエラーメッセージを表示
        console.error(e);
        document.getElementById("message").innerHTML = "<pre>エラーが発生しました。再開するにはリロードしてください\n\n" + e;
        return false;
    }
}
