export const offlineStorage = {
  saveDraft(key: string, data: any): void {
    try {
      const payload = {
        data,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(`ss_draft_${key}`, JSON.stringify(payload));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  },

  loadDraft(key: string): any | null {
    try {
      const item = localStorage.getItem(`ss_draft_${key}`);
      if (!item) return null;
      const parsed = JSON.parse(item);
      return parsed.data;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  },

  removeDraft(key: string): void {
    try {
      localStorage.removeItem(`ss_draft_${key}`);
    } catch (error) {
      console.error('Failed to remove draft:', error);
    }
  },

  hasDraft(key: string): boolean {
    return localStorage.getItem(`ss_draft_${key}`) !== null;
  },

  listDrafts(): { key: string; savedAt: string }[] {
    const drafts: { key: string; savedAt: string }[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('ss_draft_')) {
          const item = localStorage.getItem(key);
          if (item) {
            const parsed = JSON.parse(item);
            drafts.push({
              key: key.replace('ss_draft_', ''),
              savedAt: parsed.timestamp
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to list drafts:', error);
    }
    return drafts.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
  }
};
