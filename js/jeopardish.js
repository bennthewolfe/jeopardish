// $.noConflict();
var players = [];

jQuery(document).ready(function () {
    // initializers
    var $answerModal = $('#answer-modal');
    var $obscurer = $('#obscurer');

    // triggers
    $('#available-games a').on('click', function (e) {
        e.preventDefault();
        loadGame($(this).attr('href'));
    });
    $('#reset-game').on('click', function (e) {
        e.preventDefault();
        resetGame();
    });
    $('#proceed').on('click', function (e) {
        e.preventDefault();
        proceed();
    });
    $('#add-new-player').on('click', function (e) {
        e.preventDefault();
        var name = $('#new-player-name').val();
        var playerIndex = players.length;
        addPlayer(name, playerIndex);

        // Add player to DOM
        var $newPlayer = $('<div id="player1" class="col" data-player="Player / Team 1"><h2>Player / Team 1</h2><div class="score">0</div><p><button class="btn btn-danger remove-player">Remove</button></p></div>');
        $('#add-player').before($newPlayer);
    });
    $('.answer-tile').on('click', function () {
        $(this).toggleClass('answered');
        $answerModal.find('p').text($(this).data('answer'));
        $answerModal.find('#cur-tile-value').text($(this).data('value'));
        $answerModal.find('#cur-tile-question').data('question', $(this).data('question'));
        $answerModal.addClass('active');
        $obscurer.addClass('active');
        console.log('Clicked ' + $(this).parent('div').index() + '-' + $(this).index());
    });
    $('#close-icon, #obscurer').on('click', function () {
        $answerModal.removeClass('active');
        $obscurer.removeClass('active');
    });
    $('#cur-tile-question').on('click', function () {
        $answerModal.find('p').text($(this).data('question'));
    });

});

/* Game Functions */
function loadGame(gamePath) {
    console.log(`Loading game from ${gamePath}...`);
    resetGame();

    var game = gamePath.split('/').pop();

    var encodedGame = encodeURIComponent(game);

    $.getJSON('http://localhost:3000/games/' + encodedGame, function (data) {
        populateGameBoard(data);
    }).fail(function (error) {
        console.log("An error has occurred.");
    });
}

function populateGameBoard(json) {
    console.log('Populating game board...');

    // Single Jeopardy
    console.log('Building single jeopardy board...');
    $.each(json['single-jeopardy'].categories, function (categoryIndex, categoryValue) {
        $.each(Object.entries(this), function (tileIndex, tileDetails) {
            if (this[0] == 'title') {
                $('#single-jeopardy .category-tile').eq(categoryIndex).text(categoryValue.title);
            } else {
                $('#single-jeopardy .answers-board > div').eq(categoryIndex)
                    .find('.answer-tile').eq(tileIndex).data('answer', tileDetails[1].answer)
                    .data('question', tileDetails[1].question);
            }
        });
    });
    console.log('Populated single jeopardy board');

    // Double Jeopardy
    console.log('Populating double jeopardy board...');
    $.each(json['double-jeopardy'].categories, function (categoryIndex, categoryValue) {
        $.each(Object.entries(this), function (tileIndex, tileDetails) {
            if (this[0] == 'title') {
                $('#double-jeopardy .category-tile').eq(categoryIndex).text(categoryValue.title);
            } else {
                $('#double-jeopardy .answers-board > div').eq(categoryIndex)
                    .find('.answer-tile').eq(tileIndex).data('answer', tileDetails[1].answer)
                    .data('question', tileDetails[1].question);
            }
        });
    });
    console.log('Poulated double jeopardy board');
    console.log('Game board populated.');
}

function resetGame() {
    $('#single-jeopardy').removeClass('hidden').addClass('active');
    $('#double-jeopardy').addClass('hidden').removeClass('active');
    $('.answer-tile').removeClass('answered');
    $('.category-tile').each(function () {
        var placeholderText = $(this).data('placeholder');
        $(this).text(placeholderText);
    });
    $('.answer-tile').data('answer', '').data('question', '');
    console.log('Game successfully reset.');
}

function proceed() {
    $('#single-jeopardy').addClass('hidden').removeClass('active');
    $('#double-jeopardy').removeClass('hidden').addClass('active');
}

/* Player Functions */
// Player Class
class Player {
    constructor(name, playerIndex) {
        this.name = name;
        this.playerIndex = playerIndex;
        this.score = 0;
    }

    getScore() {
        return this.score;
    }

    setScore(newScore) {
        this.score = newScore;
    }

    incrementScore(increment) {
        this.score += increment;
    }

    getPlayerIndex() {
        return this.playerIndex;
    }

    getName() {
        return this.name;
    }

    setName(newName) {
        this.name = newName;
    }
}

function addPlayer(name, playerIndex) {
    var player = new Player(name, playerIndex);
    players.push(player);
    console.log(`Added player ${name}.`);
}