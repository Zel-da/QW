from passlib.hash import pbkdf2_sha256
import getpass

# Prompt the user to enter a password without showing it on the screen
password_to_hash = getpass.getpass("Enter password to hash: ")

# Hash the provided password
hash_value = pbkdf2_sha256.hash(password_to_hash)

print("\n생성된 비밀번호 해시값:")
print(hash_value)
