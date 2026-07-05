export interface RememberedUser {
  name: string;
  username: string;
  imageUrl: string;
}

export class RememberedUsersManager {
  private static STORAGE_KEY = 'remembered_users_list';

  public static getUsers(): RememberedUser[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  public static addUser(user: RememberedUser): void {
    if (!user.username) return;
    const users = this.getUsers();
    const exists = users.findIndex(u => u.username.toLowerCase() === user.username.toLowerCase());
    if (exists !== -1) {
      // Update existing details
      users[exists] = {
        name: user.name || users[exists].name,
        username: user.username,
        imageUrl: user.imageUrl || users[exists].imageUrl,
      };
    } else {
      users.push(user);
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  public static removeUser(username: string): void {
    const users = this.getUsers();
    const filtered = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  public static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
