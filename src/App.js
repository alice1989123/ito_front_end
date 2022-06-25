import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";

const api = `http://localhost:3001/`;

const Bearer =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2NmUzNDA5OS04ZmI5LTRjMjQtOWUwOS1jOWI3YzNhNWE5MGIiLCJlbWFpbCI6ImFsaWNpYWJhc2lsby5hYkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlfSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiOTgzY2RjNmQyNTI2MjQyY2RiODIiLCJzY29wZWRLZXlTZWNyZXQiOiIyNjA5NjFhMDRhMWNiYWI2ZTI0ZWE2NjYyNjZkOGY5ZjA5YzljZTQ4MDZhZTZiY2YxNThmMDJlNWMxY2Q5YmU0IiwiaWF0IjoxNjQxODY0MTM2fQ.UZ63Opzr-c7gFXlsucOERPDmibh7MCjojKhOgvwGazQ";

const Upload =
  "https://74zkcr4wuj.execute-api.eu-central-1.amazonaws.com/default/UploAdToPinata";
const gateWay = "https://gateway.pinata.cloud/ipfs/";

function App() {
  const [ipfs, setIPFS] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [file, setFile] = useState();
  const [inputList, setInputList] = useState([]);

  const [Owner, setOwner] = useState(false);
  const [account, setAccount] = useState("");
  const [NFTsupply, setNFTsupply] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectionError, setConnectionError] = useState("");
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

  const mintNFT = async (client, metadata) => {
    var configPinata = {
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        Authorization: `Bearer ${Bearer}`,
        "content-type": "application/json",
      },
      data: metadata,
    };

    //data.pinataOptions = { wrapWithDirectory: true };

    var req = {
      method: "post",
      url: `${api}registerMetadata`,
      headers: {
        "content-type": "application/json",
      },
      data: metadata,
    };
    const metadatahash = await axios(req);
    console.log(metadatahash);
    //const metadatahash = await axios(config);
    //console.log(metadatahash);
    //console.log(metadatahash);
    const metadataURL = `ipfs://${metadatahash.data}`;
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
            CONFIG.CONTRACT_ADDRESS,
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
              CONFIG.CONTRACT_ADDRESS,
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
    const metadata = {
      description: `${data.description}`,
      external_url: "https://www.itolabs.io/",
      image: `ipfs://${ipfs}`,
      name: `${data.name}`,
      attributes: inputList,
    };
    mintNFT(data.clientAddress, metadata);
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

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  async function removeInput(index) {
    setInputList([...inputList.slice(0, index), ...inputList.slice(index + 1)]);
  }
  async function addInput() {
    setInputList([...inputList, {}]);
  }

  async function HandleKeyChange(event, index) {
    setInputList([
      ...inputList.slice(0, index),
      { trait_type: event.target.value, value: inputList[index].value },
      ...inputList.slice(index + 1),
    ]);
  }

  async function HandleValueChange(event, index) {
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

    var config = {
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      headers: {
        Authorization: `Bearer ${Bearer}`,
        "content-type": "multipart/form-data",
      },
      data: formData,
    };

    const res = await axios(config);
    setIPFS(res.data.IpfsHash);
    console.log(res.data);
    setImageURL(gateWay + ipfs);
  }

  return (
    <div className="App">
      <form onSubmit={handleSubmitImage}>
        <h1>Ito tatoo App</h1>
        <input type="file" onChange={handleChange} />
        <button type="submit">Upload</button>
      </form>
      {imageURL && <img width={400} src={imageURL}></img>}
      <div className="App">
        <h3> Atributes</h3>
        {inputList.map((x, i) => {
          return (
            <div className="box">
              <form>
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
              </form>
            </div>
          );
        })}
        <button onClick={addInput}>Add Atribute</button>
        {/*         <div style={{ marginTop: 20 }}>{JSON.stringify(inputList)}</div>
         */}
        <form className={{ display: "flex" }} onSubmit={handleSubmit(onSubmit)}>
          Name <input {...register("name", { required: true })} />
          Description
          <input {...register("description", { required: true })} />
          Client Address
          <input {...register("clientAddress", { required: true })} />
          {errors.exampleRequired && <span>This field is required</span>}
          <input type="submit" />
        </form>{" "}
      </div>
      <div>{JSON.stringify(inputList)}</div>
    </div>
  );
}

export default App;
