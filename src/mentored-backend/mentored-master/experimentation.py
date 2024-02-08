#!/usr/bin/python3

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

from manifest import Manifest
from tables import Experiment, ExperimentInfo
from datetime import datetime
import yaml, csv

engine = create_engine('sqlite:///resources/db')
Session = sessionmaker(bind=engine)


class Experimentation:

    def __init__(self, yaml_file):
        self.session = Session()
        config = yaml.load(open(yaml_file), Loader=yaml.FullLoader)["Schedule"]
        exp = config["Experiment"]
        object = Experiment(
            name=exp["name"],
            description=exp["description"],
            time=exp["time"],
            project=config["project"],
            author=config["author"],
            date=datetime.now()
        )
        self.session.add(object)
        self.session.commit()
        self._experimentation = object
        self._manifests = []
        for manifest in exp["manifests"]:
            self._manifests.append(
                Manifest(
                    kind=manifest['kind'],
                    type=manifest['type'],
                    run=manifest['run'],
                    stop=manifest['stop'],
                    path=manifest['path']
                )
            )
        
        server_ip = None

    @property
    def manifests(self):
        return self._manifests

    @property
    def experimentation(self):
        return self._experimentation

    def set_info(self, data_info):
        for each in data_info:
            info = ExperimentInfo(
                experiment=self._experimentation,
                node=each['node'],
                pod_type=each['actor'],
                scaled=each['scaled'],
                running=each['running'],
                date=datetime.now().replace(second=0, microsecond=0)
            )
            info.id_experiment = self._experimentation
            self.session.add(info)
            self.session.commit()

    def export_csv(self):
        file_name = self.experimentation.name + "_" + str(self.experimentation.id) + ".csv"
        result = self.session.query(ExperimentInfo).filter_by(experiment=self.experimentation).all()
        ints = inspect(ExperimentInfo)
        attr_names = [c_attr.key for c_attr in ints.mapper.column_attrs]
        with open("./csv/"+file_name, "w") as file:
            writer = csv.writer(file)
            writer.writerow(attr_names)
            for data in result:
                writer.writerow(data.to_list())
