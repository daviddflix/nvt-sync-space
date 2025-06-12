INSERT INTO issues (board_id, column_id, title, description, assigned_to, priority, position, created_by)
SELECT b.id, c.id, 'Invite your team', 'Add teammates to start collaborating', u.id, 'medium', 1, u.id
FROM boards b
JOIN columns c ON c.board_id = b.id AND c.name = 'Backlog'
JOIN users u ON u.email = 'admin@platform.com'
WHERE b.name = 'Getting Started'
ON CONFLICT (column_id, position) DO NOTHING;

INSERT INTO issues (board_id, column_id, title, description, assigned_to, priority, position, created_by)
SELECT b.id, c.id, 'Create your first task', 'Start tracking work items', u.id, 'medium', 2, u.id
FROM boards b
JOIN columns c ON c.board_id = b.id AND c.name = 'Backlog'
JOIN users u ON u.email = 'admin@platform.com'
WHERE b.name = 'Getting Started'
ON CONFLICT (column_id, position) DO NOTHING;
