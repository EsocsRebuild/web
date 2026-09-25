# Local secrets

Files here are ignored by Git and by the Docker build context.

- `server_actions_key`: shared Server Functions encryption key.
  Create it with `openssl rand -base64 32 > deploy/secrets/server_actions_key`.
