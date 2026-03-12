import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAppStore } from '../store/appStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, School } from 'lucide-react';

const SCHOOL_CODE = 'palakpublicschool';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setCurrentUser, teachers, students } = useAppStore();
  const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [schoolCode, setSchoolCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim() || !schoolCode.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    if (schoolCode !== SCHOOL_CODE) {
      toast.error('Invalid school code');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    if (role === 'admin') {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setCurrentUser({ username, name: 'Admin', role: 'admin', schoolCode });
        navigate({ to: '/admin' });
      } else {
        toast.error('Invalid admin credentials');
      }
    } else if (role === 'teacher') {
      const teacher = teachers.find(
        (t) => t.username === username && t.password === password && t.code === schoolCode
      );
      if (teacher) {
        setCurrentUser({ username, name: teacher.name, role: 'teacher', schoolCode, teacherId: teacher.id });
        navigate({ to: '/teacher' });
      } else {
        toast.error('Invalid teacher credentials');
      }
    } else {
      const student = students.find(
        (s) => s.username === username && s.password === password && s.code === schoolCode
      );
      if (student) {
        toast.success('Student login coming soon!');
      } else {
        toast.error('Invalid student credentials');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
              <img src="/assets/generated/pps-logo.dim_256x256.png" alt="PPS Logo" className="w-16 h-16 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <School className="w-10 h-10 text-white absolute" style={{ display: 'none' }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-orange-600 tracking-tight">PPS</h1>
          <p className="text-gray-500 text-sm mt-1">Palak Public School</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-orange-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Sign In</h2>

          {/* Role Selector */}
          <div className="flex rounded-xl overflow-hidden border border-orange-200 mb-6">
            {(['admin', 'teacher', 'student'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors ${
                  role === r
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-orange-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gray-700 text-sm font-medium">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="mt-1 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="border-gray-200 focus:border-orange-400 focus:ring-orange-400 pr-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="schoolCode" className="text-gray-700 text-sm font-medium">School Code</Label>
              <Input
                id="schoolCode"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                placeholder="Enter school code"
                className="mt-1 border-gray-200 focus:border-orange-400 focus:ring-orange-400"
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>

            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>

          {role === 'admin' && (
            <p className="text-xs text-gray-400 text-center mt-4">
              Default: username <span className="font-mono">admin</span> / password <span className="font-mono">admin123</span>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Built with ❤️ using{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            caffeine.ai
          </a>{' '}
          © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
