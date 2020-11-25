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

async def scan():
    uri = "ws://" + sys.argv[1] + ":3001"
    print(uri)
    async with websockets.connect(uri) as websocket:

        detector = cv2.QRCodeDetector()

        while True:
            # comment the following line to go full-speed (caution! may send a lot of frames ...)
            time.sleep(0.2)
            
            frame = vs.read()

            frame = imutils.resize(frame, width=250)

            barcodes = pyzbar.decode(frame)
            for barcode in barcodes:
                codedata = barcode.data.decode("utf-8")
                print(codedata)
                requests.post('http://' + sys.argv[1] + ':8082/qr', json={'qr': codedata})
                time.sleep(2.0)

            _, im_buf_arr = cv2.imencode(".jpg", frame)

            frame = im_buf_arr.tobytes()
            
            print(str(datetime.now()) + ' > Sending video frame ...')
            await websocket.send(frame)

asyncio.get_event_loop().run_until_complete(scan())
