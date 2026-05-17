from django.contrib import admin

from .models import Book, Loan, Member


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
	list_display = ('title', 'author', 'isbn', 'copies_total', 'copies_available', 'status_label')
	list_filter = ('publication_year',)
	search_fields = ('title', 'author', 'isbn')
	ordering = ('title',)


@admin.register(Member)
class MemberAdmin(admin.ModelAdmin):
	list_display = ('name', 'email', 'phone', 'is_active')
	list_filter = ('is_active',)
	search_fields = ('name', 'email', 'phone')
	ordering = ('name',)


@admin.register(Loan)
class LoanAdmin(admin.ModelAdmin):
	list_display = ('book', 'member', 'borrowed_at', 'due_at', 'returned_at', 'loan_state')
	list_filter = ('returned_at', 'due_at')
	search_fields = ('book__title', 'member__name', 'member__email')
	autocomplete_fields = ('book', 'member')
	ordering = ('-borrowed_at',)

	def loan_state(self, obj):
		if obj.returned_at:
			return 'Returned'
		if obj.is_overdue:
			return 'Overdue'
		return 'Active'

	loan_state.short_description = 'Status'
