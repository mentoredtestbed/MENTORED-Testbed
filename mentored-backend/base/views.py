from django.shortcuts import render, redirect, reverse
from django.contrib.auth.decorators import login_required
from django.contrib import auth
from django.http import HttpResponse
from django.template import loader


# Create your views here.
def index(request):
    if request.user.is_authenticated:
        return redirect('/users')
    return render(request, 'base/index.html')

#@login_required(redirect_field_name='target')
@login_required
def users(request):
    template = loader.get_template('base/users.html')
    meta = request.META
    print(meta)
    return HttpResponse(template.render(meta, request))
