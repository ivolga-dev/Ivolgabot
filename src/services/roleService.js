import { db } from './db.js';

const defaultRoles = [
  { key: 'user', name: 'User', permissions: ['play', 'balance.read'] },
  {
    key: 'admin',
    name: 'Admin',
    permissions: ['play', 'balance.read', 'moderation.ban', 'moderation.mute', 'roles.assign', 'settings.update']
  },
  {
    key: 'superadmin',
    name: 'Super Admin',
    permissions: ['*']
  }
];

export const roleService = {
  ensureDefaultRoles(groupId) {
    for (const role of defaultRoles) {
      db.prepare(
        'INSERT INTO group_roles (group_id, key, name, permissions_json) VALUES (?, ?, ?, ?) ON CONFLICT(group_id, key) DO NOTHING'
      ).run(groupId, role.key, role.name, JSON.stringify(role.permissions));
    }
  },

  getPermissions(groupId, userId) {
    const rows = db
      .prepare(
        `SELECT r.permissions_json
         FROM group_user_roles gur
         JOIN group_roles r ON r.id = gur.role_id
         WHERE gur.group_id = ? AND gur.user_id = ?`
      )
      .all(groupId, userId);

    const permissions = new Set();
    for (const row of rows) {
      const arr = JSON.parse(row.permissions_json);
      arr.forEach((value) => permissions.add(value));
    }
    return permissions;
  },

  hasPermission(groupId, userId, permission) {
    const perms = this.getPermissions(groupId, userId);
    return perms.has('*') || perms.has(permission);
  }
};
