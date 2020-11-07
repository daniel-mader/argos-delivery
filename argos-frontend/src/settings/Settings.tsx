import {Button, TextField} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import React, {useEffect, useState} from "react";
import {ClipLoader, ScaleLoader} from "react-spinners";
import {Subject} from "rxjs";
import {debounceTime, distinctUntilChanged, tap} from "rxjs/operators";
import Card from "@material-ui/core/Card";
import config from '../config.json';
import {ArgosEvent} from "../events/ArgosEvent";

const useStyles = makeStyles({
  root: {
    // border: "1px solid white",
    // borderRadius: "8px",
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
    height: '80px',
    display: 'grid',
    // padding: '10px 20px',
    placeItems: 'center'
  },
  input: {
    // color: "#FFF",
    color: "#282c34",
  },
  grid: {
    display: "grid",
    rowGap: "20px",
  },
  background: {
    // background: "linear-gradient(45deg, #11998e, #38ef7d)",
    padding: '20px'
  },
  switchButton: {
    background: 'linear-gradient(45deg, #11998e, #38ef7d)',
  }
});

type SettingsProps = {
  callback: (events: Array<ArgosEvent>) => void,
  channel: (channelId: string) => void
}

function Settings({callback, channel}: SettingsProps) {
  const classes = useStyles();

  const exampleHost = 'http://192.168.178.28:8585/decode_channel/';
  // const exampleChannelId = '4ca20a31440a28ad9aa40cd4f16f8c538d5d5b6f8297d1ca6bccd651d4164a210000000000000000:c70f1328dd88c2779ab3cc94';

  const [host, setHost] = useState(exampleHost);
  const [channelId, setChannelId] = useState('');

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedChannelId = useDebounce(channelId, 500);

  useEffect(() => {
    getChannel().then((c) => {
      setChannelId(c) // set local for input field and calls to backend
      channel(c) // return to parent "App.tsx" (needed for explore on tangle button)
    })
    // console.log({channel_id})
    // setChannelId(channel_id)

    if (debouncedChannelId) {
      console.log(debouncedChannelId);
      setIsLoading(true);
      getDataFromGateway(debouncedChannelId).then((res: ArgosEvent[]) => {
        setIsLoading(false);
        console.log(res);
        // console.log(res.map((x: any) => JSON.parse(x)));
        // setResults(res.map((entry: any) => JSON.parse(entry)));
        // messages(res.map((e: any) => JSON.parse(e)));
        // events(res.map((x: ArgosEvent) => x));
        callback(res)
      });

    } else {
      setResults([]);
    }
    /*
    const sub = onSearch$
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((a) => console.log(a))
      )
      .subscribe(setDebouncedName);
    */
  }, [debouncedChannelId]);

  return (
    <div className={classes.root}>
      <h3>Settings</h3>
      <Card className={classes.background} elevation={4}>
        <div>
          <form className={classes.control} noValidate autoComplete="off">
            {/*<TextField*/}
            {/*  id="gateway-ip"*/}
            {/*  label="Gateway IP"*/}
            {/*  variant="outlined"*/}
            {/*  InputProps={{*/}
            {/*    classes: {input: classes.input}//, root: classes.root},*/}
            {/*  }}*/}
            {/*  defaultValue={exampleHost}*/}
            {/*  onChange={(e) => setHost(e.target.value)}*/}
            {/*/>*/}
            <TextField
              id="channel-id"
              label="Channel ID"
              variant="outlined"
              InputProps={{
                classes: {input: classes.input}//, root: classes.root}
              }}
              // defaultValue={exampleChannelId}
              onChange={(e) => setChannelId(e.target.value)}
              value={channelId}
            />
          </form>
        </div>
        <Button
          className={classes.switchButton}
          onClick={() => {
            setIsLoading(true)
            switchChannel().then(channelId => {
              setChannelId(channelId)
              setIsLoading(false)
            })}
          }
          variant={"contained"}
          color={"secondary"}
          style={{margin: '12px'}}>
          Switch to new Channel
        </Button>
      </Card>
      <ScaleLoader loading={isLoading} color={"#11998e"}></ScaleLoader>
    </div>
  );
}

function getChannel() {
  return fetch(`${config.argosBackend.host}:${config.argosBackend.port}/channel`)
    .then((response) => response.json())
    .then((data) => {
      return data.channel_id
    })
}

function switchChannel() {
  return fetch(`${config.argosBackend.host}:${config.argosBackend.port}/switch_channel`, {
    method: 'POST'
  })
    .then((response) => response.json())
    .then((data) => {
      return data.channel_id;
    })
}

function getDataFromGateway(channel_id: string): Promise<Array<ArgosEvent>> {
  return fetch(`${config.argosBackend.host}:${config.argosBackend.port}/decode`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({channel_id})
  })
    .then((response) => response.json())
    .then((data) => {
      console.log({data});
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
