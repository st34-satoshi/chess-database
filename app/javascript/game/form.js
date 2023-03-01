/**
 * used for games/_form.html.erb
 */

let NameDict = null;

export function SetOnChange(){
    $('#white_name_input').on('change', function () {
        // get selected user id
        const name = $(this).val()
        if(NameDict === null) {
            return;
        }
        const id = NameDict[name]
        // set game_white_id
        $('#game_white_id').val(id)
    });
    $('#black_name_input').on('change', function () {
        // get selected user id
        const name = $(this).val()
        if(NameDict === null) {
            return;
        }
        const id = NameDict[name]
        // set game_black_id
        $('#game_black_id').val(id)
    });
}

$(function() {
    NameDict = $('#white-name-list').data('user-id-table')
})