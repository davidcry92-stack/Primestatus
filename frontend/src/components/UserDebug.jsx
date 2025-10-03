import React from 'react';

const UserDebug = ({ user }) => {
  // Only show in development or for debugging
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>User Debug Info:</h4>
      <div>User exists: {user ? '✅' : '❌'}</div>
      {user && (
        <>
          <div>Email: {user.email}</div>
          <div>Username: {user.username}</div>
          <div>Membership Tier: {user.membershipTier || user.membership_tier}</div>
          <div>Is Verified: {user.is_verified ? '✅' : '❌'}</div>
          <div>Verification Status: {user.verification_status}</div>
          <div>Role: {user.role}</div>
          <details>
            <summary>Full User Object:</summary>
            <pre style={{ fontSize: '10px' }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
        </>
      )}
    </div>
  );
};

export default UserDebug;