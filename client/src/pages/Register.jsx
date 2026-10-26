import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset } from '../store/slices/authSlice';
import { AlertCircle, Lock, Mail, User, Phone, Heart } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const { name, email, phone, password } = formData;
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
    dispatch(register(formData));
  };

  return (
    <div className="page-shell relative overflow-hidden">
      <div className="wave-bg" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 pb-10 pt-20">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 text-center">
            <div className="mb-5 inline-flex rounded-full bg-white/90 p-4 shadow-[0_20px_40px_-20px_rgba(214,120,172,0.8)] ring-1 ring-pink-100">
              <Heart className="fill-pink-500 text-pink-500" size={34} />
            </div>
            <h2 className="section-title text-3xl text-[color:var(--ink)]">Create account</h2>
            <p className="mt-2 text-sm font-medium text-[color:var(--muted)]">Join your support circle</p>
          </div>

          <div className="soft-card rounded-[2rem] p-7 sm:p-8">
            {isError && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600 ring-1 ring-rose-100">
                <AlertCircle size={18} />
                <p>{message}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="space-y-3">
                {[
                  { name: 'name', icon: User, type: 'text', placeholder: 'Full name' },
                  { name: 'email', icon: Mail, type: 'email', placeholder: 'Email address' },
                  { name: 'phone', icon: Phone, type: 'text', placeholder: 'Phone number' },
                  { name: 'password', icon: Lock, type: 'password', placeholder: 'Password' }
                ].map((field) => (
                  <div key={field.name} className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-pink-400">
                      <field.icon size={18} />
                    </div>
                    <input
                      name={field.name}
                      type={field.type}
                      required
                      className="soft-input"
                      placeholder={field.placeholder}
                      value={formData[field.name]}
                      onChange={onChange}
                    />
                  </div>
                ))}
              </div>

              <button type="submit" disabled={isLoading} className="soft-button mt-2 disabled:cursor-not-allowed disabled:opacity-70">
                {isLoading ? 'Creating account...' : 'Register now'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-[color:var(--muted)]">
              Already have an account?{' '}
              <Link to="/login" className="ml-1 font-semibold text-pink-500 hover:text-pink-600">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
