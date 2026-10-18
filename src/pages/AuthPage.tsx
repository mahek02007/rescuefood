import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Leaf,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const AuthPage: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign up form state
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('donor');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!loginEmail.trim()) errs.email = 'Email address is required.';
    if (!loginPassword.trim()) errs.password = 'Password is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
      showToast('Welcome back!', 'Successfully signed into FoodRescue.', 'success');
      navigate('/');
    } catch (err: any) {
      showToast('Login Failed', err.message || 'Invalid email or password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required.';
    if (!signupEmail.trim() || !signupEmail.includes('@')) errs.signupEmail = 'Valid email is required.';
    if (!phone.trim()) errs.phone = 'Phone number is required.';
    if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!termsAccepted) errs.terms = 'You must accept the terms & conditions.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name,
        email: signupEmail,
        phone,
        organization,
        role,
        password,
      });

      showToast('Account Created!', `Welcome to FoodRescue. Your ${role} account is ready.`, 'success');
      navigate('/');
    } catch (err: any) {
      showToast('Registration Failed', err.message || 'Could not create account.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsForgotModalOpen(false);
    showToast('Password Reset Link Sent', `Check inbox at ${forgotEmail} for reset instructions.`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8F8F2] flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto bg-white rounded-3xl shadow-xl border border-[#E5EAE7] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">

        {/* LEFT SECTION: Brand & Environmental Impact */}
        <div className="lg:col-span-5 bg-[#245C45] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Organic background shapes */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#6FAF78]/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[#F4A261]/20 blur-3xl pointer-events-none" />

          {/* Brand header */}
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Leaf className="w-5 h-5 text-[#6FAF78]" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight font-heading">
                Food<span className="text-[#6FAF78]">Rescue</span>
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#F4A261]" />
              Sustainable Redistribution
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading leading-tight tracking-tight text-white mb-4">
              Good Food.<br />Great Impact.
            </h2>

            <p className="text-sm text-white/80 leading-relaxed max-w-sm">
              Rescue surplus food. Feed communities. Build a sustainable future where no edible meal is lost to a landfill.
            </p>
          </div>

          {/* Food photo card */}
          <div className="relative z-10 my-6 rounded-2xl overflow-hidden border border-white/20 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=700"
              alt="Community Meal Distribution"
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
              <p className="text-xs font-bold text-white leading-tight">
                "Over 18,400 meals rescued across Metropolis this month."
              </p>
              <span className="text-[10px] text-white/70 mt-0.5">Real-time localized surplus routing</span>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-2 pt-4 border-t border-white/15 text-center">
            <div>
              <div className="text-lg sm:text-xl font-black text-[#F4A261] font-heading">18.4K+</div>
              <div className="text-[10px] text-white/70 uppercase font-semibold">Meals Rescued</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-white font-heading">38+</div>
              <div className="text-[10px] text-white/70 uppercase font-semibold">Donors</div>
            </div>
            <div>
              <div className="text-lg sm:text-xl font-black text-[#6FAF78] font-heading">28</div>
              <div className="text-[10px] text-white/70 uppercase font-semibold">Verified NGOs</div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Auth Forms */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-[#E5EAE7] pb-4 mb-6">
              <button
                onClick={() => { setMode('login'); setErrors({}); }}
                className={`text-base font-bold pb-2 relative transition-all ${
                  mode === 'login'
                    ? 'text-[#245C45] border-b-2 border-[#245C45]'
                    : 'text-[#8E9F96] hover:text-[#25312B]'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setErrors({}); }}
                className={`text-base font-bold pb-2 relative transition-all ${
                  mode === 'signup'
                    ? 'text-[#245C45] border-b-2 border-[#245C45]'
                    : 'text-[#8E9F96] hover:text-[#25312B]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#25312B] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#8E9F96] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@organization.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20 focus:border-[#245C45]"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#25312B] mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8E9F96] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-sm text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20 focus:border-[#245C45]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E9F96] hover:text-[#25312B]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[#53645B]">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#245C45] focus:ring-[#245C45]"
                    />
                    <span>Remember me on this device</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(true)}
                    className="text-[#245C45] font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#245C45] hover:bg-[#1B4534] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#245C45]/20 flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Sign In to FoodRescue</span>
                  <ArrowRight className="w-4 h-4 text-[#6FAF78]" />
                </button>

                <p className="text-center text-xs text-[#8E9F96] pt-1">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setErrors({}); }}
                    className="text-[#245C45] font-semibold hover:underline"
                  >
                    Create one for free
                  </button>
                </p>
              </form>
            ) : (
              /* SIGN UP FORM */
              <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    />
                    {errors.name && <p className="text-[10px] text-red-600 mt-0.5">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@organization.com"
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    />
                    {errors.signupEmail && (
                      <p className="text-[10px] text-red-600 mt-0.5">{errors.signupEmail}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    />
                    {errors.phone && <p className="text-[10px] text-red-600 mt-0.5">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">
                      Organization / Business
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Your restaurant or NGO name"
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    />
                  </div>
                </div>

                {/* Role selection */}
                <div>
                  <label className="block text-xs font-bold text-[#25312B] mb-1.5">
                    Select Your Platform Role *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { role: 'donor' as UserRole, label: 'Food Donor', desc: 'Hotel / Restaurant' },
                      { role: 'ngo' as UserRole, label: 'NGO / Recipient', desc: 'Kitchen / Shelter' },
                      { role: 'volunteer' as UserRole, label: 'Volunteer', desc: 'Dispatch Courier' },
                    ].map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setRole(item.role)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          role === item.role
                            ? 'bg-[#EBF5ED] border-[#245C45] text-[#245C45] font-bold shadow-xs'
                            : 'bg-white border-[#E5EAE7] text-[#53645B] hover:bg-[#F8F8F2]'
                        }`}
                      >
                        <span className="text-xs block">{item.label}</span>
                        <span className="text-[10px] text-[#8E9F96] font-normal block">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">Password *</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    />
                    {errors.password && (
                      <p className="text-[10px] text-red-600 mt-0.5">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#25312B] mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-3 py-2 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
                    />
                    {errors.confirmPassword && (
                      <p className="text-[10px] text-red-600 mt-0.5">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="text-xs">
                  <label className="flex items-start gap-2 cursor-pointer text-[#53645B]">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded text-[#245C45] focus:ring-[#245C45]"
                    />
                    <span>
                      I agree to the FoodRescue Terms of Service, Privacy Policy, and Food Safety Code.
                    </span>
                  </label>
                  {errors.terms && <p className="text-[10px] text-red-600 mt-1">{errors.terms}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#245C45] hover:bg-[#1B4534] text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#245C45]/20 flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>Create Account &amp; Join the Mission</span>
                  <CheckCircle2 className="w-4 h-4 text-[#6FAF78]" />
                </button>

                <p className="text-center text-xs text-[#8E9F96]">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setErrors({}); }}
                    className="text-[#245C45] font-semibold hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              </form>
            )}
          </div>

          <div className="pt-4 text-center text-xs text-[#8E9F96]">
            By continuing, you agree to our Food Donation Integrity Guidelines &amp; Community Standards.
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#E5EAE7]">
            <h4 className="font-bold text-base text-[#25312B] mb-2 font-heading">Reset Password</h4>
            <p className="text-xs text-[#53645B] mb-4">
              Enter your registered email address and we'll send a password recovery link.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full px-3.5 py-2.5 bg-[#F8F8F2] border border-[#E5EAE7] rounded-xl text-xs text-[#25312B] focus:outline-none focus:ring-2 focus:ring-[#245C45]/20"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-[#53645B] hover:bg-[#F8F8F2] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#245C45] text-white text-xs font-bold rounded-xl hover:bg-[#1B4534]"
                >
                  Send Recovery Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
