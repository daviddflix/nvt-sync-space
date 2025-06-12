INSERT INTO channels (organization_id, name, description, is_private, created_by)
SELECT o.id, 'general', 'General discussion', false, u.id
FROM organizations o, users u
WHERE o.slug = 'platform-workspace' AND u.email = 'admin@platform.com'
ON CONFLICT (organization_id, name) DO NOTHING;

INSERT INTO channels (organization_id, name, description, is_private, created_by)
SELECT o.id, 'announcements', 'Announcements', false, u.id
FROM organizations o, users u
WHERE o.slug = 'platform-workspace' AND u.email = 'admin@platform.com'
ON CONFLICT (organization_id, name) DO NOTHING;
