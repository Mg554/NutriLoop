// ---------------------------------------------------------------------------
// Static content: foods, quests, badges, UI strings.
// Arabic strings that depend on the child's gender are { m, f } objects.
// ---------------------------------------------------------------------------

import { MOVE_STR } from './modules/move/data'
import { NIGHT_STR } from './modules/night/data'
import { RAMADAN_QUESTS, RAMADAN_STR } from './modules/ramadan/data'
import { ARCADE_STR } from './modules/arcade/strings'
import { MEAL_STR } from './modules/meals/strings'

// Plate sections (MyPlate): veg+fruit = half, grain = ¼, protein = ¼, dairy = cup on the side.
export const SECTIONS = ['veg', 'grain', 'protein', 'dairy']

// aliases: other names a child might type or say (Levantine + MSA + English).
export const FOODS = [
  // Vegetables
  { id: 'broc', emoji: '🥦', category: 'veg', name: { en: 'Broccoli', ar: 'بروكلي' }, aliases: ['قرنبيط اخضر', 'brocoli'] },
  { id: 'carrot', emoji: '🥕', category: 'veg', name: { en: 'Carrot', ar: 'جزر' }, aliases: ['جزرة', 'carrots'], crunchy: true },
  { id: 'cucumber', emoji: '🥒', category: 'veg', name: { en: 'Cucumber', ar: 'خيار' }, aliases: ['خياره', 'خيارة'], crunchy: true },
  { id: 'tomato', emoji: '🍅', category: 'veg', name: { en: 'Tomato', ar: 'بندورة' }, aliases: ['طماطم', 'بندوره', 'tomatoes'] },
  { id: 'spinach', emoji: '🌿', category: 'veg', name: { en: 'Spinach', ar: 'سبانخ' }, aliases: ['سبانغ'] },
  { id: 'corn', emoji: '🌽', category: 'veg', name: { en: 'Corn', ar: 'ذرة' }, aliases: ['ذره', 'عرنوس'] },
  { id: 'potato', emoji: '🥔', category: 'veg', name: { en: 'Potato', ar: 'بطاطا' }, aliases: ['بطاطس', 'potatoes'] },
  { id: 'lettuce', emoji: '🥬', category: 'veg', name: { en: 'Lettuce', ar: 'خس' }, aliases: ['خسة'], crunchy: true },
  { id: 'pepper', emoji: '🫑', category: 'veg', name: { en: 'Sweet Pepper', ar: 'فليفلة' }, aliases: ['فلفل', 'فلفل حلو', 'فليفله', 'pepper'], crunchy: true },
  { id: 'eggplant', pal: true, emoji: '🍆', category: 'veg', name: { en: 'Eggplant', ar: 'باذنجان' }, aliases: ['بتنجان', 'بيتنجان'] },
  { id: 'olives', pal: true, emoji: '🫒', category: 'veg', name: { en: 'Olives', ar: 'زيتون' }, aliases: ['زيتونة'] },

  // Fruits
  { id: 'apple', emoji: '🍎', category: 'fruit', name: { en: 'Apple', ar: 'تفاح' }, aliases: ['تفاحة', 'تفاحه'], crunchy: true },
  { id: 'banana', emoji: '🍌', category: 'fruit', name: { en: 'Banana', ar: 'موز' }, aliases: ['موزة', 'موزه'] },
  { id: 'straw', emoji: '🍓', category: 'fruit', name: { en: 'Strawberry', ar: 'فراولة' }, aliases: ['فريز', 'فراوله'] },
  { id: 'dates', pal: true, emoji: '🟤', category: 'fruit', name: { en: 'Dates', ar: 'تمر' }, aliases: ['تمرة', 'بلح'] },
  { id: 'orange', emoji: '🍊', category: 'fruit', name: { en: 'Orange', ar: 'برتقال' }, aliases: ['برتقالة', 'بردقان', 'بردقانة'] },
  { id: 'grape', pal: true, emoji: '🍇', category: 'fruit', name: { en: 'Grapes', ar: 'عنب' }, aliases: ['عنبة'] },
  { id: 'watermelon', emoji: '🍉', category: 'fruit', name: { en: 'Watermelon', ar: 'بطيخ' }, aliases: ['بطيخة'] },
  { id: 'mango', emoji: '🥭', category: 'fruit', name: { en: 'Mango', ar: 'مانجا' }, aliases: ['مانجو', 'منجا'] },
  { id: 'pear', emoji: '🍐', category: 'fruit', name: { en: 'Pear', ar: 'نجاص' }, aliases: ['إجاص', 'اجاص', 'انجاص'] },

  // Grains
  { id: 'rice', emoji: '🍚', category: 'grain', name: { en: 'Rice', ar: 'رز' }, aliases: ['أرز', 'ارز'] },
  { id: 'bread', emoji: '🍞', category: 'grain', name: { en: 'Bread', ar: 'خبز' }, aliases: ['خبزة', 'عيش'] },
  { id: 'taboon', pal: true, emoji: '🫓', category: 'grain', name: { en: 'Taboon Bread', ar: 'خبز طابون' }, aliases: ['طابون'] },
  { id: 'oats', emoji: '🥣', category: 'grain', name: { en: 'Oats', ar: 'شوفان' }, aliases: ['oatmeal'] },
  { id: 'pasta', emoji: '🍝', category: 'grain', name: { en: 'Pasta', ar: 'معكرونة' }, aliases: ['معكرونه', 'مكرونة', 'سباغيتي'] },
  { id: 'bulgur', pal: true, emoji: '🌾', category: 'grain', name: { en: 'Bulgur', ar: 'برغل' }, aliases: ['برغول'] },
  { id: 'freekeh', pal: true, emoji: '🥘', category: 'grain', name: { en: 'Freekeh', ar: 'فريكة' }, aliases: ['فريكه'] },

  // Protein
  { id: 'chicken', emoji: '🍗', category: 'protein', name: { en: 'Chicken', ar: 'جاج' }, aliases: ['دجاج', 'فراخ'] },
  { id: 'egg', emoji: '🥚', category: 'protein', name: { en: 'Egg', ar: 'بيض' }, aliases: ['بيضة', 'بيضه', 'eggs'] },
  { id: 'fish', emoji: '🐟', category: 'protein', name: { en: 'Fish', ar: 'سمك' }, aliases: ['سمكة'] },
  { id: 'hummus', pal: true, emoji: '🥙', category: 'protein', name: { en: 'Hummus', ar: 'حمص' }, aliases: ['حمّص'] },
  { id: 'lentils', pal: true, emoji: '🍲', category: 'protein', name: { en: 'Lentils', ar: 'عدس' }, aliases: ['شوربة عدس'] },
  { id: 'beans', pal: true, emoji: '🫘', category: 'protein', name: { en: 'Fava Beans', ar: 'فول' }, aliases: ['فول مدمس', 'beans'] },
  { id: 'nuts', emoji: '🥜', category: 'protein', name: { en: 'Nuts', ar: 'مكسرات' }, aliases: ['فستق', 'لوز', 'جوز'] },
  { id: 'meat', emoji: '🥩', category: 'protein', name: { en: 'Meat', ar: 'لحمة' }, aliases: ['لحم', 'لحمه'] },

  // Dairy
  { id: 'milk', emoji: '🥛', category: 'dairy', name: { en: 'Milk', ar: 'حليب' }, aliases: ['حليبة'] },
  { id: 'cheese', emoji: '🧀', category: 'dairy', name: { en: 'Cheese', ar: 'جبنة' }, aliases: ['جبنه', 'جبن'] },
  { id: 'labneh', pal: true, emoji: '🫙', category: 'dairy', name: { en: 'Labneh', ar: 'لبنة' }, aliases: ['لبنه'] },
  { id: 'yogurt', emoji: '🍶', category: 'dairy', name: { en: 'Yogurt', ar: 'لبن' }, aliases: ['لبن رايب', 'زبادي', 'yoghurt'] },
  // ---- more vegetables (pal: Palestinian kitchen) ----
  { id: 'zucchini', emoji: '🥒', category: 'veg', pal: true, name: { en: 'Zucchini', ar: 'كوسا' }, aliases: ['كوسى', 'كوسايه', 'محشي كوسا', 'zucchini'] },
  { id: 'mloukhieh', emoji: '🍃', category: 'veg', pal: true, name: { en: 'Molokhia', ar: 'ملوخية' }, aliases: ['ملوخيه', 'molokhia'] },
  { id: 'warak', emoji: '🌿', category: 'veg', pal: true, name: { en: 'Stuffed Vine Leaves', ar: 'ورق عنب' }, aliases: ['دوالي', 'يبرق', 'ورق دوالي'] },
  { id: 'salad', emoji: '🥗', category: 'veg', pal: true, name: { en: 'Arabic Salad', ar: 'سلطة عربية' }, aliases: ['سلطة', 'سلطه', 'فتوش', 'تبولة', 'تبوله'] },
  { id: 'onion', emoji: '🧅', category: 'veg', name: { en: 'Onion', ar: 'بصل' }, aliases: ['بصلة'] },
  { id: 'garlic', emoji: '🧄', category: 'veg', name: { en: 'Garlic', ar: 'ثوم' }, aliases: ['توم'] },
  { id: 'mushroom', emoji: '🍄', category: 'veg', name: { en: 'Mushroom', ar: 'فطر' }, aliases: ['مشروم', 'فطور'] },
  { id: 'peas', emoji: '🫛', category: 'veg', name: { en: 'Peas', ar: 'بازيلا' }, aliases: ['بازيلاء', 'بازلاء', 'بسلة', 'بزاليا'] },
  { id: 'sweetpotato', emoji: '🍠', category: 'veg', name: { en: 'Sweet Potato', ar: 'بطاطا حلوة' }, aliases: ['بطاطا حلوه', 'بطاطس حلوة'] },
  { id: 'avocado', emoji: '🥑', category: 'veg', name: { en: 'Avocado', ar: 'أفوكادو' }, aliases: ['افوكادو', 'افوكادو'] },
  { id: 'chili', emoji: '🌶️', category: 'veg', name: { en: 'Chili Pepper', ar: 'فلفل حار' }, aliases: ['شطة', 'حار'] },
  // ---- more fruits ----
  { id: 'figs', emoji: '🟣', category: 'fruit', pal: true, name: { en: 'Figs', ar: 'تين' }, aliases: ['تينة', 'تينه', 'figs'] },
  { id: 'pomegranate', emoji: '🔴', category: 'fruit', pal: true, name: { en: 'Pomegranate', ar: 'رمان' }, aliases: ['رمانة', 'رمانه'] },
  { id: 'apricot', emoji: '🟠', category: 'fruit', pal: true, name: { en: 'Apricot', ar: 'مشمش' }, aliases: ['مشمشة', 'مشمشه'] },
  { id: 'cactus', emoji: '🌵', category: 'fruit', pal: true, name: { en: 'Prickly Pear', ar: 'صبر' }, aliases: ['صبرة', 'تين شوكي', 'صبر'] },
  { id: 'lemon', emoji: '🍋', category: 'fruit', name: { en: 'Lemon', ar: 'ليمون' }, aliases: ['ليمونة', 'حامض'] },
  { id: 'peach', emoji: '🍑', category: 'fruit', name: { en: 'Peach', ar: 'دراق' }, aliases: ['خوخ', 'دراقة'] },
  { id: 'cherry', emoji: '🍒', category: 'fruit', name: { en: 'Cherries', ar: 'كرز' }, aliases: ['كرزة'] },
  { id: 'melon', emoji: '🍈', category: 'fruit', name: { en: 'Melon', ar: 'شمام' }, aliases: ['بطيخ اصفر', 'شمامة'] },
  { id: 'pineapple', emoji: '🍍', category: 'fruit', name: { en: 'Pineapple', ar: 'أناناس' }, aliases: ['اناناس'] },
  { id: 'kiwi', emoji: '🥝', category: 'fruit', name: { en: 'Kiwi', ar: 'كيوي' }, aliases: [] },
  { id: 'berries', emoji: '🫐', category: 'fruit', name: { en: 'Blueberries', ar: 'توت' }, aliases: ['توت بري', 'توتة'] },
  { id: 'greenapple', emoji: '🍏', category: 'fruit', name: { en: 'Green Apple', ar: 'تفاح أخضر' }, aliases: ['تفاحة خضرا', 'تفاح اخضر'] },
  { id: 'coconut', emoji: '🥥', category: 'fruit', name: { en: 'Coconut', ar: 'جوز هند' }, aliases: ['جوز الهند'] },
  // ---- more grains / starches ----
  { id: 'maqluba', emoji: '🍛', category: 'grain', pal: true, name: { en: 'Maqluba', ar: 'مقلوبة' }, aliases: ['مقلوبه'] },
  { id: 'musakhan', emoji: '🫓', category: 'grain', pal: true, name: { en: 'Musakhan', ar: 'مسخّن' }, aliases: ['مسخن'] },
  { id: 'maftoul', emoji: '🍚', category: 'grain', pal: true, name: { en: 'Maftoul', ar: 'مفتول' }, aliases: ['مفتوله', 'كسكس'] },
  { id: 'mujaddara', emoji: '🍲', category: 'grain', pal: true, name: { en: 'Mujaddara', ar: 'مجدرة' }, aliases: ['مجدره', 'مجدّرة'] },
  { id: 'kaak', emoji: '🥯', category: 'grain', pal: true, name: { en: 'Jerusalem Kaak', ar: 'كعك القدس' }, aliases: ['كعك', 'كعكة', 'كعك بسمسم'] },
  { id: 'manakish', emoji: '🍕', category: 'grain', pal: true, name: { en: "Za'atar Manakish", ar: 'مناقيش زعتر' }, aliases: ['منقوشة', 'مناقيش', 'زعتر', 'زعتر وزيت'] },
  { id: 'saj', emoji: '🌯', category: 'grain', pal: true, name: { en: 'Saj Bread', ar: 'خبز صاج' }, aliases: ['شراك', 'خبز شراك', 'صاج'] },
  { id: 'brownbread', emoji: '🍞', category: 'grain', name: { en: 'Brown Bread', ar: 'خبز أسمر' }, aliases: ['خبز اسمر', 'خبز قمح'] },
  { id: 'croissant', emoji: '🥐', category: 'grain', name: { en: 'Croissant', ar: 'كرواسون' }, aliases: ['كرواسان'] },
  { id: 'pancake', emoji: '🥞', category: 'grain', name: { en: 'Pancakes', ar: 'بان كيك' }, aliases: ['بانكيك', 'فطاير'] },
  // ---- more protein ----
  { id: 'falafel', emoji: '🧆', category: 'protein', pal: true, name: { en: 'Falafel', ar: 'فلافل' }, aliases: ['فلافل', 'طعمية'] },
  { id: 'kofta', emoji: '🍢', category: 'protein', pal: true, name: { en: 'Kofta', ar: 'كفتة' }, aliases: ['كفته', 'كباب'] },
  { id: 'shawarma', emoji: '🥙', category: 'protein', name: { en: 'Chicken Shawarma', ar: 'شاورما جاج' }, aliases: ['شاورما', 'شورما'] },
  { id: 'tuna', emoji: '🥫', category: 'protein', name: { en: 'Tuna', ar: 'تونة' }, aliases: ['تونا', 'تونه'] },
  { id: 'chickpeas', emoji: '🫘', category: 'protein', pal: true, name: { en: 'Chickpeas', ar: 'حمص حب' }, aliases: ['حمص بليلة', 'بليلة'] },
  // ---- more dairy ----
  { id: 'nabulsi', emoji: '🧀', category: 'dairy', pal: true, name: { en: 'Nabulsi Cheese', ar: 'جبنة نابلسية' }, aliases: ['نابلسية', 'جبنة بيضا', 'عكاوي'] },
  { id: 'jameed', emoji: '⚪', category: 'dairy', pal: true, name: { en: 'Jameed', ar: 'جميد' }, aliases: ['لبن جميد', 'منسف'] },
  { id: 'ayran', emoji: '🥤', category: 'dairy', name: { en: 'Ayran', ar: 'عيران' }, aliases: ['لبن عيران', 'لبن مشروب'] },
]

