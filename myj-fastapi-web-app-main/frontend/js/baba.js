let players = [];
let currentPlayer = 0;
let gameDeck = [];
//人数選択が変更されたら入力欄を更新
document.addEventListener("DOMContentLoaded", (event) => {
    const playerCountSelect = document.getElementById("playerCount");
    // 初期表示
    updateNameInputs(parseInt(playerCountSelect.value));
    // 選択変更時のイベントリスナー
    playerCountSelect.addEventListener("change", (e) => {
        updateNameInputs(parseInt(e.target.value));
    });
});

//人数に応じて名前入力欄を生成
function updateNameInputs(count) {
    const container = document.getElementById("nameInputs");
    container.innerHTML = "<h4>プレイヤー名を入力してください：</h4>";
    for (let i = 0; i < count; i++) {
        container.innerHTML += `
                <label for="player${i + 1}">P${i + 1}：</label>
                <input type="text" id="player${i + 1}" value="プレイヤー${i + 1
            }" style="margin: 5px;"><br>
            `;
    }
}
// 手札作成
function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const ranks = [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
    ];
    let deck = [];
    for (let s of suits) for (let r of ranks) deck.push(r + s);
    deck.push("JOKER💀");
    return deck;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startGame() {
    const count = parseInt(document.getElementById("playerCount").value);

    players = Array.from(
        {
            length: count,
        },
        (_, i) => {
            const nameInput = document.getElementById(`player${i + 1}`).value.trim();// 名前が空の場合は「プレイヤーX」をデフォルトとして使用
            const playerName = nameInput === "" ? `プレイヤー${i + 1}` : nameInput;
            return {
                name: playerName + "さん",
                cards: [],
            };
        }
    );

    gameDeck = shuffle(createDeck());

    let i = 0;
    while (gameDeck.length > 0) {
        players[i % count].cards.push(gameDeck.pop());
        i++;
    }

    for (let p of players) {
        removePairs(p);
        p.cards = shuffle(p.cards); //手札をランダムに
    }

    document.getElementById("setup").style.display = "none";
    document.getElementById("game").style.display = "none";
    updateStatus();
    showStartPlayerButton();
}
//プレイヤー1のカード表示ボタン
function showStartPlayerButton() {
    const status = document.getElementById("status");
    const buttonDiv = document.createElement("div");
    buttonDiv.id = "startPlayerButtonArea";
    buttonDiv.innerHTML = `
    <button onclick="startFirstTurn()"> 1人目のカードを表示する</button>`;
    status.appendChild(buttonDiv);
}

function startFirstTurn() {
    const btn = document.getElementById("startPlayerButtonArea");
    if (btn) btn.remove();
    document.getElementById("game").style.display = "block";
    showPlayer();
}

// ペア削除
function removePairs(player) {
    let newCards = [];
    let seen = {};
    for (let c of player.cards) {
        let rank = c.replace(/[^A-Z0-9]/g, "");
        if (rank === "JOKER") {
            newCards.push(c);
            continue;
        }
        if (seen[rank]) {
            delete seen[rank];
        } else {
            seen[rank] = c;
        }
    }
    newCards.push(...Object.values(seen));
    player.cards = newCards;
}

// 状況表示
function updateStatus() {
    const div = document.getElementById("status");
    div.innerHTML = "<h3>残りカード枚数</h3>";
    players.forEach((p) => {
        div.innerHTML += `${p.name}: ${p.cards.length}枚<br>`;
    });
}

//自分の手札表示
function showPlayer() {
    const p = players[currentPlayer];
    document.getElementById("playerName").textContent = `${p.name} の手札`;
    const area = document.getElementById("cards");
    area.innerHTML = "";
    for (let c of p.cards) {
        const div = document.createElement("div");
        div.className = "card";
        div.textContent = c;
        area.appendChild(div);
    }
}

//相手のカードを裏返して表示
function startDrawPhase() {
    const nextButton = document.querySelector("#game button");
    if (nextButton) nextButton.style.display = "none";
    //document.getElementById("game").style.display = "none";
    const nextIndex = findNextActivePlayer();
    if (nextIndex === null) return;

    const opponent = players[nextIndex];
    document.getElementById("drawPhase").style.display = "block";
    document.getElementById(
        "drawText"
    ).textContent = `${players[currentPlayer].name} → ${opponent.name} のカードを引いてください`;

    const area = document.getElementById("opponentCards");
    area.innerHTML = "";
    opponent.cards.forEach((_, i) => {
        const div = document.createElement("div");
        div.className = "back";
        div.textContent = "🂠";
        div.onclick = () => drawCard(nextIndex, i);
        area.appendChild(div);
    });
}

//次にカードがある人を探す
function findNextActivePlayer() {
    for (let i = 1; i < players.length; i++) {
        const idx = (currentPlayer + i) % players.length;
        if (players[idx].cards.length > 0) return idx;
    }
    return null;
}

// カードを引く
function drawCard(targetIndex, cardIndex) {
    const target = players[targetIndex];
    const card = target.cards.splice(cardIndex, 1)[0];
    const me = players[currentPlayer];
    me.cards.push(card);
    document.getElementById("drawPhase").style.display = "none";

    // 結果表示
    document.getElementById("resultPhase").style.display = "block";
    document.getElementById(
        "resultText"
    ).textContent = `${me.name} が ${target.name} からカードを引きました！`;
    const area = document.getElementById("resultCards");
    area.innerHTML = `<div class="card">${card}</div>`;

    // ペア確認
    const rank = card.replace(/[^A-Z0-9]/g, "");
    if (
        rank !== "JOKER" &&
        me.cards.filter((c) => c.replace(/[^A-Z0-9]/g, "") === rank).length === 2
    ) {
        me.cards = me.cards.filter((c) => c.replace(/[^A-Z0-9]/g, "") !== rank);
        area.innerHTML += "<p>✨ カードが揃ったので削除 ✨</p>";
    }

    removePairs(target);
    me.cards = shuffle(me.cards); //自分の手札をシャッフル
    target.cards = shuffle(target.cards); //相手の手札もシャッフル
    updateStatus();
    if (me.cards.length === 0) { // カードを引いたあとに勝ち抜けチェック
        window.alert(`おめでとうございます！${me.name} 、勝ち抜け！`);
    }
    if (target.cards.length === 0) {
        window.alert(`おめでとうございます！${target.name} 、勝ち抜け！`);
    }
    checkGameEnd();

}

//次の人に渡す　の確認画面
function goToCheck() {
    document.getElementById("checkPhase").style.display = "block"; //表示
    document.getElementById("resultPhase").style.display = "none"; //非表示
    document.getElementById("game").style.display = "none";
    document.getElementById("drawButton").style.display = "none";
}

//  次の人のターンへ
function finishTurn() {
    document.getElementById("checkPhase").style.display = "none";
    currentPlayer = findNextActivePlayer(); //次のプレイヤーを探す
    if (currentPlayer === null) return;
    document.getElementById("game").style.display = "block";
    showPlayer();
    document.getElementById("drawButton").style.display = "inline-block";
}

// 勝敗判定
function checkGameEnd() {
    const remaining = players.filter((p) => p.cards.length > 0);
    if (remaining.length === 1 && remaining[0].cards.includes("JOKER💀")) {
        updateStatus();
        alert(
            `💀 ${remaining[0].name} がババを持っています！${remaining[0].name}の負けです！`
        );
        location.reload();
    }
}
