.PHONY: install install-client install-server dev dev-client dev-server build build-client build-server clean lint test

# Default target
all: install

# Installation targets
install: install-client install-server

install-client:
	cd client && pnpm install

install-server:
	cd server && pnpm install

# Development targets
dev: dev-client dev-server

dev-client:
	cd client && pnpm dev

dev-server:
	cd server && pnpm dev

# Build targets
build: build-client build-server

build-client:
	cd client && pnpm build

build-server:
	cd server && pnpm build

# Clean targets
clean:
	cd client && pnpm clean || true
	cd server && pnpm clean || true
	rm -rf client/node_modules
	rm -rf server/node_modules
	rm -rf client/.next
	rm -rf client/dist
	rm -rf server/dist

# Lint targets
lint:
	cd client && pnpm lint
	cd server && pnpm lint

# Test targets
test:
	cd client && pnpm test
	cd server && pnpm test

# Help target
help:
	@echo "Available targets:"
	@echo "  install       - Install dependencies for both client and server"
	@echo "  dev          - Start development servers for both client and server"
	@echo "  build        - Build both client and server"
	@echo "  clean        - Clean up build artifacts and node_modules"
	@echo "  lint         - Run linting for both client and server"
	@echo "  test         - Run tests for both client and server"
	@echo "  help         - Show this help message"