// Fruit goes into the veg half of the plate.
export const sectionOf = (food) => (food.category === 'fruit' ? 'veg' : food.category)

// Quest pool — three are drawn per child per calendar day.
// lookup across normal + Ramadan quests
export const questDef = (id) => QUEST_POOL.find((q) => q.id === id) || RAMADAN_QUESTS.find((q) => q.id === id)

export const QUEST_POOL = [
  { id: 'fruit2', emoji: '🍎', xp: 20, title: { en: 'Fruit Ninja', ar: 'نينجا الفواكه' }, desc: { en: 'Eat 2 different fruits today', ar: { m: 'كُل نوعين مختلفين من الفواكه اليوم', f: 'كُلي نوعين مختلفين من الفواكه اليوم' } } },
  { id: 'crunch', emoji: '🥕', xp: 25, title: { en: 'Crunch Tester', ar: 'مختبر القرمشة' }, desc: { en: 'Eat something crunchy: carrot, cucumber or apple', ar: { m: 'كُل إشي مقرمش: جزر، خيار أو تفاح', f: 'كُلي إشي مقرمش: جزر، خيار أو تفاح' } } },
  { id: 'dairy', emoji: '🥛', xp: 20, title: { en: 'Bone Builder', ar: 'باني العظام' }, desc: { en: 'Have milk, labneh, yogurt or cheese', ar: { m: 'اشرب حليب أو كُل لبنة، لبن أو جبنة', f: 'اشربي حليب أو كُلي لبنة، لبن أو جبنة' } } },
  { id: 'chef', emoji: '🧑‍🍳', xp: 30, title: { en: 'Junior Chef', ar: 'الشيف الصغير' }, desc: { en: 'Help prepare one dish for the family meal', ar: { m: 'ساعد بتحضير صنف واحد لأكلة العيلة', f: 'ساعدي بتحضير صنف واحد لأكلة العيلة' } } },
  { id: 'new', emoji: '🥙', xp: 40, title: { en: 'Flavor Explorer', ar: 'مستكشف النكهات' }, desc: { en: 'Taste one new food or a traditional dish', ar: { m: 'جرّب أكلة جديدة أو طبخة من طبخات ستّك', f: 'جرّبي أكلة جديدة أو طبخة من طبخات ستّك' } } },
  { id: 'protein', emoji: '💪', xp: 30, title: { en: 'Protein Power', ar: 'قوة البروتين' }, desc: { en: 'Add a protein to lunch: eggs, lentils, chicken…', ar: { m: 'زيد بروتين عالغدا: بيض، عدس، جاج…', f: 'زيدي بروتين عالغدا: بيض، عدس، جاج…' } } },
  { id: 'breakfast', emoji: '🍳', xp: 30, title: { en: 'Breakfast Champ', ar: 'بطل الفطور' }, desc: { en: 'Eat breakfast before school', ar: { m: 'افطر قبل ما تروح عالمدرسة', f: 'افطري قبل ما تروحي عالمدرسة' } } },
  { id: 'water', emoji: '💧', xp: 20, title: { en: 'Water First', ar: 'المي أولاً' }, desc: { en: 'Drink water instead of juice or soda today', ar: { m: 'اشرب مي بدل العصير أو الكولا اليوم', f: 'اشربي مي بدل العصير أو الكولا اليوم' } } },
  { id: 'veg-snack', emoji: '🥒', xp: 25, title: { en: 'Veggie Snack', ar: 'سناك خضرا' }, desc: { en: 'Choose a vegetable as your snack', ar: { m: 'اختار خضرا كسناك بدل الشيبس', f: 'اختاري خضرا كسناك بدل الشيبس' } } },
  { id: 'table', emoji: '🍽️', xp: 20, title: { en: 'Family Table', ar: 'سفرة العيلة' }, desc: { en: 'Eat one meal at the table with family, no screens', ar: { m: 'كُل وجبة عالسفرة مع العيلة بدون شاشات', f: 'كُلي وجبة عالسفرة مع العيلة بدون شاشات' } } },
]

