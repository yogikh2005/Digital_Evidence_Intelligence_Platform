# Digital Evidence Intelligence Platform — Base System

## Included operations
- Five roles: Admin, Investigating Officer, Evidence Officer, Forensic Officer, Supervisor
- JWT login/refresh/current-user APIs
- Admin user management
- Case create/list/detail/update and role-based visibility
- Evidence request create/process
- Evidence upload, extension/size validation, SHA-256, local storage
- Chain of custody and audit event records
- Forensic evidence review
- Report create, submit, supervisor approve/reject
- Django Admin and basic dashboard

## Windows setup
1. Extract into a short folder such as `C:\DEIP` and open terminal in the folder containing `manage.py`.
2. `python -m venv venv`
3. `venv\Scripts\activate`
4. `python -m pip install --upgrade pip`
5. `pip install -r requirements.txt`
6. In PostgreSQL, run `CREATE DATABASE digital_evidence_db;`
7. Copy `.env.example` to `.env`, then set the PostgreSQL password and a strong SECRET_KEY.
8. `python manage.py check`
9. `python manage.py makemigrations core`
10. `python manage.py migrate`
11. `python manage.py createsuperuser`
12. `python manage.py runserver`

Open `http://127.0.0.1:8000/` and `http://127.0.0.1:8000/admin/`. In Admin, set the superuser role to `ADMIN`, then create the other role accounts.

## JWT
POST `/api/auth/login/` JSON: `{"username":"admin","password":"your-password"}`. Send `Authorization: Bearer <access>` for protected APIs.

## Key endpoints
- POST `/api/auth/login/`; POST `/api/auth/refresh/`; GET `/api/auth/me/`
- GET/POST `/api/auth/users/` (Admin only); GET/PATCH/PUT `/api/auth/users/<id>/` (Admin only)
- GET/POST `/api/cases/`; GET/PATCH/PUT `/api/cases/<id>/`
- GET/POST `/api/evidence/` (Evidence Officer upload; multipart fields `case`, `file`)
- GET/POST `/api/evidence/requests/`; PATCH `/api/evidence/requests/<id>/action/` with `{"action":"FULFILLED"}` or `{"action":"REJECTED"}`
- POST `/api/evidence/<id>/review/` (assigned Forensic Officer)
- GET/POST `/api/reports/`; POST `/api/reports/<id>/submit/`; POST `/api/reports/<id>/decision/` with `{"decision":"APPROVED","comment":"Reviewed"}` or `REJECTED`
- GET `/api/audit/` (Admin/Supervisor)

## Create case example
POST `/api/cases/`: `{"case_number":"CASE-2026-001","title":"Sample case","description":"Testing","forensic_officer":3,"supervisor":4}`. IDs must correspond to users with those roles.

## Evidence request example
POST `/api/evidence/requests/`: `{"case":1,"description":"CCTV from main entrance","requested_type":"VIDEO"}`.

## Report example
POST `/api/reports/`: `{"case":1,"title":"Initial report","summary":"Review required","findings":{"items":[]}}`, then POST `/api/reports/1/submit/`. The assigned Supervisor decides the report.

## Important
This is a development base, not a production forensic vault. Extension checks do not prove file content is safe or genuine. Before using real evidence, add content-signature validation, malware scanning, encrypted access-controlled storage, immutable/off-site audit backups, strict download authorization, backup/restore testing, deployment security, and independent integrity verification. AI agents are not included yet.
