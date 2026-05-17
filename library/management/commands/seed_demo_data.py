from datetime import timedelta

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from library.models import Book, Loan, Member


class Command(BaseCommand):
    help = 'Seed a small set of demo data for the neighborhood library app.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Clear existing demo records before seeding them again.',
        )

    def handle(self, *args, **options):
        with transaction.atomic():
            if options['reset']:
                Loan.objects.all().delete()
                Member.objects.filter(email__in=[
                    'ava.reed@example.com',
                    'noah.bell@example.com',
                    'mia.ward@example.com',
                    'aarav.sharma@example.com',
                    'priya.nair@example.com',
                    'kabir.khan@example.com',
                ]).delete()
                Book.objects.filter(isbn__in=[
                    '9780143131847',
                    '9780061120084',
                    '9780140449136',
                    '9780307277671',
                    '9788129142133',
                    '9780143064407',
                    '9780143425074',
                    '9780670094375',
                ]).delete()

            book_specs = {
                'discovery-of-india': {
                    'isbn': '9788129142133',
                    'title': 'The Discovery of India',
                    'author': 'Jawaharlal Nehru',
                    'publication_year': 1946,
                    'copies_total': 4,
                },
                'train-to-pakistan': {
                    'isbn': '9780143064407',
                    'title': 'Train to Pakistan',
                    'author': 'Khushwant Singh',
                    'publication_year': 1956,
                    'copies_total': 3,
                },
                'a-suitable-boy': {
                    'isbn': '9780143425074',
                    'title': 'A Suitable Boy',
                    'author': 'Vikram Seth',
                    'publication_year': 1993,
                    'copies_total': 2,
                },
                'the-white-tiger': {
                    'isbn': '9780670094375',
                    'title': 'The White Tiger',
                    'author': 'Aravind Adiga',
                    'publication_year': 2008,
                    'copies_total': 2,
                },
            }

            books = {}
            for key, spec in book_specs.items():
                book, created = Book.objects.get_or_create(
                    isbn=spec['isbn'],
                    defaults={
                        'title': spec['title'],
                        'author': spec['author'],
                        'publication_year': spec['publication_year'],
                        'copies_total': spec['copies_total'],
                        'copies_available': spec['copies_total'],
                    },
                )
                if not created:
                    book.title = spec['title']
                    book.author = spec['author']
                    book.publication_year = spec['publication_year']
                    book.copies_total = spec['copies_total']
                    book.copies_available = min(book.copies_available, spec['copies_total'])
                    book.save(update_fields=['title', 'author', 'publication_year', 'copies_total', 'copies_available', 'updated_at'])
                books[key] = book

            member_specs = {
                'aarav': {'email': 'aarav.sharma@example.com', 'name': 'Aarav Sharma', 'phone': '+91-98765-43210'},
                'priya': {'email': 'priya.nair@example.com', 'name': 'Priya Nair', 'phone': '+91-98111-22334'},
                'kabir': {'email': 'kabir.khan@example.com', 'name': 'Kabir Khan', 'phone': '+91-98990-11223'},
            }

            members = {}
            for key, spec in member_specs.items():
                member, created = Member.objects.get_or_create(
                    email=spec['email'],
                    defaults={
                        'name': spec['name'],
                        'phone': spec['phone'],
                        'is_active': True,
                    },
                )
                if not created:
                    member.name = spec['name']
                    member.phone = spec['phone']
                    member.is_active = True
                    member.save(update_fields=['name', 'phone', 'is_active', 'updated_at'])
                members[key] = member

            now = timezone.now()
            loan_specs = [
                (books['train-to-pakistan'], members['aarav'], 10, 3, 'Requested for a neighbourhood reading circle.'),
                (books['a-suitable-boy'], members['priya'], 6, 1, 'Reserved for weekend reading.'),
                (books['the-white-tiger'], members['kabir'], 18, -2, 'Overdue on purpose for dashboard testing.'),
            ]

            created_loans = 0
            for book, member, borrowed_days_ago, due_in_days, notes in loan_specs:
                existing = Loan.objects.filter(book=book, member=member, returned_at__isnull=True).first()
                if existing:
                    continue
                Loan.objects.create(
                    book=book,
                    member=member,
                    borrowed_at=now - timedelta(days=borrowed_days_ago),
                    due_at=now + timedelta(days=due_in_days),
                    notes=notes,
                )
                created_loans += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seeded demo data: {Book.objects.count()} books, {Member.objects.count()} members, {Loan.objects.count()} loans. '
            f'Created {created_loans} new loan(s) in this run.'
        ))