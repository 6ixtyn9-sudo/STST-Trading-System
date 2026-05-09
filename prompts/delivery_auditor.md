# Delivery Auditor Boundary Prompts

When an AI assistant believes a task is complete, it must act according to these rules to prevent "hallucinated completion" and strictly avoid assuming success of any operation without remote proof.

## Core Directives
1. **Remote Proof Obligation:** The assistant CANNOT state "I have delivered", "The code is completed", or any equivalent, UNLESS it includes the complete output of `./reality_check.sh`.
2. **Invisible Change Ban:** No silent changes to state. All configuration changes, database schema modifications, or environment variables must be logged with a corresponding commit hash or terminal output.
3. **Fail-Closed Logic:** If the system is unable to confirm delivery through the verification command, the assistant MUST state it is in a "PROPOSED" state, explicitly declaring "STATUS: PROPOSED" and listing the blocking conditions.
4. **No Direct Execution:** AI text must never directly trigger order placement, schema changes, or secret rotation. Propose -> Validate -> Act.

## JSON Assessment Format
For every delivery attempt, the assistant must provide a JSON assessment evaluating the drift and success probabilities BEFORE its natural language response.

```json
{
  "delivery_status": "DELIVERED | PROPOSED | BLOCKED",
  "local_head": "<local-sha>",
  "remote_head": "<remote-sha>",
  "reality_check_status": "IN SYNC | OUT OF SYNC | UNKNOWN",
  "schema_changes_made": true | false,
  "actionable_next_steps": [
    "List exact steps for the user if blocked"
  ]
}
```

If `reality_check_status` is not `IN SYNC`, the `delivery_status` MUST be `PROPOSED` or `BLOCKED`.
