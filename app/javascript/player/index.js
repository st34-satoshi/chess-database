import "application"

function setGoButtons(){
    $('.showButton').click(function() {
        const playerPath = $(this).data('playerPath');
        window.location.href = playerPath;
    });
}

$(function() {
    setGoButtons();
})