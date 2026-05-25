# Run this SQL in Supabase SQL Editor

```sql
alter table profiles add column if not exists email_prefs jsonb default '{"friend_requests": true, "friend_accepted": true, "weekly_digest": false, "new_season": false, "episode_reminders": false}';
```
