class Manifest():
    def __init__(self, kind, type, run, stop, path):
        self._kind = kind
        self._type = type
        self._run = run
        self._stop = stop
        self._path = path
        self._started = False
        self._dropped = False

    @property
    def kind(self):
        return self._kind

    @kind.setter
    def kind(self, kind):
        self._kind = kind

    @property
    def started(self):
        return self._started

    @started.setter
    def started(self, bool):
        self._started = bool

    @property
    def dropped(self):
        return self._dropped

    @dropped.setter
    def dropped(self, bool):
        self._dropped = bool

    @property
    def type(self):
        return self._type

    @type.setter
    def type(self, type):
        self._type = type

    @property
    def run(self):
        return self._run

    @run.setter
    def run(self, run):
        self._run = run

    @property
    def stop(self):
        return self._stop

    @stop.setter
    def stop(self, stop):
        self._stop = stop

    @property
    def path(self):
        return self._path

    @path.setter
    def path(self, path):
        self._path = path

    def __repr__(self):
        return f'Manifest {self._type}, {self._run}, {self._stop}, {self._path}, {self._started}, {self._dropped}'