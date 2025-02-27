// $.noConflict();
jQuery(document).ready(function () {
    // initializers
    $answerModal = $('#answer-modal');
    $obscurer = $('#obscurer');
    
    // triggers
    $('#load-game').on('click', function() { loadGame(); });
    $('#reset-game').on('click', function() { resetGame(); });
    $('#proceed').on('click', function() { proceed(); });
    $('.answer-tile').on('click', function () {
        $(this).toggleClass('answered');
        $answerModal.find('p').text($(this).data('answer'));
        $answerModal.find('#cur-tile-value').text($(this).data('value'));
        $answerModal.find('#cur-tile-question').data('question',$(this).data('question'));
        $answerModal.addClass('active');
        $obscurer.addClass('active');
        console.log('Clicked ' + $(this).parent('div').index() + '-' + $(this).index());
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
        populateGameBoard(data);
    }).fail(function() {
        console.log("An error has occurred.");
    });
}

function populateGameBoard(json) {
    console.log('Populating game board...');

    // Single Jeopardy
    console.log('Building single jeopardy board...');
    $.each(json['single-jeopardy'].categories, function(categoryIndex, categoryValue) {
        $.each(Object.entries(this), function(tileIndex, tileDetails) {
            if (this[0] == 'title') {
                $('#single-jeopardy .category-tile').eq(categoryIndex).text(categoryValue.title);
            } else {
                $('#single-jeopardy .answers-board > div').eq(categoryIndex)
                    .find('.answer-tile').eq(tileIndex).data('answer',tileDetails[1].answer)
                    .data('question',tileDetails[1].question);
            }
        });
    });
    console.log('Populated single jeopardy board');

    // Double Jeopardy
    console.log('Populating double jeopardy board...');
    $.each(json['double-jeopardy'].categories, function(categoryIndex, categoryValue) {
        $.each(Object.entries(this), function(tileIndex, tileDetails) {
            if (this[0] == 'title') {
                $('#double-jeopardy .category-tile').eq(categoryIndex).text(categoryValue.title);
            } else {
                $('#double-jeopardy .answers-board > div').eq(categoryIndex)
                    .find('.answer-tile').eq(tileIndex).data('answer',tileDetails[1].answer)
                    .data('question',tileDetails[1].question);
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
    $('.category-tile').each(function(){
        var placeholderText = $(this).data('placeholder');
        $(this).text(placeholderText);
    });
    $('.answer-tile').data('answer','').data('question','');
    console.log('Game successfully reset.');
}

function proceed() {
    $('#single-jeopardy').addClass('hidden').removeClass('active');
    $('#double-jeopardy').removeClass('hidden').addClass('active');
}