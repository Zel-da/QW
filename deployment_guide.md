# 불량 관리 시스템 서버 배포 가이드

이 문서는 개발된 불량 관리 시스템을 새로운 서버 컴퓨터(Windows Server 기준)에 배포하고 실행하는 방법을 안내합니다.

---

### 1. 사전 요구사항

서버에 다음 소프트웨어가 설치되어 있어야 합니다.

- **Git**: 소스 코드를 서버로 복제하기 위해 필요합니다.
- **Python 3.8 이상**: 백엔드 애플리케이션 실행을 위해 필요합니다.
- **Node.js 18 이상 및 npm**: 프론트엔드 애플리케이션을 빌드하기 위해 필요합니다.
- **MSSQL Server**: 데이터베이스 서버입니다.
- **ODBC Driver for SQL Server**: Python 백엔드가 MSSQL과 통신하기 위해 필요합니다. (보통 SQL Server 설치 시 함께 설치 가능)

---

### 2. 소스 코드 배포

1.  **Git 저장소에 코드 푸시(Push)**:
    - 로컬 컴퓨터에서 이 프로젝트 폴더 전체를 GitHub, GitLab 등 원격 Git 저장소에 푸시합니다.
    ```bash
git add .
git commit -m "Initial commit for deployment"
git push origin main
```

2.  **서버에서 코드 클론(Clone)**:
    - 서버 컴퓨터에서 원하는 위치에 Git 저장소를 복제합니다.
    ```bash
git clone <your-repository-url>
cd QW # 프로젝트 폴더로 이동
```

---

### 3. 데이터베이스 설정

1.  **테이블 생성**:
    - SQL Server Management Studio (SSMS) 또는 `sqlcmd`를 사용하여 서버의 MSSQL 데이터베이스에 연결합니다.
    - `schema.sql` 파일의 내용을 실행하여 `Users`, `Companies`, `Products`, `Inspections` 테이블을 생성합니다.

2.  **최초 관리자 계정 생성**:
    - 시스템에 로그인하려면 최소 한 개의 사용자 계정이 필요합니다. 아래 SQL 쿼리를 실행하여 첫 사용자를 추가합니다.
    - **중요**: 아래 쿼리의 `your_secure_password_hash` 부분은 실제 해시값으로 교체해야 합니다.

    ```sql
    -- 'admin' 사용자를 추가하는 예시입니다.
    INSERT INTO Users (username, password_hash) VALUES ('admin', 'soosan2025!');
    ```

3.  **비밀번호 해시 생성 방법**:
    - 서버의 Python 환경에서 아래 스크립트를 실행하여 안전한 비밀번호 해시를 생성할 수 있습니다. `backend` 폴더로 이동 후 `pip install passlib`을 먼저 실행하세요.

    ```python
    # 이 코드를 hash_password.py 와 같은 파일로 저장하고 실행하세요.
    from passlib.hash import pbkdf2_sha256
    password = '원하는_비밀번호' # 여기에 실제 사용할 비밀번호를 입력
    hash_value = pbkdf2_sha256.hash(password)
    print(f"사용자: admin\n비밀번호: {password}\n해시값: {hash_value}")
    # 출력된 해시값을 위 INSERT 쿼리에 사용하세요.
    ```

---

### 4. 백엔드 서버 실행 (Production)

1.  **가상 환경 설정 및 라이브러리 설치**:
    - `backend` 디렉터리로 이동합니다.
    ```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

2.  **환경 변수 설정**:
    - `.env.example` 파일을 `.env` 파일로 복사합니다.
    - `.env` 파일을 열어 `DATABASE_URI`와 `SECRET_KEY` 값을 실제 서버 환경에 맞게 수정합니다. `SECRET_KEY`는 아무도 예측할 수 없는 긴 문자열로 만드세요.

3.  **프로덕션 서버 실행**:
    - 개발용 서버(`flask run`) 대신, 프로덕션용 WSGI 서버인 `waitress`를 사용합니다.
    - 아래 명령어로 백엔드 서버를 실행합니다. `0.0.0.0`은 모든 네트워크 인터페이스에서 오는 요청을 허용하겠다는 의미입니다.
    ```bash
waitress-serve --host 0.0.0.0 --port 5000 app:app
```
    - 이 터미널은 서버가 실행되는 동안 계속 열어두어야 합니다. (또는 Windows 서비스로 등록하여 백그라운드 실행)

---

### 5. 프론트엔드 빌드 및 서빙

1.  **라이브러리 설치 및 빌드**:
    - 새 터미널을 열고 `frontend` 디렉터리로 이동합니다.
    ```bash
cd frontend
npm install
npm run build
```
    - 이 명령을 실행하면 `frontend/dist` 디렉터리에 최적화된 정적 파일(HTML, CSS, JS)이 생성됩니다.

2.  **웹 서버(Nginx) 설정**:
    - 프로덕션 환경에서는 빌드된 정적 파일을 Nginx, Apache 같은 안정적인 웹 서버로 제공하는 것이 가장 좋습니다.
    - Nginx를 서버에 설치하고 아래 예시처럼 설정 파일을 수정합니다. 이 설정은 일반적인 웹 요청은 프론트엔드 빌드 파일을 보여주고, `/api`로 시작하는 요청은 백엔드 API 서버(localhost:5000)로 전달(프록시)해줍니다.

    **Nginx 설정 예시 (`nginx.conf`의 `http` 블록 내 `server` 블록):**
    ```nginx
server {
    listen 80 # 80번 포트에서 요청을 받음
    server_name your_server_ip_or_domain; # 서버의 IP 주소 또는 도메인

    # 프론트엔드 정적 파일 경로 설정
    location / {
        root   "C:/path/to/your/project/QW/frontend/dist"; # 실제 프로젝트 경로로 수정
        try_files $uri $uri/ /index.html;
    }

    # API 요청을 백엔드 서버로 프록시
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

3.  **Nginx 실행**:
    - Nginx를 시작/재시작하여 설정을 적용합니다.

---

### 최종 상태

모든 설정이 완료되면, 사용자는 웹 브라우저에서 서버의 IP 주소나 도메인으로 접속합니다. Nginx가 80번 포트에서 요청을 받아 프론트엔드 앱을 보여주고, 앱에서 발생하는 모든 API 요청은 Nginx를 통해 안전하게 백엔드 서버로 전달됩니다.
