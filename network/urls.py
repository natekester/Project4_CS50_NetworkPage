
from django.urls import path, re_path



from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("api/all_posts", views.all_posts, name='all_posts'),
    path("api/following/<int:id>", views.following),
    path("api/user/<int:id>", views.user, name='user'),
    path("api/user", views.get_user, name="get_user"),
    path("api/like_post/<int:post_id>/<int:user_id>", views.like_post, name="like_post"),
    path("api/follow/<int:user_id>/<int:user_to_follow>", views.follow_user, name="follow_user"),
    path("api/create_post", views.create_post, name="create_post"),
    path("api/edit_post", views.edit_post, name="edit_post"),
    path("api/get_post_text/<int:id>", views.get_post_text, name="get_post_text")


]
