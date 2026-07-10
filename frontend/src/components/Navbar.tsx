import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const authContext = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Close the dropdown if the user clicks outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Generate initials for the avatar
  const userInitials = authContext?.user?.name
    ? authContext.user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>
        Weekly Report Generator
      </div>
      
      <div style={styles.profileContainer} ref={dropdownRef}>
        <div style={styles.avatar} onClick={toggleDropdown} title="Profile Menu">
          {userInitials}
        </div>

        {dropdownOpen && (
          <div style={styles.dropdown}>
            <div style={styles.userInfo}>
              <p style={styles.userName}>{authContext?.user?.name || 'User'}</p>
              <p style={styles.userEmail}>{authContext?.user?.email}</p>
              <span style={styles.userRole}>{authContext?.user?.role}</span>
            </div>
            <hr style={styles.divider} />
            <button style={styles.logoutBtn} onClick={authContext?.logout}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

// Isolated basic inline styles for Navbar component
const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 1000,
    borderBottom: '1px solid #e5e7eb',
    fontFamily: 'sans-serif',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#111827',
  },
  profileContainer: {
    position: 'relative' as const,
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 600,
    cursor: 'pointer',
    userSelect: 'none' as const,
    boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
  },
  dropdown: {
    position: 'absolute' as const,
    top: '120%',
    right: 0,
    backgroundColor: 'white',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    borderRadius: '8px',
    width: '240px',
    padding: '0.5rem 0',
    border: '1px solid #e5e7eb',
  },
  userInfo: {
    padding: '1rem',
    textAlign: 'left' as const,
  },
  userName: {
    margin: 0,
    fontWeight: 600,
    fontSize: '0.875rem',
    color: '#111827',
  },
  userEmail: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  userRole: {
    display: 'inline-block',
    marginTop: '0.5rem',
    padding: '0.2rem 0.6rem',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #e5e7eb',
    margin: '0.5rem 0',
  },
  logoutBtn: {
    width: '100%',
    textAlign: 'left' as const,
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  }
};

export default Navbar;
