### **QW 프로젝트 시스템 분석 보고서**

#### 1. 시스템 개요

이 시스템은 **웹 기반 품질 검수 관리 시스템**으로 추정됩니다. 사용자는 웹 브라우저를 통해 시스템에 접속하여 검수 항목을 등록, 조회, 수정하고 관련 통계를 확인할 수 있습니다.

- **프론트엔드(Frontend):** 사용자에게 보여지는 화면(UI)과 사용자 경험(UX)을 담당합니다. React 라이브러리를 기반으로 제작된 SPA(Single Page Application)입니다.
- **백엔드(Backend):** 데이터 처리, 데이터베이스 연동, 사용자 인증 등 핵심 비즈니스 로직을 담당합니다. Python의 Flask 프레임워크를 기반으로 제작된 API 서버입니다.
- **웹 서버(Web Server):** Nginx를 리버스 프록시(Reverse Proxy)로 사용하여 프론트엔드와 백엔드를 연결하고 외부에 서비스를 제공합니다.

#### 2. 기술 스택 (Technology Stack)

| 구분 | 기술 | 역할 및 설명 |
| --- | --- | --- |
| **백엔드** | Python, Flask | API 서버 개발을 위한 프로그래밍 언어 및 웹 프레임워크 |
| | Waitress | 순수 Python으로 작성된 경량 프로덕션 WSGI 서버 |
| | pyodbc | Python에서 ODBC(Open Database Connectivity)를 통해 데이터베이스에 연결하기 위한 라이브러리 (주로 MS SQL Server와 연동 시 사용) |
| | passlib | 비밀번호 해싱 및 검증을 위한 라이브러리 |
| **프론트엔드** | JavaScript, React | 동적인 사용자 인터페이스(UI) 구축을 위한 라이브러리 |
| | Vite | 매우 빠른 개발 서버 및 빌드 도구 |
| | (추정) Axios 또는 Fetch | 백엔드 API와 통신(HTTP 요청)하기 위한 라이브러리 |
| | (추정) CSS / CSS-in-JS | 컴포넌트 스타일링 |
| **웹 서버** | Nginx | 리버스 프록시, 정적 파일(HTML, CSS, JS) 서빙 |
| **데이터베이스** | (추정) MS SQL Server | `pyodbc` 사용으로 보아 MS SQL Server일 가능성이 높음. `schema.sql` 파일에 테이블 구조가 정의되어 있음. |

#### 3. 시스템 아키텍처 및 동작 원리

이 시스템은 현대적인 웹 애플리케이션에서 많이 사용되는 **3-Tier 아키텍처(프레젠테이션 - 비즈니스 로직 - 데이터)**를 따릅니다. 특히 프론트엔드와 백엔드가 완전히 분리된 구조입니다.

**사용자 요청 처리 흐름:**

1.  **사용자 접속:** 사용자가 웹 브라우저에 서버의 IP 주소나 도메인을 입력하여 접속합니다.
2.  **Nginx 수신:** Nginx 웹 서버가 사용자의 모든 요청을 최초로 수신합니다.
3.  **프론트엔드 서빙:**
    *   Nginx는 요청 경로가 API 호출(`http://서버주소/api/...` 와 같은 형태)이 아니면, 미리 빌드된 프론트엔드 파일(`frontend/dist` 폴더의 `index.html`, CSS, JavaScript 파일 등)을 사용자에게 전송합니다.
    *   사용자의 브라우저는 이 파일들을 받아 React 애플리케이션을 실행하고 초기 화면을 렌더링합니다.
4.  **API 요청 (데이터 요청):**
    *   사용자가 로그인, 검수 목록 조회 등 데이터를 필요로 하는 작업을 수행하면, React 앱은 백엔드 API (예: `/api/inspections`)를 호출합니다.
    *   이 API 요청 또한 Nginx로 전송됩니다.
5.  **리버스 프록시 (Nginx -> Backend):**
    *   Nginx는 요청 경로가 `/api`로 시작하는 것을 확인하고, 이 요청을 실제 백엔드 서버(Flask + Waitress)가 실행 중인 `http://127.0.0.1:5000`으로 전달(Proxy)합니다.
6.  **백엔드 처리:**
    *   Flask 애플리케이션(`app.py`)은 Nginx로부터 전달받은 요청을 처리합니다.
    *   `pyodbc`를 통해 데이터베이스에 연결하여 필요한 데이터를 조회, 생성, 수정, 삭제(CRUD)합니다.
    *   처리 결과를 JSON 형태로 Nginx에 반환합니다.
7.  **응답 반환:**
    *   Nginx는 백엔드로부터 받은 JSON 응답을 다시 사용자의 브라우저로 전달합니다.
    *   React 앱은 이 JSON 데이터를 받아 화면의 내용을 동적으로 업데이트합니다.

