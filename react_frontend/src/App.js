import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  Divider,
  TextField,
} from "@mui/material";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:4000");

function App() {
  const [phones, setPhones] = useState([]);
  const [brand, setBrand] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Listen for existing phones when the client connects
    socket.on("loadPhones", (loadedPhones) => {
      setPhones(loadedPhones);
    });

    // Listen for new phone data
    socket.on("newPhone", (newPhone) => {
      setPhones((prevPhones) => [...prevPhones, newPhone]);
    });

    // Listen for errors from the server
    socket.on("error", (errorData) => {
      setError(errorData.message);
    });

    return () => {
      socket.off("loadPhones");
      socket.off("newPhone");
      socket.off("error");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    // Basic client-side validation
    if (!brand || !year || !price) {
      setError("All fields are required.");
      return;
    }

    const phoneData = { brand, year: parseInt(year), price: parseFloat(price) };
    socket.emit("addPhone", phoneData); // Emit the new phone data to the server
    handleClose();
  };

  const handleClose = () => {
    setError("");
    setBrand("");
    setYear("");
    setPrice("");
    setIsModalOpen(false);
  };

  return (
    <div className="text-center">
        <div style={{ margin: '10px', display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="h4">Mobile Info</Typography>
        <Button onClick={() => setIsModalOpen(true)} variant="contained">
          Add mobile info
        </Button>
        </div>
      <List>
        <>
          <Typography className="text-center" variant="h4">Mobile List</Typography>
          <Grid container>
            <Grid item xs={12}>
              {phones.map((item, index) => (
                <ListItem>
                  <ListItemText className="text-center">
                    {item.brand} ({item.year}) - ${item.price}
                  </ListItemText>
                </ListItem>
              ))}
            </Grid>
          </Grid>
        </>
      </List>
      <div>
        <Dialog open={isModalOpen}>
          <DialogTitle style={{ textAlign: "center" }}>
            {" "}
            Add mobile details
          </DialogTitle>
          <DialogContent>
            <div>
              <TextField
                fullWidth
                style={{ margin: "5px" }}
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Brand Name"
                label="Brand Name"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                style={{ margin: "5px" }}
                onChange={(e) => setYear(e.target.value)}
                type="number"
                value={year}
                placeholder="Year"
                label="Year"
                variant="outlined"
                required
              />
              <TextField
                fullWidth
                style={{ margin: "5px" }}
                type="number"
                value={price}
                placeholder="Price"
                label="Price"
                variant="outlined"
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              {error && <p style={{ color: "red" }}>{error}</p>}{" "}
              {/* Display error message */}
            </div>
          </DialogContent>
          <Divider />
          <DialogActions>
            <Grid container sx={{ justifyContent: "space-between" }}>
              <Button onClick={handleClose} variant="contained">
                Close
              </Button>

              <Button onClick={handleSubmit} variant="contained">
                Save
              </Button>
            </Grid>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default App;
