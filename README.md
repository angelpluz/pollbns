# PollBNS (Next.js + UID Auth)

Interactive multi-question poll built with Next.js App Router. Users enter their UID to submit multi-select/multi-text answers, and admins can review a dashboard.

## Getting Started

1. Install dependencies
   ```
   npm install
   ```
2. Create a `.env.local` (or `.env`) file with the following values.
   ```
   DB_HOST=110.78.166.171
   DB_PORT=3306
   DB_USER=admin_shopdb
   DB_PASSWORD=xxxxxxxx
   DB_NAME=shopdbtython
   USER_COOKIE_NAME=poll_user_id
   ADMIN_COOKIE_NAME=poll_admin
   ADMIN_DASHBOARD_PASSWORD=supersecret
   ```
3. Start the dev server
   ```
   npm run dev
   ```
4. Visit http://localhost:3000 ใส่ UID แล้วเริ่มโหวต
5. เปิด http://localhost:3000/dashboard ใส่รหัส ADMIN_DASHBOARD_PASSWORD เพื่อดู dashboard

## Database migration

Run `sql/bns-reds-survey.sql` on your MySQL instance. It will:

- Ensure `poll_questions.response_kind` and `poll_text_answers` exist
- Replace all polls with the latest “แบบสอบถาม BNS REDS”

## Available Scripts

- `npm run dev` – Next.js dev server with hot reload
- `npm run build` – production build
- `npm run start` – start the compiled server
- `npm run lint` – lint with `eslint-config-next`

## API Surface

- `GET /api/polls` – list polls + stats
- `GET /api/polls/:pollId` – detail for a single poll
- `GET /api/polls/:pollId/votes/me` – previously submitted choices for the current UID
- `POST /api/polls/:pollId/votes` – submit/update vote (body array of `{ questionId, optionIds?, textAnswer? }`)
- `POST /api/auth/manual` – register/login with UID (sets cookie)
- `POST /api/auth/logout` – clears the UID cookie
- `GET /api/auth/me` – returns the profile tied to the current UID cookie
- `POST /api/admin/login` / `POST /api/admin/logout` – manage dashboard session

Poll data is backed by MySQL via `lib/db.ts` + `lib/polls.ts`. Update the `.env` with your own credentials if they change.