// Badges are earned by real achievements, not by tapping a chest.
// Each has a check(stats) that runs against the child's progress.
export const BADGES = [
  { id: 'first-plate', emoji: '🍽️', title: { ar: 'أول طبق', en: 'First Plate' }, desc: { ar: 'أول طبق محفوظ', en: 'Saved your first plate' }, check: (s) => s.platesSaved >= 1 },
  { id: 'balanced', emoji: '⚖️', title: { ar: 'طبق متوازن', en: 'Balance Master' }, desc: { ar: 'طبق فيه كل الأقسام', en: 'A plate with every section' }, check: (s) => s.balancedPlates >= 1 },
  { id: 'complete', emoji: '🥇', title: { ar: 'طبق كامل', en: 'Complete Plate' }, desc: { ar: 'طبق فيه الأقسام الأربعة مع الألبان', en: 'All four sections incl. dairy' }, check: (s) => s.completePlates >= 1 },
  { id: 'streak3', emoji: '🔥', title: { ar: 'نار ٣ أيام', en: '3-Day Fire' }, desc: { ar: '٣ أيام ورا بعض', en: '3 days in a row' }, check: (s) => s.bestStreak >= 3 },
  { id: 'hydro', emoji: '💧', title: { ar: 'بطل المي', en: 'Hydro Hero' }, desc: { ar: 'وصلت هدف المي ٣ مرات', en: 'Hit the water goal 3 times' }, check: (s) => s.waterGoalDays >= 3 },
  { id: 'explorer', emoji: '🧭', title: { ar: 'مستكشف', en: 'Explorer' }, desc: { ar: 'جرّبت ١٥ صنف مختلف', en: 'Tried 15 different foods' }, check: (s) => s.uniqueFoods >= 15 },
  { id: 'tree', emoji: '🌳', title: { ar: 'شجرة الكنوز', en: 'Treasure Tree' }, desc: { ar: 'كبّرت شجرتك للآخر', en: 'Grew your tree all the way' }, check: (s) => s.treesGrown >= 1 },
  { id: 'mover', emoji: '🏃', title: { ar: 'أول تمرين', en: 'First Workout' }, desc: { ar: 'خلّصت أول روتين حركة', en: 'Finished your first workout' }, check: (s) => s.routinesDone >= 1 },
  { id: 'active', emoji: '⚡', title: { ar: 'بطل الحركة', en: 'Move Hero' }, desc: { ar: 'وصلت هدف الحركة ٣ أيام', en: 'Hit the move goal 3 days' }, check: (s) => s.moveGoalDays >= 3 },
  { id: 'school', emoji: '🏫', title: { ar: 'جاهز للمدرسة', en: 'School Ready' }, desc: { ar: 'روتين الصباح ٥ مرات', en: 'Morning routine 5 times' }, check: (s) => (s.routines?.morning || 0) >= 5 },
  { id: 'coach', emoji: '🤖', title: { ar: 'صاحب المدرب', en: 'Coach Buddy' }, desc: { ar: 'خلّصت تحدي بالكاميرا ٣ مرات', en: 'Finished 3 camera challenges' }, check: (s) => (s.routines?.cam || 0) >= 3 },
  { id: 'manners', emoji: '🤲', title: { ar: 'آداب الطعام', en: 'Table Manners' }, desc: { ar: 'كل آداب الأكل ٣ أيام', en: 'All manners on 3 days' }, check: (s) => s.mannersDays >= 3 },
  { id: 'night3', emoji: '🌙', title: { ar: 'ليالي النجوم', en: 'Star Nights' }, desc: { ar: '٣ ليالي رحلة نجوم كاملة', en: '3 full Star Journeys' }, check: (s) => s.nightsDone >= 3 },
  { id: 'facts10', emoji: '📚', title: { ar: 'عالِم صغير', en: 'Little Scientist' }, desc: { ar: '١٠ معلومات صحية ببنك المعلومات', en: '10 health facts in the fact bank' }, check: (s) => s.factsKnown >= 10 },
  { id: 'facts30', emoji: '🎓', title: { ar: 'موسوعة الصحة', en: 'Health Encyclopedia' }, desc: { ar: '٣٠ معلومة صحية', en: '30 health facts' }, check: (s) => s.factsKnown >= 30 },
  { id: 'gold', emoji: '🏆', title: { ar: 'كأس ذهبي', en: 'Gold Cup' }, desc: { ar: 'كأس ذهبي بأي لعبة', en: 'A gold cup in any game' }, check: (s) => s.golds >= 1 },
  { id: 'night10', emoji: '🌌', title: { ar: 'سيّد الكواكب', en: 'Constellation Keeper' }, desc: { ar: '١٠ ليالي نجوم', en: '10 Star nights' }, check: (s) => s.nightsDone >= 10 },
  { id: 'teeth', emoji: '🦷', title: { ar: 'أسنان لامعة', en: 'Shiny Teeth' }, desc: { ar: 'فرّشت أسنانك ١٤ مرة', en: 'Brushed 14 times' }, check: (s) => s.brushCount >= 14 },
  { id: 'lantern', emoji: '🏮', title: { ar: 'أول فانوس', en: 'First Lantern' }, desc: { ar: 'أول يوم صيام (كامل أو عصافير)', en: 'First fasting day (full or bird)' }, check: (s) => Object.values(s.ramadanFasts || {}).some((v) => v !== 'none') },
  { id: 'ramadan10', emoji: '🌙', title: { ar: 'عشرة فوانيس', en: 'Ten Lanterns' }, desc: { ar: '١٠ أيام صيام برمضان', en: '10 fasting days' }, check: (s) => Object.values(s.ramadanFasts || {}).filter((v) => v !== 'none').length >= 10 },
  { id: 'eid', emoji: '🎉', title: { ar: 'فرحة العيد', en: 'Eid Joy' }, desc: { ar: 'احتفلت بالعيد مع NutriLoop', en: 'Celebrated Eid' }, check: (s) => (s.eidYears || []).length >= 1 },
  { id: 'streak7', emoji: '👑', title: { ar: 'أسبوع كامل', en: 'Full Week' }, desc: { ar: '٧ أيام ورا بعض', en: '7 days in a row' }, check: (s) => s.bestStreak >= 7 },
]

