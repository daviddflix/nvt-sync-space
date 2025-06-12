INSERT INTO notifications (user_id, type, title, message)
SELECT u.id, 'welcome', 'Welcome to Platform', 'Your workspace is ready!'
FROM users u
WHERE u.email = 'admin@platform.com'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n
    WHERE n.user_id = u.id AND n.type = 'welcome'
  );
