import React, { useState, useEffect } from "react";
import axios from "axios";
import { gateWay } from "../constants";
import { useParams, useLocation } from "react-router-dom";
import ResponsiveAppBar from "../NavBar";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "react-loading-overlay";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import LoadingButton from "@mui/lab/LoadingButton";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/system";
import { TextField } from "@mui/material";
import "react-toastify/dist/ReactToastify.css";

import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { BorderRightRounded } from "@mui/icons-material";

const Mint = () => {
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
  const { ipfs } = useParams();
  const { state } = useLocation();
  const { artist_ } = state;
  const [artist, setArtist] = useState(artist_);

  const [isLoading, setIsLoading] = useState(true);

  const [metadataValues, setMetadataValues] = React.useState(null);
  const [client, setClient] = React.useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const values = await axios.get(`${gateWay}` + ipfs);

        setMetadataValues(values.data);
        setIsLoading(false);
      } catch (e) {
        toast(
          "Something went wrong, please try to refresh the page or try again later",
          { type: "error" }
        );
        console.log("error", e);
      }
    }
    fetchData();
  }, [ipfs]);

  function handleChangeClient(event) {
    setClient(event.target.value);
  }

  const [loading, setLoading] = useState(false);

  const [connectionError, setConnectionError] = useState(null);
  function handleMint(e) {
    e.preventDefault();
    console.log(artist?.contract);
    if (artist?.contract) {
      mintNFT(client, ipfs);
    } else {
      console.log("no contract");
      toast("Please Loggin, with a validated account", { type: "error" });
    }
  }

  const mintNFT = async (client, metadata) => {
    const metadataURL = `ipfs://${metadata}`;
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let NFTsValue = ethers.utils.parseEther(String(CONFIG.DISPLAY_COST));

    let totalGasLimit = String(gasLimit);

    const abiResponse = await fetch("/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();

    const { ethereum } = window;

    const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    console.log(metamaskIsInstalled, "meta");
    if (metamaskIsInstalled) {
      const provider = new ethers.providers.Web3Provider(ethereum);

      try {
        const networkId = await ethereum.request({
          method: "net_version",
        });

        //console.log(networkId, CONFIG.NETWORK.ID);

        if (networkId == CONFIG.NETWORK.ID) {
          //console.log("test");

          const signer = await provider.getSigner();

          setConnectionError("");
          try {
            setLoading(true);

            const Mintcontract2 = new ethers.Contract(
              artist.contract,
              new ethers.utils.Interface(abi),
              signer
            );

            let tx;
            tx = await Mintcontract2.mint(client, metadataURL);

            setConnectionError(
              "Your transaction has been submited it is now being proccesed"
            );
            setConnectionError("Your NFT has been minted! ");
            setLoading(false);
          } catch (e) {
            setConnectionError(
              " Something when wrong when trying to mint, please try again later"
            );
            setLoading(false);

            console.log("error.... ", e);
          }
        } else {
          console.log("Please connect your Wallet to the correct Network");
          toast("Please connect your Wallet to the correct Network", {
            type: "error",
          });
        }
      } catch (e) {
        toast(
          " Something when wrong when trying to mint, please try again later",
          {
            type: "error",
          }
        );
        console.log(e);
      }
    } else {
      toast("Metamask is not installed, please install metamask", {
        type: "error",
      });
    }
  };
  return (
    <>
      <LoadingOverlay
        active={isLoading}
        spinner
        text="Loading your NFT final version..."
      >
        <ResponsiveAppBar artist={artist} setArtist={setArtist} />

        {
          <Box
            sx={{
              marginTop: "20px",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {
              <Card sx={{ maxWidth: 345, margin: 2 }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Preview of the NFT{" "}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    This are the final image and metadata of your NFT, once you
                    click mint and send it will be stored in the Blockchain
                    forever.
                  </Typography>

                  <CardMedia
                    sx={{ margin: "4px", borderRadius: "5px" }}
                    component="img"
                    alt="NFT Image"
                    height="200"
                    src={gateWay + metadataValues?.image.split("ipfs://")[1]}
                    image={gateWay + metadataValues?.image.split("ipfs://")[1]}
                  />
                  <Typography gutterBottom variant="h7" component="span">
                    Name
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metadataValues?.name}
                  </Typography>
                  <Typography gutterBottom variant="h7" component="div">
                    Description{" "}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metadataValues?.description}
                  </Typography>

                  <Typography gutterBottom variant="h7" component="div">
                    Attributes{" "}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metadataValues?.attributes?.map((x) => (
                      <div>
                        <div>
                          {" "}
                          {x?.trait_type} : {x?.value}{" "}
                        </div>
                      </div>
                    ))}{" "}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      alignContent: "space-around",
                    }}
                  >
                    <TextField
                      onChange={handleChangeClient}
                      required
                      margin="normal"
                      id="outlined-required"
                      label="Client Address"
                      size="small"
                    />{" "}
                    <LoadingButton
                      onClick={(e) => handleMint(e)}
                      type="submit"
                      variant="contained"
                      color="secondary"
                      sx={{ margin: "4px" }}
                      /*  loading={true} */
                    >
                      Mint
                    </LoadingButton>{" "}
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="label"
                    >
                      {" "}
                      <input hidden accept="image/*" type="file" />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            }
          </Box>
        }
      </LoadingOverlay>
    </>
  );
};

export default Mint;
