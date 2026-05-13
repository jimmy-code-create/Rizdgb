// Voice & channel route aliases — frontend calls these paths
// but the main handlers live under /api/servers/...
import { voicePresenceTable, channelMessagesTable } from "../schema.js";

router.post("/channels/:channelId/voice/join", requireAuth, async (req, res) => {
  const channelId = Number(req.params["channelId"]);
  const userId = req.session!.userId!;
  const existing = await db.query.voicePresenceTable.findFirst({ where: and(eq(voicePresenceTable.channelId, channelId), eq(voicePresenceTable.userId, userId)) });
  if (!existing) await db.insert(voicePresenceTable).values({ channelId, userId });
  res.json({ ok: true });
});

router.post("/channels/:channelId/voice/leave", requireAuth, async (req, res) => {
  const channelId = Number(req.params["channelId"]);
  await db.delete(voicePresenceTable).where(and(eq(voicePresenceTable.channelId, channelId), eq(voicePresenceTable.userId, req.session!.userId!)));
  res.json({ ok: true });
});

router.get("/channels/:channelId/voice", requireAuth, async (req, res) => {
  const channelId = Number(req.params["channelId"]);
  const presence = await db.query.voicePresenceTable.findMany({ where: eq(voicePresenceTable.channelId, channelId) });
  const users = await Promise.all(presence.map(async p => {
    const u = await db.query.usersTable.findFirst({ where: eq(usersTable.id, p.userId) });
    return u ? { id: u.id, username: u.username, displayName: u.displayName, avatarUrl: u.avatarUrl } : null;
  }));
  res.json(users.filter(Boolean));
});

router.post("/voice/heartbeat", requireAuth, async (_req, res) => {
  res.json({ ok: true });
});

router.delete("/messages/:msgId", requireAuth, async (req, res) => {
  const msgId = Number(req.params["msgId"]);
  const msg = await db.query.channelMessagesTable.findFirst({ where: eq(channelMessagesTable.id, msgId) });
  if (!msg) { res.status(404).json({ error: "Not found" }); return; }
  if (msg.senderId !== req.session!.userId!) { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(channelMessagesTable).where(eq(channelMessagesTable.id, msgId));
  res.json({ ok: true });
});