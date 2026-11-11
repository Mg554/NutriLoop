// ---------------------------------------------------------------------------
// Movement module content. Every exercise is time-based (kids don't count reps
// reliably). `anim` picks the CSS animation of the big emoji in the runner.
// `hard` exercises get a shorter duration. Text that addresses the child is { m, f }.
// ---------------------------------------------------------------------------
const g = (m, f) => ({ m, f })

export const EXERCISES = {
  // --- school morning: calm stretching + breathing ---
  reach: { emoji: '🙆', anim: 'stretch', name: { ar: 'سارية العلم', en: 'Flagpole Reach' }, how: { ar: g('مدّ إيديك لفوق قد ما تقدر متل سارية العلم', 'مدّي إيديكِ لفوق قد ما تقدري متل سارية العلم'), en: 'Reach up as tall as a flagpole' } },
  toes: { emoji: '🙇', anim: 'bow', name: { ar: 'المس أصابعك', en: 'Toe Touch' }, how: { ar: g('انزل بهدوء والمس أصابع رجليك', 'انزلي بهدوء والمسي أصابع رجليكِ'), en: 'Bend slowly and touch your toes' } },
  circles: { emoji: '🚌', anim: 'spin', name: { ar: 'عجلات الباص', en: 'Bus Wheels' }, how: { ar: g('دوّر إيديك متل عجلات باص المدرسة', 'دوّري إيديكِ متل عجلات باص المدرسة'), en: 'Circle your arms like school bus wheels' } },
  side: { emoji: '🕰️', anim: 'sway', name: { ar: 'عقارب الساعة', en: 'Clock Hands' }, how: { ar: g('ميل يمين وشمال متل عقارب الساعة', 'ميلي يمين وشمال متل عقارب الساعة'), en: 'Lean left and right like clock hands' } },
  breath: { emoji: '🌬️', anim: 'breathe', name: { ar: 'تنفّس الهدوء', en: 'Calm Breathing' }, how: { ar: g('شهيق من أنفك ٤ ثواني… وزفير بهدوء', 'شهيق من أنفكِ ٤ ثواني… وزفير بهدوء'), en: 'Breathe in for 4… breathe out slowly' } },
  // --- study break (after homework / at the desk) ---
  neck: { emoji: '🧑‍🎓', anim: 'sway', name: { ar: 'دوران الراس', en: 'Neck Rolls' }, how: { ar: g('دوّر راسك بهدوء، مرة لكل جهة', 'دوّري راسكِ بهدوء، مرة لكل جهة'), en: 'Roll your head gently each way' } },
  shoulders: { emoji: '🎒', anim: 'shrug', name: { ar: 'شنطة المدرسة', en: 'Backpack Shrugs' }, how: { ar: g('ارفع كتافك لأذنيك ونزّلها، كأنك حامل شنطة', 'ارفعي كتافكِ لأذنيكِ ونزّليها، كأنكِ حاملة شنطة'), en: 'Lift your shoulders up and drop them' } },
  march: { emoji: '🏫', anim: 'march', name: { ar: 'طابور الصباح', en: 'Morning Line March' }, how: { ar: g('امشي بمكانك وارفع ركبك متل طابور الصباح', 'امشي بمكانكِ وارفعي ركبكِ متل طابور الصباح'), en: 'March in place, knees up high' } },
  shake: { emoji: '🫨', anim: 'shake', name: { ar: 'نفّض التعب', en: 'Shake It Off' }, how: { ar: g('هزّ إيديك ورجليك وطيّر التعب', 'هزّي إيديكِ ورجليكِ وطيّري التعب'), en: 'Shake your arms and legs loose' } },
  hops: { emoji: '✏️', anim: 'jump', name: { ar: 'نطّات القلم', en: 'Pencil Hops' }, how: { ar: g('نط نطّات صغيرة وإنت مستقيم متل القلم', 'نطّي نطّات صغيرة وإنتِ مستقيمة متل القلم'), en: 'Small hops, straight as a pencil' } },
  // --- hero workout ---
  jacks: { emoji: '⭐', anim: 'jump', name: { ar: 'قفز النجمة', en: 'Star Jumps' }, how: { ar: g('نط وافتح إيديك ورجليك متل النجمة', 'نطّي وافتحي إيديكِ ورجليكِ متل النجمة'), en: 'Jump open like a star, then close' } },
  squats: { emoji: '🪑', anim: 'squat', name: { ar: 'الكرسي الخفي', en: 'Invisible Chair' }, how: { ar: g('انزل كأنك قاعد على كرسي وارجع اطلع', 'انزلي كأنكِ قاعدة على كرسي وارجعي اطلعي'), en: 'Sit on an invisible chair and stand up' } },
  knees: { emoji: '🏃', anim: 'march', name: { ar: 'ركض بالمكان', en: 'High Knees' }, how: { ar: g('اركض بمكانك وارفع ركبك عالي', 'اركضي بمكانكِ وارفعي ركبكِ عالي'), en: 'Run in place with high knees' } },
  plank: { emoji: '🌉', anim: 'hold', hard: true, name: { ar: 'الجسر القوي', en: 'Strong Bridge' }, how: { ar: g('اسند على إيديك وخلّي جسمك مستقيم متل الجسر', 'اسندي على إيديكِ وخلّي جسمكِ مستقيم متل الجسر'), en: 'Hold your body straight like a bridge' } },
  skip: { emoji: '🪢', anim: 'jump', name: { ar: 'نط الحبل', en: 'Jump Rope' }, how: { ar: g('نط كأنك ماسك حبل (أو بحبل حقيقي!)', 'نطّي كأنكِ ماسكة حبل (أو بحبل حقيقي!)'), en: 'Jump as if skipping rope' } },
  // --- strength 💪 ---
  wallsit: { emoji: '🧱', anim: 'hold', hard: true, name: { ar: 'الجلوس على الحيط', en: 'Wall Sit' }, how: { ar: g('سند ظهرك عالحيط وانزل كأنك قاعد على كرسي، واثبت', 'سندي ظهركِ عالحيط وانزلي كأنكِ قاعدة على كرسي، واثبتي'), en: 'Back on the wall, sit on an invisible chair and hold' } },
  kneepush: { emoji: '💪', anim: 'hold', hard: true, name: { ar: 'ضغط على الركب', en: 'Knee Push-ups' }, how: { ar: g('ركبك عالأرض، انزل بصدرك لتحت واطلع بهدوء', 'ركبكِ عالأرض، انزلي بصدركِ لتحت واطلعي بهدوء'), en: 'Knees down, lower your chest and push up slowly' } },
  lunges: { emoji: '🛡️', anim: 'squat', name: { ar: 'خطوة الفارس', en: 'Knight Lunges' }, how: { ar: g('خطوة كبيرة لقدّام وانزل بركبتك متل الفارس، وبدّل', 'خطوة كبيرة لقدّام وانزلي بركبتكِ متل الفارس، وبدّلي'), en: 'Big step forward, bend low like a knight, switch legs' } },
  calves: { emoji: '🦒', anim: 'stretch', name: { ar: 'الزرافة', en: 'Giraffe Calf Raises' }, how: { ar: g('اطلع على أطراف أصابعك متل الزرافة وانزل بهدوء', 'اطلعي على أطراف أصابعكِ متل الزرافة وانزلي بهدوء'), en: 'Rise onto your toes like a giraffe, then lower slowly' } },
  // --- cardio & fun 🏃 ---
  climber: { emoji: '⛰️', anim: 'march', hard: true, name: { ar: 'متسلّق الجبل', en: 'Mountain Climber' }, how: { ar: g('وضعية الجسر وقرّب ركبة ركبة لصدرك بسرعة', 'وضعية الجسر وقرّبي ركبة ركبة لصدركِ بسرعة'), en: 'In bridge position, drive one knee then the other to your chest' } },
  kicks: { emoji: '🦶', anim: 'march', name: { ar: 'ركل الخلف', en: 'Butt Kicks' }, how: { ar: g('اركض بمكانك وخلّي كعبك يلمس ورا', 'اركضي بمكانكِ وخلّي كعبكِ يلمس ورا'), en: 'Run in place, kick your heels up behind' } },
  skater: { emoji: '⛸️', anim: 'sway', name: { ar: 'المتزلّج', en: 'Skater Hops' }, how: { ar: g('نط يمين وشمال متل المتزلّج على الجليد', 'نطّي يمين وشمال متل المتزلّجة على الجليد'), en: 'Hop side to side like an ice skater' } },
  // --- balance & flexibility ⚖️ ---
  tree: { emoji: '🌳', anim: 'hold', name: { ar: 'وقفة الشجرة', en: 'Tree Pose' }, how: { ar: g('حط رجلك على ركبة الرجل الثانية وارفع إيديك متل الأغصان', 'حطّي رجلكِ على ركبة الرجل الثانية وارفعي إيديكِ متل الأغصان'), en: 'Foot on the other knee, arms up like branches' } },
  airplane: { emoji: '✈️', anim: 'hold', name: { ar: 'الطيّارة', en: 'Airplane' }, how: { ar: g('ميل لقدّام وارفع رجل لورا وافرد إيديك متل الطيّارة', 'ميلي لقدّام وارفعي رجل لورا وافردي إيديكِ متل الطيّارة'), en: 'Lean forward, lift one leg back, arms out like wings' } },
  // --- quiet, no jumping 🧩 ---
  touch: { emoji: '🙌', anim: 'stretch', name: { ar: 'كتاف وسما', en: 'Shoulders & Sky' }, how: { ar: g('المس كتافك، وبعدين ارفع إيديك للسما', 'المسي كتافكِ، وبعدين ارفعي إيديكِ للسما'), en: 'Touch your shoulders, then reach for the sky' } },
  punch: { emoji: '🥊', anim: 'shake', name: { ar: 'لكمات بطيئة', en: 'Slow Punches' }, how: { ar: g('لكمات لقدّام بهدوء، إيد ورا إيد', 'لكمات لقدّام بهدوء، إيد ورا إيد'), en: 'Slow punches forward, one arm after the other' } },
  // --- animal moves (used by the freeze game) ---
  frog: { emoji: '🐸', anim: 'jump', name: { ar: 'الضفدع', en: 'Frog' }, how: { ar: g('انزل ونط لقدّام متل الضفدع', 'انزلي ونطّي لقدّام متل الضفدع'), en: 'Squat and leap like a frog' } },
  bear: { emoji: '🐻', anim: 'march', name: { ar: 'الدب', en: 'Bear' }, how: { ar: g('امشي على إيديك ورجليك متل الدب', 'امشي على إيديكِ ورجليكِ متل الدب'), en: 'Walk on hands and feet like a bear' } },
  crab: { emoji: '🦀', anim: 'sway', name: { ar: 'السلطعون', en: 'Crab' }, how: { ar: g('امشي عالجنب متل السلطعون', 'امشي عالجنب متل السلطعون'), en: 'Walk sideways like a crab' } },
  penguin: { emoji: '🐧', anim: 'sway', name: { ar: 'البطريق', en: 'Penguin' }, how: { ar: g('لزّق إيديك بجنبك وامشي متل البطريق', 'لزّقي إيديكِ بجنبكِ وامشي متل البطريق'), en: 'Arms at your sides, waddle!' } },
  kangaroo: { emoji: '🦘', anim: 'jump', name: { ar: 'الكنغر', en: 'Kangaroo' }, how: { ar: g('نط نطّات كبيرة متل الكنغر', 'نطّي نطّات كبيرة متل الكنغر'), en: 'Big bouncy kangaroo jumps' } },
  flamingo: { emoji: '🦩', anim: 'hold', name: { ar: 'الفلامنغو', en: 'Flamingo' }, how: { ar: g('وقّف على رجل وحدة وما توقع!', 'وقّفي على رجل وحدة وما توقعي!'), en: "Stand on one leg, don't fall!" } },
  elephant: { emoji: '🐘', anim: 'stomp', name: { ar: 'الفيل', en: 'Elephant' }, how: { ar: g('دبّ برجليك عالأرض متل الفيل', 'دبّي برجليكِ عالأرض متل الفيل'), en: 'Stomp heavily like an elephant' } },
  rabbit: { emoji: '🐰', anim: 'jump', name: { ar: 'الأرنب', en: 'Rabbit' }, how: { ar: g('نطّات صغيرة سريعة متل الأرنب', 'نطّات صغيرة سريعة متل الأرنب'), en: 'Quick little bunny hops' } },
}

