import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { toast } from 'react-toastify';
import './Auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await resetPassword(token, password);

      toast.success('Password reset successful');

      navigate('/login');

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Reset failed'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <h2>Reset Password</h2>
        <p>Enter your new password</p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>New Password</label>

            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />

          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
          >
            {loading
              ? 'Resetting...'
              : 'Reset Password'}
          </button>

        </form>

      </div>
    </div>
  );
};

export default ResetPassword;