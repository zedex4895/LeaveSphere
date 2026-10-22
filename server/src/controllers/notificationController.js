import { dataService } from "../services/dataService.js";

export async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const limit = req.query.limit ? Math.min(100, Math.max(1, Number(req.query.limit))) : 50;

    const notifications = await dataService.listNotifications({ userId, role, limit });
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      notifications,
      unreadCount
    });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    await dataService.markNotificationAsRead(id, req.user.id);
    res.json({ success: true, id });
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req, res, next) {
  try {
    await dataService.markAllNotificationsAsRead(req.user.id, req.user.role);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
