from passlib.hash import pbkdf2_sha256

password_to_hash = 'soosan2025!'

hash_value = pbkdf2_sha256.hash(password_to_hash)

print("생성된 비밀번호 해시값:")
print(hash_value)