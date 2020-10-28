from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse
from django.core.paginator import Paginator
import json


from .models import User, Like, Post, Follow

pag_num = 10; #amount of pages for paginator


def index(request):
    
    print(request)
    return render(request, "network/index.html")




def paginationJson(posts, curr_page, likes=None, user=None, following=None, followed=None):
            
    pages = Paginator(posts, pag_num)
    page = pages.get_page(curr_page)
    
    data = {}
    position = 1
    print(f'Our user entered was: {user}')
    if(user == None ):
        data[0] = [page.has_next(), page.has_previous(), None, following, followed]
        for item in page:

            data[f'{position}'] = [item.user.username, item.text, item.total_likes, item.time.strftime("%m/%d/%Y, %H:%M:%S"), item.user.id, False, item.id]
            position = position + 1
            print(f'item: {item.text}, {item.user.username}, {item.total_likes}, {item.time.strftime("%m/%d/%Y, %H:%M:%S")}, {item.user.id}')


    else:
        data[0] = [page.has_next(), page.has_previous(), user.username, following, followed]
        print('trying to find all objects in the first page')
        for item in page:
            print(f' does object like exist? {likes.filter(post=item).exists()}')
            if likes.filter(post=item).exists() == True:
                likes_filt = likes.filter(post=item)
                likes_filt = likes_filt.order_by('-id')
                print(f' the object for the item has a value of: {likes_filt[0].like} for like from the user: {likes_filt[0].user.username}')

            if(likes != None and likes.filter(post=item).exists() and likes.filter(post=item).order_by('-id')[0].like == True):
                wasLiked = True
            else:
                wasLiked = False

            data[f'{position}'] = [item.user.username, item.text, item.total_likes, item.time.strftime("%m/%d/%Y, %H:%M:%S"), item.user.id, wasLiked, item.id]
            position = position + 1
            print(f'item: {item.text}, {item.user.username}, {item.total_likes}, {item.time.strftime("%m/%d/%Y, %H:%M:%S")}, {item.user.id}')

    print(f'our current page num: {pag_num} and our page content: {data}')
    print(json.dumps(data))

    return data


def all_posts(request):
    print("starting all posts")
    if request.method == "GET":
        curr_page = request.GET.get('page', None)

        posts = Post.objects.all()

        #TODO add in an option for an unsigned in user
        print(f'our requests user id is: {request.user.id}')
        if(request.user.id != None):
            requesting_id = request.user.id
            requesting_user = User.objects.get(id=requesting_id)
            likes = Like.objects.filter(post__in=posts, user=requesting_user, like=True)
            for like in likes:
                print(f'user {like.user.username} liked post: {like.post.text}')
            
            data = paginationJson(posts, curr_page, likes, requesting_user)


            return JsonResponse(data,safe = False)
        else:
            data = paginationJson(posts, curr_page)


            return JsonResponse(data,safe = False)

        
    else:
        #return all posts in POST database
        return HttpResponse("all posts")


def following(request, id):
    #going to have to do a check for the following user to make sure its' same as user
    #don't want to allow users to see others following?
    print("starting the following func")
    if request.method == "GET":
        curr_page = request.GET.get('page', None)
        #need to filter to only following users
        user = User.objects.get(id=id)
        following = Follow.objects.filter(following_user=user)
        posts = Post.objects.filter(user__in=following.values_list('followed_user', flat=True))
        #TODO add in an option for an unsigned in user
        requesting_id = request.user.id
        requesting_user = User.objects.get(id=requesting_id)
        likes = Like.objects.filter(post__in=posts, user=requesting_user, like=True)
        data = paginationJson(posts, curr_page,  likes, user)

        return JsonResponse(data,safe = False)

    else:
        print(request)
        #return all posts for who the user follows
        return JsonResponse({"user": "post"})

def user(request, id):
    if request.method == "GET":
        curr_page = request.GET.get('page', None)
        #need to filter to only following users
        user = User.objects.get(id=id)
        posts = Post.objects.filter(user=user)

        #following is how many users follow the user with id
        #followers is how many users id follows

        following = Follow.objects.filter(followed_user = user).count()
        followed = Follow.objects.filter(following_user = user).count()

        requesting_id = request.user.id
        requesting_user = User.objects.get(id=requesting_id)
        likes = Like.objects.filter(post__in=posts, user=requesting_user, like=True)
        data = paginationJson(posts, curr_page, likes, user, following, followed)

        return JsonResponse(data,safe = False)
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