// Islamic table manners (sunnah of eating) — ticked once per day each.
export const MANNERS = [
  { id: 'bismillah', emoji: '🤲', xp: 5, title: { ar: 'بسم الله قبل الأكل', en: 'Bismillah before eating' } },
  { id: 'right', emoji: '✋', xp: 5, title: { ar: 'باليمين ومن قدّامي', en: 'Right hand, from in front of me' } },
  { id: 'hamd', emoji: '💚', xp: 5, title: { ar: 'الحمد لله وما رميت أكل', en: 'Alhamdulillah, no food wasted' } },
]

export const AVATARS = ['🦸‍♀️', '🦸‍♂️', '🧚‍♀️', '🧙‍♂️', '🦊', '🐼', '🦁', '🐰', '🐯', '🦄', '🐸', '🐧']

// Daily water goal by age (rough paediatric guide, adjustable by parent).
export const waterGoalForAge = (age) => (age <= 3 ? 1000 : age <= 8 ? 1200 : age <= 13 ? 1600 : 1900)

export const RANKS = {
  ar: ['مبتدئ الصحة', 'متعلم نشيط', 'خبير التغذية', 'بطل الطاقة', 'أسطورة الصحة'],
  en: ['Health Beginner', 'Active Learner', 'Nutrition Expert', 'Energy Hero', 'Health Legend'],
}
export const RANKS_F = ['مبتدئة الصحة', 'متعلمة نشيطة', 'خبيرة التغذية', 'بطلة الطاقة', 'أسطورة الصحة']

