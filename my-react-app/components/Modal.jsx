import { useState } from 'react';

export default function AddUserModal({ showAddUserModal, setShowAddUserModal, handleAddUser, newUser, handleInputChange, errors }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleAddUser(e);
    setIsSubmitting(false);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { class: '', text: '' };
    if (password.length < 5) return { class: 'weak', text: 'Weak' };
    if (password.length < 8) return { class: 'medium', text: 'Medium' };
    return { class: 'strong', text: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(newUser.password);

  if (!showAddUserModal) return null;

  return (
    <div
      className="modal-overlay"
      onClick={() => !isSubmitting && setShowAddUserModal(false)}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Add New User</h2>
          <button
            className="close-modal"
            onClick={() => !isSubmitting && setShowAddUserModal(false)}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName" className="required">Full Name</label>
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
            />
            {errors.fullName && (
              <span className="error-message">{errors.fullName}</span>
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
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="required">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Enter password"
                value={newUser.password}
                onChange={handleInputChange}
                className={errors.password ? "error" : ""}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            {newUser.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div className={`strength-fill ${passwordStrength.class}`}></div>
                </div>
                <span className="strength-text">{passwordStrength.text}</span>
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
            >
              <option value="User">User</option>
              <option value="Moderator">Moderator</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="role-description">
              {newUser.role === 'User' && 'Basic access to features'}
              {newUser.role === 'Moderator' && 'Can manage content and users'}
              {newUser.role === 'Admin' && 'Full system administrator access'}
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
                Send welcome email
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
            >
              {isSubmitting ? '' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}