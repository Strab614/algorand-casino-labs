import React, { useEffect, useState } from "react";

import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  Link as MuiLink,
  ListItemButton,
  Collapse,
  ListSubheader,
} from "@mui/material";
import { Link } from "react-router-dom";

import { useAppDispatch } from "./hooks";
import { setIsWalletModalOpen } from "@/features/appSlice";

import LoopIcon from "@mui/icons-material/Loop";
import MenuIcon from "@mui/icons-material/Menu";
import StyleIcon from "@mui/icons-material/Style";
import FormatShapesIcon from "@mui/icons-material/FormatShapes";
import CasinoIcon from "@mui/icons-material/Casino";
import TableBarIcon from "@mui/icons-material/TableBar";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

import PriceTicker from "@/features/price/PriceTicker";

import { ellipseAddress, lookupNFDByAddress } from "@/utils/utils";

import AsaIcon from "@/components/AsaIcon";
import {
  CatchingPokemon,
  House,
  LocalActivity,
  Star,
  StarBorder,
} from "@mui/icons-material";

import { useWallet } from "@txnlab/use-wallet-react";
import { WalletPopover } from "./WalletPopover";
import AlgorandNetwork from "./NetworkSelect";
import { MockWalletButton } from "@/components/MockWalletButton";

const IS_MOCK_MODE = import.meta.env.VITE_MOCK_WALLET_MODE === 'true';

const WalletButton = () => {
  const dispatch = useAppDispatch();
  const { activeAddress, activeWallet } = useWallet();

  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const id = open ? "wallet-btn-popover" : undefined;

  // Show mock wallet button in mock mode
  if (IS_MOCK_MODE) {
    return <MockWalletButton />;
  }

  return (
    <>
      {activeAddress ? (
        <Box component={"div"}>
          <Button
            aria-describedby={id}
            variant="contained"
            color="primary"
            onClick={handleClick}
          >
            {ellipseAddress(activeAddress)}
          </Button>
          <WalletPopover
            activeAddress={activeAddress}
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            onDisconnect={() => {
              activeWallet?.disconnect();
              handleClose();
            }}
          />
        </Box>
      ) : (
        <Button
          variant="contained"
          color="primary"
          onClick={() => dispatch(setIsWalletModalOpen(true))}
        >
          Connect
        </Button>
      )}
    </>
  );
};

type NavigationLink = {
  name: string;
  to: string;
  icon: JSX.Element;
  children?: NavigationLink[];
};

const navigationLinks: NavigationLink[] = [
  {
    name: "Lottery",
    to: "/lottery",
    icon: <LocalActivity />,
  },
  {
    name: "House Staking",
    to: "/house",
    icon: <House />,
  },
  {
    name: "Leaderboard",
    to: "/leaderboard",
    icon: <Star />,
  },
  {
    name: "NFT Buyback",
    to: "/nftBuyback",
    icon: <FormatShapesIcon />,
  },
  {
    name: "Casino Refund",
    to: "/nftRefund",
    icon: <LoopIcon />,
  },
];

const drawerWidth = 240;

export interface Props {
  window?: () => Window;
  children: React.ReactNode;
}

