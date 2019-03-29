// session store
module.exports = class Store {
  constructor() {
    this.sessions = new Map();
    this.__timer = new Map();
  }

  getID(length) {
    return randomBytes(length).toString('hex');
  }

  async get(sid) {
    if (!this.sessions.has(sid)) return undefined;
    return JSON.parse(this.sessions.get(sid));
  }

  async set(sid = this.getID(24), session, maxAge) {
    if (this.sessions.has(sid) && this.__timer.has(sid)) {
      const __timeout = this.__timer.get(sid);
      if (__timeout) clearTimeout(__timeout);
    }

    if (maxAge) {
      this.__timer.set(sid, setTimeout(() => this.destroy(sid), maxAge));
    }
    try {
      this.sessions.set(sid, JSON.stringify(session));
    } catch (err) {
      console.log('Set session error:', err);
    }

    return sid;
  }

  destroy(sid) {
    this.sessions.delete(sid);
    this.__timer.delete(sid);
  }
}