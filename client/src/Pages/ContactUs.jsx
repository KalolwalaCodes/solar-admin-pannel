/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from 'react';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Chip from '@mui/joy/Chip';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Checkbox from '@mui/joy/Checkbox';
import IconButton, { iconButtonClasses } from '@mui/joy/IconButton';
import Typography from '@mui/joy/Typography';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import Dropdown from '@mui/joy/Dropdown';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import DeleteIcon from '@mui/icons-material/Delete';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}
const roleIS = localStorage.getItem('role');

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function RowMenu({ onDelete }) {
  return (
    <Dropdown>
      <MenuButton
        slots={{ root: IconButton }}
        slotProps={{ root: { variant: 'plain', color: 'neutral', size: 'sm' } }}
      >
        <MoreHorizRoundedIcon />
      </MenuButton>
      <Menu size="sm" sx={{ minWidth: 140 }}>
        <MenuItem>Edit</MenuItem>
        <MenuItem>Download</MenuItem>
        <Divider />
        <MenuItem color="danger" onClick={onDelete}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Dropdown>
  );
}

export default function ContactUs() {
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [filters, setFilters] = useState({
    companyname: '',
    email: '',
    queryType: '', // Updated filters state
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Define Query Type options
  const queryTypeOptions = {
    '1': 'Purchase',
    '2': 'Marketing',
    '3': 'Investor Relations',
    '4': 'Export',
    '5': 'Employment',
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contacts, filters, searchTerm]);

  const fetchContacts = async () => {
    try {
      const response = await fetch('http://localhost:8000/admin-panel/contact-us');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setContacts(data);
      setFilteredContacts(data); // Initialize filteredContacts
      console.log('Fetched Contacts:', data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleDelete = async (id) => {
    console.log(id, "delete triggered");
    try {
      const response = await fetch(`http://localhost:8000/admin-panel/contact-us/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setContacts((prev) => prev.filter((contact) => contact.id !== id));
        console.log(`Contact with id ${id} deleted successfully.`);
      } else {
        console.error('Failed to delete contact');
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...contacts];

    console.log('Applying Filters:', filters);
    console.log('Initial Contacts Count:', filtered.length);

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(
        (contact) =>
          (contact.Name && contact.Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (contact.Email && contact.Email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (contact.CompanyName && contact.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      console.log('After Search Filter:', filtered.length);
    }

    // Apply Company Name Filter
    if (filters.companyname) {
      filtered = filtered.filter(
        (contact) =>
          contact.CompanyName &&
          contact.CompanyName.toLowerCase().includes(filters.companyname.toLowerCase())
      );
      console.log('After Company Name Filter:', filtered.length);
    }

    // Apply Email Filter
    if (filters.email) {
      filtered = filtered.filter(
        (contact) =>
          contact.Email &&
          contact.Email.toLowerCase().includes(filters.email.toLowerCase())
      );
      console.log('After Email Filter:', filtered.length);
    }

    // Apply Query Type Filter
    if (filters.queryType) {
      filtered = filtered.filter(
        (contact) =>
          contact.QueryType &&
          contact.QueryType.toLowerCase() === filters.queryType.toLowerCase()
      );
      console.log('After Query Type Filter:', filtered.length);
    }

    setFilteredContacts(filtered);
    console.log('Final Filtered Contacts Count:', filtered.length);
  };

  const renderFilters = () => (
    <React.Fragment>
      <FormControl size="sm">
        <FormLabel>Company Name</FormLabel>
        <Input
          size="sm"
          placeholder="Filter by company name"
          value={filters.companyname}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, companyname: e.target.value }))
          }
        />
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Email</FormLabel>
        <Input
          size="sm"
          placeholder="Filter by email"
          value={filters.email}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, email: e.target.value }))
          }
        />
      </FormControl>
      {/* Query Type Dropdown */}
      <FormControl size="sm">
        <FormLabel>Query Type</FormLabel>
        <Select
          size="sm"
          placeholder="All"
          value={filters.queryType}
          onChange={(event, value) =>
            setFilters((prev) => ({ ...prev, queryType: value }))
          }
          sx={{ width: '100%' }}
        >
          <Option value="">All</Option>
          {Object.entries(queryTypeOptions).map(([value, label]) => (
            <Option key={value} value={label}>
              {label}
            </Option>
          ))}
        </Select>
      </FormControl>
    </React.Fragment>
  );

  return (
   
    (roleIS === 'superadmin' || roleIS === 'admin') ?
    <React.Fragment>
      {/* Search and Filters for Mobile */}
      <Sheet
        className="SearchAndFilters-mobile"
        sx={{ display: { xs: 'flex', sm: 'none' }, my: 1, gap: 1 }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        <IconButton
          size="sm"
          variant="outlined"
          color="neutral"
          onClick={() => setOpen(true)}
        >
          <FilterAltIcon />
        </IconButton>
        <Modal open={open} onClose={() => setOpen(false)}>
          <ModalDialog aria-labelledby="filter-modal" layout="fullscreen">
            <ModalClose />
            <Typography id="filter-modal" level="h2">
              Filters
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Sheet sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {renderFilters()}
              <Button color="primary" onClick={() => setOpen(false)}>
                Apply Filters
              </Button>
            </Sheet>
          </ModalDialog>
        </Modal>
      </Sheet>

      {/* Search and Filters for Tablet and Up */}
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          borderRadius: 'sm',
          py: 2,
          display: { xs: 'none', sm: 'flex' },
          flexWrap: 'wrap',
          gap: 1.5,
          '& > *': {
            minWidth: { xs: '120px', md: '160px' },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search</FormLabel>
          <Input
            size="sm"
            placeholder="Search"
            startDecorator={<SearchIcon />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </FormControl>
        {renderFilters()}
      </Box>

      {/* Contact Us Table */}
      <Sheet
        className="ContactUsTableContainer"
        variant="outlined"
        sx={{
          width: '100%',
          borderRadius: 'sm',
          flexShrink: 1,
          overflow: 'auto',
          minHeight: 0,
          mt: 2,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            '--TableCell-headBackground': 'var(--joy-palette-background-level1)',
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground': 'var(--joy-palette-background-level1)',
            '--TableCell-paddingY': '4px',
            '--TableCell-paddingX': '8px',
          }}
        >
          <thead>
            <tr>
              <th style={{ width: 48, textAlign: 'center', padding: '12px 6px' }}>
                <Checkbox
                  size="sm"
                  indeterminate={
                    selected.length > 0 && selected.length !== filteredContacts.length
                  }
                  checked={selected.length === filteredContacts.length}
                  onChange={(event) => {
                    setSelected(
                      event.target.checked
                        ? filteredContacts.map((contact) => contact.id)
                        : []
                    );
                  }}
                  color={
                    selected.length > 0 || selected.length === filteredContacts.length
                      ? 'primary'
                      : undefined
                  }
                  sx={{ verticalAlign: 'text-bottom' }}
                />
              </th>
              <th style={{ width: 150, padding: '12px 6px' }}>
                <Link
                  underline="none"
                  color="primary"
                  component="button"
                  onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
                  endDecorator={<ArrowDropDownIcon />}
                  sx={[
                    {
                      fontWeight: 'lg',
                      '& svg': {
                        transition: '0.2s',
                        transform:
                          order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                      },
                    },
                    order === 'desc'
                      ? { '& svg': { transform: 'rotate(0deg)' } }
                      : { '& svg': { transform: 'rotate(180deg)' } },
                  ]}
                >
                  Name
                </Link>
              </th>
              <th style={{ width: 200, padding: '12px 6px' }}>Company Name</th>
              <th style={{ width: 200, padding: '12px 6px' }}>Email</th>
              <th style={{ width: 200, padding: '12px 6px' }}>Query Type</th> {/* New Column */}
              <th style={{ width: 300, padding: '12px 6px' }}>Message</th>
              <th style={{ width: 150, padding: '12px 6px' }}>Phone</th> {/* Correct Property */}
              <th style={{ width: 250, padding: '12px 6px' }}>Address</th> {/* Correct Property */}
              <th style={{ width: 250, padding: '12px 6px' }}>File</th>
              <th style={{ width: 100, padding: '12px 6px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length > 0 ? (
              [...filteredContacts]
                .sort(getComparator(order, 'Name'))
                .map((contact) => (
                  <tr key={contact.id}>
                    <td style={{ textAlign: 'center', width: 48 }}>
                      <Checkbox
                        size="sm"
                        checked={selected.includes(contact.id)}
                        color={selected.includes(contact.id) ? 'primary' : undefined}
                        onChange={(event) => {
                          setSelected((ids) =>
                            event.target.checked
                              ? ids.concat(contact.id)
                              : ids.filter((itemId) => itemId !== contact.id)
                          );
                        }}
                        slotProps={{ checkbox: { sx: { textAlign: 'left' } } }}
                        sx={{ verticalAlign: 'text-bottom' }}
                      />
                    </td>
                    <td style={{ width: 150 }}>
                      <Typography level="body-xs">{contact.Name}</Typography>
                    </td>
                    <td style={{ width: 200 }}>
                      <Typography level="body-xs">{contact.CompanyName}</Typography>
                    </td>
                    <td style={{ width: 200 }}>
                      <Typography level="body-xs">{contact.Email}</Typography>
                    </td>
                    <td style={{ width: 200 }}>
                      <Typography level="body-xs">{contact.QueryType}</Typography> {/* Correct Property */}
                    </td>
                    <td style={{ width: 300 }}>
                      <Typography level="body-xs">{contact.Message}</Typography>
                    </td>
                    <td style={{ width: 150 }}>
                      <Typography level="body-xs">{contact.Phone}</Typography> {/* Correct Property */}
                    </td>
                    <td style={{ width: 250 }}>
                      <Typography level="body-xs">{contact.Address}</Typography> {/* Correct Property */}
                    </td>
                    <td style={{ width: 250 }}>
                      {contact.FileLink ? (
                        <Link
                          href={contact.FileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download File
                        </Link>
                      ) : (
                        'No File'
                      )}
                    </td>
                    <td style={{ width: 100 }}>
                      <RowMenu onDelete={() => handleDelete(contact.id)} />
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', padding: '20px' }}>
                  No contacts found.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Sheet>

      {/* Pagination (Optional) */}
      <Box
        className="Pagination-laptopUp"
        sx={{
          pt: 2,
          gap: 1,
          [`& .${iconButtonClasses.root}`]: { borderRadius: '50%' },
          display: {
            xs: 'none',
            md: 'flex',
          },
        }}
      >
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={<KeyboardArrowLeftIcon />}
        >
          Previous
        </Button>

        <Box sx={{ flex: 1 }} />
        {['1', '2', '3', '…', '8', '9', '10'].map((page) => (
          <IconButton
            key={page}
            size="sm"
            variant={Number(page) ? 'outlined' : 'plain'}
            color="neutral"
          >
            {page}
          </IconButton>
        ))}
        <Box sx={{ flex: 1 }} />
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          endDecorator={<KeyboardArrowRightIcon />}
        >
          Next
        </Button>
      </Box>
    </React.Fragment>
            : <div className='text-xl mt-4'> You are restricted to view this</div>

  
  );
}
