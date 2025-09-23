# Sui zkLogin Boilerplate

A comprehensive React + TypeScript + TailwindCSS starter for building Web3 applications with Sui's zkLogin authentication. This boilerplate demonstrates how to implement zero-knowledge login using OAuth providers (Google) while maintaining user privacy and security.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm/yarn
- Google OAuth Client ID

### Installation & Setup

```bash
# Clone and install dependencies
git clone <repository-url>
cd sui-zklogin-boilerplate
pnpm install

# Set up environment variables
cp .env.example .env
```

**Configure your `.env` file** (only `VITE_GOOGLE_CLIENT_ID` is required):

```env
# Required: Get from Google Cloud Console
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Optional: All other values have smart defaults
# VITE_REDIRECT_URL=http://localhost:5173/auth/callback  # Auto-generated
# VITE_ZK_PROVER_URL=https://prover-dev.mystenlabs.com/v1  # Default
# VITE_SUI_RPC_URL=https://fullnode.devnet.sui.io:443  # Default
```

**The system automatically**:

- ✅ Generates redirect URLs based on your domain
- ✅ Uses sensible defaults for all optional configuration
- ✅ Validates configuration on startup with clear error messages

### Running the Application

```bash
pnpm dev
```

Open http://localhost:5173 and click **Connect Wallet** to start the zkLogin flow.

## 🔐 Understanding zkLogin

### What is zkLogin?

zkLogin is a Sui primitive that enables users to authenticate and transact on the blockchain using familiar OAuth credentials (Google, Facebook, etc.) without compromising privacy. It combines:

- **OAuth Authentication**: Users sign in with their existing social accounts
- **Zero-Knowledge Proofs**: Prove identity without revealing sensitive information
- **Ephemeral Keys**: Temporary keys for transaction signing (no persistent private keys to manage)
- **User Salt**: A secret value that unlinks OAuth identity from blockchain address

### The zkLogin Process Overview

```mermaid
sequenceDiagram
    participant U as User
    participant A as App Frontend
    participant G as Google OAuth
    participant S as Salt Service
    participant P as ZK Prover
    participant B as Sui Blockchain

    U->>A: Click "Connect Wallet"
    A->>A: Generate ephemeral keypair
    A->>A: Create nonce with keypair + epoch
    A->>G: Redirect to OAuth with nonce
    G->>U: User authenticates
    G->>A: Return JWT with nonce
    A->>S: Request user salt
    S->>A: Return unique salt
    A->>A: Derive zkLogin address
    A->>P: Request ZK proof
    P->>A: Return proof
    A->>A: User ready to transact
    U->>A: Send transaction
    A->>A: Sign with ephemeral key
    A->>A: Create zkLogin signature
    A->>B: Submit transaction
    B->>A: Transaction confirmed
```

### Key Components

1. **Ephemeral Keypair**: Temporary Ed25519 keypair for transaction signing
2. **JWT Token**: OAuth provider's signed token containing user identity
3. **User Salt**: 16-byte secret that unlinks OAuth identity from blockchain address
4. **ZK Proof**: Cryptographic proof that validates the OAuth credential without revealing it
5. **zkLogin Address**: Sui address derived from JWT + salt (not from a public key)

## 🔄 zkLogin Flow - Step by Step

Here's exactly what happens when a user interacts with the zkLogin system:

### **On First Load...**

- Store initializes with empty state: `{ account: null, decodedJwt: null, salt: null, isRestoring: false }`
- App checks for existing session data in cookies
- If found, attempts to restore zkLogin session for transaction signing
- On refresh, session data is restored: `{ ephemeralKeypair: "restored", maxEpoch: 68, randomness: "99429201407160918430468735605230118179", salt: "91936285553024866288626620632023329301", proof: "restored", jwtToken: "1008 chars", address: "0x25c20bb26a53506ba81b6c0c88ccd18c80e37735c3950c07033e34dd4ac73411" }`

### **When User Clicks "Connect Wallet"...**

**Step 1: Generate Ephemeral Keypair**

- We generate a temporary Ed25519 keypair: `{ publicKey: "HBEEhaQ42KeDwxyXQk8Rtf/t24fHVK4Q3kRijneyFmg=", privateKey: "70 bytes" }`
- This keypair will be used to sign transactions (not for authentication)
- Store the private key in session cookies: `zk_ephemeral_keypair`

**Step 2: Get Current Sui Epoch**

- We call `suiClient.getLatestSuiSystemState()` to get current epoch
- Set keypair validity to 2 epochs from now: `maxEpoch = 68` (current: 66)
- Store in session cookies: `zk_max_epoch`

**Step 3: Generate Randomness**

