/**
 * used for games/_form.html.erb
 */

export function SetOnChange(){
    $('#white_name_input').on('change', function () {
        // get selected user id
        const name = $(this).val()
        const nameDict = $('#white-name-list').data('user-id-table')
        const id = nameDict[name]
        // set game_white_id
        $('#game_white_id').val(id)
    });
}