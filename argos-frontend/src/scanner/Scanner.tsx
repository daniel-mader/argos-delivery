import {makeStyles} from "@material-ui/core/styles";
import React, {useEffect, useState} from "react";
import {Card} from "@material-ui/core";
import {VisibilityOff} from "@material-ui/icons";

const useStyles = makeStyles({
  videoFrame: {
    border: "1px solid black",
    borderRadius: "8px",
    maxWidth: "250px"
  },
});

function addDefaultImage(e: any) {
  // e.target.src = './250x200.png'
  e.target.src = './eye.png'
}

function Scanner(props: any) {
  const classes = useStyles();

  const frame = props.frame;

  /*
  var imageBlob = undefined;

  const [frame, setFrame] = useState<string>("");

  useEffect(() => {
    ws.onmessage = (message: any) => {
      if (typeof message.data === "object") {
        // TODO: detect if message is binary or json
        imageBlob = URL.createObjectURL(message.data);
        setFrame(imageBlob);
        console.log("New frame received.");
      }
    };
  });
  */

  return (
    <div style={{display: 'grid', placeItems: 'center', gridGap: '12px'}}>
      {/* <div>{frame}</div> */}
      <h3>Scanner</h3>
      {/* <div>{imageBlob}</div> */}
      <div style={{width: '250px', height: '187px'}}>
        <Card elevation={4} style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {frame &&
          <img
              src={frame}
              alt="No data received."
              onError={addDefaultImage} // TODO: really needed?
          />
          }
          {!frame &&
          <div style={{ display: 'grid', gridGap: '12px', placeItems: 'center'}}>
              <VisibilityOff style={{ fontSize: 'xx-large', color: '#282c34' }}/>
              <div>
                <div>No video received</div>
                <div>from Raspberry Pi.</div>
              </div>
          </div>
          }
          {/*<img*/}
          {/*  className={classes.videoFrame}*/}
          {/*  src={frame}*/}
          {/*  alt="No image from Raspberry."*/}
          {/*  onError={addDefaultImage}*/}
          {/*/>*/}
        </Card>
      </div>
      {/*TODO: remove eye.png */}
      {/*<div>*/}
      {/*  <img*/}
      {/*    className={classes.videoFrame}*/}
      {/*    src={frame}*/}
      {/*    alt="No image from Raspberry."*/}
      {/*    onError={addDefaultImage}*/}
      {/*  />*/}
      {/*</div>*/}
    </div>
  );
}

export default Scanner;