- We generate cryptographically secure randomness: `randomness = "99429201407160918430468735605230118179"`
- This prevents replay attacks and ensures nonce uniqueness (38-bit value)
- Store in session cookies: `zk_jwt_randomness`

**Step 4: Create Nonce**

- We combine ephemeral public key + max epoch + randomness: `nonce = "Z2uvub4JLwoSi5g_oKqxSDNgNEA"`
- This nonce links the OAuth response to our specific ephemeral keypair
- Components: `{ publicKey: "HBEEhaQ42KeDwxyXQk8Rtf/t24fHVK4Q3kRijneyFmg=", maxEpoch: 68, randomness: "99429201407160918430468735605230118179" }`

**Step 5: Redirect to Google OAuth**

- We build Google OAuth URL with nonce: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Fauth%2Fcallback&response_type=id_token&scope=openid+email&nonce=Z2uvub4JLwoSi5g_oKqxSDNgNEA&state=%252F`
- User is redirected to Google for authentication
- Google will include our nonce in the JWT response

### **When Google Redirects Back...**

**Step 6: Decode JWT Token**

- We receive JWT from Google: `{ iss: "https://accounts.google.com", sub: "184318064133009290952", aud: "YOUR_CLIENT_ID.apps.googleusercontent.com", exp: 1758464324, iat: 1758460724, nonce: "Z2uvub4JLwoSi5g_oKqxSDNgNEA", email: "user@example.com" }`
- We decode and validate the JWT contains our nonce (1008 characters total)
- Store JWT in session cookies: `zk_jwt_token`

**Step 7: Get or Create User Salt**

- We call salt service to get user's salt: `salt = await saltService.getOrCreateSalt(jwtPayload)`
- Retrieved existing salt: `salt = "91936285553024866288626620632023329301"` (38 digits, hex: `452a48d71ab12d761d89147dfe6e6a15`)
- Store in persistent cookies: `zk_user_salt` (30-day expiration)

**Step 8: Derive zkLogin Address**

- We combine JWT + salt to create address: `address = jwtToAddress(jwtToken, salt)`
- This creates a unique Sui address: `0x25c20bb26a53506ba81b6c0c88ccd18c80e37735c3950c07033e34dd4ac73411`
- Store in session cookies: `zk_user_address`

**Step 9: Generate ZK Proof**

- We call ZK prover service with JWT + ephemeral key + salt: `POST https://prover-dev.mystenlabs.com/v1 { jwt, extendedEphemeralPublicKey: "ABwRBIWkONing8Mcl0JPEbX/7duHx1SuEN5EYo53shZo", maxEpoch: 68, jwtRandomness: "99429201407160918430468735605230118179", salt: "91936285553024866288626620632023329301" }`
- Prover returns ZK proof: `{ proofPoints: [...], issBase64Details: [...], headerBase64: [...] }` (909 characters)
- Store proof in session cookies: `zk_proof_data`

### **When User Wants to Send a Transaction...**

**Step 10: Restore Session Data**

- We restore ephemeral keypair from cookies: `ephemeralKeypair = Ed25519Keypair.fromSecretKey(privateKey)`
- We restore ZK proof from cookies: `proof = JSON.parse(proofData)` (contains `proofPoints`, `issBase64Details`, `headerBase64`)
- We restore JWT and salt: `jwtToken = "1008 chars", salt = "91936285553024866288626620632023329301"`
- All session data successfully restored: `{ ephemeralKeypair: "restored", maxEpoch: 68, randomness: "99429201407160918430468735605230118179", salt: "91936285553024866288626620632023329301", proof: "restored", jwtToken: "1008 chars", address: "0x25c20bb26a53506ba81b6c0c88ccd18c80e37735c3950c07033e34dd4ac73411" }`

**Step 11: Create Signature Function**

- We create a function that combines ephemeral signature with ZK proof:
  ```typescript
  getSignature = (userSignature) => {
    const addressSeed = genAddressSeed(
      BigInt("91936285553024866288626620632023329301"),
      "sub",
      "184318064133009290952",
      "YOUR_CLIENT_ID.apps.googleusercontent.com"
    );
    return getZkLoginSignature({
      inputs: { ...proof, addressSeed },
      maxEpoch: 68,
      userSignature,
    });
  };
  ```

**Step 12: Sign Transaction**

- User creates transaction: `txb = new Transaction()`
- We sign with ephemeral keypair: `{ bytes, signature } = await txb.sign({ signer: ephemeralKeypair })`
- We create zkLogin signature: `zkLoginSignature = getSignature(signature)`
- We submit to Sui: `client.executeTransactionBlock({ transactionBlock: bytes, signature: zkLoginSignature })`

### **What We Store Where...**

