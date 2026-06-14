import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../../store'
import SupplierFormModal from './SupplierFormModal'

function renderModal(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  render(
    <Provider store={store}>
      <SupplierFormModal open supplier={null} onClose={vi.fn()} onSubmit={onSubmit} />
    </Provider>,
  )
  return { onSubmit }
}

describe('SupplierFormModal', () => {
  it('hiển thị tiêu đề tạo mới', () => {
    renderModal()
    expect(screen.getByText('Thêm nhà cung cấp')).toBeInTheDocument()
  })

  it('chặn submit khi thiếu tên và không gọi onSubmit', async () => {
    const { onSubmit } = renderModal()
    fireEvent.click(screen.getByRole('button', { name: 'Thêm mới' }))

    expect(await screen.findByText('Vui lòng nhập tên NCC')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submit gọi onSubmit với tên đã trim', async () => {
    const { onSubmit } = renderModal()
    fireEvent.change(screen.getByPlaceholderText('VD: Công ty TNHH ABC'), {
      target: { value: '  NCC Test  ' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Thêm mới' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'NCC Test' }))
  })
})
