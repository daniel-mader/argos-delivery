export interface ArgosEvent {
  id: string; // uuid
  timestamp: string;
  type: string; // SCAN, DROP
  value: string | undefined; // scan value
  state: string; // NOT STARTED, STARTED, COMPLETE
  location: {
    latitude: string;
    longitude: string;
  } //string | undefined; // drop location
}
