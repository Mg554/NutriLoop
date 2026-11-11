const g = (m, f) => ({ m, f })
export const ISLAND_STR = {
  ar: {
    isTitle: 'جزيرة الإنجاز', isLeft: 'باقي {n} يوم للكنز', isReached: 'وصلت للكنز! 🎉', isReachedF: 'وصلتِ للكنز! 🎉',
    isPrize: 'الجائزة', isSurprise: 'مفاجأة من الأهل 🤫', isRing: 'طوق النجاة جاهز',
    isToday: g('شروط اليوم: كمّلهم وببني خطوة جديدة', 'شروط اليوم: كمّليهم وبنبني خطوة جديدة'),
    isTodayDone: 'خطوة اليوم انبنت!', isWaiting: g('الجزيرة استنّتك وكل اللي بنيته محفوظ. يلا نكمّل اليوم!', 'الجزيرة استنّتك وكل اللي بنيتيه محفوظ. يلا نكمّل اليوم!'), isWon: g('برافو! خبّر أهلك عن الجائزة', 'برافو! خبّري أهلك عن الجائزة'),
  },
  en: {
    isTitle: 'Streak Island', isLeft: '{n} days to the treasure', isReached: 'You reached the treasure! 🎉', isReachedF: 'You reached the treasure! 🎉',
    isPrize: 'Prize', isSurprise: 'A surprise from your parents 🤫', isRing: 'Life ring ready',
    isToday: "Today's conditions: finish them to build a step", isTodayDone: "Today's step is built!", isWaiting: 'The island waited for you and everything you built is safe. Let\'s continue today!', isWon: 'Well done! Tell your parents about the prize',
  },
}
