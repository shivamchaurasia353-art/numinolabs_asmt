# Neighborhood Library App

Small Django app for managing books, members, and lending records.

## What it includes

- Book records with title, author, ISBN, and copy counts
- Member records with contact details
- Loan tracking with borrow, due, return, and overdue state
- Django admin for direct data management
- REST API under `/api/`
- Simple HTML dashboard and forms for quick manual testing

## Tech stack

- Python 3.14
- Django 5.2
- Django REST Framework
- SQLite by default for local runs

The project also supports PostgreSQL through environment variables if you want to point it at a Postgres instance.

## Local setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

If you are using the checked-in workspace, the virtual environment already exists at `.venv`.

## PostgreSQL

Set these variables before running migrations:

```bash
export DJANGO_DB_ENGINE=django.db.backends.postgresql
export DJANGO_DB_NAME=your_db_name
export DJANGO_DB_USER=your_user
export DJANGO_DB_PASSWORD=your_password
export DJANGO_DB_HOST=127.0.0.1
export DJANGO_DB_PORT=5432
```

Install a PostgreSQL driver in your environment before using that configuration.

## Main routes

- `/` dashboard
- `/books/new/` add a book
- `/members/new/` add a member
- `/loans/new/` record a loan
- `/admin/` Django admin
- `/api/books/`, `/api/members/`, `/api/loans/`

## API behavior

- `GET /api/loans/?member=<id>` filters loans by member
- `GET /api/loans/?book=<id>` filters loans by book
- `POST /api/loans/<id>/return_loan/` marks a loan as returned

## Testing

```bash
.venv/bin/python manage.py test library
```

## Seed data

```bash
.venv/bin/python manage.py seed_demo_data
```

Use `--reset` if you want to clear the demo rows and recreate them:

```bash
.venv/bin/python manage.py seed_demo_data --reset
```

## Notes

The UI is intentionally plain and handwritten rather than overdesigned. It is meant to feel like a small internal tool a real person would actually keep using.