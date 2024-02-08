# MENTORED Deployment

## Requirements

- Docker version >= 24.0.2
- docker-compose version >= 1.29.2


## Quick start

Clone the project, build and run the containers.
The `frontend-build` container generate static files, and should be executed at least once.

```bash
git clone git@github.com:mentoredtestbed/mentored-testbed-deployment.git
cd mentored-testbed-deployment
git submodule update --init --recursive
```

Now copy/create your private files into the current directory:
```
cp ~/.kube/config ./kubeconfig # Change the first path to the path where is your kubeconfig file
```

If you will use production mode, SSL certificates are required.
The following commands are examples to copy the certificates.
Change the paths as required in your system
```bash
ln -s /etc/letsencrypt/live/example-dns/cert.pem cert.cer
ln -s /etc/letsencrypt/live/example-dns/privkey.pem cert.key

```

### Configuration

#### Environment Variables
Create a `.env` file copying `.env.example` and change the values as you want to:

```bash
cp .env.example .env
nano .env // edit the .env file here
```

Your `.env` file should look like this
```
VITE_API_BASE_URL=https://portal.mentored.ccsc-research.org
VITE_WEBKUBECTL_URL=https://portal.mentored.ccsc-research.org:8080
```
- `API_BASE_URL`: Url hosting the REST api in `/api`, tutorial in `/tutorial/` and the frontend in `/`
- `VITE_WEBKUBECTL_URL`: Url hosting a Webkubectl server

#### SP DJANGO Certificates

Create a `certificates/` directory in the root of the project, which should contain two files: `mycert.pem` and `mykey.pem`.
You can follow the steps described [here in the SP-DJANGO Project](https://git.rnp.br/gidlab/sp-django-python)

### Running

Running the server using dev mode:
```bash
docker-compose up --build # After the first run, you can run docker-compose up --build nginx-server to save time (unless you want to update something in the front-end/backend)
```

If you want to run the server using production mode:
```bash
docker-compose -f docker-compose-prod.yml up -d --build
```

### Starting the database
In another tab, enter inside the mentored-backend container using the following commands
```bash
docker exec -it mentored-testbed-deployment_mentored-backend_1 /bin/bash
python3 manage.py makemigrations
python3 manage.py migrate
python3 manage.py createsuperuser
python3 manage.py collectstatic
exit
```
