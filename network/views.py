from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.http import JsonResponse
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
import json


from .models import User, Like, Post, Follow

pag_num = 10; #amount of pages for paginator


def paginationJson(posts, curr_page, likes=None, user=None, following=None, followed=None, user_page=None):
            
    pages = Paginator(posts, pag_num)
    page = pages.get_page(curr_page)
    
    data = {}
    position = 1
    if(user == None and user_page != None):
        data[0] = [page.has_next(), page.has_previous(), user_page.username, following, followed, None]
        for item in page:

            data[f'{position}'] = [item.user.username, item.text, item.total_likes, item.time.strftime("%m/%d/%Y, %H:%M:%S"), item.user.id, False, item.id]
            position = position + 1

        print(data['1'][0])
        data[0][2] = data['1'][0]
    elif(user_page == None and user != None):
        data[0] = [page.has_next(), page.has_previous(), user.username, following, followed, user.id ]
        for item in page:
            if likes.filter(post=item).exists() == True:
                likes_filt = likes.filter(post=item)
                likes_filt = likes_filt.order_by('-id')

            if(likes.filter(post=item).exists() and likes.filter(post=item).order_by('id')[0].like == True):
                wasLiked = True
            else:
                wasLiked = False

            data[f'{position}'] = [item.user.username, item.text, item.total_likes, item.time.strftime("%m/%d/%Y, %H:%M:%S"), item.user.id, wasLiked, item.id]
            position = position + 1

    elif(user_page != None and user != None):
        data[0] = [page.has_next(), page.has_previous(), user_page.username, following, followed, user_page.id ]
        for item in page:
            if likes.filter(post=item).exists() == True:
                likes_filt = likes.filter(post=item)
                likes_filt = likes_filt.order_by('-id')

            if(likes.filter(post=item).exists() and likes.filter(post=item).order_by('id')[0].like == True):
                wasLiked = True
            else:
                wasLiked = False

            data[f'{position}'] = [item.user.username, item.text, item.total_likes, item.time.strftime("%m/%d/%Y, %H:%M:%S"), item.user.id, wasLiked, item.id]
            position = position + 1


        
    elif(user_page == None and user == None):
        data[0] = [page.has_next(), page.has_previous(), None, following, followed, None ]
        for item in page:

            data[f'{position}'] = [item.user.username, item.text, item.total_likes, item.time.strftime("%m/%d/%Y, %H:%M:%S"), item.user.id, None, item.id]
            position = position + 1


    return data


def index(request):
    
    print(request)
    return render(request, "network/index.html")

#i'm going to follow bad practice here and not worry about the CSRF token because It's a not hosted (i would add it into cache with django and call it in js and add it as a JSON header)
@csrf_exempt
def create_post(request):
    if request.method == "POST":
        print('starting creating a post')
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        text = body['text']
        print(f'our recieved post text: {text}')
        user_id = body['user_id']
        user = User.objects.get(id=user_id)
        print(f' our request.user was: {request.user}')
        print(f'our input for user id in body was: {user_id}')
        print(f'while the request id was: {request.user.id}')

        if(int(user_id) == int(request.user.id)):
            p = Post(text=text,user=user,total_likes=0)
            p.save()
            return JsonResponse({'Post Created': 'true'})
        else:
            return JsonResponse({'message': 'not auth'}, status=401)
    else:
         return JsonResponse({'message': 'not a post'}, status=401)

@csrf_exempt
def get_post_text(request, id):
    if request.method == "GET":
        post = Post.objects.get(id=id)
        return JsonResponse({'text': f'{post.text}'})
    
    


@csrf_exempt
def edit_post(request):
    if request.method == "POST":
  
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        post_id = body['id']
        text = body['text']
        user_id = body['user']
        request_id = request.user.id
        if(int(user_id) == int(request.user.id)):
            post = Post.objects.get(id=post_id)
            post.text = text
            post.save()
        else:
            return JsonResponse({'message': 'not auth'}, status=401)


        

