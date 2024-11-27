# Mentored Master

Mentored Master is a comprehensive solution designed to streamline the management and deployment of experimental testbeds for cybersecurity research. This project provides a robust platform that supports the deployment, execution, and analysis of various cybersecurity experiments, leveraging modern technologies and frameworks to ensure scalability and flexibility.

## Features

- **Dynamic Testbed Creation**: Users can dynamically create and configure testbeds tailored to specific cybersecurity experiments.
- **Automated Experiment Management**: Automates the setup, execution, and teardown of experiments, making it easier for researchers to focus on their analysis.
- **Real-Time Monitoring and Logging**: Offers real-time data monitoring capabilities and comprehensive logging to track experiment progress and results.
- **Security Focused**: Built with security as a priority, incorporating best practices and tools to safeguard the experimental data and infrastructure.
- **Result management**: Provides a comprehensive system for managing experiment results, including data storage, analysis, and visualization tools.- Result management: Provides a comprehensive system for managing experiment results, including data storage, analysis, and visualization tools.
- **Warmup tools**: Provides a set of tools to warm up the testbed environment before running experiments, ensuring that all necessary resources are properly initialized and ready for use.
- **Experiment tools**: Provides a set of tools to run and manage experiments, including configuration options, data collection, analysis capabilities and metadata that will be available to each pod when the experiment start.

## Getting Started

### Prerequisites

Before you install and run Mentored Master, make sure you have the following installed:
- Docker
- Kubernetes
   - You must have a file in the `~/.kube/config` path
- Any additional dependencies listed in the future in a `requirements.txt` file.

### Installation

To set up the Mentored Master on your local machine for development and testing purposes, follow these steps:

**Clone the repository:**
```bash
   git clone https://github.com/mentoredtestbed/mentored-master.git
```

### Running

In the `core` directory you can have access to different class files used to create and manage different Kubernetes resources.

Use MentoredExperiment.py to create an experiment. You can do this using the following command.

```bash
python3 MentoredExperiment.py -f $yamlname -d -n $namespace
```

In this example, `$yamlname` is the path to an experriment definition, and `$namespace` is the name of the Kubernetes namespace where the experiment will be executed. 