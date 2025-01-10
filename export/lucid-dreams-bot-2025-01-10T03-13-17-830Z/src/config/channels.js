export const channels = {
  announcements: '@LucidDreamAnnouncements',
  rules: '@LucidDreamRules',
  project_info: '@LucidDreamProjectInfo',
  bug_reports: '@LucidDreamBugReports',
  general_chat: '@LucidDreamGeneral',
  support_tickets: process.env.SUPPORT_CHANNEL_ID ? parseInt(process.env.SUPPORT_CHANNEL_ID) : -1002431462200,
  bug_reports_channel: process.env.BUG_REPORTS_CHANNEL_ID ? parseInt(process.env.BUG_REPORTS_CHANNEL_ID) : -1002281076350
};