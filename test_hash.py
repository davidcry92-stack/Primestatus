#!/usr/bin/env python3
"""
Test password hashing directly
"""
import hashlib

password = "password123"
salt = "statusxsmoakland_salt_2024"
expected_hash = hashlib.sha256((password + salt).encode()).hexdigest()

print(f"Input password: {password}")
print(f"Salt: {salt}")
print(f"Expected hash: {expected_hash}")

# Check against database hash
db_hash = "2220df5dfeafd760565c4af8a05f2dd1b2c2c8afc96de9e8af89c85eea2b2c9b"
print(f"Database hash: {db_hash}")
print(f"Hashes match: {expected_hash == db_hash}")

# Test verification logic
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    salt = "statusxsmoakland_salt_2024"
    hashed_input = hashlib.sha256((plain_password + salt).encode()).hexdigest()
    return hashed_input == hashed_password

result = verify_password(password, db_hash)
print(f"Verification result: {result}")