$(() => {
  get_data();
  get_high_scores();
});

const db = firebase.database();
const results = [];
const high_scores = [];
let score = 0;
let initialNumber = 0;

// obtiene datos de api
function get_data() {
  // escoger tipo de juego
  $("select[name=select_game]").change(() => {
    $(".btn_start_game").attr("disabled", true);
    fetch(
      `https://opentdb.com/api.php?amount=10&type=${$(
        "select[name=select_game]"
      ).val()}`
    )
      .then((res) => res.json())
      .then((data) => {
        results.splice(0, results.length);
        results.push(...data.results);
        console.log(results); // lo dejo a modo de easter egg 🤫
        $(".btn_start_game").removeAttr("disabled");
      })
      .catch((err) => console.log("ERROR: ", err));
  });

  fetch("https://opentdb.com/api.php?amount=10&type=multiple")
    .then((res) => res.json())
    .then((data) => {
      results.push(...data.results);
      console.log(results);
    })
    .catch((err) => console.log("ERROR: ", err));
}

// renderiza las preguntas y respuestas
function render() {
  if (initialNumber < 10) {
    const answers = [];
    const correct_answer = results[initialNumber].correct_answer;

    results[initialNumber].incorrect_answers.forEach((answer) =>
      answers.push(answer)
    );
    answers.push(results[initialNumber].correct_answer);

    $(".main_section").empty().append(`
      <p>${initialNumber + 1}/10</p>
      <p>Category: ${results[initialNumber].category}</p>
      <p>Difficulty: ${results[initialNumber].difficulty}</p>
      <p>${results[initialNumber].question}</p>
        
      <div class='answers_container'>
      </div>
    `);

    answers.sort().forEach((answer, index) => {
      $(".main_section div").append(`
        <button class='btn_answer-${index}' value='${answer}'>
            ${answer}
        </button>
      `);

      correct_or_incorrect(index, correct_answer);
    });
  } else {
    $(".main_section").empty().append(`
      <h2 style="text-align: center;">Congratulations! 🎉</h2>
      <p style="text-align: center;">Your score was ${score}</p>
      <div style='display: flex; justify-content: center; margin: 1rem 0;'>
        <button onclick='location.reload()'>Retry</button>
      </div>

      <form class='form' onsubmit='send_score($(".input_name").val(), score)'>
        <input class='input_name' placeholder='name' maxlength='10' required />
        <input type='submit' value='send' />
      </form>
    `);

    $(".form").submit((e) => {
      e.preventDefault();
    });
  }
}

// pasa a la siguiente pregunta
function next_question() {
  initialNumber += 1;
  render();
}

// verifica si la respuesta es correcta o no
function correct_or_incorrect(index) {
  const btn_answer = $(`.btn_answer-${index}`);

  btn_answer.click(() => {
    if (btn_answer.val() == results[initialNumber].correct_answer) {
      btn_answer.addClass("correct_answer");
      add_score();
      dialog(true, btn_answer.val(), results[initialNumber].correct_answer);
    } else {
      btn_answer.addClass("incorrect_answer");
      dialog(false, btn_answer.val(), results[initialNumber].correct_answer);
    }
  });
}

// suma puntos
function add_score() {
  score += 1;
  $(".score_container").empty().append(score);
}

// dialog de respuesta correcta o incorrecta
function dialog(is_correct, answer, correct_answer) {
  $("main").append(`
    <span class='dialog_container'>
      <section>
        <h3>${is_correct ? "Correct! ✅😎" : "Incorrect.. ❌👎🏻"}</h3>
        <p>Your answer: ${answer}</p>
        <p>${is_correct ? "" : `The correct answer: ${correct_answer}`}</p>

        <button class='btn_continue' style='margin-bottom: 1.5rem;'>Continue</button>
      </section>
    </span>
  `);

  $(".btn_continue").click(() => {
    $(".dialog_container").remove();
    next_question();
  });
}

// envia el score a la db
async function send_score(name, score) {
  $(".input_name").val("");
  await db.ref("scores").push({ name: name, score: score });
  location.reload();
}

// obtiene los scores de la db
function get_high_scores() {
  db.ref("scores").on("value", (snap) => {
    if (snap.exists()) {
      Object.values(snap.val()).map((data) => high_scores.push({ ...data }));
    }
  });
}

// renderiza la tabla de puntuacion
function show_high_scores() {
  $(".main_section").empty().append(`
    <button onclick='location.reload()'>Go back</button>
    <table border='1' class='score_table'>
      <tr>
        <td style='width: 1.5rem;'></td>
        <td style='width: 7rem'>Name</td>
        <td style='width: 3rem;' align='center'>Score</td>
      </tr>
    </table>
  `);

  high_scores
    .sort((a, b) => b.score - a.score)
    .forEach((score, index) => {
      $(".main_section table").append(`
      <tr>
        <td style='width: 1.5rem;'>${index + 1}</td>
        <td style='width: 7rem'>${score.name}</td>
        <td style='width: 3rem;' align='center'>${score.score}</td>
      </tr>
      <p>${index + 1} ${score.name}: ${score.score} points</p>
    `);
    });
}
