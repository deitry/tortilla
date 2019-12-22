import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


// Board sizes
const BOARD_WIDTH: number = 5;
const BOARD_HEIGHT: number = 5;

// How many items in the line should be to win
const WIN_SEQ = 4;
const DEBUG = false;


enum Player {
  X = 'X',
  O = 'O',
}

type SquareState = Player | null;


function getPlayerByStep(step: number): Player {
  // https://stackoverflow.com/questions/18111657/how-to-get-names-of-enum-entries
  // https://stackoverflow.com/questions/17380845/how-do-i-convert-a-string-to-enum-in-typescript

  let players = Object.keys(Player);
  let index = step % players.length;
  let playerByIdx = players[index] as keyof typeof Player;
  return Player[playerByIdx];
}

interface SquareProps {
  onClick: (() => void),
  value: SquareState | number, // number is for debug
}

function Square(props: SquareProps) {
  return (
    <button
      className="square"
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

interface BoardProps {
  squares: SquareState[],
  onClick: ((i: number) => void),
}

class Board extends React.Component<BoardProps, {}> {
  renderSquare(i: number) {
    return (
      <Square
        // for DEBUG: replace null with i
        value={this.props.squares[i] ? this.props.squares[i]
                                     : (DEBUG ? i
                                              : null)}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  renderRow(startIndex: number) {
    let items = [];
    for (let i = 0; i < BOARD_WIDTH; ++i) {
      items.push(this.renderSquare(startIndex * BOARD_WIDTH + i));
    }
    return (
      <div className="board-row">
        {items}
      </div>
    );
  }

  render() {
    let rows = [];
    for (let i = 0; i < BOARD_HEIGHT; ++i) {
      rows.push(this.renderRow(i));
    }
    return (
      <div>
        {rows}
      </div>
    );
  }
}

interface GameState {
    squares: SquareState[],
}

interface GameProps {
  history: GameState[],
  stepNumber: number,
  nextPlayer: Player
}

class Game extends React.Component<{}, GameProps> {
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

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

// FIXME: предварительно вычислять и сохранять. Или придумать решение получше
function* horizontals() {
  // FIXME: упростить генераторы, обобщить?
  let horizontalIndex = (i: number, j: number, z: number) => {
    return i*BOARD_WIDTH + j + z;
  };
  for (let i = 0; i < BOARD_HEIGHT; ++i) {
    for (let j = 0; j < BOARD_WIDTH - WIN_SEQ + 1; ++j) {
      // console.log("horizontal", i, j);
      let line = [];
      for (let z = 0; z < WIN_SEQ; ++z) {
        line.push(horizontalIndex(i, j, z));
      }
      yield line;
    }
  }
}

function* verticals() {
  for (let i = 0; i < BOARD_HEIGHT - WIN_SEQ + 1; ++i) {
    for (let j = 0; j < BOARD_WIDTH; ++j) {
      // console.log("vertical", i, j)
      let line = [];
      for (let z = 0; z < WIN_SEQ; ++z) {
        line.push(j + (i + z) * BOARD_WIDTH);
      }
      yield line;
    }
  }
}

function* diagonalsDown() {
  for (let i = 0; i < BOARD_HEIGHT - WIN_SEQ + 1; ++i) {
    for (let j = 0; j < BOARD_WIDTH - WIN_SEQ + 1; ++j) {
      // console.log("diagDown", i, j);
      let line = [];
      for (let z = 0; z < WIN_SEQ; ++z) {
        line.push(j + (i + z) * BOARD_WIDTH + z);
      }
      yield line;
    }
  }
}

function* diagonalsUp() {
  for (let i = WIN_SEQ - 1; i < BOARD_HEIGHT; ++i) {
    for (let j = 0; j < BOARD_WIDTH - WIN_SEQ + 1; ++j) {
      // console.log("diagUp", i, j)
      let line = [];
      for (let z = 0; z < WIN_SEQ; ++z) {
        line.push(j + (i - z) * BOARD_WIDTH + z);
      }
      yield line;
    }
  }
}

function calculateWinner(squares: SquareState[]) {

  let checkRule = (rule: Generator<number[], void, unknown>): Player | null => {
    while (true) {
      let line = rule.next();
      // console.log(line.value)

      if (line.done || line.value.length === 0) break;
      // console.log("line", line);

      // check conditions
      let cur = squares[line.value[0]];
      if (!cur) continue;

      let isCorrect = true;
      for (let i = 1; i < line.value.length; ++i) {
        if (squares[line.value[i]] !== cur) {
          isCorrect = false;
          break;
        }
      }
      // console.log("isCorrect", isCorrect);
      if (isCorrect) return cur;
    }

    return null;
  };

  let winner: Player | null = null;
  let rules = [
    horizontals,
    verticals,
    diagonalsDown,
    diagonalsUp,
  ];
  for (let rule of rules) {
    if (winner = checkRule(rule())) return winner;
  }
  return null;
}
