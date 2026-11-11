// strings for meals / eaten check / snacks (keys start with "ml")
const g = (m, f) => ({ m, f })
export const MEAL_STR = {
  ar: {
    mlBreakfast: 'فطور', mlLunch: 'غدا', mlDinner: 'عشا', mlSnack: 'سناك',
    mlSaveSnack: 'احفظ السناك 🍎', mlNeedOne: 'اختار أكلة وحدة على الأقل',
    mlWhatAte: g('شو أكلت من طبقك؟', 'شو أكلتِ من طبقك؟'), mlWhatAteSub: g('قلّي بصراحة، كل جواب إله نجوم ✨', 'قلّيلي بصراحة، كل جواب إله نجوم ✨'),
    mlAll: 'كله', mlHalf: 'نصه', mlNone: 'ما أكلته', mlSaveEaten: 'تمام، احفظ',
    mlThanks: g('شكرًا على صراحتك يا بطل 💛', 'شكرًا على صراحتك يا بطلة 💛'),
    mlPendingCard: g('عندك طبق لسا ما قلتلي شو أكلت منه', 'عندك طبق لسا ما قلتيلي شو أكلتِ منه'),
    mlTell: 'قلّي', mlQuickSnack: 'سناك سريع', mlQuickSnackSub: g('أكلت إشي بين الوجبات؟ اكبس عليه', 'أكلتِ إشي بين الوجبات؟ اكبسي عليه'),
    mlSnackSaved: 'انحفظ السناك 🍎', mlEaten: 'انأكل', mlNotChecked: 'لسا ما تسجّل شو انأكل', mlEdit: 'عدّل شو انأكل',
    mlConfirmed: 'أكّده الأهل', mlConfirm: 'تأكيد', mlDelete: 'حذف', mlDeleteQ: 'أكيد بدك تحذف هالطبق؟',
  },
  en: {
    mlBreakfast: 'Breakfast', mlLunch: 'Lunch', mlDinner: 'Dinner', mlSnack: 'Snack',
    mlSaveSnack: 'Save snack 🍎', mlNeedOne: 'Pick at least one food',
    mlWhatAte: 'What did you eat from your plate?', mlWhatAteSub: 'Tell the truth: every answer earns stars ✨',
    mlAll: 'All', mlHalf: 'Half', mlNone: 'None', mlSaveEaten: 'OK, save',
    mlThanks: 'Thanks for being honest, hero 💛',
    mlPendingCard: "You haven't told me what you ate from a plate yet",
    mlTell: 'Tell me', mlQuickSnack: 'Quick snack', mlQuickSnackSub: 'Ate something between meals? Tap it',
    mlSnackSaved: 'Snack saved 🍎', mlEaten: 'eaten', mlNotChecked: 'Not checked yet', mlEdit: 'Edit what was eaten',
    mlConfirmed: 'Confirmed by parent', mlConfirm: 'Confirm', mlDelete: 'Delete', mlDeleteQ: 'Delete this plate?',
  },
}