**Session Cookies (expire when browser closes):**

- `zk_ephemeral_keypair` → `"70 bytes private key"` (Ed25519 private key for signing)
- `zk_max_epoch` → `"68"` (When keypair expires - 2 epochs from current)
- `zk_jwt_randomness` → `"99429201407160918430468735605230118179"` (Randomness for nonce)
- `zk_jwt_token` → `"1008 character JWT"` (JWT from Google with user identity)
- `zk_proof_data` → `"{ proofPoints: [...], issBase64Details: [...], headerBase64: [...] }"` (ZK proof from prover)
- `zk_user_address` → `"0x25c20bb26a53506ba81b6c0c88ccd18c80e37735c3950c07033e34dd4ac73411"` (Derived Sui address)

**Persistent Cookies (30-day expiration):**

- `zk_user_salt` → `"91936285553024866288626620632023329301"` (User's salt for address consistency)

**Store State (for UI):**

- `account` → `{ address: "0x25c20bb26a53506ba81b6c0c88ccd18c80e37735c3950c07033e34dd4ac73411" }`
- `decodedJwt` → `{ iss: "https://accounts.google.com", sub: "184318064133009290952", email: "user@example.com", ... }`
- `salt` → `"91936285553024866288626620632023329301"` (User's salt for debugging)
- `isRestoring` → `false` (Loading state)

### **Why This Design?**

- **Privacy**: Salt unlinks Google identity from blockchain address
- **Security**: Ephemeral keys expire, ZK proofs don't reveal credentials
- **Consistency**: Same salt + JWT = same address across devices
- **Simplicity**: Users just click "Connect" - no wallet setup needed

## 🏗️ Project Architecture

### File Structure

```
src/
├── services/                   # 🏢 Service Layer (Business Logic)
│   ├── zkLoginService.ts       # Main zkLogin service with OAuth & crypto ops
│   └── saltService.ts          # Salt management (demo + backend implementations)
├── state/
│   └── ZkLoginProvider.tsx     # React Context for zkLogin state
├── store/
│   └── zkLoginStore.ts         # Zustand store (thin layer, delegates to services)
├── hooks/
│   └── useCrossTabSync.ts      # Cross-tab synchronization
├── routes/
│   ├── Home.tsx                # Landing page
│   ├── Profile.tsx             # User profile page
│   ├── TestTx.tsx              # Transaction testing
│   └── auth/
│       └── AuthCallback.tsx    # OAuth callback handler
├── ui/
│   ├── AppLayout.tsx           # Main layout component
│   ├── Avatar.tsx              # User avatar generation component
│   ├── ConnectWalletButton.tsx # Wallet connection button
│   ├── DropdownMenu.tsx        # Reusable dropdown menu component
│   ├── Navbar.tsx              # Navigation bar component
│   └── UserWalletButton.tsx    # Connected user wallet button
├── utils/
│   └── cookieStorage.ts        # Cookie-based storage utilities
├── sui/
│   └── client.ts               # Sui client configuration
├── main.tsx                    # Application entry point
├── index.css                   # Global styles
└── types.ts                    # Centralized TypeScript type definitions
```

### Architecture Layers

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[React Components]
        B[UI Components]
        C[Routes]
    end

    subgraph "State Management Layer"
        D[ZkLoginProvider]
        E[ZkLoginStore]
        F[Cross-tab Sync]
    end

    subgraph "Service Layer"
        G[ZkLoginService]
        H[SaltService]
        I[Demo Salt Service]
        J[Backend Salt Service]
    end

    subgraph "Infrastructure Layer"
        K[Cookie Storage]
        L[Sui Client]
        M[External APIs]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> G
    G --> H
    H --> I
    H --> J
    G --> K
    G --> L
    G --> M
```

### Service-Oriented Data Flow

```mermaid
sequenceDiagram
    participant C as Component
    participant P as ZkLoginProvider
    participant S as ZkLoginStore
    participant ZS as ZkLoginService
    participant SS as SaltService
    participant G as Google OAuth
    participant ZP as ZK Prover
    participant SC as Sui Client

    C->>P: useZkLogin()
    P->>S: Store actions
    S->>ZS: Service calls

    Note over ZS: ZKLOGIN STEP 1-5: OAuth Initiation
    ZS->>G: Redirect to OAuth
    G->>C: User authenticates
    C->>P: OAuth callback
    P->>S: completeLogin()
    S->>ZS: completeLogin()

    Note over ZS: ZKLOGIN STEP 6-8: JWT Processing
    ZS->>ZS: Decode JWT
    ZS->>SS: getOrCreateSalt()
    SS->>SS: Generate/retrieve salt
    ZS->>ZS: Derive zkLogin address

    Note over ZS: ZKLOGIN STEP 9: ZK Proof Generation
    ZS->>ZP: Request ZK proof
    ZP->>ZS: Return proof
    ZS->>S: Return success
    S->>P: Update state
    P->>C: User authenticated

    Note over ZS: ZKLOGIN STEP 10-11: Transaction Signing
    C->>P: ensureZkSession()
    P->>S: ensureZkSession()
    S->>ZS: createSession()
    ZS->>ZS: Create signature function
    ZS->>S: Return session
    S->>P: Return session
    P->>C: Ready for transactions
```

### Data Flow Architecture

```mermaid
graph LR
    subgraph "Browser Storage"
        A[Session Cookies<br/>Ephemeral Data]
        B[Persistent Cookies<br/>User Salt]
        C[Zustand Store<br/>React State]
    end

    subgraph "External Services"
        D[Google OAuth]
        E[ZK Prover Service]
        F[Sui Blockchain]
    end

    subgraph "Application Flow"
        G[Login] --> H[OAuth Callback]
        H --> I[Salt Generation]
        I --> J[Address Derivation]
        J --> K[ZK Proof Generation]
        K --> L[Transaction Signing]
    end

    A --> C
    B --> C
    C --> G
    G --> D
    H --> I
    I --> J
    J --> K
    K --> E
    L --> F
```

## 🏢 Service Architecture

### Service Layer Pattern

This project follows a **Service Layer Pattern** that separates business logic from state management:

#### **ZkLoginService** - Main Business Logic

- **OAuth Flow Management**: Handles Google OAuth initiation and completion
- **Cryptographic Operations**: Manages ephemeral keypairs, nonce generation, address derivation
- **ZK Proof Generation**: Communicates with ZK prover service
- **Session Creation**: Creates zkLogin sessions for transaction signing
- **Error Handling**: Returns structured results instead of throwing exceptions

#### **SaltService** - Salt Management

- **Demo Implementation**: Client-side salt generation for development
- **Backend Implementation**: Production-ready backend salt service
- **Strategy Pattern**: Easy switching between implementations via configuration
- **Consistent API**: Same interface regardless of implementation

#### **Benefits of Service Architecture**

- ✅ **Separation of Concerns**: Business logic separated from UI and state
- ✅ **Testability**: Services can be easily mocked and tested independently
- ✅ **Reusability**: Services can be used outside of React components
- ✅ **Maintainability**: Clear boundaries and single responsibility
- ✅ **Configuration**: Environment-based service selection

### Service Configuration

```typescript
// Environment-based service configuration
const config: ZkLoginServiceConfig = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  redirectUrl: import.meta.env.VITE_REDIRECT_URL,
  proverUrl: import.meta.env.VITE_ZK_PROVER_URL,
  useBackendSaltService:
    import.meta.env.VITE_USE_BACKEND_SALT_SERVICE === "true",
  saltServiceUrl: import.meta.env.VITE_SALT_SERVICE_URL,
};
```

## 🔄 zkLogin Implementation Details

### 1. Authentication Flow

The authentication process follows these steps:

1. **Ephemeral Key Generation**: Create temporary Ed25519 keypair
2. **Nonce Creation**: Generate nonce using ephemeral public key, max epoch, and randomness
3. **OAuth Redirect**: Send user to Google with nonce in state
4. **JWT Processing**: Decode and validate returned JWT token
5. **Salt Management**: Get or create user-specific salt
6. **Address Derivation**: Calculate zkLogin address from JWT + salt
7. **ZK Proof Generation**: Request proof from prover service
8. **Session Storage**: Store ephemeral data in secure cookies

### 2. Data Storage Strategy

#### Session Cookies (Expire when browser closes)

- `zk_ephemeral_keypair`: Ed25519 private key for signing
- `zk_max_epoch`: Maximum epoch for key validity
- `zk_jwt_randomness`: Randomness used in nonce
- `zk_jwt_token`: OAuth JWT token
- `zk_proof_data`: ZK proof for verification
- `zk_user_address`: Derived zkLogin address

#### Persistent Cookies (30-day expiration)

- `zk_user_salt`: User salt for address derivation

### 3. Cross-Tab Synchronization

The application uses a custom storage system that:

- Stores data in secure cookies
- Triggers `storage` events for cross-tab updates
- Maintains session consistency across browser tabs

## 🛠️ Building New Features

### Creating Pages with zkLogin

To create a new page that uses zkLogin authentication:

```typescript
import { useZkLogin } from "../state/ZkLoginProvider";

export default function MyNewPage() {
  const { account, ensureZkSession, client } = useZkLogin();

  // Check if user is authenticated
  if (!account?.address) {
    return <div>Please sign in to access this page</div>;
  }

  // Use the zkLogin session for transactions
  const handleTransaction = async () => {
    const session = await ensureZkSession();
    if (!session) return;

    // Create and sign transaction
    const txb = new Transaction();
    txb.setSender(session.address);
    // ... add transaction logic

    const { bytes, signature } = await txb.sign({
      client,
      signer: session.ephemeralKeypair,
    });

    const zkLoginSignature = session.getSignature(signature);

    await client.executeTransactionBlock({
      transactionBlock: bytes,
      signature: zkLoginSignature,
    });
  };

  return (
    <div>
      <h1>My New Page</h1>
      <button onClick={handleTransaction}>Send Transaction</button>
    </div>
  );
}
```

### Available zkLogin Methods

- `account`: Current user account with address
- `decodedJwt`: Decoded JWT payload with user info
- `ensureZkSession()`: Get or create zkLogin session for transactions
- `loginWithProvider()`: Initiate OAuth login
- `logout()`: Clear session and sign out
- `clearSalt()`: Generate new salt (creates new address)

## 🔮 Future Integration: Custom Salt Service

### Stable Addresses Across Devices

To provide stable addresses across devices, implement a custom salt service:

#### Required Data Storage

```typescript
interface SaltServiceData {
  // User identification
  sub: string; // OAuth subject ID
  iss: string; // OAuth issuer (e.g., Google)
  aud: string; // OAuth audience (your app)

  // Salt management
  salt: string; // 16-byte user salt
  createdAt: number; // Creation timestamp
  lastUsed: number; // Last access timestamp

  // Security
  saltHash: string; // Hash of salt for verification
  rotationCount: number; // Number of salt rotations
}
```

#### Salt Service Implementation

```typescript
// Backend salt service endpoint
app.post("/api/salt", async (req, res) => {
  const { jwt } = req.body;
  const decoded = jwtDecode(jwt);

  // Verify JWT signature
  const isValid = await verifyJWT(jwt);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid JWT" });
  }

  // Generate or retrieve salt
  const salt = await getOrCreateSalt({
    sub: decoded.sub,
    iss: decoded.iss,
    aud: decoded.aud,
  });

  res.json({ salt });
});
```

#### Frontend Integration

```typescript
// Update getOrCreateSalt in zkLoginStore.ts
getOrCreateSalt: async (decoded: JwtPayload): Promise<string> => {
  const key = "zk_user_salt";
  let salt = persistentCookieStorage.getItem(key);

  if (!salt) {
    // Call your custom salt service
    const response = await fetch("/api/salt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jwt: idToken }),
    });

    const { salt: serverSalt } = await response.json();
    salt = serverSalt;
    persistentCookieStorage.setItem(key, salt);
  }

  return salt;
};
```

### Address Stability

With a custom salt service:

- **Same OAuth account** + **same salt service** = **same Sui address**
- Users get consistent addresses across devices
- Salt can be rotated for security without changing address
- Backup/recovery mechanisms can be implemented

### Security Considerations

1. **JWT Validation**: Always verify JWT signatures server-side
2. **Rate Limiting**: Implement rate limiting on salt requests
3. **Audit Logging**: Log salt access for security monitoring
4. **Encryption**: Encrypt salt data at rest
5. **Access Control**: Implement proper authentication for salt service

## 🔧 Configuration & Environment

### Centralized Configuration System

This project uses a **centralized configuration system** with Zod validation that provides:

- ✅ **Type-safe configuration** with runtime validation
- ✅ **Dynamic redirect URL generation** (works across environments)
- ✅ **Environment variable validation** with clear error messages
- ✅ **Default values** for optional configuration
- ✅ **Configuration summary** for debugging

### Configuration Features

#### **Dynamic Redirect URL Generation**

The system automatically generates redirect URLs based on the current domain:

- **Development**: `http://localhost:5173/auth/callback`
- **Production**: `https://yourapp.com/auth/callback`
- **Custom**: Override with `VITE_REDIRECT_URL` environment variable

