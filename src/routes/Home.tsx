import { useZkLogin } from "../state/ZkLoginProvider";

export default function Home() {
  const { account, decodedJwt } = useZkLogin();

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-6xl font-bold gradient-text leading-tight">
            Welcome to Sui zkLogin
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Experience the future of Web3 authentication with zero-knowledge
            proofs. Connect your Google account seamlessly without compromising
            your privacy.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">🔐</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Zero-Knowledge
            </h3>
            <p className="text-white/60 text-sm">
              Your identity stays private while proving authenticity
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">⚡</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-white/60 text-sm">
              Connect in seconds with familiar OAuth flow
            </p>
          </div>

          <div className="glass-effect rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-xl">🛡️</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Secure</h3>
            <p className="text-white/60 text-sm">
              Built on Sui's battle-tested cryptography
            </p>
          </div>
        </div>

        {/* User Status Card */}
        {account?.address ? (
          <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto mt-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">✓</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Welcome Back!
            </h2>
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-4">
                <div className="text-sm text-white/60 mb-1">Your Address</div>
                <div className="font-mono text-white break-all">
                  {account.address}
                </div>
              </div>
              {decodedJwt?.email && (
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="text-sm text-white/60 mb-1">
                    Connected Email
                  </div>
                  <div className="text-white">{decodedJwt.email}</div>
                </div>
              )}
            </div>
            <div className="mt-6 text-sm text-white/60">
              You're ready to explore the Sui ecosystem!
            </div>
          </div>
        ) : (
          <div className="glass-effect rounded-2xl p-8 max-w-2xl mx-auto mt-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">🚀</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/70 mb-6">
              Click "Connect Wallet" in the header to begin your zkLogin journey
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-white/50">
              <span>Powered by</span>
              <span className="font-bold gradient-text">Sui Blockchain</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
