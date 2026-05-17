from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from .models import Book, Loan, Member


class LibraryModelTests(TestCase):
    def setUp(self):
        self.book = Book.objects.create(
            title='The Long Walk Home',
            author='M. Carter',
            isbn='1234567890123',
            copies_total=2,
            copies_available=2,
        )
        self.member = Member.objects.create(name='Ava Reed', email='ava@example.com')

    def test_loan_updates_available_copies(self):
        loan = Loan.objects.create(
            book=self.book,
            member=self.member,
            borrowed_at=timezone.now(),
            due_at=timezone.now() + timedelta(days=7),
        )
        self.book.refresh_from_db()
        self.assertEqual(self.book.copies_available, 1)

        loan.mark_returned()
        self.book.refresh_from_db()
        self.assertEqual(self.book.copies_available, 2)

    def test_overdue_flag_is_based_on_due_date(self):
        loan = Loan.objects.create(
            book=self.book,
            member=self.member,
            borrowed_at=timezone.now() - timedelta(days=10),
            due_at=timezone.now() - timedelta(days=1),
        )
        self.assertTrue(loan.is_overdue)
