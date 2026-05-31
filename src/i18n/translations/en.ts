const en = {
  common: {
    appName: 'Order Manager',
    appDescription: 'Order management system',
    save: 'Save changes',
    cancel: 'Cancel',
  },

  auth: {
    login: {
      title: 'Welcome back',
      subtitle: 'Sign in to your account',
      email: 'Email',
      password: 'Password',
      forgotPassword: 'Forgot password?',
      submit: 'Sign in',
      footerText: "Don't have an account?",
      footerLink: 'Sign up',
      error: 'Login failed. Please check your credentials.',
    },
    register: {
      title: 'Create an account',
      subtitle: 'Sign up to get started',
      name: 'Full name',
      nameOptional: '(optional)',
      namePlaceholder: 'John Doe',
      email: 'Email',
      password: 'Password',
      passwordPlaceholder: 'At least 6 characters',
      confirmPassword: 'Confirm password',
      confirmPlaceholder: 'Re-enter password',
      submit: 'Sign up',
      footerText: 'Already have an account?',
      footerLink: 'Sign in',
      mismatch: 'Passwords do not match',
      error: 'Registration failed.',
    },
  },

  nav: {
    dashboard: 'Dashboard',
    changePassword: 'Change password',
    logout: 'Log out',
    logoutConfirmTitle: 'Log out?',
    logoutConfirmDesc: 'Are you sure you want to log out of your account?',
    logoutConfirm: 'Log out',
    logoutCancel: 'Cancel',
  },

  dashboard: {
    title: 'Dashboard',
    subtitle: 'Overview of your account',
    accountInfo: 'Account information',
    id: 'ID',
    email: 'Email',
  },

  changePassword: {
    title: 'Change password',
    subtitle: 'Update your password to keep your account secure',
    sectionTitle: 'Password details',
    currentPassword: 'Current password',
    currentPlaceholder: 'Enter current password',
    newPassword: 'New password',
    newPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm new password',
    confirmPlaceholder: 'Re-enter new password',
    submit: 'Save changes',
    success: 'Password changed successfully!',
    error: 'Failed to change password.',
    mismatch: 'Passwords do not match',
    tipsTitle: 'Security tips',
    tips: [
      'Never share your password with anyone',
      'Use a mix of uppercase, lowercase and numbers',
      'Avoid personal information like your birthday',
      'Change your password regularly for better security',
    ],
  },

  strength: {
    weak: 'Weak',
    medium: 'Medium',
    fair: 'Fair',
    strong: 'Strong',
    minLength: 'At least 6 characters',
    uppercase: 'Uppercase letter',
    number: 'Number',
  },
} as const

export default en
