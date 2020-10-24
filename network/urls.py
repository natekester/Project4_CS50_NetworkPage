
from django.urls import path, re_path



from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("api/all_posts", views.all_posts, name='all_posts'),
    # re_path(r'^api/all_posts(?P<page>\d+)$', views.all_posts, name='all_posts'),
    
    path("api/following/<int:id>", views.following),
    path("api/user/<int:id>", views.user, name='user'),
    path("api/user", views.get_user, name="get_user")

]
