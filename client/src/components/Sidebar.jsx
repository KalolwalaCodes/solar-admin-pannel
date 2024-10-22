import * as React from "react"
import GlobalStyles from "@mui/joy/GlobalStyles"
import Avatar from "@mui/joy/Avatar"
import Box from "@mui/joy/Box"
import Divider from "@mui/joy/Divider"
import IconButton from "@mui/joy/IconButton"
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import List from "@mui/joy/List"
import { red } from '@mui/material/colors';
import ListItem from "@mui/joy/ListItem"
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton"
import ListItemContent from "@mui/joy/ListItemContent"
import Typography from "@mui/joy/Typography"
import Sheet from "@mui/joy/Sheet"
import RecyclingIcon from '@mui/icons-material/Recycling';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import SupportRoundedIcon from "@mui/icons-material/SupportRounded"
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded"
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded"
import BrightnessAutoRoundedIcon from "@mui/icons-material/BrightnessAutoRounded"
import ColorSchemeToggle from "./ColorSchemeToggle"
import { closeSidebar } from "../utils"

function Toggler({ defaultExpanded = false, renderToggle, children }) {
  const [open, setOpen] = React.useState(defaultExpanded)
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={[
          {
            display: "grid",
            transition: "0.2s ease",
            "& > *": {
              overflow: "hidden"
            }
          },
          open ? { gridTemplateRows: "1fr" } : { gridTemplateRows: "0fr" }
        ]}
      >
        {children}
      </Box>
    </React.Fragment>
  )
}

export default function Sidebar({setActivePage,handleLogout}) {
const [selectedItem,setSelectedItem]=React.useState(1);
  const changePageRoutingView=(newRoute,id)=>{
    setActivePage(newRoute);
    setSelectedItem(id);
  }
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: { xs: "fixed", md: "sticky" },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none"
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 10000,
        height: "100dvh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        borderRight: "1px solid",
        borderColor: "divider"
      }}
    >
      <GlobalStyles
        styles={theme => ({
          ":root": {
            "--Sidebar-width": "220px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px"
            }
          }
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs:
              "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)"
          }
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <IconButton variant="soft"  size="sm">
          <BrightnessAutoRoundedIcon />
        </IconButton>
        <Typography level="title-lg"><img src="./icons/solarlogo.png" alt="" /></Typography>
        <ColorSchemeToggle  sx={{ ml: "auto" ,color:"red"}} />
      </Box>
      {/* <Input
        size="sm"
        startDecorator={<SearchRoundedIcon />}
        placeholder="Search"
      /> */}
      <Box
      className="mt-10"
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5
          }
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": theme => theme.vars.radius.sm
          }}
        >
          <ListItem>
            <ListItemButton selected={selectedItem===1} onClick={()=>changePageRoutingView("Investor-relation",1)}>
              <AccountBalanceIcon />
              <ListItemContent>
                <Typography level="title-sm">Investor Relation</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton selected={selectedItem===2} onClick={()=>changePageRoutingView("Sustainability",2)}>
              <RecyclingIcon />
              <ListItemContent>
                <Typography level="title-sm">Sustainability</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

        
          <ListItem>
            <ListItemButton selected={selectedItem===3} onClick={()=>changePageRoutingView("News-and-media",3)}>
              {/* <MenuIcon /> */}
              <img className="w-[17px]" src="./newsIcons.svg" alt="" />
              <ListItemContent>
                <Typography level="title-sm"> News & Media</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton selected={selectedItem===4} onClick={()=>changePageRoutingView("Committees",4)}>
              {/* <MenuIcon /> */}
              <img className="w-[17px]" src="./newsIcons.svg" alt="" />
              <ListItemContent>
                <Typography level="title-sm">Committees</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton selected={selectedItem===5} onClick={()=>changePageRoutingView("Contact-us",5)}>
              <ConnectWithoutContactIcon />
              <ListItemContent>
                <Typography level="title-sm">Contact us</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

        </List>
        <List
          size="sm"
          sx={{
            mt: "auto",
            flexGrow: 0,
            "--ListItem-radius": theme => theme.vars.radius.sm,
            "--List-gap": "8px",
            mb: 2
          }}
        >
          <ListItem>
            <ListItemButton>
              <SupportRoundedIcon />
              Support
            </ListItemButton>
          </ListItem>
          <ListItem>
            <ListItemButton selected={selectedItem===6} onClick={()=>changePageRoutingView("Settings",6)}>
              <ConnectWithoutContactIcon />
              <ListItemContent>
                <Typography level="title-sm">Settings</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
        {/* <Card
          invertedColors
          variant="soft"
          color="warning"
          size="sm"
          sx={{ boxShadow: "none" }}
        >
          <Stack
            direction="row"
            sx={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography level="title-sm">Used space</Typography>
            <IconButton size="sm">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Typography level="body-xs">
            Your team has used 80% of your available space. Need more?
          </Typography>
          <LinearProgress
            variant="outlined"
            value={80}
            determinate
            sx={{ my: 1 }}
          />
          <Button size="sm" variant="solid">
            Upgrade plan
          </Button>
        </Card> */}
      </Box>
      <Divider />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <Avatar
          variant="solid"
          sx={{ bgcolor: red[600]}}
          
          size="sm"
          src="./icons/brand-logo.svg"
         
        />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography level="title-sm">Admin Solargroup</Typography>
          {/* <Typography level="body-xs">admin@solargroup.com</Typography> */}
        </Box>
        <IconButton size="sm" variant="plain" color="neutral">
          <LogoutRoundedIcon onClick={handleLogout} />
        </IconButton>
      </Box>
    </Sheet>
  )
}