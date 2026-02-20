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
        'manual.installIntro': 'Bus Organizer can be installed as a standalone app on any device. It works offline and launches like a native app — no app store needed!',
        'manual.android': 'Android',
        'manual.ios': 'iPhone / iPad',
        'manual.pc': 'PC / Mac (Chrome / Edge)',
        'manual.androidSteps': '<li>Open the app URL in <strong>Chrome</strong></li><li>Tap the <strong>⋮ menu</strong> (top-right)</li><li>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong></li><li>Tap <strong>"Install"</strong> in the popup</li><li>The app icon appears on your home screen!</li>',
        'manual.iosSteps': '<li>Open the app URL in <strong>Safari</strong> (required on iOS)</li><li>Tap the <strong>Share button</strong> (↑ square with arrow)</li><li>Scroll down and tap <strong>"Add to Home Screen"</strong></li><li>Tap <strong>"Add"</strong></li><li>The app icon appears on your home screen!</li>',
        'manual.pcSteps': '<li>Open the app URL in <strong>Chrome</strong> or <strong>Edge</strong></li><li>Look for the <strong>install icon ⊕</strong> in the address bar (right side)</li><li>Click <strong>"Install"</strong></li><li>The app opens in its own window and appears in your Start Menu / Applications!</li>',
        'manual.installTip': '<strong>💡 Tip:</strong> After installation, the app works completely <strong>offline</strong>. All data is stored on your device. No account is needed.',
        'manual.gettingStarted': 'Getting Started',
        'manual.gettingStartedList': '<li>Click <strong>+ Add New Bus</strong> to create a bus entry.</li><li>Fill in <strong>Line Number</strong>, <strong>Plate Number</strong>, <strong>Platform (1-9)</strong>, and <strong>Destination</strong>.</li><li>Use the <strong>Notes</strong> column for special instructions (e.g. "driver change").</li><li>Your data <strong>auto-saves</strong> — you can close the browser and come back anytime.</li>',
        'manual.arrival': 'Arrival Tracking',
        'manual.arrivalList': '<li><strong>Toggle switch</strong> — Flip the switch in the "Arrived" column.</li><li><strong>✓ Mark All</strong> / <strong>✕ Clear All</strong> — Bulk actions with confirmation.</li><li><strong>QR Check-In</strong> — Print QR codes for drivers. Scanning auto-marks the bus as arrived.</li>',
        'manual.map': 'Parking Map',
        'manual.mapList': '<li>9-platform grid showing bus locations.</li><li><strong>Drag & drop</strong> (mouse or touch) to move buses between platforms.</li><li>Platforms turn <span style="color:#eab308">yellow</span> at 4+ and <span style="color:#ef4444">red</span> at 6+ buses.</li><li>Color-coded by line number for quick identification.</li>',
        'manual.templates': 'Templates',
        'manual.templatesList': '<li><strong>💾 Save Current as Template</strong> — Save your bus list with a name and day.</li><li><strong>▶ Load</strong> — Load a template to populate the table. Arrivals reset.</li><li><strong>✕ Delete</strong> — Remove templates you no longer need.</li>',
        'manual.reports': 'Reports & Data',
        'manual.reportsList': '<li><strong>📄 PDF Report</strong> — Table + parking map with arrival colors.</li><li><strong>📤 Export / 📥 Import JSON</strong> — Share bus data between devices.</li><li><strong>💾 Full Backup / 📂 Restore</strong> — Save or restore ALL data.</li>',
        'manual.analytics': 'Analytics (📊 Tab)',
        'manual.analyticsList': '<li><strong>📋 Save Day Log</strong> to record today\'s data.</li><li><strong>Arrival Trend</strong> — Bar chart of the last 7 logs.</li><li><strong>Platform Heatmap</strong> — Color grid showing platform usage.</li><li><strong>Top Lines & Most Late</strong> — Frequency charts.</li>',
        'manual.quickRef': 'Quick Reference',
        'manual.quickRefList': '<li><strong>🔍 Search</strong> — Filter by any field.</li><li><strong>↩ Undo</strong> — Restore last deleted bus.</li><li><strong>☀️/🌙</strong> — Dark/light mode toggle.</li><li><strong>▾ Section headers</strong> — Click to collapse/expand.</li>',

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
        'manual.smart': 'Smart Insights (🧠)',
        'manual.smartList': '<li><strong>Auto-fill</strong> — When you type a line number, the app suggests platform and destination from history.</li><li><strong>Anomaly alerts</strong> — Warns about overloaded platforms, low arrival rates, and missing data.</li><li><strong>Trend forecast</strong> — Predicts your next arrival rate from historical patterns.</li><li><strong>Natural language report</strong> — A readable summary of your fleet performance.</li>',
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
        'manual.installIntro': 'מנהל אוטובוסים ניתן להתקנה כאפליקציה עצמאית בכל מכשיר. עובד אופליין ונפתח כמו אפליקציה רגילה — ללא חנות אפליקציות!',
        'manual.android': 'אנדרואיד',
        'manual.ios': 'אייפון / אייפד',
        'manual.pc': 'מחשב (Chrome / Edge)',
        'manual.androidSteps': '<li>פתח את הקישור ב-<strong>Chrome</strong></li><li>לחץ על <strong>תפריט ⋮</strong> (למעלה)</li><li>לחץ <strong>"הוסף למסך הבית"</strong> או <strong>"התקן אפליקציה"</strong></li><li>לחץ <strong>"התקן"</strong></li><li>האייקון מופיע במסך הבית!</li>',
        'manual.iosSteps': '<li>פתח את הקישור ב-<strong>Safari</strong> (חובה באייפון)</li><li>לחץ על כפתור <strong>השיתוף</strong> (↑ ריבוע עם חץ)</li><li>גלול ולחץ <strong>"הוסף למסך הבית"</strong></li><li>לחץ <strong>"הוסף"</strong></li><li>האייקון מופיע במסך הבית!</li>',
        'manual.pcSteps': '<li>פתח את הקישור ב-<strong>Chrome</strong> או <strong>Edge</strong></li><li>חפש את <strong>אייקון ההתקנה ⊕</strong> בשורת הכתובת</li><li>לחץ <strong>"התקן"</strong></li><li>האפליקציה נפתחת בחלון משלה!</li>',
        'manual.installTip': '<strong>💡 טיפ:</strong> לאחר ההתקנה, האפליקציה עובדת <strong>אופליין</strong> לחלוטין. כל הנתונים נשמרים במכשיר שלך.',
        'manual.gettingStarted': 'התחלה מהירה',
        'manual.gettingStartedList': '<li>לחץ על <strong>+ הוסף אוטובוס</strong> ליצירת רשומה.</li><li>מלא <strong>מספר קו</strong>, <strong>לוחית רישוי</strong>, <strong>רציף (1-9)</strong> ו-<strong>יעד</strong>.</li><li>השתמש בעמודת <strong>הערות</strong> להוראות מיוחדות.</li><li>הנתונים <strong>נשמרים אוטומטית</strong> — ניתן לסגור ולחזור בכל עת.</li>',
        'manual.arrival': 'מעקב הגעה',
        'manual.arrivalList': '<li><strong>מתג</strong> — החלף בעמודת "הגיע".</li><li><strong>✓ סמן הכל</strong> / <strong>✕ נקה הכל</strong> — פעולות מרוכזות עם אישור.</li><li><strong>צ\'ק-אין QR</strong> — הדפס קודי QR לנהגים. סריקה מסמנת הגעה אוטומטית.</li>',
        'manual.map': 'מפת חניה',
        'manual.mapList': '<li>רשת 9 רציפים המציגה מיקומי אוטובוסים.</li><li><strong>גרור ושחרר</strong> (עכבר או מגע) להעברה בין רציפים.</li><li>רציפים הופכים ל<span style="color:#eab308">צהוב</span> ב-4+ ול<span style="color:#ef4444">אדום</span> ב-6+ אוטובוסים.</li><li>צבעים לפי מספר קו לזיהוי מהיר.</li>',
        'manual.templates': 'תבניות',
        'manual.templatesList': '<li><strong>💾 שמור כתבנית</strong> — שמור את רשימת האוטובוסים עם שם ויום.</li><li><strong>▶ טען</strong> — טען תבנית. סטטוס הגעה מתאפס.</li><li><strong>✕ מחק</strong> — הסר תבניות שאינך צריך.</li>',
        'manual.reports': 'דוחות ונתונים',
        'manual.reportsList': '<li><strong>📄 דוח PDF</strong> — טבלה + מפת חניה עם צבעי הגעה.</li><li><strong>📤 ייצוא / 📥 ייבוא JSON</strong> — שתף נתונים בין מכשירים.</li><li><strong>💾 גיבוי / 📂 שחזור</strong> — שמור או שחזר את כל הנתונים.</li>',
        'manual.analytics': 'ניתוח (לשונית 📊)',
        'manual.analyticsList': '<li><strong>📋 שמור יומן</strong> לתיעוד נתוני היום.</li><li><strong>מגמת הגעה</strong> — גרף עמודות של 7 יומנים אחרונים.</li><li><strong>מפת חום רציפים</strong> — רשת צבעים של שימוש ברציפים.</li><li><strong>קווים מובילים ומאחרים</strong> — גרפי תדירות.</li>',
        'manual.quickRef': 'עזרה מהירה',
        'manual.quickRefList': '<li><strong>🔍 חיפוש</strong> — סנן לפי כל שדה.</li><li><strong>↩ בטל</strong> — שחזר אוטובוס שנמחק.</li><li><strong>☀️/🌙</strong> — מצב כהה/בהיר.</li><li><strong>▾ כותרות מקטעים</strong> — לחץ לכיווץ/הרחבה.</li>',

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

        'manual.smart': 'תובנות חכמות (🧠)',
        'manual.smartList': '<li><strong>מילוי אוטומטי</strong> — כשמקלידים מספר קו, האפליקציה מציעה רציף ויעד מההיסטוריה.</li><li><strong>התראות חריגות</strong> — אזהרות על רציפים עמוסים, אחוזי הגעה נמוכים ונתונים חסרים.</li><li><strong>תחזית מגמה</strong> — חיזוי אחוז ההגעה הבא מדפוסים היסטוריים.</li><li><strong>דוח טבעי</strong> — סיכום קריא של ביצועי הצי.</li>',
    },
};
