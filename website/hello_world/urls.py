from django.urls import path
from hello_world import views

urlpatterns = [
    path('', views.hello_world, name='hello_world'),
    path('getJSON/', views.get_JSON, name='get_JSON'),
    path('getColour/', views.get_colour, name='get_colour'),
    path('reset/',  views.reset_button,name="resetbutton"),
    path('refresh/',  views.refreshGetColour,name="refresh"),
    path('last/',  views.getLastMatrix,name="time"),
    path('about/',  views.about_page, name="about"),
]
