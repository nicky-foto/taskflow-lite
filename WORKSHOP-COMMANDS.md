# WORKSHOP-COMMANDS — SDLC ครบ loop กับ AI Coding Agent ด้วย mattpocock/skills

ทุกคำสั่งในสไลด์อยู่ที่นี่ copy ไปวางได้เลย
คำสั่งที่ขึ้นต้นด้วย `/` พิมพ์ใน Claude Code ส่วนที่เหลือรันใน terminal

> **ตามไม่ทัน?** ทุก Lab มี checkpoint:
> ```bash
> git stash
> git switch checkpoint/05-implement     # เปลี่ยนเลขตาม Lab ที่จะเริ่ม
> git switch -c my-work-05
> ```

---

## Pre-work

```bash
node -v                              # v20.9 ขึ้นไป
git clone https://github.com/nicky-foto/taskflow-lite.git
cd taskflow-lite
npm install
npx playwright install chromium      # browser สำหรับ e2e (~150 MB)
cp .env.example .env                 # ค่าปลอม ใช้ทดสอบ hook
npm run check
npm test                             # Tests 13 passed
npm run e2e                          # 2 passed
```

ติดตั้ง mattpocock/skills (ครั้งเดียวต่อเครื่อง เลือกทางเดียว):

```text
claude
/plugin install mattpocock-skills
/exit          แล้วเปิด claude ใหม่
```

หรือจาก terminal: `claude plugins install mattpocock-skills`
ใช้ Codex / agent อื่น: `npx skills@latest add mattpocock/skills` (เลือก `setup-matt-pocock-skills` ด้วย)

> ติดตั้งผ่าน plugin ทุก skill จะมี prefix `mattpocock-skills:` คำสั่งในไฟล์นี้เขียนชื่อเต็มทั้งหมด
> `/code-review` เฉย ๆ คือของ built-in Claude Code (คนละตัว) ให้ใช้ `/mattpocock-skills:code-review` เสมอ

---

## Lab 1 — ปรับ AGENTS.md และเปิด hooks

**1) พิมพ์ใน agent**

```text
อ่าน AGENTS.md และโค้ดใน repo นี้
แล้วเสนอ AGENTS.md ใหม่ที่มีแค่:
- Commands ที่เดาไม่ได้ (รวม e2e)
- Structure: rule อยู่ที่ไหน
- Rules ที่ต่างจาก default
- Red lines
ลบบรรทัดที่ Agent ทำอยู่แล้ว
เพิ่ม: Playwright เขียนหลัง behaviour ทำงานแล้ว ไม่ใช่ test-first
แสดง diff ก่อนแก้
```

**2) เปิด hooks**

```bash
# ใน Claude Code พิมพ์ /exit ก่อน
cd .claude
cp settings.example.json settings.json
cd ..
claude          # แล้วพิมพ์ /hooks ต้องเห็น PreToolUse และ Stop
```

**3) ทดสอบ hook ตรง ๆ (ต้องได้ "Blocked by guard hook" และ exit 2)**

```bash
echo '{"tool_name":"Bash","tool_input":{"command":"cat .env"}}' | node .claude/hooks/guard.mjs
echo "exit: $?"              # bash / macOS / Linux
```

```powershell
echo '{"tool_name":"Bash","tool_input":{"command":"cat .env"}}' | node .claude/hooks/guard.mjs
echo "exit: $LASTEXITCODE"   # PowerShell ($? ให้ True/False ไม่ใช่ exit code)
```

Checkpoint: `checkpoint/01-foundation`

---

## Lab 2 — /setup-matt-pocock-skills

```text
/mattpocock-skills:setup-matt-pocock-skills
```

| Skill ถาม | ตอบ |
|---|---|
| A · Issue tracker | **Local markdown** ⚠️ ห้ามเลือก GitHub (จะไปสร้าง issue ใน repo ผู้สอน) |
| B · Triage labels ใช้ default ไหม | yes |
| C · Domain docs | single-context |
| แก้ไฟล์ไหน | CLAUDE.md (มีอยู่แล้ว) |

ต้องเห็น: `CLAUDE.md` มี `## Agent skills`, และมี `docs/agents/issue-tracker.md`, `triage-labels.md`, `domain.md`

```bash
git add -A && git commit -m "Configure mattpocock skills"
```

