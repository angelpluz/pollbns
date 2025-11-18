# PollBNS (Next.js + UID Auth)

Interactive multi-question poll built with Next.js App Router. Users enter their Discord UID (or any unique ID) to submit multi-select answers and instantly see aggregated counts backed by MySQL.

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
   ```
3. Start the dev server
   ```
   npm run dev
   ```
4. Visit http://localhost:3000, ใส่ UID แล้วเริ่มโหวตได้เลย

## Database migration

Run `sql/bns-reds-survey.sql` on your MySQL instance. It will:

- Add the `response_kind` column to `poll_questions`
- Create the `poll_text_answers` table for open-text responses
- Insert the latest “แบบสอบถาม BNS REDS” poll (questions + choices)

## Available Scripts

- `npm run dev` – Next.js dev server with hot reload
- `npm run build` – production build
- `npm run start` – start the compiled server
- `npm run lint` – lint with `eslint-config-next`

## API Surface

- `GET /api/polls` – list polls + stats
- `GET /api/polls/:pollId` – detail for a single poll
- `GET /api/polls/:pollId/votes/me` – previously submitted choices for the current UID
- `POST /api/polls/:pollId/votes` – submit/update vote (body array of `{ questionId, optionIds }`)
- `POST /api/auth/manual` – register/login with UID (sets cookie)
- `POST /api/auth/logout` – clears the UID cookie
- `GET /api/auth/me` – returns the profile tied to the current UID cookie

Poll data is backed by MySQL via `lib/db.ts` + `lib/polls.ts`. Update the `.env` with your own credentials if they change.
