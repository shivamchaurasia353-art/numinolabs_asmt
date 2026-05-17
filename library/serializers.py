from rest_framework import serializers

from .models import Book, Loan, Member


class BookSerializer(serializers.ModelSerializer):
    borrowed_count = serializers.IntegerField(read_only=True)
    status_label = serializers.CharField(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'isbn', 'publication_year',
            'copies_total', 'copies_available', 'borrowed_count',
            'status_label', 'created_at', 'updated_at',
        ]


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['id', 'name', 'email', 'phone', 'is_active', 'created_at', 'updated_at']


class LoanSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True)
    member_name = serializers.CharField(source='member.name', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = Loan
        fields = [
            'id', 'book', 'book_title', 'member', 'member_name',
            'borrowed_at', 'due_at', 'returned_at', 'notes', 'is_overdue',
        ]
        read_only_fields = ['returned_at']
