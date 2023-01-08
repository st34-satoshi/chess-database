import "application"
import "./chessboard"
// import "./chess"
import { Chess } from './chess-0-13-4.js'

function helloChess(){
    console.log('hello chess');
    const chess = new Chess()

    while (!chess.game_over()) {
        const moves = chess.moves()
        const move = moves[Math.floor(Math.random() * moves.length)]
        chess.move(move)
    }
    console.log(chess.pgn())

}

$(function() {
    console.log('hello game show');
    var board1 = Chessboard('board1', 'start');
    helloChess();
})