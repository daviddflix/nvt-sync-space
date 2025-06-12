INSERT INTO users (email, password_hash, first_name, last_name)
VALUES (
  'admin@platform.com',
  'admin123',
  'Admin',
  'User'
)
ON CONFLICT (email) DO NOTHING;
