---
name: project-blueprint
description: Use when designing or updating the overall system blueprint: folder structure, full file list, route map, or deployment checklist for the BBC-style Zimbabwe news platform.
---

## Objective
Produce a complete, specific blueprint (no vague advice) matching the locked stack and product requirements.

## Rules
- Use route groups: (public) and (admin).
- Every route must map to an owner file and data source.
- Any assumption must be stated explicitly and then proceed.

## Deliverables format (strict when requested)
A) Folder tree (ascii)
B) File inventory table (Path | Type | Purpose)
C) SQL schema (single block)
D) RLS policies (single block)
E) RPC/functions (single block)
F) Route map (public/admin/api)
G) Deployment checklist

## Progressive disclosure
- Use references/route-map.md for canonical route list.
- Use references/folder-tree.md for the standard tree.
- Use references/file-inventory.md for baseline files.
Only load those files if user asks for the full blueprint or route map.
