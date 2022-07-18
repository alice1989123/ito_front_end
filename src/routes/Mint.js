import React, { useState, useEffect } from "react";
import axios from "axios";
import { gateWay } from "../constants";
import { useParams, useLocation } from "react-router-dom";
import ResponsiveAppBar from "../NavBar";
import { ethers } from "ethers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingOverlay from "react-loading-overlay";

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
      const values = await axios.get(`${gateWay}` + ipfs);

      setMetadataValues(values.data);
      setIsLoading(false);
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
    console.log(client);
    mintNFT(client, ipfs);
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
        const accounts = await provider.send("eth_requestAccounts", []);
        const networkId = await ethereum.request({
          method: "net_version",
        });

        //console.log(networkId, CONFIG.NETWORK.ID);

        if (networkId == CONFIG.NETWORK.ID) {
          //console.log("test");

          const signer = await provider.getSigner();
          const Mintcontract1 = new ethers.Contract(
            artist.contract,
            new ethers.utils.Interface(abi),
            signer
          );
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
          setConnectionError(
            "Please connect your Wallet to the correct Network"
          );
        }
      } catch (e) {
        setConnectionError(
          " Something when wrong when trying to mint, please try again later"
        );
        console.log(e);
      }
    } else {
      setConnectionError(" Metmask is not installed, please install metamask");
    }
  };
  return (
    <>
      <ResponsiveAppBar artist={artist} setArtist={setArtist} />
      <LoadingOverlay
        active={isLoading}
        spinner
        text="Loading your NFT final version..."
      >
        {!isLoading && (
          <div>
            {metadataValues && (
              <>
                <h3> Preview </h3>
                <h4> Name </h4>
                <div>{metadataValues?.name}</div>
                <h4> Description </h4>
                <div>{metadataValues?.description}</div>
                <h4> Image </h4>{" "}
                {metadataValues?.image && (
                  <img
                    width={400}
                    src={gateWay + metadataValues?.image.split("ipfs://")[1]}
                  ></img>
                )}
                <h4> Attributes </h4>
                {metadataValues?.attributes?.map((x) => (
                  <div>
                    <div>
                      {" "}
                      {x?.trait_type} : {x?.value}{" "}
                    </div>
                  </div>
                ))}
                Client Address
                <input onChange={(e) => handleChangeClient(e)} />
                <button onClick={(e) => handleMint(e)}> Mint </button>
              </>
            )}
          </div>
        )}
      </LoadingOverlay>
    </>
  );
};

export default Mint;
