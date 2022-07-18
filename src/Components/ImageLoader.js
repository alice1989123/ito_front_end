import React, { useState } from "react";
import Card from "@mui/material/Card";
import LoadingButton from "@mui/lab/LoadingButton";

import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import IconButton from "@mui/material/IconButton";
import axios from "axios";
import { api, gateWay } from "../constants";

export default function ImgMediaCard({ file, setFile, setIPFS, ipfs }) {
  const [loading, setLoading] = useState(false);
  function handleChange(event) {
    setFile(event.target.files[0]);
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
    const config_ = {
      method: "post",
      url: api + "upLoadImage",
      headers: {
        "content-type": "multipart/form-data",
      },
      data: formData,
    };

    setLoading(true);
    const res = await axios(config_);

    console.log(res);

    setIPFS(res.data);
    if (res.data) {
      setLoading(false);
    }
  }
  return (
    <Card sx={{ maxWidth: 345, margin: 2 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Upload your NFT Image{" "}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This image will be stored on in a decentralized server. It will be
          public visible to every one and uploading is ireversible!
        </Typography>

        <CardMedia
          component="img"
          alt="image holder"
          height="200"
          image={ipfs ? gateWay + ipfs : "/images/imageHolder.png"}
        />
      </CardContent>
      <CardActions>
        <form onSubmit={handleSubmitImage}></form>
        <LoadingButton
          onClick={handleSubmitImage}
          loading={loading}
          type="submit"
          variant="contained"
        >
          Upload
        </LoadingButton>{" "}
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="label"
        >
          {" "}
          <input onChange={handleChange} hidden accept="image/*" type="file" />
          <PhotoCamera />
        </IconButton>
      </CardActions>
    </Card>
  );
}
