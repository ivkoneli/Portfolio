import React from "react";
import {
  AppBar,
  Toolbar,
  CssBaseline,
  Typography,
  makeStyles,
  useTheme,
  useMediaQuery,
  Button,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import DrawerComponent from "./Drawer";

const useStyles = makeStyles((theme) => ({
  navlinks: {
    marginLeft: theme.spacing(10),
    display: "flex",
  },
  logo: {
    flexGrow: "1",
    cursor: "pointer",
    fontWeight:"bold",
  },
  link: {
    textDecoration: "none",
    color: "white",
    fontSize: "17px",
    fontWeight:"bold",
    marginLeft: theme.spacing(5),
    "&:hover": {
      color: "purple",
    },
  },
  appbar: {
    backgroundColor : "#11061c",
    fontWeight:"bold",
  }
}));

function Navbar() {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar position="static" className={classes.appbar}>
      <CssBaseline />
      <Toolbar>
        <Typography variant="h4" className={classes.logo}>
          Ivkoneli  
        </Typography>
        {isMobile ? (
          <DrawerComponent />
        ) : (
          <div className={classes.navlinks}>
            <Button className={classes.link}>
              Home
            </Button>
            <Button className={classes.link}>
              About
            </Button>
            <Button  className={classes.link}>
              Projects
            </Button>
            <Button className={classes.link}>
              Contact
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
}
export default Navbar;