#### **Configuration Validation**

All configuration is validated at startup with descriptive error messages:

```typescript
// Example validation error
Configuration validation failed:
googleClientId: Google Client ID is required
saltServiceUrl: Invalid salt service URL
```

#### **Configuration Access**

```typescript
import { config } from "./config";

// Type-safe access
const clientId = config.googleClientId;
const redirectUrl = config.redirectUrl; // Auto-generated or from env

// Environment checks
if (config.isDevelopment) {
  console.log("Running in development mode");
}
```

### Environment Variables

```env
# ============================================================================
# REQUIRED CONFIGURATION
# ============================================================================

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# ============================================================================
# OPTIONAL CONFIGURATION (with defaults)
# ============================================================================

# Redirect URL (auto-generated if not provided)
# VITE_REDIRECT_URL=http://localhost:5173/auth/callback

# ZK Prover Service (default: https://prover-dev.mystenlabs.com/v1)
# VITE_ZK_PROVER_URL=https://prover-dev.mystenlabs.com/v1

# Sui Network (default: https://fullnode.devnet.sui.io:443)
# VITE_SUI_RPC_URL=https://fullnode.devnet.sui.io:443

# Explorer URLs (optional)
# VITE_EXPLORER_OBJECT_BASE_URL=https://suiscan.xyz/devnet/object

# ============================================================================
# PRODUCTION CONFIGURATION
# ============================================================================

# Salt Service (for production)
# VITE_USE_BACKEND_SALT_SERVICE=true
# VITE_SALT_SERVICE_URL=https://api.yourapp.com/salt

# Logging (optional)
# VITE_LOG_LEVEL=info

# ============================================================================
# DEVELOPMENT CONFIGURATION
# ============================================================================

# Development mode is automatically detected
# No additional configuration needed for local development
```

