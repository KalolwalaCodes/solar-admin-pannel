import * as React from 'react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Breadcrumbs from '@mui/joy/Breadcrumbs';
import Link from '@mui/joy/Link';
import Typography from '@mui/joy/Typography';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import OrderTable from './components/OrderTable';
import OrderList from './components/OrderList';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import InvestorsRelation from './Pages/InverstorRelation';
import Sustainability from './Pages/Sustainability';
import Products from './Pages/Products';
import ContactUs from './Pages/ContactUs';
import NewsAndMedia from './Pages/NewsAndMedia';
import CommitteeTable from './Pages/Commities';
import UserManagement from './Pages/Settings';
import BoardOfDirector from './Pages/BoardOfDirector';
import RevenueExpenseManager from './Pages/Chartdata';
import AnnouncementDummy from './Pages/DummyDrag';
import DefenseProducts from './Pages/DefenseProducts';
import IndustrialProducts from './Pages/IndustrialProducts';
import ShareholdersValues from './Pages/SharerholdersValues';

export default function JoyOrderDashboardTemplate({handleLogout}) {
  const [activePage,setActivePage]=React.useState("Investor-relation");
  return (
    <CssVarsProvider disableTransitionOnChange>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
        <Header />
        <div  className='top-0 bg-red-500 fixed'>
       <Sidebar handleLogout={handleLogout} setActivePage={setActivePage} />
      </div>

        
        <Box
          component="main"
          className="MainContent"
          sx={{
            
            marginLeft:"18%",
            px: { xs: 2, md: 6 },
            pt: {
              xs: 'calc(12px + var(--Header-height))',
              sm: 'calc(12px + var(--Header-height))',
              md: 3,
            },
            pb: { xs: 2, sm: 2, md: 3 },
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            height: '100dvh',
            gap: 1,
            
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Breadcrumbs
              size="sm"
              aria-label="breadcrumbs"
              separator={<ChevronRightRoundedIcon fontSize="sm" />}
              sx={{ pl: 0 }}
            >
              <Link
                underline="none"
                color="neutral"
                href="#some-link"
                aria-label="Home"
              >
                <HomeRoundedIcon />
              </Link>
              <Link
                underline="hover"
                color="neutral"
                href="#some-link"
                sx={{ fontSize: 12, fontWeight: 500 }}
              >
                Dashboard
              </Link>
              <Typography color="primary" sx={{ fontWeight: 500, fontSize: 12 }}>
             { activePage}
              </Typography>
            </Breadcrumbs>
          </Box>
          <Box
            sx={{
              display: 'flex',
              mb: 1,
              gap: 1,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'start', sm: 'center' },
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <Typography level="h2" component="h1">
              {activePage}
            </Typography>
            {/* <Button
              color="primary"
              startDecorator={<DownloadRoundedIcon />}
              size="sm"
            >
              Download PDF
            </Button> */}
          </Box>
          {
            activePage==="Investor-relation"&&<InvestorsRelation/>
          }
          {
            activePage==="Sustainability"&&<Sustainability/>
          }
          {
            activePage==="Product"&&<Products/>
          }
          {
            activePage==="Contact-us"&&<ContactUs/>
          }
          {
            activePage==="News-and-media"&&<NewsAndMedia/>
          }
          {
            activePage==="Committees"&&<CommitteeTable/>
          }
          {
          activePage === "Settings" &&<UserManagement  />
          }
          {
          activePage === "Board of Directors" &&<BoardOfDirector  />
          }
          {
          activePage === "Industrial Products" &&<IndustrialProducts />
          }
          {
           activePage === "Defence Products" &&<DefenseProducts  />
          }
          {
          activePage === "RevenueExpenseManager" &&<RevenueExpenseManager  />
          }
          {
          activePage === "Document-Sequencing" &&<AnnouncementDummy  />
          }
          {
          activePage === "shareHolderValue" &&<ShareholdersValues/>
          }

          {/* <OrderTable />*/}
          {/* <OrderList />  */}
        </Box>
      </Box>
    </CssVarsProvider>
  );
}