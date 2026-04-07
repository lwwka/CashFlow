# CashFlow Case Study

## Project Overview

CashFlow is a deployed full-stack personal finance product built to help users move beyond simple transaction logging and make clearer monthly money decisions. The goal was to create a system that could show cash flow, savings targets, budget pressure, reporting, and longer-term financial progress in one place.

This project started as a technical MVP for income and expense tracking, but gradually evolved into a more product-oriented application with simpler navigation, clearer user flows, and more focus on the most important everyday actions.

## Problem

Many personal finance tools are good at recording raw data but weaker at helping users answer practical questions such as:

- How much did I really save this month?
- Which categories are over budget?
- Am I still on track for my monthly target?
- How close am I to my longer-term savings goal?
- How can I bring data in and out without getting stuck in manual entry?

The challenge was not only building the engineering system, but also making the product easier to understand as more functionality was added.

## Solution

CashFlow was designed as a full-stack application with three primary product jobs:

- see the high-level picture
- record money movement
- stay on target

The final product structure centered around:

- `Dashboard`
  high-level overview for current cash flow
- `Transactions`
  daily entry, quick income logging, batch import, export, and transaction history
- `Goals`
  monthly savings targets, longer-term goal progress, and financial direction

Secondary tools such as categories and budgets were kept available, but pushed into a lower-priority position so the product would feel less like an engineering dashboard and more like an everyday tool.

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: NestJS
- ORM / Data layer: Prisma
- Database: PostgreSQL
- Deployment: Vercel and Railway
- Quality: GitHub Actions CI and e2e testing

## My Role

I designed and built the project end to end, including:

- frontend page structure and interaction flows
- backend modules and API design
- authentication and protected routes
- Prisma schema and database evolution
- import and export workflows
- deployment and environment setup
- CI integration
- UX simplification and information architecture refinement

## Engineering Highlights

- Built authenticated CRUD flows for transactions, categories, budgets, monthly goals, and long-term financial goals
- Added CSV import/export and Excel-friendly workflows for batch entry and reporting
- Implemented duplicate protection and invalid row handling in transaction imports
- Set up deployable infrastructure on Vercel and Railway
- Added GitHub Actions CI with frontend build and backend e2e validation
- Hardened production config for JWT, CORS, and Swagger exposure
- Managed schema changes across local development and deployed environments

## Product Lessons

The most important lesson from CashFlow was not simply how to ship more features, but how to simplify them.

At first, the system leaned heavily toward engineering completeness: more pages, more controls, more visible power-user capability. Over time, it became clear that users could easily feel overloaded. The product improved most when functionality was reorganized around clearer everyday tasks instead of exposing every capability equally.

This project taught me to think about:

- when to add features
- when to hide or downgrade features
- how to reduce cognitive load
- how to keep engineering flexibility without overwhelming users

It also taught me how to move from a developer mindset of “can I build this?” toward a product mindset of “will this be easy to use?”

## Outcome

CashFlow became a working beta product and a strong end-to-end product engineering project. It demonstrates:

- full-stack delivery
- system ownership
- deployment and debugging across environments
- CI and testing discipline
- iterative product simplification

For me, the project was especially valuable because it combined technical execution with real product judgement. It was not just an app that worked, but a project that taught how to evolve a system into something more usable and more intentional.
