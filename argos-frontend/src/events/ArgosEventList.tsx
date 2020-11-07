import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import {makeStyles} from "@material-ui/core/styles";
import React, {useEffect, useState} from "react";
import {ArgosEvent} from "./ArgosEvent";
import SearchIcon from '@material-ui/icons/Search';
import {Button} from "@material-ui/core";
import Chip from '@material-ui/core/Chip';
import {Alert, AlertTitle} from "@material-ui/lab";
import CropFreeIcon from '@material-ui/icons/CropFree';

const useStyles = makeStyles({
  root: {
    /*background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
    border: 0,
    borderRadius: 3,
    boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
    color: "white",
    height: 48,
    padding: "0 30px",*/
    display: "grid",
    placeItems: "center",
    gridGap: "12px"
  },
  grid: {
    display: "grid",
    gridGap: "20px"
  },
  cardGrid: {
    display: "grid",
    gridGap: "10px"
  },
  exploreButton: {
    // marginBlockEnd: "24px",
    marginBottom: "16px",
    // background: 'linear-gradient(45deg, #f12711 30%, #f5af19 90%)',
    // background: 'linear-gradient(45deg, #1A2980, #26D0CE)',
    // background: 'linear-gradient(45deg, #42275A, #734B6D)',
    background: 'linear-gradient(45deg, #11998e, #38ef7d)',
    // backgroundColor: '#f9c047',
    // borderRadius: 3,
    // border: 0,
    // color: 'white',
    // height: 48,
    // padding: '0 30px',
    // boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  }
});

interface EventListProps {
  channelId: string | undefined,
  events: ArgosEvent[]
}

function ArgosEventList({channelId, events}: EventListProps) {
  const classes = useStyles();

  console.log("EVENTS:")
  console.log(events)
  console.log(Object.values(events))

  type Location = {
    latitude: string;
    longitude: string;
  }

  const iframe = ({latitude, longitude}: Location) => {
    return {
      __html: `<iframe width="425" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://www.openstreetmap.org/export/embed.html?bbox=${longitude}%2C${latitude}%2C${longitude}%2C${latitude}&amp;layer=mapnik&amp;marker=${latitude}%2C${longitude}" style="border: 1px solid black; border-radius: 6px;"></iframe>`
    }
  }

  return (
    <div className={classes.root}>
      <h3>Events</h3>
      <div>
        <Button
          className={classes.exploreButton}
          variant="contained"
          color="secondary"
          startIcon={<SearchIcon/>}
          target="_blank" href={`https://explorer.iot2tangle.io/channel/${channelId}`}>
          View on Tangle
        </Button>
      </div>
      <div className={classes.grid}>
        {events.length === 0 &&
        <div>No events yet.</div>
        }

        {Object.values(events).map((a) => (
          <Card key={a.id} elevation={4}>
            <CardContent className={classes.cardGrid}>
              {/*<div style={{color: 'grey', fontSize: 'small'}}>{new Date(a.timestamp).toLocaleString()}</div>*/}

              {/*<div>*/}
              {/*<Chip label={a.type} variant={"outlined"}/>*/}
              {/*</div>*/}

              {a.type === 'SCAN' && a.state === 'STARTED' &&
              <div className={classes.cardGrid}>
                  <Alert severity="info">
                    {/*<AlertTitle>Started</AlertTitle>*/}
                      Your package is on it's way now!
                  </Alert>
                  <div>QR Code scanned: <Chip /*icon={<CropFreeIcon/>}*/ label={a.value} variant={"outlined"}/></div>
              </div>
              }

              {a.type === 'DROP' &&
              <div className={classes.cardGrid}>
                {/* variants: -, outlined, filled */}
                  <Alert severity="error">
                    {/*<AlertTitle>Ouch!</AlertTitle>*/}
                      Drop of package registered!
                  </Alert>
                  <div dangerouslySetInnerHTML={iframe(a.location)}/>
              </div>
              }

              {a.type === 'SCAN' && a.state === 'COMPLETED' &&
              <div className={classes.cardGrid}>
                  <Alert severity="success">
                    {/*<AlertTitle>Delivered</AlertTitle>*/}
                      Package successfully delivered!
                  </Alert>
                  <div>QR Code scanned: <Chip /*icon={<CropFreeIcon/>}*/ label={a.value} variant={"outlined"}/></div>
              </div>
              }

              <div style={{color: 'grey', fontSize: 'small'}}>{new Date(a.timestamp).toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ArgosEventList;
