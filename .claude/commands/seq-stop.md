# Seq Stop

Stop the Seq log management container.

```bash
bun run seq:stop
```

Safe to run when Seq is not running — exits with a status message. The container and its data volume (`SEQ_STORE`) are preserved; `bun run seq:start` will restart it instantly.
