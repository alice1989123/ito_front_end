import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { LoadingButton } from "@mui/lab";

import axios from "axios";
import { api, gateWay } from "../constants";
import { useForm } from "react-hook-form";
import { margin } from "@mui/system";
import { useNavigate } from "react-router-dom";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

export default function MetadataLoader({ setmetadata, ipfs }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    setLoading(true);
  };

  const registerMetadata = async (metadata_, artist) => {
    var req = {
      method: "post",
      url: `${api}registerMetadata`,
      headers: {
        "Content-Type": "application/json",
      },
      data: metadata_,
    };
    const hash = await axios(req);
    setLoading(false);
    navigate(`/mint/${hash.data}`, { state: { artist: artist } });

    setmetadata(hash.data);

    console.log(hash, "metadata");
    return hash.data;
  };

  const [inputList, setInputList] = useState([
    { trait_type: "Style", value: "" },
    { trait_type: "Collection", value: "" },
    { trait_type: "Studio", value: "" },
  ]);

  function removeInput(e, index) {
    e.preventDefault();

    setInputList([...inputList.slice(0, index), ...inputList.slice(index + 1)]);
  }
  function addInput(e) {
    e.preventDefault();

    setInputList([...inputList, {}]);
  }

  function HandleKeyChange(event, index) {
    event.preventDefault();

    setInputList([
      ...inputList.slice(0, index),
      { trait_type: event.target.value, value: inputList[index].value },
      ...inputList.slice(index + 1),
    ]);
  }

  function HandleValueChange(event, index) {
    event.preventDefault();

    setInputList([
      ...inputList.slice(0, index),
      { trait_type: inputList[index].trait_type, value: event.target.value },
      ...inputList.slice(index + 1),
    ]);
  }

  return (
    <Card sx={{ maxWidth: 345, margin: 2 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Upload your NFT Metadata{" "}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The metadata is the information that defines your NFT, it includes its
          name a description, and you can add aditional atributes to the
          metadata. It will make you NFT unique. This information is public, and
          once you have uploadead it you can not go back!
        </Typography>
      </CardContent>
      <CardActions>
        <Box
          component="form"
          className={{ display: "flex" }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <TextField
            {...register("name", { required: true })}
            required
            margin="normal"
            id="outlined-required"
            label="Name"
            size="small"
          />{" "}
          <TextField
            {...register("description", { required: true })}
            required
            margin="normal"
            id="outlined-required"
            label="Description"
            size="small"
            /*             style={{ height: 15 }}
             */
          />
          {errors.exampleRequired && <span>This field is required</span>}
          <Typography
            sx={{ width: "100%", textAlign: "center", marginTop: "10px" }}
            gutterBottom
            variant="h5"
            component="div"
          >
            Additional Atributes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Some times you might need additional inputs that makes your NFT even
            more unique, feel free to use your imagination!
          </Typography>
          {inputList.map((x, i) => {
            return (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box margin={1}>
                    <TextField
                      onChange={(e) => HandleKeyChange(e, i)}
                      margin="normal"
                      id="outlined-required"
                      label={"Atribute Name"}
                      size="small"
                      defaultValue={x.trait_type}
                    />
                  </Box>

                  <Box margin={1}>
                    <TextField
                      onChange={(e) => HandleValueChange(e, i)}
                      margin="normal"
                      id="outlined-required"
                      label="Atribute Value"
                      size="small"
                      defaultValue={""}
                    />
                  </Box>

                  <Button
                    sx={{ height: "50px", height: "50px", borderRadius: 3 }}
                    color="error"
                    onClick={(e) => {
                      removeInput(e, i);
                    }}
                  >
                    <RemoveCircleOutlineIcon color="action" />
                  </Button>
                </Box>
              </Box>
            );
          })}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Box
              sx={{
                display: "flex",
              }}
            >
              <Button
                sx={{ height: "50px", height: "50px", borderRadius: 3 }}
                onClick={addInput}
              >
                {" "}
                <Typography gutterBottom variant="h8" component="div">
                  Add Atribute{" "}
                </Typography>
                <AddCircleOutlineIcon margin="normal"></AddCircleOutlineIcon>
              </Button>
            </Box>
            <LoadingButton
              onClick={handleSubmit(onSubmit)}
              loading={loading}
              type="submit"
              variant="contained"
              color="success"
              sx={{ maxHeight: "38px" }}
            >
              Submit
            </LoadingButton>{" "}
          </Box>
        </Box>
      </CardActions>
    </Card>
  );
}
