import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, reset } from '../store/slices/authSlice';
import { AlertCircle, Lock, Mail, Heart } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate('/');
    dispatch(reset());
  }, [user, navigate, dispatch]);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="page-shell relative overflow-hidden">
      <div className="wave-bg" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 pt-20">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center">
            <div className="mb-5 inline-flex rounded-full bg-white/90 p-4 shadow-[0_20px_40px_-20px_rgba(214,120,172,0.8)] ring-1 ring-pink-100">
              <Heart className="fill-pink-500 text-pink-500" size={34} />
            </div>
            <h2 className="section-title text-3xl text-[color:var(--ink)]">Welcome back</h2>
            <p className="mt-2 text-sm font-medium text-[color:var(--muted)]">
              Status: <span className="font-semibold text-rose-500">Logged out</span>
            </p>
          </div>

          <div className="soft-card rounded-[2rem] p-7 sm:p-8">
            {isError && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
                <AlertCircle size={18} />
                <p>{message}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={onSubmit}>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-pink-400">
                  <Mail size={18} />
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="soft-input"
                  placeholder="Email address"
                  value={email}
                  onChange={onChange}
                />
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-pink-400">
                  <Lock size={18} />
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="soft-input"
                  placeholder="Password"
                  value={password}
                  onChange={onChange}
                />
              </div>

              <button type="submit" disabled={isLoading} className="soft-button disabled:cursor-not-allowed disabled:opacity-70">
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[color:var(--muted)]">
              Need an account?{' '}
              <Link to="/register" className="ml-1 font-semibold text-pink-500 hover:text-pink-600">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
