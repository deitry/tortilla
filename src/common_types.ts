export enum Player {
    X = 'X',
    O = 'O',
}

export type SquareState = Player | null;

export function getPlayerByStep(step: number): Player {
  let players = Object.keys(Player);
  let index = step % players.length;
  let playerByIdx = players[index] as keyof typeof Player;
  return Player[playerByIdx];
}
