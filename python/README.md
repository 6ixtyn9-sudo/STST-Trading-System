# Python Migration Staging Area

This folder is reserved for future migration of selected workloads out of Apps Script.

## Current Status
Planned, not active as primary runtime.

## Likely Migration Order

1. **M2-heavy ingestion/bootstrap logic**
   - external data ingestion
   - canonical history maintenance
   - bootstrap workflows

2. **M9-heavy research logic**
   - walk-forward backtests
   - OOS evaluation
   - larger-scale experiment processing

3. **M6 live execution services**
   - durable execution state
   - real-time order management
   - stronger persistence and observability

4. **M10 orchestration services**
   - if council/memory logic benefits from service separation

## What should remain easy to preserve
- M1 constitutional logic
- M8 governance rules
- Sheets dashboard/control surfaces where still useful

## Important Rule
Migration should be phased, not panic-driven.

The purpose of Python is not novelty.
It is to take over the workloads that Apps Script is structurally bad at:
- heavy compute
- larger-scale persistence
- service reliability
- live execution infrastructure
