import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';


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
  value: SquareState,
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
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  // циклы в React
  // https://blog.cloudboost.io/for-loops-in-react-render-no-you-didnt-6c9f4aa73778

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
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
        squares: Array(9).fill(null),
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

    let status;
    if (winner) {
      status = 'Выиграл ' + winner;
    } else if (this.state.stepNumber === 9) {
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

function calculateWinner(squares: SquareState[]) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
