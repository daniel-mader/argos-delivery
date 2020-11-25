import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { Card } from "@material-ui/core";
import { VisibilityOff } from "@material-ui/icons";

const useStyles = makeStyles({
  videoFrame: {
    border: "1px solid black",
    borderRadius: "8px",
    maxWidth: "250px",
  },
});

function addDefaultImage(e: any) {
  e.target.src = "./eye.png";
}

function Scanner(props: any) {
  const classes = useStyles();

  const frame = props.frame;

  return (
    <div style={{ display: "grid", placeItems: "center", gridGap: "12px" }}>
      <h3>Scanner</h3>
      <div style={{ width: "250px", height: "187px" }}>
        <Card
          elevation={4}
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {frame && (
            <img
              src={frame}
              alt="No data received."
              onError={addDefaultImage}
            />
          )}
          {!frame && (
            <div
              style={{ display: "grid", gridGap: "12px", placeItems: "center" }}
            >
              <VisibilityOff
                style={{ fontSize: "xx-large", color: "#282c34" }}
              />
              <div>
                <div>No video received</div>
                <div>from Raspberry Pi.</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Scanner;
