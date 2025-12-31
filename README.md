# Material Request Tracker

A simple and secure material request tracking application built for construction and infrastructure teams(Bauai).  
The project demonstrates clean frontend architecture, Supabase integration, proper data security using Row Level Security (RLS), and thoughtful UX decisions.

🔗 **Live Demo**  
https://material-request-tracker-m56e.vercel.app/login

---

## Features

### Authentication & Company Isolation
- Email/password authentication using Supabase Auth
- Each user belongs to a company via user metadata
- Data is isolated per company using Row Level Security (RLS)
- Users can only access material requests from their own organization

### Material Request Management
- Create material requests with:
  - Material name
  - Quantity and unit
  - Priority (low / medium / high / urgent)
  - Optional notes
- Strict request lifecycle:
  - `pending → approved → fulfilled`
  - `pending → rejected`
- Invalid status transitions are not allowed

### Dashboard
- Searchable table of material requests
- Status and priority badges for quick scanning
- Summary cards showing request counts by status
- Export requests to CSV

### AI Assistant (additional feature)
- An AI assistant to help with:
  - Material recommendations
  - Quantity suggestions
  - Priority guidance
  - Request history insights
- AI is advisory or guiding  only and does not modify data directly

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- React Router
- React Query (TanStack)
- React Hook Form + Zod
- Tailwind CSS
- shadcn/ui

### Backend
- Supabase
  - PostgreSQL
  - Authentication
  - REST API
  - Row Level Security (RLS)

### Deployment
- Frontend: Vercel
- Backend: Supabase (hosted)

---

## Local Setup Instructions

### Prerequisites
- Node.js 18+
- npm

### Clone the repository
```bash
git clone https://github.com/kushagr1501/Material-Request-Tracker.git
cd material-request-tracker
```
### Env variables
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

###To run 
npm run dev


### Database Setup (Supabase)
```bash 
Table: material_requests
create table material_requests (
  id uuid primary key default gen_random_uuid(),
  material_name text not null,
  quantity numeric not null,
  unit text not null,
  status text not null default 'pending',
  priority text not null,
  notes text,
  requested_at timestamp with time zone default now(),
  company_id uuid not null,
  requested_by uuid references auth.users(id)
);
```
```bash
Enable Row Level Security
alter table material_requests enable row level security;
```
```bash 
RLS Policies
Select policy
create policy "Users can view their company requests"
on material_requests
for select
using (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

Insert policy
create policy "Users can create requests for their company"
on material_requests
for insert
with check (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);

Update policy
create policy "Users can update their company requests"
on material_requests
for update
using (
  company_id = (auth.jwt() -> 'user_metadata' ->> 'company_id')::uuid
);
```


### Demo Accounts
```
Use the following accounts to test multi-company isolation:

Company A
Email: test@gmail.com
Password: password123

Company B
Email: test2@gmail.com
Password: test2
```

### Approach & Design Decisions

Supabase RLS is used to enforce security at the database level

React Query manages server state and avoids manual loading logic

Forms use React Hook Form and Zod for predictable validation

Dialog-based creation keeps users in context

AI is used as a supportive tool rather than core logic

Deployment Notes

The application is deployed on Vercel

SPA routing is handled using a rewrite rule so direct URL refreshes work correctly

Supabase is fully managed and requires no backend deployment

What This Project Demonstrates

Clean React component structure

Proper use of hooks and server state management

Secure Supabase integration with RLS

Thoughtful UI/UX and edge case handling

Practical AI usage without overengineering



