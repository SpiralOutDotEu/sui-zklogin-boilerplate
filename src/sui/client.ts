import { SuiClient } from '@mysten/sui/client'
import { config } from '../config'

export const client = new SuiClient({
  url: config.suiRpcUrl,
})
