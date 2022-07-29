import React, { useState, useEffect } from "react";
import "./App.css";
import { ethers } from "ethers";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import { toast, ToastContainer } from "react-toastify";

import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";

const LoggIn = ({ artist, setArtist }) => {
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    MAX_MINTING_VALUE: 0,
  });

  const getConfig = async () => {
    const configResponse = await fetch("/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    const itoAccount = localStorage.getItem("itoAccount");
    console.log(itoAccount);
    /*  if (itoAccount) {
      setArtist(itoAccount);
    } */
  }, []);

  const [connectionError, setConnectionError] = useState("");
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenUserMenu = (event) => {
    if (!!artist) {
      setAnchorElUser(event.currentTarget);
    } else {
      connect();
    }
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const connect = async () => {
    const metamaskIsInstalled = window.ethereum && window.ethereum.isMetaMask;
    const { ethereum } = window;
    if (metamaskIsInstalled) {
      try {
        const networkId = await ethereum.request({
          method: "net_version",
        });

        if (networkId == CONFIG.NETWORK.ID) {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);

          //console.log(selectedAcounts[0]);
          setArtist(accounts[0]);
          localStorage.setItem("itoAccount", accounts[0]);
        } else
          toast("Please connect to the correct Network", { type: "error" });
      } catch (e) {
        console.log("error ", e);
      }
    } else {
      toast(" Metmask is not installed, please install metamask", {
        type: "error",
      });
    }
  };

  const logOut = async () => {
    setArtist(null);
    localStorage.removeItem("itoAccount");
  };

  const settings = [
    { name: "Account", action: connect },
    { name: "Logout", action: logOut },
  ];

  return (
    <div>
      <ToastContainer />
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Typography sx={{ color: "white" }}>
              {artist
                ? artist?.slice(0, 5) + "..." + artist?.slice(-5)
                : "Connect Wallet"}
            </Typography>
            <Avatar alt="Remy Sharp" src="/images/wallet.png" />
          </IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: "45px" }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          {settings.map((setting) => (
            <MenuItem key={setting.name} onClick={handleCloseUserMenu}>
              <Typography onClick={setting.action} textAlign="center">
                {setting.name}
              </Typography>
            </MenuItem>
          ))}
        </Menu>
      </Box>
      {/* {artist ? (
        <>
          <div>
            {" "}
            <div style={{ display: "flex" }}>
              <h4>Artist </h4>
              <div>{artist?.artist}</div>
              <h4>Account </h4>
              <div>{artist?.address}</div>
              <h4>Contract </h4>
              <div>{artist?.contract}</div>
            </div>
          </div>
          <button onClick={() => logOut()}>{"LogOut"}</button>
        </>
      ) : (
        <button
          onClick={() => {
            connect();
            console.log(artist);
          }}
        >
          {"Connect Wallet"}
        </button>
      )} */}
    </div>
  );
};

export default LoggIn;
