# 🏛️ PolisayAI: Next-Gen Legislative Intelligence Platform

PolisayAI는 일본 정계의 방대한 입법 데이터와 정책 수혜자들의 목소리를 AI로 분석하여 정밀한 정책 인사이트를 제공하는 **지능형 입법 지원 플랫폼**입니다. 

실시간 데이터 수집(National Diet Library API), KOL(Key Opinion Leaders) 영향력 추적, 그리고 시장 수요와 정책 공급 간의 격차 분석을 통해 더 나은 의사결정을 돕습니다.

## ✨ 주요 기능

*   **📊 Intelligence Dashboard**: 전체 데이터 수집 현황 및 주요 정책 테마(의료, DX, 경제 등)의 실시간 빈도 시각화.
*   **👥 KOL Influence Board**: 일본 국회 발언자들의 활동 데이터와 파벌, 발언 횟수 기반의 영향력 분석 명단 제공.
*   **📈 Policy Trend Tracking**: 정책 주제별 논의 모멘텀 변화를 시계열 차트로 모니터링.
*   **🎯 Strategic Gap Analysis**: 시장이 요구하는 정책(Demand)과 국회에서 논의되는 정책 밀도(Supply) 사이의 정합성 진단 및 권고안 제공.
*   **🏗️ Data Center (Admin)**: KR/JP 멀티 소스 데이터 수집기 컨트롤 및 수집 파라미터 상세 설정 기능.

## 🛠️ 기술 스택

*   **Frontend**: Next.js 15 (App Router), TailwindCSS (Customized Glassmorphism), Lucide React.
*   **Visualization**: Recharts (Dynamic SVG Charts).
*   **Backend**: Node.js (Next.js API Routes).
*   **AI/Analysis**: Gemini 2.0 Flash (Policy Relevance & Intent Analysis).
*   **Data Aggregation**: Node.js File System based High-performance Record Indexing.

## 🚀 시작하기

### 1. 전제 조건
*   Node.js 18.x 이상
*   `npm` 또는 `yarn` 패키지 매니저

### 2. 설치 및 실행
```bash
# 저장소 복사
git clone https://github.com/your-repo/PolisayAI.git
cd PolisayAI

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

### 3. 데이터 수집 설정
관리자 페이지(`/admin/data`)에서 API 키를 설정하거나 사전에 정의된 NDL API를 통해 데이터를 로컬로 다운로드할 수 있습니다. 다운로드된 데이터는 `data/raw/`에 저장되며 대시보드에 즉시 반영됩니다.

---
© 2026 PolisayAI Team. Built with ❤️ for Better Governance.