Checkpoint: `checkpoint/02-setup`

---

## Lab 3 — /grill-with-docs

```text
/mattpocock-skills:grill-with-docs

Feature: มอบหมาย task
- Lead มอบ task ให้ Member ใน workspace ได้
- Member ดู "My tasks" ของตัวเองได้
- บันทึก Activity ว่าใครมอบให้ใคร เมื่อไร
```

คำตอบของ product owner (ตอบให้ตรงกันทั้งห้อง):

| ถ้าถูกถามเรื่องนี้ | ตอบ |
|---|---|
| Admin มอบได้ไหม | ได้ เหมือน Lead |
| Assignee กี่คน | 1 คน |
| มอบให้คนนอก workspace | ห้ามเด็ดขาด |
| My tasks ข้าม workspace ไหม | ไม่ แยกตาม workspace |
| task ที่ done มอบได้ไหม | ยังไม่ตัดสิน อนุญาตไปก่อน |
| แจ้งเตือน (email/chat) | ไม่ทำรอบนี้ |

ต้องเห็น: คำถามเป็น round มีเลขและคำตอบแนะนำ, `CONTEXT.md`, ADR ใน `docs/adr/` อย่างน้อย 1 ไฟล์
**จบแล้วอย่าเพิ่ง /clear** — Lab 4 ใช้บทสนทนานี้

Checkpoint: `checkpoint/03-grill`

---

## Lab 4 — /to-spec แล้ว /to-tickets

```text
/mattpocock-skills:to-spec
```

ถ้าถูกถามเรื่อง seams: **service seam + HTTP seam, UI ไม่ test-first (Playwright ทีหลัง)**

```text
/mattpocock-skills:to-tickets .scratch/task-assignment/spec.md
```

ถ้าถูกถามเรื่อง breakdown: **4 ใบ (assign, reject outsider, unassign, My tasks) — 02–04 blocked by 01**

Checklist:

- [ ] `spec.md` มี Out of Scope และ Testing Decisions
- [ ] ไม่มี file path ใน spec / ticket
- [ ] ticket แต่ละใบมี checkbox ที่ test ได้ และผ่าน service + API + UI
- [ ] `Status: ready-for-agent`

```bash
ls .scratch/task-assignment/issues/
git add -A && git commit -m "Spec and tickets for task assignment"
```

> ชื่อโฟลเดอร์อาจไม่ใช่ `task-assignment` ใช้ชื่อที่ Agent ตั้งจริงในคำสั่งถัดไป

Checkpoint: `checkpoint/04-tickets`

---

## Lab 5 — /implement ทีละ ticket

```bash
git switch -c feat/task-assignment
claude
```

```text
/clear
/mattpocock-skills:implement .scratch/task-assignment/issues/01-lead-assigns-a-task.md
ทวนชื่อ ticket และ seams ก่อนเริ่ม
```

ต้องเห็น: Agent ทวน ticket + seams → test fail จริงก่อนโค้ด (red) → green → commit บน `feat/task-assignment`

ปิด ticket ด้วยมือ (skill ไม่ปิดให้):

```bash
# ในไฟล์ ticket: ติ๊ก - [x] ทุกข้อ และเปลี่ยนเป็น **Status:** done
git add -A && git commit -m "Close ticket 01"
```

แล้ว `/clear` และทำใบถัดไป (02, 03, 04) ด้วยคำสั่งเดิม เปลี่ยน path

Checkpoint: `checkpoint/05-implement` (ครบ 4 ใบ)

---

## Lab 6 — Review

**6.1 Standards + Spec (session ใหม่)**

```text
/clear
/mattpocock-skills:code-review main
spec อยู่ที่ .scratch/task-assignment/
```

> มาจาก checkpoint? ใช้ `checkpoint/04-tickets` แทน `main`

**6.2 Security reviewer**

```text
รัน git diff main แล้วส่ง diff ทั้งหมด
ให้ security-reviewer subagent ตรวจ
ห้ามแก้ไฟล์ แค่รายงานผล
```

**แก้ finding**

```text
แก้ finding [BLOCKER] ข้อแรกด้วย /tdd:
เขียน test ที่ HTTP seam ที่ fail เพราะ bug นี้ก่อน แล้วค่อยแก้โค้ด
```

**6.3 Break it on purpose**

