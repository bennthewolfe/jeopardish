$(document).ready(function () {
    // initializers
    $answerModal = $('#answer-modal');
    $obscurer = $('#obscurer');
    
    // triggers
    $('#load-game').on('click', function() { loadGame(); });
    $('#reset-game').on('click', function() { resetGame(); });
    $('#proceed').on('click', function() { proceed(); });
    $('#game-board li:not(.categories li)').on('click', function () {
        $(this).toggleClass('answered');
        $answerModal.find('p').text($(this).find('.answer').text());
        $answerModal.find('#cur-tile-value').text($(this).find('.value').text());
        $answerModal.find('#cur-tile-question').data('question',$(this).find('.question').text());
        $answerModal.addClass('active');
        $obscurer.addClass('active');
        console.log('Clicked ' + $(this).parent('ol').index() + '.' + $(this).index());
    });
    $('#close-icon, #obscurer').on('click',function() {
        $answerModal.removeClass('active');
        $obscurer.removeClass('active');
    });
    $('#cur-tile-question').on('click', function() {
        $answerModal.find('p').text($(this).data('question'));
    });

});

function loadGame() {
    $.getJSON('http://localhost:3000/games/wings-of-fire', function(data) {
        buildGameBoard(data);
    }).fail(function() {
        console.log("An error has occurred.");
    });
}

function buildGameBoard(json) {
    console.log('Building game board...');

    // Single Jeopardy
    $.each(json['single-jeopardy'].categories, function(categoryIndex, categoryValue) {
        $.each(Object.entries(this), function(tileIndex, tileDetails) {
            if (this[0] == 'title') {
                $('#single-jeopardy ol.categories li').eq(categoryIndex).text(categoryValue.title);
            } else {
                $('#single-jeopardy ol').not('.categories').eq(categoryIndex)
                    .find('li').eq(tileIndex).find('.answer').text(tileDetails[1].answer)
                    .siblings('.question').text(tileDetails[1].question);
            }
        });
    });

    // Double Jeopardy
    $.each(json['double-jeopardy'].categories, function(categoryIndex, categoryValue) {
        $.each(Object.entries(this), function(tileIndex, tileDetails) {
            if (this[0] == 'title') {
                $('#double-jeopardy ol.categories li').eq(categoryIndex).text(categoryValue.title);
            } else {
                $('#double-jeopardy ol').not('.categories').eq(categoryIndex)
                    .find('li').eq(tileIndex).find('.answer').text(tileDetails[1].answer)
                    .siblings('.question').text(tileDetails[1].question);
            }
        });
    });
}

function resetGame() {
    console.log('resetting game');
    $('#single-jeopardy').addClass('active');
    $('#double-jeopardy').removeClass('active');
    $('li').removeClass('answered');
    $('.categories li').text('Category Title');
    $('li .answer').text('');
    $('li .question').text('');
}

function proceed() {
    $('#single-jeopardy').removeClass('active');
    $('#double-jeopardy').addClass('active');
}