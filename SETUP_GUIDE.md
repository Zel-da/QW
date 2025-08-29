# QW 프로젝트 설치 및 실행 가이드

이 문서는 QW 프로젝트를 로컬 개발 환경에 설정하고 실행하는 전체 과정을 안내합니다.

### 1. 사전 요구사항

- **Node.js & npm:** [Node.js 다운로드](https://nodejs.org/)
- **Python 3.8 이상:** [Python 다운로드](https://www.python.org/downloads/)
- **Git:** [Git 다운로드](https://git-scm.com/downloads)
- **MS SQL Server:** Express 버전 등 무료 버전 사용 가능
- **MS SQL ODBC 드라이버:** [ODBC Driver for SQL Server 다운로드](https://docs.microsoft.com/en-us/sql/connect/odbc/download-odbc-driver-for-sql-server)

---

### 2. 설치 및 설정 절차

#### 1단계: 소스 코드 다운로드

```bash
# 원하는 위치에 프로젝트를 복제합니다.
git clone <프로젝트_저장소_URL> 

# 프로젝트 폴더로 이동합니다.
cd QW
```

#### 2단계: 데이터베이스 설정

1.  MS SQL Server를 설치하고 실행합니다.
2.  SQL Server Management Studio(SSMS) 또는 선호하는 DB 툴을 사용하여 서버에 연결합니다.
3.  프로젝트 루트에 있는 `schema.sql` 파일을 열어 전체 쿼리를 실행하여 `QW` 데이터베이스와 필요한 모든 테이블(`Users`, `Companies`, `Products`, `Inspections`)을 생성합니다.
4.  데이터베이스에 연결할 사용자 계정을 생성하고, 해당 데이터베이스에 대한 `db_owner` 권한을 부여합니다.

#### 3단계: 백엔드 설정

1.  `backend` 폴더로 이동합니다.
    ```bash
    cd backend
    ```
2.  Python 가상환경을 생성하고 활성화합니다.
    ```bash
    # 가상환경 생성
    python -m venv venv

    # 가상환경 활성화 (Windows)
    .\venv\Scripts\activate
    ```
3.  필요한 Python 라이브러리를 설치합니다.
    ```bash
    pip install -r requirements.txt
    ```
4.  환경 변수 파일을 설정합니다.
    - `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.
    - 생성된 `.env` 파일을 열고 아래 내용을 채웁니다.

    ```env
    # 1. 데이터베이스 연결 문자열 (아래 예시 중 하나를 선택하여 수정)
    # 예시 1: SQL Server 인증 사용 시
    DATABASE_URI="Driver={ODBC Driver 17 for SQL Server};Server=your_server_address;Database=QW;UID=your_user_id;PWD=your_password;"

    # 예시 2: Windows 인증 사용 시
    # DATABASE_URI="Driver={ODBC Driver 17 for SQL Server};Server=your_server_address;Database=QW;Trusted_Connection=yes;"

    # 2. JWT 시크릿 키 (반드시 강력하고 무작위적인 문자열로 변경)
    # 아래 명령어로 Python에서 직접 생성할 수 있습니다.
    # python -c "import secrets; print(secrets.token_hex(32))"
    SECRET_KEY="your_super_secret_random_string_for_jwt"
    ```

#### 4단계: 프론트엔드 설정

1.  `frontend` 폴더로 이동합니다.
    ```bash
    cd ../frontend
    ```
2.  필요한 Node.js 패키지를 설치합니다.
    ```bash
    npm install
    ```

---

### 3. 개발 서버 실행

개발을 위해서는 백엔드와 프론트엔드 서버를 각각 실행해야 합니다.

-   **터미널 1: 백엔드 서버 실행**
    ```bash
    cd backend
    .\venv\Scripts\activate
    flask run
    # 또는 python app.py
    ```
    > 백엔드 서버는 `http://127.0.0.1:5000` 에서 실행됩니다.

-   **터미널 2: 프론트엔드 서버 실행**
    ```bash
    cd frontend
    npm run dev
    ```
    > 프론트엔드 개발 서버는 `http://localhost:5173` 와 같은 주소에서 실행됩니다. 이제 브라우저에서 이 주소로 접속하면 됩니다.

---

### 4. 프로덕션 빌드 및 배포

Windows Server와 Nginx를 사용한 실제 운영 환경 배포 절차입니다.

1.  **프론트엔드 빌드:** `frontend` 폴더에서 프로덕션용 정적 파일을 생성합니다.
    ```bash
    cd frontend
    npm run build
    ```
    > `frontend/dist` 폴더에 결과물이 생성됩니다.

2.  **백엔드 실행:** `backend` 폴더에서 `waitress` 프로덕션 서버를 사용해 앱을 실행합니다.
    ```bash
    cd backend
    .\venv\Scripts\activate
    waitress-serve --host 127.0.0.1 --port 5000 run:app
    ```

3.  **Nginx 설정:** Nginx의 `nginx.conf` 파일에 아래와 같이 리버스 프록시 설정을 추가합니다. (경로는 실제 환경에 맞게 수정)
    ```nginx
    server {
        listen 80;
        server_name your_server_ip_or_domain;

        # 프론트엔드 정적 파일 서빙
        location / {
            root   C:/path/to/your/project/QW/frontend/dist;
            index  index.html;
            try_files $uri $uri/ /index.html;
        }

        # 백엔드 API 프록시
        location /api/ {
            proxy_pass http://127.0.0.1:5000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    ```
4.  Nginx를 시작하거나 재시작합니다.
