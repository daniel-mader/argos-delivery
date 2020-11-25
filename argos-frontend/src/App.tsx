import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Scanner from "./scanner/Scanner";
import ArgosEventList from "./events/ArgosEventList";
import { makeStyles } from "@material-ui/styles";
import Settings from "./settings/Settings";
import { Snackbar } from "@material-ui/core";
import MuiAlert, { AlertProps } from "@material-ui/lab/Alert";
import Banner from "./banner/Banner";
import { ArgosEvent } from "./events/ArgosEvent";

const useStyles = makeStyles({
  gridMain: {
    display: "grid",
    padding: "50px",
    gridGap: "50px",
    gridTemplateAreas: `
                  "banner banner"
                  "scanner events"
                  "settings events"
                  ". events"
                  ". events"
                  "footer footer"
                  `,
    gridTemplateColumns: "1fr 2fr",
  },
  banner: { gridArea: "banner" },
  scanner: { gridArea: "scanner" },
  settings: { gridArea: "settings" },
  events: { gridArea: "events" },
});

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export const EXAMPLE_CHANNEL_ID =
  "4ca20a31440a28ad9aa40cd4f16f8c538d5d5b6f8297d1ca6bccd651d4164a210000000000000000:c70f1328dd88c2779ab3cc94";

function App() {
  const classes = useStyles();

  const [gatewayMessages, setGatewayMessages] = useState<Array<ArgosEvent>>([]);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [channel, setChannel] = useState<string | undefined>(undefined);

  const [argosEvent, setArgosEvent] = useState<string>(
    '{ "id": "0", "message": "-"}'
  );
  const [frame, setFrame] = useState<string>("");

  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://0.0.0.0:3001");

    ws.current.onerror = (message: any) => {
      setError(true);
    };

    ws.current.onmessage = (message: any) => {
      if (typeof message.data === "string") {
        setArgosEvent(message.data);
      } else if (typeof message.data === "object") {
        setFrame(URL.createObjectURL(message.data));
      }
    };
    return () => {
      if (ws.current) ws.current.close();
    };
  });

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  const closeError = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === "clickaway") {
      return;
    }
    setError(false);
  };

  return (
    <div className="App">
      <header className="App-header"></header>
      <div className="Background">
        <div className={classes.gridMain}>
          <div style={{ gridColumn: "1 / -1" }} className={"banner"}>
            <Banner />
          </div>
          <div className={classes.scanner}>
            <Scanner frame={frame} />
          </div>
          <div className={classes.events}>
            <ArgosEventList events={gatewayMessages} channelId={channel} />
          </div>
          <div className={classes.settings}>
            <Settings
              callback={(m) => setGatewayMessages(m)}
              channel={(c) => setChannel(c)}
            />
          </div>

          {/*QR code scanned*/}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
          >
            <Alert onClose={handleCloseSnackbar} severity="info">
              QR Code detected! <i>Please wait until written to Tangle ...</i>
            </Alert>
          </Snackbar>

          {/*Error*/}
          <Snackbar open={error} autoHideDuration={6000} onClose={closeError}>
            <Alert onClose={closeError} severity="error">
              Could not connect to Argos Backend!
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
}

export default App;
