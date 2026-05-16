Closes #2

### 🎯 구현 내용
- `app/page.tsx` 삭제 및 충돌 방지를 위한 `app/(b2c)/page.tsx` 랜딩 페이지 이전
- `/(b2c)`, `/(b2b)`, `/(admin)` 독립 레이아웃 및 `loading.tsx` 스켈레톤 생성
- B2C 레이아웃 Footer에 면책 조항 컴포넌트 추가
- AC 검증용 `/(b2b)/listing/new`, `/(admin)/ltv-policy` Placeholder 페이지 작성
- `globals.css` 및 `layout.tsx`에서 글로벌 폰트를 Pretendard로 교체

### ✅ 확인 사항
- [x] 각 라우트별 레이아웃 렌더링 확인
- [x] `npm run build` 오류 없음 확인
