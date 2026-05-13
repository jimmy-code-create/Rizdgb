import { Router, type IRouter } from "express";
import { db } from "../lib/db.js";
import { groupMembersTable, groupMessagesTable, notificationsTable, reelsTable, reelLikesTable } from "../schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import postsRouter from "./posts.js";
import dmRouter from "./dm.js";
import groupsRouter from "./groups.js";
import storiesRouter from "./stories.js";
import notificationsRouter from "./notifications.js";
import badgesRouter from "./badges.js";
import serversRouter from "./servers.js";
import uploadRouter from "./upload.js";
import reelsRouter from "./reels.js";
import callsRouter from "./calls.js";
import discoverRouter from "./discover.js";
import eventsRouter from "./events.js";
import pushRouter from "./push.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(eventsRouter);
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/feed", postsRouter);
router.use("/posts", postsRouter);
router.use("/dm", dmRouter);
router.use("/groups", groupsRouter);
router.use("/stories", storiesRouter);
router.use("/notifications", notificationsRouter);
router.use("/badges", badgesRouter);
router.use("/servers", serversRouter);
router.use("/upload", uploadRouter);
router.use("/reels", reelsRouter);
router.use("/calls", callsRouter);
router.use("/push", pushRouter);
router.use("/admin", adminRouter);
router.use(discoverRouter);

router.post("/groups/:id/members", requireAuth, async (req, res) => {
  const groupId = Number(req.params["id"]);
  const { userId } = req.body as { userId: string };
  if (!userId) { res.status(400).json({ error: "userId required" }); return; }
  const existing = await db.query.groupMembersTable.findFirst({ where: and(eq(groupMembersTable.groupId, groupId), eq(groupMembersTable.userId, userId)) });
  if (!existing) await db.insert(groupMembersTable).values({ groupId, userId });
  res.json({ ok: true });
});

router.delete("/groups/:id/messages/:msgId", requireAuth, async (req, res) => {
  const msgId = Number(req.params["msgId"]);
  const userId = req.session!.userId!;
  const msg = await db.query.groupMessagesTable.findFirst({ where: eq(groupMessagesTable.id, msgId) });
  if (!msg) { res.status(404).json({ error: "Not found" }); return; }
  if (msg.senderId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(groupMessagesTable).where(eq(groupMessagesTable.id, msgId));
  res.json({ ok: true });
});

router.post("/notifications/:id/read", requireAuth, async (req, res) => {
  await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, Number(req.params["id"])));
  res.json({ ok: true });
});

router.delete("/notifications/:id", requireAuth, async (req, res) => {
  await db.delete(notificationsTable).where(eq(notificationsTable.id, Number(req.params["id"])));
  res.json({ ok: true });
});

router.delete("/reels/:reelId", requireAuth, async (req, res) => {
  const reelId = Number(req.params["reelId"]);
  const userId = req.session!.userId!;
  const reel = await db.query.reelsTable.findFirst({ where: eq(reelsTable.id, reelId) });
  if (!reel) { res.status(404).json({ error: "Not found" }); return; }
  if (reel.authorId !== userId) { res.status(403).json({ error: "Forbidden" }); return; }
  await db.delete(reelLikesTable).where(eq(reelLikesTable.reelId, reelId));
  await db.delete(reelsTable).where(eq(reelsTable.id, reelId));
  res.json({ ok: true });
});

router.post("/users/:userId/report", requireAuth, async (_req, res) => {
  res.json({ ok: true, message: "Report received" });
});

export default router;