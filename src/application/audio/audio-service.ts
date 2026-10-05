import type { EffectType } from '../../domain/audio/effect-type'
import type { MusicType } from '../../domain/audio/music-type'

export interface AudioService {
  playMusic(music: MusicType): void
  stopMusic(): void
  playEffect(effect: EffectType): void
  stopEffects(): void
  setVolume(volume: number): void
  setMuted(muted: boolean): void
  dispose(): void
}
