import "application"
import "./chessboard"
import { Chess } from './chess-1-0-0beta-6'

let CURRENT_BOARD_INDEX = 0;
let CHESS = null;
let CHESS_BOARD = null;
let CHESS_HISTORY = null;
let CHESS_COMMENTS = null;

const EngineResult = {}; // {"movesStr": {"bestMove": "e2e4", "whiteValue": 26}}

function setCurrentBoardIndex(i){
    i = Math.max(0, i);
    i = Math.min(CHESS_HISTORY.length, i);
    CURRENT_BOARD_INDEX = i;
}

function initializeChessBoard(board){
    const chess = new Chess()
    const moves = $('#gameMoves').text();
    chess.loadPgn(moves);
    const history = chess.history({ verbose: true });
    CHESS_HISTORY = history;
    CHESS_COMMENTS = chess.getComments();
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
    // updateValueBar(chess); // update value asynchronously
    updateComment(chess);
    updatePositionNumber(gameLength);
}

function updatePositionNumber(gameLength){
    const l = Math.floor((gameLength + 1) / 2);
    const d = document.getElementById("currentPositionNumber")
    d.innerText = `${l}`;
}

function updateComment(chess){
    const commentDiv = document.getElementById("commentOnCurrentMove")
    const fen = chess.fen()
    for(const comment of CHESS_COMMENTS){
        if(fen === comment.fen){
            commentDiv.innerHTML = comment.comment
            return;
        }
    }
    commentDiv.innerHTML = '<span class="text-muted">No comment on this move</span>'
}

async function updateValueBar(chess){
    const chessHistory = chess.history({verbose: true})
    const moves = [] // ["e2e4", "e7e5"]
    for(let i=0;i<chessHistory.length;i++){
        moves.push(chessHistory[i].lan)
    }
    const movesStr = moves.join(' ')

    let bestMove = ''
    let whiteValue = 0
    let whiteMate = null;
    if(movesStr in EngineResult){
        bestMove = EngineResult[movesStr]['bestMove']
        whiteValue = EngineResult[movesStr]['whiteValue']
        whiteMate = EngineResult[movesStr]['whiteMate']
    }else{
        // fetch ai value and best move
        const url = `${getEngineApiPath()}/analysis`
        const paramsObj = {moves: movesStr}
        const searchParams = new URLSearchParams(paramsObj)
        const response = await fetch(url+"?"+searchParams, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            headers: {
              "Content-Type": "application/json",
            },
            referrerPolicy: "no-referrer",
          });

        const result = await response.json()
        if(result.message === 'ok'){
            bestMove = result.best_move
            const score = result.score
            whiteMate = result.mate
            if(moves.length % 2 === 1){
                whiteValue = -1 * score
                if(whiteMate !== null){
                    whiteMate = -1 * whiteMate;
                }
            }else{
                whiteValue = score
            }
        }
        EngineResult[movesStr] = {"bestMove": bestMove, "whiteValue": whiteValue, "whiteMate": whiteMate}
    }

    // update value bar element
    const whiteBar = document.getElementById("valueBarWhite")
    const blackBar = document.getElementById("valueBarBlack")
    if(whiteMate !== null){
        // default is black win
        let whitePercentage = 0
        let blackPercentage = 100
        let whiteDisplayValue = ''
        let blackDisplayValue = `mate ${-1 * whiteMate}`
        if(whiteMate > 0){
            // white win
            whitePercentage = 100
            blackPercentage = 0
            whiteDisplayValue = `mate ${whiteMate}`
            blackDisplayValue = ''
        }
        updateValueBarDiv(whiteBar, whiteDisplayValue, whitePercentage)
        updateValueBarDiv(blackBar, blackDisplayValue, blackPercentage)
    }else{
        // plus 100 is plus 5%
        let whitePercentage = 50 + whiteValue * 0.05
        whitePercentage = Math.max(0, whitePercentage)
        whitePercentage = Math.min(100, whitePercentage)
        const blackPercentage = 100 - whitePercentage
        let whiteDisplayValue = ''
        let blackDisplayValue = ''
        if(whiteValue > 0){
            whiteDisplayValue = whiteValue
        }else{
            blackDisplayValue = -1 * whiteValue
        }
        updateValueBarDiv(whiteBar, whiteDisplayValue, whitePercentage)
        updateValueBarDiv(blackBar, blackDisplayValue, blackPercentage)
    }
    const bestMoveDiv = document.getElementById("analysisNext")
    bestMoveDiv.innerText = `${bestMove}`
}

function updateValueBarDiv(div, value, percentage){
    div.setAttribute("aria-valuenow", `${percentage}`);
    div.style.width = `${percentage}%`
    div.innerText = value
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