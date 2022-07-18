import axios from "axios";
import React, { useState, useEffect } from "react";
import "./App.css";
import { ethers } from "ethers";
import { useForm } from "react-hook-form";
import ResponsiveAppBar from "./NavBar";

import ImgMediaCard from "./Components/ImageLoader";
import Container from "@mui/material/Container";
import MetadataLoader from "./Components/MetadataLoader";
import Box from "@mui/material/Box";

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
  const [artist, setArtist] = useState(null);

  //console.log(watch("example"))

  return (
    <>
      <ResponsiveAppBar artist={artist} setArtist={setArtist} />
      <Container
        sx={{
          display: "flex",
          flexDirection: { md: "row", sm: "column" },
          margin: 2,
          justifyContent: "center",
          alignItems: { md: "flex-start", sm: "center" },
        }}
        maxWidth="md"
      >
        <ImgMediaCard
          file={file}
          setFile={setFile}
          setIPFS={setIPFS}
          ipfs={ipfs}
        />
        <MetadataLoader artist={artist} setmetadata={setmetadata} ipfs={ipfs} />
      </Container>
    </>
  );
}

export default App;
