import {BOARD_WIDTH, BOARD_HEIGHT, WIN_SEQ} from '../constants'

export function* verticals() {
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
