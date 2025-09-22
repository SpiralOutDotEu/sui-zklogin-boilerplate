import { SuiClient } from '@mysten/sui/client'

export const client = new SuiClient({
  url: import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.devnet.sui.io:443',
})
