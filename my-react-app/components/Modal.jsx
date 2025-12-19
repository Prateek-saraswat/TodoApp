import { useState, useEffect, useRef } from 'react';
import '../styles/Modal.css';

export default function AddUserModal({ showAddUserModal, setShowAddUserModal, handleAddUser, newUser, handleInputChange, errors }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !isSubmitting) {
        setShowAddUserModal(false);
      }
    };

    if (showAddUserModal) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [showAddUserModal, isSubmitting, setShowAddUserModal]);

  useEffect(() => {
    if (showAddUserModal && modalRef.current) {
      modalRef.current.classList.add('modal-enter');
    }
  }, [showAddUserModal]);

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, text: 'None', color: '#e0e0e0' };
    
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    const strength = [
      { text: 'Very Weak', color: '#ff4444' },
      { text: 'Weak', color: '#ff8800' },
      { text: 'Fair', color: '#ffbb33' },
      { text: 'Good', color: '#00C851' },
      { text: 'Strong', color: '#007E33' },
      { text: 'Very Strong', color: '#004d00' }
    ];
    
    return { score, ...strength[Math.min(score, 5)] };
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(newUser.password));
  }, [newUser.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleAddUser(e);
    setIsSubmitting(false);
  };

  const handleOverlayClick = (e) => {
    if (!isSubmitting && e.target === e.currentTarget) {
      setShowAddUserModal(false);
    }
  };

  if (!showAddUserModal) return null;

  return (
    <div
      className="add-user-modal-overlay"
      onClick={handleOverlayClick}
      ref={modalRef}
    >
      <div
        className="add-user-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="add-user-modal-header">
          <h2>Add New User</h2>
          <button
            className="add-user-close-modal"
            onClick={() => !isSubmitting && setShowAddUserModal(false)}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="add-user-modal-body">
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="fullName" className="required">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={newUser.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? "error" : ""}
                disabled={isSubmitting}
                autoFocus
                required
              />
              {errors.fullName && (
                <span className="error-message" role="alert">{errors.fullName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="required">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="john@example.com"
                value={newUser.email}
                onChange={handleInputChange}
                className={errors.email ? "error" : ""}
                disabled={isSubmitting}
                required
              />
              {errors.email && (
                <span className="error-message" role="alert">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="required">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter password (min. 8 characters)"
                  value={newUser.password}
                  onChange={handleInputChange}
                  className={errors.password ? "error" : ""}
                  disabled={isSubmitting}
                  required
                  minLength="8"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <span className="error-message" role="alert">{errors.password}</span>
              )}
              {newUser.password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div 
                      className="strength-fill" 
                      style={{
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <span 
                    className="strength-text"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="role" className="required">Role</label>
              <select
                id="role"
                name="role"
                value={newUser.role}
                onChange={handleInputChange}
                disabled={isSubmitting}
                required
              >
                <option value="User">User</option>
                <option value="Moderator">Moderator</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="role-description">
                {newUser.role === 'User' && '📱 Basic access to features'}
                {newUser.role === 'Moderator' && '🛡️ Can manage content and users'}
                {newUser.role === 'Admin' && '⚡ Full system administrator access'}
              </div>
            </div>

            <div className="form-group">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="sendWelcomeEmail"
                  name="sendWelcomeEmail"
                  checked={newUser.sendWelcomeEmail || false}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                <label htmlFor="sendWelcomeEmail">
                  ✉️ Send welcome email with login instructions
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setShowAddUserModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
                aria-label={isSubmitting ? "Adding user..." : "Add user"}
              >
                {isSubmitting ? 'Adding...' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}