### Configuration Schema

The configuration system validates the following schema:

```typescript
interface Config {
  // OAuth Configuration
  googleClientId: string; // Required
  redirectUrl: string; // Auto-generated or from env

  // ZK Prover Service
  proverUrl: string; // Default: prover-dev.mystenlabs.com

  // Salt Service Configuration
  useBackendSaltService: boolean; // Default: false
  saltServiceUrl?: string; // Optional

  // Sui Blockchain Configuration
  suiRpcUrl: string; // Default: fullnode.devnet.sui.io

  // Explorer Configuration
  explorerObjectBaseUrl?: string; // Optional

  // Development Configuration
  isDevelopment: boolean; // Auto-detected
  logLevel: "debug" | "info" | "warn" | "error"; // Default: info
}
```

### Configuration Validation

The system provides built-in validation helpers:

```typescript
import { validateProductionConfig, getConfigSummary } from "./config";

// Validate production readiness
const validation = validateProductionConfig();
if (!validation.isValid) {
  console.error("Configuration issues:", validation.issues);
}

// Get safe configuration summary for debugging
const summary = getConfigSummary();
console.log("Configuration:", summary);
```

### Quick Setup

1. **Copy environment template**:

   ```bash
   cp .env.example .env
   ```

2. **Configure Google OAuth**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:5173/auth/callback` (or your domain)
   - Copy Client ID to `.env` file

3. **Start development**:
   ```bash
   npm run dev
   ```

The system will automatically:

- Generate redirect URLs based on your domain
- Use sensible defaults for all optional configuration
- Validate configuration on startup

## 🚨 Security Best Practices

### Current Implementation (Demo)

- ✅ Session cookies for ephemeral data
- ✅ Secure cookie settings
- ✅ Cross-tab synchronization
- ⚠️ Client-side salt generation (demo only)

### Production Recommendations

- 🔒 Move salt service to backend
- 🔒 Implement proper JWT validation
- 🔒 Use HTTPS in production
- 🔒 Add rate limiting
- 🔒 Implement audit logging
- 🔒 Consider salt rotation policies

## 📚 Additional Resources

- [Sui zkLogin Documentation](https://docs.sui.io/guides/developer/cryptography/zklogin)
- [Sui TypeScript SDK](https://sdk.mystenlabs.com/typescript)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [OpenID Connect](https://openid.net/connect/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🎨 Styling Guide for Maintainers

This section provides comprehensive guidelines for maintaining and extending the codebase while preserving consistency and architectural patterns.

### 🏗️ Architecture Overview

The project follows a **Service Layer + State Management + React Context** pattern:

```mermaid
graph TB
    subgraph "Presentation Layer"
        A[React Components]
        B[UI Components]
        C[Routes]
    end

    subgraph "State Management Layer"
        D[ZkLoginProvider]
        E[ZkLoginStore]
        F[Cross-tab Sync]
    end

    subgraph "Service Layer"
        G[ZkLoginService]
        H[SaltService]
    end

    subgraph "Infrastructure Layer"
        I[Cookie Storage]
        J[Sui Client]
        K[External APIs]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    E --> G
    G --> H
    G --> I
    G --> J
    G --> K
