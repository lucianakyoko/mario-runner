export interface Random {
  next(): number
  nextInt(min: number, max: number): number
}
