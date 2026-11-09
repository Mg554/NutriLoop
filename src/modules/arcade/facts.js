// ---------------------------------------------------------------------------
// Health fact bank (بنك المعلومات). Short, kid-level, and correct.
// Sources: WHO activity & sugar guidance, DGA 2025-2030, AAP / ADA / AASM
// recommendations, USDA FoodData Central for nutrient claims.
// Children unlock a fact when a game shows it (after a mistake or a quiz
// answer) and can browse their collection.
// No calories or body weight anywhere: kids see foods and habits only.
// ---------------------------------------------------------------------------

export const TOPICS = {
  veg: { emoji: '🥦', ar: 'الخضار', en: 'Veggies' },
  fruit: { emoji: '🍎', ar: 'الفواكه', en: 'Fruit' },
  grain: { emoji: '🍞', ar: 'النشويات', en: 'Grains' },
  protein: { emoji: '🥚', ar: 'البروتين', en: 'Protein' },
  dairy: { emoji: '🥛', ar: 'الألبان', en: 'Dairy' },
  water: { emoji: '💧', ar: 'المي', en: 'Water' },
  move: { emoji: '⚡', ar: 'الحركة', en: 'Moving' },
  sleep: { emoji: '🌙', ar: 'النوم', en: 'Sleep' },
  teeth: { emoji: '🦷', ar: 'الأسنان', en: 'Teeth' },
  habits: { emoji: '🌟', ar: 'عادات حلوة', en: 'Good habits' },
}

