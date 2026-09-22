export interface GameTime {
  /** Tempo decorrido desde o último ciclo de atualização, em segundos. */
  deltaTime: number

  /** Tempo total decorrido desde o início da execução do gameplay, em segundos. */
  elapsedTime: number
}
