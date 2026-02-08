import { useSelector, useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  signOutUserStart,
} from '../redux/user/userSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Profile() {
  const fileRef = useRef(null);
  const dispatch = useDispatch();
  const { currentUser, loading } = useSelector((state) => state.user);

  // existing states
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

  // MFA states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [mfaAction, setMfaAction] = useState(null);
  const [showMfaSetupModal, setShowMfaSetupModal] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [otp, setOtp] = useState('');
  const [mfaError, setMfaError] = useState('');

  /* ================= IMAGE UPLOAD ================= */

  useEffect(() => {
    if (file) handleFileUpload(file);
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      () => {
        setFileUploadError(true);
        toast.error('Image upload failed');
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  /* ================= PROFILE UPDATE ================= */

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (!result.success) {
        dispatch(updateUserFailure(result.error.message));
        toast.error(result.error.message);
        return;
      }

      dispatch(updateUserSuccess(result.data));
      setUpdateSuccess(true);
      toast.success('Profile updated successfully');
    } catch (err) {
      dispatch(updateUserFailure(err.message));
      toast.error(err.message);
    }
  };

  /* ================= MFA LOGIC ================= */

  const openEnableMfa = () => {
    setMfaAction('enable');
    setShowConfirmModal(true);
  };

  const openDisableMfa = () => {
    setMfaAction('disable');
    setShowConfirmModal(true);
  };

  const handleConfirmMfaAction = async () => {
    setShowConfirmModal(false);

    if (mfaAction === 'enable') {
      try {
        const res = await fetch('/api/auth/mfa/setup', { method: 'POST' });
        const result = await res.json();

        if (!result.success) {
          setMfaError(result.error.message);
          toast.error(result.error.message);
          return;
        }

        setQrCode(result.data.qrCode);
        setShowMfaSetupModal(true);
      } catch (err) {
        setMfaError(err.message);
        toast.error(err.message);
      }
    }

    if (mfaAction === 'disable') {
      try {
        const res = await fetch('/api/auth/mfa/disable', { method: 'POST' });
        const result = await res.json();

        if (!result.success) {
          setMfaError(result.error.message);
          toast.error(result.error.message);
          return;
        }

        dispatch(
          updateUserSuccess({
            ...currentUser,
            isMfaEnabled: false,
          })
        );
        toast.success('MFA disabled successfully');
      } catch (err) {
        setMfaError(err.message);
        toast.error(err.message);
      }
    }
  };

  const handleVerifyMfa = async () => {
    if (otp.length !== 6) {
      setMfaError('OTP must be 6 digits');
      toast.error('OTP must be 6 digits');
      return;
    }

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: otp }),
      });

      const result = await res.json();

      if (!result.success) {
        setMfaError(result.error.message);
        toast.error(result.error.message);
        return;
      }

      dispatch(
        updateUserSuccess({
          ...currentUser,
          isMfaEnabled: true,
        })
      );

      toast.success('MFA enabled successfully');
      setShowMfaSetupModal(false);
      setQrCode(null);
      setOtp('');
      setMfaError('');
    } catch (err) {
      setMfaError(err.message);
      toast.error(err.message);
    }
  };

  /* ================= ACCOUNT ACTIONS ================= */

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!data.success) {
        dispatch(deleteUserFailure(data.error.message));
        toast.error(data.error.message);
        return;
      }
      dispatch(deleteUserSuccess(data));
      toast.success('Account deleted successfully');
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
      toast.error(err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      await fetch('/api/auth/signout');
      dispatch(deleteUserSuccess());
      toast.success('Signed out successfully');
    } catch (err) {
      dispatch(deleteUserFailure(err.message));
      toast.error(err.message);
    }
  };

  /* ================= LISTINGS ================= */

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (!data.success) {
        setShowListingsError(true);
        toast.error('Failed to load listings');
        return;
      }
      setUserListings(data.data);
    } catch {
      setShowListingsError(true);
      toast.error('Failed to load listings');
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      await fetch(`/api/listing/delete/${listingId}`, { method: 'DELETE' });
      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
      toast.success('Listing deleted');
    } catch {
      toast.error('Failed to delete listing');
    }
  };

  /* ================= UI ================= */

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>My Profile</h1>

      {/* MFA BOX */}
      <div
        className={`p-4 rounded-lg mb-6 ${currentUser.isMfaEnabled
          ? 'bg-green-100 border border-green-400'
          : 'bg-red-100 border border-red-400'
          }`}
      >
        <div className='flex justify-between items-center'>
          <p className='font-semibold'>
            {currentUser.isMfaEnabled
              ? 'Multi-Factor Authentication is enabled'
              : 'Your account is not protected with MFA'}
          </p>
          <button
            onClick={
              currentUser.isMfaEnabled ? openDisableMfa : openEnableMfa
            }
            className='px-4 py-2 rounded bg-slate-700 text-white'
          >
            {currentUser.isMfaEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded-lg max-w-sm w-full'>
            <h2 className='text-lg font-semibold mb-4'>
              {mfaAction === 'enable'
                ? 'Enable MFA?'
                : 'Disable MFA?'}
            </h2>
            <p className='mb-4'>
              {mfaAction === 'enable'
                ? 'You will need an authenticator app to log in.'
                : 'This will reduce your account security.'}
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setShowConfirmModal(false)}
                className='border px-4 py-2 rounded'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMfaAction}
                className='bg-slate-700 text-white px-4 py-2 rounded'
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MFA SETUP MODAL */}
      {showMfaSetupModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
          <div className='bg-white p-6 rounded-lg max-w-sm w-full'>
            <h2 className='text-lg font-semibold mb-4'>Set up MFA</h2>

            {qrCode && (
              <img src={qrCode} alt='QR Code' className='mx-auto mb-4' />
            )}

            <input
              type='text'
              maxLength='6'
              placeholder='Enter OTP'
              className='border p-3 rounded w-full text-center'
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ''))
              }
            />

            {mfaError && (
              <p className='text-red-600 mt-2'>{mfaError}</p>
            )}

            <button
              onClick={handleVerifyMfa}
              className='mt-4 w-full bg-slate-700 text-white p-3 rounded'
            >
              Verify & Enable
            </button>
          </div>
        </div>
      )}

      {/* PROFILE FORM */}
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type='file'
          ref={fileRef}
          hidden
          accept='image/*'
        />
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />

        <input
          type='text'
          defaultValue={currentUser.username}
          id='username'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='email'
          defaultValue={currentUser.email}
          id='email'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />
        <input
          type='password'
          placeholder='Password'
          id='password'
          className='border p-3 rounded-lg'
          onChange={handleChange}
        />

        <button
          disabled={loading}
          className='bg-slate-700 text-white p-3 rounded-lg uppercase'
        >
          {loading ? 'Loading...' : 'Update'}
        </button>

        <Link
          className='bg-green-700 text-white p-3 rounded-lg text-center'
          to='/create-listing'
        >
          Create Listing
        </Link>
      </form>

      <div className='flex justify-between mt-5'>
        <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>
          Delete my account
        </span>
        <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>

      <button onClick={handleShowListings} className='text-green-700 w-full mt-6'>
        Show my Listings
      </button>

      {userListings.length > 0 &&
        userListings.map((listing) => (
          <div key={listing._id} className='border p-3 mt-3 flex justify-between'>
            <p>{listing.name}</p>
            <button
              onClick={() => handleListingDelete(listing._id)}
              className='text-red-700'
            >
              Delete
            </button>
          </div>
        ))}
    </div>
  );
}