export const FACTS = [
  // veg
  { id: 'carrot-eyes', topic: 'veg', emoji: '🥕', ar: 'الجزر فيه بيتا كاروتين، والجسم بيحوّله لفيتامين A اللي بيساعد العيون تشوف بالعتمة.', en: 'Carrots have beta-carotene, which the body turns into vitamin A to help eyes see in dim light.' },
  { id: 'broc-c', topic: 'veg', emoji: '🥦', ar: 'البروكلي فيه فيتامين C، وبالوزن نفسه فيه أكثر من البرتقال!', en: 'Broccoli has vitamin C, gram for gram even more than an orange!' },
  { id: 'leafy-iron', topic: 'veg', emoji: '🥬', ar: 'الخضار الورقية زي السبانخ والملوخية فيها حديد وفيتامين K.', en: 'Leafy greens like spinach and molokhia have iron and vitamin K.' },
  { id: 'rainbow', topic: 'veg', emoji: '🌈', ar: 'كل لون خضار إله فوايد مختلفة، عشان هيك منوكل ألوان كثير بالطبق.', en: 'Each veggie colour brings different nutrients, so we eat many colours.' },
  { id: 'tomato-fruit', topic: 'veg', emoji: '🍅', ar: 'البندورة علميًا فاكهة لأنها فيها بذور، بس منوكلها مع الخضار.', en: 'Scientifically a tomato is a fruit because it has seeds, but we eat it like a veggie.' },
  { id: 'cucumber-water', topic: 'veg', emoji: '🥒', ar: 'الخيار حوالي ٩٥٪ منه مي!', en: 'A cucumber is about 95% water!' },
  { id: 'fiber', topic: 'veg', emoji: '🌾', ar: 'الألياف بالخضار والفواكه بتساعد البطن يشتغل منيح.', en: 'Fibre in veggies and fruit helps your tummy work well.' },
  // fruit
  { id: 'vit-c', topic: 'fruit', emoji: '🍊', ar: 'البرتقال والكيوي والفراولة فيهم فيتامين C اللي بيساعد الجسم يقاوم المرض.', en: 'Oranges, kiwis and strawberries have vitamin C, which helps the body fight germs.' },
  { id: 'whole-fruit', topic: 'fruit', emoji: '🍎', ar: 'الفاكهة الكاملة أحسن من العصير، لأنها فيها ألياف وبتشبّع أكثر.', en: 'Whole fruit beats juice: it has fibre and fills you up more.' },
  { id: 'banana-k', topic: 'fruit', emoji: '🍌', ar: 'الموز فيه بوتاسيوم، وهو مهم للعضلات والقلب.', en: 'Bananas have potassium, important for muscles and the heart.' },
  { id: 'dates', topic: 'fruit', emoji: '🌴', ar: 'التمر بيعطي طاقة سريعة، وفيه ألياف كمان.', en: 'Dates give quick energy and have fibre too.' },
  { id: 'watermelon', topic: 'fruit', emoji: '🍉', ar: 'البطيخ أكثر من ٩٠٪ منه مي.', en: 'Watermelon is more than 90% water.' },
  { id: 'apple-peel', topic: 'fruit', emoji: '🍏', ar: 'قشرة التفاحة فيها ألياف كثير، فاغسلوها وكلوها مع القشرة.', en: 'Apple peel is full of fibre: wash it and eat it with the peel.' },
  // grain
  { id: 'wholegrain', topic: 'grain', emoji: '🍞', ar: 'الحبوب الكاملة زي خبز القمح الكامل والشوفان بتعطي طاقة بتضل معك وقت أطول.', en: 'Whole grains like whole-wheat bread and oats give energy that lasts longer.' },
  { id: 'freekeh', topic: 'grain', emoji: '🌾', ar: 'الفريكة قمح أخضر محمّص على النار، ومن أكلاتنا الفلسطينية الغنية بالألياف.', en: 'Freekeh is young green wheat roasted over fire, a Palestinian food rich in fibre.' },
  { id: 'brown-rice', topic: 'grain', emoji: '🍚', ar: 'الأرز البني فيه ألياف أكثر من الأرز الأبيض.', en: 'Brown rice has more fibre than white rice.' },
  { id: 'brain-fuel', topic: 'grain', emoji: '🧠', ar: 'الدماغ بيستخدم الطاقة اللي بتيجي من النشويات عشان تفكّر وتدرس.', en: 'Your brain uses energy from carbohydrates to think and learn.' },
  // protein
  { id: 'protein-bricks', topic: 'protein', emoji: '🧱', ar: 'البروتين بيبني العضلات وبيصلّحها، زي الطوب للبيت.', en: 'Protein builds and repairs muscles, like bricks for a house.' },
  { id: 'plant-protein', topic: 'protein', emoji: '🫘', ar: 'الحمص والعدس والفول فيهم بروتين، يعني النباتات كمان فيها بروتين!', en: 'Chickpeas, lentils and beans have protein: plants have protein too!' },
  { id: 'egg', topic: 'protein', emoji: '🥚', ar: 'البيضة فيها بروتين وفيتامين D وكولين المفيد للدماغ.', en: 'An egg has protein, vitamin D and choline, which helps the brain.' },
  { id: 'fish-omega', topic: 'protein', emoji: '🐟', ar: 'السمك زي السردين والسلمون فيه أوميغا ٣ المفيد للدماغ والقلب.', en: 'Fish like sardines and salmon have omega-3 for the brain and heart.' },
  { id: 'nuts', topic: 'protein', emoji: '🥜', ar: 'المكسرات فيها دهون مفيدة، والأطفال الصغار لازم ياكلوها مطحونة أو مقطّعة عشان ما يشرقوا.', en: 'Nuts have healthy fats; little kids should eat them ground or chopped so they do not choke.' },
  // dairy
  { id: 'calcium', topic: 'dairy', emoji: '🦴', ar: 'الحليب واللبن والجبنة فيهم كالسيوم اللي بيقوّي العظام والأسنان.', en: 'Milk, yogurt and cheese have calcium for strong bones and teeth.' },
  { id: 'yogurt', topic: 'dairy', emoji: '🥣', ar: 'اللبن الرايب فيه بكتيريا مفيدة للبطن.', en: 'Yogurt has friendly bacteria that help your tummy.' },
  { id: 'vit-d', topic: 'dairy', emoji: '☀️', ar: 'فيتامين D بيساعد الجسم يمتص الكالسيوم، والشمس بتساعد الجلد يصنعه.', en: 'Vitamin D helps the body absorb calcium, and sunlight helps the skin make it.' },
  { id: 'bones-grow', topic: 'dairy', emoji: '💪', ar: 'العظام بتضل تبني قوتها لحد ما الواحد يصير كبير، فالكالسيوم مهم من هلأ.', en: 'Bones keep building strength until adulthood, so calcium matters now.' },
  // water
  { id: 'body-water', topic: 'water', emoji: '💧', ar: 'حوالي ٦٠٪ من جسمك مي!', en: 'About 60% of your body is water!' },
  { id: 'cool-down', topic: 'water', emoji: '🥵', ar: 'المي بتساعد جسمك يبرد لما تلعب وتعرق.', en: 'Water helps your body cool down when you play and sweat.' },
  { id: 'water-focus', topic: 'water', emoji: '🎯', ar: 'شرب المي بيساعد الدماغ يركّز بالمدرسة.', en: 'Drinking water helps your brain focus at school.' },
  { id: 'soda', topic: 'water', emoji: '🥤', ar: 'المشروبات الغازية فيها سكر كثير، والمي هي أحسن مشروب للعطش.', en: 'Fizzy drinks have lots of sugar; water is the best drink for thirst.' },
  // move
  { id: 'sixty', topic: 'move', emoji: '⏱️', ar: 'منظمة الصحة العالمية بتنصح الأطفال بمعدل ٦٠ دقيقة حركة باليوم.', en: 'WHO advises children to move for an average of 60 minutes a day.' },
  { id: 'jump-bones', topic: 'move', emoji: '🦘', ar: 'النط والقفز بيقوّوا العظام.', en: 'Jumping and hopping make bones stronger.' },
  { id: 'heart-muscle', topic: 'move', emoji: '❤️', ar: 'القلب عضلة، والحركة بتخليه أقوى.', en: 'Your heart is a muscle, and moving makes it stronger.' },
  { id: 'outside', topic: 'move', emoji: '🌳', ar: 'اللعب برا بالشمس بيساعد جسمك يصنع فيتامين D.', en: 'Playing outside in the sun helps your body make vitamin D.' },
  // sleep
  { id: 'grow-sleep', topic: 'sleep', emoji: '📏', ar: 'وانت نايم جسمك بيكبر؛ هرمون النمو بيطلع أكثر وقت النوم العميق.', en: 'You grow while you sleep: growth hormone is released most in deep sleep.' },
  { id: 'sleep-memory', topic: 'sleep', emoji: '🧠', ar: 'النوم بيساعد الدماغ يحفظ اللي تعلّمته بالنهار.', en: 'Sleep helps your brain keep what you learned during the day.' },
  { id: 'screens-off', topic: 'sleep', emoji: '📵', ar: 'ضو الشاشات قبل النوم بيصعّب النوم، فالأحسن نطفّيها قبل بساعة.', en: 'Screen light before bed makes sleep harder, so switch screens off an hour before.' },
  // teeth
  { id: 'brush-2x2', topic: 'teeth', emoji: '🪥', ar: 'منفرّش أسناننا مرتين باليوم، دقيقتين كل مرة.', en: 'Brush twice a day, two minutes each time.' },
  { id: 'enamel', topic: 'teeth', emoji: '💎', ar: 'مينا الأسنان أقسى مادة بجسم الإنسان!', en: 'Tooth enamel is the hardest substance in the human body!' },
  { id: 'sugar-bugs', topic: 'teeth', emoji: '🦠', ar: 'السكر بيغذّي البكتيريا اللي بتعمل تسوّس.', en: 'Sugar feeds the bacteria that cause cavities.' },
  { id: 'baby-teeth', topic: 'teeth', emoji: '🦷', ar: 'الأطفال عندهم ٢٠ سن لبني، ومهم ننظّفهم لأنهم بيحجزوا مكان الأسنان الدايمة.', en: 'Kids have 20 baby teeth, and keeping them clean saves space for adult teeth.' },
  // habits
  { id: 'breakfast', topic: 'habits', emoji: '🍳', ar: 'الفطور بيعطيك طاقة تركّز فيها بالمدرسة.', en: 'Breakfast gives you energy to focus at school.' },
  { id: 'slow-eat', topic: 'habits', emoji: '🐢', ar: 'الأكل ببطء بيعطي جسمك وقت يحس إنه شبع.', en: 'Eating slowly gives your body time to feel full.' },
  { id: 'hands', topic: 'habits', emoji: '🧼', ar: 'غسل الإيدين بالمي والصابون ٢٠ ثانية قبل الأكل بيبعد الجراثيم.', en: 'Washing hands with soap for 20 seconds before eating keeps germs away.' },
  { id: 'olive-oil', topic: 'habits', emoji: '🫒', ar: 'زيت الزيتون من خير بلادنا، وفيه دهون مفيدة للقلب.', en: 'Olive oil, from our land, has fats that are good for the heart.' },
]
export const factById = Object.fromEntries(FACTS.map((f) => [f.id, f]))
export const factsOf = (topic) => FACTS.filter((f) => f.topic === topic)

