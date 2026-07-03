import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Premium black
      light: '#222222',
      dark: '#000000',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#4f46e5', // Royal Indigo for links/special highlights
      light: '#6366f1',
      dark: '#3730a3',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAFAFB', // Soft clean background
      paper: '#ffffff', // Clean white containers
    },
    text: {
      primary: '#0F0F14', // Deep Charcoal
      secondary: '#6E7280', // Slate gray
      disabled: '#9CA3AF',
    },
    divider: '#E5E7EB', // Soft gray lines
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
      color: '#0F0F14',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0F0F14',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#0F0F14',
    },
    h4: {
      fontWeight: 600,
      color: '#0F0F14',
    },
    h5: {
      fontWeight: 600,
      color: '#0F0F14',
    },
    h6: {
      fontWeight: 600,
      color: '#0F0F14',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 6, // Crisp edges like Urban Company
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#000000',
          color: '#ffffff',
          '&:hover': {
            backgroundColor: '#222222',
          },
        },
        outlinedPrimary: {
          borderColor: '#000000',
          color: '#000000',
          '&:hover': {
            borderColor: '#000000',
            backgroundColor: 'rgba(0,0,0,0.04)',
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#9CA3AF',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#000000',
          },
        },
        notchedOutline: {
          borderColor: '#E5E7EB',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.02)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0F0F14',
          borderBottom: '1px solid #E5E7EB',
        },
      },
    },
  },
});

export default theme;
