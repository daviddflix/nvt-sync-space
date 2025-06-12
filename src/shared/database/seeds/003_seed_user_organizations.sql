INSERT INTO user_organizations (user_id, organization_id, role)
SELECT u.id, o.id, 'admin'
FROM users u, organizations o
WHERE u.email = 'admin@platform.com'
  AND o.slug = 'platform-workspace'
ON CONFLICT (user_id, organization_id) DO NOTHING;
