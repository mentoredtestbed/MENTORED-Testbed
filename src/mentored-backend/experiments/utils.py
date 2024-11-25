from comanage.comanage_api_request import ComanageApiRequest
from rest_framework.permissions import IsAdminUser
from rest_framework import permissions
from .models import Project
from django.contrib.auth.models import User
from django.conf import settings

ROLE_PROJECT_LEADER = 'Project Leader'
ROLE_PROJECT_MANAGER = 'Project Manager'
ROLE_EXPERIMENTER = 'Experimenter'
ROLE_ADMIN = 'Admin'

class IsSuperUser(IsAdminUser):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)

class IsAdmin(permissions.BasePermission):

    def has_permission(self, request, view):
        user_role = get_user_role(request)
        if(user_role == "Admin"):
            return True

        return False

# Check if user is member of a specific project
class IsMemberOfProject(permissions.BasePermission):
    def has_permission(self, request, view):

        project_id = view.kwargs.get('project_id')
        user = request.user

        if project_id is None:
            return False

        try:
            project = Project.objects.get(id = project_id)
            return user in project.users.all()
        except Project.DoesNotExist:
            return False

# Check if user is member of ANY project        
class IsMemberOfAnyProject(permissions.BasePermission):
    def has_permission(self, request, view):

        user = request.user

        return Project.objects.filter(users=user).exists()


def get_user_status_and_organization(request):
    response_user_status = ""
    response_user_organization = ""
    if(request.user.username != ""):
        car = ComanageApiRequest()
        try:
            response_json_co_people = car.get_response_json(car.get_co_people(id = request.user.username))
            print("dasdsad", response_json_co_people)
            response_json_org = car.get_response_json(car.get_org_identity(request.user.username))
            if(response_json_co_people and len(response_json_co_people["CoPeople"]) != 0 and response_json_org and len(response_json_org["OrgIdentities"]) != 0):
                response_user_organization = response_json_org["OrgIdentities"][0]['O']
                response_user_status = response_json_co_people["CoPeople"][0]["Status"]
            else:
                response_user_status = "Inactive"
                response_user_organization = "No Organization Info"
        except Exception as e:
            print(f"No COmanage: {e}")
            response_user_status = "NoCOmanage"
            response_user_organization = "NoCOmanage"
    else:
        response_user_status = "NoUser"
        response_user_organization = "NoUser"

    return response_user_status, response_user_organization

def get_co_person(request):
    car = ComanageApiRequest()
    response = car.get_co_people(id = request.user.username)#car.match_get_status(given = request.user.first_name, family = request.user.last_name)
    return car.get_response_json(response)

def get_user_role(request):
    if settings.RELEASE_MODE != "production":
        return "Admin"

    user = request.user
    user_co_person_id = user.comanageuser.co_person_id
    if user_co_person_id:
        try:
            car = ComanageApiRequest()
            response = car.get_response_json(car.get_coperson_role(user_co_person_id))
            user_role = ''
            if response:
                user_role = response.get('CoPersonRoles')[0].get('Title')
            else:
                user_role = "User has no role"
            return user_role
        except Exception as e:
            print(f"No COmanage: {e}")
            user_role = "NoCOmanage"
    else:
        print("No Co Person ID yet.")
        return None

def get_project_user_role(request, project_id):
    user = request.user
    try:
        user_co_person_id = user.comanageuser.co_person_id
        current_project = Project.objects.get(id=project_id)
        cou_id = current_project.cou_id
        car = ComanageApiRequest()
        response_json = car.get_response_json(car.get_coperson_role(cou_id = cou_id))
        user_role = ""
        if response_json:
            if 'CoPersonRoles' in response_json:
                for role in response_json["CoPersonRoles"]:
                    if role.get("Person").get("Id") == user_co_person_id:
                        user_role = role.get('Title')
                        break
            else:
                user_role = "No User Role Found."
        else:
            user_role = "No Response."
    except Exception as e:
        print(f"No COmanage: {e}")
        user_role = "NoCOmanage"
    return user_role

