import type { GameTime } from '../../domain/time'

export type Update = (gameTime: GameTime) => void
