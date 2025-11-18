import { getPool, withConnection } from "./db";
import type mysql from "mysql2/promise";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

export type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export type PollQuestion = {
  id: string;
  text: string;
  allowMultiple: boolean;
  options: PollOption[];
};

export type Poll = {
  id: string;
  title: string;
  description?: string | null;
  questions: PollQuestion[];
};

export type QuestionAnswer = {
  questionId: string;
  optionIds: string[];
};

export type PollWithStats = Poll & {
  totalResponses: number;
};

type PollRow = RowDataPacket & {
  poll_id: string;
  poll_title: string;
  poll_description: string | null;
  total_responses: number | null;
  question_id: number;
  question_text: string;
  allow_multiple: 0 | 1;
  option_id: number;
  option_text: string;
  option_votes: number | null;
};

type QuestionMetaRow = RowDataPacket & {
  question_id: number;
  allow_multiple: 0 | 1;
  option_id: number;
};

export class PollError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const BASE_SELECT = `
  SELECT 
    p.id as poll_id,
    p.title as poll_title,
    p.description as poll_description,
    totals.total_responses,
    q.id as question_id,
    q.question_text,
    q.allow_multiple,
    o.id as option_id,
    o.option_text,
    votes.option_votes
  FROM polls p
  JOIN poll_questions q ON q.poll_id = p.id
  JOIN poll_options o ON o.question_id = q.id
  LEFT JOIN (
    SELECT poll_id, COUNT(*) as total_responses
    FROM poll_submissions
    GROUP BY poll_id
  ) totals ON totals.poll_id = p.id
  LEFT JOIN (
    SELECT option_id, COUNT(*) as option_votes
    FROM poll_answers
    GROUP BY option_id
  ) votes ON votes.option_id = o.id
`;

const mapRowsToPolls = (rows: PollRow[]): PollWithStats[] => {
  const pollMap = new Map<string, PollWithStats>();
  const questionMap = new Map<string, Map<string, PollQuestion>>();

  rows.forEach((row) => {
    if (!pollMap.has(row.poll_id)) {
      pollMap.set(row.poll_id, {
        id: row.poll_id,
        title: row.poll_title,
        description: row.poll_description,
        totalResponses: row.total_responses ?? 0,
        questions: [],
      });
      questionMap.set(row.poll_id, new Map());
    }

    const poll = pollMap.get(row.poll_id)!;
    const qMap = questionMap.get(row.poll_id)!;
    const questionId = row.question_id.toString();

    if (!qMap.has(questionId)) {
      const question: PollQuestion = {
        id: questionId,
        text: row.question_text,
        allowMultiple: Boolean(row.allow_multiple),
        options: [],
      };
      qMap.set(questionId, question);
      poll.questions.push(question);
    }

    const question = qMap.get(questionId)!;
    question.options.push({
      id: row.option_id.toString(),
      text: row.option_text,
      votes: row.option_votes ?? 0,
    });
  });

  return [...pollMap.values()];
};

export const listPolls = async (): Promise<PollWithStats[]> => {
  const [rows] = await getPool().query<PollRow[]>(
    `${BASE_SELECT} ORDER BY q.sort_order, o.sort_order`,
  );
  return mapRowsToPolls(rows);
};

export const getPoll = async (
  pollId: string,
): Promise<PollWithStats | null> => {
  const [rows] = await getPool().query<PollRow[]>(
    `${BASE_SELECT} WHERE p.id = ? ORDER BY q.sort_order, o.sort_order`,
    [pollId],
  );
  if (!rows.length) {
    return null;
  }
  return mapRowsToPolls(rows)[0];
};

export const getUserVote = async (
  pollId: string,
  userId: string,
): Promise<QuestionAnswer[] | null> => {
  const [rows] = await getPool().query<
    RowDataPacket[]
  >(
    `
    SELECT a.question_id, a.option_id
    FROM poll_answers a
    JOIN poll_submissions s ON s.id = a.submission_id
    WHERE s.poll_id = ? AND s.user_id = ?
  `,
    [pollId, userId],
  );

  if (!rows.length) {
    return null;
  }

  const grouped = new Map<string, string[]>();
  rows.forEach((row) => {
    const questionId = row.question_id.toString();
    const optionId = row.option_id.toString();
    if (!grouped.has(questionId)) {
      grouped.set(questionId, []);
    }
    grouped.get(questionId)!.push(optionId);
  });

  return [...grouped.entries()].map(([questionId, optionIds]) => ({
    questionId,
    optionIds,
  }));
};

