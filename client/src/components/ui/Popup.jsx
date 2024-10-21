import React from 'react'
import { Button, Modal, Box } from '@mui/material'; // If you're using Material-UI

const Popup = ({setNewFolderName,newFolderName,renameHandlerFolder,element,openToggler}) => {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
  
    const handleInputChange = (e) => {
      setNewFolderName(e.target.value);
    };
    const handleRename = (e) => {
        e.preventDefault();
        if (newFolderName.trim() === '') {
          alert('Folder name cannot be empty.');
          return;
        }
    
        // Call the renameHandlerFolder with the new folder name
        renameHandlerFolder(e, element, newFolderName);
    
        // Close the modal after renaming
        handleClose();
      };
    
  return (
    <div>
       <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <h2>Rename Folder</h2>
          <form onSubmit={handleRename}>
            <input
              type="text"
              placeholder="Enter new folder name"
              value={newFolderName}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '8px', marginBottom: '16px' }}
            />
            <Button type="submit" variant="contained" color="primary">
              Rename
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              style={{ marginLeft: '8px' }}
              onClick={handleClose}
            >
              Cancel
            </Button>
          </form>
        </Box>
      </Modal>
    </div>
  )
}

export default Popup