#i'm going to follow bad practice here and not worry about the CSRF token because It's a not hosted (i would add it into cache with django and call it in js and add it as a JSON header)
@csrf_exempt
def like_post(request, post_id, user_id):
    if request.method == "POST":
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        
        print('looking at post request')
        for item in body:
            print(f'our request post: {item}')
        if body['action'] == 'like':
            post = Post.objects.get(id=post_id)
            user = User.objects.get(id=user_id) 
            check_like = Like.objects.filter(user=user,post=post).order_by('id')
            

            if(check_like.exists()):
                print('++there was a previous record of liking this post')


                like = check_like[0]
                print(f'our current like state is now: {like.like} (should be False)')

                like.like = True
                like.save()
                print(f'our current like state is now: {like.like} (should be True)')

                
                post_likes = post.total_likes
                print(post_likes)
                total = post_likes + 1
                post.total_likes = total
                post.save()
                post_likes = post.total_likes
                print(post_likes)

                return JsonResponse({'like': 'liked', 'total': total})



            else:
                print('--there was no previous record of liking this post')


                #need to check if it exists before creating a new one.
                like = Like( user=user, post=post, like=True  )
                like.save()
                print(f'our current like state is now: {like.like} (should be True)')

                
                post_likes = post.total_likes
                print(post_likes)
                total = post_likes + 1
                post.total_likes = total
                post.save()
                post_likes = post.total_likes
                print(post_likes)
                
                

                return JsonResponse({'like': 'liked', 'total': total})
        elif body['action'] == 'unlike':
            print('post was just unliked')
            post = Post.objects.get(id=post_id)
            user = User.objects.get(id=user_id)
            if Like.objects.filter(user=user, post=post).exists():
                #this means the post is there
                like = Like.objects.filter(user=user, post=post).order_by('id')[0]
                
                print(f'our current like state is now: {like.like} (should be True)')

                like.like = False
                like.save()
                print(f'our current like state is now: {like.like} (should be false)')

                post_likes = post.total_likes
                
                total = post_likes - 1
                post.total_likes = total
                post.save()
                post_likes = post.total_likes
                
            
                

                
                #TODO update total for table post
                return JsonResponse({'like': 'unliked' , 'total':total})

            else:
                return JsonResponse({'like': 'error'})

    
    else:
        return JsonResponse('get')


#i'm going to follow bad practice here and not worry about the CSRF token because It's not hosted (i would add it into cache and call it in js and add it as a JSON header)
@csrf_exempt
def follow_user(request, user_id, user_to_follow):
    user_following = User.objects.get(id=user_id)
    user_followed = User.objects.get(id=user_to_follow)
    if request.method == 'GET':
        
        follow_item = Follow.objects.filter(following_user=user_following,followed_user=user_followed)
        if(follow_item.exists()):
            return JsonResponse({'status': 'True'})
        else:
            return JsonResponse({'status': 'False'})

        #return if the user is followed
        #make sure to clarify the request has the same user id
        
    
    elif request.method == 'POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        for item in body:
            print(f'our request post: {item}')

        print(body['action'] )

        #make sure to clarify the request has the same user id
        # change the db to have a follow entry.
        if body['action'] == 'true':

            foll = Follow(following_user=user_following,followed_user=user_followed)
            foll.save()
            return JsonResponse({'followed':'user followed'})
        elif body['action'] == 'false':
            Follow.objects.filter(following_user=user_following,followed_user=user_followed).delete()
            return JsonResponse({'followed':'user unfollowed'})







def all_posts(request):
    if request.method == "GET":
        curr_page = request.GET.get('page', None)

        posts = Post.objects.all().order_by('-time')

        #TODO add in an option for an unsigned in user
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
    if request.method == "GET":
        curr_page = request.GET.get('page', None)
        #need to filter to only following users
        user = User.objects.get(id=id)
        following = Follow.objects.filter(following_user=user)
        posts = Post.objects.filter(user__in=following.values_list('followed_user', flat=True)).order_by('-time')
        #TODO add in an option for an unsigned in user
        requesting_id = request.user.id
        requesting_user = User.objects.get(id=requesting_id)
        likes = Like.objects.filter(post__in=posts, user=requesting_user, like=True)
        data = paginationJson(posts, curr_page,  likes, user)

        return JsonResponse(data,safe = False)

    else:
        #return all posts for who the user follows
        return JsonResponse({"user": "post"})

def user(request, id):
    if request.method == "GET":
        curr_page = request.GET.get('page', None)
        #need to filter to only following users
        user = User.objects.get(id=id)
        
        posts = Post.objects.filter(user=user).order_by('-time')

        #following is how many users follow the user with id
        #followers is how many users id follows

        following = Follow.objects.filter(followed_user = user).count()
        followed = Follow.objects.filter(following_user = user).count()

        try:
            requesting_id = request.user.id
            requesting_user = User.objects.get(id=requesting_id)
        except:
            requesting_user = None
        likes = Like.objects.filter(post__in=posts, user=requesting_user, like=True)
        data = paginationJson(posts, curr_page, likes, requesting_user, following, followed, user)

        return JsonResponse(data,safe = False)
    if request.user:
        return JsonResponse({"userposts": "posts"})

    else:

        return JsonResponse({"userposts": "posts"})
        

def get_user(request):
    if request.method == "GET":

        if request.user:
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
