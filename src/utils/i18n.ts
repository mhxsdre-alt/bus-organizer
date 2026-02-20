export type Lang = 'en' | 'he';

const LANG_KEY = 'bus-lang';

let currentLang: Lang = (localStorage.getItem(LANG_KEY) as Lang) || 'en';
const listeners: (() => void)[] = [];

export function getLang(): Lang {
    return currentLang;
}

export function setLang(lang: Lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    listeners.forEach(cb => cb());
}

export function onLangChange(cb: () => void) {
    listeners.push(cb);
}

export function t(key: string): string {
    const dict = translations[currentLang];
    return (dict as any)[key] ?? key;
}

// Initialize direction
document.documentElement.setAttribute('dir', currentLang === 'he' ? 'rtl' : 'ltr');
document.documentElement.setAttribute('lang', currentLang);

const translations: Record<Lang, Record<string, string>> = {
    en: {
        // Header
        'app.title': 'Bus Organizer',
        'app.subtitle': 'Manage your fleet with style',

        // Tabs
        'tab.dashboard': '🚌 Dashboard',
        'tab.analytics': '📊 Analytics',
        'tab.manual': '📖 Manual',

        // Controls
        'btn.addBus': '+ Add New Bus',
        'btn.pdfReport': '📄 PDF Report',
        'btn.saveLog': '📋 Save Day Log',
        'btn.markAll': '✓ Mark All',
        'btn.clearAll': '✕ Clear All',
        'btn.undo': '↩ Undo',
        'btn.exportJson': '📤 Export JSON',
        'btn.importJson': '📥 Import JSON',
        'btn.backup': '💾 Full Backup',
        'btn.restore': '📂 Restore Backup',
        'search.placeholder': '🔍 Search buses...',

        // Table
        'col.line': 'Line',
        'col.plate': 'Plate',
        'col.platform': 'Platform',
        'col.destination': 'Destination',
        'col.notes': 'Notes',
        'col.arrived': 'Arrived',
        'col.actions': 'Actions',
        'table.empty': 'No buses added yet. Click <strong>+ Add New Bus</strong> above to start.',
        'notes.placeholder': 'Add note...',

        // Map
        'map.title': '🗺️ Parking Lot Map',
        'map.hint': 'Drag buses to reorder or move between platforms',

        // Templates
        'tpl.title': '📋 Templates',
        'tpl.save': '💾 Save Current as Template',
        'tpl.namePlace': 'Template name (e.g. Morning Route)',
        'tpl.anyDay': 'Any day',
        'tpl.save.btn': 'Save',
        'tpl.cancel': 'Cancel',
        'tpl.empty': 'No saved templates yet.',
        'tpl.load': '▶ Load',
        'tpl.bus': 'bus',
        'tpl.buses': 'buses',

        // QR
        'qr.title': '📱 QR Check-In',
        'qr.hint': 'Print QR codes for drivers — scanning marks the bus as arrived.',
        'qr.empty': 'Add buses with line numbers to generate QR codes.',
        'qr.print': '🖨️ Print QR Sheet',
        'qr.arrived': '✓ Arrived',

        // History
        'hist.title': '📅 Daily Log History',
        'hist.empty': 'No logs saved yet. Click "Save Day Log" to record today\'s data.',
        'hist.arrived': 'arrived',

        // Dashboard
        'dash.title': '📊 Statistics',
        'dash.empty': 'Save some daily logs to see statistics here.',
        'dash.arrivalRate': 'Arrival Rate',
        'dash.busiestPlatform': 'Busiest Platform',
        'dash.daysLogged': 'Days Logged',
        'dash.last30': 'Last 30 saved',
        'dash.busesTotal': 'buses total',
        'dash.noData': 'No data',
        'dash.across': 'across',
        'dash.days': 'days',
        'dash.trendTitle': 'Arrival Trend (Last 7 Logs)',
        'dash.total': 'Total',
        'dash.arrivedLabel': 'Arrived',
        'dash.heatmap': 'Platform Heatmap',
        'dash.topLines': 'Top Lines (by frequency)',
        'dash.mostLate': 'Most Frequently Late',

        // Confirm
        'confirm.markAll': 'Mark all buses as arrived?',
        'confirm.clearAll': 'Clear all arrival statuses?',
        'confirm.restore': 'This will replace ALL current data. Continue?',
        'confirm.yes': 'Yes, Continue',
        'confirm.cancel': 'Cancel',

        // Toast
        'toast.logSaved': '✓ Day log saved!',
        'toast.backupDone': '✓ Full backup downloaded!',
        'toast.restored': '✓ Backup restored! Reloading...',
        'toast.badFile': '⚠ Invalid backup file',
        'toast.installed': '✓ App installed!',
        'toast.checkedIn': 'checked in!',
        'toast.busNotFound': '⚠ Bus not found — it may have been removed.',

        // Install banner
        'install.title': 'Install Bus Organizer',
        'install.desc': 'Add to your home screen for quick access & offline use',
        'install.btn': 'Install',
        'install.iosTitle': 'Install this app',
        'install.iosDesc': 'Tap <strong>Share ↑</strong> then <strong>"Add to Home Screen"</strong>',

        // Days
        'day.allDays': 'All Days',
        'day.sunday': 'Sunday',
        'day.monday': 'Monday',
        'day.tuesday': 'Tuesday',
        'day.wednesday': 'Wednesday',
        'day.thursday': 'Thursday',
        'day.friday': 'Friday',
        'day.saturday': 'Saturday',

        // Manual
        'manual.title': '📖 User Manual',
        'manual.installTitle': '📲 Install as App',
        'manual.installIntro': 'Bus Organizer can be installed as a standalone app on any device. It works offline and launches like a native app — no app store needed! Once installed, you can use it without internet. All your data is saved locally on your device.',
        'manual.android': 'Android',
        'manual.ios': 'iPhone / iPad',
        'manual.pc': 'PC / Mac (Chrome / Edge)',
        'manual.androidSteps': '<li>Open the app URL in <strong>Chrome</strong></li><li>Tap the <strong>⋮ menu</strong> (three dots, top-right corner)</li><li>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></li><li>Tap <strong>"Install"</strong> in the confirmation popup</li><li>Done! The app icon now appears on your home screen just like a regular app.</li>',
        'manual.iosSteps': '<li>Open the app URL in <strong>Safari</strong> (this will not work in Chrome on iOS — you must use Safari)</li><li>Tap the <strong>Share button</strong> (the square with an upward arrow ↑ at the bottom of the screen)</li><li>Scroll down the share menu and tap <strong>"Add to Home Screen"</strong></li><li>Tap <strong>"Add"</strong> in the top-right corner</li><li>Done! The app icon now appears on your home screen.</li>',
        'manual.pcSteps': '<li>Open the app URL in <strong>Chrome</strong> or <strong>Microsoft Edge</strong></li><li>Look for the <strong>install icon ⊕</strong> in the address bar (right side). In Edge, it may say "App available".</li><li>Click <strong>"Install"</strong></li><li>Done! The app now opens in its own window and appears in your Start Menu (Windows) or Applications folder (Mac).</li>',
        'manual.installTip': '<strong>💡 Tip:</strong> After installation, the app works completely <strong>offline</strong>. All data is stored on your device — no account, no login, no registration needed. Your data never leaves your device.',
        'manual.gettingStarted': '🚀 Getting Started — Your First Day',
        'manual.gettingStartedList': '<li><strong>Step 1:</strong> Click the <strong>+ Add New Bus</strong> button at the top to create your first bus entry. A new row will appear in the table.</li><li><strong>Step 2:</strong> Fill in the details: <strong>Line Number</strong> (e.g. 42), <strong>Plate Number</strong> (e.g. 12-345-67), <strong>Platform</strong> (a number 1-9 indicating which parking platform the bus is assigned to), and <strong>Destination</strong> (e.g. "Tel Aviv").</li><li><strong>Step 3:</strong> Use the <strong>Notes</strong> column for any special instructions, like "driver change at 14:00" or "VIP group".</li><li><strong>Step 4:</strong> Repeat for all your buses. You can add as many as you need.</li><li><strong>Step 5:</strong> Your data <strong>auto-saves instantly</strong> — you can close the browser, shut down your computer, and come back anytime. Everything will still be there.</li><li><strong>Step 6:</strong> At the end of the day, click <strong>📋 Save Day Log</strong> to record today\'s data in your history for analytics and tracking.</li>',
        'manual.arrival': '✅ Arrival Tracking',
        'manual.arrivalList': '<li><strong>Toggle switch</strong> — Each bus has an on/off switch in the "Arrived" column. Flip it to green when a bus arrives at the station. The row will highlight to show it\'s checked in.</li><li><strong>✓ Mark All</strong> — Marks every bus as arrived in one click. A confirmation dialog will appear first to prevent accidental clicks.</li><li><strong>✕ Clear All</strong> — Resets all buses back to "not arrived". Useful at the start of a new day. Also requires confirmation.</li><li><strong>📱 QR Check-In</strong> — Scroll down to the QR Check-In section. Each bus gets a unique QR code you can print. When a driver scans their QR code with any phone camera, the bus is automatically marked as arrived — no need for manual toggling.</li>',
        'manual.map': '🗺️ Parking Map',
        'manual.mapList': '<li>The parking map shows a <strong>visual grid of 9 platforms</strong> (P1 through P9). Each platform represents a physical parking spot at your station.</li><li>Buses appear as <strong>color-coded cards</strong> in their assigned platform. The color is based on the line number so you can quickly identify which bus is where.</li><li><strong>Drag & drop</strong> — Click and hold a bus card (or touch and hold on mobile), then drag it to a different platform to reassign it. The change saves automatically.</li><li>Platform headers show <strong>color warnings</strong>: they turn <span style="color:#eab308">yellow</span> when a platform has 4+ buses (getting crowded) and <span style="color:#ef4444">red</span> at 6+ buses (overloaded). This helps you balance the load across platforms.</li><li>A bus showing <strong>"?"</strong> means it has no line number assigned yet.</li>',
        'manual.templates': '📋 Templates — Save & Reuse Daily Schedules',
        'manual.templatesList': '<li><strong>What are templates?</strong> Templates save your current bus list so you can reload it on another day. For example, if Monday always has the same 15 buses, save them as a "Monday Morning" template and load it every Monday instead of typing everything again.</li><li><strong>💾 Save Current as Template</strong> — Click this button, give your template a name (e.g. "Sunday Route" or "Morning Shift"), optionally select a day of the week, and click Save. All current buses are saved.</li><li><strong>▶ Load</strong> — Click Load next to any template to fill the table with those buses. Arrival statuses will be reset to "not arrived" since it\'s a new day.</li><li><strong>✕ Delete</strong> — Remove templates you no longer need. This only deletes the template, not your current bus data.</li><li>Templates are organized by day of the week for easy browsing.</li>',
        'manual.reports': '📊 Reports & Data Management',
        'manual.reportsList': '<li><strong>📄 PDF Report</strong> — Generates a printable PDF with your bus table and parking map, including color-coded arrival statuses. Great for printing and posting at the station or sending to supervisors.</li><li><strong>📤 Export JSON</strong> — Downloads your current bus list as a JSON file. You can use this to transfer data to another device or keep a local backup.</li><li><strong>📥 Import JSON</strong> — Load a previously exported JSON file to restore bus data. Useful when switching devices.</li><li><strong>💾 Full Backup</strong> — Downloads a complete backup of ALL your data: buses, templates, daily logs, settings, and language preference. Use this regularly to protect your data.</li><li><strong>📂 Restore Backup</strong> — Upload a full backup file to restore everything. <strong>Warning:</strong> this replaces all current data, so make sure you want to overwrite.</li>',
        'manual.analytics': '📈 Analytics (📊 Analytics Tab)',
        'manual.analyticsList': '<li><strong>How to start:</strong> First, save at least one day log by clicking <strong>📋 Save Day Log</strong> on the Dashboard. Each log captures a snapshot of your buses and their arrival status for that day.</li><li><strong>📅 Daily Log History</strong> — Shows all your saved logs with the date, number of buses, and arrival percentage. You can delete old logs you no longer need.</li><li><strong>Arrival Trend</strong> — A bar chart showing the total buses (grey) vs. arrived buses (colored) for the last 7 logs. Lets you spot patterns over time.</li><li><strong>Platform Heatmap</strong> — A color grid showing which platforms are used most. Darker colors = more buses assigned there. Helps identify if some platforms are consistently overloaded.</li><li><strong>Top Lines</strong> — Shows which bus lines appear most frequently across all your logs.</li><li><strong>Most Frequently Late</strong> — Shows which lines have the lowest arrival rates. These are the lines that most often fail to arrive and may need attention.</li>',
        'manual.quickRef': '⚡ Quick Reference',
        'manual.quickRefList': '<li><strong>🔍 Search bar</strong> — Type anything to instantly filter buses. Works with line numbers, plate numbers, destinations, or notes. Only matching buses will show.</li><li><strong>↩ Undo</strong> — Accidentally deleted a bus? Click Undo immediately to restore it. This only works for the most recent deletion.</li><li><strong>☀️/🌙 Theme toggle</strong> — Switch between dark mode and light mode. Your preference is saved automatically.</li><li><strong>עב / EN Language toggle</strong> — Switch the entire app between English and Hebrew. The app fully supports right-to-left (RTL) layout for Hebrew.</li><li><strong>▾ Section headers</strong> — Click any section title (like "Parking Lot Map" or "Templates") to collapse or expand that section. Useful for focusing on what you need.</li><li><strong>Column sorting</strong> — Click any column header in the bus table (Line, Plate, Platform, Destination, Arrived) to sort by that column. Click again to reverse the sort order.</li>',

        // Smart Analytics
        'smart.title': 'Smart Insights',
        'smart.forecast': 'Forecast',
        'smart.predictedRate': 'predicted arrival rate',
        'smart.trendLabel.improving': 'improving',
        'smart.trendLabel.declining': 'declining',
        'smart.trendLabel.stable': 'stable',
        'smart.suggestion': 'suggestion',
        'smart.suggestApply': 'Apply suggestion',
        'smart.suggestHint': 'Based on {n} previous entries',

        // Anomaly messages
        'anomaly.missingPlatform': '{n} bus(es) have no platform assigned.',
        'anomaly.missingDest': '{n} bus(es) have no destination.',
        'anomaly.platformOverload': 'Platform {p} is overloaded with {n} buses!',
        'anomaly.platformBusy': 'Platform {p} is getting busy ({n} buses).',
        'anomaly.lowArrival': 'Current arrival rate ({current}%) is below your average ({avg}%).',
        'anomaly.highVolume': 'Unusually high bus count today ({current} vs avg {avg}).',
        'anomaly.lowVolume': 'Fewer buses than usual today ({current} vs avg {avg}).',

        // Natural Language Report
        'nlr.noData': 'Save daily logs to see smart insights here.',
        'nlr.overall': 'Across {days} days, you\'ve tracked {buses} buses with an overall {rate}% arrival rate.',
        'nlr.weekBetter': 'This week is {pct}% better than last week.',
        'nlr.weekWorse': 'This week is {pct}% below last week\'s performance.',
        'nlr.weekSame': 'Performance this week is similar to last week.',
        'nlr.busiestPlatform': 'Platform {p} is the most used ({n} buses total).',
        'nlr.bestLine': 'Line {line} is the most reliable ({rate}% arrival rate).',
        'nlr.worstLine': 'Line {line} needs attention — only {rate}% arrivals.',
        'nlr.trendUp': 'Trend is improving: +{pct}% over recent logs.',
        'nlr.trendDown': 'Trend is declining: -{pct}% over recent logs.',
        'nlr.trendStable': 'Performance trend is steady.',
        'nlr.forecast': 'Predicted next arrival rate: {rate}%.',

        // Manual - Smart Features
        'manual.smart': '🧠 Smart Insights — Automatic Intelligence',
        'manual.smartList': '<li><strong>Auto-fill Suggestions</strong> — When you type a line number that you\'ve used before, a suggestion chip appears below the input showing the platform and destination this line usually uses. Click <strong>"Apply suggestion"</strong> to auto-fill those fields, saving you time.</li><li><strong>Anomaly Alerts</strong> — The app automatically detects problems and shows colored alerts: <strong>🔴 Red</strong> for critical issues (platform overloaded with 6+ buses), <strong>🟡 Yellow</strong> for warnings (low arrival rate compared to your average), and <strong>🔵 Blue</strong> for informational notices (buses missing platform or destination data).</li><li><strong>Trend Forecast</strong> — Based on your last 7 saved day logs, the app calculates a weighted prediction of your next arrival rate. It also shows whether your performance is improving, declining, or stable over time.</li><li><strong>Natural Language Report</strong> — Instead of just numbers, you get a readable text summary like: "Across 5 days, you\'ve tracked 42 buses with 87% arrival rate. Platform 3 is the busiest. Line 18 is the most reliable." This updates automatically as you save more daily logs.</li><li><strong>💡 Note:</strong> All smart features work 100% offline — they use only your locally saved data, with no internet connection needed.</li>',
    },
    he: {
        'app.title': 'מנהל אוטובוסים',
        'app.subtitle': 'נהל את הצי שלך בסטייל',

        'tab.dashboard': '🚌 ראשי',
        'tab.analytics': '📊 ניתוח',
        'tab.manual': '📖 מדריך',

        'btn.addBus': '+ הוסף אוטובוס',
        'btn.pdfReport': '📄 דוח PDF',
        'btn.saveLog': '📋 שמור יומן',
        'btn.markAll': '✓ סמן הכל',
        'btn.clearAll': '✕ נקה הכל',
        'btn.undo': '↩ בטל',
        'btn.exportJson': '📤 ייצוא JSON',
        'btn.importJson': '📥 ייבוא JSON',
        'btn.backup': '💾 גיבוי מלא',
        'btn.restore': '📂 שחזור גיבוי',
        'search.placeholder': '🔍 חיפוש אוטובוסים...',

        'col.line': 'קו',
        'col.plate': 'לוחית',
        'col.platform': 'רציף',
        'col.destination': 'יעד',
        'col.notes': 'הערות',
        'col.arrived': 'הגיע',
        'col.actions': 'פעולות',
        'table.empty': 'אין אוטובוסים עדיין. לחץ על <strong>+ הוסף אוטובוס</strong> למעלה כדי להתחיל.',
        'notes.placeholder': 'הוסף הערה...',

        'map.title': '🗺️ מפת חניה',
        'map.hint': 'גרור אוטובוסים כדי לסדר מחדש או להעביר בין רציפים',

        'tpl.title': '📋 תבניות',
        'tpl.save': '💾 שמור כתבנית',
        'tpl.namePlace': 'שם תבנית (לדוגמה: מסלול בוקר)',
        'tpl.anyDay': 'כל יום',
        'tpl.save.btn': 'שמור',
        'tpl.cancel': 'ביטול',
        'tpl.empty': 'אין תבניות שמורות עדיין.',
        'tpl.load': '▶ טען',
        'tpl.bus': 'אוטובוס',
        'tpl.buses': 'אוטובוסים',

        'qr.title': '📱 צ\'ק-אין QR',
        'qr.hint': 'הדפס קודי QR לנהגים — סריקה מסמנת הגעה.',
        'qr.empty': 'הוסף אוטובוסים עם מספרי קו כדי ליצור קודי QR.',
        'qr.print': '🖨️ הדפס דף QR',
        'qr.arrived': '✓ הגיע',

        'hist.title': '📅 היסטוריית יומנים',
        'hist.empty': 'אין יומנים שמורים. לחץ "שמור יומן" כדי לתעד את נתוני היום.',
        'hist.arrived': 'הגיעו',

        'dash.title': '📊 סטטיסטיקות',
        'dash.empty': 'שמור כמה יומנים יומיים כדי לראות סטטיסטיקות כאן.',
        'dash.arrivalRate': 'אחוז הגעה',
        'dash.busiestPlatform': 'רציף עמוס',
        'dash.daysLogged': 'ימים מתועדים',
        'dash.last30': '30 האחרונים',
        'dash.busesTotal': 'אוטובוסים סה"כ',
        'dash.noData': 'אין נתונים',
        'dash.across': 'לאורך',
        'dash.days': 'ימים',
        'dash.trendTitle': 'מגמת הגעה (7 יומנים אחרונים)',
        'dash.total': 'סה"כ',
        'dash.arrivedLabel': 'הגיעו',
        'dash.heatmap': 'מפת חום רציפים',
        'dash.topLines': 'קווים מובילים (לפי תדירות)',
        'dash.mostLate': 'הכי הרבה איחורים',

        'confirm.markAll': 'לסמן את כל האוטובוסים כהגיעו?',
        'confirm.clearAll': 'לנקות את כל סטטוסי ההגעה?',
        'confirm.restore': 'פעולה זו תחליף את כל הנתונים. להמשיך?',
        'confirm.yes': 'כן, המשך',
        'confirm.cancel': 'ביטול',

        'toast.logSaved': '✓ יומן יומי נשמר!',
        'toast.backupDone': '✓ גיבוי מלא הורד!',
        'toast.restored': '✓ הגיבוי שוחזר! טוען מחדש...',
        'toast.badFile': '⚠ קובץ גיבוי לא תקין',
        'toast.installed': '✓ האפליקציה הותקנה!',
        'toast.checkedIn': 'עשה צ\'ק-אין!',
        'toast.busNotFound': '⚠ אוטובוס לא נמצא — ייתכן שנמחק.',

        'install.title': 'התקן מנהל אוטובוסים',
        'install.desc': 'הוסף למסך הבית לגישה מהירה ושימוש אופליין',
        'install.btn': 'התקן',
        'install.iosTitle': 'התקן את האפליקציה',
        'install.iosDesc': 'לחץ על <strong>שיתוף ↑</strong> ואז <strong>"הוסף למסך הבית"</strong>',

        'day.allDays': 'כל הימים',
        'day.sunday': 'יום ראשון',
        'day.monday': 'יום שני',
        'day.tuesday': 'יום שלישי',
        'day.wednesday': 'יום רביעי',
        'day.thursday': 'יום חמישי',
        'day.friday': 'יום שישי',
        'day.saturday': 'שבת',

        'manual.title': '📖 מדריך למשתמש',
        'manual.installTitle': '📲 התקנת האפליקציה',
        'manual.installIntro': 'מנהל אוטובוסים ניתן להתקנה כאפליקציה עצמאית בכל מכשיר. עובד אופליין ונפתח כמו אפליקציה רגילה — ללא חנות אפליקציות! לאחר ההתקנה ניתן להשתמש ללא אינטרנט. כל הנתונים נשמרים באופן מקומי במכשיר שלך.',
        'manual.android': 'אנדרואיד',
        'manual.ios': 'אייפון / אייפד',
        'manual.pc': 'מחשב (Chrome / Edge)',
        'manual.androidSteps': '<li>פתח את הקישור ב-<strong>Chrome</strong></li><li>לחץ על <strong>תפריט ⋮</strong> (שלוש נקודות, בפינה הימנית העליונה)</li><li>לחץ <strong>"הוסף למסך הבית"</strong> או <strong>"התקן אפליקציה"</strong></li><li>לחץ <strong>"התקן"</strong> בחלון האישור</li><li>מוכן! האייקון מופיע במסך הבית כמו אפליקציה רגילה.</li>',
        'manual.iosSteps': '<li>פתח את הקישור ב-<strong>Safari</strong> (לא יעבוד בכרום באייפון — חובה להשתמש בספארי)</li><li>לחץ על כפתור <strong>השיתוף</strong> (ריבוע עם חץ למעלה ↑ בתחתית המסך)</li><li>גלול בתפריט ולחץ <strong>"הוסף למסך הבית"</strong></li><li>לחץ <strong>"הוסף"</strong> בפינה הימנית העליונה</li><li>מוכן! האייקון מופיע במסך הבית.</li>',
        'manual.pcSteps': '<li>פתח את הקישור ב-<strong>Chrome</strong> או <strong>Microsoft Edge</strong></li><li>חפש את <strong>אייקון ההתקנה ⊕</strong> בשורת הכתובת (בצד ימין). ב-Edge ייתכן שיופיע "אפליקציה זמינה".</li><li>לחץ <strong>"התקן"</strong></li><li>מוכן! האפליקציה נפתחת בחלון משלה ומופיעה בתפריט התחל (Windows) או בתיקיית היישומים (Mac).</li>',
        'manual.installTip': '<strong>💡 טיפ:</strong> לאחר ההתקנה, האפליקציה עובדת <strong>אופליין</strong> לחלוטין. כל הנתונים נשמרים במכשיר שלך — ללא חשבון, ללא התחברות, ללא הרשמה. הנתונים שלך אף פעם לא יוצאים מהמכשיר.',
        'manual.gettingStarted': '🚀 צעדים ראשונים — היום הראשון שלך',
        'manual.gettingStartedList': '<li><strong>שלב 1:</strong> לחץ על כפתור <strong>+ הוסף אוטובוס</strong> למעלה כדי ליצור רשומת אוטובוס ראשונה. שורה חדשה תופיע בטבלה.</li><li><strong>שלב 2:</strong> מלא את הפרטים: <strong>מספר קו</strong> (למשל 42), <strong>לוחית רישוי</strong> (למשל 12-345-67), <strong>רציף</strong> (מספר 1-9 שמציין באיזה רציף חניה האוטובוס ממוקם), ו-<strong>יעד</strong> (למשל "תל אביב").</li><li><strong>שלב 3:</strong> השתמש בעמודת <strong>הערות</strong> להוראות מיוחדות, כמו "החלפת נהג ב-14:00" או "קבוצת VIP".</li><li><strong>שלב 4:</strong> חזור על התהליך לכל האוטובוסים שלך. אפשר להוסיף כמה שצריך.</li><li><strong>שלב 5:</strong> הנתונים <strong>נשמרים אוטומטית מיד</strong> — אפשר לסגור את הדפדפן, לכבות את המחשב, ולחזור מתי שרוצים. הכל יישאר שמור.</li><li><strong>שלב 6:</strong> בסוף היום, לחץ <strong>📋 שמור יומן</strong> כדי לתעד את נתוני היום בהיסטוריה לצורך ניתוח ומעקב.</li>',
        'manual.arrival': '✅ מעקב הגעה',
        'manual.arrivalList': '<li><strong>מתג הגעה</strong> — לכל אוטובוס יש מתג דלוק/כבוי בעמודת "הגיע". החלף אותו לירוק כשהאוטובוס מגיע לתחנה. השורה תודגש כדי להראות שהאוטובוס נרשם.</li><li><strong>✓ סמן הכל</strong> — מסמן את כל האוטובוסים כ"הגיעו" בלחיצה אחת. תופיע תיבת אישור כדי למנוע לחיצות בטעות.</li><li><strong>✕ נקה הכל</strong> — מאפס את כל האוטובוסים ל"לא הגיעו". שימושי בתחילת יום חדש. גם כאן נדרש אישור.</li><li><strong>📱 צ\'ק-אין QR</strong> — גלול למטה למקטע צ\'ק-אין QR. לכל אוטובוס נוצר קוד QR ייחודי שאפשר להדפיס. כשנהג סורק את קוד ה-QR שלו עם מצלמת הטלפון, האוטובוס מסומן אוטומטית כ"הגיע" — ללא צורך בסימון ידני.</li>',
        'manual.map': '🗺️ מפת חניה',
        'manual.mapList': '<li>מפת החניה מציגה <strong>רשת ויזואלית של 9 רציפים</strong> (P1 עד P9). כל רציף מייצג מיקום חניה פיזי בתחנה שלך.</li><li>אוטובוסים מופיעים כ<strong>כרטיסים צבעוניים</strong> ברציף המוקצה להם. הצבע מבוסס על מספר הקו כדי שתוכל לזהות במהירות איזה אוטובוס נמצא היכן.</li><li><strong>גרור ושחרר</strong> — לחץ והחזק על כרטיס אוטובוס (או לחיצה ארוכה בנייד), ואז גרור אותו לרציף אחר כדי להעביר אותו. השינוי נשמר אוטומטית.</li><li>כותרות הרציפים מציגות <strong>אזהרות צבע</strong>: הן הופכות ל<span style="color:#eab308">צהוב</span> כשלרציף יש 4+ אוטובוסים (מתחיל להיות צפוף) ול<span style="color:#ef4444">אדום</span> ב-6+ אוטובוסים (עומס יתר). זה עוזר לאזן את העומס בין הרציפים.</li><li>אוטובוס שמציג <strong>"?"</strong> פירושו שלא הוקצה לו מספר קו עדיין.</li>',
        'manual.templates': '📋 תבניות — שמור ושחזר לוחות יומיים',
        'manual.templatesList': '<li><strong>מה זה תבניות?</strong> תבניות שומרות את רשימת האוטובוסים הנוכחית כדי שתוכל לטעון אותה מחדש ביום אחר. לדוגמה, אם ביום ראשון תמיד יש את אותם 15 אוטובוסים, שמור אותם כתבנית "ראשון בוקר" וטען אותה כל ראשון במקום להקליד הכל מחדש.</li><li><strong>💾 שמור כתבנית</strong> — לחץ על הכפתור, תן שם לתבנית (למשל "מסלול ראשון" או "משמרת בוקר"), בחר יום בשבוע (אופציונלי), ולחץ שמור. כל האוטובוסים הנוכחיים יישמרו.</li><li><strong>▶ טען</strong> — לחץ טען ליד כל תבנית כדי למלא את הטבלה באוטובוסים. סטטוס ההגעה יתאפס ל"לא הגיע" כי זה יום חדש.</li><li><strong>✕ מחק</strong> — הסר תבניות שאינך צריך יותר. זה מוחק רק את התבנית, לא את נתוני האוטובוסים הנוכחיים.</li><li>התבניות מסודרות לפי יום בשבוע לעיון נוח.</li>',
        'manual.reports': '📊 דוחות וניהול נתונים',
        'manual.reportsList': '<li><strong>📄 דוח PDF</strong> — מייצר PDF להדפסה עם טבלת האוטובוסים ומפת החניה, כולל צבעי סטטוס הגעה. מצוין להדפסה ותליה בתחנה או לשליחה למנהלים.</li><li><strong>📤 ייצוא JSON</strong> — מוריד את רשימת האוטובוסים הנוכחית כקובץ JSON. אפשר להשתמש בזה להעברת נתונים למכשיר אחר או לשמירת גיבוי מקומי.</li><li><strong>📥 ייבוא JSON</strong> — טוען קובץ JSON שיוצא בעבר כדי לשחזר נתוני אוטובוסים. שימושי כשמחליפים מכשירים.</li><li><strong>💾 גיבוי מלא</strong> — מוריד גיבוי מלא של כל הנתונים: אוטובוסים, תבניות, יומנים יומיים, הגדרות ושפה. מומלץ להשתמש באופן קבוע כדי להגן על הנתונים.</li><li><strong>📂 שחזור גיבוי</strong> — העלה קובץ גיבוי מלא כדי לשחזר הכל. <strong>שימו לב:</strong> פעולה זו מחליפה את כל הנתונים הנוכחיים, וודא שזו כוונתך.</li>',
        'manual.analytics': '📈 ניתוח נתונים (לשונית 📊 ניתוח)',
        'manual.analyticsList': '<li><strong>איך מתחילים:</strong> ראשית, שמור לפחות יומן יום אחד על ידי לחיצה על <strong>📋 שמור יומן</strong> בדשבורד. כל יומן מצלם תמונת מצב של האוטובוסים ומצב ההגעה שלהם באותו יום.</li><li><strong>📅 היסטוריית יומנים</strong> — מציגה את כל היומנים השמורים עם תאריך, מספר אוטובוסים, ואחוז הגעה. אפשר למחוק יומנים ישנים שאינם נחוצים.</li><li><strong>מגמת הגעה</strong> — גרף עמודות שמציג סה"כ אוטובוסים (אפור) מול אוטובוסים שהגיעו (צבעוני) ב-7 היומנים האחרונים. מאפשר לזהות דפוסים לאורך זמן.</li><li><strong>מפת חום רציפים</strong> — רשת צבעים שמראה אילו רציפים משומשים ביותר. צבעים כהים = יותר אוטובוסים שהוקצו לשם. עוזר לזהות אם רציפים מסוימים עמוסים באופן עקבי.</li><li><strong>קווים מובילים</strong> — מציג אילו קווי אוטובוס מופיעים בתדירות הגבוהה ביותר בכל היומנים.</li><li><strong>הכי הרבה איחורים</strong> — מציג אילו קווים יש להם את אחוזי ההגעה הנמוכים ביותר. אלו הקווים שלרוב לא מגיעים ודורשים תשומת לב.</li>',
        'manual.quickRef': '⚡ עזרה מהירה',
        'manual.quickRefList': '<li><strong>🔍 שורת חיפוש</strong> — הקלד כל דבר כדי לסנן אוטובוסים מיידית. עובד עם מספרי קו, לוחיות רישוי, יעדים או הערות. רק אוטובוסים תואמים יוצגו.</li><li><strong>↩ בטל</strong> — מחקת אוטובוס בטעות? לחץ בטל מיד כדי לשחזר אותו. עובד רק עבור המחיקה האחרונה.</li><li><strong>☀️/🌙 החלפת עיצוב</strong> — החלף בין מצב כהה ומצב בהיר. ההעדפה נשמרת אוטומטית.</li><li><strong>עב / EN החלפת שפה</strong> — החלף את כל האפליקציה בין עברית לאנגלית. האפליקציה תומכת לחלוטין בכיוון ימין-לשמאל (RTL) לעברית.</li><li><strong>▾ כותרות מקטעים</strong> — לחץ על כל כותרת מקטע (כמו "מפת חניה" או "תבניות") כדי לכווץ או להרחיב את המקטע. שימושי להתמקד במה שצריך.</li><li><strong>מיון עמודות</strong> — לחץ על כל כותרת עמודה בטבלת האוטובוסים (קו, לוחית, רציף, יעד, הגיע) כדי למיין לפי עמודה זו. לחץ שוב להפוך את סדר המיון.</li>',

        // Smart Analytics
        'smart.title': 'תובנות חכמות',
        'smart.forecast': 'תחזית',
        'smart.predictedRate': 'אחוז הגעה צפוי',
        'smart.trendLabel.improving': 'משתפר',
        'smart.trendLabel.declining': 'יורד',
        'smart.trendLabel.stable': 'יציב',
        'smart.suggestion': 'הצעה',
        'smart.suggestApply': 'החל הצעה',
        'smart.suggestHint': 'בהתבסס על {n} רשומות קודמות',

        'anomaly.missingPlatform': '{n} אוטובוסים ללא רציף.',
        'anomaly.missingDest': '{n} אוטובוסים ללא יעד.',
        'anomaly.platformOverload': 'רציף {p} עמוס מדי — {n} אוטובוסים!',
        'anomaly.platformBusy': 'רציף {p} מתמלא ({n} אוטובוסים).',
        'anomaly.lowArrival': 'אחוז הגעה נוכחי ({current}%) נמוך מהממוצע ({avg}%).',
        'anomaly.highVolume': 'כמות אוטובוסים גבוהה מהרגיל ({current} לעומת ממוצע {avg}).',
        'anomaly.lowVolume': 'פחות אוטובוסים מהרגיל ({current} לעומת ממוצע {avg}).',

        'nlr.noData': 'שמור יומנים יומיים כדי לראות תובנות חכמות כאן.',
        'nlr.overall': 'לאורך {days} ימים, עקבת אחרי {buses} אוטובוסים עם אחוז הגעה כולל של {rate}%.',
        'nlr.weekBetter': 'השבוע טוב ב-{pct}% מהשבוע שעבר.',
        'nlr.weekWorse': 'השבוע נמוך ב-{pct}% מהשבוע שעבר.',
        'nlr.weekSame': 'הביצועים השבוע דומים לשבוע שעבר.',
        'nlr.busiestPlatform': 'רציף {p} הוא הכי עמוס ({n} אוטובוסים סה"כ).',
        'nlr.bestLine': 'קו {line} הכי אמין ({rate}% הגעות).',
        'nlr.worstLine': 'קו {line} דורש תשומת לב — רק {rate}% הגעות.',
        'nlr.trendUp': 'מגמה חיובית: +{pct}% ביומנים האחרונים.',
        'nlr.trendDown': 'מגמה שלילית: -{pct}% ביומנים האחרונים.',
        'nlr.trendStable': 'מגמת הביצועים יציבה.',
        'nlr.forecast': 'אחוז הגעה צפוי: {rate}%.',

        'manual.smart': '🧠 תובנות חכמות — מודיעין אוטומטי',
        'manual.smartList': '<li><strong>הצעות מילוי אוטומטי</strong> — כשמקלידים מספר קו שהשתמשת בו בעבר, מופיעה הצעה מתחת לשדה עם הרציף והיעד שהקו הזה בדרך כלל משתמש בהם. לחץ <strong>"החל הצעה"</strong> כדי למלא שדות אלה אוטומטית וחסוך זמן.</li><li><strong>התראות חריגות</strong> — האפליקציה מזהה בעיות אוטומטית ומציגה התראות צבעוניות: <strong>🔴 אדום</strong> לבעיות קריטיות (רציף עמוס עם 6+ אוטובוסים), <strong>🟡 צהוב</strong> לאזהרות (אחוז הגעה נמוך לעומת הממוצע), ו-<strong>🔵 כחול</strong> להודעות מידע (אוטובוסים חסרי רציף או יעד).</li><li><strong>תחזית מגמה</strong> — בהתבסס על 7 היומנים האחרונים, האפליקציה מחשבת תחזית משוקללת לאחוז ההגעה הבא. היא גם מציגה אם הביצועים משתפרים, יורדים או יציבים לאורך זמן.</li><li><strong>דוח בשפה טבעית</strong> — במקום רק מספרים, מקבלים סיכום טקסט קריא כמו: "לאורך 5 ימים, עקבת אחרי 42 אוטובוסים עם 87% הגעות. רציף 3 הכי עמוס. קו 18 הכי אמין." הדוח מתעדכן אוטומטית ככל ששומרים יותר יומנים.</li><li><strong>💡 הערה:</strong> כל התכונות החכמות עובדות 100% אופליין — הן משתמשות רק בנתונים השמורים מקומית, ללא צורך בחיבור לאינטרנט.</li>',
    },
};
