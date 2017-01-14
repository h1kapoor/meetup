from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return render(request, 'webapp/home.html')

def join(request):
    return render(request, 'webapp/join.html')
