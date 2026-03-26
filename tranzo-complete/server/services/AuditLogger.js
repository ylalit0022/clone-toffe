// server/services/AuditLogger.js
// Centralized audit logging for compliance + debugging

class AuditLogger {
  constructor(db) {
    this.db = db;
  }

  // ✅ Log an event
  async log(action, details = {}, ip = "unknown") {
    try {
      await this.db.collection("audit_log").insertOne({
        timestamp: new Date(),
        action,
        details,
        ip,
      });
    } catch (err) {
      console.error("[Audit] Logging failed:", err.message);
    }
  }

  // ✅ Query audit logs
  async getLog(filters = {}, limit = 100) {
    const query = {};
    if (filters.action) query.action = filters.action;
    if (filters.ip) query.ip = filters.ip;
    if (filters.since) query.timestamp = { $gte: new Date(filters.since) };

    return this.db
      .collection("audit_log")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }
}

module.exports = AuditLogger;
