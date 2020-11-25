import { Button, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React, { useEffect, useState } from "react";
import { ScaleLoader } from "react-spinners";
import Card from "@material-ui/core/Card";
import config from "../config.json";
import { ArgosEvent } from "../events/ArgosEvent";

const useStyles = makeStyles({
  root: {
    display: "grid",
    rowGap: "20px",
  },
  control: {
    "& .MuiFormControl-root": {
      width: "100%",
    },
    "& label": {
      color: "#282c34",
    },
    "& label.Mui-focused": {
      color: "#11998e",
    },
    "& .MuiInput-underline:after": {
      borderBottomColor: "#282c34",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#282c34",
      },
      "&:hover fieldset": {
        borderColor: "#282c34",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#11998e",
      },
    },
    height: "80px",
    display: "grid",
    placeItems: "center",
  },
  input: {
    color: "#282c34",
  },
  grid: {
    display: "grid",
    rowGap: "20px",
  },
  background: {
    padding: "20px",
  },
  switchButton: {
    background: "linear-gradient(45deg, #11998e, #38ef7d)",
  },
});

type SettingsProps = {
  callback: (events: Array<ArgosEvent>) => void;
  channel: (channelId: string) => void;
};

function Settings({ callback, channel }: SettingsProps) {
  const classes = useStyles();

  const exampleHost = "http://192.168.178.28:8585/decode_channel/";

  const [host, setHost] = useState(exampleHost);
  const [channelId, setChannelId] = useState("");

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedChannelId = useDebounce(channelId, 500);

  useEffect(() => {
    getChannel().then((c) => {
      setChannelId(c);
      channel(c);
    });

    if (debouncedChannelId) {
      console.log(debouncedChannelId);
      setIsLoading(true);
      getDataFromGateway(debouncedChannelId).then((res: ArgosEvent[]) => {
        setIsLoading(false);
        console.log(res);
        callback(res);
      });
    } else {
      setResults([]);
    }
  }, [debouncedChannelId]);

  return (
    <div className={classes.root}>
      <h3>Settings</h3>
      <Card className={classes.background} elevation={4}>
        <div>
          <form className={classes.control} noValidate autoComplete="off">
            <TextField
              id="channel-id"
              label="Channel ID"
              variant="outlined"
              InputProps={{
                classes: { input: classes.input },
              }}
              onChange={(e) => setChannelId(e.target.value)}
              value={channelId}
            />
          </form>
        </div>
        <Button
          className={classes.switchButton}
          onClick={() => {
            setIsLoading(true);
            switchChannel().then((channelId) => {
              setChannelId(channelId);
              setIsLoading(false);
            });
          }}
          variant={"contained"}
          color={"secondary"}
          style={{ margin: "12px" }}
        >
          Switch to new Channel
        </Button>
      </Card>
      <ScaleLoader loading={isLoading} color={"#11998e"}></ScaleLoader>
    </div>
  );
}

function getChannel() {
  return fetch(
    `${config.argosBackend.host}:${config.argosBackend.port}/channel`
  )
    .then((response) => response.json())
    .then((data) => {
      return data.channel_id;
    });
}

function switchChannel() {
  return fetch(
    `${config.argosBackend.host}:${config.argosBackend.port}/switch_channel`,
    {
      method: "POST",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      return data.channel_id;
    });
}

function getDataFromGateway(channel_id: string): Promise<Array<ArgosEvent>> {
  return fetch(
    `${config.argosBackend.host}:${config.argosBackend.port}/decode`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ channel_id }),
    }
  )
    .then((response) => response.json())
    .then((data) => {
      console.log({ data });
      return data.argosEvents;
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
}

function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value]);

  return debouncedValue;
}

export default Settings;
