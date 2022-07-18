import React, { useState, useEffect } from "react";
import "./App.css";
import { ethers } from "ethers";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";

import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";

const LoggIn = ({ artist, setArtist }) => {
  const [contract, setContract] = useState(null);

  const [account, setAccount] = useState("");
  const [NFTsupply, setNFTsupply] = useState("");
  const [connectionError, setConnectionError] = useState("");
  const [anchorElNav, setAnchorElNav] = React.useState(null);
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

  const contracts = [
    {
      artist: "Andres",
      address: "0x9282396A80076D8f5a2FC3744b510D99BB524b1b",
      contract: "0xd3304ae95F09B605a8B1888cC995C13f436491f3",
    },
  ];

  const connect = async () => {
    const abiResponse = await fetch("/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();

    const interface_ = new ethers.utils.Interface(abi);

    const metamaskIsInstalled = window.ethereum && window.ethereum.isMetaMask;
    if (metamaskIsInstalled) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);

        const selectedAcounts = contracts.filter((x) => {
          return x.address.toLowerCase() == accounts[0].toLowerCase();
        });
        if (selectedAcounts.length >= 1) {
          //console.log(selectedAcounts[0]);
          setArtist(selectedAcounts[0]);
          setContract(selectedAcounts[0].contract);
          localStorage.setItem(
            "itoAccount",
            JSON.stringify(selectedAcounts[0])
          );
        }
      } catch (e) {
        console.log("error ", e);
      }
    } else {
      setConnectionError(" Metmask is not installed, please install metamask");
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
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Typography sx={{ color: "white" }}>
              {artist
                ? artist?.address.slice(0, 5) +
                  "..." +
                  artist?.address.slice(-5)
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