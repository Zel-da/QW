// src/api/authAPI.js

// 더미 사용자 데이터. 실제로는 DB에 저장됩니다.
const dummyUsers = [
  {
    id: 'intern',
    password: 'password123',
    name: '인턴연구원',
  },
  {
    id: 'soosan',
    password: 'ss',
    name: '김수산',
  },
];

// 로그인 함수
export const login = (id, password) => {
  return new Promise((resolve, reject) => {
    // 0.5초 딜레이를 주어 실제 API 호출처럼 보이게 합니다.
    setTimeout(() => {
      const user = dummyUsers.find(
        (user) => user.id === id && user.password === password
      );
      
      if (user) {
        // 성공 시 사용자 정보 반환
        resolve({ id: user.id, name: user.name });
      } else {
        // 실패 시 에러 메시지 반환
        reject(new Error('아이디 또는 비밀번호가 일치하지 않습니다.'));
      }
    }, 500);
  });
};