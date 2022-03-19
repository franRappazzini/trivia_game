$(get_data);

const URL = "https://opentdb.com/api.php?amount=10&type=multiple";
const results = [];
let score = 0;
let initialNumber = 10;

function get_data() {
  fetch(URL)
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

function send_score(name, score) {
  const db = firebase.database();

  db.ref("scores").push({ name: name, score: score });
}