const loadPollStructure = async (
  conn: mysql.PoolConnection,
  pollId: string,
) => {
  const [rows] = await conn.query<QuestionMetaRow[]>(
    `
    SELECT q.id as question_id, q.allow_multiple, o.id as option_id
    FROM poll_questions q
    JOIN poll_options o ON o.question_id = q.id
    WHERE q.poll_id = ?
  `,
    [pollId],
  );

  if (!rows.length) {
    return null;
  }

  const questions = new Map<
    string,
    { allowMultiple: boolean; optionIds: Set<string> }
  >();

  rows.forEach((row) => {
    const qId = row.question_id.toString();
    if (!questions.has(qId)) {
      questions.set(qId, {
        allowMultiple: Boolean(row.allow_multiple),
        optionIds: new Set(),
      });
    }
    questions.get(qId)!.optionIds.add(row.option_id.toString());
  });

  return questions;
};

const normalizeAnswers = (
  structure: Map<string, { allowMultiple: boolean; optionIds: Set<string> }>,
  answers: QuestionAnswer[],
) => {
  if (!answers.length) {
    throw new PollError("อย่างน้อยต้องเลือก 1 คำถาม");
  }

  const normalized: Record<string, string[]> = {};

  answers.forEach((answer) => {
    const question = structure.get(answer.questionId);
    if (!question) {
      throw new PollError(`ไม่มีคำถาม ${answer.questionId}`);
    }
    if (normalized[answer.questionId]) {
      throw new PollError("ตอบคำถามเดียวกันซ้ำไม่ได้");
    }

    const uniqueOptions = [...new Set(answer.optionIds)];
    if (!uniqueOptions.length) {
      throw new PollError("ต้องเลือกอย่างน้อย 1 ตัวเลือก");
    }

    if (!question.allowMultiple && uniqueOptions.length !== 1) {
      throw new PollError("คำถามนี้เลือกได้ตัวเดียว");
    }

    uniqueOptions.forEach((optionId) => {
      if (!question.optionIds.has(optionId)) {
        throw new PollError(`ตัวเลือก ${optionId} ไม่อยู่ในคำถามนี้`);
      }
    });

    normalized[answer.questionId] = uniqueOptions;
  });

  return normalized;
};

export const submitVote = async (
  pollId: string,
  userId: string,
  answers: QuestionAnswer[],
): Promise<PollWithStats | null> => {
  return withConnection(async (conn) => {
    const structure = await loadPollStructure(conn, pollId);
    if (!structure) {
      throw new PollError("ไม่พบ poll นี้", 404);
    }

    const normalized = normalizeAnswers(structure, answers);
    await conn.beginTransaction();

    try {
      const [existing] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM poll_submissions WHERE poll_id = ? AND user_id = ? FOR UPDATE",
        [pollId, userId],
      );

      let submissionId: number;

      if (existing.length) {
        submissionId = Number(existing[0].id);
        await conn.query("DELETE FROM poll_answers WHERE submission_id = ?", [
          submissionId,
        ]);
      } else {
        const [result] = await conn.query<ResultSetHeader>(
          "INSERT INTO poll_submissions (poll_id, user_id) VALUES (?, ?)",
          [pollId, userId],
        );
        submissionId = Number(result.insertId);
      }

      const insertValues: Array<[number, number, number]> = [];
      Object.entries(normalized).forEach(([questionId, optionIds]) => {
        optionIds.forEach((optionId) => {
          insertValues.push([
            submissionId,
            Number(questionId),
            Number(optionId),
          ]);
        });
      });

      if (insertValues.length) {
        await conn.query(
          "INSERT INTO poll_answers (submission_id, question_id, option_id) VALUES ?",
          [insertValues],
        );
      }

      await conn.commit();
    } catch (error) {
      await conn.rollback();
      throw error;
    }

    return getPoll(pollId);
  });
};
