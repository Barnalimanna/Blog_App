import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/api';
import { toast } from 'react-toastify';
import './Auth.css';

const ResetPassword = () => {
  const [password, setPassword] = useState('');

  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await resetPassword(token, password);

      toast.success('Password reset successful');

      navigate('/login');
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Reset failed'
      );
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit}>
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          required
        />

        <button type="submit">
          Reset Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;