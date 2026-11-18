# 그라운드북 (Groundbook)

아마추어 야구 리그 운영 웹앱 MVP 샘플.

## 실행

```bash
cd /agent/groundbook
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

브라우저: http://127.0.0.1:5173/

## 구성

- 공개: 홈 · 일정 · 결과 · 순위 · 명단
- 운영실(`/ops`): 리그 · 팀 · 선수 · 일정 · 경기 기록(이닝 득점판)
- 시드 데모 데이터 + `localStorage` 유지 · 「데모 데이터 초기화」로 복원
