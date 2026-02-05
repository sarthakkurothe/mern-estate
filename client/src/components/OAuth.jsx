import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess, signInFailure, signInStart } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      dispatch(signInStart());

      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);
      const result = await signInWithPopup(auth, provider);

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });

      const response = await res.json();

      if (!response.success) {
        dispatch(signInFailure(response.error?.message));
        toast.error(response.error?.message || 'Google sign-in failed');
        return;
      }

      // 🔐 MFA required (rare but supported)
      if (response.data.mfaRequired) {
        toast.info('Please complete MFA verification using email login');
        navigate('/sign-in');
        return;
      }

      dispatch(signInSuccess(response.data));
      toast.success('Signed in with Google');
      navigate('/');
    } catch (error) {
      dispatch(signInFailure(error.message));
      toast.error('Could not sign in with Google');
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type='button'
      className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95'
    >
      Continue with Google
    </button>
  );
}