// True / false quiz. Each statement links to the fact that explains it.
export const QUIZ = [
  { id: 'q1', fact: 'carrot-eyes', answer: true, ar: 'الجزر بيساعد العيون تشوف بالعتمة.', en: 'Carrots help eyes see in dim light.' },
  { id: 'q2', fact: 'broc-c', answer: true, ar: 'البروكلي فيه فيتامين C.', en: 'Broccoli has vitamin C.' },
  { id: 'q3', fact: 'tomato-fruit', answer: true, ar: 'البندورة علميًا فاكهة.', en: 'A tomato is scientifically a fruit.' },
  { id: 'q4', fact: 'cucumber-water', answer: false, ar: 'الخيار ما فيه مي تقريبًا.', en: 'Cucumbers have almost no water.' },
  { id: 'q5', fact: 'whole-fruit', answer: false, ar: 'العصير أحسن من الفاكهة الكاملة.', en: 'Juice is better than whole fruit.' },
  { id: 'q6', fact: 'banana-k', answer: true, ar: 'الموز فيه بوتاسيوم مهم للعضلات.', en: 'Bananas have potassium for muscles.' },
  { id: 'q7', fact: 'watermelon', answer: true, ar: 'البطيخ أكثر من نصه مي.', en: 'Watermelon is more than half water.' },
  { id: 'q8', fact: 'wholegrain', answer: false, ar: 'الخبز الأبيض والخبز الأسمر فيهم نفس الألياف.', en: 'White and whole-wheat bread have the same fibre.' },
  { id: 'q9', fact: 'freekeh', answer: true, ar: 'الفريكة مصنوعة من القمح.', en: 'Freekeh is made from wheat.' },
  { id: 'q10', fact: 'plant-protein', answer: false, ar: 'النباتات ما فيها بروتين أبدًا.', en: 'Plants have no protein at all.' },
  { id: 'q11', fact: 'protein-bricks', answer: true, ar: 'البروتين بيبني العضلات.', en: 'Protein builds muscles.' },
  { id: 'q12', fact: 'fish-omega', answer: true, ar: 'السمك مفيد للدماغ.', en: 'Fish is good for the brain.' },
  { id: 'q13', fact: 'calcium', answer: false, ar: 'الحليب ما فيه كالسيوم.', en: 'Milk has no calcium.' },
  { id: 'q14', fact: 'vit-d', answer: true, ar: 'الشمس بتساعد الجسم يصنع فيتامين D.', en: 'Sunlight helps the body make vitamin D.' },
  { id: 'q15', fact: 'body-water', answer: true, ar: 'أكثر من نص جسمك مي.', en: 'More than half of your body is water.' },
  { id: 'q16', fact: 'soda', answer: false, ar: 'المشروبات الغازية بتروي العطش أحسن من المي.', en: 'Fizzy drinks quench thirst better than water.' },
  { id: 'q17', fact: 'sixty', answer: true, ar: 'الأطفال بيحتاجوا حوالي ساعة حركة باليوم.', en: 'Kids need about an hour of moving a day.' },
  { id: 'q18', fact: 'heart-muscle', answer: false, ar: 'الحركة بتضعّف القلب.', en: 'Moving makes the heart weaker.' },
  { id: 'q19', fact: 'jump-bones', answer: true, ar: 'النط بيقوّي العظام.', en: 'Jumping makes bones stronger.' },
  { id: 'q20', fact: 'grow-sleep', answer: false, ar: 'النوم ما إله علاقة بالنمو.', en: 'Sleep has nothing to do with growing.' },
  { id: 'q21', fact: 'screens-off', answer: true, ar: 'الشاشات قبل النوم بتصعّب النوم.', en: 'Screens before bed make sleep harder.' },
  { id: 'q22', fact: 'brush-2x2', answer: false, ar: 'مرة وحدة تفريش بالأسبوع بتكفي.', en: 'Brushing once a week is enough.' },
  { id: 'q23', fact: 'enamel', answer: true, ar: 'مينا الأسنان أقسى مادة بالجسم.', en: 'Enamel is the hardest thing in the body.' },
  { id: 'q24', fact: 'baby-teeth', answer: false, ar: 'الأسنان اللبنية مش مهم ننظّفها لأنها رح توقع.', en: 'Baby teeth do not need cleaning because they fall out.' },
  { id: 'q25', fact: 'sugar-bugs', answer: true, ar: 'السكر بيساعد البكتيريا تعمل تسوّس.', en: 'Sugar helps bacteria cause cavities.' },
  { id: 'q26', fact: 'hands', answer: true, ar: 'غسل الإيدين قبل الأكل بيبعد الجراثيم.', en: 'Washing hands before eating keeps germs away.' },
  { id: 'q27', fact: 'slow-eat', answer: true, ar: 'الأكل ببطء بيساعدك تحس بالشبع.', en: 'Eating slowly helps you feel full.' },
  { id: 'q28', fact: 'leafy-iron', answer: true, ar: 'الملوخية والسبانخ فيهم حديد.', en: 'Molokhia and spinach have iron.' },
  { id: 'q29', fact: 'dates', answer: false, ar: 'التمر ما بيعطي طاقة.', en: 'Dates give no energy.' },
  { id: 'q30', fact: 'olive-oil', answer: true, ar: 'زيت الزيتون فيه دهون مفيدة.', en: 'Olive oil has healthy fats.' },
]

// "Sometimes foods" for the catch game: fine at a party, not every day.
// Framed as "sometimes", never as bad food.
export const SOMETIMES = [
  { id: 's-candy', emoji: '🍭', ar: 'مصاصة', en: 'Lollipop' },
  { id: 's-donut', emoji: '🍩', ar: 'دونات', en: 'Donut' },
  { id: 's-soda', emoji: '🥤', ar: 'مشروب غازي', en: 'Fizzy drink' },
  { id: 's-fries', emoji: '🍟', ar: 'بطاطا مقلية', en: 'Fries' },
  { id: 's-sweet', emoji: '🍬', ar: 'سكاكر', en: 'Sweets' },
  { id: 's-cake', emoji: '🧁', ar: 'كب كيك', en: 'Cupcake' },
  { id: 's-choc', emoji: '🍫', ar: 'شوكولاتة', en: 'Chocolate' },
]

// a fact that explains where a food belongs (used after a wrong answer)
export function factForFood(food) {
  const pool = factsOf(food.category)
  const own = FACTS.find((f) => f.emoji === food.emoji)
  return own || pool[Math.floor(Math.random() * pool.length)] || FACTS[0]
}
