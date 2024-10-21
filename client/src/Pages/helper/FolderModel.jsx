import React, { useState } from 'react';
import { Modal, Box, TextField, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const RenameFolderPopup = ({ showEditToggler, setShowEditToggler, renameHandlerFolder, element }) => {
  const [newFolderName, setNewFolderName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    renameHandlerFolder(e, element, newFolderName);
    setShowEditToggler(false); // Close the popup after submission
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setShowEditToggler(false); // Close the popup when cancel is clicked
  };

  return (
    <Modal open={showEditToggler} onClose={handleClose}>
      <Box
        className="bg-white p-6 rounded-lg shadow-lg"
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '400px',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Rename Folder</h2>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </div>

          <TextField
            label="New Folder Name"
            variant="outlined"
            fullWidth
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            required
            className="mt-4"
          />

          <div className="flex justify-end mt-6 space-x-4">
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!newFolderName}
            >
              Submit
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Box>
    </Modal>
  );
};

export default RenameFolderPopup;
