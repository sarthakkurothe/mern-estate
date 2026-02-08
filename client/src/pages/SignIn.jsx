import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  signInStart,
  signInSuccess,
  signInFailure,
} from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import { toast } from 'react-toastify';

export default function SignIn() {
  const [formData, setFormData] = useState({});
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [mfaUserId, setMfaUserId] = useState(null);
  const [otp, setOtp] = useState('');

  const { loading } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  /* ================= SIGN IN ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      dispatch(signInStart());

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!result.success) {
        dispatch(signInFailure(result.error?.message));
        toast.error(result.error?.message || 'Login failed');
        return;
      }

      const data = result.data;

      // 🔐 MFA enabled → open OTP modal
      if (data.mfaRequired) {
        setMfaUserId(data.userId);
        setShowMfaModal(true);
        toast.info('Enter OTP to continue');
        return;
      }

      // ✅ Normal login
      dispatch(signInSuccess(data));
      toast.success('Signed in successfully');
      navigate('/');
    } catch (err) {
      dispatch(signInFailure(err.message));
      toast.error(err.message);
    }
  };

  /* ================= MFA VERIFY ================= */

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    try {
      dispatch(signInStart());

      const res = await fetch('/api/auth/mfa/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mfaUserId,
          token: otp,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        toast.error(result.error?.message || 'Invalid OTP');
        return;
      }

      dispatch(signInSuccess(result.data));
      toast.success('MFA verified. Logged in!');
      setShowMfaModal(false);
      setOtp('');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ================= UI ================= */

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl text-center font-semibold my-7'>
        Welcome back to Urban Estate!
      </h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          type='email'
          placeholder='Email'
          className='border p-3 rounded-lg'
          id='email'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='Password'
          className='border p-3 rounded-lg'
          id='password'
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80'
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>

        <OAuth />
      </form>

      <div className='flex gap-2 mt-5'>
        <p>Don't have an account?</p>
        <Link to='/sign-up'>
          <span className='text-blue-700'>Create your account</span>
        </Link>
      </div>

      {/* 🔐 MFA OTP MODAL */}
      {showMfaModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded-lg max-w-sm w-full'>
            <h2 className='text-lg font-semibold mb-4 text-center'>
              Enter MFA Code
            </h2>

            <input
              type='text'
              maxLength='6'
              placeholder='6-digit OTP'
              className='border p-3 rounded w-full text-center tracking-widest'
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ''))
              }
            />

            <button
              onClick={handleVerifyOtp}
              className='mt-4 w-full bg-slate-700 text-white p-3 rounded'
            >
              Verify
            </button>

            <button
              onClick={() => setShowMfaModal(false)}
              className='mt-2 w-full border p-2 rounded'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