def get_all_project_user_role(request):
    user = request.user
    projects = Project.objects.filter(users=user)

    if settings.RELEASE_MODE != "production":
        user_role_dict = {}
        for project in projects:
            user_role_dict[project.id] = "Admin"
        return user_role_dict

    user_co_person_id = user.comanageuser.co_person_id

    user_role_dict = {}
    car = ComanageApiRequest()
    for project in projects:
        try:
            cou_id = project.cou_id
            response_json = car.get_response_json(car.get_coperson_role(cou_id = cou_id))
            user_role = ""
            if response_json:
                if 'CoPersonRoles' in response_json:
                    for role in response_json["CoPersonRoles"]:
                        if role.get("Person").get("Id") == user_co_person_id:
                            user_role = role.get('Title')
                            break
                else:
                    user_role = "No User Role Found."
            else:
                user_role = "No Response."
            user_role_dict[project.id] = user_role
        except Exception as e:
            print(f"No COmanage: {e}")
            user_role_dict[project.id] = "No COmanage"



    return user_role_dict


def edit_project_user_role(request, project_id, role_name, user_email):
    # user = request.user
    # user_co_person_id = user.comanageuser.co_person_id
    user = User.objects.get(email=user_email)
    user_co_person_id = user.comanageuser.co_person_id
    current_project = Project.objects.get(id=project_id)
    cou_id = current_project.cou_id
    print("Trying to edit role")
    # Getting the User Role Id to be edited
    car = ComanageApiRequest()
    print("Getting role ID")
    response_id_json = car.get_response_json(car.get_coperson_role(cou_id = cou_id))
    user_role_id = None
    if response_id_json:
        if 'CoPersonRoles' in response_id_json:
            for role in response_id_json["CoPersonRoles"]:
                if role.get("Person").get("Id") == user_co_person_id:
                    user_role_id = role.get('Id')
                    break
        else:
            user_role_id = "No User Role Found."
    else:
        user_role_id = "No Response."
    # if response_id_json:
    #     if 'CoPersonRoles' in response_id_json:
    #         co_person_role = response_id_json.get('CoPersonRoles')
    #         print('co_person_response ', co_person_role)
    #         if len(co_person_role) != 0:
    #             user_role_id = co_person_role[0].get('Id')
    #     else:
    #         user_role_id = "No User Role Found."
    # else:
    #     user_role_id = "No Response."

    # Getting User Affiliation
    response_aff = car.get_response_json(car.get_coperson_role(user_co_person_id))
    user_aff = ''
    if response_aff:
        user_aff = response_aff.get('CoPersonRoles')[0].get('Affiliation')

    # Changing the User Role Id
    print("Person Role Id", user_role_id)
    print("Role Name", role_name)
    print("User Co Person Id", user_co_person_id)
    print("COU ID", cou_id)
    print("User Aff", user_aff)

    response_edit = car.edit_coperson_role_cou(person_role_id=user_role_id, role_name=role_name, person_id=user_co_person_id, cou_id=cou_id,person_affiliation=user_aff)

    return response_edit

def remove_project_user_role(request, cou_id, user_co_person_id):
    print(f"Removing cou_id {cou_id} from co_person {user_co_person_id}")
    car = ComanageApiRequest()
    response_id_json = car.get_response_json(car.get_coperson_role(cou_id = cou_id))
    print("Response: ", response_id_json)
    user_role_id = None
    if response_id_json:
        if 'CoPersonRoles' in response_id_json:
            for role in response_id_json["CoPersonRoles"]:
                if role.get("Person").get("Id") == user_co_person_id:
                    user_role_id = role.get('Id')
                    break
        else:
            user_role_id = "No User Role Found."
    else:
        user_role_id = "No Response."
    try:
        car.remove_coperson_role_cou(person_role_id=user_role_id)
        return "Ok"
    except:
        print("Error Deleting User Role")
    return "Error"

def generateNamespace():
    return "grupo-2"
    # counter = 1
    # while True:
    #     unique_string = f"namespace-{counter}"
    #     if not Project.objects.filter(namespace_name = unique_string).exists():
    #         return unique_string
    #     counter += 1
