//[//]でコメントができる
//ウェブから値を持ってくる
const form=document.getElementById("form");
const input=document.getElementById("input");
const ul=document.getElementById("ul");

const todos=JSON.parse(localStorage.getItem("todos")); //ローカルストレージからデータを取得

//constは定数の定義（変更できない）var,letは変数の定義（再代入可能）
if (todos) {
    todos.forEach(todo=> {
            add(todo);
        }

    );
}

form.addEventListener("submit", function(event) {
        //エンターが押されたとき
        event.preventDefault(); //ページのリロードを防ぐ
        add();
    }

);

function add(todo) {
    let todoText=input.value;

    if (todo) {
        //if(aaa)でaaaがtrueのときって意味
        todoText=todo.text;
    }

    if(todoText) {
        //入力文字数が０文字じゃなかったら
        const li=document.createElement("li"); //新しいリストを作成しておく
        li.innerText=todoText; //作成したリストに入れる
        li.classList.add("list-group-item") //Bootstrapの見た目のスタイルを当てている

        if (todo && todo.completed) {
            //todoがあって、かつ完了していたら
            li.classList.add("text-decoration-line-through"); //チェック線を引く
        }

        li.addEventListener("contextmenu", function(event) {
                //右クリックで
                event.preventDefault(); //右クリックのデフォルトイベントを削除
                li.remove();
                saveData();
            }

        );

        li.addEventListener("click", function() {
                li.classList.toggle("text-decoration-line-through"); //クリックされたら取り消し線を引く
                saveData();
            }

        );

        ul.appendChild(li); //作成したliをulの子要素として追加する
        input.value=""; //次のために入力ボックスを空にしておく
        saveData(); //リロードされても消えてしまわないように
    }
}

function saveData() {
    //ローカルストレージに保存
    const lists=document.querySelectorAll("li"); //liタグを全部取得
    let todos=[]; //空の配列を作成

    lists.forEach(list=> {

            //取得したliタグを一つずつ処理   
            let todo= {
                text: list.innerText,
                completed: list.classList.contains("text-decoration-line-through")
            }

            ;
            todos.push(todo);
        }

    );

    localStorage.setItem("todos", JSON.stringify(todos)); //JSON形式で保存
}