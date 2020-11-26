import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { ArgosEvent } from "./ArgosEvent";
import SearchIcon from "@material-ui/icons/Search";
import { Button } from "@material-ui/core";
import Chip from "@material-ui/core/Chip";
import { Alert } from "@material-ui/lab";

const useStyles = makeStyles({
  root: {
    display: "grid",
    placeItems: "center",
    gridGap: "12px",
  },
  grid: {
    display: "grid",
    gridGap: "20px",
  },
  cardGrid: {
    display: "grid",
    gridGap: "10px",
  },
  exploreButton: {
    marginBottom: "16px",
    background: "linear-gradient(45deg, #11998e, #38ef7d)",
  },
});

interface EventListProps {
  channelId: string | undefined;
  events: ArgosEvent[];
}

function ArgosEventList({ channelId, events }: EventListProps) {
  const classes = useStyles();

  console.log("EVENTS:");
  console.log(events);
  console.log(Object.values(events));

  type Location = {
    latitude: string;
    longitude: string;
  };

  const iframe = ({ latitude, longitude }: Location) => {
    return {
      __html: `<iframe width="425" height="350" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://www.openstreetmap.org/export/embed.html?bbox=${longitude}%2C${latitude}%2C${longitude}%2C${latitude}&amp;layer=mapnik&amp;marker=${latitude}%2C${longitude}" style="border: 1px solid black; border-radius: 6px;"></iframe>`,
    };
  };

  return (
    <div className={classes.root}>
      <h3>Events</h3>
      <div>
        <Button
          className={classes.exploreButton}
          variant="contained"
          color="secondary"
          startIcon={<SearchIcon />}
          target="_blank"
          href={`https://explorer.iot2tangle.io/channel/${channelId}`}
        >
          View on Tangle
        </Button>
      </div>
      <div className={classes.grid}>
        {events.length === 0 && <div>No events yet.</div>}

        {Object.values(events).map((a) => (
          <Card key={a.id} elevation={4}>
            <CardContent className={classes.cardGrid}>
              {a.type === "SCAN" && a.state === "STARTED" && (
                <div className={classes.cardGrid}>
                  <Alert severity="info">Your package is on its way now!</Alert>
                  <div>
                    QR Code scanned:{" "}
                    <Chip label={a.value} variant={"outlined"} />
                  </div>
                </div>
              )}

              {a.type === "DROP" && (
                <div className={classes.cardGrid}>
                  <Alert severity="error">Drop of package registered!</Alert>
                  <div dangerouslySetInnerHTML={iframe(a.location)} />
                </div>
              )}

              {a.type === "SCAN" && a.state === "COMPLETED" && (
                <div className={classes.cardGrid}>
                  <Alert severity="success">
                    Package successfully delivered!
                  </Alert>
                  <div>
                    QR Code scanned:{" "}
                    <Chip label={a.value} variant={"outlined"} />
                  </div>
                </div>
              )}

              <div style={{ color: "grey", fontSize: "small" }}>
                {new Date(a.timestamp).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ArgosEventList;
