const vi = {
  common: {
    appName: 'Quản Lý Đơn Hàng',
    appDescription: 'Hệ thống quản lý đơn hàng',
    save: 'Lưu thay đổi',
    cancel: 'Huỷ',
  },

  auth: {
    login: {
      title: 'Chào mừng trở lại',
      subtitle: 'Đăng nhập vào tài khoản của bạn',
      email: 'Email',
      password: 'Mật khẩu',
      forgotPassword: 'Quên mật khẩu?',
      submit: 'Đăng nhập',
      footerText: 'Chưa có tài khoản?',
      footerLink: 'Đăng ký ngay',
      error: 'Đăng nhập thất bại. Vui lòng kiểm tra lại.',
    },
    register: {
      title: 'Tạo tài khoản',
      subtitle: 'Đăng ký để bắt đầu sử dụng',
      name: 'Họ tên',
      nameOptional: '(tuỳ chọn)',
      namePlaceholder: 'Nguyễn Văn A',
      email: 'Email',
      password: 'Mật khẩu',
      passwordPlaceholder: 'Tối thiểu 6 ký tự',
      confirmPassword: 'Nhập lại mật khẩu',
      confirmPlaceholder: 'Nhập lại mật khẩu',
      submit: 'Đăng ký',
      footerText: 'Đã có tài khoản?',
      footerLink: 'Đăng nhập',
      mismatch: 'Mật khẩu không khớp',
      error: 'Đăng ký thất bại.',
    },
  },

  nav: {
    dashboard: 'Dashboard',
    changePassword: 'Đổi mật khẩu',
    logout: 'Đăng xuất',
    logoutConfirmTitle: 'Đăng xuất?',
    logoutConfirmDesc: 'Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?',
    logoutConfirm: 'Đăng xuất',
    logoutCancel: 'Huỷ',
  },

  dashboard: {
    title: 'Dashboard',
    subtitle: 'Tổng quan tài khoản của bạn',
    accountInfo: 'Thông tin tài khoản',
    id: 'ID',
    email: 'Email',
  },

  changePassword: {
    title: 'Đổi mật khẩu',
    subtitle: 'Cập nhật mật khẩu để bảo mật tài khoản của bạn',
    sectionTitle: 'Thông tin mật khẩu',
    currentPassword: 'Mật khẩu hiện tại',
    currentPlaceholder: 'Nhập mật khẩu hiện tại',
    newPassword: 'Mật khẩu mới',
    newPlaceholder: 'Nhập mật khẩu mới',
    confirmPassword: 'Xác nhận mật khẩu mới',
    confirmPlaceholder: 'Nhập lại mật khẩu mới',
    submit: 'Lưu thay đổi',
    success: 'Đổi mật khẩu thành công!',
    error: 'Đổi mật khẩu thất bại.',
    mismatch: 'Mật khẩu không khớp',
    tipsTitle: 'Lưu ý bảo mật',
    tips: [
      'Không chia sẻ mật khẩu với bất kỳ ai',
      'Dùng kết hợp chữ hoa, chữ thường và số',
      'Tránh dùng thông tin cá nhân như ngày sinh',
      'Đổi mật khẩu định kỳ để tăng bảo mật',
    ],
  },

  strength: {
    weak: 'Yếu',
    medium: 'Trung bình',
    fair: 'Khá',
    strong: 'Mạnh',
    minLength: 'Tối thiểu 6 ký tự',
    uppercase: 'Có chữ hoa',
    number: 'Có chữ số',
  },
} as const

export default vi
