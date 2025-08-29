### **QW 프로젝트 상세 로직 분석 보고서**

이 문서는 QW 프로젝트의 소스 코드를 기반으로 각 부분의 상세한 동작 방식과 데이터 흐름을 분석합니다.

#### 1. 백엔드 상세 로직 (`app.py`)

Flask 기반의 백엔드는 데이터베이스 연결, API 엔드포인트 제공, 사용자 인증을 처리합니다.

**가. 데이터베이스 연결 (`get_db_connection`)**
- `.env` 파일에 정의된 `DATABASE_URI` 환경 변수를 사용하여 `pyodbc` 라이브러리를 통해 MS SQL 데이터베이스에 연결합니다.
- 연결 실패 시 에러를 출력하고 `None`을 반환하여 각 API 함수에서 연결 실패를 처리할 수 있도록 합니다.

**나. API 엔드포인트 분석**

- **`POST /login`**
    - **역할:** 사용자 로그인 인증.
    - **로직:**
        1.  요청받은 `username`과 `password`를 JSON으로 수신합니다.
        2.  DB에서 `username`을 기준으로 `password_hash`를 조회합니다.
        3.  `passlib`의 `sha256.verify()` 함수를 사용해 제출된 비밀번호와 DB의 해시를 비교합니다.
        4.  인증 성공 시, `Users` 테이블의 `last_login` 시간을 업데이트하고 성공 메시지를 반환합니다. (주석에 따르면, 실제 앱에서는 여기서 JWT 같은 세션 토큰을 생성해야 합니다.)
        5.  실패 시 'Invalid credentials' 메시지와 401 상태 코드를 반환합니다.

- **`GET /inspections`**
    - **역할:** 전체 검수 목록 조회.
    - **로직:** `Inspections`, `Users`, `Companies`, `Products` 테이블을 `JOIN`하여 검수 기록에 관련된 모든 정보를 한번에 가져옵니다. 최신순(`received_date DESC`)으로 정렬하여 반환합니다.

- **`POST /inspections`**
    - **역할:** 신규 검수 항목 추가.
    - **로직 (특이사항):**
        1.  이 엔드포인트는 직접 DB에 데이터를 삽입하지 않습니다.
        2.  대신, 프론트엔드로부터 받은 데이터를 기반으로 **실행해야 할 SQL 쿼리 문자열을 생성**합니다.
        3.  생성된 SQL 쿼리는 업체를 확인하고 없으면 추가(`IF NOT EXISTS ... INSERT`), 제품을 확인하고 없으면 추가, 그리고 최종적으로 `Inspections` 테이블에 데이터를 삽입하는 3단계로 구성됩니다.
        4.  이 SQL 쿼리 문자열을 JSON 형태로 프론트엔드에 다시 반환합니다. **(보안상 매우 위험한 구조, 후술)**

- **`PUT /inspections/<id>`**
    - **역할:** 기존 검수 항목 수정.
    - **로직:** 요청받은 데이터를 기반으로 `UPDATE` SQL 구문을 동적으로 생성하여 특정 ID의 검수 기록을 수정합니다. 파라미터화된 쿼리를 사용하여 SQL 인젝션 공격을 방지합니다.

- **`DELETE /inspections/<id>`**
    - **역할:** 검수 항목 삭제.
    - **로직:** 특정 ID의 검수 기록을 `DELETE` 구문을 통해 삭제합니다.

- **`GET /companies`, `GET /users`**
    - **역할:** 필터링 UI를 위한 업체명 및 사용자명 목록 제공.
    - **로직:** 각 테이블에서 고유한 업체명과 사용자명을 조회하여 반환합니다.

#### 2. 데이터베이스 구조 (`schema.sql`)

- **`Users`:** 사용자 정보 (ID, 비밀번호 해시, 역할 등) 저장.
- **`Companies`:** 거래 업체 정보 저장.
- **`Products`:** 제품 정보 (제품명, 제품 코드) 저장.
- **`Inspections`:** 핵심 테이블. 모든 검수 기록을 저장합니다. `user_id`, `company_id`, `product_id`를 외래 키(Foreign Key)로 사용하여 다른 테이블들과 관계를 맺습니다. 검수/불량/조치 수량, 원인, 해결책, 진행률 등 상세 정보를 포함합니다.

#### 3. 프론트엔드 상세 로직 (`src/**/*.jsx`)

React 기반의 프론트엔드는 사용자 인터페이스와 상태 관리를 담당합니다. `axios`를 사용해 백엔드 API와 통신합니다.

**가. 핵심 라이브러리 및 설정**

- **`react-router-dom` (`App.jsx`):**
    - `/login`, `/`, `/statistics` 경로를 관리합니다.
    - `ProtectedRoute` 컴포넌트를 구현하여 `localStorage`의 `isAuthenticated` 값이 `'true'`가 아니면 로그인 페이지(`/login`)로 리디렉션시키는 인증 로직을 구현했습니다.
- **`axios`:** 모든 컴포넌트에서 백엔드 API(`const API_URL = '/api'`)와 통신하는 데 사용됩니다.
- **`@mui/material`:** Google의 Material Design을 구현한 UI 라이브러리로, 일관된 디자인의 UI 컴포넌트(버튼, 테이블, 폼 등)를 제공합니다.
- **`vite.config.js`:** 개발 환경에서 `/api` 요청을 백엔드 서버(예: `http://localhost:5000`)로 전달하는 프록시 설정이 **누락**되어 있습니다. 현재는 프로덕션 빌드 후 Nginx가 이 역할을 담당하는 구조에 의존하고 있습니다.

**나. 컴포넌트별 역할 및 데이터 흐름**

- **`Login.jsx`:**
    - 아이디와 비밀번호를 입력받아 `POST /api/login` API를 호출합니다.
    - 로그인 성공 시(HTTP 200), `localStorage`에 `isAuthenticated` 키를 `'true'`로 저장하고, 메인 페이지(`/`)로 페이지를 새로고침하여 이동합니다.
    - 실패 시 에러 메시지를 표시합니다.

- **`Dashboard.jsx`:**
    - 메인 대시보드 페이지입니다.
    - 페이지가 로드될 때 `useEffect`를 사용해 `GET /api/inspections` API를 호출하여 전체 검수 목록을 가져옵니다.
    - 가져온 데이터는 `StatsGrid`(통계), `InspectionForm`(신규 등록), `InspectionList`(목록) 컴포넌트에 `props`로 전달됩니다.
    - 로그아웃 버튼 클릭 시 `localStorage`에서 인증 키를 삭제하고 로그인 페이지로 이동합니다.

- **`InspectionList.jsx`:**
    - `Dashboard`로부터 받은 전체 검수 목록(`allInspections`)을 표시합니다.
    - `useEffect`를 사용해 `GET /api/companies`, `GET /api/users`를 호출하여 필터링 옵션을 채웁니다.
    - 사용자가 업체를 선택하면 `allInspections` 배열을 `filter`하여 화면에 보여줄 목록을 갱신합니다.
    - 각 행(Row)을 클릭하면 상세 정보를 보여주는 `InspectionDetailModal`을 엽니다.
    - 수정/삭제 버튼 클릭 시 `PUT /api/inspections/<id>` 또는 `DELETE /api/inspections/<id>` API를 호출합니다.

- **`InspectionForm.jsx`:**
    - 신규 검수 항목을 등록하는 폼입니다.
    - 사용자가 데이터를 입력하고 '등록하기' 버튼을 누르면, `formData` 상태를 `POST /api/inspections` API로 전송합니다.
    - 등록 성공 시 페이지를 새로고침하여 목록을 갱신합니다.