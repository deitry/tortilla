import {SquareState, Player} from './common_types';

import {horizontals} from './win_rules/horizontals';
import {verticals} from './win_rules/verticals';
import {diagonalsUp} from './win_rules/diagonals_up';
import {diagonalsDown} from './win_rules/diagonals_down';

// FIXME: предварительно вычислять и сохранять. Или придумать решение получше

export function calculateWinner(squares: SquareState[]) {

  let checkRule = (rule: Generator<number[], void, unknown>): Player | null => {
    while (true) {
      let line = rule.next();
      if (line.done || line.value.length === 0) break;

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
      if (isCorrect) return cur;
    }

    return null;
  };

  let rules = [
    horizontals,
    verticals,
    diagonalsDown,
    diagonalsUp,
  ];

  for (let rule of rules) {
    let winner = checkRule(rule());
    if (winner) return winner;
  }

  return null;
}