```

### 📁 File Organization Patterns

#### **Service Layer** (`src/services/`)

- **Purpose**: Pure business logic and external API interactions
- **Pattern**: Class-based services with dependency injection
- **Naming**: `{feature}Service.ts` (e.g., `zkLoginService.ts`, `saltService.ts`)
- **Structure**:
  ```typescript
  export class FeatureService {
    constructor(config: FeatureConfig) {
      /* DI setup */
    }
    async methodName(): Promise<Result> {
      /* business logic */
    }
  }
  export function createFeatureService(): FeatureService {
    /* factory */
  }
  ```

#### **State Management** (`src/store/`)

- **Purpose**: Thin state management wrapper over services
- **Pattern**: Zustand store with custom storage
- **Naming**: `{feature}Store.ts` (e.g., `zkLoginStore.ts`)
- **Structure**:
  ```typescript
  export const useFeatureStore = create<FeatureState>()(
    persist(
      (set, get) => ({
        // State
        data: null,
        // Actions that delegate to services
        action: async () => {
          const { service } = get();
          const result = await service.method();
          if (result.success) set({ data: result.data });
        },
      }),
      { name: "feature-storage", storage: createCustomStorage() }
    )
  );
  ```

#### **React Integration** (`src/state/`)

- **Purpose**: Bridge between React and state management
- **Pattern**: React Context + custom hook
- **Naming**: `{Feature}Provider.tsx` (e.g., `ZkLoginProvider.tsx`)
- **Structure**:

  ```typescript
  const FeatureCtx = createContext<FeatureContext | null>(null);

  export function FeatureProvider({ children }) {
    const store = useFeatureStore();
    const value = { ...store, client: sharedClient };
    return <FeatureCtx.Provider value={value}>{children}</FeatureCtx.Provider>;
  }

  export function useFeature() {
    const context = useContext(FeatureCtx);
    if (!context)
      throw new Error("useFeature must be used within FeatureProvider");
    return context;
  }
  ```

### 🎨 UI Component Styling Guide

#### **Component Structure Pattern**

Every UI component follows this consistent structure:

```typescript
// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ComponentProps {
  /** Description of prop */
  propName: type;
  /** Optional prop with default */
  optionalProp?: type;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_VALUE = "default" as const;

