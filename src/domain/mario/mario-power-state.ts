export const marioPowerState = {
  NORMAL: 'NORMAL',
  POWERED: 'POWERED',
} as const

export type MarioPowerState =
  (typeof marioPowerState)[keyof typeof marioPowerState]
