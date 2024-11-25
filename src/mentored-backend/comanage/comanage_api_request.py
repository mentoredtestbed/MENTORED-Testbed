from requests.auth import HTTPBasicAuth
import requests
import json
import urllib3
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class ComanageApiRequest:

    def __init__(self):

        self.DOMAIN = os.getenv('DOMAIN', 'localhost')
        self.COMANAGE_API_USER = os.getenv('COMANAGE_API_USER', 'professora')
        self.COMANAGE_API_PASS = os.getenv('COMANAGE_API_PASS', 'api_key')
        self.COMANAGE_API_URL = f'https://{self.DOMAIN}/registry/'
        self.COMANAGE_API_CO_ID = os.getenv('COMANAGE_API_CO_ID', 'co_id')

        self.auth = HTTPBasicAuth(self.COMANAGE_API_USER, self.COMANAGE_API_PASS)

    def print_credentials(self):
        print("User: " + self.COMANAGE_API_USER)
        print("Pass: " + self.COMANAGE_API_PASS)
        print("URL: " + self.COMANAGE_API_URL)
        print("CO_ID: " + self.COMANAGE_API_CO_ID)

    def get_cos(self):
        self.end_point = f'cos.json'
        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
        except requests.exceptions.RequestException as e:
            print(e)

        return response
    
    def get_cous(self):
        self.end_point = f'cous.json'
        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
        except requests.exceptions.RequestException as e:
            print(e)

        return response
    
    def get_co_people(self, id = None):
        if id:
            self.end_point = f'co_people.json?coid={self.COMANAGE_API_CO_ID}&search.identifier={id}'
        else:
            self.end_point = f'co_people.json'
        
        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
            response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")  # HTTP error, such as 404 or 500
        except requests.exceptions.ConnectionError as conn_err:
            print(f"Connection error occurred: {conn_err}")  # Error connecting to the API
        except requests.exceptions.Timeout as timeout_err:
            print(f"Timeout error occurred: {timeout_err}")  # Request timed out
        except requests.exceptions.RequestException as req_err:
            print(f"Request error occurred: {req_err}")  # Other requests-related errors

        return response
    
    def get_org_identities(self):
        self.end_point = f'org_identities.json'
        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
            response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")  # HTTP error, such as 404 or 500
        except requests.exceptions.ConnectionError as conn_err:
            print(f"Connection error occurred: {conn_err}")  # Error connecting to the API
        except requests.exceptions.Timeout as timeout_err:
            print(f"Timeout error occurred: {timeout_err}")  # Request timed out
        except requests.exceptions.RequestException as req_err:
            print(f"Request error occurred: {req_err}")  # Other requests-related errors

        return response
    
    def get_names(self, id):
        if id:
            self.end_point = f'names.json?copersonid={id}'
        else:
            self.end_point = f'names.json'
        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
            response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")  # HTTP error, such as 404 or 500
        except requests.exceptions.ConnectionError as conn_err:
            print(f"Connection error occurred: {conn_err}")  # Error connecting to the API
        except requests.exceptions.Timeout as timeout_err:
            print(f"Timeout error occurred: {timeout_err}")  # Request timed out
        except requests.exceptions.RequestException as req_err:
            print(f"Request error occurred: {req_err}")  # Other requests-related errors

        return response
    
    def match_get_status(self, given = '', family = '', email = ''):
        self.end_point = f'co_people.json?coid={self.COMANAGE_API_CO_ID}'
        
        given_part = f'&given={given}' if given != '' else ''
        family_part = f'&family={family}' if family != '' else ''
        mail_part = f'&mail={email}' if email != '' else ''
        
        self.end_point += given_part + family_part + mail_part
        print(self.end_point)
        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
        except requests.exceptions.RequestException as e:
            print(e)
            
        return response

    def get_org_identity(self, eppn):
        self.end_point = f'org_identities.json?coid={self.COMANAGE_API_CO_ID}&search.identifier={eppn}'
        print(self.end_point)
        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
        except requests.exceptions.RequestException as e:
            print(e)

        return response
    
    def add_cou(self, project_name = None, description = None):
        self.end_point = f'cous.json'

        request_body = {
                "RequestType":"Cous",
                "Version":"1.0",
                "Cous":
                [
                    {
                    "Version":"1.0",
                    "CoId":self.COMANAGE_API_CO_ID,
                    "Name":project_name,
                    "Description":description,
                    }
                ]
        }


        response = None
        try:
            response = requests.post(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False, json = request_body)
        except requests.exceptions.RequestException as e:
            print(e)

        return response

    def add_coperson_role(self, role_name = None, project_id = None, person_id = None, person_affiliation = None):
        self.end_point = f'co_person_roles.json'
        print(self.end_point)
        print(role_name, project_id, person_id, person_affiliation)

        request_body = {
            "RequestType":"CoPersonRoles",
            "Version":"1.0",
            "CoPersonRoles":
            [
                {
                "Version":"1.0",
                "Person":
                {
                    "Type":"CO",
                    "Id":person_id
                },
                "CouId":project_id,
                "Affiliation":person_affiliation,
                "Title":role_name,
                "Status":"Active",
                }

            ]
        }

        print(request_body)

        response = None
        try:
            response = requests.post(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False, json = request_body)
        except requests.exceptions.RequestException as e:
            print(e)

        return response

    def edit_coperson_role(self, person_role_id, role_name, person_id, person_affiliation = None):
        self.end_point = f'/co_person_roles/{person_role_id}.json'
        
        #print(role_name, project_id, person_id, person_affiliation)

        request_body = {
            "RequestType":"CoPersonRoles",
            "Version":"1.0",
            "CoPersonRoles":
            [
                {
                "Version":"1.0",
                "Person":
                {
                    "Type":"CO",
                    "Id":person_id
                },
                "Affiliation":person_affiliation,
                "Title":role_name,
                "Status":"Active"

                }
            ]
        }


        response = None
        try:
            response = requests.put(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False, json = request_body)
        except requests.exceptions.RequestException as e:
            print(e)

        return response
    
    def edit_coperson_role_cou(self, person_role_id, role_name, person_id, cou_id, person_affiliation = None):
        self.end_point = f'/co_person_roles/{person_role_id}.json'
        
        #print(role_name, project_id, person_id, person_affiliation)

        request_body = {
            "RequestType":"CoPersonRoles",
            "Version":"1.0",
            "CoPersonRoles":
            [
                {
                "Version":"1.0",
                "Person":
                {
                    "Type":"CO",
                    "Id":person_id
                },
                "CouId":cou_id,
                "Affiliation":person_affiliation,
                "Title":role_name,
                "Status":"Active"
                }
            ]
        }


        response = None
        try:
            response = requests.put(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False, json = request_body)
        except requests.exceptions.RequestException as e:
            print(e)

        return response
    
    def remove_coperson_role_cou(self, person_role_id):
        self.end_point = f'/co_person_roles/{person_role_id}.json'

        response = None
        try:
            response = requests.delete(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
        except requests.exceptions.RequestException as e:
            print(e)

        return response


    def get_cous(self, id = None):
        if id:
            self.end_point = f'cous/{id}.json'
        else:
            self.end_point = f'cous.json'

        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
        except requests.exceptions.RequestException as e:
            print(e)

        return response

    def get_coperson_role(self, person_id = None, cou_id = None):
        if person_id:
            self.end_point = f'co_person_roles.json?copersonid={person_id}'
        elif cou_id:
            self.end_point = f'co_person_roles.json?couid={cou_id}'
        else:
            self.end_point = f'co_person_roles.json'

        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
            response.raise_for_status()
        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP error occurred: {http_err}")  # HTTP error, such as 404 or 500
        except requests.exceptions.ConnectionError as conn_err:
            print(f"Connection error occurred: {conn_err}")  # Error connecting to the API
        except requests.exceptions.Timeout as timeout_err:
            print(f"Timeout error occurred: {timeout_err}")  # Request timed out
        except requests.exceptions.RequestException as req_err:
            print(f"Request error occurred: {req_err}")  # Other requests-related errors

        return response
    
    def get_co_groups(self, id = None):
        if id:
            self.end_point = f'co_groups.json?coid={self.COMANAGE_API_CO_ID}&search.identifier={id}'
        else:
            self.end_point = f'co_groups.json'

        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
        except requests.exceptions.RequestException as e:
            print(e)

        return response
    
    def get_co_group_members(self, group_id=None):
        if group_id:
            self.end_point = f'co_group_members.json?cogroupid={group_id}'
        else:
            self.end_point = f'co_group_members.json'

        response = None
        try:
            response = requests.get(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False)
        except requests.exceptions.RequestException as e:
            print(e)

        return response
        

    def add_identifier(self, group_id):
        self.end_point = f'identifiers.json'
        print(self.end_point)

        request_body = {
            "RequestType":"Identifiers",
            "Version":"1.0",
            "Identifiers":
            [
                {
                "Version":"1.0",
                "Type":"uid",
                "Identifier":"Teste123",
                "Login":True,
                "Person":{"Type":("Group"),"Id":group_id},
                "Status":"Active"
                }
            ]
        }

        print(request_body)

        response = None
        try:
            response = requests.post(self.COMANAGE_API_URL + self.end_point, auth=self.auth, verify=False, json = request_body)
        except requests.exceptions.RequestException as e:
            print(e)

        return response

    def get_response_status(self, response):
        if response.status_code == 200 or response.status_code == 201:
            print(response)
            try:
                print(json.dumps(response.json(), indent=2))
            except ValueError as e:
                print("Edited.")
            return response.status_code
        elif response.status_code == 401:
            print(str(response.status_code) + " - Unauthorized.")
            return response.status_code
        elif response.status_code == 400:
            print(str(response.status_code) + " - Bad Request")
            print(response)
            try:
                print(json.dumps(response.json(), indent=2))
            except ValueError as e:
                pass

            return response.status_code
        elif response.status_code == 403:
            print(str(response.status_code) + " - Name In Use")
            try:
                print(json.dumps(response.json(), indent=2))
            except ValueError as e:
                pass

            return response.status_code
        else:
            print(response)

        return "500 - Other Error"

    def get_response_json(self, response):
        if response.status_code == 200 or  response.status_code == 201:
            return response.json()
        elif(response.status_code == 502):
            raise RuntimeError("COmanage is currently unavailable.")
        
        return None