export interface ArgosEvent {
  id: string;
  timestamp: Date;
  type: string;
  state: string;
  value?: string;
  location?: { latitude: string; longitude: string };
}

export interface StreamsMessage {
  iot2tangle: [
    {
      sensor: string; // "Gyroscope"
      data: [any]; // any object
    }
  ];
  device: string; // SHA3 hash of "XDK_HTTP_1"
  timestamp: number; // 1558511111
}
