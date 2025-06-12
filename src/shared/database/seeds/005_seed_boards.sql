INSERT INTO boards (organization_id, name, description, created_by)
SELECT o.id, 'Getting Started', 'Sample board', u.id
FROM organizations o, users u
WHERE o.slug = 'platform-workspace' AND u.email = 'admin@platform.com'
ON CONFLICT (organization_id, name) DO NOTHING;

-- Backlog
INSERT INTO columns (board_id, name, position)
SELECT b.id, 'Backlog', 1
FROM boards b
WHERE b.name = 'Getting Started'
ON CONFLICT (board_id, name) DO NOTHING;

-- In Progress
INSERT INTO columns (board_id, name, position)
SELECT b.id, 'In Progress', 2
FROM boards b
WHERE b.name = 'Getting Started'
ON CONFLICT (board_id, name) DO NOTHING;

-- Done
INSERT INTO columns (board_id, name, position)
SELECT b.id, 'Done', 3
FROM boards b
WHERE b.name = 'Getting Started'
ON CONFLICT (board_id, name) DO NOTHING;
