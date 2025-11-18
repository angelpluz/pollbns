-- Add response_kind column for text questions if it doesn't exist
ALTER TABLE poll_questions
  ADD COLUMN IF NOT EXISTS response_kind ENUM('multiple_choice','text') NOT NULL DEFAULT 'multiple_choice' AFTER question_text;

-- Table to store open-text answers
CREATE TABLE IF NOT EXISTS poll_text_answers (
  submission_id BIGINT UNSIGNED NOT NULL,
  question_id BIGINT UNSIGNED NOT NULL,
  answer_text TEXT NOT NULL,
  PRIMARY KEY (submission_id, question_id),
  FOREIGN KEY (submission_id) REFERENCES poll_submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES poll_questions(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Remove previous version of the survey if it exists
DELETE FROM polls WHERE id NOT IN ('bns-reds-feedback');

INSERT INTO polls (id, title, description)
VALUES (
  'bns-reds-feedback',
  'แบบสอบถาม BNS REDS',
  'สำรวจความคิดเห็นผู้เล่นเกี่ยวกับประสบการณ์ BNS REDS'
)
ON DUPLICATE KEY UPDATE
  title = VALUES(title),
  description = VALUES(description);

SET @poll_id := 'bns-reds-feedback';

-- Q1
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '1) เหตุผลที่ทำให้ท่านหยุดเล่น / เลิกเล่น BNS REDS (เลือกได้มากกว่า 1 ข้อ)', 'multiple_choice', 1, 10);
SET @q1 := LAST_INSERT_ID();
INSERT INTO poll_options (question_id, option_text, sort_order) VALUES
(@q1, 'เนื้อหา/กิจกรรมไม่มีสิ่งใหม่ที่น่าสนใจ', 1),
(@q1, 'การปรับสมดุลอาชีพ (Balance Patch) ที่ไม่สอดคล้องกับการเล่นจริง', 2),
(@q1, 'การสื่อสารและพฤติกรรมของผู้ดูแลระบบ (Admin Thee) ทำให้รู้สึกไม่อยากเล่น', 3),
(@q1, 'ความเหลื่อมล้ำระหว่างผู้เล่นเติม–ไม่เติม', 4),
(@q1, 'ปัญหาบัค / ความเสถียร / ปิงสูง', 5),
(@q1, 'อื่น ๆ (โปรดระบุ)', 6);
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '1) อื่น ๆ (โปรดระบุเพิ่มเติม)', 'text', 0, 11);

-- Q2
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '2) เหตุการณ์ใดทำให้ท่านรู้สึกว่า “บรรยากาศของ BNS REDS ไม่สนุกอีกต่อไป” (เลือกได้มากกว่า 1 ข้อ)', 'multiple_choice', 1, 20);
SET @q2 := LAST_INSERT_ID();
INSERT INTO poll_options (question_id, option_text, sort_order) VALUES
(@q2, 'การอัปเดตแพตช์ที่ทำให้ผู้เล่นส่วนใหญ่เล่นยากขึ้น / ไม่สอดคล้องกับการเล่นจริง', 1),
(@q2, 'การไม่เปิดรับฟังข้อเสนอจากผู้เล่นทั่วไปเกี่ยวกับกิจกรรม / การบาลานซ์', 2),
(@q2, 'การตำหนิผู้เล่นว่า “เล่นไม่เป็น” หรือ “ไม่มีความสามารถพอ”', 3),
(@q2, 'ทัศนคติของ Admin ที่ทำให้ Community รู้สึกไม่กล้าแสดงความคิดเห็น', 4),
(@q2, 'กิจกรรมในเกมที่ถูกออกแบบโดยไม่คำนึงถึงผู้เล่นใหม่ / ผู้เล่นกลุ่มกว้าง', 5),
(@q2, 'อื่น ๆ (โปรดระบุ)', 6);
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '2) อื่น ๆ (โปรดระบุเพิ่มเติม)', 'text', 0, 21);

-- Q3
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '3) ปัจจัยใด “ควรได้รับการแก้ไขเป็นอันดับแรก” หากต้องการให้ผู้เล่นกลับมา (เลือกได้ 1 ข้อ)', 'multiple_choice', 0, 30);
SET @q3 := LAST_INSERT_ID();
INSERT INTO poll_options (question_id, option_text, sort_order) VALUES
(@q3, 'การบาลานซ์อาชีพให้เป็นธรรม', 1),
(@q3, 'วิธีการสื่อสารของทีมงาน โดยเฉพาะ Admin Thee', 2),
(@q3, 'คุณภาพกิจกรรม / รางวัล / ระบบพัฒนาไอเท็ม', 3),
(@q3, 'ความเสถียรของเซิร์ฟเวอร์', 4),
(@q3, 'ความโปร่งใสในการออกประกาศ / การตัดสินใจของทีมงาน', 5),
(@q3, 'อื่น ๆ (โปรดระบุ)', 6);
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '3) อื่น ๆ (โปรดระบุเพิ่มเติม)', 'text', 0, 31);