1. เปิด `src/services/task-service.ts`
2. ใน `createTask` ใส่ `//` หน้าบรรทัด `assertMember(store, actorId, workspaceId);`
3. รัน `npm test` ใน terminal
4. จดผล: มี test ไหน fail ไหม?

ถ้าไม่มี test fail:

```text
เขียน test ที่พิสูจน์ว่าคนนอก workspace สร้าง / ดู / แก้ / ลบ task ไม่ได้ และไม่มีอะไรถูกเขียน
รันให้เห็นว่า fail (เพราะบรรทัดที่ comment อยู่)
ห้ามแก้ไฟล์ใน src/ แม้ Stop hook จะแจ้งว่า test fail
แล้วผมจะเอา comment ออกเอง
```

จากนั้นเอา `//` ออก แล้วรัน `npm test` ต้องเขียวทั้งหมด

Checkpoint: `checkpoint/06-review`

---

## Lab 7 — Fix bug

ลองเห็นอาการเองก่อน:

```bash
npm run dev      # http://localhost:3000
# Acting as: Ann → ลบ "Write style guide" → เพิ่ม "Prepare demo" → เปลี่ยน status ของ "Prepare demo"
```

**7.1 Triage**

```text
/clear
/mattpocock-skills:triage
ดู .scratch/inbox/issues/01-status-change-says-forbidden.md ให้หน่อย
```

**7.2 Diagnose**

```text
/mattpocock-skills:diagnosing-bugs
ตาม Agent Brief ใน .scratch/inbox/issues/01-status-change-says-forbidden.md
โชว์ hypothesis ให้ดูก่อน และหยุดรอผมอนุมัติ root cause ก่อนแก้โค้ด
```

ต้องเห็นตามลำดับ: คำสั่งเดียวที่ red บน bug นี้ → repro ที่ตัดจนเล็กสุด → hypothesis 3–5 ข้อ →
regression test red → fix → green → ไม่มี `[DEBUG-` เหลือ → commit message ที่บอก hypothesis ที่ถูก

```bash
grep -rn "\[DEBUG-" src tests || echo "clean"
npm run check && npm test
```

Checkpoint: `checkpoint/07-bugfix`

---

## Lab 8 — Automation test (Playwright)

**8.1 เขียน e2e จาก user stories**

```text
/clear
อ่าน .scratch/task-assignment/spec.md (User Stories)
และ e2e/smoke.spec.ts เป็นตัวอย่าง
เสนอ journey ที่คุ้มจะเป็น e2e ไม่เกิน 5 ตัว
บอกว่าแต่ละตัวพิสูจน์อะไรที่ Vitest พิสูจน์ไม่ได้
รอผมเลือกก่อน แล้วค่อยเขียนใน e2e/
ใช้ getByRole/getByLabel, ห้าม waitForTimeout
รัน npm run e2e แล้วแสดง output
```

```bash
npm run e2e                          # ต้องเขียวทั้งหมด
npx playwright test --ui             # ดูทีละ step
```

**8.2 Break it ที่ชั้น UI**

1. เปิด `public/app.js`
2. ใน PUT ของ assignee picker เปลี่ยน `{ assigneeId: assignee.value }` เป็น `{ assigneeId: "chai" }`
3. `npm test` (ยังเขียว) แล้ว `npm run e2e` (journey ไหน fail?)
4. เปิด trace: `npx playwright show-trace test-results/<โฟลเดอร์>/trace.zip`
5. คืนโค้ด แล้วรันใหม่ให้เขียว

**ให้ CI รัน e2e**

```text
เพิ่ม job e2e ใน .github/workflows/ci.yml
รันหลัง job test ผ่าน และเก็บ trace เมื่อ fail
```

Checkpoint: `solution/final`

---

## Cheat sheet

```text
/context   /clear   /rewind   /hooks   /agents   /plugin

/mattpocock-skills:setup-matt-pocock-skills
/mattpocock-skills:grill-with-docs
/mattpocock-skills:to-spec
/mattpocock-skills:to-tickets <spec>
/mattpocock-skills:implement <ticket>
/mattpocock-skills:code-review <fixed-point>
/mattpocock-skills:triage
/mattpocock-skills:diagnosing-bugs
/mattpocock-skills:ask-matt          ไม่รู้จะใช้ skill ไหน
```

```bash
npm run check      npm test      npm run e2e      npm run dev
```
