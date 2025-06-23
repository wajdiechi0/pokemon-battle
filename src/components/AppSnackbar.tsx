'use client'

import { Snackbar, Alert, AlertColor } from '@mui/material'

interface AppSnackbarProps {
  open: boolean
  message: string
  severity: AlertColor
  onClose: () => void
}

export default function AppSnackbar({ open, message, severity, onClose }: AppSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={2500}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
} 