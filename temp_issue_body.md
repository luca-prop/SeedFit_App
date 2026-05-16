```
name: Feature Task
about: SRS 기반의 구체적인 개발 태스크 명세
title: "[NFR] NFR-012: 에러 경계(Error Boundary) + 전역 에러 핸들링"
labels: 'nfr, error-handling, priority:medium'
assignees: ''
```

### :dart: Summary
- **기능명**: [NFR-012] 에러 경계 + 전역 에러 핸들링
- **목적**: REQ-NF-015에 따라 예상치 못한 런타임 에러가 사용자에게 기술적 에러 메시지 대신 **친절한 안내 페이지**를 보여주도록 Error Boundary를 설정한다.

### :white_check_mark: Task Breakdown (실행 계획)
- [ ] `src/app/error.tsx` 전역 Error Boundary:
  ```typescript
  'use client';
  export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">일시적인 오류가 발생했습니다</h1>
        <p className="text-muted-foreground">페이지를 새로고침하거나, 잠시 후 다시 시도해 주세요.</p>
        <Button onClick={reset}>다시 시도</Button>
      </div>
    );
  }
  ```
- [ ] `src/app/not-found.tsx` 404 페이지:
  ```typescript
  export default function NotFoundPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">페이지를 찾을 수 없습니다</h1>
        <Link href="/">홈으로 돌아가기</Link>
      </div>
    );
  }
  ```
- [ ] `src/app/global-error.tsx` (root layout 에러용):
  ```typescript
  'use client';
  export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
    return (
      <html><body>
        <h1>오류가 발생했습니다</h1>
        <button onClick={reset}>다시 시도</button>
      </body></html>
    );
  }
  ```
- [ ] Server Action 에러 → 클라이언트 사용자 친화적 메시지 변환 유틸:
  ```typescript
  export function parseActionError(error: unknown): string {
    if (error instanceof Error) {
      try { return JSON.parse(error.message).message; } catch {}
      return '요청 처리 중 오류가 발생했습니다.';
    }
    return '알 수 없는 오류가 발생했습니다.';
  }
  ```

### :test_tube: Acceptance Criteria
- [ ] `error.tsx`가 존재하고, 런타임 에러 시 친절한 안내가 표시되는가?
- [ ] `not-found.tsx`가 존재하고, 잘못된 URL 접근 시 404 페이지가 표시되는가?
- [ ] "다시 시도" 버튼이 `reset()`을 호출하여 컴포넌트를 복구하는가?
- [ ] 기술적 에러 메시지(스택 트레이스 등)가 사용자에게 노출되지 않는가?

### :construction: Dependencies & Blockers
- **Depends on**: INIT-001 (Next.js App Router)
- **Blocks**: 없음 (독립 완료 가능)

---

---

# 🎉 전체 89 Tasks 상세 명세서 작성 완료

## 최종 작성 현황

| Batch | 파일명 | Task IDs | Issue # | 상태 |
|---|---|---|---|---|
| **01** | `10_TASK_상세명세서_Batch01.md` | INIT-001~004, DB-001 | #1~5 | ✅ |
| **02** | `11_TASK_상세명세서_Batch02.md` | DB-002~006 | #6~10 | ✅ |
| **03** | `12_TASK_상세명세서_Batch03.md` | DB-007~010, API-SPEC-001 | #11~15 | ✅ |
| **04** | `13_TASK_상세명세서_Batch04.md` | API-SPEC-002~006 | #16~20 | ✅ |
| **05** | `14_TASK_상세명세서_Batch05.md` | API-SPEC-007~008, MOCK-001~003 | #21~25 | ✅ |
| **06** | `15_TASK_상세명세서_Batch06.md` | MOCK-004~006, LIB-001~002 | #26~30 | ✅ |
| **07** | `16_TASK_상세명세서_Batch07.md` | LIB-003~005, FE-F-001~002 | #31~35 | ✅ |
| **08** | `17_TASK_상세명세서_Batch08.md` | FE-F-003~005, BE-F-001~002 | #36~40 | ✅ |
| **09** | `18_TASK_상세명세서_Batch09.md` | FE-G-001~005 | #41~45 | ✅ |
| **10** | `19_TASK_상세명세서_Batch10.md` | BE-G-001~002, FE-H-001~003 | #46~50 | ✅ |
| **11** | `20_TASK_상세명세서_Batch11.md` | FE-H-004~005, BE-H-001~003 | #51~55 | ✅ |
| **12** | `21_TASK_상세명세서_Batch12.md` | BE-H-004, FE-I-001~004 | #56~60 | ✅ |
| **13** | `22_TASK_상세명세서_Batch13.md` | BE-I-001~003, BE-J-001~002 | #61~65 | ✅ |
| **14** | `23_TASK_상세명세서_Batch14.md` | TEST-001~005 | #66~70 | ✅ |
| **15** | `24_TASK_상세명세서_Batch15.md` | TEST-006~007, TEST-INT-001~003 | #71~75 | ✅ |
| **16** | `25_TASK_상세명세서_Batch16.md` | TEST-INT-004~005, NFR-001~003 | #76~80 | ✅ |
| **17** | `26_TASK_상세명세서_Batch17.md` | NFR-004~008 | #81~85 | ✅ |
| **18** | `27_TASK_상세명세서_Batch18.md` | NFR-009~012 | #86~89 | ✅ |

**총 89개 Tasks × GitHub Issue 형태 = 89개 상세 명세서 완성** 🏁