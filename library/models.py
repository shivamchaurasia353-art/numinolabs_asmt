from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import F
from django.utils import timezone


class Book(models.Model):
	title = models.CharField(max_length=200)
	author = models.CharField(max_length=200)
	isbn = models.CharField(max_length=13, unique=True)
	publication_year = models.PositiveIntegerField(blank=True, null=True)
	copies_total = models.PositiveIntegerField(default=1)
	copies_available = models.PositiveIntegerField(default=1)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['title', 'author']

	def __str__(self):
		return f'{self.title} by {self.author}'

	def clean(self):
		super().clean()
		if self.copies_available > self.copies_total:
			raise ValidationError({'copies_available': 'Available copies cannot exceed the total copies.'})

	@property
	def borrowed_count(self):
		return self.copies_total - self.copies_available

	@property
	def status_label(self):
		if self.copies_available == 0:
			return 'Checked out'
		if self.copies_available < self.copies_total:
			return 'Partially available'
		return 'Available'


class Member(models.Model):
	name = models.CharField(max_length=200)
	email = models.EmailField(unique=True)
	phone = models.CharField(max_length=30, blank=True)
	is_active = models.BooleanField(default=True)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	class Meta:
		ordering = ['name']

	def __str__(self):
		return self.name


class Loan(models.Model):
	book = models.ForeignKey(Book, on_delete=models.PROTECT, related_name='loans')
	member = models.ForeignKey(Member, on_delete=models.PROTECT, related_name='loans')
	borrowed_at = models.DateTimeField(default=timezone.now)
	due_at = models.DateTimeField()
	returned_at = models.DateTimeField(blank=True, null=True)
	notes = models.TextField(blank=True)

	class Meta:
		ordering = ['-borrowed_at']

	def __str__(self):
		return f'{self.book.title} -> {self.member.name}'

	def clean(self):
		super().clean()
		if self.pk is None and self.book_id and self.book.copies_available <= 0:
			raise ValidationError({'book': 'No copies are currently available for this book.'})
		if self.due_at and self.borrowed_at and self.due_at <= self.borrowed_at:
			raise ValidationError({'due_at': 'Due date must be after the borrow date.'})
		if self.returned_at and self.returned_at < self.borrowed_at:
			raise ValidationError({'returned_at': 'Return date cannot be earlier than the borrow date.'})

	@property
	def is_active(self):
		return self.returned_at is None

	@property
	def is_overdue(self):
		return self.returned_at is None and timezone.now() > self.due_at

	def mark_returned(self, returned_at=None):
		if self.returned_at:
			return
		self.returned_at = returned_at or timezone.now()
		self.save(update_fields=['returned_at'])
		Book.objects.filter(pk=self.book_id, copies_available__lt=F('copies_total')).update(copies_available=F('copies_available') + 1)

	def save(self, *args, **kwargs):
		is_new = self.pk is None
		if is_new and self.returned_at is None:
			self.full_clean()
		super().save(*args, **kwargs)
		if is_new and self.returned_at is None:
			Book.objects.filter(pk=self.book_id, copies_available__gt=0).update(copies_available=F('copies_available') - 1)