![image](https://user-images.githubusercontent.com/126784999/266933363-8013d31a-e7e1-4111-991b-01113800051c.png)

#### 4. 서버 환경 구성 및 설치 가이드

Windows Server에서 이 시스템을 운영하기 위해 필요한 소프트웨어와 설정 순서는 다음과 같습니다.

**A. 필수 설치 소프트웨어**

1.  **Nginx:** 웹 서버 및 리버스 프록시.
2.  **데이터베이스 시스템:** `schema.sql`과 `pyodbc`를 지원하는 데이터베이스. **Microsoft SQL Server**를 권장합니다.
3.  **SQL Server용 ODBC 드라이버:** Python(`pyodbc`)이 SQL Server와 통신하기 위해 반드시 필요합니다.
4.  **Python:** 백엔드 실행 환경.
5.  **Node.js & npm:** 프론트엔드 빌드 환경.

**B. 설치 및 배포 순서**

1.  **데이터베이스 준비**
    *   Windows Server에 SQL Server를 설치합니다.
    *   SQL Server Management Studio(SSMS) 등을 사용하여 `schema.sql` 파일의 쿼리를 실행하여 필요한 테이블과 데이터베이스를 생성합니다.
    *   데이터베이스 접속을 위한 사용자 계정을 생성하고 권한을 부여합니다.

2.  **백엔드 서버 설정 (`backend` 폴더)**
    *   Windows Server에 Python을 설치합니다. (설치 시 "Add Python to PATH" 옵션 체크)
    *   `backend` 폴더로 이동하여 가상환경을 생성하고 활성화합니다.
        ```bash
        cd C:\Users\Administrator\Downloads\QW\backend
        python -m venv venv
        venv\Scripts\activate
        ```
    *   `requirements.txt`에 명시된 라이브러리들을 설치합니다.
        ```bash
        pip install -r requirements.txt
        ```
    *   `.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 내부에 1번 단계에서 설정한 데이터베이스 접속 정보(서버 주소, 데이터베이스명, 사용자 ID, 비밀번호 등)를 정확하게 입력합니다.

3.  **프론트엔드 빌드 (`frontend` 폴더)**
    *   Windows Server에 Node.js를 설치합니다. (npm은 자동으로 함께 설치됨)
    *   `frontend` 폴더로 이동하여 의존성 라이브러리를 설치합니다.
        ```bash
        cd C:\Users\Administrator\Downloads\QW\frontend
        npm install
        ```
    *   프로덕션용으로 빌드합니다. 이 명령은 `dist` 폴더에 최적화된 정적 파일들을 생성합니다.
        ```bash
        npm run build
        ```

4.  **Nginx 설정 (리버스 프록시)**
    *   Nginx를 설치하고 `nginx.conf` 파일을 엽니다.
    *   `http` 블록 안에 다음과 유사한 `server` 블록을 추가하거나 수정합니다. (경로는 실제 환경에 맞게 수정해야 합니다.)

    ```nginx
    server {
        listen 80; # 외부에 서비스할 포트
        server_name your_server_ip_or_domain; # 서버의 IP 주소 또는 도메인

        # 1. 프론트엔드 정적 파일 서빙
        # 루트 경로(/)로 오는 요청은 frontend/dist 폴더의 파일을 제공
        location / {
            root   C:/Users/Administrator/Downloads/QW/frontend/dist;
            index  index.html;
            try_files $uri $uri/ /index.html; # React Router를 위한 설정
        }

        # 2. 백엔드 API 프록시
        # /api/ 로 시작하는 모든 요청은 백엔드 서버로 전달
        location /api/ {
            proxy_pass http://127.0.0.1:5000/; # Waitress가 실행 중인 주소
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```
    *   설정 파일을 저장하고 Nginx를 시작하거나 재시작합니다.
        ```bash
        # Nginx 설치 폴더로 이동
        cd C:\nginx-1.29.1
        nginx -s reload  # 설정 리로드
        nginx            # 시작
        ```

5.  **서비스 실행**
    *   **백엔드 서버 실행:** `backend` 폴더에서 Waitress를 사용하여 앱을 실행합니다.
        ```bash
        cd C:\Users\Administrator\Downloads\QW\backend
        venv\Scripts\activate
        waitress-serve --host 127.0.0.1 --port 5000 app:app
        ```
        (보안을 위해 외부(`0.0.0.0`)가 아닌 내부(`127.0.0.1`)에서만 수신 대기하도록 Nginx와 통신하는 것이 좋습니다.)
    *   **Nginx 실행:** Nginx가 실행 중인지 확인합니다.

이제 모든 설정이 완료되었습니다. 사용자는 브라우저를 통해 `http://your_server_ip_or_domain`으로 접속하여 시스템을 사용할 수 있습니다.
