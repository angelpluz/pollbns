"use client";

import { useEffect, useState } from "react";
import type { PollWithStats, QuestionAnswer } from "@/lib/polls";
import type { PollUser } from "@/lib/auth";

type AnswerState = Record<
  string,
  {
    optionIds: string[];
    textAnswer: string;
  }
>;

type StatusState =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

interface PollCardProps {
  poll: PollWithStats;
  currentUser: PollUser | null;
}

const buildAnswerState = (answers: QuestionAnswer[] | null): AnswerState => {
  if (!answers) {
    return {};
  }
  return answers.reduce<AnswerState>((acc, answer) => {
    acc[answer.questionId] = {
      optionIds: answer.optionIds ?? [],
      textAnswer: answer.textAnswer ?? "",
    };
    return acc;
  }, {});
};

const questionBadge = (responseKind: string, allowMultiple: boolean) => {
  if (responseKind === "text") {
    return "ตอบเป็นข้อความ";
  }
  return allowMultiple ? "เลือกได้หลายคำตอบ" : "เลือกได้คำตอบเดียว";
};

export default function PollCard({ poll, currentUser }: PollCardProps) {
  const [pollState, setPollState] = useState(poll);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [status, setStatus] = useState<StatusState>({ type: "idle" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVote, setIsLoadingVote] = useState(false);

  useEffect(() => {
    setPollState(poll);
  }, [poll]);

  useEffect(() => {
    if (!currentUser) {
      setAnswers({});
      return;
    }
    let cancelled = false;

    const loadVote = async () => {
      setIsLoadingVote(true);
      try {
        const response = await fetch(`/api/polls/${poll.id}/votes/me`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดคำตอบก่อนหน้าได้");
        }
        const data = (await response.json()) as {
          vote: QuestionAnswer[] | null;
        };
        if (!cancelled) {
          setAnswers(buildAnswerState(data.vote));
        }
      } catch (error) {
        if (!cancelled) {
          setStatus({
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "โหลดคำตอบเดิมไม่สำเร็จ",
          });
        }
      } finally {
        if (!cancelled) {
          setIsLoadingVote(false);
        }
      }
    };

    loadVote();
    return () => {
      cancelled = true;
    };
  }, [poll.id, currentUser]);

  const toggleOption = (
    questionId: string,
    optionId: string,
    allowMultiple: boolean,
  ) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.optionIds ?? [];
      const base = prev[questionId] ?? { optionIds: [], textAnswer: "" };
      let nextSelection: string[];
      if (allowMultiple) {
        nextSelection = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      } else {
        nextSelection = [optionId];
      }
      return {
        ...prev,
        [questionId]: { ...base, optionIds: nextSelection },
      };
    });
  };

  const handleTextChange = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] ?? { optionIds: [], textAnswer: "" }),
        textAnswer: text,
      },
    }));
  };

  const submitVote = async () => {
    if (!currentUser) {
      setStatus({ type: "error", message: "กรุณาเข้าสู่ระบบก่อน" });
      return;
    }
    const payload: QuestionAnswer[] = [];

    pollState.questions.forEach((question) => {
      const entry = answers[question.id];
      if (question.responseKind === "text") {
        const text = entry?.textAnswer.trim();
        if (text) {
          payload.push({ questionId: question.id, textAnswer: text });
        }
        return;
      }
      const optionIds = entry?.optionIds ?? [];
      if (optionIds.length) {
        payload.push({ questionId: question.id, optionIds });
      }
    });

    if (!payload.length) {
      setStatus({ type: "error", message: "เลือกคำตอบก่อนส่ง" });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle" });
    try {
      const response = await fetch(`/api/polls/${pollState.id}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "ส่งคำตอบไม่สำเร็จ");
      }
      setPollState(data.poll as PollWithStats);
      setStatus({ type: "success", message: "บันทึกคำตอบเรียบร้อย" });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error ? error.message : "ส่งคำตอบไม่สำเร็จ",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="poll-card">
      <h2>{pollState.title}</h2>
      {pollState.description && <p>{pollState.description}</p>}
      <p className="badge" style={{ marginBottom: "1rem" }}>
        ตอบแล้วทั้งหมด {pollState.totalResponses} คน
      </p>

      {pollState.questions.map((question) => {
        const selection = answers[question.id]?.optionIds ?? [];
        const textValue = answers[question.id]?.textAnswer ?? "";
        return (
          <div key={question.id} className="question-block">
            <h3>{question.text}</h3>
            <span className="status-text">
              {questionBadge(question.responseKind, question.allowMultiple)}
            </span>
            {question.responseKind === "text" ? (
              <textarea
                value={textValue}
                onChange={(e) => handleTextChange(question.id, e.target.value)}
                placeholder="พิมพ์คำตอบของคุณที่นี่"
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "0.6rem",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.4)",
                  background: "rgba(15,23,42,0.5)",
                  color: "#e2e8f0",
                }}
                disabled={!currentUser || isSubmitting}
              />
            ) : (
              question.options.map((option) => (
                <div key={option.id} className="option-line">
                  <label>
                    <input
                      type={question.allowMultiple ? "checkbox" : "radio"}
                      name={question.id}
                      checked={selection.includes(option.id)}
                      disabled={!currentUser || isSubmitting}
                      onChange={() =>
                        toggleOption(
                          question.id,
                          option.id,
                          question.allowMultiple,
                        )
                      }
                    />
                    <span>{option.text}</span>
                  </label>
                  <span className="badge">{option.votes} โหวต</span>
                </div>
              ))
            )}
          </div>
        );
      })}

      <div className="actions" style={{ justifyContent: "space-between" }}>
        <button
          className="primary-button"
          disabled={!currentUser || isSubmitting}
          onClick={submitVote}
        >
          {isSubmitting ? "กำลังส่ง..." : "ส่งคำตอบ"}
        </button>
        {isLoadingVote && (
          <span className="status-text">กำลังโหลดคำตอบเดิม...</span>
        )}
      </div>

      {status.type === "success" && (
        <div className="alert alert-success">{status.message}</div>
      )}
      {status.type === "error" && (
        <div className="alert alert-error">{status.message}</div>
      )}
      {!currentUser && (
        <p className="status-text" style={{ marginTop: "0.5rem" }}>
          ต้องเข้าสู่ระบบก่อนถึงจะโหวตได้นะ
        </p>
      )}
    </article>
  );
}
