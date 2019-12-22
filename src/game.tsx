import React from 'react';

import {SquareState, Player, getPlayerByStep} from './common_types'
import {BOARD_HEIGHT, BOARD_WIDTH, WIN_SEQ} from './constants'
import {calculateWinner} from './win_condition'
import {Board} from './board'

interface GameState {
    squares: SquareState[],
}

interface GameProps {
  history: GameState[],
  stepNumber: number,
  nextPlayer: Player
}

export class Game extends React.Component<{}, GameProps> {
  constructor(props: {}) {
    super(props);
    this.state = {
      history: [{
        squares: Array(BOARD_WIDTH * BOARD_HEIGHT).fill(null),
      }],
      stepNumber: 0,
      nextPlayer: Player.X,
    };
  }

  jumpTo(step: number) {
    this.setState({
      stepNumber: step,
      nextPlayer: getPlayerByStep(step),
    });
  }

  handleClick(i: number) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) return;

    squares[i] = this.state.nextPlayer;
    this.setState({
      // NOTE: concat не изменяет оригинальный массив в отличие от push
      history: history.concat([{
        squares: squares,
      }]),
      stepNumber: history.length,
      nextPlayer: getPlayerByStep(history.length),
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    const moves = history.map((_: GameState, move: number) => {
      const desc = move ?
        'Перейти к ходу #' + move :
        'К началу игры';
      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    let info = "Клеток в ряду для победы: " + WIN_SEQ.toString();

    let status;
    if (winner) {
      status = 'Выиграл ' + winner;
    } else if (this.state.stepNumber === BOARD_WIDTH * BOARD_HEIGHT) {
      status = 'Ничья!';
    } else {
      status = 'Следующий ход: ' + this.state.nextPlayer;
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i: number) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{info}</div>
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}