export const ANIMALS = ['frog', 'bear', 'crab', 'penguin', 'kangaroo', 'flamingo', 'elephant', 'rabbit']

// Routines = ordered exercise lists. `rest` = seconds between steps.
export const ROUTINES = [
  { id: 'morning', emoji: '🏫', color: 'from-sky-400 to-blue-600', xp: 30, rest: 5, steps: ['reach', 'toes', 'circles', 'side', 'breath'], title: { ar: 'روتين صباح المدرسة', en: 'School Morning' }, sub: { ar: 'إطالة وتنفّس قبل ما تطلع', en: 'Stretch & breathe before school' } },
  { id: 'study', emoji: '📚', color: 'from-violet-400 to-purple-600', xp: 25, rest: 5, steps: ['neck', 'shoulders', 'march', 'shake', 'hops'], title: { ar: 'استراحة الدراسة', en: 'Study Break' }, sub: { ar: 'بين الواجبات، ٣ دقايق نشاط', en: 'Between homework, 3 active minutes' } },
  { id: 'hero', emoji: '🦸', color: 'from-orange-400 to-red-500', xp: 40, rest: 10, steps: ['jacks', 'squats', 'knees', 'plank', 'skip'], title: { ar: 'تمرين الأبطال', en: 'Hero Workout' }, sub: { ar: 'تمرين قوة وطاقة', en: 'Strength & energy' } },
  { id: 'strong', emoji: '💪', color: 'from-rose-400 to-red-600', xp: 40, rest: 10, steps: ['wallsit', 'kneepush', 'lunges', 'calves', 'bear'], title: { ar: 'قوة العضلات', en: 'Muscle Power' }, sub: { ar: 'عضلات رجلين وإيدين وبطن', en: 'Legs, arms and core' } },
  { id: 'cardio', emoji: '🏃', color: 'from-amber-400 to-orange-600', xp: 40, rest: 8, steps: ['climber', 'kicks', 'skater', 'jacks', 'frog'], title: { ar: 'كارديو ومرح', en: 'Cardio Fun' }, sub: { ar: 'نبض سريع وضحك', en: 'Get the heart pumping' } },
  { id: 'balance', emoji: '⚖️', color: 'from-teal-400 to-cyan-600', xp: 30, rest: 5, steps: ['tree', 'airplane', 'flamingo', 'toes', 'side'], title: { ar: 'توازن ومرونة', en: 'Balance & Stretch' }, sub: { ar: 'ثبات ومدّ للعضلات', en: 'Steady and stretchy' } },
  { id: 'quiet', emoji: '🤫', color: 'from-indigo-400 to-slate-600', xp: 25, rest: 4, steps: ['march', 'touch', 'calves', 'punch', 'breath'], title: { ar: 'تمارين هادية', en: 'Quiet Moves' }, sub: { ar: 'بدون نط: للبيت وللّيل', en: 'No jumping: for flats and evenings' } },
  { id: 'animals', emoji: '🐸', color: 'from-emerald-400 to-green-600', xp: 35, rest: 4, freeze: true, random: 6, steps: ANIMALS, title: { ar: 'حيوانات وتجمّد!', en: 'Animals & Freeze!' }, sub: { ar: 'قلّد الحيوان… ولما يوقف: تجمّد 🧊', en: 'Copy the animal… then FREEZE 🧊' } },
]

