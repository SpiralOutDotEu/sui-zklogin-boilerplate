import { SuiClient } from '@mysten/sui/client'
import { getConfig } from '@/config'

// Create client with configuration
const configResult = getConfig();
if (!configResult.ok) {
  throw new Error(`Configuration failed: ${configResult.error.message}`);
}

export const client = new SuiClient({
  url: configResult.data.suiRpcUrl,
})
