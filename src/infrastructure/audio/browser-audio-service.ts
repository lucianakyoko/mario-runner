import type { AudioService } from '../../application/audio/audio-service'
import type { EffectType } from '../../domain/audio/effect-type'
import type { MusicType } from '../../domain/audio/music-type'

export type AudioElementFactory = (source: string) => HTMLAudioElement

export type MusicSourceResolver = (music: MusicType) => string

export type EffectSourceResolver = (effect: EffectType) => string

export interface BrowserAudioServiceConfig {
  resolveMusicSource: MusicSourceResolver
  resolveEffectSource: EffectSourceResolver
  createAudioElement?: AudioElementFactory
}

export class BrowserAudioService implements AudioService {
  private readonly resolveMusicSource: MusicSourceResolver
  private readonly resolveEffectSource: EffectSourceResolver
  private readonly createAudioElement: AudioElementFactory

  private musicElement: HTMLAudioElement | undefined
  private currentMusic: MusicType | undefined
  private readonly activeEffects = new Set<HTMLAudioElement>()

  constructor(config: BrowserAudioServiceConfig) {
    this.resolveMusicSource = config.resolveMusicSource
    this.resolveEffectSource = config.resolveEffectSource
    this.createAudioElement =
      config.createAudioElement ?? ((source) => new Audio(source))
  }

  playMusic(music: MusicType): void {
    if (this.musicElement && this.currentMusic === music) {
      void this.musicElement.play().catch(() => {})
      return
    }

    this.stopMusic()

    const source = this.resolveMusicSource(music)
    const audio = this.createAudioElement(source)

    audio.loop = true
    audio.preload = 'auto'

    this.musicElement = audio
    this.currentMusic = music

    void audio.play().catch(() => {})
  }

  stopMusic(): void {
    const musicElement = this.musicElement

    if (!musicElement) {
      this.currentMusic = undefined
      return
    }

    musicElement.pause()
    musicElement.currentTime = 0

    this.musicElement = undefined
    this.currentMusic = undefined
  }

  playEffect(effect: EffectType): void {
    const source = this.resolveEffectSource(effect)
    const audio = this.createAudioElement(source)

    audio.preload = 'auto'

    this.activeEffects.add(audio)

    audio.addEventListener('ended', () => {
      this.releaseEffect(audio)
    })

    void audio.play().catch(() => {
      this.releaseEffect(audio)
    })
  }

  setVolume(_volume: number): void {
    // Implementado posteriormente.
    console.log(_volume)
  }

  setMuted(_muted: boolean): void {
    console.log(_muted)
    // Implementado posteriormente.
  }

  dispose(): void {
    this.stopMusic()
    this.stopEffects()
  }

  private stopEffects(): void {
    for (const effect of this.activeEffects) {
      effect.pause()
      effect.currentTime = 0
    }

    this.activeEffects.clear()
  }

  private releaseEffect(effect: HTMLAudioElement): void {
    effect.pause()
    effect.currentTime = 0
    this.activeEffects.delete(effect)
  }
}
