from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone




class User(AbstractUser):
    pass

class Post(models.Model):
    text = models.CharField(max_length=256)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_likes = models.IntegerField()
    time = models.DateTimeField(default = timezone.now)

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    like = models.BooleanField(default= False)
    #we'll allow users to remove a like which will turn it false

class Follow(models.Model):
    following_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following_user")
    followed_user = models.ForeignKey(User, on_delete=models.CASCADE,  related_name="followed_user")


