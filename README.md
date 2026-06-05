# TutorLink — Smart Student-Tutor Platform

A full-stack web platform connecting students in Sri Lanka with qualified tutors for private tuition. Students discover tutors, enrol in classes, and communicate in real time. Tutors manage classes, materials, and earnings. An admin panel handles approvals and oversight.

**Live Frontend:** [tutorlink-web.vercel.app](https://tutorlink-web.vercel.app)  
**Live API:** [tutorlink-api.onrender.com](https://tutorlink-api.onrender.com)

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.0.10 | App Router, SSR, routing |
| TypeScript | — | Type safety |
| Tailwind CSS | 4.1.9 | Styling |
| Radix UI + shadcn/ui | — | Component library |
| Framer Motion | 12.23.26 | Animations |
| React Hook Form + Zod | 7.x / 3.x | Form validation |
| Stripe | 9.x | Payment UI (Elements) |
| Socket.io-client | 4.8.3 | Real-time messaging |
| Recharts | 2.15.4 | Analytics charts |
| Resend | 6.9.2 | Contact form emails |
| Vercel Analytics | 1.3.1 | Page view analytics |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x | Runtime |
| Express | 5.2.1 | HTTP server |
| PostgreSQL + Prisma | 7.3.0 | Database + ORM |
| JWT (jsonwebtoken) | 9.0.3 | Authentication |
| bcryptjs | 3.0.3 | Password hashing |
| Stripe | 22.1.1 | Payment processing |
| Socket.io | 4.8.3 | Real-time messaging |
| Cloudinary | 2.9.0 | File & media storage |
| Nodemailer / Resend | — | Transactional email |
| Auth0 | 5.2.0 | Google OAuth |
| node-cron | 4.2.1 | Scheduled jobs |

---

## Features

### Students
- Browse and search tutors by subject, location, and mode (online / physical / hybrid)
- View tutor profiles with ratings, reviews, and class details
- Enrol in classes with Stripe-powered monthly payments (LKR)
- Access class materials — documents, videos, images organised in folders
- Real-time messaging with tutors via Socket.io
- Review and rate tutors after enrolment
- Manage enrolments, payment history, and account settings from the dashboard

### Tutors
- Apply to become a tutor with qualifications and ID verification
- Admin review and approval workflow with email notifications
- Create and manage classes — subjects, schedules, fees, and modes
- Upload class materials organised in custom folders via Cloudinary
- Track earnings, enrolled students, and reviews from the dashboard
- Real-time messaging with students
- Automated availability management — daily cron marks tutors inactive after 30 days offline

### Admin
- Approve or reject tutor applications
- Manage all user accounts (ban / unban / reactivate)
- View and manage all platform classes (hold / unhold / force delete)
- Monitor all payments and platform revenue with a summary dashboard
- Broadcast notifications to users

---

## Project Structure

```
TutorLink - Smart Student-Tutor Platform/
├── tutorlink-web/                  # Next.js frontend → Vercel
│   ├── app/
│   │   ├── page.tsx                # Homepage
│   │   ├── login/ register/        # Authentication
│   │   ├── verify-email/           # Email verification
│   │   ├── forgot-password/        # Password reset
│   │   ├── reset-password/
│   │   ├── select-role/            # Role switcher
│   │   ├── search/                 # Tutor discovery
│   │   ├── tutor/                  # Tutor profiles, dashboard, classes, earnings, messages
│   │   ├── become-tutor/           # Tutor onboarding
│   │   ├── complete-tutor-application/
│   │   ├── tutor-application-status/
│   │   ├── gig-details/[id]/       # Class detail page
│   │   ├── payment/[id]/           # Stripe checkout
│   │   ├── enrollment-confirmation/[id]/
│   │   ├── dashboard/              # Student dashboard
│   │   │   ├── my-classes/
│   │   │   ├── messages/
│   │   │   ├── notifications/
│   │   │   ├── profile/
│   │   │   └── settings/
│   │   ├── admin/                  # Admin panel
│   │   │   ├── login/
│   │   │   ├── accounts/
│   │   │   ├── classes/
│   │   │   ├── notifications/
│   │   │   ├── payments/
│   │   │   ├── tutor-applications/
│   │   │   └── tutor-approvals/
│   │   ├── api/contact/            # Contact form API route
│   │   ├── contact-us/
│   │   ├── faqs/
│   │   ├── safety-tips/
│   │   ├── privacy-policy/
│   │   ├── terms-of-service/
│   │   └── cookie-policy/
│   ├── components/                 # Shared UI components
│   ├── lib/api.ts                  # Centralised API client
│   └── next.config.mjs             # CSP headers, image config
│
└── tutorlink-api/                  # Express backend → Render
    ├── src/
    │   ├── controllers/            # auth, tutor, payment, message, review, notification
    │   ├── routes/                 # API route definitions
    │   ├── middleware/             # auth, error handling
    │   ├── jobs/                   # Tutor availability cron (daily 02:00)
    │   ├── utils/                  # hash, email helpers
    │   ├── models/                 # Prisma client instance
    │   └── app.js                  # Express + CORS setup
    ├── prisma/
    │   ├── schema.prisma           # Database schema
    │   └── seed.js                 # 100 Sri Lankan tutors seed
    └── server.js                   # HTTP + Socket.io server
```

---

## Database Schema

| Model | Key Fields |
|---|---|
| `User` | email, password, isEmailVerified, isBanned |
| `Student` | dob, phone, schoolGrade, parentName, avatar |
| `Tutor` | subject, subjects[], location, learningMode, applicationStatus, rating, isAvailable |
| `Class` | subject, mode, schedule[], fees (LKR), status (ACTIVE / CANCELLED / COMPLETED) |
| `Enrollment` | status, accessUntil, lastPaymentDueNotifiedAt |
| `Payment` | stripePaymentId, totalAmount, tutorAmount (92%), platformAmount (8%) |
| `Review` | rating (1–5), comment — linked to enrollment |
| `Conversation` | unique student-tutor pair |
| `Message` | content, senderId, read |
| `Notification` | type, title, message, read — null userId = admin notification |
| `ClassFolder` | name, order — groups class materials |
| `ClassMaterial` | url, resourceType (image / document / video), isPublished |

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/signup` | Register new user |
| POST | `/login` | Login |
| POST | `/verify-email` | Verify email code |
| POST | `/resend-verification` | Resend verification |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset with token |
| GET | `/oauth/login` | Initiate Google OAuth |
| GET | `/oauth/callback` | OAuth callback |
| POST | `/add-role` | Add student/tutor profile to existing account |
| GET | `/me` | Get current user (auth) |
| PUT | `/profile` | Update profile (auth) |
| PUT | `/change-password` | Change password (auth) |
| POST | `/admin/login` | Admin login |
| GET | `/admin/users` | List all users |
| PUT | `/admin/users/:id/ban` | Ban user |
| PUT | `/admin/users/:id/unban` | Unban user |

### Tutors — `/api/tutors`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/search` | Search tutors — subject, location, mode, limit |
| GET | `/suggestions` | Autocomplete for search input |
| GET | `/:id` | Get tutor profile + active classes |

### Tutor Management — `/api/tutor`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/application/submit` | Submit tutor application |
| GET | `/application/status` | Check application status |
| POST | `/heartbeat` | Update last online timestamp |
| POST | `/classes` | Create class |
| GET | `/classes` | Get own classes |
| PUT | `/classes/:id` | Update class |
| PUT | `/classes/:id/cancel` | Cancel class |
| DELETE | `/classes/:id` | Delete class |
| GET | `/admin/applications` | All applications |
| PUT | `/admin/applications/:id/approve` | Approve tutor |
| PUT | `/admin/applications/:id/reject` | Reject tutor |
| GET | `/admin/classes` | All classes |
| PUT | `/admin/classes/:id/hold` | Hold class |
| PUT | `/admin/classes/:id/unhold` | Unhold class |
| DELETE | `/admin/classes/:id` | Force delete class |

### Payments — `/api/payments`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/create-intent` | Create Stripe PaymentIntent |
| POST | `/confirm` | Confirm payment + create enrollment |
| GET | `/admin` | Admin payments + revenue summary |
| GET | `/tutor/earnings` | Tutor earnings overview |
| GET | `/tutor/students` | Tutor's enrolled students |
| GET | `/student/enrollments` | Student's active enrollments |
| POST | `/student/enrollments/:id/unenroll` | Unenroll from class |

### Messages — `/api/messages`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/conversations` | List all conversations |
| POST | `/conversations` | Start or get conversation |
| GET | `/conversations/:id` | Get messages |
| POST | `/conversations/:id/messages` | Send message |
| PUT | `/conversations/:id/read` | Mark conversation as read |

### Other
| Prefix | Description |
|---|---|
| `/api/reviews` | Create, read, delete tutor/class reviews |
| `/api/notifications` | User and admin notifications |
| `/api/upload` | Multer + Cloudinary file upload |

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (Supabase recommended)
- Stripe account (test keys)
- Cloudinary account
- Auth0 app (optional, for Google OAuth)

### Frontend

```bash
cd tutorlink-web
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
RESEND_API_KEY=re_...
```

```bash
npm run dev        # http://localhost:3000
```

### Backend

```bash
cd tutorlink-api
npm install
npx prisma migrate dev
```

Create `.env`:
```env
PORT=5001
NODE_ENV=development
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=your_strong_secret
JWT_EXPIRES=7d
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=gmail
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM="TutorLink <noreply@tutorlink.lk>"
AUTH0_DOMAIN=your.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_CALLBACK_URL=http://localhost:5001/api/auth/oauth/callback
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

```bash
npm run dev        # http://localhost:5001
```

### Seed the Database

Seeds 100 realistic Sri Lankan tutors covering the full Grade 6–13 national curriculum, with random classes, locations, and modes. 65 APPROVED, 35 PENDING.

```bash
cd tutorlink-api
npm run seed
```

All seeded tutors use the password: **`TutorLK@1`**

---

## Deployment

### Frontend → Vercel

Push to `main` — Vercel auto-deploys.

Add environment variables in Vercel dashboard:
```
NEXT_PUBLIC_API_URL            https://tutorlink-api.onrender.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY  pk_test_...
RESEND_API_KEY                 re_...
```

### Backend → Render

- **Build command:** `npm install && npx prisma generate`
- **Start command:** `node server.js`

Add all `.env` variables, updating:
```
NODE_ENV       production
FRONTEND_URL   https://tutorlink-web.vercel.app
```

---

## Payment Flow

```
Student clicks Enrol
  → POST /api/payments/create-intent   (Stripe PaymentIntent created)
  → Stripe Elements confirms payment client-side
  → POST /api/payments/confirm         (Enrollment + Payment record saved)
  → Notifications sent to student and tutor
  → Enrollment confirmation page shown
```

Platform fee: **8%** per payment. Tutors receive **92%**.

---

## Real-Time Messaging

Socket.io handles live messaging. On connection, authenticated users join a room keyed by their `userId`. Admin users join a dedicated `admin` room for broadcast notifications. Messages are delivered via events and persisted to PostgreSQL.

---

## License

MIT
