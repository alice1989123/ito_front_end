import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";

const api =
  //"https://74zkcr4wuj.execute-api.eu-central-1.amazonaws.com/default/";
  //`http://localhost:3001/`;
  "https://alice.mypapp.live/";

const gateWay = "https://infura-ipfs.io/ipfs/";

function App() {
  const [ipfs, setIPFS] = useState(null);
  const [file, setFile] = useState();
  const [inputList, setInputList] = useState([]);
  const [metadata, setmetadata] = useState(null);
  const [metadataValues, setMetadataValues] = useState(null);
  const [contract, setContract] = useState(null);

  const [Owner, setOwner] = useState(false);
  const [account, setAccount] = useState("");
  const [NFTsupply, setNFTsupply] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [client, setClient] = useState(null);
  const [artist, setArtist] = useState(null);
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
        console.log(
          contracts.filter((x) => {
            console.log(x.address.toLowerCase() == accounts[0].toLowerCase());
            return x.address.toLowerCase() == accounts[0].toLowerCase();
          })
        );
        const selectedAcounts = contracts.filter((x) => {
          return x.address.toLowerCase() == accounts[0].toLowerCase();
        });
        if (selectedAcounts.length >= 1) {
          //console.log(selectedAcounts[0]);
          setArtist(selectedAcounts[0]);
          setContract(selectedAcounts[0].contract);
        }

        const signer = await provider.getSigner();

        const contract = new ethers.Contract(contract, interface_, signer);
        const supply = await contract.totalSupply();
        const owner = await contract.owner();
        setAccount(accounts[0]);

        setNFTsupply(parseInt(supply.toString()));
        if (owner.toLowerCase() == accounts[0].toLowerCase()) {
          setOwner(true);
        }
      } catch (e) {
        console.log("error ", e);
      }
    } else {
      setConnectionError(" Metmask is not installed, please install metamask");
    }
  };

  const registerMetadata = async (metadata_) => {
    var req = {
      method: "post",
      url: `${api}registerMetadata`,
      headers: {
        "Content-Type": "application/json",
      },
      data: metadata_,
    };
    const hash = await axios(req);
    //metadata = await axios.get(gateWay + hash.data);

    setmetadata(hash.data);

    console.log(hash, "metadata");
    return hash.data;
  };

  const mintNFT = async (client) => {
    console.log(metadata);
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
    //console.log(metamaskIsInstalled, "meta");
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
            contract,
            new ethers.utils.Interface(abi),
            signer
          );
          setConnectionError("");
          try {
            setLoading(true);
            const supply = await Mintcontract1.totalSupply();
            setNFTsupply(parseInt(supply.toString()));
            const owner = await Mintcontract1.owner();
            setAccount(accounts[0]);

            setNFTsupply(parseInt(supply.toString()));
            const Mintcontract2 = new ethers.Contract(
              contract,
              new ethers.utils.Interface(abi),
              signer
            );

            let tx;

            tx = await Mintcontract2.mint(client, metadataURL);

            setConnectionError(
              "Your transaction has been submited it is now being proccesed"
            );
            setConnectionError("Your NFT has been minted! ");
            setNFTsupply(`${parseInt(NFTsupply) + 1}`);
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
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const onSubmit = (data) => {
    const metadata_ = {
      description: `${data.description}`,
      external_url: "https://www.itolabs.io/",
      image: `ipfs://${ipfs}`,
      name: `${data.name}`,
      attributes: inputList,
    };
    registerMetadata(metadata_);
  };

  //console.log(watch("example"))

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

  const getMetadataValues = async () => {
    try {
      const values = await axios.get(`${gateWay}` + metadata);
      console.log(values.data);
      setMetadataValues(values.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getMetadataValues();
  }, [metadata]);

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function handleChangeClient(event) {
    setClient(event.target.value);
  }

  function removeInput(index) {
    setInputList([...inputList.slice(0, index), ...inputList.slice(index + 1)]);
  }
  function addInput() {
    setInputList([...inputList, {}]);
  }

  function HandleKeyChange(event, index) {
    setInputList([
      ...inputList.slice(0, index),
      { trait_type: event.target.value, value: inputList[index].value },
      ...inputList.slice(index + 1),
    ]);
  }

  function HandleValueChange(event, index) {
    setInputList([
      ...inputList.slice(0, index),
      { trait_type: inputList[index].trait_type, value: event.target.value },
      ...inputList.slice(index + 1),
    ]);
  }

  async function handleSubmitImage(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append(
      "pinataOptions",
      '{"cidVersion": 0, "wrapWithDirectory": "false"}'
    );

    var config_ = {
      method: "post",
      url: api + "upLoadImage",
      headers: {
        "content-type": "multipart/form-data",
      },
      data: formData,
    };

    const res = await axios(config_);
    console.log(res);

    setIPFS(res.data);
  }

  function handleMint(e) {
    e.preventDefault();
    console.log(client);
    mintNFT(client);
  }

  const Preview = (metadata) => {
    return (
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
          </>
        )}
      </div>
    );
  };

  const LoggIn = () => {
    return (
      <div>
        {artist && (
          <div className={{ display: "flex" }}>
            <h4>Artist </h4>
            <div>{artist?.artist}</div>
            <h4>Account </h4>
            <div>{artist?.address}</div>
            <h4>Contract </h4>
            <div>{artist?.contract}</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <LoggIn> </LoggIn>
      <button onClick={() => connect()}>Connect Wallet</button>
      <form onSubmit={handleSubmitImage}>
        <h1>Ito tatoo App</h1>
        <h3> Upload image</h3>

        <input type="file" onChange={handleChange} />
        <button type="submit">Upload</button>
      </form>
      {ipfs && <img width={400} src={gateWay + ipfs}></img>}
      <div className="App">
        <h3> Upload metadata</h3>

        <form className={{ display: "flex" }} onSubmit={handleSubmit(onSubmit)}>
          Name <input {...register("name", { required: true })} />
          Description
          <input {...register("description", { required: true })} />
          {errors.exampleRequired && <span>This field is required</span>}
          {inputList.map((x, i) => {
            return (
              <div className="box">
                <input
                  onChange={(e) => {
                    HandleKeyChange(e, i);
                  }}
                  name="Key"
                  value={x.firstName}
                />
                <input
                  onChange={(e) => HandleValueChange(e, i)}
                  name="Value"
                  value={x.lastName}
                />

                <button
                  onClick={(e) => {
                    removeInput(i); /* removeInput(i)} */
                  }}
                >
                  Remove
                </button>
              </div>
            );
          })}
          <h4> Add aditional atributes</h4>
          <button onClick={addInput}>Add Atribute</button>
          <input type="submit" />
        </form>

        <Preview metadata={metadata} />
      </div>
      <h4> Mint NFT</h4>
      Client Address
      <input onChange={(e) => handleChangeClient(e)} />
      <button onClick={(e) => handleMint(e)}> Mint </button>
      <div>{client}</div>
    </div>
  );
}

export default App;
