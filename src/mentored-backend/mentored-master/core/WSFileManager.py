from websocket import ABNF
import select
from kubernetes.stream.ws_client import STDOUT_CHANNEL, STDERR_CHANNEL

class WSFileManager:
    """
    WS wrapper to manage read and write bytes in K8s WSClient
    """

    def __init__(self, ws_client):
        """

        :param wsclient: Kubernetes WSClient
        """
        self.ws_client = ws_client

    def read_bytes(self, timeout=0):
        """
        Read slice of bytes from stream

        :param timeout: read timeout
        :return: stdout, stderr and closed stream flag
        """
        stdout_bytes = None
        stderr_bytes = None

        if self.ws_client.is_open():
            if not self.ws_client.sock.connected:
                self.ws_client._connected = False
            else:
                r, _, _ = select.select(
                    (self.ws_client.sock.sock, ), (), (), timeout)
                if r:
                    op_code, frame = self.ws_client.sock.recv_data_frame(True)
                    if op_code == ABNF.OPCODE_CLOSE:
                        self.ws_client._connected = False
                    elif op_code == ABNF.OPCODE_BINARY or op_code == ABNF.OPCODE_TEXT:
                        data = frame.data
                        if len(data) > 1:
                            channel = data[0]
                            data = data[1:]
                            if data:
                                if channel == STDOUT_CHANNEL:
                                    stdout_bytes = data
                                elif channel == STDERR_CHANNEL:
                                    stderr_bytes = data
        return stdout_bytes, stderr_bytes, not self.ws_client._connected