export default function ResponsiveDrawer(props: Props) {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const { activeAddress } = IS_MOCK_MODE ? { activeAddress: null } : useWallet();
  const [nfd, setNFD] = useState<string>();

  const [isSidesheetOpen, setIsSidesheetOpen] = useState(false);

  const [isGamesOpen, setIsGamesOpen] = useState(false);

  const { window, children } = props;

  useEffect(() => {
    const doit = async () => {
      if (activeAddress && !IS_MOCK_MODE) {
        const name = await lookupNFDByAddress(activeAddress);
        if (name) {
          setNFD(name);
        }

        dispatch(setIsWalletModalOpen(false));
      }
    };
    if (!activeAddress) {
      if (nfd) {
        setNFD(undefined);
      }
      return;
    }

    doit();
  }, [activeAddress, dispatch, nfd]);

  const handleDrawerToggle = () => {
    setIsSidesheetOpen(!isSidesheetOpen);
  };

  const drawer = (
    <>
      <List
        component={"nav"}
        subheader={
          <ListSubheader
            component="div"
            id="nested-list-subheader"
            sx={{ backgroundColor: "#353535" }}
          >
            Navigation
          </ListSubheader>
        }
      >
        <Divider />
        <ListItem button onClick={() => setIsGamesOpen(!isGamesOpen)}>
          <ListItemIcon>
            <CasinoIcon />
          </ListItemIcon>
          <ListItemText primary="Games" />
          {isGamesOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={isGamesOpen} timeout="auto" unmountOnExit>
          <Link
            to={"/coinFlip"}
            key={"Coin Flip"}
            style={{
              textDecoration: "none",
              color: theme.palette.text.primary,
              fontWeight: "bold",
            }}
            onClick={() => setIsSidesheetOpen(false)}
          >
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <CatchingPokemon />
              </ListItemIcon>
              <ListItemText primary="Coin Flip" />
            </ListItemButton>
          </Link>
          <Link
            to={"/roulette"}
            key={"Roulette"}
            style={{
              textDecoration: "none",
              color: theme.palette.text.primary,
              fontWeight: "bold",
            }}
            onClick={() => setIsSidesheetOpen(false)}
          >
            <ListItemButton sx={{ pl: 4 }}>
              <ListItemIcon>
                <StarBorder />
              </ListItemIcon>
              <ListItemText primary="Roulette" />
            </ListItemButton>
          </Link>
          <ListItemButton sx={{ pl: 4 }} disabled={true}>
            <ListItemIcon>
              <StyleIcon />
            </ListItemIcon>
            <ListItemText primary="Blackjack" />
          </ListItemButton>
        </Collapse>
        {navigationLinks.map((item) => {
          return (
            <Link
              to={item.to}
              key={item.name}
              style={{
                textDecoration: "none",
                color: theme.palette.text.primary,
                fontWeight: "bold",
              }}
            >
              <ListItem button onClick={() => setIsSidesheetOpen(false)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItem>
            </Link>
          );
        })}
      </List>
      <Divider />
      <List>
        <MuiLink
          component="a"
          href="https://play.algo-casino.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            textDecoration: "none",
            color: theme.palette.text.primary,
            fontWeight: "bold",
          }}
        >
          <ListItem onClick={() => setIsSidesheetOpen(false)}>
            <ListItemIcon>
              <CasinoIcon />
            </ListItemIcon>
            <ListItemText primary="Casino" />
          </ListItem>
        </MuiLink>
        <MuiLink
          component="a"
          href="https://poker.algo-casino.com"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            textDecoration: "none",
            color: theme.palette.text.primary,
            fontWeight: "bold",
          }}
        >
          <ListItem onClick={() => setIsSidesheetOpen(false)}>
            <ListItemIcon>
              <TableBarIcon />
            </ListItemIcon>
            <ListItemText primary="Poker" />
          </ListItem>
        </MuiLink>
      </List>
      <Box
        component={"div"}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Divider />
        <Box
          component={"div"}
          sx={{
            display: "flex",
            justifyContent: "center",
            paddingBottom: 2,
            flexDirection: "column",
            alignItems: "center",
            columnGap: 2,
          }}
        >
          <AlgorandNetwork />
          <PriceTicker />
        </Box>
      </Box>
    </>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box component="div" sx={{ display: "flex" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
            <AsaIcon asaId={388592191} size={40} />
            <Typography
              variant="h6"
              color="text.primary"
              fontWeight={400}
              sx={{ display: { xs: "none", md: "block" }, paddingLeft: 1 }}
            >
              Algorand Casino
            </Typography>
          </div>
          <WalletButton />
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
        }}
        aria-label="nav drawer"
      >
        <Drawer
          container={container}
          variant="temporary"
          open={isSidesheetOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          PaperProps={{
            sx: { backgroundColor: "#353535" },
          }}
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}