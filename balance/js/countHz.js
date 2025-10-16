(() => {
    //HTMLのid値を使って以下のDOM要素を取得
    const tendown = document.getElementById("-10down");
    const fivedown = document.getElementById("-5down");
    const downbutton = document.getElementById('down');

    const upbutton = document.getElementById('up');
    const fiveup = document.getElementById("+5up");
    const tenup = document.getElementById("+10up");

    const text = document.getElementById('textbox');
  
    //ボタンが押されたらカウント減
    tendown.addEventListener('click', (event) => {
    //0以下にはならないようにする
      if(text.value >= 1) {
        text.value = Number(text.value) - 10;
      }
    });

    fivedown.addEventListener('click', (event) => {
      if(text.value >= 1) {
        text.value = Number(text.value) - 5;
      }
    });

    downbutton.addEventListener('click', (event) => {
    if(text.value >= 1) {
      text.value = Number(text.value) - 1;
    }
    });
  
    //ボタンが押されたらカウント増
    upbutton.addEventListener('click', (event) => {
      text.value = Number(text.value) + 1;
    })

    fiveup.addEventListener('click', (event) => {
      text.value = Number(text.value) + 5;
    })

    tenup.addEventListener('click', (event) => {
      text.value = Number(text.value) + 10;
    })
  
  })();