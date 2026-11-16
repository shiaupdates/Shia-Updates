import type { LanguageCode } from '../types';

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  nav: {
    home: string;
    explore: string;
    calendar: string;
    myEvents: string;
    profile: string;
  };
  actions: {
    createEvent: string;
    signIn: string;
    signInGoogle: string;
    loginOrSignup: string;
    signOut: string;
    save: string;
    cancel: string;
    edit: string;
    publish: string;
    saveDraft: string;
    cancelEvent: string;
    viewAll: string;
    getDirections: string;
    addToCalendar: string;
    share: string;
    copyLink: string;
    linkCopied: string;
    donate: string;
    promoteBusiness: string;
    organizerStudio: string;
    adminPanel: string;
    detectLocation: string;
    back: string;
    close: string;
    submit: string;
    approve: string;
    reject: string;
    delete: string;
    exportCsv: string;
    continue: string;
  };
  auth: {
    modalTitle: string;
    modalSubtitle: string;
    loginTab: string;
    registerTab: string;
    orDivider: string;
    emailLabel: string;
    passwordLabel: string;
    passwordHint: string;
    contactDetailsLabel: string;
    loginButton: string;
    registerButton: string;
    forgotPassword: string;
    resetSent: string;
    verifyTitle: string;
    verifyMessage: string;
    resendVerify: string;
    refreshVerify: string;
    verifyResent: string;
    verifyStillPending: string;
  };
  audience: {
    all: string;
    women: string;
    men: string;
    both: string;
    womenOnly: string;
    menOnly: string;
    forBoth: string;
  };
  home: {
    todaysEvents: string;
    upcomingEvents: string;
    popularEvents: string;
    browseCategories: string;
    sponsored: string;
    communityGraphic: string;
    announcement: string;
    noTodayEvents: string;
    noUpcomingEvents: string;
    allCitiesPrompt: string;
    eventsInCity: string;
  };
  explore: {
    searchPlaceholder: string;
    allCities: string;
    allCategories: string;
    upcomingTab: string;
    pastHistoryTab: string;
    foodAvailableOnly: string;
    filterByDate: string;
    noResults: string;
  };
  calendar: {
    title: string;
    subtitle: string;
    eventsOnDate: string;
    noEventsOnDate: string;
    multiDay: string;
    today: string;
  };
  details: {
    attendanceHeading: string;
    attendanceSubheading: string;
    yesLabel: string;
    noLabel: string;
    maybeLabel: string;
    yesShort: string;
    maybeShort: string;
    noShort: string;
    confirmedEstimate: string;
    maybeNote: string;
    totalResponses: string;
    dateAndTime: string;
    duration: string;
    preacher: string;
    organizer: string;
    venueAndMap: string;
    contact: string;
    foodAndNiyaz: string;
    foodProvided: string;
    noFoodInfo: string;
    additionalNotes: string;
    signInToRsvp: string;
    cancelledBanner: string;
    pastBanner: string;
  };
  myEvents: {
    attendingYes: string;
    attendingMaybe: string;
    createdByMe: string;
    history: string;
    emptyAttending: string;
    emptyMaybe: string;
    emptyCreated: string;
    emptyHistory: string;
  };
  organizer: {
    title: string;
    subtitle: string;
    upcoming: string;
    past: string;
    published: string;
    drafts: string;
    cancelled: string;
    attendanceReports: string;
    estimatedAttendees: string;
    retentionNote: string;
  };
  profile: {
    title: string;
    fullName: string;
    mobile: string;
    email: string;
    gender: string;
    male: string;
    female: string;
    preferNotToSay: string;
    city: string;
    language: string;
    notifications: string;
    cityAlerts: string;
    eventReminders: string;
    privacy: string;
    showProfileToOrganizers: string;
    savedSuccess: string;
  };
  onboarding: {
    welcomeTitle: string;
    chooseLanguage: string;
    setupProfile: string;
    selectCity: string;
    completeSetup: string;
  };
  donation: {
    title: string;
    subtitle: string;
    purposeLabel: string;
    purposes: {
      general_community: string;
      majlis_niyaz: string;
      platform_support: string;
    };
    amountLabel: string;
    methodLabel: string;
    confirmButton: string;
    receiptTitle: string;
    receiptMessage: string;
    yourHistory: string;
  };
  ads: {
    title: string;
    subtitle: string;
    businessName: string;
    businessCategory: string;
    contactDetails: string;
    bannerTitle: string;
    bannerSubtitle: string;
    websiteLink: string;
    duration: string;
    placement: string;
    submitRequest: string;
    myRequests: string;
  };
  admin: {
    title: string;
    overview: string;
    events: string;
    categories: string;
    banners: string;
    cities: string;
    users: string;
    reports: string;
    donations: string;
    notifications: string;
    settings: string;
  };
  statusLabels: {
    draft: string;
    published: string;
    cancelled: string;
    completed: string;
    pending: string;
    active: string;
    inactive: string;
    approved: string;
    rejected: string;
  };
  location: {
    withinRadius: string;
    gpsActive: string;
    cityReference: string;
    useCurrentGps: string;
    detectingGps: string;
    useCityFallback: string;
    kmAway: string;
    outsideRadiusTitle: string;
    outsideRadiusMessage: string;
    noEventsInRadius: string;
    allWithinRadius: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDictionary> = {
  en: {
    appName: 'Shia Updates',
    tagline: 'Community Events & Attendance',
    nav: {
      home: 'Home',
      explore: 'Explore',
      calendar: 'Calendar',
      myEvents: 'My Events',
      profile: 'Profile',
    },
    actions: {
      createEvent: 'Create Event',
      signIn: 'Sign In',
      signInGoogle: 'Continue with Google',
      loginOrSignup: 'Login / Sign-up',
      signOut: 'Sign Out',
      save: 'Save Changes',
      cancel: 'Cancel',
      edit: 'Edit',
      publish: 'Publish Event',
      saveDraft: 'Save as Draft',
      cancelEvent: 'Cancel Event',
      viewAll: 'View All',
      getDirections: 'Get Directions',
      addToCalendar: 'Add to Calendar',
      share: 'Share Event',
      copyLink: 'Copy Link',
      linkCopied: 'Link Copied!',
      donate: 'Donate',
      promoteBusiness: 'Promote Business',
      organizerStudio: 'Organizer Dashboard',
      adminPanel: 'Admin Dashboard',
      detectLocation: 'Detect City',
      back: 'Back',
      close: 'Close',
      submit: 'Submit',
      approve: 'Approve',
      reject: 'Reject',
      delete: 'Delete',
      exportCsv: 'Export CSV',
      continue: 'Continue',
    },
    auth: {
      modalTitle: 'Login or Sign Up',
      modalSubtitle: 'Continue with Google or register manually with your email and contact details.',
      loginTab: 'Login',
      registerTab: 'Register',
      orDivider: 'or use email & contact details',
      emailLabel: 'Email Address',
      passwordLabel: 'Password',
      passwordHint: 'Minimum 6 characters',
      contactDetailsLabel: 'Mobile / Contact Number',
      loginButton: 'Login with Email',
      registerButton: 'Create Account',
      forgotPassword: 'Forgot password?',
      resetSent: 'Password reset link sent to your email address.',
      verifyTitle: 'Verify your email address',
      verifyMessage: 'We sent a verification link to your email. Please verify your inbox, then tap Refresh below to unlock RSVP, event creation, and profile sync.',
      resendVerify: 'Resend Verification Email',
      refreshVerify: "I've Verified — Refresh",
      verifyResent: 'Verification email sent again. Please check your inbox or spam folder.',
      verifyStillPending: 'Verification not detected yet. Please open the link in your email first.',
    },
    audience: {
      all: 'All Events',
      women: 'Women',
      men: 'Men',
      both: 'Both',
      womenOnly: 'Women Only',
      menOnly: 'Men Only',
      forBoth: 'Men & Women',
    },
    home: {
      todaysEvents: "Today's Events",
      upcomingEvents: 'Upcoming Events',
      popularEvents: 'Popular Community Gatherings',
      browseCategories: 'Browse by Category',
      sponsored: 'Sponsored',
      communityGraphic: 'Community Update',
      announcement: 'Announcement',
      noTodayEvents: 'No events scheduled for today with these filters.',
      noUpcomingEvents: 'No upcoming events found for the selected filters.',
      allCitiesPrompt: 'Showing events in',
      eventsInCity: 'Events in',
    },
    explore: {
      searchPlaceholder: 'Search Majlis, venue, zakir, or organizer...',
      allCities: 'All Cities',
      allCategories: 'All Categories',
      upcomingTab: 'Upcoming',
      pastHistoryTab: 'Past Events (History)',
      foodAvailableOnly: 'Tabarruk / Niyaz Available',
      filterByDate: 'Filter by Date',
      noResults: 'No matching events found. Try adjusting your city or category filter.',
    },
    calendar: {
      title: 'Community Calendar',
      subtitle: 'Tap any highlighted date to view scheduled gatherings',
      eventsOnDate: 'Events on',
      noEventsOnDate: 'No community events scheduled on this date.',
      multiDay: 'Multi-day',
      today: 'Today',
    },
    details: {
      attendanceHeading: 'Will you attend this event?',
      attendanceSubheading: 'Your response helps organizers plan seating, water, and refreshments without wastage.',
      yesLabel: 'YES – I will attend',
      noLabel: 'NO – I will not attend',
      maybeLabel: 'MAYBE – I might attend',
      yesShort: 'Yes',
      maybeShort: 'Maybe',
      noShort: 'No',
      confirmedEstimate: 'Confirmed Attending (YES)',
      maybeNote: 'Maybe responses are tracked separately and not counted as confirmed.',
      totalResponses: 'Total Responses',
      dateAndTime: 'Date & Time',
      duration: 'Duration',
      preacher: 'Zakir / Preacher',
      organizer: 'Organizer',
      venueAndMap: 'Venue & Location',
      contact: 'Contact',
      foodAndNiyaz: 'Food & Refreshments',
      foodProvided: 'Refreshments / Niyaz arranged',
      noFoodInfo: 'No refreshment arrangement listed',
      additionalNotes: 'Additional Information',
      signInToRsvp: 'Login or sign up to confirm your attendance',
      cancelledBanner: 'This event has been cancelled by the organizer.',
      pastBanner: 'This event has concluded and is archived in event history.',
    },
    myEvents: {
      attendingYes: 'Attending (Yes)',
      attendingMaybe: 'Maybe',
      createdByMe: 'Created by Me',
      history: 'History',
      emptyAttending: 'You have not marked YES for any upcoming events yet.',
      emptyMaybe: 'No events marked as Maybe.',
      emptyCreated: 'You have not created any events yet.',
      emptyHistory: 'No past attended or organized events in your history.',
    },
    organizer: {
      title: 'Organizer Dashboard',
      subtitle: 'Publish gatherings and monitor real-time attendance estimates',
      upcoming: 'Upcoming',
      past: 'Past Events',
      published: 'Published',
      drafts: 'Drafts',
      cancelled: 'Cancelled',
      attendanceReports: 'Attendance Reports',
      estimatedAttendees: 'Estimated Confirmed Attendees (YES)',
      retentionNote: 'Finished events move automatically to Past Events and are retained per platform policy.',
    },
    profile: {
      title: 'Profile & Settings',
      fullName: 'Full Name',
      mobile: 'Mobile Number',
      email: 'Email Address',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      preferNotToSay: 'Prefer not to say',
      city: 'Selected City',
      language: 'Preferred Language',
      notifications: 'Push & City Alerts',
      cityAlerts: 'New events in my city',
      eventReminders: 'Upcoming event reminders & changes',
      privacy: 'Privacy Settings',
      showProfileToOrganizers: 'Keep individual attendance private',
      savedSuccess: 'Preferences saved to your account.',
    },
    onboarding: {
      welcomeTitle: 'Welcome to Shia Updates',
      chooseLanguage: 'Choose your preferred language',
      setupProfile: 'Complete your community profile',
      selectCity: 'Select your primary city',
      completeSetup: 'Enter Shia Updates',
    },
    donation: {
      title: 'Support the Community',
      subtitle: 'Voluntary contributions help support local gatherings and platform operations.',
      purposeLabel: 'Contribution Purpose',
      purposes: {
        general_community: 'General Community Welfare',
        majlis_niyaz: 'Majlis & Niyaz Arrangements',
        platform_support: 'Shia Updates Platform Support',
      },
      amountLabel: 'Contribution Amount (INR)',
      methodLabel: 'Payment Method',
      confirmButton: 'Complete Contribution',
      receiptTitle: 'Contribution Recorded',
      receiptMessage: 'Thank you for your generous support. Your private transaction reference is saved to your account.',
      yourHistory: 'Your Private Contributions',
    },
    ads: {
      title: 'Promote Your Business',
      subtitle: 'Submit a community business banner for Admin review. Approved banners appear in the carousel with a clear Sponsored label.',
      businessName: 'Business Name',
      businessCategory: 'Business Category',
      contactDetails: 'Contact Phone / Email',
      bannerTitle: 'Banner Headline',
      bannerSubtitle: 'Short Offer or Description',
      websiteLink: 'Website or Instagram Link',
      duration: 'Campaign Duration',
      placement: 'Placement',
      submitRequest: 'Submit for Admin Approval',
      myRequests: 'Your Advertisement Requests',
    },
    admin: {
      title: 'Admin Control Panel',
      overview: 'Overview',
      events: 'Events & Moderation',
      categories: 'Categories',
      banners: 'Ads & Banners',
      cities: 'Cities',
      users: 'Users & Roles',
      reports: 'Attendance Reports',
      donations: 'Donation Records',
      notifications: 'Notifications',
      settings: 'Retention & Settings',
    },
    statusLabels: {
      draft: 'Draft',
      published: 'Published',
      cancelled: 'Cancelled',
      completed: 'Completed',
      pending: 'Pending Review',
      active: 'Active',
      inactive: 'Inactive',
      approved: 'Approved',
      rejected: 'Rejected',
    },
    location: {
      withinRadius: 'Within 72 km of',
      gpsActive: 'Current GPS Location',
      cityReference: 'City Center',
      useCurrentGps: 'Use Current GPS',
      detectingGps: 'Locating...',
      useCityFallback: 'Use City Center',
      kmAway: 'away',
      outsideRadiusTitle: 'Outside 72 km Radius',
      outsideRadiusMessage:
        'Events can only be viewed and acted upon (attending, sharing, adding to calendar, or directions) within 72 km of your current location.',
      noEventsInRadius: 'No community events found within 72 km of your current location.',
      allWithinRadius: 'All within 72 km',
    },
  },
  hi: {
    appName: 'शिया अपडेट्स',
    tagline: 'सामुदायिक कार्यक्रम और उपस्थिति',
    nav: {
      home: 'होम',
      explore: 'खोजें',
      calendar: 'कैलेंडर',
      myEvents: 'मेरे कार्यक्रम',
      profile: 'प्रोफ़ाइल',
    },
    actions: {
      createEvent: 'कार्यक्रम जोड़ें',
      signIn: 'साइन इन करें',
      signInGoogle: 'Google से जारी रखें',
      loginOrSignup: 'लॉगिन / साइन-अप',
      signOut: 'साइन आउट',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      edit: 'संपादित करें',
      publish: 'प्रकाशित करें',
      saveDraft: 'ड्राफ़्ट सहेजें',
      cancelEvent: 'कार्यक्रम रद्द करें',
      viewAll: 'सभी देखें',
      getDirections: 'दिशा-निर्देश',
      addToCalendar: 'कैलेंडर में जोड़ें',
      share: 'साझा करें',
      copyLink: 'लिंक कॉपी करें',
      linkCopied: 'लिंक कॉपी हो गया!',
      donate: 'दान करें',
      promoteBusiness: 'व्यवसाय प्रचार',
      organizerStudio: 'आयोजक डैशबोर्ड',
      adminPanel: 'एडमिन पैनल',
      detectLocation: 'शहर पहचानें',
      back: 'वापस',
      close: 'बंद करें',
      submit: 'जमा करें',
      approve: 'स्वीकृत करें',
      reject: 'अस्वीकार करें',
      delete: 'हटाएं',
      exportCsv: 'CSV डाउनलोड',
      continue: 'आगे बढ़ें',
    },
    auth: {
      modalTitle: 'लॉगिन या साइन-अप करें',
      modalSubtitle: 'Google से जारी रखें या अपने ईमेल और संपर्क विवरण से मैन्युअल रूप से पंजीकरण करें।',
      loginTab: 'लॉगिन',
      registerTab: 'पंजीकरण',
      orDivider: 'या ईमेल और संपर्क विवरण का उपयोग करें',
      emailLabel: 'ईमेल पता',
      passwordLabel: 'पासवर्ड',
      passwordHint: 'कम से कम 6 अक्षर',
      contactDetailsLabel: 'मोबाइल / संपर्क नंबर',
      loginButton: 'ईमेल से लॉगिन करें',
      registerButton: 'खाता बनाएं',
      forgotPassword: 'पासवर्ड भूल गए?',
      resetSent: 'आपके ईमेल पर पासवर्ड रीसेट लिंक भेजा गया है।',
      verifyTitle: 'अपना ईमेल सत्यापित करें',
      verifyMessage: 'हमने आपके ईमेल पर एक सत्यापन लिंक भेजा है। कृपया इनबॉक्स में लिंक खोलें और फिर नीचे रीफ़्रेश दबाएं।',
      resendVerify: 'सत्यापन ईमेल पुनः भेजें',
      refreshVerify: 'मैंने सत्यापित किया — रीफ़्रेश करें',
      verifyResent: 'सत्यापन ईमेल पुनः भेजा गया है। कृपया अपना इनबॉक्स जांचें।',
      verifyStillPending: 'सत्यापन अभी तक पूर्ण नहीं हुआ है। कृपया पहले अपने ईमेल में दिए गए लिंक पर क्लिक करें।',
    },
    audience: {
      all: 'सभी कार्यक्रम',
      women: 'महिलाएं',
      men: 'पुरुष',
      both: 'दोनों',
      womenOnly: 'केवल महिलाएं',
      menOnly: 'केवल पुरुष',
      forBoth: 'महिलाएं और पुरुष',
    },
    home: {
      todaysEvents: 'आज के कार्यक्रम',
      upcomingEvents: 'आगामी कार्यक्रम',
      popularEvents: 'प्रमुख सामुदायिक कार्यक्रम',
      browseCategories: 'श्रेणी के अनुसार देखें',
      sponsored: 'प्रायोजित',
      communityGraphic: 'सामुदायिक सूचना',
      announcement: 'घोषणा',
      noTodayEvents: 'आज इन फ़िल्टर के अनुसार कोई कार्यक्रम नहीं है।',
      noUpcomingEvents: 'चयनित फ़िल्टर के लिए कोई आगामी कार्यक्रम नहीं मिला।',
      allCitiesPrompt: 'शहर में कार्यक्रम:',
      eventsInCity: 'कार्यक्रम —',
    },
    explore: {
      searchPlaceholder: 'मजलिस, स्थान, ज़ाकिर या आयोजक खोजें...',
      allCities: 'सभी शहर',
      allCategories: 'सभी श्रेणियां',
      upcomingTab: 'आगामी',
      pastHistoryTab: 'पिछले कार्यक्रम (इतिहास)',
      foodAvailableOnly: 'तबर्रुक / नियाज़ उपलब्ध',
      filterByDate: 'तारीख़ से फ़िल्टर करें',
      noResults: 'कोई मेल खाने वाला कार्यक्रम नहीं मिला।',
    },
    calendar: {
      title: 'सामुदायिक कैलेंडर',
      subtitle: 'कार्यक्रम देखने के लिए किसी भी चिह्नित तारीख़ पर टैप करें',
      eventsOnDate: 'तारीख़ के कार्यक्रम:',
      noEventsOnDate: 'इस तारीख़ को कोई कार्यक्रम निर्धारित नहीं है।',
      multiDay: 'बहु-दिवसीय',
      today: 'आज',
    },
    details: {
      attendanceHeading: 'क्या आप इस कार्यक्रम में शामिल होंगे?',
      attendanceSubheading: 'आपकी पुष्टि से आयोजकों को भोजन, पानी और बैठने की सही व्यवस्था करने में मदद मिलती है।',
      yesLabel: 'हाँ – मैं आऊँगा / आऊँगी',
      noLabel: 'नहीं – मैं नहीं आऊँगा',
      maybeLabel: 'शायद – आ सकता हूँ',
      yesShort: 'हाँ',
      maybeShort: 'शायद',
      noShort: 'नहीं',
      confirmedEstimate: 'पुष्ट उपस्थिति (हाँ)',
      maybeNote: 'शायद उत्तर अलग से गिने जाते हैं और पुष्ट उपस्थिति में शामिल नहीं होते।',
      totalResponses: 'कुल प्रतिक्रियाएं',
      dateAndTime: 'तारीख़ और समय',
      duration: 'अवधि',
      preacher: 'ज़ाकिर / वक्ता',
      organizer: 'आयोजक',
      venueAndMap: 'स्थान और पता',
      contact: 'संपर्क',
      foodAndNiyaz: 'भोजन व तबर्रुक',
      foodProvided: 'तबर्रुक / नियाज़ की व्यवस्था है',
      noFoodInfo: 'भोजन व्यवस्था की जानकारी नहीं है',
      additionalNotes: 'अतिरिक्त जानकारी',
      signInToRsvp: 'उपस्थिति दर्ज करने के लिए लॉगिन या साइन-अप करें',
      cancelledBanner: 'आयोजक द्वारा यह कार्यक्रम रद्द कर दिया गया है।',
      pastBanner: 'यह कार्यक्रम समाप्त हो चुका है और इतिहास में सुरक्षित है।',
    },
    myEvents: {
      attendingYes: 'शामिल (हाँ)',
      attendingMaybe: 'शायद',
      createdByMe: 'मेरे बनाए हुए',
      history: 'इतिहास',
      emptyAttending: 'आपने अभी तक किसी आगामी कार्यक्रम के लिए हाँ नहीं चुना है।',
      emptyMaybe: 'शायद के रूप में कोई कार्यक्रम चिह्नित नहीं है।',
      emptyCreated: 'आपने अभी तक कोई कार्यक्रम नहीं बनाया है।',
      emptyHistory: 'इतिहास में कोई पिछला कार्यक्रम नहीं है।',
    },
    organizer: {
      title: 'आयोजक डैशबोर्ड',
      subtitle: 'कार्यक्रम प्रकाशित करें और वास्तविक समय में उपस्थिति अनुमान देखें',
      upcoming: 'आगामी',
      past: 'पिछले कार्यक्रम',
      published: 'प्रकाशित',
      drafts: 'ड्राफ़्ट',
      cancelled: 'रद्द',
      attendanceReports: 'उपस्थिति रिपोर्ट',
      estimatedAttendees: 'अनुमानित पुष्ट उपस्थित लोग (हाँ)',
      retentionNote: 'समाप्त कार्यक्रम स्वतः पिछले कार्यक्रम अनुभाग में चले जाते हैं।',
    },
    profile: {
      title: 'प्रोफ़ाइल और सेटिंग्स',
      fullName: 'पूरा नाम',
      mobile: 'मोबाइल नंबर',
      email: 'ईमेल पता',
      gender: 'लिंग',
      male: 'पुरुष',
      female: 'महिला',
      preferNotToSay: 'नहीं बताना चाहते',
      city: 'चयनित शहर',
      language: 'पसंदीदा भाषा',
      notifications: 'सूचनाएं और अलर्ट',
      cityAlerts: 'मेरे शहर के नए कार्यक्रम',
      eventReminders: 'कार्यक्रम अनुस्मारक व बदलाव',
      privacy: 'गोपनीयता सेटिंग्स',
      showProfileToOrganizers: 'व्यक्तिगत उपस्थिति निजी रखें',
      savedSuccess: 'सेटिंग्स सफलतापूर्वक सहेजी गईं।',
    },
    onboarding: {
      welcomeTitle: 'शिया अपडेट्स में आपका स्वागत है',
      chooseLanguage: 'अपनी पसंदीदा भाषा चुनें',
      setupProfile: 'अपनी सामुदायिक प्रोफ़ाइल पूरी करें',
      selectCity: 'अपना शहर चुनें',
      completeSetup: 'ऐप खोलें',
    },
    donation: {
      title: 'समुदाय का सहयोग करें',
      subtitle: 'आपका स्वैच्छिक सहयोग सामुदायिक आयोजनों और मंच संचालन में मदद करता है।',
      purposeLabel: 'सहयोग का उद्देश्य',
      purposes: {
        general_community: 'सामुदायिक कल्याण',
        majlis_niyaz: 'मजलिस व नियाज़ व्यवस्था',
        platform_support: 'शिया अपडेट्स मंच सहयोग',
      },
      amountLabel: 'राशि (INR)',
      methodLabel: 'भुगतान का माध्यम',
      confirmButton: 'सहयोग पूरा करें',
      receiptTitle: 'सहयोग दर्ज किया गया',
      receiptMessage: 'आपके उदार सहयोग के लिए धन्यवाद। रसीद आपके खाते में सुरक्षित है।',
      yourHistory: 'आपका पिछला सहयोग',
    },
    ads: {
      title: 'अपने व्यवसाय का प्रचार करें',
      subtitle: 'एडमिन समीक्षा के लिए बैनर अनुरोध भेजें। स्वीकृत विज्ञापन प्रायोजित लेबल के साथ दिखेंगे।',
      businessName: 'व्यवसाय का नाम',
      businessCategory: 'व्यवसाय श्रेणी',
      contactDetails: 'संपर्क फ़ोन / ईमेल',
      bannerTitle: 'बैनर शीर्षक',
      bannerSubtitle: 'संक्षिप्त विवरण',
      websiteLink: 'वेबसाइट या इंस्टाग्राम लिंक',
      duration: 'अवधि',
      placement: 'स्थान',
      submitRequest: 'स्वीकृति के लिए भेजें',
      myRequests: 'आपके विज्ञापन अनुरोध',
    },
    admin: {
      title: 'एडमिन कंट्रोल पैनल',
      overview: 'सारांश',
      events: 'कार्यक्रम प्रबंधन',
      categories: 'श्रेणियां',
      banners: 'विज्ञापन व बैनर',
      cities: 'शहर',
      users: 'उपयोगकर्ता',
      reports: 'उपस्थिति रिपोर्ट',
      donations: 'दान रिकॉर्ड',
      notifications: 'सूचनाएं भेजें',
      settings: 'नीति व सेटिंग्स',
    },
    statusLabels: {
      draft: 'ड्राफ़्ट',
      published: 'प्रकाशित',
      cancelled: 'रद्द',
      completed: 'संपन्न',
      pending: 'समीक्षाधीन',
      active: 'सक्रिय',
      inactive: 'निष्क्रिय',
      approved: 'स्वीकृत',
      rejected: 'अस्वीकृत',
    },
    location: {
      withinRadius: '72 किमी दायरे में:',
      gpsActive: 'वर्तमान GPS स्थान',
      cityReference: 'शहर केंद्र',
      useCurrentGps: 'वर्तमान GPS उपयोग करें',
      detectingGps: 'स्थान खोजा जा रहा है...',
      useCityFallback: 'शहर केंद्र उपयोग करें',
      kmAway: 'दूर',
      outsideRadiusTitle: '72 किमी दायरे से बाहर',
      outsideRadiusMessage:
        'कार्यक्रम केवल आपके वर्तमान स्थान के 72 किमी के दायरे में ही देखे जा सकते हैं और उन पर कार्रवाई (उपस्थिति, साझा करना, कैलेंडर या दिशा-निर्देश) की जा सकती है।',
      noEventsInRadius: 'आपके वर्तमान स्थान के 72 किमी के भीतर कोई कार्यक्रम नहीं मिला।',
      allWithinRadius: '72 किमी के भीतर सभी',
    },
  },
  ur: {
    appName: 'شیعہ اپڈیٹس',
    tagline: 'کمیونٹی پروگرامز اور حاضری کی منصوبہ بندی',
    nav: {
      home: 'ہوم',
      explore: 'تلاش کریں',
      calendar: 'کیلنڈر',
      myEvents: 'میرے پروگرام',
      profile: 'پروفائل',
    },
    actions: {
      createEvent: 'نیا پروگرام بنائیں',
      signIn: 'سائن ان کریں',
      signInGoogle: 'Google کے ساتھ جاری رکھیں',
      loginOrSignup: 'لاگ ان / سائن اپ',
      signOut: 'سائن آؤٹ',
      save: 'محفوظ کریں',
      cancel: 'منسوخ کریں',
      edit: 'ترمیم کریں',
      publish: 'شائع کریں',
      saveDraft: 'ڈرافٹ محفوظ کریں',
      cancelEvent: 'پروگرام منسوخ کریں',
      viewAll: 'سب دیکھیں',
      getDirections: 'راستہ دیکھیں',
      addToCalendar: 'کیلنڈر میں شامل کریں',
      share: 'شیئر کریں',
      copyLink: 'لنک کاپی کریں',
      linkCopied: 'لنک کاپی ہو گیا!',
      donate: 'عطیہ دیں',
      promoteBusiness: 'کاروبار کی تشہیر',
      organizerStudio: 'منتظم ڈیش بورڈ',
      adminPanel: 'ایڈمن پینل',
      detectLocation: 'شہر تلاش کریں',
      back: 'واپس',
      close: 'بند کریں',
      submit: 'جمع کرائیں',
      approve: 'منظور کریں',
      reject: 'مسترد کریں',
      delete: 'حذف کریں',
      exportCsv: 'CSV ڈاؤن لوڈ',
      continue: 'آگے بڑھیں',
    },
    auth: {
      modalTitle: 'لاگ ان یا سائن اپ کریں',
      modalSubtitle: 'Google کے ساتھ جاری رکھیں یا اپنے ای میل اور رابطہ تفصیلات کے ذریعے دستی رجسٹریشن کریں۔',
      loginTab: 'لاگ ان',
      registerTab: 'رجسٹریشن',
      orDivider: 'یا ای میل اور رابطہ نمبر استعمال کریں',
      emailLabel: 'ای میل پتہ',
      passwordLabel: 'پاس ورڈ',
      passwordHint: 'کم از کم 6 حروف',
      contactDetailsLabel: 'موبائل / رابطہ نمبر',
      loginButton: 'ای میل سے لاگ ان کریں',
      registerButton: 'اکاؤنٹ بنائیں',
      forgotPassword: 'پاس ورڈ بھول گئے؟',
      resetSent: 'پاس ورڈ ری سیٹ لنک آپ کے ای میل پر بھیج دیا گیا ہے۔',
      verifyTitle: 'اپنا ای میل پتہ تصدیق کریں',
      verifyMessage: 'ہم نے آپ کے ای میل پر تصدیقی لنک بھیجا ہے۔ براہ کرم لنک کھولیں اور پھر نیچے ریفریش پر کلک کریں۔',
      resendVerify: 'تصدیقی ای میل دوبارہ بھیجیں',
      refreshVerify: 'تصدیق ہو گئی — ریفریش کریں',
      verifyResent: 'تصدیقی ای میل دوبارہ بھیج دیا گیا ہے۔ براہ کرم ان باکس چیک کریں۔',
      verifyStillPending: 'ابھی تصدیق موصول نہیں ہوئی۔ براہ کرم پہلے اپنے ای میل میں موجود لنک پر کلک کریں۔',
    },
    audience: {
      all: 'تمام پروگرام',
      women: 'خواتین',
      men: 'مرد حضرات',
      both: 'دونوں',
      womenOnly: 'صرف خواتین',
      menOnly: 'صرف مرد حضرات',
      forBoth: 'خواتین و حضرات',
    },
    home: {
      todaysEvents: 'آج کے پروگرام',
      upcomingEvents: 'آنے والے پروگرام',
      popularEvents: 'اہم کمیونٹی پروگرام',
      browseCategories: 'زمرے کے مطابق دیکھیں',
      sponsored: 'اسپانسرڈ',
      communityGraphic: 'کمیونٹی اپڈیٹ',
      announcement: 'اعلان',
      noTodayEvents: 'آج ان فلٹرز کے مطابق کوئی پروگرام موجود نہیں۔',
      noUpcomingEvents: 'منتخب کردہ فلٹرز کے لیے کوئی آنے والا پروگرام نہیں ملا۔',
      allCitiesPrompt: 'منتخب شہر کے پروگرام:',
      eventsInCity: 'پروگرام —',
    },
    explore: {
      searchPlaceholder: 'مجلس، مقام، ذاکر یا منتظم تلاش کریں...',
      allCities: 'تمام شہر',
      allCategories: 'تمام زمرے',
      upcomingTab: 'آنے والے',
      pastHistoryTab: 'گزشتہ پروگرام (تاریخ)',
      foodAvailableOnly: 'تبرک / نیاز دستیاب',
      filterByDate: 'تاریخ کے لحاظ سے فلٹر',
      noResults: 'کوئی پروگرام نہیں ملا۔ براہ کرم فلٹر تبدیل کر کے دیکھیں۔',
    },
    calendar: {
      title: 'کمیونٹی کیلنڈر',
      subtitle: 'پروگرام دیکھنے کے لیے کسی بھی نمایاں تاریخ پر ٹیپ کریں',
      eventsOnDate: 'تاریخ کے پروگرام:',
      noEventsOnDate: 'اس تاریخ کو کوئی پروگرام طے نہیں ہے۔',
      multiDay: 'کئی دن',
      today: 'آج',
    },
    details: {
      attendanceHeading: 'کیا آپ اس پروگرام میں شرکت کریں گے؟',
      attendanceSubheading: 'آپ کے جواب سے منتظمین کو کھانے، پانی اور بیٹھنے کے مناسب انتظام میں مدد ملتی ہے۔',
      yesLabel: 'ہاں – میں شرکت کروں گا / کروں گی',
      noLabel: 'نہیں – میں شرکت نہیں کروں گا',
      maybeLabel: 'شاید – آ سکتا ہوں',
      yesShort: 'ہاں',
      maybeShort: 'شاید',
      noShort: 'نہیں',
      confirmedEstimate: 'متوقع حاضری (ہاں)',
      maybeNote: 'شاید کے جوابات الگ شمار ہوتے ہیں اور حتمی حاضری میں شامل نہیں کیے جاتے۔',
      totalResponses: 'کل جوابات',
      dateAndTime: 'تاریخ اور وقت',
      duration: 'دورانیہ',
      preacher: 'ذاکر / مقرر',
      organizer: 'منتظم',
      venueAndMap: 'مقام اور پتہ',
      contact: 'رابطہ نمبر',
      foodAndNiyaz: 'تبرک و ضیافت',
      foodProvided: 'تبرک / نیاز کا انتظام موجود ہے',
      noFoodInfo: 'ضیافت کی تفصیل درج نہیں',
      additionalNotes: 'مزید معلومات',
      signInToRsvp: 'حاضری درج کرنے کے لیے لاگ ان یا سائن اپ کریں',
      cancelledBanner: 'منتظم کی جانب سے یہ پروگرام منسوخ کر دیا گیا ہے۔',
      pastBanner: 'یہ پروگرام مکمل ہو چکا ہے اور تاریخ میں محفوظ ہے۔',
    },
    myEvents: {
      attendingYes: 'شرکت (ہاں)',
      attendingMaybe: 'شاید',
      createdByMe: 'میرے بنائے ہوئے',
      history: 'سابقہ پروگرام',
      emptyAttending: 'آپ نے ابھی تک کسی آنے والے پروگرام کے لیے ہاں منتخب نہیں کیا۔',
      emptyMaybe: 'شاید کے طور پر کوئی پروگرام محفوظ نہیں۔',
      emptyCreated: 'آپ نے ابھی تک کوئی پروگرام نہیں بنایا۔',
      emptyHistory: 'آپ کی تاریخ میں کوئی گزشتہ پروگرام موجود نہیں۔',
    },
    organizer: {
      title: 'منتظم ڈیش بورڈ',
      subtitle: 'پروگرام شائع کریں اور حاضری کے اعدادوشمار دیکھیں',
      upcoming: 'آنے والے',
      past: 'گزشتہ پروگرام',
      published: 'شائع شدہ',
      drafts: 'ڈرافٹس',
      cancelled: 'منسوخ شدہ',
      attendanceReports: 'حاضری رپورٹس',
      estimatedAttendees: 'متوقع شرکاء (ہاں)',
      retentionNote: 'مکمل شدہ پروگرام خودکار طور پر گزشتہ پروگرامز میں منتقل ہو جاتے ہیں۔',
    },
    profile: {
      title: 'پروفائل اور ترتیبات',
      fullName: 'پورا نام',
      mobile: 'موبائل نمبر',
      email: 'ای میل پتہ',
      gender: 'جنس',
      male: 'مرد',
      female: 'خاتون',
      preferNotToSay: 'ظاہر نہ کریں',
      city: 'منتخب شہر',
      language: 'پسندیدہ زبان',
      notifications: 'اطلاعات اور الرٹس',
      cityAlerts: 'میرے شہر کے نئے پروگرام',
      eventReminders: 'پروگرام کی یاد دہانی اور تبدیلیاں',
      privacy: 'رازداری کی ترتیبات',
      showProfileToOrganizers: 'انفرادی حاضری نجی رکھیں',
      savedSuccess: 'ترتیبات کامیابی سے محفوظ ہو گئیں۔',
    },
    onboarding: {
      welcomeTitle: 'شیعہ اپڈیٹس میں خوش آمدید',
      chooseLanguage: 'اپنی پسندیدہ زبان منتخب کریں',
      setupProfile: 'اپنا کمیونٹی پروفائل مکمل کریں',
      selectCity: 'اپنا بنیادی شہر منتخب کریں',
      completeSetup: 'ایپ شروع کریں',
    },
    donation: {
      title: 'کمیونٹی کی معاونت کریں',
      subtitle: 'آپ کا رضاکارانہ تعاون کمیونٹی پروگرامز اور پلیٹ فارم کے انتظام میں مددگار ہے۔',
      purposeLabel: 'تعاون کا مقصد',
      purposes: {
        general_community: 'عمومی کمیونٹی فلاح',
        majlis_niyaz: 'مجلس و نیاز کے انتظامات',
        platform_support: 'شیعہ اپڈیٹس پلیٹ فارم تعاون',
      },
      amountLabel: 'رقم (INR)',
      methodLabel: 'ادائیگی کا طریقہ',
      confirmButton: 'تعاون مکمل کریں',
      receiptTitle: 'تعاون محفوظ ہو گیا',
      receiptMessage: 'آپ کے تعاون کا شکریہ۔ آپ کی نجی رسید اکاؤنٹ میں محفوظ ہے۔',
      yourHistory: 'آپ کی گزشتہ معاونت',
    },
    ads: {
      title: 'اپنے کاروبار کی تشہیر کریں',
      subtitle: 'ایڈمن کی منظوری کے لیے بینر جمع کرائیں۔ منظور شدہ اشتہارات اسپانسرڈ لیبل کے ساتھ دکھائے جائیں گے۔',
      businessName: 'کاروبار کا نام',
      businessCategory: 'کاروبار کی قسم',
      contactDetails: 'رابطہ فون / ای میل',
      bannerTitle: 'بینر کا عنوان',
      bannerSubtitle: 'مختصر تفصیل',
      websiteLink: 'ویب سائٹ یا انسٹاگرام لنک',
      duration: 'مدت',
      placement: 'مقام',
      submitRequest: 'منظوری کے لیے بھیجیں',
      myRequests: 'آپ کی اشتہاری درخواستیں',
    },
    admin: {
      title: 'ایڈمن کنٹرول پینل',
      overview: 'جائزہ',
      events: 'پروگرامز اور منظوری',
      categories: 'زمرے',
      banners: 'اشتہارات اور بینرز',
      cities: 'شہر',
      users: 'صارفین اور اختیارات',
      reports: 'حاضری رپورٹس',
      donations: 'عطیات کا ریکارڈ',
      notifications: 'اطلاعات بھیجیں',
      settings: 'پالیسی اور ترتیبات',
    },
    statusLabels: {
      draft: 'ڈرافٹ',
      published: 'شائع شدہ',
      cancelled: 'منسوخ',
      completed: 'مکمل',
      pending: 'زیرِ جائزہ',
      active: 'فعال',
      inactive: 'غیر فعال',
      approved: 'منظور شدہ',
      rejected: 'مسترد',
    },
    location: {
      withinRadius: '72 کلومیٹر کے دائرے میں:',
      gpsActive: 'موجودہ GPS مقام',
      cityReference: 'شہر کا مرکز',
      useCurrentGps: 'موجودہ GPS استعمال کریں',
      detectingGps: 'مقام تلاش کیا جا رہا ہے...',
      useCityFallback: 'شہر کا مرکز استعمال کریں',
      kmAway: 'دور',
      outsideRadiusTitle: '72 کلومیٹر کے دائرے سے باہر',
      outsideRadiusMessage:
        'پروگرام صرف آپ کے موجودہ مقام سے 72 کلومیٹر کے دائرے میں ہی دیکھے جا سکتے ہیں اور ان پر کارروائی (شرکت، شیئرنگ، کیلنڈر یا راستہ) کی جا سکتی ہے۔',
      noEventsInRadius: 'آپ کے موجودہ مقام سے 72 کلومیٹر کے اندر کوئی پروگرام نہیں ملا۔',
      allWithinRadius: '72 کلومیٹر کے اندر تمام',
    },
  },
};
