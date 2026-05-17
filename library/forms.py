from django import forms
from django.utils import timezone

from .models import Book, Loan, Member


class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['title', 'author', 'isbn', 'publication_year', 'copies_total', 'copies_available']
        widgets = {
            'publication_year': forms.NumberInput(attrs={'min': 0, 'placeholder': '2024'}),
            'copies_total': forms.NumberInput(attrs={'min': 1}),
            'copies_available': forms.NumberInput(attrs={'min': 0}),
        }


class MemberForm(forms.ModelForm):
    class Meta:
        model = Member
        fields = ['name', 'email', 'phone', 'is_active']


class LoanForm(forms.ModelForm):
    borrowed_at = forms.DateTimeField(
        required=False,
        initial=timezone.now,
        widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}),
    )
    due_at = forms.DateTimeField(widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}))

    class Meta:
        model = Loan
        fields = ['book', 'member', 'borrowed_at', 'due_at', 'notes']
        widgets = {
            'notes': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Condition notes or any special arrangement'}),
        }

    def clean_borrowed_at(self):
        return self.cleaned_data.get('borrowed_at') or timezone.now()