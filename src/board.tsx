import React from 'react';
import './index.css';

import {SquareState} from './common_types';
import {BOARD_WIDTH, BOARD_HEIGHT, DEBUG} from './constants';

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

export class Board extends React.Component<BoardProps, {}> {
  renderSquare(i: number) {
    return (
      <Square
        // for DEBUG: replace null with i
        key={i}
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
      <div className="board-row" key={startIndex}>
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
