import React, { useEffect } from "react";
import "../Styles/Main.css";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { Code, Language, Storage, Devices , InsertChart  } from '@material-ui/icons';
import { Card, CardMedia, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import Grid from '@mui/material/Grid'
import { background } from "@chakra-ui/react";
import { borderRadius } from "@mui/system";
import {makeStyles,useTheme,} from "@material-ui/core";

  

const useStyles = makeStyles((theme) => ({
    // styles for hiding the empty Grid items on medium screens and above
    hideOnMedium: {
      [theme.breakpoints.up('md')]: {
        '&':{
            width : 0,
        }
      },
    },
  }));

function rain() {
  let amount = 30;
  let i = 0;
  let dropContainers = document.getElementsByClassName("drop-container");
  let dropContainer = dropContainers[0];
  document.body.appendChild(dropContainer);

  while (i < amount) {
    let drop = document.createElement("i");
    let size = Math.random() * 8;
    let posX = Math.floor(Math.random() * window.innerWidth);
    let delay = Math.random() * -20 * i + 1;
    let duration = 2 + Math.floor(Math.random() * 3 + i/3);

    drop.style.left = posX + "px";
    drop.style.width = 0.2 + size + "px";
    drop.style.animationDelay = delay + "s";
    drop.style.animationDuration = duration + "s";


    // add different class based on diagonal
    if (i % 2 === 0) {
        drop.classList.add("drop-diagonal-left");
    } else {
        drop.classList.add("drop-diagonal-right");
    }


    dropContainer.appendChild(drop);
    i++;
  }
}

function Main() {
  useEffect(() => {
    rain();
  }, []);

  const classes = useStyles();

  /*return (
    <div>
      <Navbar />
      <div className="drop-container" style={{ color: "white" }}></div>
      <Grid container style={{marginTop: "10%" }}>
        <Grid item md={4} sm={2} xs={1}>
        </Grid>
        <Grid item md={4} sm={8} xs={10}>
            <Card sx={{ 
                color: "white", 
                backgroundColor : "rgba(0,0,0,.5)", 
                borderRadius : "25px",               

                }}>
                <CardMedia
                component="img"
                height="300"
                image="/logo512.png"
                alt="Your name"
                />
                <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                    Andrija Ivkovic
                </Typography>
                <Typography variant="body2" >
                    Programer
                </Typography>
                <List sx={{ mt: 2 , color:"white" }}>
                    <ListItem>
                    <ListItemIcon sx={{ color : "whitesmoke"}}> 
                        <Code />
                    </ListItemIcon>
                    <ListItemText primary="Programming" />
                    </ListItem>
                    <ListItem>
                    <ListItemIcon sx={{ color : "whitesmoke"}}>
                        <Language />
                    </ListItemIcon>
                    <ListItemText primary="Web development" />
                    </ListItem>
                    <ListItem>
                    <ListItemIcon sx={{ color : "whitesmoke"}}>
                        <Storage />
                    </ListItemIcon>
                    <ListItemText primary="Database management" />
                    </ListItem>
                    <ListItem>
                    <ListItemIcon sx={{ color : "whitesmoke"}}>
                        <Devices />
                    </ListItemIcon >
                    <ListItemText primary="DevOps" />
                    </ListItem>
                </List>
                </CardContent>
            </Card>
        </Grid>    
        <Grid item md={4} sm={2} xs={1}>          
        </Grid>
      </Grid>
    </div>
  );*/

  return (
    <div>
      <Navbar />
      <div className="drop-container" style={{ color: "white" }}></div>
      <Grid container style={{ marginTop: "10%" }}>
        <Grid item md={3} sm={2} xs={1}/>
        <Grid item md={3} sm={8} xs={10}>
          <Card
            sx={{
              color: "white",
              backgroundColor: "rgba(0,0,0,.5)",
              borderRadius: "25px"
            }}
          >
            <CardMedia
              component="img"
              height="200"
              width="50%"
              image="/logo512.png"
              alt="Your name"
            />
            <CardContent width="50%" >
              <Typography gutterBottom variant="h5" component="div">
                Andrija Ivkovic
              </Typography>
              <Typography variant="body2">Programmer</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item md={3} sm={8} xs={10} sx={{backgroundColor : "rgba(0,0,0,0.5)" ,height:"380px"}}  >
          <List sx={{ mt: 2, color: "white"}}>
            <ListItem>
              <ListItemIcon sx={{ color: "whitesmoke" }}>
                <Code />
              </ListItemIcon>
              <ListItemText primary="Programming" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ color: "whitesmoke" }}>
                <Language />
              </ListItemIcon>
              <ListItemText primary="Web development" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ color: "whitesmoke" }}>
                <Storage />
              </ListItemIcon>
              <ListItemText primary="Database management" />
            </ListItem>
          </List>
          <List sx={{ mt: 2, color: "white"}}>
            <ListItem>
              <ListItemIcon sx={{ color: "whitesmoke" }}>
                <Devices />
              </ListItemIcon>
              <ListItemText primary="DevOps" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ color: "whitesmoke" }}>
                <InsertChart />
              </ListItemIcon>
              <ListItemText primary="Data Analysis" />
            </ListItem>
            <ListItem>
              <ListItemIcon sx={{ color: "whitesmoke" }}>
                <InsertChart />
              </ListItemIcon>
              <ListItemText primary="UI/UX Design" />
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} sm={8} xs={1}/>
      </Grid>
    </div>
  );
  

}

export default Main;