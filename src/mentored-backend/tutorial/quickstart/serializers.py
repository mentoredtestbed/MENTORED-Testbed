from django.contrib.auth.models import User, Group
# from tutorial.quickstart.models import Experiment
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ['url', 'username', 'email', 'groups', 'password']

        read_only_fields = ('is_active', 'is_staff')
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        user = super(UserSerializer, self).create(validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ['url', 'name']

# class ExperimentSerializer(serializers.HyperlinkedModelSerializer):
#     class Meta:
#         model = Experiment
#         fields = ['exp_name']
