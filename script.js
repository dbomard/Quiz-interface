class Game {

    initialize(quiz) {
        this._round = 0;
        this.questions = quiz['questions'];
        this.played = [];
        this.score = 0;
        this.currentAnswer = 0;
    }

    testAnswer(id) {
        return this.currentAnswer == id;
    }

    nextQuestion() {
        let randomQuestion = this.questions[(Math.floor(Math.random() * this.questions.length))];
        while (this.played.includes(randomQuestion['id'])) {
            randomQuestion = this.questions[(Math.floor(Math.random() * this.questions.length))];
        }
        this.round++;
        this.played.push(randomQuestion['id']);
        return randomQuestion;
    }

    get round() {
        return this._round;
    }

    set round(newIndex) {
        this._round = newIndex;
    }

    addScore(score) {
        this.score += score;
    }
}

var partie = new Game();

var quizzes = [];

function getQuiz(id) {
    // const result = null;
    for (const quiz of quizzes) {
        if (quiz['id'] == id) {
            result = quiz;
        }
    }
    return result;
}

function clickProposition(event) {
    const propositions = document.querySelectorAll(".proposition")
    for (const proposition of propositions) {
        console.log(proposition);
        proposition.removeEventListener('click', clickProposition);
        proposition.classList.remove('clickable')
        proposition.classList.remove('hoverable')
    }
    if (partie.testAnswer(event.currentTarget.dataset.id)) {
        event.currentTarget.classList.add('win');
        console.log("Gagné !!");
    } else {
        event.currentTarget.classList.add('lose');
        console.log("Perdu");
        document.querySelector(`li[data-id="${partie.currentAnswer}"]`).classList.add('win');
    }
    const btnNextQuestion = document.querySelector("#next-question");
    if (partie.round >= 10) {
        btnNextQuestion.addEventListener('click', finishQuiz);
        btnNextQuestion.innerText = "Résultats";
    } else {
        btnNextQuestion.addEventListener('click', showNextQuestion);
    }
    btnNextQuestion.hidden = false;
}

function finishQuiz() {

}

function showNextQuestion() {
    const template = document.querySelector('#template-question');
    const question = partie.nextQuestion();
    const questionElt = document.importNode(template.content, true);

    questionElt.querySelector('#index-question').innerText = `Question n°${partie.round}`;
    questionElt.querySelector("#text-question").innerText = question['question'];
    for (const answer of question["answers"]) {
        const liElt = document.createElement('li');
        liElt.classList.add("proposition");
        liElt.classList.add("clickable");
        liElt.classList.add("hoverable");
        liElt.innerText = answer['answer'];
        liElt.addEventListener('click', clickProposition);
        liElt.dataset.id = answer['id'];
        if (answer['right_answer']) {
            partie.currentAnswer = answer['id'];
        }
        questionElt.querySelector("#answers").appendChild(liElt);
    }
    const audio = questionElt.querySelector("#track")
    const button = questionElt.querySelector("#illustration");
    if (question['deezer_song_id'] !== null) {
        audio.src = question['deezer_song_id'];
        audio.hidden = false;
    } else {
        audio.hidden = true;
    }
    const questionZone = document.querySelector('#question');
    questionZone.innerHTML = "";
    questionZone.appendChild(questionElt);
    startAudio();
    console.log(question);
}

function startAudio(event) {
    const questionZone = document.querySelector('#question');
    const audio = questionZone.querySelector("#track");
    const button = questionZone.querySelector("#illustration");
    audio.play();
    button.src = "./bounton_pause.png";
    button.removeEventListener('click', startAudio);
    button.addEventListener('click', stopAudio);
}

function stopAudio(event) {
    const questionZone = document.querySelector('#question');
    const audio = questionZone.querySelector("#track");
    const button = questionZone.querySelector("#illustration");
    audio.pause();
    button.src = "./bounton_play.png";
    button.removeEventListener('click', stopAudio);
    button.addEventListener('click', startAudio);
}

function beginQuiz(event) {
    const quizSelect = document.querySelector('#quiz-select');
    event.currentTarget.disabled = true;
    const quiz = getQuiz(quizSelect.value);

    partie.initialize(quiz);
    showNextQuestion();
}

function quizSelect(event) {
    const select = event.currentTarget;
    const startQuizBtn = document.querySelector('#startBtn');
    startQuizBtn.disabled = select.value === "";
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#quiz-select').addEventListener('change', quizSelect);
    document.querySelector('#startBtn').addEventListener('click', beginQuiz);
    fetch('./quiz.json')
        .then((response) => response.json())
        .then((json) => {
            quizzes = json;
            for (const quiz of quizzes) {
                document.querySelector('#quiz-select').innerHTML += `<option value="${quiz['id']}">${quiz['name']}</option>`;
            }
        });
});