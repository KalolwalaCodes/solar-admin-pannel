import React, { useEffect, useState } from 'react';
import Alert from '@mui/joy/Alert';
import AspectRatio from '@mui/joy/AspectRatio';
import IconButton from '@mui/joy/IconButton';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import LinearProgress from '@mui/joy/LinearProgress';
import Typography from '@mui/joy/Typography';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';

export default function AlertInvertedColors({ msg }) {
  const [open, setOpen] = useState(false); // state to control visibility
  console.log(msg);
  
  useEffect(() => {
    if(msg.split(',')&&msg.split(',')[0].length>3)
    setOpen(true);

    const timer = setTimeout(() => {
      setOpen(false);
    }, 3000); // Set to false after 3 seconds

    return () => clearTimeout(timer); // Cleanup timeout on unmount or when `msg` changes
  }, [msg]);

  const handleClose = () => {
    setOpen(false); // close the alert when the close button is clicked
  };

  if (!open) return null; // do not render the Alert if it's closed

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '20px', // adjust as needed for positioning
        right: '20px', // adjust as needed for positioning
        zIndex: 1000,  // ensure it appears on top of other elements
      }}
    >
      <Alert
        size="lg"
        color="success"
        variant="solid"
        invertedColors
        startDecorator={
          <AspectRatio
            variant="solid"
            ratio="1"
            sx={{
              minWidth: 40,
              borderRadius: '50%',
              boxShadow: '0 2px 12px 0 rgb(0 0 0/0.2)',
            }}
          >
            <div>
              <Check fontSize="xl2" />
            </div>
          </AspectRatio>
        }
        endDecorator={
          <IconButton
            variant="plain"
            onClick={handleClose} // close the alert on click
            sx={{
              '--IconButton-size': '32px',
              transform: 'translate(0.5rem, -0.5rem)',
            }}
          >
            <Close />
          </IconButton>
        }
        sx={{
          alignItems: 'flex-start',
          overflow: 'hidden',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          minWidth: '300px',
        }}
      >
        <div>
          <Typography level="title-lg">Success</Typography>
          <Typography level="body-sm">{msg.split(',')[0].length&&msg.split(',')[0]}</Typography>
        </div>
        <LinearProgress
          variant="solid"
          color="success"
          value={40}
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
          }}
        />
      </Alert>
    </Box>
  );
}
