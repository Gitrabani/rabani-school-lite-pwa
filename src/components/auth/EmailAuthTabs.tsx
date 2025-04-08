
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const EmailAuthTabs: React.FC = () => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  
  return (
    <>
      {showLoginForm ? (
        <LoginForm onSwitchToSignup={() => setShowLoginForm(false)} />
      ) : (
        <SignupForm onSwitchToLogin={() => setShowLoginForm(true)} />
      )}
    </>
  );
};

export default EmailAuthTabs;