const STYLES = {
  container: "base-classes",
  element: "conditional-classes",
  // ... more style objects
} as const;

const TEXT = {
  title: "Static text",
  subtitle: "More static text",
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const helperFunction = (param: type): returnType => {
  // Helper logic
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ComponentName Component
 *
 * Detailed description of what the component does, its features,
 * and any important usage notes.
 *
 * @param props - Component props
 * @returns JSX element
 */
export default function ComponentName({
  propName,
  optionalProp = DEFAULT_VALUE,
}: ComponentProps) {
  // ============================================================================
  // HOOKS & STATE
  // ============================================================================

  const [state, setState] = useState(initialValue);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleEvent = (): void => {
    // Event handling logic
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return <div className={STYLES.container}>{/* Component JSX */}</div>;
}
```

#### **Styling Conventions**

##### **1. Style Object Pattern**

```typescript
const STYLES = {
  // Base container styles
  container: "base-classes",

  // Conditional styles (use template literals for dynamic classes)
  button: "base-classes",
  buttonEnabled: "base-classes hover:classes",
  buttonDisabled: "base-classes opacity-50 cursor-not-allowed",

  // Nested element styles
  header: "header-classes",
  content: "content-classes",
  footer: "footer-classes",
} as const;
```

##### **2. Class Naming Conventions**

- **Container**: `container`, `wrapper`, `layout`
- **Interactive**: `button`, `link`, `input`
- **State variants**: `{element}{State}` (e.g., `buttonEnabled`, `buttonDisabled`)
- **Layout**: `header`, `content`, `footer`, `sidebar`
- **Responsive**: `{element}Mobile`, `{element}Desktop`

##### **3. Color Palette**

```css
/* Primary Colors */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--gradient-accent: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* Background */
background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);

/* Glass Effect */
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

##### **4. Animation Patterns**

```typescript
// Hover effects
"hover:scale-105 hover:from-purple-600 hover:to-blue-600 transition-all duration-200";

// Loading states
"animate-spin"; // for spinners
"animate-pulse-slow"; // for background effects

// Glow effects
"glow-effect"; // custom class for glowing elements
```

#### **UI Folder Structure** (`src/ui/`)

The UI folder contains reusable components following these patterns:

##### **1. Layout Components**

- **`AppLayout.tsx`**: Main app wrapper with background effects
- **`Navbar.tsx`**: Navigation with authentication state
- **Pattern**: Layout components handle structure and positioning

##### **2. Interactive Components**

- **`ConnectWalletButton.tsx`**: OAuth login initiation
- **`UserWalletButton.tsx`**: Connected user display with dropdown
- **`DropdownMenu.tsx`**: Reusable dropdown with context
- **Pattern**: Interactive components handle user actions and state

##### **3. Display Components**

- **`Avatar.tsx`**: Deterministic avatar generation
- **Pattern**: Display components are pure and stateless

##### **Component Responsibilities**

| Component             | Purpose                 | Props                                                        | State                      | Dependencies                                            |
| --------------------- | ----------------------- | ------------------------------------------------------------ | -------------------------- | ------------------------------------------------------- |
| `AppLayout`           | Main layout wrapper     | None                                                         | None                       | `Navbar`, `Outlet`                                      |
| `Navbar`              | Navigation & auth state | None                                                         | None                       | `useZkLogin`, `ConnectWalletButton`, `UserWalletButton` |
| `ConnectWalletButton` | OAuth login             | None                                                         | `isConnecting`             | `useZkLogin`                                            |
| `UserWalletButton`    | User display & actions  | `address`, `onDisconnect`, `isMobile?`, `includeNavigation?` | `copied`, `isDropdownOpen` | `Avatar`, `DropdownMenu`                                |
| `DropdownMenu`        | Reusable dropdown       | `trigger`, `children`, `position?`, `width?`, `isMobile?`    | `isOpen`                   | Context API                                             |
| `Avatar`              | Address-based avatar    | `address`, `size?`, `className?`                             | None                       | `@dicebear/core`                                        |

### 🔧 Development Guidelines

#### **Adding New Features**

1. **Service Layer First**

   ```typescript
   // 1. Create service in src/services/
   export class NewFeatureService {
     async method(): Promise<Result> {
       /* business logic */
     }
   }
   ```

2. **Add to Store**

   ```typescript
   // 2. Add to store in src/store/
   newFeatureService: createNewFeatureService(),
   newFeatureAction: async () => {
     const { newFeatureService } = get();
     const result = await newFeatureService.method();
     // Handle result
   }
   ```

3. **Expose via Provider**

   ```typescript
   // 3. Add to provider in src/state/
   const { newFeatureAction } = useFeatureStore();
   const value = { ...store, newFeatureAction };
   ```

4. **Create UI Components**
   ```typescript
   // 4. Create UI components in src/ui/
   export default function NewFeatureComponent() {
     const { newFeatureAction } = useFeature();
     // Component implementation
   }
   ```

#### **Component Development Checklist**

- [ ] **Types & Interfaces**: Define all props with JSDoc comments
- [ ] **Constants**: Extract all strings and style objects
- [ ] **Structure**: Follow the 5-section component structure
- [ ] **Styling**: Use STYLES object pattern with consistent naming
- [ ] **Accessibility**: Include proper ARIA labels and keyboard navigation
- [ ] **Responsive**: Test on mobile and desktop layouts
- [ ] **Error Handling**: Include proper error states and loading states
- [ ] **Documentation**: Add comprehensive JSDoc comments

#### **Styling Best Practices**

1. **Use Style Objects**: Never inline complex className strings
2. **Consistent Naming**: Follow the established naming conventions
3. **Responsive Design**: Always consider mobile and desktop layouts
4. **Accessibility**: Include proper contrast ratios and focus states
5. **Performance**: Use CSS classes over inline styles
6. **Maintainability**: Group related styles together

#### **Code Quality Standards**

1. **TypeScript**: Strict typing with no `any` types
2. **Error Handling**: Proper error boundaries and user feedback
3. **Performance**: Memoization for expensive operations
4. **Testing**: Unit tests for business logic, integration tests for UI
5. **Documentation**: JSDoc comments for all public APIs

### 🚀 Quick Reference

#### **Common Patterns**

```typescript
// Service pattern
export class FeatureService {
  constructor(private config: Config) {}
  async method(): Promise<Result> {
    try {
      // Business logic
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Store pattern
export const useFeatureStore = create<FeatureState>()(
  persist(
    (set, get) => ({
      data: null,
      action: async () => {
        const { service } = get();
        const result = await service.method();
        if (result.success) set({ data: result.data });
      },
    }),
    { name: "feature-storage", storage: createCustomStorage() }
  )
);

// Component pattern
export default function FeatureComponent({ prop }: Props) {
  const { action } = useFeature();
  const [state, setState] = useState(initial);

  const handleAction = async () => {
    await action();
  };

  return <div className={STYLES.container}>Content</div>;
}
```

#### **File Naming Conventions**

- **Services**: `{feature}Service.ts`
- **Stores**: `{feature}Store.ts`
- **Providers**: `{Feature}Provider.tsx`
- **Components**: `{FeatureName}.tsx` (PascalCase)
- **Hooks**: `use{FeatureName}.ts`
- **Utils**: `{feature}Utils.ts`
- **Types**: `types.ts` (centralized)

This styling guide ensures consistency, maintainability, and scalability as the project grows. Follow these patterns when adding new features or maintaining existing ones.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
