# Architecture

Lifely AI uses a modular monolith first: each domain owns its HTTP routes, service logic, persistence model, and DTOs. This keeps deployment simple while preserving extraction boundaries for later scaling.

## Core domains

`identity`, `care-plans`, `check-ins`, `medications`, `appointments`, `goals`, `documents`, `caregiving`, `notifications`, `assistant`, and `admin`.

## Scaling path

Start with one API and PostgreSQL. Cache read-heavy dashboard projections in Redis, move reminders and document processing to workers, and extract only a domain whose deployment or ownership needs diverge. Every worker consumes durable jobs; medical data remains in PostgreSQL/object storage, never in cache.

## Security baseline

Use short-lived access tokens, bcrypt-compatible password hashes, request validation, audit logs for caregiver/admin access, private object storage for documents, and explicit consent/assignment checks before exposing a member record.
