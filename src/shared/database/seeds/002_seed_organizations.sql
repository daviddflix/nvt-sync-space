INSERT INTO organizations (name, slug, description)
VALUES ('Platform Workspace', 'platform-workspace', 'Default organization')
ON CONFLICT (slug) DO NOTHING;
