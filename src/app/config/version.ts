export const appVersion = {
  major: 1,
  minor: 0,
  patch: 0,
  get full() {
    return `v${this.major}.${this.minor}.${this.patch}`;
  },
  get display() {
    return `Version ${this.full}`;
  },
};
