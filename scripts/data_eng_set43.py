# -*- coding: utf-8 -*-
# Set 43: Reading Comprehension & Critical Analysis (kru-4201 to kru-4300)

# 20 Academic Passages with 5 Questions Each

SET43_QUESTIONS = [
    # --- Passage 1: Digital Screen Time and Child Development (kru-4201 to kru-4205) ---
    (
        "kru-4201",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Recent pediatric studies indicate that excessive screen exposure among children under six can impede neural pathway formation crucial for attentional control. While educational software boasts interactive benefits, passive consumption of high-paced animations tends to overstimulate developing sensory receptors, leading to reduced patience and compromised sustained attention.)\n\nWhat is the primary purpose of the passage?",
        "To warn of the cognitive downsides of excessive passive screen exposure in young children",
        ["To advocate for the complete ban of computers in primary schools", "To praise the superior effectiveness of educational animation software", "To describe the physical construction of modern digital tablets"],
        "Main Idea / Primary Purpose: ข้อความเน้นย้ำถึงผลกระทบเชิงลบและเตือนถึงผลเสียทางประสาทวิทยาของการให้เด็กเล็กดูจออย่างไม่จำกัด โดยเฉพาะการดูภาพเคลื่อนไหวเร็วๆ แบบ passive consumption"
    ),
    (
        "kru-4202",
        "[ภาษาอังกฤษ - Reading Comprehension] According to the passage, what specific cognitive vulnerability is exacerbated by high-paced animations?",
        "Sustained attentional capacity and patient focus",
        ["Motor coordination in sports", "Visual color differentiation", "Long-term semantic memory storage"],
        "Supporting Detail: ในบทความระบุชัดเจนว่า 'leading to reduced patience and compromised sustained attention' (ทำให้ความอดทนลดลงและสมาธิจดจ่ออย่างต่อเนื่องบกพร่อง)"
    ),
    (
        "kru-4203",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'impede' in the first sentence is closest in meaning to ________.",
        "hinder",
        ["accelerate", "facilitate", "reinforce"],
        "Vocabulary in Context: คำว่า 'impede' หมายถึง ขัดขวาง กีดขวาง หรือชะลอการพัฒนา (to obstruct or hinder)"
    ),
    (
        "kru-4204",
        "[ภาษาอังกฤษ - Reading Comprehension] What can be inferred about the author's stance on interactive educational software?",
        "The author acknowledges its claimed benefits but remains skeptical of over-reliance on passive media",
        ["The author believes interactive software has zero pedagogical value", "The author fully endorses unrestricted screen access for toddlers", "The author believes traditional books are entirely obsolete"],
        "Inference: ผู้เขียนใช้คำว่า 'While educational software boasts interactive benefits...' แสดงว่ายอมรับข้อดีที่มีการอวดอ้าง แต่ก็ยังสงวนท่าทีและระมัดระวังต่อการเสพสื่อที่ไม่เกิดการโต้ตอบ"
    ),
    (
        "kru-4205",
        "[ภาษาอังกฤษ - Reading Comprehension] The author's tone in the passage can best be described as ________.",
        "cautionary and objective",
        ["dismissive and sarcastic", "overjoyed and celebratory", "belligerent and aggressive"],
        "Tone and Attitude: น้ำเสียงของผู้เขียนเป็นเชิงเตือนด้วยหลักฐานทางกุมารเวชศาสตร์ (cautionary) โดยใช้ภาษาเชิงวิชาการอย่างเป็นกลางและรอบคอบ (objective)"
    ),

    # --- Passage 2: The Critical Period Hypothesis (kru-4206 to kru-4210) ---
    (
        "kru-4206",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Eric Lenneberg's Critical Period Hypothesis posits that language acquisition must occur within a biologically determined developmental window ending roughly at puberty. Beyond this juncture, hemispheric lateralization is thought to solidify, rendering effortless, native-like acquisition—particularly in phonology and complex syntax—substantially more difficult for post-pubescent learners.)\n\nWhat is the central thesis of Lenneberg's hypothesis?",
        "Successful native-like language acquisition is biologically constrained by an age-dependent window",
        ["Adult learners learn foreign vocabularies faster than primary school children", "Language acquisition depends solely on cultural immersion rather than biology", "Puberty enhances neural plasticity for syntactic acquisition"],
        "Main Idea: ทฤษฎี Critical Period Hypothesis ชี้ว่าการเรียนรู้ภาษาอย่างเป็นธรรมชาติแบบเจ้าของภาษามีข้อจำกัดทางชีววิทยาตามช่วงวัย ซึ่งจะยากขึ้นอย่างมากหลังเข้าสู่วัยเจริญพันธุ์ (puberty)"
    ),
    (
        "kru-4207",
        "[ภาษาอังกฤษ - Reading Comprehension] Which linguistic domain is highlighted as particularly vulnerable to late acquisition?",
        "Phonology and complex syntax",
        ["Basic conversational greeting formulas", "Passive reading comprehension", "Writing basic single-word lists"],
        "Supporting Detail: บทความระบุโดยเฉพาะเจาะจงว่า 'particularly in phonology and complex syntax' (โดยเฉพาะในด้านระบบเสียงและไวยากรณ์ที่มีความซับซ้อน)"
    ),
    (
        "kru-4208",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'solidify' in the passage is closest in meaning to ________.",
        "become firmly established and less flexible",
        ["melt into fluid components", "break down into microscopic parts", "expand exponentially in volume"],
        "Vocabulary in Context: ในบริบทของสมอง 'lateralization is thought to solidify' หมายถึง การแบ่งหน้าที่ของสมองสองซีกเริ่มคงที่และมีความยืดหยุ่นน้อยลง (firmly set and inflexible)"
    ),
    (
        "kru-4209",
        "[ภาษาอังกฤษ - Reading Comprehension] Based on the passage, why is second language pronunciation harder for adults than for young children?",
        "Because biological brain lateralization reduces neuroplastic flexibility after puberty",
        ["Because adult learners have smaller vocal tract anatomy", "Because adult learners possess inferior cognitive analytical reasoning", "Because young children have greater grammatical awareness"],
        "Inference: ผู้ใหญ่ฝึกสำเนียงให้เหมือนเจ้าของภาษาได้ยากกว่าเพราะการสูญเสียความยืดหยุ่นของสมอง (loss of neuroplasticity / lateralization solidifies)"
    ),
    (
        "kru-4210",
        "[ภาษาอังกฤษ - Reading Comprehension] Which pedagogical implication most logically stems from the Critical Period Hypothesis?",
        "Early foreign language instruction in primary schools can capitalize on natural neurological receptivity",
        ["Language teaching should be deferred until high school graduation", "Grammar-translation method is the only viable method for kindergarteners", "Pronunciation practice should be entirely banned in adult education"],
        "Pedagogical Implication: นัยเชิงการศึกษาคือ การเริ่มสอนภาษาต่างประเทศตั้งแต่ระดับประถมต้นช่วยให้เด็กใช้ประโยชน์จากความพร้อมทางระบบประสาทที่ยังเปิดกว้างตามธรรมชาติ"
    ),

    # --- Passage 3: Neuroplasticity and Lifelong Learning (kru-4211 to kru-4215) ---
    (
        "kru-4211",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: For decades, conventional neuroscience maintained that the adult human brain was structurally immutable. However, the paradigm of neuroplasticity has revolutionized our understanding: neural circuits continually rewire, prune, and strengthen synaptic connections in response to experiential stimuli and deliberative cognitive practice, demonstrating that intellectual growth remains achievable throughout senescence.)\n\nWhat old dogma does modern neuroscience overturn?",
        "The belief that the structural architecture of the adult brain cannot change",
        ["The notion that memory formation involves physical neurons", "The theory that sensory stimuli stimulate cerebral activity", "The assumption that sleep aids in cognitive consolidation"],
        "Detail / Fact Retrieval: บทความระบุว่าความเชื่อดั้งเดิมที่ว่า 'the adult human brain was structurally immutable' (สมองผู้ใหญ่ไม่สามารถเปลี่ยนแปลงโครงสร้างได้) ได้ถูกล้มล้างลงโดยแนวคิดเรื่อง neuroplasticity"
    ),
    (
        "kru-4212",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'immutable' in the passage is closest in meaning to ________.",
        "unchangeable",
        ["fragile", "unpredictable", "translucent"],
        "Vocabulary in Context: 'immutable' ประกอบด้วย im- (ไม่) + mut (เปลี่ยน) แปลว่า ไม่สามารถเปลี่ยนแปลงได้ (unalterable / unchangeable)"
    ),
    (
        "kru-4213",
        "[ภาษาอังกฤษ - Reading Comprehension] According to the text, what triggers the rewiring of synaptic connections?",
        "Experiential stimuli and deliberative cognitive practice",
        ["Strict surgical intervention and pharmacological stimulants", "Passive exposure to silence and complete darkness", "Genetic predetermination without environmental interaction"],
        "Supporting Detail: ข้อความระบุตรงๆ ว่า 'in response to experiential stimuli and deliberative cognitive practice'"
    ),
    (
        "kru-4214",
        "[ภาษาอังกฤษ - Reading Comprehension] The term 'senescence' near the end of the passage most likely denotes ________.",
        "old age or the biological aging process",
        ["infancy and early childhood", "adolescent emotional turbulence", "formal academic graduation"],
        "Context Clue / Vocabulary: 'throughout senescence' ขยายความเรื่องการเรียนรู้ตลอดชีวิต (lifelong learning) จนถึงวัยชรา (old age / biological aging)"
    ),
    (
        "kru-4215",
        "[ภาษาอังกฤษ - Reading Comprehension] What is the rhetorical structure of this passage?",
        "Contrasting a former theoretical belief with current scientific discovery",
        ["Listing chronological historical dates in sequential order", "Analyzing the pros and cons of pharmaceutical drug treatments", "Presenting a fictitious narrative to entertain readers"],
        "Text Organization: โครงสร้างของบทความคือการเปรียบเทียบความเชื่อดั้งเดิมในอดีต (conventional neuroscience) กับการค้นพบทางวิทยาศาสตร์สมัยใหม่ (neuroplasticity paradigm)"
    ),

    # --- Passage 4: Formative vs. Summative Assessment (kru-4216 to kru-4220) ---
    (
        "kru-4216",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: While summative assessments serve as an 'audit' of learning at the conclusion of an instructional cycle, formative assessment functions as an ongoing navigational compass. By embedding qualitative feedback, self-evaluative rubrics, and diagnostic exit tickets into daily routines, formative practices empower instructors to recalibrate pedagogical pacing before deficits compound into insurmountable failures.)\n\nWhat metaphor does the author use to characterize formative assessment?",
        "A navigational compass",
        ["An economic audit", "An insurmountable obstacle", "A final verdict"],
        "Detail / Metaphor: ข้อความเปรียบเทียบว่า 'formative assessment functions as an ongoing navigational compass' (เข็มทิศนำทางที่คอยบอกทิศทางอย่างต่อเนื่อง)"
    ),
    (
        "kru-4217",
        "[ภาษาอังกฤษ - Reading Comprehension] What is the primary benefit of formative practices identified in the passage?",
        "Enabling teachers to adjust instruction before student misunderstandings become severe",
        ["Assigning final letter grades for academic transcripts", "Ranking students against provincial percentiles", "Minimizing teacher-student classroom communication"],
        "Supporting Detail: ประโยชน์หลักคือ 'empower instructors to recalibrate pedagogical pacing before deficits compound into insurmountable failures'"
    ),
    (
        "kru-4218",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'recalibrate' in the passage is closest in meaning to ________.",
        "adjust and readjust",
        ["permanently terminate", "blindly maintain", "harshly penalize"],
        "Vocabulary in Context: 'recalibrate' หมายถึง การปรับแก้ หรือปรับเปลี่ยนจังหวะการสอนให้สอดคล้องกับความเข้าใจของผู้เรียน (to adjust precisely)"
    ),
    (
        "kru-4219",
        "[ภาษาอังกฤษ - Reading Comprehension] Which of the following is cited in the passage as a tool for formative assessment?",
        "Diagnostic exit tickets and qualitative feedback",
        ["Standardized national entrance examinations", "Annual end-of-term report cards", "High-stakes licensing tests"],
        "Detail Retrieval: ในบทความกล่าวถึง 'qualitative feedback, self-evaluative rubrics, and diagnostic exit tickets'"
    ),
    (
        "kru-4220",
        "[ภาษาอังกฤษ - Reading Comprehension] How does the author differentiate between summative and formative assessment?",
        "Summative is evaluative and retrospective, whereas formative is diagnostic and instructional",
        ["Summative is designed for toddlers, whereas formative is for university scholars", "Summative uses no numbers, whereas formative uses strict percentages", "Summative is administered daily, whereas formative occurs once a decade"],
        "Critical Analysis / Contrast: Summative ประเมินผลสรุปย้อนหลัง (audit at conclusion) ในขณะที่ Formative เน้นการวินิจฉัยและปรับปรุงระหว่างเรียน (compass for ongoing guidance)"
    ),

    # --- Passage 5: Climate Change and Food Security (kru-4221 to kru-4225) ---
    (
        "kru-4221",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Climatic volatility—manifested in protracted droughts, unseasonal frosts, and soil salinization—presents an existential crisis for global agrarian output. Without genetically diversified crop varietals and regenerative soil management, equatorial regions face imminent harvest collapses, threatening to plunge vulnerable agrarian communities into severe chronic malnutrition.)\n\nWhat is the main topic of the passage?",
        "The catastrophic risks of climate volatility on agricultural yields and food security",
        ["The commercial profitability of genetically modified fertilizer exports", "The aesthetic beauty of traditional equatorial farming landscapes", "The architectural design of modern automated grain silos"],
        "Main Idea: หัวข้อหลักคือผลกระทบของความแปรปรวนสภาพภูมิอากาศที่คุกคามผลผลิตทางการเกษตรและความมั่นคงทางอาหารของโลก"
    ),
    (
        "kru-4222",
        "[ภาษาอังกฤษ - Reading Comprehension] According to the text, which geographical regions are most immediately threatened?",
        "Equatorial regions",
        ["Arctic tundras", "Temperate alpine valleys", "Subpolar archipelagos"],
        "Detail: ข้อความระบุว่า 'equatorial regions face imminent harvest collapses'"
    ),
    (
        "kru-4223",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'protracted' in the passage is closest in meaning to ________.",
        "prolonged and extended",
        ["abrupt and sudden", "moderate and gentle", "sporadic and minor"],
        "Vocabulary in Context: 'protracted droughts' หมายถึง ภัยแล้งที่ยืดเยื้อ ยาวนาน ต่อเนื่อง (extended in time / prolonged)"
    ),
    (
        "kru-4224",
        "[ภาษาอังกฤษ - Reading Comprehension] What two solutions does the author explicitly suggest to mitigate crop failure?",
        "Genetically diversified crop varietals and regenerative soil management",
        ["Increased reliance on synthetic chemical insecticides and monoculture", "Constructing massive concrete floodwalls around all farmlands", "Abandoning farming completely to focus solely on livestock"],
        "Supporting Detail: ผู้เขียนระบุทางออกไว้ชัดเจนว่า 'genetically diversified crop varietals and regenerative soil management'"
    ),
    (
        "kru-4225",
        "[ภาษาอังกฤษ - Reading Comprehension] The author's primary concern in this passage is ________.",
        "humanitarian and environmental survival",
        ["maximizing multinational corporate agribusiness profit margins", "promoting tourism in equatorial rural villages", "encouraging urban industrial factory development"],
        "Author's Purpose / Concern: ผู้เขียนมีความห่วงใยในมิติด้านมนุษยธรรมและสิ่งแวดล้อม (humanitarian & environmental) เรื่องความอดอยากและการอยู่รอดของชุมชนเกษตรกรรม"
    ),

    # --- Passage 6: English as a Global Lingua Franca (kru-4226 to kru-4230) ---
    (
        "kru-4226",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: The metamorphosis of English into a global lingua franca (ELF) has fundamentally challenged the longstanding hegemony of native-speaker norms. Today, non-native speakers vastly outnumber native counterparts. In multilingual interactions, communicative intelligibility and strategic pragmatic competence take precedence over rigid conformity to British Received Pronunciation or General American phonology.)\n\nWhat shift in English language pedagogy is described in the passage?",
        "A shift from strict native-speaker phonological imitation to communicative intelligibility and pragmatic competence",
        ["A return to traditional Victorian grammatical rote-drilling methods", "An outright ban on learning vocabulary beyond basic slang terms", "A legal mandate that all international commerce be conducted in Latin"],
        "Main Idea: บทความอธิบายถึงการเปลี่ยนกระบวนทัศน์จากการยึดติดสำเนียงเจ้าของภาษา (native-speaker norms) มาสู่ความสามารถในการสื่อสารที่เข้าใจได้ (intelligibility) และสมรรถนะเชิงปฏิบัติการ (pragmatic competence)"
    ),
    (
        "kru-4227",
        "[ภาษาอังกฤษ - Reading Comprehension] The demographic reality highlighted in the passage is that ________.",
        "non-native speakers of English outnumber native speakers",
        ["native speakers constitute 90% of all international communicators", "the total number of English learners is rapidly dwindling to zero", "only residents of the British Isles can master complex syntax"],
        "Fact Retrieval: 'Today, non-native speakers vastly outnumber native counterparts' (ผู้พูดภาษาอังกฤษที่ไม่ใช่เจ้าของภาษามีจำนวนมากกว่าเจ้าของภาษาอย่างท่วมท้น)"
    ),
    (
        "kru-4228",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'hegemony' in the passage is closest in meaning to ________.",
        "dominant influence or authority",
        ["complete weakness", "accidental discovery", "gradual dissolution"],
        "Vocabulary in Context: 'hegemony' หมายถึง ความเป็นเจ้า อำนาจครอบงำ หรืออิทธิพลนำ (predominance / dominant leadership)"
    ),
    (
        "kru-4229",
        "[ภาษาอังกฤษ - Reading Comprehension] What does the phrase 'take precedence over' mean in this context?",
        "be considered more important than",
        ["be completely replaced by", "occur simultaneously with", "be judged inferior to"],
        "Idiomatic Phrasal Expression: 'take precedence over' หมายถึง มีความสำคัญหรือได้รับการพิจารณาก่อนสิ่งอื่น (to have greater priority or importance)"
    ),
    (
        "kru-4230",
        "[ภาษาอังกฤษ - Reading Comprehension] How should contemporary English teachers adjust their classroom expectations based on this passage?",
        "By prioritizing functional communicative effectiveness rather than penalizing minor non-native accents",
        ["By demanding that all students adopt a flawless Oxford British accent", "By eliminating all spoken language practice from the syllabus", "By teaching only archaic Elizabethan vocabulary"],
        "Inference / Application: ครูผู้สอนควรปรับความคาดหวังโดยมุ่งเน้นที่ประสิทธิผลในการสื่อสาร มากกว่าการลงโทษหรือหักคะแนนสำเนียงที่ไม่ใช่เจ้าของภาษาตราบใดที่สื่อสารเข้าใจชัดเจน"
    ),

    # --- Passage 7: Metacognition and Self-Regulated Learning (kru-4231 to kru-4235) ---
    (
        "kru-4231",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Metacognition—often colloquially termed 'thinking about one's own thinking'—comprises knowledge of cognition and regulation of cognition. Proficient learners do not merely absorb information passively; they plan problem-solving trajectories, monitor ongoing comprehension during reading, and retrospectively evaluate the efficacy of their learning heuristics, modifying approaches when comprehension breaks down.)\n\nWhat are the two core dimensions of metacognition mentioned in the text?",
        "Knowledge of cognition and regulation of cognition",
        ["Rote memorization and mechanical drilling", "Physical stamina and visual acuity", "External rewards and punitive grading"],
        "Detail: ข้อความระบุโดยตรงว่า 'comprises knowledge of cognition and regulation of cognition'"
    ),
    (
        "kru-4232",
        "[ภาษาอังกฤษ - Reading Comprehension] According to the passage, what action does a proficient reader take when comprehension breaks down?",
        "Modifies their learning approach or strategy",
        ["Quits reading immediately and avoids future books", "Copies the entire paragraph without thinking", "Blames the author for difficult vocabulary"],
        "Supporting Detail: 'modifying approaches when comprehension breaks down' (ปรับเปลี่ยนวิธีการเมื่อไม่เข้าใจเนื้อเรื่อง)"
    ),
    (
        "kru-4233",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'efficacy' in the third sentence is closest in meaning to ________.",
        "effectiveness",
        ["complexity", "brevity", "costliness"],
        "Vocabulary in Context: 'efficacy' หมายถึง ประสิทธิผล หรือความสามารถในการบรรลุผลตามที่ต้องการ (the ability to produce a desired or intended result)"
    ),
    (
        "kru-4234",
        "[ภาษาอังกฤษ - Reading Comprehension] The author implies that passive learners differ from proficient learners primarily in their ________.",
        "lack of deliberate self-monitoring and strategic adjustment",
        ["innate biological intelligence quotient", "access to expensive multimedia computers", "physical eyesight and auditory perception"],
        "Inference: ผู้เรียนแบบรับข้อมูลฝ่ายเดียว (passive) ขาดการติดตามตรวจสอบตนเองและการปรับกลยุทธ์เมื่อเทียบกับ proficient learners"
    ),
    (
        "kru-4235",
        "[ภาษาอังกฤษ - Reading Comprehension] Which classroom technique would best promote metacognitive reflection?",
        "Encouraging students to write learning logs describing what strategies worked best for them",
        ["Having students copy long dictionary definitions ten times each", "Administering surprise pop quizzes with no subsequent discussion", "Grading students solely on their handwriting neatness"],
        "Pedagogical Application: การให้นักเรียนเขียนบันทึกการเรียนรู้ (learning logs) วิเคราะห์ว่าวิธีใดช่วยให้ตนเรียนรู้ได้ดีที่สุด เป็นการส่งเสริมการคิดเรื่องกระบวนการคิดของตนเองโดยตรง"
    ),

    # --- Passage 8: Bilingualism and Executive Function (kru-4236 to kru-4240) ---
    (
        "kru-4236",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Empirical investigations led by Ellen Bialystok demonstrate that lifelong bilingualism confers substantial advantages in executive control—the cognitive suite responsible for task-switching, inhibitory control, and working memory. Because a bilingual speaker's linguistic systems are continuously active simultaneously, the brain must perpetually resolve competition between competing representations, thereby fortifying frontostriatal brain networks.)\n\nWhat is the central finding of Bialystok's research?",
        "Bilingualism enhances executive control through continuous practice in resolving linguistic competition",
        ["Bilingualism inevitably causes severe developmental speech delays in infants", "Monolinguals consistently outperform bilinguals in non-verbal logic tasks", "Learning a second language shrinks the frontal lobes of the human brain"],
        "Main Idea: งานวิจัยของ Bialystok พบว่าการรู้สองภาษาช่วยพัฒนาความสามารถในการบริหารจัดการสมองส่วนหน้า (Executive Functions) จากการฝึกบริหารจัดการระบบภาษาที่ทำงานพร้อมกันตลอดเวลา"
    ),
    (
        "kru-4237",
        "[ภาษาอังกฤษ - Reading Comprehension] What three sub-skills of executive control are explicitly listed in the text?",
        "Task-switching, inhibitory control, and working memory",
        ["Spelling accuracy, handwriting speed, and voice volume", "Drawing skills, singing pitch, and athletic agility", "Historical recall, mathematical proofing, and artistic balance"],
        "Detail Retrieval: บทความแจกแจงไว้ว่า 'the cognitive suite responsible for task-switching, inhibitory control, and working memory'"
    ),
    (
        "kru-4238",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'perpetually' in the passage is closest in meaning to ________.",
        "continuously and incessantly",
        ["rarely and occasionally", "unwillingly and resentfully", "briefly and superficially"],
        "Vocabulary in Context: 'perpetually' หมายถึง ตลอดเวลา อย่างไม่หยุดยั้ง (constantly, perpetually, without interruption)"
    ),
    (
        "kru-4239",
        "[ภาษาอังกฤษ - Reading Comprehension] Why must a bilingual person's brain constantly exert cognitive effort?",
        "Because both language systems are activated simultaneously, requiring inhibition of the non-target language",
        ["Because bilinguals must translate every single word into Latin first", "Because their vocal cords become fatigued from alternating accents", "Because society constantly tests bilinguals with surprise grammar exams"],
        "Inference / Mechanism: สมองของคนสองภาษาเปิดใช้งานทั้งสองภาษาตลอดเวลา จึงต้องใช้พลังในการยับยั้ง (inhibit) ภาษาที่ไม่ต้องการใช้ในขณะนั้น"
    ),
    (
        "kru-4240",
        "[ภาษาอังกฤษ - Reading Comprehension] What neurological impact of bilingualism is explicitly mentioned?",
        "Fortification of frontostriatal brain networks",
        ["Permanent degeneration of the temporal lobe", "Excessive swelling of the cerebellum", "Total calcification of the auditory cortex"],
        "Supporting Detail: ข้อความระบุในประโยคสุดท้ายว่า 'thereby fortifying frontostriatal brain networks'"
    ),

    # --- Passage 9: Inquiry-Based Learning in STEM (kru-4241 to kru-4245) ---
    (
        "kru-4241",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: In traditional science didactic models, instructors transmit established theorems, while students execute formulaic cookbook experiments with predetermined outcomes. Inquiry-based learning (IBL) upends this passivity by positioning students as active investigators. Pupils formulate testable hypotheses, manipulate independent variables, and derive conclusions from self-gathered empirical data, fostering authentic scientific reasoning.)\n\nHow does Inquiry-Based Learning (IBL) fundamentally differ from traditional science teaching?",
        "IBL engages learners as active investigators formulating hypotheses rather than following cookbook recipes",
        ["IBL eliminates all hands-on laboratory equipment from the science curriculum", "IBL requires students to memorize textbooks without doing experiments", "IBL restricts scientific discussion exclusively to theoretical mathematics"],
        "Main Contrast / Main Idea: IBL พลิกโฉมการเรียนรู้โดยให้นักเรียนเป็นผู้สืบเสาะ ค้นคว้า และตั้งสมมติฐานด้วยตนเอง แทนที่จะทำการทดลองแบบท่องจำตามสูตรสำเร็จ (cookbook experiments)"
    ),
    (
        "kru-4242",
        "[ภาษาอังกฤษ - Reading Comprehension] What derogatory term does the author use to characterize traditional laboratory activities?",
        "Cookbook experiments",
        ["Authentic inquiries", "Empirical breakthroughs", "Didactic triumphs"],
        "Detail / Author's Diction: ผู้เขียนใช้คำเชิงวิจารณ์ว่า 'formulaic cookbook experiments with predetermined outcomes' (การทดลองแบบตำราอาหารที่มีผลลัพธ์ตายตัวล่วงหน้า)"
    ),
    (
        "kru-4243",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'upends' in the passage is closest in meaning to ________.",
        "overturns and transforms",
        ["supports and preserves", "ignores and sidesteps", "reduces and weakens"],
        "Vocabulary in Context: 'upends' หมายถึง พลิกกลับด้าน ล้มล้างกระบวนทัศน์เดิม (to overturn completely)"
    ),
    (
        "kru-4244",
        "[ภาษาอังกฤษ - Reading Comprehension] According to the passage, which of the following is a key activity undertaken by students in IBL?",
        "Manipulating independent variables and deriving conclusions from data",
        ["Copying the teacher's lecture notes verbatim from the board", "Waiting for the instructor to announce the correct answers", "Purchasing pre-fabricated science fair displays online"],
        "Detail Retrieval: บทความระบุว่า 'Pupils formulate testable hypotheses, manipulate independent variables, and derive conclusions...'"
    ),
    (
        "kru-4245",
        "[ภาษาอังกฤษ - Reading Comprehension] What primary cognitive outcome does IBL foster in students?",
        "Authentic scientific reasoning",
        ["Blind obedience to laboratory authority", "Speed in mechanical rote memorization", "Passive compliance during lectures"],
        "Supporting Detail: ประโยคสุดท้ายระบุชัดเจนว่า 'fostering authentic scientific reasoning' (ปลูกฝังการคิดหาเหตุผลเชิงวิทยาศาสตร์ที่แท้จริง)"
    ),

    # --- Passage 10: Classroom Management and Restorative Justice (kru-4246 to kru-4250) ---
    (
        "kru-4246",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Zero-tolerance disciplinary policies—predicated on automatic suspensions and punitive exclusions—disproportionately disenfranchise marginalized youth and fuel the 'school-to-prison pipeline.' In contrast, restorative justice paradigms frame infractions as interpersonal harm rather than mere rule violations. By facilitating mediated dialogue between victims and perpetrators, restorative conferences cultivate accountability, repair relational fractures, and restore communal harmony.)\n\nWhat is the primary argument against zero-tolerance policies in the text?",
        "They disenfranchise marginalized youth and contribute to the school-to-prison pipeline",
        ["They cost too little money to implement effectively in schools", "They result in excessive praise and rewards for troublemakers", "They require too many parent-teacher conferences each week"],
        "Supporting Detail: ผู้เขียนระบุว่า zero-tolerance policies 'disproportionately disenfranchise marginalized youth and fuel the school-to-prison pipeline'"
    ),
    (
        "kru-4247",
        "[ภาษาอังกฤษ - Reading Comprehension] How does restorative justice view behavioral infractions?",
        "As harm inflicted upon interpersonal relationships rather than mere rule violations",
        ["As permanent genetic character flaws that cannot be repaired", "As minor jokes that should be completely overlooked by teachers", "As criminal felonies requiring immediate armed police intervention"],
        "Contrast / Core Concept: แนวคิด Restorative Justice (ความยุติธรรมเชิงสมานฉันท์) มองการกระทำผิดว่าคือ 'ความเสียหายต่อความสัมพันธ์ระหว่างบุคคล' ไม่ใช่แค่การฝ่าฝืนกฎ"
    ),
    (
        "kru-4248",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'perpetrators' in the passage refers to ________.",
        "individuals who committed the behavioral harm or offense",
        ["neutral school guidance counselors", "bystanders who witnessed the event", "school board administrators"],
        "Vocabulary in Context: 'perpetrators' หมายถึง ผู้ก่อเหตุ หรือผู้กระทำความผิด/สร้างความเสียหาย"
    ),
    (
        "kru-4249",
        "[ภาษาอังกฤษ - Reading Comprehension] According to the text, what is a primary outcome of restorative conferences?",
        "Cultivating accountability and repairing relational fractures",
        ["Imposing severe corporal punishment on students", "Permanently expelling difficult students from the district", "Fining parents substantial sums of money"],
        "Supporting Detail: บทความระบุว่า restorative conferences 'cultivate accountability, repair relational fractures, and restore communal harmony'"
    ),
    (
        "kru-4250",
        "[ภาษาอังกฤษ - Reading Comprehension] The author's perspective toward restorative justice can best be characterized as ________.",
        "strongly supportive and advocating systemic reform",
        ["deeply skeptical and dismissive", "neutral and indifferent", "hostile and condemning"],
        "Author's Attitude: ผู้เขียนสนับสนุนแนวทาง Restorative Justice อย่างเด่นชัด โดยมองว่าเป็นทางออกที่ดีกว่าการลงโทษแบบตัดสิทธิ์ (punitive exclusions)"
    ),

    # --- Passage 11: Artificial Intelligence in Education (kru-4251 to kru-4255) ---
    (
        "kru-4251",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: The infiltration of generative artificial intelligence into academic ecosystems has triggered profound pedagogical dilemmas. While generative large language models can provide personalized real-time tutoring and scaffold multilingual learners, they also jeopardize epistemic agency. If students rely indiscriminately on automated algorithmic text synthesis, they forfeit the rigorous cognitive grappling necessary to develop critical discernment and original synthesis.)\n\nWhat is the central paradox of generative AI in education presented in the passage?",
        "AI provides personalized tutoring yet threatens students' critical thinking and epistemic agency if overused",
        ["AI is too expensive for schools yet produces completely flawless essays", "AI replaces all human teachers while making classrooms noisy", "AI improves physical handwriting but slows down typing speeds"],
        "Main Idea / Paradox: ความขัดแย้งเชิงปัญญาคือ AI ช่วยเสริมการสอนรายบุคคลได้ดี แต่หากพึ่งพามากเกินไปจะทำลายกระบวนการคิดเชิงวิพากษ์และการใช้ปัญญาของผู้เรียน (epistemic agency)"
    ),
    (
        "kru-4252",
        "[ภาษาอังกฤษ - Reading Comprehension] What risk occurs if students rely indiscriminately on AI-generated text?",
        "They miss the cognitive grappling needed to develop critical discernment and original thought",
        ["Their computers will automatically catch computer viruses", "They will forget how to speak their mother tongue", "Their school fees will triple immediately"],
        "Supporting Detail: ข้อความระบุว่า 'they forfeit the rigorous cognitive grappling necessary to develop critical discernment and original synthesis'"
    ),
    (
        "kru-4253",
        "[ภาษาอังกฤษ - Reading Comprehension] The phrase 'epistemic agency' in this context refers to ________.",
        "the learner's capacity to independently construct, evaluate, and take ownership of knowledge",
        ["the legal copyright ownership of university buildings", "the commercial licensing of software products", "the government ministry's power to hire civil servants"],
        "Conceptual Understanding: 'epistemic agency' หมายถึง ความสามารถของผู้เรียนในการเป็นผู้สร้าง ประเมิน และเป็นเจ้าของการเรียนรู้ด้วยตนเองอย่างมีอิสระทางปัญญา"
    ),
    (
        "kru-4254",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'indiscriminately' in the passage is closest in meaning to ________.",
        "without careful thought or distinction",
        ["with extreme caution and wisdom", "infrequently and rarely", "under strict legal surveillance"],
        "Vocabulary in Context: 'rely indiscriminately' หมายถึง พึ่งพาอย่างไร้การแยกแยะ ขาดการไตร่ตรองรอบคอบ (uncritically / without making careful distinctions)"
    ),
    (
        "kru-4255",
        "[ภาษาอังกฤษ - Reading Comprehension] What advice would the author most likely give to educators regarding AI?",
        "Integrate AI critically to support learning while requiring students to engage in rigorous independent analysis",
        ["Ban electricity completely to prevent students from using computers", "Allow AI to write all doctoral dissertations without human review", "Replace all literature teachers with automated chat algorithms"],
        "Inference / Application: ผู้เขียนชี้ว่าควรใช้ AI อย่างมีวิจารณญาณ โดยยังคงบังคับให้ผู้เรียนต้องผ่านกระบวนการคิดและวิเคราะห์อย่างลึกซึ้งด้วยตนเอง"
    ),

    # --- Passage 12: Differentiated Instruction (kru-4256 to kru-4260) ---
    (
        "kru-4256",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: In an era of inclusive education, heterogeneous classrooms are the norm rather than the exception. Differentiated instruction rejects the fallacious 'one-size-fits-all' paradigm. By modifying curricular content, learning processes, or student products according to learners' readiness levels, interests, and learning profiles, educators can ensure that both gifted achievers and struggling pupils receive optimal cognitive challenge.)\n\nWhat core assumption does differentiated instruction explicitly reject?",
        "The notion that a single standardized instructional approach fits all diverse learners",
        ["The idea that students should attend school in person", "The belief that learning requires mental effort", "The requirement that teachers prepare lesson plans"],
        "Main Idea / Rejection: Differentiated instruction ปฏิเสธแนวคิด 'one-size-fits-all' (ขนาดเดียวเหมาะกับทุกคน) ซึ่งเป็นแนวคิดที่ผิดพลาดในการจัดการเรียนรู้"
    ),
    (
        "kru-4257",
        "[ภาษาอังกฤษ - Reading Comprehension] According to Carol Ann Tomlinson's model referenced in the passage, what three instructional elements can teachers differentiate?",
        "Content, process, and product",
        ["Tuition fees, school uniform, and classroom seating", "Physical height, weight, and blood pressure", "Test date, exam hall temperature, and pencil color"],
        "Detail Retrieval: บทความระบุองค์ประกอบ 3 ด้านที่ครูปรับได้: 'modifying curricular content, learning processes, or student products'"
    ),
    (
        "kru-4258",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'fallacious' in the second sentence is closest in meaning to ________.",
        "erroneous and misleading",
        ["universally verified", "scientifically rigorous", "immensely profitable"],
        "Vocabulary in Context: 'fallacious' หมายถึง ซึ่งผิดพลาด ผิดตรรกะ หรือชวนให้เข้าใจผิด (false / misleading / erroneous)"
    ),
    (
        "kru-4259",
        "[ภาษาอังกฤษ - Reading Comprehension] What is the desired outcome of differentiated instruction for both gifted and struggling students?",
        "Receiving optimal cognitive challenge tailored to their respective needs",
        ["Getting the exact same numerical mark on every test", "Finishing all classroom tasks in less than five minutes", "Competing aggressively to humiliate underperforming peers"],
        "Supporting Detail: ข้อความระบุว่าเป้าหมายคือ 'ensure that both gifted achievers and struggling pupils receive optimal cognitive challenge'"
    ),
    (
        "kru-4260",
        "[ภาษาอังกฤษ - Reading Comprehension] Which variable is NOT mentioned as a basis for student differentiation?",
        "Socioeconomic household income",
        ["Learner readiness levels", "Personal interests", "Learning profiles"],
        "Negative Fact / Detail: บทความระบุ 'readiness levels, interests, and learning profiles' แต่ไม่ได้ระบุระดับรายได้ของครัวเรือน (socioeconomic income)"
    ),

    # --- Passage 13: Self-Determination Theory (kru-4261 to kru-4265) ---
    (
        "kru-4261",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Edward Deci and Richard Ryan's Self-Determination Theory (SDT) posits that human psychological flourishing hinges on the fulfillment of three innate psychological needs: autonomy, competence, and relatedness. When scholastic environments rely excessively on extrinsic contingencies like gold stars or punitive sanctions, intrinsic motivation tends to erode, resulting in superficial, task-avoidant learning behaviors.)\n\nWhat are the three fundamental psychological needs in Self-Determination Theory?",
        "Autonomy, competence, and relatedness",
        ["Wealth, fame, and social status", "Praise, punishments, and report grades", "Speed, accuracy, and physical strength"],
        "Detail Retrieval: ทฤษฎี SDT ของ Deci & Ryan ระบุความต้องการจำเป็นพื้นฐาน 3 ประการคือ ความมีอิสระในการเลือก (Autonomy), ความรู้สึกมีความสามารถ (Competence), และความผูกพันเชื่อมโยงกับผู้อื่น (Relatedness)"
    ),
    (
        "kru-4262",
        "[ภาษาอังกฤษ - Reading Comprehension] What detrimental consequence is associated with excessive reliance on extrinsic rewards?",
        "Erosion of intrinsic motivation and rise of superficial learning behaviors",
        ["Sudden increase in photographic memory capacity", "Complete elimination of classroom behavioral conflicts", "Exponential expansion of student vocabulary banks"],
        "Supporting Detail: ข้อความระบุว่า 'intrinsic motivation tends to erode, resulting in superficial, task-avoidant learning behaviors'"
    ),
    (
        "kru-4263",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'contingencies' in the passage is closest in meaning to ________.",
        "conditional factors or dependencies",
        ["biological organs", "arithmetic formulas", "architectural blueprints"],
        "Vocabulary in Context: 'extrinsic contingencies' หมายถึง ปัจจัยเงื่อนไขภายนอก เช่น การให้รางวัลหรือบทลงโทษที่ขึ้นอยู่กับผลงาน"
    ),
    (
        "kru-4264",
        "[ภาษาอังกฤษ - Reading Comprehension] In an SDT-aligned classroom, a teacher fostering 'autonomy' would most likely ________.",
        "offer students meaningful choices in their project topics and learning formats",
        ["dictate every single step of an assignment without allowing deviation", "punish any student who asks an unapproved question", "insist on complete silence for seven consecutive hours"],
        "Application / Inference: การส่งเสริม Autonomy (ความเป็นเจ้าของตนเอง) ทำได้โดยการให้ทางเลือกที่มีความหมายแก่นักเรียนในการเลือกหัวข้อหรือรูปแบบผลงาน"
    ),
    (
        "kru-4265",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'erode' in the passage means ________.",
        "gradually diminish or wear away",
        ["instantly multiply", "vigorously defend", "publicly celebrate"],
        "Vocabulary in Context: 'erode' ในบริบทจิตวิทยาหมายถึง ค่อยๆ สึกกร่อน เสื่อมถอย หรือลดน้อยลงไปทีละน้อย (gradually wear down)"
    ),

    # --- Passage 14: Phonological Awareness in Early Literacy (kru-4266 to kru-4270) ---
    (
        "kru-4266",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Longitudinal reading research incontrovertibly affirms that phonological awareness—the ability to recognize and manipulate oral sound structures independent of written orthography—is the single most robust predictor of early reading decoding success. Before children can map graphemes to phonemes, they must perceive that spoken words can be segmented into syllables, onsets, rimes, and discrete individual phonemes.)\n\nWhat is the main finding regarding phonological awareness reported in the passage?",
        "It is the single most powerful predictor of success in early reading decoding",
        ["It can only be taught to students after they master cursive writing", "It has no relationship whatsoever with reading comprehension", "It is an innate talent that cannot be developed through classroom games"],
        "Main Idea / Finding: บทความระบุอย่างหนักแน่นว่า 'phonological awareness... is the single most robust predictor of early reading decoding success'"
    ),
    (
        "kru-4267",
        "[ภาษาอังกฤษ - Reading Comprehension] What distinguishes phonological awareness from traditional phonics?",
        "It deals strictly with spoken sounds independent of printed letter symbols (orthography)",
        ["It requires reading complex 500-page novels in silence", "It focuses exclusively on silent grammatical punctuation rules", "It is taught only in university postgraduate seminars"],
        "Supporting Detail: ในบทความเน้นว่า 'the ability to recognize and manipulate oral sound structures independent of written orthography' (การจัดการกับเสียงพูดโดยไม่ขึ้นกับรูปตัวเขียน)"
    ),
    (
        "kru-4268",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'incontrovertibly' in the first sentence means ________.",
        "indisputably and beyond doubt",
        ["questionably and tentatively", "rarely and sporadically", "deceptively and dishonestly"],
        "Vocabulary in Context: 'incontrovertibly' หมายถึง อย่างไม่อาจโต้แย้งได้ มีหลักฐานประจักษ์ชัดเจนจนปฏิเสธไม่ได้ (indisputably / without doubt)"
    ),
    (
        "kru-4269",
        "[ภาษาอังกฤษ - Reading Comprehension] According to the passage, which sub-lexical units are involved in sound segmentation?",
        "Syllables, onsets, rimes, and discrete phonemes",
        ["Paragraphs, chapters, indexes, and glossaries", "Pencils, erasers, sharpeners, and rulers", "Prefixes, roots, suffixes, and punctuation marks"],
        "Detail Retrieval: ข้อความระบุถึง 'syllables, onsets, rimes, and discrete individual phonemes' (พยางค์, เสียงต้น, สระ-ตัวสะกด, และหน่วยเสียงเดี่ยว)"
    ),
    (
        "kru-4270",
        "[ภาษาอังกฤษ - Reading Comprehension] Which classroom activity directly trains phonemic segmentation?",
        "Asking children to tap out the three separate sounds (/k/ - /æ/ - /t/) in the spoken word 'cat'",
        ["Having students color a picture of a cat with blue crayons", "Asking students to run around the soccer field during gym class", "Memorizing the birth year of ancient English poets"],
        "Pedagogical Application: การให้เด็กเคาะจังหวะแยกเสียงหน่วยย่อย /k/ - /æ/ - /t/ ในคำพูด เป็นการฝึก phonemic segmentation โดยตรง"
    ),

    # --- Passage 15: Gamification in Language Learning (kru-4271 to kru-4275) ---
    (
        "kru-4271",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Gamification involves the integration of game-mechanic affordances—such as quest progression, immediate feedback loops, and badge micro-credentials—into non-game pedagogical contexts. While gamified language apps substantially boost short-term user engagement and drill compliance, educational critics warn that over-mechanized leaderboards can provoke debilitating performance anxiety and reduce language learning to trivial point-accumulation.)\n\nWhat is the dual perspective on gamification presented in the text?",
        "It heightens engagement and drill compliance but risks causing anxiety and trivializing learning",
        ["It is totally useless for young children but essential for senior citizens", "It completely eliminates the need for human teachers in schools", "It guarantees instant native fluency in less than two weeks"],
        "Main Idea / Dual Perspective: Gamification ช่วยเพิ่ม engagement และการฝึกฝน แต่ก็มีข้อควรระวังคือการจัดอันดับอาจสร้างความเครียดและลดทอนการเรียนรู้เหลือเพียงการล่าแต้ม"
    ),
    (
        "kru-4272",
        "[ภาษาอังกฤษ - Reading Comprehension] Which game mechanic is explicitly mentioned in the text?",
        "Badge micro-credentials and immediate feedback loops",
        ["Real-money gambling chips", "Violent character combat", "Three-dimensional virtual reality goggles"],
        "Detail: ในบทความกล่าวถึง 'quest progression, immediate feedback loops, and badge micro-credentials'"
    ),
    (
        "kru-4273",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'debilitating' in the passage is closest in meaning to ________.",
        "weakening and impairing",
        ["invigorating and energizing", "harmless and invisible", "mildly amusing"],
        "Vocabulary in Context: 'debilitating anxiety' หมายถึง ความวิตกกังวลที่บั่นทอนกำลังหรือทำให้สมรรถภาพการทำงานถดถอย (paralyzing / weakening)"
    ),
    (
        "kru-4274",
        "[ภาษาอังกฤษ - Reading Comprehension] What do educational critics caution against regarding competitive leaderboards?",
        "They can incite performance anxiety and trivialize meaningful language acquisition",
        ["They cause smartphones to overheat and malfunction", "They consume too much cellular internet data", "They force students to buy expensive gaming consoles"],
        "Supporting Detail: นักวิจารณ์เตือนว่า 'over-mechanized leaderboards can provoke debilitating performance anxiety and reduce language learning to trivial point-accumulation'"
    ),
    (
        "kru-4275",
        "[ภาษาอังกฤษ - Reading Comprehension] The author's tone toward gamification is best characterized as ________.",
        "balanced and critically observant",
        ["blindly fanatical", "unconditionally hostile", "completely indifferent"],
        "Author's Tone: ผู้เขียนนำเสนอทั้งข้อดี (boost engagement) และข้อควรระวัง (anxiety, trivialization) อย่างสมดุลและมีวิจารณญาณ (balanced and critically observant)"
    ),

    # --- Passage 16: Socioeconomic Disparities in Education (kru-4276 to kru-4280) ---
    (
        "kru-4276",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: The socio-economic 'achievement gap' is frequently rooted in disparate early childhood language exposure, famously quantified in the Hart and Risley thirty-million-word gap study. Children from impoverished households often encounter fewer conversational turns and limited complex linguistic scaffolding at home, entering primary school with a marked vocabulary deficit that compounds over time through the 'Matthew Effect' in reading.)\n\nWhat is the central focus of this passage?",
        "How early socioeconomic disparities in language exposure compound into long-term reading gaps",
        ["Why television is the sole cause of student failure in secondary schools", "How wealthy parents cheat on standardized university entrance tests", "Why children should start full-time employment at age seven"],
        "Main Idea: บทความเน้นว่าความเหลื่อมล้ำทางเศรษฐกิจและสังคมในการรับฟังภาษาช่วงปฐมวัย ส่งผลให้เกิดช่องว่างคำศัพท์และขยายตัวเป็นความเหลื่อมล้ำในการอ่านในระยะยาว"
    ),
    (
        "kru-4277",
        "[ภาษาอังกฤษ - Reading Comprehension] What sociological phenomenon does the 'Matthew Effect' describe in reading development?",
        "The rich get richer and the poor get poorer (skilled readers read more and accelerate, while struggling readers fall further behind)",
        ["All students eventually attain the exact same reading score regardless of background", "Reading skills automatically decline after the age of ten", "Boys consistently outperform girls in language examinations"],
        "Concept Explanation: ในการอ่าน 'Matthew Effect' (Stanovich) หมายถึง ปรากฏการณ์ที่เด็กที่อ่านเก่งจะอ่านมากขึ้นและเก่งขึ้นเรื่อยๆ ส่วนเด็กที่อ่านไม่ออกจะยิ่งอ่านน้อยลงและตามหลังเพื่อนมากขึ้นเรื่อยๆ"
    ),
    (
        "kru-4278",
        "[ภาษาอังกฤษ - Reading Comprehension] According to the text, what specific conversational dynamic is often lacking in impoverished early environments?",
        "Interactive conversational turns and complex linguistic scaffolding",
        ["Silent isolation in separate bedrooms", "Formal written grammar drills before breakfast", "Punitive physical chores"],
        "Supporting Detail: ข้อความระบุว่าเด็กจากครอบครัวยากจนมักพบ 'fewer conversational turns and limited complex linguistic scaffolding at home'"
    ),
    (
        "kru-4279",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'disparate' in the first sentence is closest in meaning to ________.",
        "distinctly different and unequal",
        ["entirely identical", "flawlessly planned", "easily manageable"],
        "Vocabulary in Context: 'disparate' หมายถึง แตกต่างกันอย่างสิ้นเชิง ไม่เท่าเทียมกัน (fundamentally different or unequal)"
    ),
    (
        "kru-4280",
        "[ภาษาอังกฤษ - Reading Comprehension] Based on the passage, what is the most urgent intervention primary schools must implement?",
        "Providing intensive early oral language and vocabulary enrichment for disadvantaged children",
        ["Expelling struggling readers to protect school rankings", "Eliminating all library books to prevent damage", "Replacing primary classroom teachers with silent video players"],
        "Inference / Application: นัยสำคัญเชิงนโยบายคือ โรงเรียนประถมต้องรีบจัดกิจกรรมเสริมสร้างทักษะภาษาพูดและคลังคำศัพท์เข้มข้นตั้งแต่เนิ่นๆ เพื่อลดช่องว่างความเหลื่อมล้ำ"
    ),

    # --- Passage 17: Vygotsky and Scaffolding (kru-4281 to kru-4285) ---
    (
        "kru-4281",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Lev Vygotsky's sociocultural theory posits the 'Zone of Proximal Development' (ZPD)—the conceptual distance between what a learner can achieve autonomously and what can be accomplished with pedagogical guidance. Jerome Bruner operationalized this through 'scaffolding': temporary adjustable instructional supports, such as modeling, sentence frames, or guided questioning, which are systematically dismantled as learner self-efficacy and competence crystallize.)\n\nHow is the Zone of Proximal Development (ZPD) defined in the passage?",
        "The gap between what a learner can do independently and what they can achieve with guidance",
        ["The physical boundary between the classroom and the playground", "The maximum test score a student can ever hope to achieve", "The biological age at which a child learns to walk"],
        "Detail / Definition: ZPD คือ 'the conceptual distance between what a learner can achieve autonomously and what can be accomplished with pedagogical guidance'"
    ),
    (
        "kru-4282",
        "[ภาษาอังกฤษ - Reading Comprehension] Who coined the operational concept of 'scaffolding' mentioned in the text?",
        "Jerome Bruner",
        ["Jean Piaget", "B.F. Skinner", "Noam Chomsky"],
        "Detail / History of Pedagogy: บทความระบุว่า 'Jerome Bruner operationalized this through scaffolding' (เจโรม บรูเนอร์ เป็นผู้นิยามคำว่า scaffolding)"
    ),
    (
        "kru-4283",
        "[ภาษาอังกฤษ - Reading Comprehension] What is the defining characteristic of scaffolding supports?",
        "They are temporary, adjustable, and gradually dismantled as the learner gains mastery",
        ["They remain permanently in place throughout the student's adult life", "They consist entirely of punitive punishments and physical isolation", "They are identical for every child regardless of performance"],
        "Supporting Detail: สาระสำคัญของนั่งร้านทางปัญญา (scaffolding) คือ 'temporary adjustable instructional supports... which are systematically dismantled as competence crystallizes'"
    ),
    (
        "kru-4284",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'dismantled' in the passage is closest in meaning to ________.",
        "removed or taken down piece by piece",
        ["cemented permanently", "reinforced with steel", "manufactured in a factory"],
        "Vocabulary in Context: 'dismantled' หมายถึง ค่อยๆ รื้อถอนหรือถอดออกเป็นขั้นตอน (taken down / phased out) เมื่อเด็กเก่งขึ้น"
    ),
    (
        "kru-4285",
        "[ภาษาอังกฤษ - Reading Comprehension] Which of the following is an example of an instructional scaffold mentioned in the passage?",
        "Modeling and sentence frames",
        ["High-stakes summative exams", "Unsupervised independent tests", "Standardized provincial ranking lists"],
        "Detail Retrieval: ในบทความยกตัวอย่างว่า 'modeling, sentence frames, or guided questioning'"
    ),

    # --- Passage 18: Sleep and Adolescent Cognition (kru-4286 to kru-4290) ---
    (
        "kru-4286",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: Chronobiological research reveals that pubertal onset prompts a biological circadian shift, delaying melatonin secretion by up to two hours. Consequently, early secondary school start times force adolescents into chronic sleep deprivation. This desynchronization severely compromises prefrontal cortex function, precipitating increased emotional volatility, impaired risk assessment, and plummeted academic retention.)\n\nWhat biological change triggers the sleep delay in adolescents?",
        "A biological delay in melatonin secretion by up to two hours",
        ["An immediate drop in adrenaline levels during daylight hours", "A complete cessation of digestive enzyme production", "An increase in bone density preventing muscle relaxation"],
        "Supporting Detail: บทความระบุว่า 'pubertal onset prompts a biological circadian shift, delaying melatonin secretion by up to two hours'"
    ),
    (
        "kru-4287",
        "[ภาษาอังกฤษ - Reading Comprehension] What institutional policy exacerbates adolescent sleep deprivation according to the text?",
        "Early secondary school start times",
        ["Requiring students to wear school uniforms", "Serving nutritious hot lunches in the cafeteria", "Assigning reading homework over weekends"],
        "Fact Retrieval: 'Consequently, early secondary school start times force adolescents into chronic sleep deprivation.'"
    ),
    (
        "kru-4288",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'desynchronization' in the passage refers to ________.",
        "a mismatch between biological sleep rhythms and external school schedules",
        ["a computer software synchronization error", "a musical choir singing out of tune", "a sudden loss of internet connectivity"],
        "Vocabulary in Context: 'desynchronization' ในที่นี้คือความไม่สอดคล้องกันระหว่างนาฬิกาชีวิตทางชีววิทยา (circadian rhythm) กับตารางเวลาเข้าเรียนของโรงเรียน"
    ),
    (
        "kru-4289",
        "[ภาษาอังกฤษ - Reading Comprehension] Which cognitive and behavioral consequence is NOT linked to adolescent sleep deprivation in the passage?",
        "Enhanced athletic speed and reflex sharpness",
        ["Compromised prefrontal cortex function", "Increased emotional volatility", "Impaired risk assessment and plummeted retention"],
        "Negative Detail: บทความระบุอาการผิดปกติทางอารมณ์และสติปัญญา แต่ไม่ได้ระบุว่าความอดนอนช่วยเพิ่มความเร็วในการเล่นกีฬา (enhanced athletic speed)"
    ),
    (
        "kru-4290",
        "[ภาษาอังกฤษ - Reading Comprehension] What policy change is logically advocated by the findings in this passage?",
        "Delaying secondary school start times to align with adolescent circadian rhythms",
        ["Starting high school classes at 5:00 AM every morning", "Abolishing all science classes from the curriculum", "Banning adolescents from sleeping on weekends"],
        "Inference / Reform: ข้อเสนอแนะเชิงนโยบายที่ตรงกับงานวิจัยคือ การเลื่อนเวลาเข้าเรียนของโรงเรียนมัธยมให้สายลง เพื่อให้สอดรับกับนาฬิกาชีวภาพของวัยรุ่น"
    ),

    # --- Passage 19: Translanguaging in Multilingual Classrooms (kru-4291 to kru-4295) ---
    (
        "kru-4291",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: In contrast to strict monolingual immersion doctrines that enforce 'English-only' boundaries, translanguaging pedagogy views a multilingual individual's linguistic repertoire as an integrated, holistic semiotic system. By allowing learners to fluidly shuttle between their mother tongue and the target language to clarify complex concepts and express identity, teachers validate diverse heritage while scaffolding deeper linguistic mastery.)\n\nWhat is the core premise of translanguaging pedagogy?",
        "A multilingual learner's languages form a unified, integrated semiotic system that can be fluidly leveraged",
        ["Languages in the brain must be kept in strictly isolated, watertight compartments", "Students must be severely punished whenever they utter a word of their native tongue", "Translating words is completely impossible in modern linguistics"],
        "Main Idea: Translanguaging มองว่าคลังภาษาของผู้เรียนที่รู้หลายภาษารวมกันเป็นระบบเดียวที่เป็นองค์รวม (integrated semiotic system) และสามารถนำมาใช้ร่วมกันเพื่อส่งเสริมการเรียนรู้"
    ),
    (
        "kru-4292",
        "[ภาษาอังกฤษ - Reading Comprehension] What traditional policy does translanguaging challenge?",
        "Strict 'English-only' monolingual immersion doctrines",
        ["Providing free textbooks to rural schools", "Teaching phonics to primary school pupils", "Conducting annual health examinations"],
        "Contrast / Detail: Translanguaging ท้าทายนโยบายแบบเดิมที่บังคับใช้เฉพาะภาษาอังกฤษเท่านั้น (English-only monolingual immersion)"
    ),
    (
        "kru-4293",
        "[ภาษาอังกฤษ - Reading Comprehension] The phrase 'shuttle between' in the passage means ________.",
        "move back and forth flexibly between",
        ["permanently discard one for the other", "travel on a supersonic rocket", "violently clash against"],
        "Idiomatic Meaning / Context: 'fluidly shuttle between' หมายถึง การสลับไปมาอย่างยืดหยุ่นระหว่างภาษาแม่และภาษาเป้าหมาย"
    ),
    (
        "kru-4294",
        "[ภาษาอังกฤษ - Reading Comprehension] What educational benefit of translanguaging is highlighted in the text?",
        "Validating cultural heritage while scaffolding deeper conceptual and linguistic understanding",
        ["Eliminating all homework and grammar exams", "Reducing school operating costs by half", "Forcing students to forget their regional traditions"],
        "Supporting Detail: ประโยคสุดท้ายระบุว่า 'teachers validate diverse heritage while scaffolding deeper linguistic mastery'"
    ),
    (
        "kru-4295",
        "[ภาษาอังกฤษ - Reading Comprehension] How would a teacher applying translanguaging respond if two Thai students discuss an English reading task in Thai before writing their English responses?",
        "Affirm the discussion as a legitimate strategy for clarifying complex ideas before producing English output",
        ["Deduct ten points from their grade for violating the English-only rule", "Send both students to the disciplinary office immediately", "Ignore the students and pretend they do not exist"],
        "Application / Pedagogy: ครูที่เข้าใจ translanguaging จะมองว่าการพูดคุยภาษาไทยเพื่อทำความเข้าใจโจทย์ก่อนเขียนตอบเป็นภาษาอังกฤษ เป็นกลยุทธ์การเรียนรู้ที่ชอบธรรมและมีประโยชน์"
    ),

    # --- Passage 20: Critical Media Literacy (kru-4296 to kru-4300) ---
    (
        "kru-4296",
        "[ภาษาอังกฤษ - Reading Comprehension] (Passage: In an era saturated with algorithmic hyper-personalization and deepfake synthetic media, functional literacy—the mere ability to decode text—is grossly deficient. Modern citizens require critical media literacy: the analytical acumen to interrogate textual provenance, deconstruct ideological subtext, and identify commercial or political agendas driving algorithmic dissemination.)\n\nWhat is the central thesis of the passage?",
        "Functional decoding literacy is insufficient; citizens urgently need critical media literacy to evaluate digital information",
        ["All social media platforms should be immediately shut down by international law", "Reading books printed on paper is the only safe way to obtain factual truth", "Computer algorithms have completely eliminated dishonest human bias"],
        "Central Thesis: การอ่านออกเขียนได้ขั้นพื้นฐาน (functional literacy) ไม่เพียงพออีกต่อไปในยุคดิจิทัล สังคมต้องการทักษะการรู้เท่าทันสื่อเชิงวิพากษ์ (critical media literacy) เพื่อวิเคราะห์เบื้องหลังและเจตนาของข้อมูล"
    ),
    (
        "kru-4297",
        "[ภาษาอังกฤษ - Reading Comprehension] What contemporary technological challenge is explicitly cited in the text?",
        "Algorithmic hyper-personalization and deepfake synthetic media",
        ["Slow dot-matrix printer speeds", "Shortages of black typewriter ribbons", "Breakdowns in telegraph cable connections"],
        "Detail Retrieval: บทความระบุเทคโนโลยีปัจจุบันคือ 'algorithmic hyper-personalization and deepfake synthetic media'"
    ),
    (
        "kru-4298",
        "[ภาษาอังกฤษ - Reading Comprehension] The word 'provenance' in the passage refers to ________.",
        "the origin, ownership, and source history of a text",
        ["the grammatical tense of the verbs", "the font size and print margins", "the physical weight of the tablet computer"],
        "Vocabulary in Context: 'textual provenance' หมายถึง แหล่งที่มา ประวัติความเป็นมา และผู้สร้างสรรค์ข้อความนั้น (origin / source history)"
    ),
    (
        "kru-4299",
        "[ภาษาอังกฤษ - Reading Comprehension] According to the passage, a critically literate reader strives to ________.",
        "deconstruct ideological subtexts and uncover driving commercial or political agendas",
        ["accept all viral internet headlines as unquestioned absolute truths", "forward unverified breaking news to friends immediately", "memorize entire paragraphs without questioning the author"],
        "Supporting Detail: ผู้รู้เท่าทันสื่อจะ 'deconstruct ideological subtext, and identify commercial or political agendas driving algorithmic dissemination'"
    ),
    (
        "kru-4300",
        "[ภาษาอังกฤษ - Reading Comprehension] What is the author's primary goal in writing this passage?",
        "To urge educators and citizens to cultivate sophisticated critical analytical skills toward digital media",
        ["To market an expensive new computer anti-virus software", "To celebrate the total perfection of online journalism", "To encourage young pupils to spend more hours playing video games"],
        "Author's Purpose: วัตถุประสงค์หลักคือกระตุ้นเตือนให้ครูและพลเมืองตระหนักและเร่งพัฒนาทักษะการวิเคราะห์วิพากษ์สื่อดิจิทัลอย่างลึกซึ้ง"
    ),
]

print(f"Set 43 loaded: {len(SET43_QUESTIONS)} questions")
