.PHONY: install install-client  dev dev-client  build build-client  clean lint test

# Default target
all: install

# Installation targets
install: install-client

install-client:
	cd client && pnpm install

# Development targets
dev: dev-client

dev-client:
	cd client && pnpm dev


# Build targets
build: build-client

build-client:
	cd client && pnpm build


# Clean targets
clean:
	cd client && pnpm clean || true
	rm -rf client/node_modules
	rm -rf client/.next
	rm -rf client/dist


# Lint targets
lint:
	cd client && pnpm lint


# Test targets
test:
	cd client && pnpm test


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
