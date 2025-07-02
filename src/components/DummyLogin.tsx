import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { useAppDispatch } from '@/app/hooks';
import { addNotification } from '@/features/appSlice';

interface DummyLoginProps {
  open: boolean;
  onClose: () => void;
  onLogin: (credentials: { username: string; password: string; isAdmin: boolean }) => void;
}

/**
 * Dummy login component for testing purposes
 * This can be commented out in production
 */
export const DummyLogin: React.FC<DummyLoginProps> = ({ open, onClose, onLogin }) => {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = () => {
    if (!username || !password) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please enter both username and password',
      }));
      return;
    }

    // Simulate login
    onLogin({ username, password, isAdmin });
    
    dispatch(addNotification({
      type: 'success',
      message: `Logged in as ${username}${isAdmin ? ' (Admin)' : ''}`,
    }));

    // Reset form
    setUsername('');
    setPassword('');
    setIsAdmin(false);
    onClose();
  };

  const fillTestCredentials = () => {
    setUsername('testuser');
    setPassword('password123');
  };

  const fillAdminCredentials = () => {
    setUsername('admin');
    setPassword('admin123');
    setIsAdmin(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h5">Dummy Login (Testing Only)</Typography>
        <Typography variant="body2" color="text.secondary">
          This is a test login for development purposes
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Alert severity="info">
            This is a dummy login system for testing. In production, this would be replaced 
            with proper authentication.
          </Alert>

          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            variant="outlined"
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            variant="outlined"
          />

          <FormControlLabel
            control={
              <Switch
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
              />
            }
            label="Login as Admin"
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={fillTestCredentials}
            >
              Fill Test User
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={fillAdminCredentials}
            >
              Fill Admin
            </Button>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleLogin} 
          variant="contained"
          disabled={!username || !password}
        >
          Login
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DummyLogin;