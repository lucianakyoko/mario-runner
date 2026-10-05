import { describe, expect, it } from 'vitest'
import {
  BrowserAudioService,
  type AudioElementFactory,
} from './browser-audio-service'
import { effectTypes } from '../../domain/audio/effect-type'
import { musicTypes } from '../../domain/audio/music-type'

class FakeAudioElement {
  public readonly source: string

  public currentTime = 0
  public loop = false
  public preload = ''

  public playCalls = 0
  public pauseCalls = 0

  private readonly listeners = new Map<string, () => void>()

  public constructor(source: string) {
    this.source = source
  }

  public play(): Promise<void> {
    this.playCalls += 1

    return Promise.resolve()
  }

  public pause(): void {
    this.pauseCalls += 1
  }

  public addEventListener(type: string, listener: () => void): void {
    this.listeners.set(type, listener)
  }

  public emit(type: string): void {
    this.listeners.get(type)?.()
  }
}

const createAudioFactory =
  (elements: FakeAudioElement[]): AudioElementFactory =>
  (source) => {
    const audio = new FakeAudioElement(source)

    elements.push(audio)

    return audio as unknown as HTMLAudioElement
  }

describe('BrowserAudioService', () => {
  it('plays music through the injected audio factory', async () => {
    const elements: FakeAudioElement[] = []
    const service = new BrowserAudioService({
      resolveMusicSource: (music) => `/audio/music/${music}.mp3`,
      resolveEffectSource: (effect) => `/audio/effects/${effect}.mp3`,
      createAudioElement: createAudioFactory(elements),
    })

    service.playMusic(musicTypes.DEFAULT)

    await Promise.resolve()

    expect(elements).toHaveLength(1)
    expect(elements[0].source).toBe('/audio/music/default.mp3')
    expect(elements[0].loop).toBe(true)
    expect(elements[0].preload).toBe('auto')
    expect(elements[0].playCalls).toBe(1)
  })

  it('plays effects through independent audio elements', async () => {
    const elements: FakeAudioElement[] = []
    const service = new BrowserAudioService({
      resolveMusicSource: (music) => `/audio/music/${music}.mp3`,
      resolveEffectSource: (effect) => `/audio/effects/${effect}.mp3`,
      createAudioElement: createAudioFactory(elements),
    })

    service.playEffect(effectTypes.COIN)
    service.playEffect(effectTypes.MEDAL)

    await Promise.resolve()

    expect(elements).toHaveLength(2)

    expect(elements[0].source).toBe('/audio/effects/coin.mp3')
    expect(elements[0].preload).toBe('auto')
    expect(elements[0].playCalls).toBe(1)

    expect(elements[1].source).toBe('/audio/effects/medal.mp3')
    expect(elements[1].preload).toBe('auto')
    expect(elements[1].playCalls).toBe(1)
  })

  it('reuses the current music element when the same music is played again', async () => {
    const elements: FakeAudioElement[] = []
    const service = new BrowserAudioService({
      resolveMusicSource: (music) => `/audio/music/${music}.mp3`,
      resolveEffectSource: (effect) => `/audio/effects/${effect}.mp3`,
      createAudioElement: createAudioFactory(elements),
    })

    service.playMusic(musicTypes.DEFAULT)
    service.playMusic(musicTypes.DEFAULT)

    await Promise.resolve()

    expect(elements).toHaveLength(1)
    expect(elements[0].playCalls).toBe(2)
  })

  it('disposes music and active effects', async () => {
    const elements: FakeAudioElement[] = []
    const service = new BrowserAudioService({
      resolveMusicSource: (music) => `/audio/music/${music}.mp3`,
      resolveEffectSource: (effect) => `/audio/effects/${effect}.mp3`,
      createAudioElement: createAudioFactory(elements),
    })

    service.playMusic(musicTypes.DEFAULT)
    service.playEffect(effectTypes.COIN)
    service.playEffect(effectTypes.MEDAL)

    await Promise.resolve()

    service.dispose()

    expect(elements).toHaveLength(3)

    for (const element of elements) {
      expect(element.pauseCalls).toBe(1)
      expect(element.currentTime).toBe(0)
    }
  })

  it('releases an effect when playback ends', async () => {
    const elements: FakeAudioElement[] = []
    const service = new BrowserAudioService({
      resolveMusicSource: (music) => `/audio/music/${music}.mp3`,
      resolveEffectSource: (effect) => `/audio/effects/${effect}.mp3`,
      createAudioElement: createAudioFactory(elements),
    })

    service.playEffect(effectTypes.COIN)

    await Promise.resolve()

    elements[0].emit('ended')

    service.dispose()

    expect(elements[0].pauseCalls).toBe(1)
    expect(elements[0].currentTime).toBe(0)
  })
})
