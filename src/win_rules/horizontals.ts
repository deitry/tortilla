import {BOARD_WIDTH, BOARD_HEIGHT, WIN_SEQ} from '../constants'

export function* horizontals() {
  // FIXME: упростить генераторы, обобщить?
  let horizontalIndex = (i: number, j: number, z: number) => {
    return i*BOARD_WIDTH + j + z;
  };
  for (let i = 0; i < BOARD_HEIGHT; ++i) {
    for (let j = 0; j < BOARD_WIDTH - WIN_SEQ + 1; ++j) {
      let line = [];
      for (let z = 0; z < WIN_SEQ; ++z) {
        line.push(horizontalIndex(i, j, z));
      }
      yield line;
    }
  }
}
