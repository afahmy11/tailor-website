# Atelier Abaya — common commands
.PHONY: help build up up-proxy down logs migrate seed psql shell reset push

help:
	@echo "make build      - build docker images"
	@echo "make up         - start app + db (and mailpit)"
	@echo "make up-proxy   - start with Caddy HTTPS proxy + mailpit"
	@echo "make down       - stop everything"
	@echo "make logs       - tail app logs"
	@echo "make migrate    - run prisma migrate deploy in the app container"
	@echo "make seed       - seed sample abaya styles/fabrics"
	@echo "make psql       - open a psql shell on the db"
	@echo "make shell      - open a shell in the app container"
	@echo "make reset      - DESTROY db volume and restart (DANGER)"

build:
	docker compose build

up:
	docker compose --profile mail up -d --build

up-proxy:
	docker compose --profile proxy up -d --build

down:
	docker compose down

logs:
	docker compose logs -f app

migrate:
	docker compose exec app npx prisma migrate deploy

seed:
	docker compose exec -e RUN_SEED=true app node prisma/seed.mjs

psql:
	docker compose exec db psql -U $${POSTGRES_USER:-abaya} -d $${POSTGRES_DB:-abaya}

shell:
	docker compose exec app sh

reset:
	docker compose down -v && docker compose --profile mail up -d --build

# Push current commit to origin/dev. Uses a gitignored token file if present
# (.deploy/gh_token), otherwise falls back to your configured git credentials.
push:
	@if [ -f .deploy/gh_token ]; then \
		git push "https://x-access-token:$$(cat .deploy/gh_token)@github.com/afahmy11/tailor-website.git" HEAD:dev; \
	else \
		git push origin HEAD:dev; \
	fi
