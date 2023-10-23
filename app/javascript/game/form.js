/**
 * used for games/_form.html.erb
 */

import "./chessboard2"
import { Chess } from './chess-1-0-0beta-6'

let NameDict = null;
let ChessBoard = null;
const game = new Chess()

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

function onDragStart (params) {
    // do not pick up pieces if the game is over
    const piece = params.piece;
    if (game.isGameOver()) return false

    // only pick up pieces for the side to move
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
    }
}

function onDrop (params) {
    // see if the move is legal
    const move = game.move({
        from: params.source,
        to: params.target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    if (move === null) return 'snapback'

    ChessBoard.position(game.fen())
    $('#game_moves').val(game.pgn());
}

function setUndoButton(){
    $('#undoButton').click(function() {
        game.undo();
        ChessBoard.position(game.fen())
        $('#game_moves').val(game.pgn());
    });
}

function setFlipBoardButton(){
    $('#flipBoardButton').click(function() {
        ChessBoard.flip()
    });
}

function setAddCommentEvent(){
    const comment = document.getElementById('commentOnCurrentMove')
    comment.addEventListener("change", (event) => {
        console.log('change event')
        const text = event.target.value
        console.log(text)
        game.setComment(text)
        console.log('set comment to chess js')
    })

}

$(function() {
    NameDict = $('#white-name-list').data('user-id-table')

    const config = {
      draggable: true,
      dropOffBoard: 'snapback',
      position: 'start',
      onDragStart,
      onDrop
    }
    ChessBoard = Chessboard2('inputBoard', config);
    setUndoButton();
    setFlipBoardButton();
    setAddCommentEvent();
})
