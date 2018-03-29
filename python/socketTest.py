# test file
# import websocket

# self.ws = websocket.WebSocketApp("ws://localhost:5620",
#                                  on_error=self.on_error,
#                                  on_message=self.on_message,
#                                  on_close=self.on_close)

# self.ws.on_open = self.on_open
# self.uri = '/sensor/light'


# def on_open(self, ws):
#     self.ws = ws
#     print_debug('[swim] socket opened')
#     ws.send(
#         '@command(node:"/sensor/light",lane:"register_self"){uri:"' + self.uri + "'}")
#     self.closed = False

import websocket
try:
    import thread
except ImportError:
    import _thread as thread
import time

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws):
    print("### closed ###")

def on_open(ws):
    def run(*args):
        for i in range(3):
            time.sleep(1)
            ws.send("Hello %d" % i)
        time.sleep(1)
        ws.close()
        print("thread terminating...")
    thread.start_new_thread(run, ())


if __name__ == "__main__":
    websocket.enableTrace(True)
    ws = websocket.WebSocketApp("ws://echo.websocket.org/",
                              on_message = on_message,
                              on_error = on_error,
                              on_close = on_close)
    ws.on_open = on_open
    ws.run_forever()
    