import "application"

function setGoButtons(){
    $('.showButton').click(function() {
        const gamePath = $(this).data('gamePath');
        window.location.href = gamePath;
    });
}

$(function() {
    setGoButtons();
})