// UI strings. A value may be a string or { m, f } (Arabic gendered).
export const STR = {
  ar: {
    today: 'اليوم', plate: 'الطبق', game: 'تحدي', diary: 'السجل', rewards: 'كنوزي',
    whoPlays: 'مين بدو يلعب؟', addChild: 'إضافة ولد', parent: 'الأهل',
    todaysQuests: 'مهام اليوم',
    questsSub: { m: 'خلّص المهام عشان تضل شعلتك مولعة!', f: 'خلّصي المهام عشان تضل شعلتك مولعة!' },
    streak: 'يوم ورا بعض',
    pending: 'بانتظار موافقة الأهل',
    water: 'شاحن المي', waterOf: 'من',
    plateTitle: 'اعمل طبقك', plateTitleF: 'اعملي طبقك',
    plateSub: { m: 'اسحب الأكل أو اكبس عليه', f: 'اسحبي الأكل أو اكبسي عليه' },
    vegFruits: 'خضار وفواكه ½', grains: 'نشويات ¼', protein: 'بروتين ¼', dairy: 'ألبان',
    search: 'دوّر على أكل…', all: 'الكل', pal: 'أكلات بلادنا 🫒',
    cat: { veg: 'خضرا', fruit: 'فواكه', grain: 'نشويات', protein: 'بروتين', dairy: 'ألبان' },
    savePlate: 'احفظ الطبق', savePlateF: 'احفظي الطبق',
    needMore: { m: 'حط صنفين عالأقل', f: 'حطي صنفين عالأقل' },
    alreadySaved: 'خلصت أطباق اليوم ✨ بكرة في كمان!',
    buddy: 'صاحبك يامي 🥑', buddyF: 'صاحبتك يامي 🥑',
    buddyEmpty: { m: 'أهلين {name}! يلا نعمل طبق ملوّن!', f: 'أهلين {name}! يلا نعمل طبق ملوّن!' },
    buddyNeedVeg: 'الطبق ناقصه خضرا أو فواكه 🥦🍎',
    buddyNeedGrain: 'زيد إشي نشويات مثل خبز أو رز 🍞', buddyNeedGrainF: 'زيدي إشي نشويات مثل خبز أو رز 🍞',
    buddyNeedProtein: 'وين البروتين؟ بيض، عدس، جاج… 🥚',
    buddyNeedDairy: 'شو رأيك بكاسة حليب أو لبن جنب الطبق؟ 🥛',
    buddyBalanced: { m: 'يا سلام! طبق متوازن بيعطيك طاقة طول النهار!', f: 'يا سلام! طبق متوازن بيعطيكِ طاقة طول النهار!' },
    buddyComplete: { m: 'واو! طبق كامل بكل الأقسام! انت بطل! 🥇', f: 'واو! طبق كامل بكل الأقسام! انتِ بطلة! 🥇' },
    saved: 'انحفظ الطبق! 🎉',
    gameTitle: 'تحدي السرعة ⏱️',
    gameSub: { m: 'لاقي الأكل المطلوب قبل ما يخلص الوقت', f: 'لاقي الأكل المطلوب قبل ما يخلص الوقت' },
    gameSort: { m: 'وين بينحط هاد الأكل؟ اختار القسم الصح!', f: 'وين بينحط هاد الأكل؟ اختاري القسم الصح!' },
    start: 'يلا نبلش!', timeLeft: 'الوقت', score: 'النقاط',
    gameOver: 'خلص الوقت! جبت', gameOverF: 'خلص الوقت! جبتي', replay: 'كمان مرة',
    gameDaily: 'تقدر تاخد XP من التحدي ٣ مرات باليوم',
    diaryTitle: 'دفتر يومياتي 📖', diaryEmpty: 'لسا ما في أطباق محفوظة!',
    balancedPlate: 'طبق متوازن', plateLbl: 'طبق',
    garden: 'حديقة يامي 🌿',
    stages: ['بذرة 🫘', 'برعم 🌱', 'نبتة 🌿', 'زهرة 🌸', 'شجرة كنوز 🌳'],
    gardenHint: 'الشجرة بتكبر من الأطباق والمهام والمي',
    badges: 'ملصقاتي 🎖️',
    newBadge: 'ملصق جديد! 🌟',
    levelUp: 'مستوى جديد! 🚀',
    ok: 'تمام',
    mealTimer: 'مؤقت الأكلة', startMeal: 'بلّش الأكل 🍽️', stopMeal: 'خلصت',
    mealHint: { m: 'كُل على مهلك، ٢٠ دقيقة', f: 'كُلي على مهلك، ٢٠ دقيقة' },
    mealDone: 'خلص وقت الأكلة! برافو!',
    voiceErr: 'صار خطأ بالبحث بالصوت، جرّب كمان مرة أو اكتب', voiceNo: 'هالمتصفح ما بيدعم البحث بالصوت (بيشتغل على Chrome)',
    voicePreview: 'صفحة المعاينة ما بتسمح بالمايك 🎤 جرّبه بالتطبيق المثبّت',
    voiceOffline: 'البحث بالصوت بدّه إنترنت 🌐 (أو نزّلوا العربي offline من إعدادات Google)',
    voiceNoNative: 'ما في محرك تعرّف على الصوت بالجهاز. ثبّتوا تطبيق Google',
    voiceDenied: 'لازم تسمحوا للمايك من إعدادات المتصفح 🎤',
    voiceSilence: 'ما سمعت إشي، احكي بصوت أعلى 🙂',
    voiceNoMic: 'ما لقينا مايك على هالجهاز',
    notFound: 'ما لقيت هالأكل', added: 'انضاف',
    listening: 'عم بسمعك…',
    newDay: 'يوم جديد! 🌅',
    // Parent area
    pinSet: 'اعمل رمز سري للأهل (٤ أرقام)', pinEnter: 'أدخل الرمز السري للأهل', pinWrong: 'الرمز غلط',
    pinConfirm: 'أكّد الرمز', pinMismatch: 'الرمزين مش متطابقين',
    parentTitle: 'لوحة الأهل', children: 'الأولاد', settings: 'الإعدادات',
    name: 'الاسم', age: 'العمر', boy: 'ولد', girl: 'بنت', avatar: 'الصورة',
    save: 'حفظ', cancel: 'إلغاء', del: 'حذف', edit: 'تعديل', back: 'رجوع',
    confirmDel: 'أكيد بدك تحذف هالبروفايل وكل تقدّمه؟',
    approval: 'المهام بدها موافقة الأهل', approve: 'موافقة', reject: 'رفض',
    pendingList: 'مهام بانتظار الموافقة', noPending: 'ما في مهام بانتظار',
    week: 'آخر ٧ أيام', plates: 'أطباق', questsDone: 'مهام', waterAvg: 'معدل المي',
    sectionsMissing: 'أقسام ناقصة بالأطباق', sound: 'الأصوات', speak: 'قراءة أسماء الأكل بالصوت',
    changePin: 'تغيير الرمز السري', waterGoal: 'هدف المي (ml)',
    exportData: 'نسخة احتياطية', importData: 'استرجاع نسخة', importOk: 'تم الاسترجاع', importBad: 'الملف مش صالح',
    switchChild: 'تبديل', lock: 'قفل',
    growth: 'النمو والتغذية',
    pinForgot: 'نسيتوا الرمز؟', recoverTitle: 'اكتبوا رمز الاسترجاع', recoverMath: 'سؤال للكبار: حلّوا الثلاث عمليات', recoverWrong: 'مش صحيح، جرّبوا كمان مرة', recoverGo: 'تأكيد',
    recoverShowTitle: 'رمز الاسترجاع', recoverShowSub: 'اكتبوه بمكان آمن. إذا نسيتوا الرمز السري، بهالرمز بتعملوا رمز جديد. ما رح يظهر مرة تانية.', recoverSaved: 'كتبته ✅', copy: 'نسخ',
    lookShort: 'شعر قصير', lookPony: 'ذيل حصان', lookHijab: 'حجاب',
    outfitSport: 'تيشيرت وشورت', outfitSuit: 'بدلة رياضة',
    manners: 'آداب الطعام', mannersSub: 'سنن نبوية، كل يوم',
  },
  en: {
    today: 'Today', plate: 'Plate', game: 'Challenge', diary: 'Diary', rewards: 'Treasures',
    whoPlays: "Who's playing?", addChild: 'Add child', parent: 'Parents',
    todaysQuests: "Today's Quests", questsSub: 'Finish quests to keep your streak glowing!',
    streak: 'day streak', pending: 'Waiting for parent',
    water: 'Water Battery', waterOf: 'of',
    plateTitle: 'Build your plate', plateTitleF: 'Build your plate',
    plateSub: 'Drag food or tap it',
    vegFruits: 'Veg & Fruit ½', grains: 'Grains ¼', protein: 'Protein ¼', dairy: 'Dairy',
    search: 'Search food…', all: 'All', pal: 'Our food 🫒',
    cat: { veg: 'Veg', fruit: 'Fruit', grain: 'Grains', protein: 'Protein', dairy: 'Dairy' },
    savePlate: 'Save plate', savePlateF: 'Save plate', needMore: 'Add at least 2 foods',
    alreadySaved: "Today's plates are done ✨ more tomorrow!",
    buddy: 'Yummy Buddy 🥑', buddyF: 'Yummy Buddy 🥑',
    buddyEmpty: "Hi {name}! Let's build a colourful plate!",
    buddyNeedVeg: 'Your plate needs veggies or fruit 🥦🍎',
    buddyNeedGrain: 'Add a grain like bread or rice 🍞', buddyNeedGrainF: 'Add a grain like bread or rice 🍞',
    buddyNeedProtein: 'Where is the protein? Egg, lentils, chicken… 🥚',
    buddyNeedDairy: 'How about a glass of milk next to the plate? 🥛',
    buddyBalanced: 'Woohoo! A balanced plate gives you energy all day!',
    buddyComplete: "Wow! A complete plate with every section! You're a hero! 🥇",
    saved: 'Plate saved! 🎉',
    gameTitle: 'Speed Challenge ⏱️', gameSub: 'Find the requested food before time runs out',
    gameSort: 'Where does this food go? Pick the right section!',
    start: "Let's go!", timeLeft: 'Time', score: 'Score',
    gameOver: "Time's up! You got", gameOverF: "Time's up! You got", replay: 'Play again',
    gameDaily: 'The challenge gives XP 3 times a day',
    diaryTitle: 'My Diary 📖', diaryEmpty: 'No plates saved yet!',
    balancedPlate: 'Balanced plate', plateLbl: 'Plate',
    garden: "Yummy's Garden 🌿",
    stages: ['Seed 🫘', 'Sprout 🌱', 'Plant 🌿', 'Flower 🌸', 'Treasure Tree 🌳'],
    gardenHint: 'Your tree grows from plates, quests and water',
    badges: 'My Badges 🎖️', newBadge: 'New badge! 🌟', levelUp: 'Level up! 🚀', ok: 'OK',
    mealTimer: 'Meal Timer', startMeal: 'Start eating 🍽️', stopMeal: 'Done',
    mealHint: 'Eat slowly, 20 minutes', mealDone: 'Meal time is over! Great job!',
    voiceErr: 'Voice search failed, try again or type', voiceNo: "This browser doesn't support voice search (works in Chrome)",
    voicePreview: 'This preview blocks the microphone 🎤 Try it in the installed app',
    voiceOffline: 'Voice search needs internet 🌐 (or download offline speech in Google settings)',
    voiceNoNative: 'No speech recognizer on this device. Install the Google app',
    voiceDenied: 'Please allow the microphone in browser settings 🎤',
    voiceSilence: "I didn't hear anything, speak a bit louder 🙂",
    voiceNoMic: 'No microphone found on this device',
    notFound: 'Food not found', added: 'Added', listening: 'Listening…', newDay: 'New day! 🌅',
    pinSet: 'Create a 4-digit parent PIN', pinEnter: 'Enter parent PIN', pinWrong: 'Wrong PIN',
    pinConfirm: 'Confirm PIN', pinMismatch: "PINs don't match",
    parentTitle: 'Parent Dashboard', children: 'Children', settings: 'Settings',
    name: 'Name', age: 'Age', boy: 'Boy', girl: 'Girl', avatar: 'Avatar',
    save: 'Save', cancel: 'Cancel', del: 'Delete', edit: 'Edit', back: 'Back',
    confirmDel: 'Delete this profile and all its progress?',
    approval: 'Quests need parent approval', approve: 'Approve', reject: 'Reject',
    pendingList: 'Waiting for approval', noPending: 'Nothing waiting',
    week: 'Last 7 days', plates: 'Plates', questsDone: 'Quests', waterAvg: 'Avg water',
    sectionsMissing: 'Sections missing from plates', sound: 'Sounds', speak: 'Read food names aloud',
    changePin: 'Change PIN', waterGoal: 'Water goal (ml)',
    exportData: 'Backup', importData: 'Restore', importOk: 'Restored', importBad: 'Invalid file',
    switchChild: 'Switch', lock: 'Lock',
    growth: 'Growth & nutrition',
    pinForgot: 'Forgot the PIN?', recoverTitle: 'Enter the recovery code', recoverMath: 'Grown-ups only: solve these three', recoverWrong: 'Not right, try again', recoverGo: 'Confirm',
    recoverShowTitle: 'Recovery code', recoverShowSub: 'Write it somewhere safe. If you forget the PIN, this code lets you set a new one. It will not be shown again.', recoverSaved: 'I wrote it down ✅', copy: 'Copy',
    lookShort: 'Short hair', lookPony: 'Ponytail', lookHijab: 'Hijab',
    outfitSport: 'T-shirt & shorts', outfitSuit: 'Tracksuit',
    manners: 'Table Manners', mannersSub: 'Prophetic sunnah, every day',
  },
}

for (const l of ['ar', 'en']) for (const k of [...Object.keys(MOVE_STR[l]), ...Object.keys(NIGHT_STR[l]), ...Object.keys(RAMADAN_STR[l]), ...Object.keys(ARCADE_STR[l]), ...Object.keys(MEAL_STR[l])]) if (k in STR[l]) console.warn('string key clash', k)
Object.assign(STR.ar, MOVE_STR.ar, NIGHT_STR.ar, RAMADAN_STR.ar, ARCADE_STR.ar, MEAL_STR.ar)
Object.assign(STR.en, MOVE_STR.en, NIGHT_STR.en, RAMADAN_STR.en, ARCADE_STR.en, MEAL_STR.en)