// Seconds per exercise by age; hard ones are shorter.
export const exerciseSeconds = (ex, age) => {
  const base = age <= 5 ? 20 : age <= 9 ? 30 : 40
  return ex.hard ? Math.round(base * 0.6) : base
}

// Daily movement goal in minutes (WHO: 60 min/day for 5-17 y). Parent can change it.
export const moveGoalForAge = () => 60

// Outdoor play can be logged by tap (max twice a day).
export const OUTDOOR_MIN = 15

export const MOVE_STR = {
  ar: {
    workoutLeft: 'باقي من التمرين', moveLeft: 'باقي {n} د',
    move: 'الحركة',
    moveBattery: 'شاحن الحركة', minutes: 'دقيقة',
    hadith: '«المؤمنُ القويُّ خيرٌ وأحبُّ إلى اللهِ من المؤمنِ الضعيف» — رواه مسلم',
    routines: 'تمارين اليوم', single: 'تمرين واحد',
    outdoor: g('لعبت برّا ⚽', 'لعبت برّا ⚽'), outdoorSub: `+${OUTDOOR_MIN} دقيقة (مرتين باليوم)`,
    ready: g('جاهز؟', 'جاهزة؟'), go: 'يلا!', rest: 'استراحة', next: 'الجاي:',
    freeze: 'تجمّد! 🧊', freezeF: 'تجمّدي! 🧊',
    pause: 'إيقاف', resume: 'كمّل', skip: 'تخطّي', quit: 'خروج',
    half: 'نص الطريق!', done: g('برافو عليك! خلّصت 💪', 'برافو عليكِ! خلّصتي 💪'),
    step: 'تمرين', of: 'من', exStart: 'ابدأ', exStartF: 'ابدئي',
    xpCap: 'الـ XP من التمارين خلص لليوم، بس الحركة بتنحسب ✨',
    moveGoal: 'هدف الحركة (دقيقة)',
    moveAvg: 'معدل الحركة',
    camTitle: 'المدرب الذكي 🎥', camSub: g('الكاميرا بتعدّلك التمارين لحالها!', 'الكاميرا بتعدّلكِ التمارين لحالها!'),
    camLocked: 'اطلبوا من الأهل يفعّلوا الكاميرا من لوحة الأهل 🔒',
    camPrivacy: 'الفيديو ما بيطلع من الجهاز',
    camLoading: 'عم نجهّز المدرب الذكي…',
    camFrame: g('ارجع لورا لحتى يبين جسمك كامل', 'ارجعي لورا لحتى يبين جسمكِ كامل'),
    camHold: g('ممتاز! خليك هيك…', 'ممتاز! خليكِ هيك…'),
    camDenied: 'لازم تسمحوا للتطبيق يستخدم الكاميرا من إعدادات المتصفح',
    camNone: 'ما لقينا كاميرا على هالجهاز',
    camFail: 'ما قدرنا نشغّل المدرب الذكي على هالجهاز',
    camPreview: 'صفحة المعاينة ما بتسمح بالكاميرا 🙈 المدرب بيشتغل بالتطبيق المثبّت على اللابتوب أو الموبايل',
    reps: 'عدّة',
    camSetting: 'المدرب الذكي بالكاميرا',
  },
  en: {
    workoutLeft: 'Workout time left', moveLeft: '{n} min to go',
    move: 'Move',
    moveBattery: 'Move Battery', minutes: 'min',
    hadith: '“The strong believer is better and more beloved to Allah than the weak believer” — Muslim',
    routines: "Today's workouts", single: 'Single exercise',
    outdoor: 'Played outside ⚽', outdoorSub: `+${OUTDOOR_MIN} min (twice a day)`,
    ready: 'Ready?', go: 'Go!', rest: 'Rest', next: 'Next:',
    freeze: 'FREEZE! 🧊', freezeF: 'FREEZE! 🧊',
    pause: 'Pause', resume: 'Resume', skip: 'Skip', quit: 'Exit',
    half: 'Halfway!', done: 'Great job! You finished 💪',
    step: 'Exercise', of: 'of', exStart: 'Start', exStartF: 'Start',
    xpCap: 'Exercise XP is done for today, but minutes still count ✨',
    moveGoal: 'Move goal (min)',
    moveAvg: 'Avg movement',
    camTitle: 'Smart Coach 🎥', camSub: 'The camera counts your reps for you!',
    camLocked: 'Ask a parent to turn on the camera in the Parent dashboard 🔒',
    camPrivacy: 'Video never leaves this device',
    camLoading: 'Getting the smart coach ready…',
    camFrame: 'Step back so your whole body is visible',
    camHold: 'Great! Stay like that…',
    camDenied: 'Please allow camera access in the browser settings',
    camNone: 'No camera found on this device',
    camFail: "Couldn't start the smart coach on this device",
    camPreview: 'This preview page blocks the camera 🙈 The coach works in the installed app on the laptop or phone',
    reps: 'reps',
    camSetting: 'Camera smart coach',
  },
}
