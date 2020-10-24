from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse
from django.core.paginator import Paginator

from .models import User, Like, Post, Follow

pag_num = 10; #amount of pages for paginator


def index(request):
    
    print(request)
    return render(request, "network/index.html")


def all_posts(request):
    print("starting all posts")
    if request.method == "GET":
        print('test1')
        pag_num = request.GET.get('page', None)
        print('test2')
        print(f'we passed the var: {pag_num}')
        posts = Post.objects.all()
        print( f'all our posts: {posts}')
        pages = Paginator(posts, pag_num)
        page = pages.page(pag_num)
        print(f'our current page num: {pag_num} and our page content: {page}')
        return JsonResponse(page.object_list ,safe = False)
        
    else:
        print(request.body)
        print(f'our request header: {request.headers}')
        #return all posts in POST database
        return HttpResponse("all posts")


def following(request, id):
    #going to have to do a check for the following user?
    print("starting the following func")
    if request.method == "GET":
        return JsonResponse({"user": "post"})

    else:
        print(request)
        #return all posts for who the user follows
        return JsonResponse({"user": "post"})

def user(request, id):
    if request.method == "GET":
        page = request.GET['page']
        print(f' Our page passed through query was: {page}')

    if request.user:
        return JsonResponse({"userposts": "posts"})

    else:

        return JsonResponse({"userposts": "posts"})
        

def get_user(request):
    if request.method == "GET":

        if request.user:
            print(f'our usernameid is: {request.user.id}')
            return JsonResponse({"id" : request.user.id})
        else:
            return JsonResponse({"id" : "no username in get"})


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
