// $.noConflict();
var players = [];

jQuery(document).ready(function () {
    // initializers
    var $answerModal = $('#answer-modal');
    var $obscurer = $('#obscurer');

    // triggers
    // nav triggers
    $('#available-games a').on('click', loadGameClickHandler);
    $('#reset-game').on('click', resetGameClickHandler);
    $('#proceed').on('click', proceedClickHandler);
    // gameboard triggers
    $('.answer-tile').on('click', answerTileClickHandler);
    // player triggers
    $('#add-new-player').on('click', addPlayerClickHandler);
    // overlay triggers
    $('#close-icon, #obscurer').on('click', function () { closeOverlay(); });
    $('#cur-tile-question').on('click', function () {
        $answerModal.find('p').text($(this).data('question'));
    });

    // Load games in nav bar
    $.getJSON('http://localhost:3000/games', function (data) {
        let $gamesDropdown = $('#available-games');
        $gamesDropdown.empty();
        $.each(data, function (index, value) {
            var gameName = value.title;
            var gameFile = value.file;
            var gameLink = $('<a>').addClass('dropdown-item').attr('href', 'content/full-games/' + gameFile).text(gameName);
            gameLink = $('<li>').append(gameLink);
            $gamesDropdown.append(gameLink);
        });
        $gamesDropdown.append('<li><hr class="dropdown-divider"></li>');
        $gamesDropdown.append('<li><a class="dropdown-item" href="random">Random</a></li>');
        // reintroduce click handler
        $('#available-games a').on('click', loadGameClickHandler);
        console.log('Loaded games into the nav bar.');
    }).fail(function (error) {
        console.log("Unable to connect to the server to get the list of games.");
        console.log(error);
    });

    /* Click Handlers */
    function loadGameClickHandler(e) {
        e.preventDefault();
        loadGame($(this).attr('href'));
    }
    function resetGameClickHandler(e) {
        e.preventDefault();
        resetGame();
    }
    function proceedClickHandler(e) {
        e.preventDefault();
        proceed();
    }
    function addPlayerClickHandler(e) {
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
    }
    function answerTileClickHandler(e) {
        $(this).toggleClass('answered');
        $answerModal.find('p').text($(this).data('answer'));
        $answerModal.find('#cur-tile-value').text($(this).data('value'));
        $answerModal.find('#scoreboard-preview').data('value', $(this).data('value'));
        $answerModal.find('#cur-tile-question').data('question', $(this).data('question'));
        if (players.length > 0) {
            var $scoreboardPreview = $answerModal.find('#scoreboard-preview');
            $scoreboardPreview.find('.player-preview').remove();
            players.forEach(function (player) {
                var customizedTemplate = $('#scoreboard-preview-player-template').clone().html();
                customizedTemplate = customizedTemplate.replace(/{{playerName}}/g, player.getName() ? player.getName()[0] : '');
                customizedTemplate = customizedTemplate.replace(/{{playerIndex}}/g, player.getPlayerIndex());
                customizedTemplate = customizedTemplate.replace(/{{avatarNumber}}/g, player.getPlayerIndex() % 5);
                customizedTemplate = customizedTemplate.replace(/{{score}}/g, player.getScore());
                $('#scoreboard-preview-player-template').before(customizedTemplate);
            });
            $('#scoreboard-preview .modify-score').on('click', function () {
                var playerIndex = $(this).parent('.player-preview').data('player-index');
                var value = $('#scoreboard-preview').data('value');
                if ($(this).hasClass('decrease-score')) {
                    value = value * -1;
                }
                var newScore = incrementScore(playerIndex, value);
                $(this).siblings('.score').text(newScore);
                $('#player' + playerIndex + ' .score').text(newScore);

                console.log(`Increased player ${playerIndex}'s score by ${value}.`);

                closeOverlay();
            });
        }

        $answerModal.addClass('active');
        $obscurer.addClass('active');
        console.log('Clicked ' + $(this).parent('div').index() + '-' + $(this).index());
    }

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
        console.log(error);
        alert("Is your server running?  Try running 'npm start' in the server directory.");
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

function closeOverlay() {
    $('#answer-modal').removeClass('active');
    $('#obscurer').removeClass('active');
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
        return this.score;
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

function incrementScore(playerIndex, increment) {
    var player = players.find(player => player.getPlayerIndex() === playerIndex);
    return player.incrementScore(increment);
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/* Chat GPT Functions */

class ChatGPTMessage {
    constructor(message, context = null) {
        this.message = message;
        if (context) {
            this.context = context;
        } else {
            this.context = this.getDefaultContext();
        }
    }

    getDefaultContext() {
        return "You are a helpful assistant.";
    }

    setContext(context) {
        this.context = context;
    }

    getContext() {
        return this.context;
    }

    getMessage() {
        return this.message;
    }

    setMessage(message) {
        this.message = message;
    }

    getPlainObject() {
        return {
            "messages": [
                { role: "system", content: this.context },
                { role: "user", content: this.message }
            ]
        };
    }

    get jsonString() {
        return JSON.stringify(this.getPlainObject());
    }

    toString() {
        return this.jsonString;
    }

}

function testChatGPT(message = null) {
    const chatGPTMessageObj = new ChatGPTMessage(message);

    if (message) {
        if (typeof message === 'string') {
            // TODO: Also check for json string object
            chatGPTMessageObj.setMessage(message);
        } if (typeof message === 'object') {
            chatGPTMessageObj = message;
        }
    } else {
        return 'This message was not sent to ChatGPT, as no message was provided.';
    }

    $.ajax({
        type: "POST",
        url: 'http://localhost:3000/chatgpt',
        data: chatGPTMessageObj.getPlainObject(),
        success: function (response) {
            console.log('Successful response from ChatGPT.');
            console.log(JSON.parse(response));
        },
        fail: function (error) {
            console.log("An error has occurred.");
        }
    });
}