import "application"
import "./chessboard"
// import "./chess"
import { Chess } from './chess-0-13-4.js'

function helloChess(board){
    const chess = new Chess()

    const moves = $('#gameMoves').text();
    console.log('moves');
    console.log(moves);
    chess.load_pgn(moves);
    console.log(chess.pgn())
    console.log(chess.fen())
    board.position(chess.fen());
}

$(function() {
    console.log('hello game show');
    var board1 = Chessboard('board1', 'start');
    helloChess(board1);
})