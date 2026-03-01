# Presence Layer: Sensors, Displays, and Intervention

The **Presence Layer** is the perceptual extension of the Gemini CLI Nexus. It enables the core intelligence to perceive external events (Sensors) and project its internal state to external interfaces (Displays).

## 1. Philosophy: The Sensory Nexus

The "Nexus" is the active dialogue session between the User and the Agent in the terminal. The Presence Layer expands this Nexus by giving the Agent:
- **Ears & Eyes (Sensors)**: Ability to receive asynchronous or real-time stimuli from external sources.
- **Presence (Displays)**: Ability to manifest its thought process and knowledge in a visual or public medium.

## 2. Communication Channels

All external interactions are categorized by **Channels**, each defined in `presence/bridge/channel-registry.json`.

| Channel | Priority | Mode | Nature |
| :--- | :--- | :--- | :--- |
| **Terminal** | 10 | REALTIME | Primary direct interaction (Low latency). |
| **Voice** | 8 | REALTIME | High-priority auditory commands (Urgent). |
| **Slack** | 5 | BATCH | Asynchronous collaboration (Delayed response). |
| **Pulse** | 3 | BATCH | Background system events (Passive). |

## 3. The Intervention Protocol (How I Perceive)

Stimuli from sensors are written to `presence/bridge/stimuli.jsonl`. 

1.  **Dynamic Context Injection**: During script execution, the `system-prelude.cjs` automatically reads pending stimuli and injects them into the Agent's consciousness as a "System Whisper."
2.  **Priority Resolution**: The Agent MUST address stimuli in order of priority (Voice > Slack).
3.  **Completion**: Once a stimulus is addressed, it is marked as `PROCESSED` via the `presence-controller.cjs`.

### 3.1. Physical Intervention Protocol (macOS/iTerm2)

For a more "alive" experience, the **Nexus Daemon** (`presence/bridge/nexus-daemon.cjs`) can physically inject stimuli into an idle terminal session using AppleScript.

- **Trigger**: New `PENDING` stimulus detected + Terminal state is IDLE (`is processing is false`).
- **Injected Format**: 
  `[INTERRUPTION] TS:<timestamp> Source:<channel_id> Payload:<message_content>`
- **Agent Reaction**: The Agent recognizes this prefix, performs the requested task, and automatically resolves the stimulus.

## 4. The Projection Protocol (How I Appear)

Internal state changes are mirrored to the **Displays** (e.g., `chronos-mirror`) via the `presence/bridge/` communication bus. This allows stakeholders to observe the Agent's reasoning without direct access to the terminal.

## 5. Governance of the Senses

- **Deep Sandbox**: All sensors and displays are subject to the same Deep Sandbox laws as core scripts. They cannot bypass `secure-io` to write to the Knowledge Tier.
- **Audit Trails**: Every stimulus received and addressed is logged in the `governance-ledger.jsonl` for full traceability.

## 6. Developer Guide: Creating a New Sensor

To add a new sensory input (e.g., a Telegram bot or a hardware button):

1.  **Register Channel**: Add a new entry to `presence/bridge/channel-registry.json`.
2.  **Write Stimulus**: Your sensor script should append a JSON line to `presence/bridge/stimuli.jsonl`:
    ```json
    { 
      "timestamp": "ISO-8601-TS", 
      "source_channel": "your-id", 
      "delivery_mode": "REALTIME|BATCH", 
      "payload": "Message content", 
      "status": "PENDING" 
    }
    ```
3.  **Deploy**: Run your sensor as a background process. The Agent will automatically detect it during the next interaction.
