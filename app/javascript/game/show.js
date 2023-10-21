import "application"
import "./chessboard"
import { Chess } from './chess-1-0-0beta-6'

let CURRENT_BOARD_INDEX = 0;
let CHESS = null;
let CHESS_BOARD = null;
let CHESS_HISTORY = null;

function setCurrentBoardIndex(i){
    i = Math.max(0, i);
    i = Math.min(CHESS_HISTORY.length, i);
    CURRENT_BOARD_INDEX = i;
}

function initializeChessBoard(board){
    const chess = new Chess()
    const moves = $('#gameMoves').text();
    chess.loadPgn(moves);
    const history = chess.history();
    CHESS_HISTORY = history;
    CHESS = chess;
    CHESS_BOARD = board;
    movePositionAt(history.length);
}

function movePositionAt(i){
    setCurrentBoardIndex(i);
    const gameLength = CURRENT_BOARD_INDEX;
    let chess = CHESS;
    chess.reset();
    let history = CHESS_HISTORY;
    for(let i=0;i<gameLength;i++){
        chess.move(history[i]);
    }
    CHESS_BOARD.position(chess.fen());
    // update value asynchronously
    updateValueBar(chess);
}

async function updateValueBar(chess){
    const chessHistory = chess.history({verbose: true})
    const moves = [] // ["e2e4", "e7e5"]
    for(let i=0;i<chessHistory.length;i++){
        moves.push(chessHistory[i].lan)
    }
    const movesStr = moves.join(' ')

    // fetch ai value and best move
    const url = `${getEngineApiPath()}/analysis`
    const data = {moves: movesStr}
    const response = await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        headers: {
          "Content-Type": "application/json",
        },
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
      });
    // TODO: update value bar
    console.log(response)
}

function getEngineApiPath(){
    const d = document.getElementById("engineApiPath")
    return d.dataset.path

}

function setBoardNextButtons(){
    $('#buttonBoardBigPrevious').click(function() {
        movePositionAt(CURRENT_BOARD_INDEX - 10);
    });
    $('#buttonBoardPrevious').click(function() {
        movePositionAt(CURRENT_BOARD_INDEX - 1);
    });
    $('#buttonBoardNext').click(function() {
        movePositionAt(CURRENT_BOARD_INDEX + 1);
    });
    $('#buttonBoardBigNext').click(function() {
        movePositionAt(CURRENT_BOARD_INDEX + 10);
    });
}

function setBoardFlipButton(){
    $('#buttonBoardFlip').click(function() {
        CHESS_BOARD.flip();
    });
}

$(function() {
    var board1 = Chessboard('board1', 'start');
    initializeChessBoard(board1);
    setBoardNextButtons();
    setBoardFlipButton();
})