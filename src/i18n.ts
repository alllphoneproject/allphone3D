import { ReactNode } from "react";

export type Language = "en" | "he";

export const translations = {
  en: {
    title: "BeeTech BT-REC02",
    subtitle: "Interactive Product Demo",
    description: "Explore the device in 3D, inspect its controls, and experience its core functions interactively.",
    recorderOverview: "The BeeTech BT-REC02 is a premium digital voice recorder delivering crystal-clear audio with a high-sensitivity microphone. Ideal for meetings, lectures, and phone calls.",
    
    // Specs
    specsTitle: "Technical Specifications",
    specs: [
      { label: "Display", value: "128 × 64 black and white screen" },
      { label: "Storage", value: "8GB built-in" },
      { label: "Battery", value: "3.7V / 300mAh polymer battery" },
      { label: "Recording Time", value: "Up to 20 hours" },
      { label: "Playback", value: "8 hrs (Music), 20 hrs (Recording)" },
      { label: "Format", value: "MP3" },
      { label: "High-Fidelity", value: "384 Kbps" },
      { label: "Frequency", value: "20Hz–20KHz" },
      { label: "SNR", value: "> 70 dB" }
    ],

    // UI
    startDemo: "Start Demo",
    resetDemo: "Reset View",
    viewSpecs: "View Specs",
    howItWorks: "How It Works",
    howToUse: [
      "Click the Power switch on the right side to turn on the device.",
      "Click the REC button on the device to start a voice recording.",
      "Click STOP to stop the recording.",
      "Click PLAY/PAUSE to listen to your recording."
    ],
    contactSales: "Contact Sales",
    
    // Status
    statusIdle: "Ready",
    statusRecording: "Recording...",
    statusPlaying: "Playing...",
    statusError: "Microphone access denied. Simulating recording.",

    // Hotspots
    hotspotScreen: "LCD Screen",
    hotspotScreenDesc: "Multilingual dot-matrix LCD for intuitive operation.",
    hotspotRec: "REC Button",
    hotspotRecDesc: "Start recording instantly with a single press.",
    hotspotStop: "STOP Button",
    hotspotStopDesc: "Stop current recording or playback.",
    hotspotPlay: "PLAY/PAUSE",
    hotspotPlayDesc: "Play back your recorded audio.",
    hotspotSpeaker: "Built-in Speaker",
    hotspotSpeakerDesc: "High-quality speaker for clear playback without headphones.",
    hotspotSide: "Menu & Navigation",
    hotspotSideDesc: "Access settings, navigate files, and toggle power.",
    hotspotTop: "I/O Ports",
    hotspotTopDesc: "Headphone and microphone/line-in jacks.",
    hotspotMic: "Stereo Mics",
    hotspotMicDesc: "High-sensitivity microphones for clear sound.",
    hotspotAuxOut: "HEADPHONE JACK",
    hotspotAuxOutDesc: "3.5mm stereo output for monitoring.",
    hotspotAuxIn: "MIC INPUT",
    hotspotAuxInDesc: "External microphone 3.5mm input.",

  },
  he: {
    title: "BeeTech BT-REC02",
    subtitle: "הדמיית מוקאפ אינטראקטיבית",
    description: "חקור את המכשיר ב-3D, בדוק את הפקדים, וחווה את פונקציות הליבה באופן אינטראקטיבי.",
    recorderOverview: "BeeTech BT-REC02 הוא רשמקול דיגיטלי פרמיום המספק שמע צלול עם מיקרופון בעל רגישות גבוהה. אידיאלי עבור פגישות, הרצאות ושיחות טלפון.",
    
    // Specs
    specsTitle: "מפרט טכני",
    specs: [
      { label: "מסך", value: "128 × 64 שחור ולבן" },
      { label: "נפח אחסון", value: "8GB מובנה" },
      { label: "סוללה", value: "3.7V / 300mAh פולימר" },
      { label: "זמן הקלטה", value: "עד 20 שעות" },
      { label: "זמן השמעה", value: "8 שעות (מוזיקה), 20 שעות (הקלטות)" },
      { label: "פורמט", value: "MP3" },
      { label: "איכות גבוהה", value: "384 Kbps" },
      { label: "תגובת תדר", value: "20Hz–20KHz" },
      { label: "יחס אות לרעש", value: "> 70 dB" }
    ],

    // UI
    startDemo: "התחל הדגמה",
    resetDemo: "איפוס תצוגה",
    viewSpecs: "מפרט מלא",
    howItWorks: "כיצד זה עובד",
    howToUse: [
      "הדלק את המכשיר בעזרת מתג ההפעלה בצד ימין.",
      "לחץ על כפתור ה-REC במכשיר כדי להתחיל הקלטה.",
      "לחץ על כפתור ה-STOP לעצירה.",
      "לחץ על כפתור ה-PLAY כדי להאזין להקלטה."
    ],
    contactSales: "צור קשר למכירות",
    
    // Status
    statusIdle: "מוכן",
    statusRecording: "מקליט...",
    statusPlaying: "משמיע...",
    statusError: "גישה למיקרופון נדחתה. מדמה הקלטה.",

    // Hotspots
    hotspotScreen: "מסך LCD",
    hotspotScreenDesc: "מסך LCD רב-לשוני להפעלה אינטואיטיבית.",
    hotspotRec: "כפתור הקלטה (REC)",
    hotspotRecDesc: "התחל הקלטה באופן מיידי בלחיצה אחת.",
    hotspotStop: "כפתור עצירה",
    hotspotStopDesc: "עצור הקלטה או השמעה נוכחית.",
    hotspotPlay: "השמעה/השהיה",
    hotspotPlayDesc: "האזן להקלטות שלך.",
    hotspotSpeaker: "רמקול מובנה",
    hotspotSpeakerDesc: "רמקול איכותי להשמעה ברורה ללא אוזניות.",
    hotspotSide: "תפריט וניווט",
    hotspotSideDesc: "גישה להגדרות, ניווט בקבצים והדלקה/כיבוי.",
    hotspotTop: "חיבורים",
    hotspotTopDesc: "יציאת אוזניות וכניסת מיקרופון.",
    hotspotMic: "מיקרופונים סטריאופוניים",
    hotspotMicDesc: "מיקרופונים רגישים לשמע צלול.",
    hotspotAuxOut: "יציאת אוזניות",
    hotspotAuxOutDesc: "יציאת 3.5 מ\"מ סטריאופונית להאזנה.",
    hotspotAuxIn: "כניסת מיקרופון",
    hotspotAuxInDesc: "כניסת 3.5 מ\"מ למיקרופון חיצוני.",
  }
};
