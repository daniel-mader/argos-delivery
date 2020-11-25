import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles({
  root: {
    background: "white",
    minHeight: "100px",
    borderRadius: "8px",
    boxShadow:
      "0px 3px 5px -1px rgba(0,0,0,0.2), 0px 6px 10px 0px rgba(0,0,0,0.14), 0px 1px 18px 0px rgba(0,0,0,0.12)",
  },
  logos: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr",
    alignItems: "center",
    color: "#282c34",
    padding: "20px",
  },
  color: {
    borderBottomLeftRadius: "8px",
    borderBottomRightRadius: "8px",
    backgroundImage: "linear-gradient(to right, #11998e, #38ef7d)", // !* Quepal *!*
  },
});

export default function Banner(props: any) {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.logos}>
        <div>
          <img width="200px" src={"/Argos_Secondary_Black.svg"} alt={""} />
        </div>
        <div
          style={{
            display: "grid",
            cursor: "pointer",
            gridGap: "8px",
            placeItems: "center",
          }}
          onClick={(e) => {
            e.preventDefault();
            window.open("https://hackathon.iot2tangle.io", "_blank");
          }}
        >
          <span style={{ fontSize: "small" }}>A showcase project for the</span>
          <img width="200px" src={"/logo_iot2tangle.png"} alt={""} />
          <span style={{ fontWeight: "bold" }}>
            Integrate Everything with IOTA
          </span>
          <span style={{ fontSize: "small" }}>Hackathon</span>
        </div>
        <div>
          <img width="180px" src={"/Powered_by_IOTA.svg"} alt={""} />
        </div>
      </div>
      <div className={classes.color} style={{ height: "8px" }} />
    </div>
  );
}
