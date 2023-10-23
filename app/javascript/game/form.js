/**
 * used for games/_form.html.erb
 */

import "./chessboard2"
import { Chess } from './chess-1-0-0beta-6'

let NameDict = null;
let ChessBoard = null;
const game = new Chess()

function setOnChange(){
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

function updateBoardPosition(){
    ChessBoard.position(game.fen())
    $('#game_moves').val(game.pgn());
    // show comment
    const commentElement = document.getElementById('commentOnCurrentMove')
    const gameComment = game.getComment()
    if(gameComment === undefined){
        commentElement.value = ''
    }else{
        commentElement.value = gameComment
    }
}

function onDrop(params) {
    // see if the move is legal
    const move = game.move({
        from: params.source,
        to: params.target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    if (move === null) return 'snapback'

    updateBoardPosition()
}

function setUndoButton(){
    $('#undoButton').click(function() {
        game.undo();
        updateBoardPosition()
    });
}

function setFlipBoardButton(){
    $('#flipBoardButton').click(function() {
        ChessBoard.flip()
    });
}

function setAddCommentEvent(){
    const comment = document.getElementById('commentOnCurrentMove')
    comment.addEventListener("input", (event) => {
        const text = event.target.value
        game.setComment(text)
    })
}

$(function() {
    setOnChange()
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
