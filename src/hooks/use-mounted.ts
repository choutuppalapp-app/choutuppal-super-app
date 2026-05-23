'use client'

import { useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,   // client: always mounted after first render
    () => false,  // server: never mounted
  )
}
