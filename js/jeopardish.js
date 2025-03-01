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
        var player = addPlayer(name, playerIndex);

        // Add to DOM
        var customizedTemplate = $('#player-template').clone().html();
        customizedTemplate = customizedTemplate.replace(/{{playerName}}/g, name);
        customizedTemplate = customizedTemplate.replace(/{{playerIndex}}/g, playerIndex);
        customizedTemplate = customizedTemplate.replace(/{{avatarNumber}}/g, playerIndex % 5);
        $('#add-player').before(customizedTemplate);

        var $newPlayer = $('#player' + playerIndex);

        // Change player avatar color
        // Load and modify SVG
        var $playerAvatar = $newPlayer.find('.player-avatar');
        var color = player.getColor();

        // Add event listener to remove player
        $('#player' + playerIndex).find('.remove-player').on('click', function () {
            var $playerParent = $(this).parents('.player').first();
            var playerIndex = $playerParent.data('player-index');
            $playerParent.remove();

            // Remove from players array
            const index = players.findIndex(player => player.getPlayerIndex() === playerIndex);
            if (index !== -1) {
                players.splice(index, 1);
            }
            console.log(players);
        });

        // Clear input
        $('#new-player-name').val('');
    });
    $('.answer-tile').on('click', function () {
        $(this).toggleClass('answered');
        $answerModal.find('p').text($(this).data('answer'));
        $answerModal.find('#cur-tile-value').text($(this).data('value'));
        $answerModal.find('#cur-tile-question').data('question', $(this).data('question'));
        $answerModal.find('#scoreboard-preview').text('People');
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
        this.color = getRandomColor();
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

    getColor() {
        return this.color;
    }

    setColor(newColor) {
        this.color = newColor;
    }
}

function addPlayer(name, playerIndex) {
    var player = new Player(name, playerIndex);
    players.push(player);

    console.log(`Added player ${name}.`);
    console.log(players);

    return player;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}