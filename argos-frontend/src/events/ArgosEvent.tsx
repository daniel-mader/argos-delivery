export interface ArgosEvent {
  id: string;
  timestamp: string;
  type: string;
  value: string | undefined;
  state: string;
  location: {
    latitude: string;
    longitude: string;
  };
}
