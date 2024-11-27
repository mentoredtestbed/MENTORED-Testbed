from sqlalchemy import Integer, Column, String, DATETIME, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class ExperimentInfo(Base):
    __tablename__ = 'experiment_info'
    id = Column(Integer, primary_key=True)
    id_experiment = Column(Integer, ForeignKey('experiment.id'))
    node = Column(String)
    pod_type = Column(String)
    scaled = Column(Integer)
    running = Column(Integer)
    date = Column(DATETIME)
    experiment = relationship('Experiment')

    def to_dict(self):
        return {
            "id": self.id,
            "id_experiment": self.id_experiment,
            "node": self.node,
            "pod_type": self.pod_type,
            "scaled": self.scaled,
            "running": self.running,
            "date": self.date.strftime('%Y-%m-%d %H:%M:%S')
        }

    def to_list(self):
        return [str(self.id), str(self.id_experiment), self.node, self.pod_type, str(self.scaled), str(self.running), self.date.strftime('%Y-%m-%d %H:%M:%S')]

class Experiment(Base):
    __tablename__ = 'experiment'
    id = Column(Integer, primary_key=True)
    name = Column(String)
    description = Column(String)
    time = Column(Integer)
    project = Column(String)
    author = Column(String)
    date = Column(DATETIME)
    infos = relationship(ExperimentInfo, backref="experiments")

    def __repr__(self):
        return f'Experiment {self.id}, {self.name}, {self.description}, {self.project}, {self.author}, {self.date}'
