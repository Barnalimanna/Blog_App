import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    password: '',
    confirmPassword: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);


useEffect(() => {
  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();

      setFormData({
        username: data.username,
        email: data.email,
        bio: data.bio || '',
        password: '',
        confirmPassword: '',
      });

      if (data.avatar?.url) {
        setPreview(data.avatar.url);
       } else {
  setPreview(null);
}
    } catch (error) {
      console.log('Fetch profile error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to fetch profile');
    }
  };

  fetchProfile();
}, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('bio', formData.bio);
      if (formData.password) {
        data.append('password', formData.password);
      }
      if (avatar) {
        data.append('avatar', avatar);
      }

    // const response = await updateProfile(data);
    // console.log('updateProfile response:', response.data);

const response = await updateProfile(data);

const updatedUser = { ...user, ...response.data };
// login(updatedUser, user?.token);
login(updatedUser, response.data.token);

// if (response.data.avatar) {
//   if (typeof response.data.avatar === 'string') {
//     setPreview(response.data.avatar);
//   } else if (response.data.avatar.url) {
//     setPreview(response.data.avatar.url);
//   }
// }
if (response.data.avatar?.url) {
  setPreview(response.data.avatar.url);
}


toast.success('Profile updated successfully!');
    
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  return (
    <div className="profile-page container">
      <h1>My Profile</h1>

      <div className="profile-card">
        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div className="avatar-section">
            <div className="avatar-preview">
              {preview ? (
                <img src={preview} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {formData.username?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} id="avatar-input" />
            <label htmlFor="avatar-input" className="avatar-label">
              Change Avatar
            </label>
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="4"
              placeholder="Tell us about yourself..."
            />
          </div>

          <hr className="divider" />

          <h3>Change Password</h3>
          <p className="hint">Leave blank to keep current password</p>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter new password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;