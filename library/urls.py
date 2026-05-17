from django.urls import path

from . import views


urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('books/new/', views.book_create, name='book-create'),
    path('members/new/', views.member_create, name='member-create'),
    path('loans/new/', views.loan_create, name='loan-create'),
    path('loans/<int:pk>/return/', views.loan_return, name='loan-return'),
]