from django.contrib import messages
from django.db import transaction
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.views.decorators.http import require_POST
from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .forms import BookForm, LoanForm, MemberForm
from .models import Book, Loan, Member
from .serializers import BookSerializer, LoanSerializer, MemberSerializer


def dashboard(request):
	active_loans = Loan.objects.select_related('book', 'member').filter(returned_at__isnull=True)[:6]
	recent_books = Book.objects.all()[:6]
	recent_members = Member.objects.all()[:6]
	context = {
		'book_count': Book.objects.count(),
		'member_count': Member.objects.count(),
		'active_loan_count': active_loans.count(),
		'overdue_count': Loan.objects.filter(returned_at__isnull=True, due_at__lt=timezone.now()).count(),
		'active_loans': active_loans,
		'recent_books': recent_books,
		'recent_members': recent_members,
	}
	return render(request, 'library/dashboard.html', context)


def book_create(request):
	form = BookForm(request.POST or None)
	if request.method == 'POST' and form.is_valid():
		form.save()
		messages.success(request, 'Book added to the catalogue.')
		return redirect('dashboard')
	return render(request, 'library/book_form.html', {'form': form})


def member_create(request):
	form = MemberForm(request.POST or None)
	if request.method == 'POST' and form.is_valid():
		form.save()
		messages.success(request, 'Member profile saved.')
		return redirect('dashboard')
	return render(request, 'library/member_form.html', {'form': form})


def loan_create(request):
	form = LoanForm(request.POST or None)
	if request.method == 'POST' and form.is_valid():
		form.save()
		messages.success(request, 'Loan recorded successfully.')
		return redirect('dashboard')
	return render(request, 'library/loan_form.html', {'form': form})


@require_POST
def loan_return(request, pk):
	loan = get_object_or_404(Loan, pk=pk)
	loan.mark_returned()
	messages.success(request, f'{loan.book.title} has been marked as returned.')
	return redirect('dashboard')


class BookViewSet(viewsets.ModelViewSet):
	queryset = Book.objects.all()
	serializer_class = BookSerializer
	search_fields = ['title', 'author', 'isbn']
	filterset_fields = ['publication_year']


class MemberViewSet(viewsets.ModelViewSet):
	queryset = Member.objects.all()
	serializer_class = MemberSerializer
	search_fields = ['name', 'email', 'phone']
	filterset_fields = ['is_active']


class LoanViewSet(viewsets.ModelViewSet):
	queryset = Loan.objects.select_related('book', 'member').all()
	serializer_class = LoanSerializer
	http_method_names = ['get', 'post', 'head', 'options']
	filterset_fields = ['member', 'book', 'returned_at']
	search_fields = ['book__title', 'member__name', 'member__email']

	@action(detail=True, methods=['post'])
	def return_loan(self, request, pk=None):
		loan = self.get_object()
		loan.mark_returned()
		return Response(self.get_serializer(loan).data)


@api_view(['GET'])
def dashboard_stats(request):
	active_loans_qs = Loan.objects.filter(returned_at__isnull=True)
	overdue_loans_qs = active_loans_qs.filter(due_at__lt=timezone.now())
	recent_loans = LoanSerializer(
		Loan.objects.select_related('book', 'member').filter(returned_at__isnull=True).order_by('-borrowed_at')[:6],
		many=True,
	).data
	recent_books = BookSerializer(Book.objects.order_by('-created_at')[:6], many=True).data
	recent_members = MemberSerializer(Member.objects.order_by('-created_at')[:6], many=True).data
	return Response({
		'book_count': Book.objects.count(),
		'member_count': Member.objects.count(),
		'active_loan_count': active_loans_qs.count(),
		'overdue_count': overdue_loans_qs.count(),
		'recent_loans': recent_loans,
		'recent_books': recent_books,
		'recent_members': recent_members,
	})