-- Q4
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '4) ความรู้สึกที่มีต่อ Admin / ทีมงาน BNS REDS (เลือกได้มากกว่า 1 ข้อ)', 'multiple_choice', 1, 40);
SET @q4 := LAST_INSERT_ID();
INSERT INTO poll_options (question_id, option_text, sort_order) VALUES
(@q4, 'ทีมงานตั้งใจ แต่ยังขาดความเข้าใจผู้เล่นจริง ๆ', 1),
(@q4, 'ไม่รับ Feedback จากผู้เล่นเท่าที่ควร', 2),
(@q4, 'การสื่อสารของ Admin Thee ทำให้ผู้เล่นรู้สึกถูกด้อยค่า', 3),
(@q4, 'ทีมงานตอบสนองช้า / ข้อมูลไม่ครบถ้วน', 4),
(@q4, 'ไม่มีปัญหากับทีมงาน', 5),
(@q4, 'อื่น ๆ (โปรดระบุ)', 6);
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '4) อื่น ๆ (โปรดระบุเพิ่มเติม)', 'text', 0, 41);

-- Q5
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '5) สิ่งที่อยากฝากถึง Admin หรือทีมงาน BNS REDS (ตอบเป็นข้อความ)', 'text', 0, 50);

-- Q6
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '6) หลังจากกิจกรรมดันสุสานนิรันดร์ ... รู้สึกอย่างไรกับการเปิดรับ Feedback? (เลือกได้ 1 ข้อ)', 'multiple_choice', 0, 60);
SET @q6 := LAST_INSERT_ID();
INSERT INTO poll_options (question_id, option_text, sort_order) VALUES
(@q6, 'ยังรู้สึกว่าไม่จริงใจเท่าที่ควร', 1),
(@q6, 'รู้สึกว่ามีการรับฟังมากขึ้นกว่าเดิม', 2),
(@q6, 'ถ้าไม่มีการร้องเรียนก่อน ก็คงไม่สนใจหรือไม่ปรับอะไรเลย', 3);

-- Q7
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '7) หลังจากมีการปรับ Balance ดันเจี้ยน 6 คน ... ท่านรู้สึกอย่างไร? (เลือกได้ 1 ข้อ)', 'multiple_choice', 0, 70);
SET @q7 := LAST_INSERT_ID();
INSERT INTO poll_options (question_id, option_text, sort_order) VALUES
(@q7, 'ยังรู้สึกว่าไม่จริงใจเท่าที่ควร', 1),
(@q7, 'รู้สึกว่ามีการรับฟังและปรับให้ดีขึ้น', 2),
(@q7, 'ถ้าไม่มีการร้องเรียนก่อน ก็คงไม่สนใจหรือไม่ปรับอะไรเลย', 3);

-- Q8
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '8) หลังจากการปรับแพตช์ QOL ล่าสุด ... ท่านรู้สึกอย่างไร? (เลือกได้ 1 ข้อ)', 'multiple_choice', 0, 80);
SET @q8 := LAST_INSERT_ID();
INSERT INTO poll_options (question_id, option_text, sort_order) VALUES
(@q8, 'ยังรู้สึกว่าไม่จริงใจเท่าที่ควร', 1),
(@q8, 'รู้สึกว่าทีมงานรับฟังและพยายามปรับให้ดีขึ้น', 2),
(@q8, 'ถ้าไม่มีการร้องเรียนก่อน ก็คงไม่สนใจหรือไม่ปรับอะไรเลย', 3);

-- Q9
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '9) เหตุผลใดที่ทำให้ท่านรู้สึกว่าทีมงาน BNS REDS และผู้เล่น “พอจะเดินหน้าพัฒนาโปรเจกต์ร่วมกันได้”?', 'text', 0, 90);

-- Q10
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '10) ตั้งแต่เมื่อไหร่ที่ท่านรู้สึกว่า “บรรยากาศของเกมเริ่มผลักผู้เล่นออกไป”? (เลือกได้ 1 ข้อ)', 'multiple_choice', 0, 100);
SET @q10 := LAST_INSERT_ID();
INSERT INTO poll_options (question_id, option_text, sort_order) VALUES
(@q10, 'การปรับเลือดและความสามารถของมอนสเตอร์ตั้งแต่ดันสุสานพันปี', 1),
(@q10, 'การปรับเลือดและความสามารถตั้งแต่ดันค้อน', 2),
(@q10, 'การปรับกิจกรรมรายสัปดาห์ที่บังคับให้ผ่านดันที่ยากเกินจำเป็น', 3),
(@q10, 'การปรับลดของรางวัลกิจกรรมปกติ แล้วนำไปไว้ในส่วนที่ยากเกินความจำเป็น (เช่น 30 ใบสุดท้าย)', 4),
(@q10, 'อื่น ๆ (โปรดระบุ)', 5);
INSERT INTO poll_questions (poll_id, question_text, response_kind, allow_multiple, sort_order)
VALUES (@poll_id, '10) อื่น ๆ (โปรดระบุเพิ่มเติม)', 'text', 0, 101);
