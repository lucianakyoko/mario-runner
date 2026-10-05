export const musicTypes = {
  DEFAULT: 'default',
} as const

export type MusicType = (typeof musicTypes)[keyof typeof musicTypes]
