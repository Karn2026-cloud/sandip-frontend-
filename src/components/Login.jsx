import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bus, Shield, User, Truck, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

const roles = [
  { key: 'student', label: 'Student', icon: User, placeholder: 'ERP ID (e.g. STU001)', color: 'from-blue-500 to-indigo-600' },
  { key: 'driver', label: 'Driver', icon: Truck, placeholder: 'Driver ID (e.g. DRV001)', color: 'from-emerald-500 to-teal-600' },
  { key: 'admin', label: 'Admin', icon: Shield, placeholder: 'Admin Username', color: 'from-purple-500 to-pink-600' },
];

export default function Login() {
  const { login } = useAuth();
  const [activeRole, setActiveRole] = useState('student');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const currentRole = roles.find(r => r.key === activeRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginId, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-4 shadow-lg shadow-primary-500/30">
            <Bus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Sandip Bus Tracker</h1>
          <p className="text-white/50 text-sm">Real-time college bus tracking system</p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          {/* Role Tabs */}
          <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl">
            {roles.map(role => {
              const Icon = role.icon;
              return (
                <button
                  key={role.key}
                  onClick={() => { setActiveRole(role.key); setError(''); setLoginId(''); setPassword(''); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                    activeRole === role.key
                      ? `bg-gradient-to-r ${role.color} text-white shadow-lg`
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{role.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/60 text-sm mb-2 font-medium">
                {activeRole === 'student' ? 'ERP ID' : activeRole === 'driver' ? 'Driver ID' : 'Username'}
              </label>
              <div className="relative">
                <currentRole.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder={currentRole.placeholder}
                  className="input-field pl-11"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-sm mb-2 font-medium">Password</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field pl-11 pr-11"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary flex items-center justify-center gap-2 bg-gradient-to-r ${currentRole.color}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>Sign In as {currentRole.label}</>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
            <p className="text-white/40 text-xs font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-white/30">
              <p>Student: <span className="text-primary-400">STU001</span> / <span className="text-primary-400">password123</span></p>
              <p>Driver: <span className="text-emerald-400">DRV001</span> / <span className="text-emerald-400">password123</span></p>
              <p>Admin: <span className="text-purple-400">admin</span> / <span className="text-purple-400">admin123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
