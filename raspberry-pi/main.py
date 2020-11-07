import asyncio
import websockets
from random import randint
import cv2
import imutils
from imutils.video import VideoStream
import time
from datetime import datetime
import numpy as np
import random
from pyzbar import pyzbar
import sys
import requests


print('Waiting for the camera ...')
vs = VideoStream(usePiCamera = False).start()
time.sleep(2.0)

async def hello():
    uri = "ws://" + sys.argv[1] + ":8082"
    print(uri)
    async with websockets.connect(uri) as websocket:

        #await websocket.send('Warming up the camera ...')
        #vs = VideoStream(usePiCamera = False).start()
        #time.sleep(2.0)

        detector = cv2.QRCodeDetector()

        while True:
            #time.sleep(0.2)
            
            frame = vs.read()

            #await websocket.send('New random number: ' + str(random.randint(0, 100)))
            
            frame = imutils.resize(frame, width=250)

            barcodes = pyzbar.decode(frame)
            for barcode in barcodes:
                codedata = barcode.data.decode("utf-8")
                print(codedata)
                requests.post('http://' + sys.argv[1] + ':3001/qr', json={'qr': codedata})
                time.sleep(2.0)

            _, im_buf_arr = cv2.imencode(".jpg", frame)

            frame = im_buf_arr.tobytes()
            #frame = np.fromstring(im_buf_arr, np.uint8).tobytes()
            
            print(str(datetime.now()) + ' > Sending video frame ...') #TODO: video frame [size: ${frame.length / 1024} kB] ...
            await websocket.send(frame)

asyncio.get_event_loop().run_until_complete(hello())
