# -*- coding: utf-8 -*-
# Set 44: English Language Teaching (ELT) Methodology & Linguistics (kru-4301 to kru-4400)

SET44_QUESTIONS = [
    # --- Phonetics & Phonology (kru-4301 to kru-4320) ---
    (
        "kru-4301",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Which of the following consonant sounds is classified as a 'voiceless alveolar plosive' in the International Phonetic Alphabet (IPA)?",
        "/t/",
        ["/d/", "/s/", "/p/"],
        "IPA Classification: เสียง /t/ มีลักษณะคือ ไม่ก้อง (voiceless), เกิดที่ปุ่มเหงือก (alveolar), และมีลักษณะการกักลมแล้วระเบิดออก (plosive / stop) ขณะที่ /d/ ก้อง (voiced), /s/ เสียดแทรก (fricative), /p/ เกิดที่ริมฝีปาก (bilabial)"
    ),
    (
        "kru-4302",
        "[ภาษาอังกฤษ - Phonetics & Phonology] The words 'ship' /ʃɪp/ and 'sheep' /ʃiːp/ form a 'minimal pair' that contrasts which phonetic feature?",
        "Vowel length and vowel quality (lax /ɪ/ vs tense /iː/)",
        ["Initial consonant voicing", "Final consonant manner of articulation", "Syllable stress placement"],
        "Minimal Pair / Vowels: คู่เทียบเสียงขั้นต่ำ (Minimal Pair) ระหว่าง ship กับ sheep ต่างกันเพียงสระเดียว คือ สระเสียงสั้น/หลวม (/ɪ/) กับสระเสียงยาว/ตึง (/iː/)"
    ),
    (
        "kru-4303",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Which of the following words begins with a 'voiced dental fricative' sound?",
        "this /ð/",
        ["think /θ/", "shoe /ʃ/", "chair /tʃ/"],
        "Place & Manner of Articulation: เสียง /ð/ ในคำว่า 'this', 'that', 'mother' เป็นเสียงก้อง (voiced), ใช้ลิ้นแตะฟัน (dental), และมีการเสียดแทรกของลม (fricative) ส่วน 'think' เป็นเสียง /θ/ ซึ่งไม่ก้อง (voiceless)"
    ),
    (
        "kru-4304",
        "[ภาษาอังกฤษ - Phonetics & Phonology] In rapid spoken English, the phrase 'good boy' is often pronounced as [gʊb bɔɪ]. This phonological phenomenon is known as ________.",
        "regressive assimilation",
        ["progressive elision", "vowel epenthesis", "dissimilation"],
        "Connected Speech / Assimilation: การกลมกลืนเสียงแบบย้อนกลับ (Regressive Assimilation): เสียง /d/ (alveolar) เปลี่ยนเป็น [b] (bilabial) ภายใต้อิทธิพลของเสียง /b/ ที่ตามมาข้างหลัง"
    ),
    (
        "kru-4305",
        "[ภาษาอังกฤษ - Phonetics & Phonology] The omission of a sound in rapid, natural connected speech (e.g., pronouncing 'history' as /ˈhɪstri/ instead of /ˈhɪstəri/) is called ________.",
        "elision",
        ["liaison", "intrusion", "aspiration"],
        "Connected Speech: 'Elision' (การละเสียงหรือการตัดเสียง) คือปรากฏการณ์ที่เสียงสระหรือพยัญชนะหายไปในการพูดที่เป็นธรรมชาติและรวดเร็ว เพื่อความสะดวกในการออกเสียง"
    ),
    (
        "kru-4306",
        "[ภาษาอังกฤษ - Phonetics & Phonology] In the International Phonetic Alphabet, the mid-central unrounded neutral vowel /ə/ is universally known as ________.",
        "schwa",
        ["diphthong", "triphthong", "glottal stop"],
        "Vowel Terminology: เสียง /ə/ เรียกว่า 'schwa' เป็นสระที่พบบ่อยที่สุดในภาษาอังกฤษ มักปรากฏในพยางค์ที่ไม่ได้รับความเค้นเสียง (unstressed syllables) เช่น ในคำว่า 'about' /əˈbaʊt/"
    ),
    (
        "kru-4307",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Where is the primary lexical stress placed in the noun 'record' as compared to the verb 'record'?",
        "On the first syllable in the noun ('RE-cord) and on the second syllable in the verb (re-'CORD)",
        ["On the second syllable in both forms", "On the first syllable in both forms", "On the suffix '-ord' only in questions"],
        "Word Stress / Noun-Verb Alternation: คำสองพยางค์หลายคำในภาษาอังกฤษ หากทำหน้าที่เป็นคำนาม ความเค้นเสียงจะอยู่ที่พยางค์แรก (RE-cord) แต่ถ้าทำหน้าที่เป็นกริยา จะย้ายไปอยู่ที่พยางค์หลัง (re-CORD)"
    ),
    (
        "kru-4308",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Which of the following words contains a diphthong (gliding vowel)?",
        "bite /aɪ/",
        ["beat /iː/", "bet /e/", "bat /æ/"],
        "Diphthongs: สระประสม (Diphthong) คือสระที่มีการเลื่อนตำแหน่งของลิ้นจากสระหนึ่งไปอีกสระหนึ่ง เช่น /aɪ/ ใน 'bite', /eɪ/ ใน 'day', /aʊ/ ใน 'now' ส่วน beat, bet, bat เป็นสระเดี่ยว (monophthongs)"
    ),
    (
        "kru-4309",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Which intonation pattern is conventionally used in standard British and American English for genuine 'Yes/No' questions?",
        "Rising intonation",
        ["Falling intonation", "Flat monotone", "Fall-rise-fall sequence"],
        "Intonation: คำถามที่ตอบด้วย Yes/No (เช่น 'Are you ready?') มักลงท้ายด้วยเสียงวรรณยุกต์ลอยขึ้น (Rising intonation) ขณะที่คำถาม Wh- questions มักใช้เสียงตกลง (Falling intonation)"
    ),
    (
        "kru-4310",
        "[ภาษาอังกฤษ - Phonetics & Phonology] The puff of air released following the voiceless plosives /p, t, k/ at the onset of a stressed syllable (as in 'pin' [pʰɪn]) is called ________.",
        "aspiration",
        ["nasalization", "palatalization", "velarization"],
        "Phonetics / Aspiration: เสียงพ่นลม (Aspiration: สัญลักษณ์ ʰ) เกิดเมื่อเปล่งเสียงพยัญชนะกักไม่ก้อง /p, t, k/ ที่ต้นพยางค์ที่เน้นเสียง เช่น pin [pʰɪn] เมื่อเทียบกับ spin [spɪn] ที่ไม่มีการพ่นลม"
    ),
    (
        "kru-4311",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Which of the following words ends with the voiced alveolar fricative sound /z/ rather than voiceless /s/?",
        "dogs",
        ["cats", "books", "claps"],
        "Phonological Plural Rules: การออกเสียงคำลงท้าย -s/-es หลังเสียงก้อง (voiced consonant /g/ ใน dog) จะออกเสียงเป็นรูปก้องคือ /z/ ส่วนหลังเสียงไม่ก้อง (/t/, /k/, /p/) จะออกเสียงเป็น /s/"
    ),
    (
        "kru-4312",
        "[ภาษาอังกฤษ - Phonetics & Phonology] The sound /ŋ/ (as in 'sing') is categorized phonetically as a ________.",
        "voiced velar nasal",
        ["voiceless alveolar nasal", "voiced bilabial plosive", "voiceless palatal fricative"],
        "IPA Articulation: เสียง /ŋ/ เป็นเสียงก้อง (voiced), เกิดที่เพดานอ่อน (velar), และลมออกทางช่องจมูก (nasal)"
    ),
    (
        "kru-4313",
        "[ภาษาอังกฤษ - Phonetics & Phonology] What phonetic process occurs when an extra linking sound is inserted between two adjacent vowels, as in 'law and order' pronounced with an [r] sound?",
        "Intrusive /r/",
        ["Elision", "Aspiration", "Devoicing"],
        "Connected Speech: 'Intrusive /r/' คือการแทรกเสียง /r/ เข้าไประหว่างสระสองตัวที่อยู่ติดกันในสำเนียง non-rhotic (เช่น British RP) ทั้งที่ในรูปสะกดเดิมไม่มีตัว r"
    ),
    (
        "kru-4314",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Which of the following is an example of an 'affricate' consonant in English?",
        "/tʃ/ as in 'church'",
        ["/f/ as in 'fish'", "/m/ as in 'mother'", "/l/ as in 'light'"],
        "Manner of Articulation: เสียงกึ่งเสียดแทรก (Affricate) คือเสียงที่เริ่มด้วยการกักลมแล้วปล่อยผ่านช่องแคบอย่างเสียดสี ในภาษาอังกฤษมี 2 เสียงคือ /tʃ/ (church) และ /dʒ/ (judge)"
    ),
    (
        "kru-4315",
        "[ภาษาอังกฤษ - Phonetics & Phonology] The regular past tense morpheme '-ed' is pronounced as an extra syllable /ɪd/ (or /əd/) following which root-final sounds?",
        "/t/ and /d/",
        ["/p/ and /b/", "/k/ and /g/", "/s/ and /z/"],
        "Morphophonology of '-ed': เมื่อคำกริยาลงท้ายด้วยเสียง /t/ หรือ /d/ (เช่น want, need) เมื่อเติม -ed จะออกเสียงเป็นพยางค์เพิ่ม /ɪd/ เช่น wanted /ˈwɒntɪd/, needed /ˈniːdɪd/"
    ),
    (
        "kru-4316",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Pitch variations across an entire sentence that convey pragmatic meaning, emotion, or syntactic sentence type are known as ________.",
        "intonation",
        ["stress", "rhythm", "tempo"],
        "Suprasegmental Phonology: 'Intonation' (ทำนองเสียงหรือระดับเสียงสูงต่ำระดับประโยค) ทำหน้าที่บอกประเภทของประโยค อารมณ์ หรือเจตนาของผู้พูด"
    ),
    (
        "kru-4317",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Which pair of words demonstrates a contrast between a 'voiced' and 'voiceless' labiodental fricative?",
        "fan /f/ and van /v/",
        ["pin /p/ and bin /b/", "tin /t/ and din /d/", "sip /s/ and zip /z/"],
        "Phonetic Identification: /f/ และ /v/ เกิดที่ฟันบนจรดริมฝีปากล่าง (labiodental) และมีการเสียดสี (fricative) โดย /f/ ไม่ก้อง (voiceless) และ /v/ ก้อง (voiced)"
    ),
    (
        "kru-4318",
        "[ภาษาอังกฤษ - Phonetics & Phonology] English is widely characterized by linguists as a ________ language, meaning stressed syllables occur at approximately regular time intervals.",
        "stress-timed",
        ["syllable-timed", "mora-timed", "tone-timed"],
        "Linguistic Rhythm: ภาษาอังกฤษเป็นภาษาที่มีจังหวะแบบเน้นความเค้น (Stress-timed language) ซึ่งช่วงเวลาระหว่างพยางค์ที่เน้นจะมีความสม่ำเสมอ แตกต่างจากภาษาไทยซึ่งเป็น Syllable-timed language"
    ),
    (
        "kru-4319",
        "[ภาษาอังกฤษ - Phonetics & Phonology] The sound [ʔ] produced by temporarily closing the vocal folds tightly is known in phonetics as a ________.",
        "glottal stop",
        ["velar nasal", "dental fricative", "bilabial plosive"],
        "Phonetics: เสียงเส้นเสียงกัก [ʔ] เรียกว่า 'glottal stop' เกิดจากการปิดเส้นเสียงที่ช่องสายเสียง (glottis) แล้วเปิดออก มักพบในการออกเสียงคำเช่น 'uh-oh' หรือแทนเสียง /t/ ในบางสำเนียง"
    ),
    (
        "kru-4320",
        "[ภาษาอังกฤษ - Phonetics & Phonology] Which of the following words has the primary stress on the third syllable (antepenultimate or ultimate)?",
        "recommendation",
        ["photograph", "educate", "interesting"],
        "Stress Rules: คำที่ลงท้ายด้วย '-tion' ความเค้นเสียงหลักจะอยู่ที่พยางค์หน้าปัจจัยนั้นเสมอ เช่น re-com-men-DA-tion (ความเค้นหลักอยู่ที่พยางค์ที่ 4 'da')"
    ),

    # --- Krashen's SLA Hypotheses (kru-4321 to kru-4340) ---
    (
        "kru-4321",
        "[ภาษาอังกฤษ - Krashen's SLA] According to Stephen Krashen's 'Acquisition-Learning Hypothesis', what is the fundamental difference between acquisition and learning?",
        "Acquisition is a subconscious, implicit process similar to child first-language development, whereas learning is a conscious, explicit study of rules",
        ["Acquisition requires passing standardized exams, while learning happens only on computers", "Acquisition is strictly for adults, whereas learning is for preschool infants", "Acquisition relies on memorizing grammar tables, while learning relies on listening to songs"],
        "Krashen's Acquisition-Learning Hypothesis: การซึมซับภาษา (Acquisition) เป็นกระบวนการใต้สำนึก เป็นไปตามธรรมชาติเหมือนเด็กเรียนภาษาแม่ ส่วนการเรียนรู้ (Learning) เป็นกระบวนการรู้ตัวในการศึกษากฎเกณฑ์ไวยากรณ์อย่างเป็นทางการ"
    ),
    (
        "kru-4322",
        "[ภาษาอังกฤษ - Krashen's SLA] In Krashen's 'Input Hypothesis', what does the formula 'i + 1' signify?",
        "Linguistic input that is just slightly beyond the learner's current stage of proficiency",
        ["Adding one new vocabulary word per calendar month", "Testing students one grade level higher each semester", "Providing one hour of homework for every class attended"],
        "Input Hypothesis: 'i + 1' หมายถึง ภาษาที่ป้อนให้ผู้เรียน (Comprehensible Input) ต้องอยู่ในระดับที่สูงกว่าระดับความสามารถปัจจุบันของผู้เรียนเพียงเล็กน้อย (i คือระดับปัจจุบัน, +1 คือขั้นถัดไป)"
    ),
    (
        "kru-4323",
        "[ภาษาอังกฤษ - Krashen's SLA] According to Krashen's 'Affective Filter Hypothesis', what emotional factors create a 'low filter' optimal for language acquisition?",
        "Low anxiety, high motivation, and strong self-confidence",
        ["High competitive fear, strict punishment, and absolute silence", "Indifference, apathy, and exhaustion", "Pride, arrogance, and aggression"],
        "Affective Filter Hypothesis: ตัวกรองอารมณ์ที่ต่ำ (Low Affective Filter) หมายถึง ผู้เรียนมีความวิตกกังวลต่ำ มีแรงจูงใจสูง และมีความมั่นใจในตนเอง ทำให้ข้อมูลภาษา (input) สามารถผ่านเข้าสู่สมองเพื่อการซึมซับได้อย่างเต็มที่"
    ),
    (
        "kru-4324",
        "[ภาษาอังกฤษ - Krashen's SLA] Under Krashen's 'Monitor Hypothesis', what is the sole function of consciously learned grammatical knowledge?",
        "To act as an editor or monitor to alter output before or after speech/writing",
        ["To generate spontaneous and fluent communicative speech in real-time", "To replace the need for any listening or reading input", "To translate foreign poetry into classical languages"],
        "Monitor Hypothesis: ความรู้ไวยากรณ์ที่เรียนรู้มาอย่างเป็นทางการทำหน้าที่ได้เพียงเป็น 'ตัวตรวจสอบ/แก้ไข' (Monitor/Editor) ก่อนหรือหลังการสื่อสารเท่านั้น ไม่สามารถสร้างความคล่องแคล่วในการพูดแบบอัตโนมัติได้"
    ),
    (
        "kru-4325",
        "[ภาษาอังกฤษ - Krashen's SLA] Krashen's 'Natural Order Hypothesis' asserts that grammatical structures are acquired ________.",
        "in a predictable, universal sequence regardless of instructional order or native language",
        ["in the exact order in which they appear in the school textbook", "from the most complex structures to the simplest ones", "in reverse alphabetical order"],
        "Natural Order Hypothesis: สมมติฐานลำดับธรรมชาติระบุว่า ผู้เรียนจะซึมซับโครงสร้างทางไวยากรณ์ตามลำดับที่เป็นสากลและคาดเดาได้ (เช่น -ing มาก่อน -s เอกพจน์) ไม่ว่าจะเรียงลำดับการสอนในบทเรียนอย่างไรก็ตาม"
    ),
    (
        "kru-4326",
        "[ภาษาอังกฤษ - Krashen's SLA] What three conditions are necessary for a language learner to successfully deploy the 'Monitor' according to Krashen?",
        "Time, focus on form, and explicit knowledge of the rule",
        ["Loud voice, physical energy, and visual slides", "Money, peer competition, and strict detention", "Bilingual dictionary, native partner, and computer software"],
        "Conditions for Monitor Use: การจะใช้ Monitor ได้ ต้องมี 3 ปัจจัยครบถ้วน: 1. มีเวลาเพียงพอ (Time) 2. ผู้พูดจดจ่ออยู่กับความถูกต้องของรูปภาษา (Focus on form) 3. รู้กฎไวยากรณ์นั้นอย่างชัดเจน (Know the rule)"
    ),
    (
        "kru-4327",
        "[ภาษาอังกฤษ - Krashen's SLA] A learner who is extremely hesitant to speak, continually pauses to check mental grammar rules, and produces very slow speech is termed by Krashen as a(n) ________.",
        "Monitor over-user",
        ["Monitor under-user", "Optimal monitor user", "Non-communicative acquirer"],
        "SLA Learner Types: 'Monitor over-user' คือผู้เรียนที่กังวลเรื่องกฎไวยากรณ์มากเกินไปจนไม่กล้าพูด ต้องคิดทบทวนกฎตลอดเวลา ทำให้พูดสะดุดและขาดความคล่องแคล่ว"
    ),
    (
        "kru-4328",
        "[ภาษาอังกฤษ - Krashen's SLA] Krashen argues that error correction in early language teaching ________.",
        "has little impact on subconscious acquisition and often raises the learner's affective filter",
        ["is the single most effective way to produce fluent native-like pronunciation", "should be accompanied by physical punishment", "must occur after every single mispronounced phoneme"],
        "Pedagogical Stance on Error Correction: คราเชนชี้ว่าการจ้องจับผิดและแก้ไวยากรณ์ทุกคำไม่มีผลต่อการซึมซับภาษาโดยธรรมชาติ และยังส่งผลเสียทำให้ Affective Filter สูงขึ้น เด็กเกิดความกลัวและไม่กล้าสื่อสาร"
    ),
    (
        "kru-4329",
        "[ภาษาอังกฤษ - Krashen's SLA] In SLA research, the initial phase during which young children listen to the new language without attempting to speak is known as the ________.",
        "silent period",
        ["critical stage", "fossilization era", "monitor lockdown"],
        "SLA Concept: 'The Silent Period' (ช่วงแห่งความเงียบ) คือช่วงเวลาเริ่มต้นที่ผู้เรียนรับฟังและทำความเข้าใจภาษา (building receptive competence) โดยยังไม่พร้อมที่จะพูดออกมา ครูไม่ควรบังคับให้เด็กพูดในช่วงนี้"
    ),
    (
        "kru-4330",
        "[ภาษาอังกฤษ - Krashen's SLA] What kind of reading material does Krashen strongly advocate for promoting second language acquisition?",
        "Free Voluntary Reading (FVR) with texts that are compelling and comprehensible",
        ["Rote copying of archaic classical literature", "Translating dictionaries from cover to cover", "Memorizing word lists without reading stories"],
        "Extensive Reading / FVR: คราเชนสนับสนุนการอ่านแบบอิสระตามความสมัครใจ (Free Voluntary Reading: FVR) ด้วยหนังสือที่น่าสนใจและอ่านเข้าใจได้ง่าย ซึ่งจะช่วยพัฒนาคลังคำศัพท์และไวยากรณ์โดยอัตโนมัติ"
    ),
    (
        "kru-4331",
        "[ภาษาอังกฤษ - Krashen's SLA] The term 'Comprehensible Input' implies that understanding messages is achieved when learners rely on ________.",
        "linguistic context, extralinguistic cues, and prior real-world knowledge",
        ["translating every single word into their L1 using a dictionary", "memorizing syntactic tree diagrams", "learning phonetic transcription before reading words"],
        "Comprehensible Input Mechanisms: ผู้เรียนสามารถเข้าใจสารที่อยู่เหนือระดับความรู้เล็กน้อย (i+1) ได้ โดยอาศัยบริบทแวดล้อม ภาษากาย ท่าทาง ภาพประกอบ และภูมิความรู้เดิม (prior knowledge)"
    ),
    (
        "kru-4332",
        "[ภาษาอังกฤษ - Krashen's SLA] Merrill Swain formulated the 'Comprehensible Output Hypothesis' primarily as a reaction to Krashen, arguing that ________.",
        "learners must be pushed to produce spoken/written output to notice gaps in their linguistic competence",
        ["input is the only thing that ever matters in language learning", "grammar should never be spoken aloud in the classroom", "writing should be banned until adulthood"],
        "Swain's Output Hypothesis: Merrill Swain โต้แย้งว่า Comprehensible Input เพียงอย่างเดียวไม่พอ ผู้เรียนจำเป็นต้องมีโอกาสได้ผลิตภาษา (Output) เพื่อให้เห็นช่องว่าง (notice the gap) ของความรู้ตนเองและปรับปรุงไวยากรณ์"
    ),
    (
        "kru-4333",
        "[ภาษาอังกฤษ - Krashen's SLA] Richard Schmidt's 'Noticing Hypothesis' claims that second language acquisition cannot occur unless features of the input are ________.",
        "consciously noticed by the learner",
        ["subconsciously absorbed during sleep", "translated into algebraic formulas", "tested on high-stakes national exams"],
        "Schmidt's Noticing Hypothesis: ริชาร์ด ชมิดต์ เสนอว่า ผู้เรียนต้องเกิด 'การสังเกตเห็น' (conscious noticing) โครงสร้างภาษาในสิ่งป้อนเข้าเสียก่อน การซึมซับภาษาจึงจะเกิดขึ้นได้"
    ),
    (
        "kru-4334",
        "[ภาษาอังกฤษ - Krashen's SLA] In SLA, when a learner's interlanguage development permanently ceases and incorrect forms become entrenched, the phenomenon is called ________.",
        "fossilization",
        ["lateralization", "assimilation", "attrition"],
        "Interlanguage & Fossilization: 'Fossilization' (การเกิดภาษาตายตัว/กลายเป็นฟอสซิล) คือภาวะที่การพัฒนาภาษาของผู้เรียนหยุดชะงัก และข้อผิดพลาดทางไวยากรณ์หรือการออกเสียงกลายเป็นนิสัยที่แก้ยากอย่างถาวร"
    ),
    (
        "kru-4335",
        "[ภาษาอังกฤษ - Krashen's SLA] The dynamic, rule-governed linguistic system developed by an L2 learner that represents a transitional stage between their native tongue (L1) and the target language (L2) is called ________.",
        "interlanguage",
        ["pidgin", "creole", "dialect"],
        "Selinker's Concept: Larry Selinker นิยามระบบภาษาของผู้เรียนที่กำลังพัฒนาอยู่ว่าเป็น 'Interlanguage' (ภาษาแทรก/ภาษาในระหว่าง) ซึ่งมีกฎเกณฑ์ของตนเองและเปลี่ยนแปลงไปเรื่อยๆ ตามประสบการณ์"
    ),
    (
        "kru-4336",
        "[ภาษาอังกฤษ - Krashen's SLA] Which error type occurs when a Thai student applies Thai grammatical structures to English (e.g., saying 'I like car red')?",
        "Interlingual error (negative L1 transfer / interference)",
        ["Intralingual developmental error", "Overgeneralization error", "Slip of the tongue"],
        "Error Analysis: 'Interlingual error' (ข้อผิดพลาดระหว่างภาษา) เกิดจากการถ่ายโอนไวยากรณ์จากภาษาแม่ (L1 Negative Transfer) เช่น โครงสร้างคำนามตามด้วยคำขยายในภาษาไทย"
    ),
    (
        "kru-4337",
        "[ภาษาอังกฤษ - Krashen's SLA] A student saying 'goed' instead of 'went' or 'sheeps' instead of 'sheep' is demonstrating ________.",
        "overgeneralization (intralingual error)",
        ["negative L1 transfer", "phonological assimilation", "code-switching"],
        "Intralingual Error: 'Overgeneralization' (การขยายกฎเกินขอบเขต) เป็นข้อผิดพลาดภายในภาษาเป้าหมายที่แสดงถึงพัฒนาการทางภาษา โดยนำกฎทั่วไป (-ed, -s) ไปใช้กับกริยาหรือนามที่ไม่ปกติ"
    ),
    (
        "kru-4338",
        "[ภาษาอังกฤษ - Krashen's SLA] According to Michael Long's 'Interaction Hypothesis', language acquisition is significantly facilitated through ________.",
        "negotiation of meaning during collaborative communicative breakdowns",
        ["individual silent memorization of bilingual flashcards", "strict recitation of classical theatrical monologues", "punitive grammar quizzes administered every morning"],
        "Long's Interaction Hypothesis: การเจรจาต่อรองความหมาย (Negotiation of meaning) เช่น การขอให้พูดซ้ำ การทวนความเข้าใจ (clarification requests, confirmation checks) ช่วยปรับภาษาให้เข้าใจง่ายและส่งเสริมการเรียนรู้"
    ),
    (
        "kru-4339",
        "[ภาษาอังกฤษ - Krashen's SLA] What distinguishes an 'error' from a 'mistake' according to Pit Corder's error analysis?",
        "An error reflects a gap in the learner's underlying competence, whereas a mistake is a performance slip that the learner can self-correct",
        ["An error is committed by adults, while a mistake is made by children", "An error occurs in writing, while a mistake happens only in speech", "An error involves vocabulary, while a mistake involves punctuation"],
        "Corder's Error Analysis: 'Error' เกิดจากการขาดความรู้ในระบบภาษา (Competence) ผู้เรียนไม่สามารถแก้เองได้ ส่วน 'Mistake' เป็นเพียงความพลั้งเผลอในการใช้ (Performance slip) ซึ่งผู้เรียนสามารถแก้ไขได้เองเมื่อมีคนทักท้วง"
    ),
    (
        "kru-4340",
        "[ภาษาอังกฤษ - Krashen's SLA] The term 'Language Acquisition Device' (LAD) and the concept of 'Universal Grammar' were originally pioneered by which cognitive linguist?",
        "Noam Chomsky",
        ["B.F. Skinner", "Stephen Krashen", "Lev Vygotsky"],
        "Innatist Theory: นอม ชอมสกี (Noam Chomsky) เป็นผู้ริเริ่มแนวคิด Innatist ว่ามนุษย์มีกลไกการรับรู้ภาษามาแต่กำเนิด (LAD) และมีไวยากรณ์สากล (Universal Grammar) ฝังอยู่ในสมอง"
    ),

    # --- ELT Methods & Approaches (kru-4341 to kru-4360) ---
    (
        "kru-4341",
        "[ภาษาอังกฤษ - ELT Methodology] Which language teaching methodology relies heavily on the translation of literary texts, deductive memorization of grammatical rules, and bilingual vocabulary lists?",
        "Grammar-Translation Method (GTM)",
        ["Communicative Language Teaching (CLT)", "Audio-Lingual Method (ALM)", "Total Physical Response (TPR)"],
        "ELT Methodology / GTM: วิธีไวยากรณ์และการแปล (Grammar-Translation Method: GTM) เน้นการแปลบทความวรรณกรรม ท่องจำกฎไวยากรณ์แบบนิรนัย (Deductive) และท่องศัพท์สองภาษา แทบไม่มีการฝึกทักษะการพูดเพื่อสื่อสาร"
    ),
    (
        "kru-4342",
        "[ภาษาอังกฤษ - ELT Methodology] The Audio-Lingual Method (ALM) was grounded in which psychological and linguistic paradigms?",
        "Behaviorism (habit formation via stimulus-response-reinforcement) and Structural Linguistics",
        ["Cognitive Constructivism and Generative Syntax", "Humanistic Psychology and Sociolinguistics", "Social Constructivism and Critical Pedagogy"],
        "ELT Methodology / ALM: วิธีฟัง-พูด (Audio-Lingual Method) มีรากฐานมาจากจิตวิทยาพฤติกรรมนิยม (Behaviorism ของ Skinner) ที่มองว่าภาษาคือนิสัย เกิดจากการกระตุ้น-ตอบสนอง-การเสริมแรง (Drills) ร่วมกับภาษาศาสตร์โครงสร้าง"
    ),
    (
        "kru-4343",
        "[ภาษาอังกฤษ - ELT Methodology] In Total Physical Response (TPR), developed by James Asher, young learners demonstrate their comprehension primarily through ________.",
        "physical actions and kinesthetic body movements without immediate pressure to speak",
        ["writing elaborate 500-word reflective essays", "reciting complex Shakespearean sonnets aloud", "translating abstract philosophical articles"],
        "ELT Methodology / TPR: วิธีสอนโดยการเคลื่อนไหวร่างกาย (Total Physical Response ของ Asher) ให้ผู้เรียนแสดงความเข้าใจผ่านการปฏิบัติตามคำสั่ง (Physical actions เช่น Stand up, Jump) โดยไม่บังคับให้ต้องพูดในทันที เหมาะกับเด็กเล็ก"
    ),
    (
        "kru-4344",
        "[ภาษาอังกฤษ - ELT Methodology] Which method prohibits any use of the students' native language (L1) and conveys meaning exclusively through realia, pictures, and pantomime?",
        "Direct Method",
        ["Grammar-Translation Method", "Community Language Learning", "Silent Way"],
        "Direct Method: วิธีสอนตรง (Direct Method) ห้ามใช้ภาษาแม่ในห้องเรียนโดยเด็ดขาด การสอนคำศัพท์และความหมายต้องเชื่อมโยงโดยตรงกับสิ่งของจริง (realia), ภาพวาด หรือท่าทางแสดงประกอบ"
    ),
    (
        "kru-4345",
        "[ภาษาอังกฤษ - ELT Methodology] What are the four components of 'communicative competence' proposed by Canale and Swain (1980)?",
        "Grammatical, sociolinguistic, discourse, and strategic competence",
        ["Reading, writing, listening, and speaking competence", "Phonetic, semantic, lexical, and orthographic competence", "Auditory, visual, kinesthetic, and musical competence"],
        "Canale & Swain (1980): สมรรถนะการสื่อสาร 4 ด้าน ได้แก่: 1. ด้านไวยากรณ์ (Grammatical) 2. ด้านสังคมภาษา (Sociolinguistic) 3. ด้านวัจนะวิเคราะห์ (Discourse) 4. ด้านกลยุทธ์การสื่อสาร (Strategic)"
    ),
    (
        "kru-4346",
        "[ภาษาอังกฤษ - ELT Methodology] In Task-Based Language Teaching (TBLT), what constitutes a 'task' according to Jane Willis?",
        "A goal-oriented activity in which learners use authentic target language to achieve a real communicative outcome",
        ["Filling in blanks in twenty isolated grammatical sentences", "Copying dictionary definitions into notebooks", "Repeating choral substitution drills after the teacher"],
        "TBLT / Willis (1996): ภาระงาน (Task) ใน TBLT คือกิจกรรมที่มีเป้าหมายชัดเจน ซึ่งผู้เรียนต้องใช้ภาษาเพื่อสื่อสารและบรรลุผลลัพธ์ที่เป็นรูปธรรมในชีวิตจริง (Real-world communicative outcome) ไม่ใช่แค่การทำแบบฝึกหัดไวยากรณ์"
    ),
    (
        "kru-4347",
        "[ภาษาอังกฤษ - ELT Methodology] What are the three instructional phases of the standard TBLT framework developed by Jane Willis?",
        "Pre-task, Task Cycle (task, planning, report), and Language Focus",
        ["Presentation, Practice, and Production (PPP)", "Engage, Study, and Activate (ESA)", "Introduction, Examination, and Evaluation"],
        "Willis TBLT Framework: ขั้นตอนการจัดการเรียนรู้แบบ TBLT ประกอบด้วย: 1. ขั้นก่อนปฏิบัติภาระงาน (Pre-task) 2. วงจรภาระงาน (Task Cycle: ปฏิบัติงาน วางแผน รายงาน) 3. ขั้นเน้นย้ำภาษา (Language Focus)"
    ),
    (
        "kru-4348",
        "[ภาษาอังกฤษ - ELT Methodology] Content and Language Integrated Learning (CLIL) is characterized by a dual-focused educational approach that ________.",
        "teaches both subject curriculum content (e.g., science or geography) and a foreign language simultaneously",
        ["teaches English grammar through Latin translations", "separates vocabulary study from any contextual reading", "focuses exclusively on preparing students for athletic events"],
        "CLIL Pedagogy: CLIL คือการจัดการเรียนรู้แบบบูรณาการเนื้อหาและภาษา โดยผู้เรียนเรียนรู้เนื้อหาวิชาการ (เช่น วิทยาศาสตร์ สังคม หรือคณิตศาสตร์) ควบคู่ไปกับการพัฒนาทักษะภาษาต่างประเทศพร้อมกัน"
    ),
    (
        "kru-4349",
        "[ภาษาอังกฤษ - ELT Methodology] In the 'Presentation, Practice, Production' (PPP) model, what occurs during the 'Production' stage?",
        "Learners use the newly taught linguistic target freely in authentic communicative activities",
        ["The teacher explains the grammar rules on the whiteboard", "Students do highly controlled choral repetition drills", "The teacher administers a graded summative multiple-choice test"],
        "PPP Model: ขั้น Production (ขั้นนำไปใช้) ผู้เรียนจะมีอิสระในการนำโครงสร้างภาษาที่ได้ฝึกฝนมาใช้ในการสื่อสารจริง เช่น การแสดงบทบาทสมมติ การอภิปราย หรือการแก้ปัญหา โดยครูลดการควบคุมลง"
    ),
    (
        "kru-4350",
        "[ภาษาอังกฤษ - ELT Methodology] Which innovative ELT method uses colored Cuisenaire rods, sound-color charts, and requires the teacher to remain largely silent while students produce language?",
        "The Silent Way (Caleb Gattegno)",
        ["Suggestopedia (Georgi Lozanov)", "Community Language Learning (Charles Curran)", "Audio-Lingual Method"],
        "The Silent Way: คิดค้นโดย Caleb Gattegno ครูจะพูดให้น้อยที่สุด (silent) เพื่อกระตุ้นให้ผู้เรียนคิด ค้นพบ และแก้ไขตนเอง โดยใช้แท่งไม้หลากสี (Cuisenaire rods) และตารางชาร์ตเสียง-สี เป็นสื่อการสอน"
    ),
    (
        "kru-4351",
        "[ภาษาอังกฤษ - ELT Methodology] Suggestopedia, developed by Georgi Lozanov, relies heavily on which classroom environmental feature to accelerate learning?",
        "Baroque background music, comfortable seating, and deep mental relaxation (desuggestion)",
        ["Strict military discipline and public shaming", "Timed computer programming competitions", "Intensive memorization of bilingual legal treatises"],
        "Suggestopedia: จิตแพทย์ชาวบัลแกเรีย Georgi Lozanov ใช้ดนตรีบาโรก (Baroque music), บรรยากาศผ่อนคลาย และเก้าอี้ที่สะดวกสบาย เพื่อขจัดความวิตกกังวลและเปิดรับการเรียนรู้ได้อย่างรวดเร็ว (Desuggestion)"
    ),
    (
        "kru-4352",
        "[ภาษาอังกฤษ - ELT Methodology] In Community Language Learning (CLL), what role does the teacher assume?",
        "A supportive 'counselor' who facilitates communication from outside the circle of 'clients' (learners)",
        ["An autocratic dictator enforcing strict punishments", "A silent observer who never interacts with pupils", "A foreign ambassador delivering diplomatic speeches"],
        "Community Language Learning: CLL พัฒนาโดย Charles Curran อิงหลักจิตวิทยาการให้คำปรึกษา ครูทำหน้าที่เป็น 'ที่ปรึกษา' (Counselor) คอยแปลและช่วยเหลืออยู่นอกวงสนทนา ขณะที่นักเรียนนั่งล้อมวงเป็นกลุ่ม"
    ),
    (
        "kru-4353",
        "[ภาษาอังกฤษ - ELT Methodology] What is the difference between 'deductive' and 'inductive' grammar teaching?",
        "Deductive presents the rule first followed by examples, whereas inductive provides examples first so learners discover the rule",
        ["Deductive is for young children, whereas inductive is for university professors", "Deductive uses computers, whereas inductive uses paper flashcards", "Deductive teaches slang, whereas inductive teaches formal poetry"],
        "Grammar Teaching Approaches: แบบนิรนัย (Deductive) สอนกฎก่อนแล้วจึงให้ทำตัวอย่าง/แบบฝึกหัด ส่วนแบบอุปนัย (Inductive) ให้ดูตัวอย่างประโยคจำนวนมากก่อน เพื่อให้ผู้เรียนค้นพบกฎไวยากรณ์ด้วยตนเอง (Discovery learning)"
    ),
    (
        "kru-4354",
        "[ภาษาอังกฤษ - ELT Methodology] What is the primary pedagogical goal of 'Jigsaw' cooperative learning activities in reading classes?",
        "To create positive interdependence by giving each group member a unique piece of information necessary for the whole group's success",
        ["To foster cut-throat individual competition among classmates", "To allow the smartest student in the group to do all the work", "To keep the entire classroom in absolute complete silence"],
        "Cooperative Learning / Jigsaw: เทคนิคจิ๊กซอว์ (Aronson) สร้าง 'การพึ่งพาซึ่งกันและกันเชิงบวก' (Positive Interdependence) โดยแบ่งเนื้อหาให้สมาชิกแต่ละคนไปศึกษาจนเชี่ยวชาญ แล้วกลับมาสอนเพื่อนในกลุ่ม"
    ),
    (
        "kru-4355",
        "[ภาษาอังกฤษ - ELT Methodology] An instructional technique where a teacher rephrases a student's grammatically erroneous utterance correctly without explicitly saying 'that is wrong' is called ________.",
        "recasting",
        ["metalinguistic feedback", "punitive correction", "explicit reprimand"],
        "Corrective Feedback / Recast: 'Recasting' คือการแก้ไขข้อผิดพลาดโดยครูพูดประโยคที่ถูกต้องซ้ำกลับไปอย่างเป็นธรรมชาติ เช่น นักเรียนพูด 'Yesterday I go to market' -> ครูพูด 'Oh, you went to the market yesterday!'"
    ),
    (
        "kru-4356",
        "[ภาษาอังกฤษ - ELT Methodology] In Jeremy Harmer's ESA methodology framework, what do the letters E, S, and A represent?",
        "Engage, Study, and Activate",
        ["Evaluate, Standardize, and Assess", "Explain, Simplify, and Apply", "Examine, Scrutinize, and Act"],
        "Harmer's ESA Framework: Jeremy Harmer เสนอรูปแบบการสอนภาษา ESA: 1. Engage (กระตุ้นความสนใจ) 2. Study (ศึกษาโครงสร้างและภาษา) 3. Activate (นำภาษาไปปฏิบัติใช้ในการสื่อสาร)"
    ),
    (
        "kru-4357",
        "[ภาษาอังกฤษ - ELT Methodology] Which corrective feedback strategy prompts the student to self-correct by pausing or asking 'Could you say that again in another way?'",
        "Elicitation",
        ["Direct explicit correction", "Recasting", "Silent ignoring"],
        "Elicitation Technique: การกระตุ้นให้ผู้เรียนแก้ไขตนเอง (Elicitation) โดยครูเว้นวรรคให้เด็กเติมคำที่ถูก หรือถามนำ เพื่อให้ผู้เรียนดึงความรู้ออกมาปรับแก้ด้วยตนเอง (Self-repair)"
    ),
    (
        "kru-4358",
        "[ภาษาอังกฤษ - ELT Methodology] What is the recommended balance between Teacher Talk Time (TTT) and Student Talk Time (STT) in a communicative English classroom?",
        "Minimize unnecessary TTT to maximize active, meaningful STT",
        ["TTT should account for 95% of total classroom minutes", "STT should be eliminated to avoid grammatical inaccuracies", "TTT and STT should both be replaced entirely by television broadcasts"],
        "ELT Best Practice / TTT vs STT: ในห้องเรียนภาษาเพื่อการสื่อสาร ครูควรลดการพูดที่ไม่จำเป็นของครู (Minimize TTT) และเพิ่มเวลาให้ผู้เรียนได้ฝึกพูดสื่อสารอย่างมีความหมายให้มากที่สุด (Maximize STT)"
    ),
    (
        "kru-4359",
        "[ภาษาอังกฤษ - ELT Methodology] In vocabulary instruction, 'concept checking questions' (CCQs) are utilized by teachers primarily to ________.",
        "verify that students truly understand the core meaning of a target word without relying on L1 translation",
        ["test if students can spell the word backwards", "determine which student has the loudest speaking voice", "grade students for report card rankings"],
        "CCQs in ELT: คำถามตรวจสอบมโนทัศน์ (Concept Checking Questions: CCQs) ใช้เพื่อตรวจสอบว่าผู้เรียนเข้าใจความหมายและเงื่อนไขการใช้คำศัพท์นั้นอย่างแท้จริงหรือไม่ โดยไม่จำเป็นต้องแปลเป็นภาษาไทย"
    ),
    (
        "kru-4360",
        "[ภาษาอังกฤษ - ELT Methodology] An 'information gap' activity in communicative language teaching requires that ________.",
        "one participant possesses information that the other participant must obtain through communicative exchange",
        ["both students already share identical printed notes", "the teacher provides all answers on the board beforehand", "students memorize and recite the same textbook dialogue in unison"],
        "CLT / Information Gap: กิจกรรมช่องว่างของข้อมูล (Information Gap) เป็นหัวใจสำคัญของ CLT ซึ่งผู้พูดแต่ละคนมีข้อมูลไม่เท่ากัน ทำให้เกิดความจำเป็นต้องสื่อสาร แลกเปลี่ยน ซักถาม เพื่อให้ได้ข้อมูลที่ครบถ้วน"
    ),

    # --- CEFR Framework (kru-4361 to kru-4375) ---
    (
        "kru-4361",
        "[ภาษาอังกฤษ - CEFR Framework] What does the acronym 'CEFR' stand for in international language education?",
        "Common European Framework of Reference for Languages",
        ["Central Educational Facility for Reading", "Council of European Foreign Relations", "Core English Fluency Regulations"],
        "CEFR Definition: CEFR ย่อมาจาก 'Common European Framework of Reference for Languages: Learning, teaching, assessment' กรอบมาตรฐานการประเมินความสามารถทางภาษาของสหภาพยุโรปที่ทั่วโลกและกระทรวงศึกษาธิการไทยนำมาใช้"
    ),
    (
        "kru-4362",
        "[ภาษาอังกฤษ - CEFR Framework] The CEFR divides language proficiency into three broad bands comprising six distinct reference levels. What are the three broad bands?",
        "A (Basic User), B (Independent User), and C (Proficient User)",
        ["Novice, Intermediate, and Master", "Primary, Secondary, and Tertiary", "Bronze, Silver, and Gold"],
        "CEFR Bands: กรอบ CEFR แบ่งระดับความสามารถออกเป็น 3 ระดับหลัก: A (Basic User: ผู้ใช้ภาษาระดับพื้นฐาน), B (Independent User: ผู้ใช้ภาษาระดับอิสระ), และ C (Proficient User: ผู้ใช้ภาษาระดับเชี่ยวชาญ)"
    ),
    (
        "kru-4363",
        "[ภาษาอังกฤษ - CEFR Framework] Which CEFR level corresponds to the 'Threshold' stage, where a user can understand the main points of clear standard input on familiar matters and produce simple connected text?",
        "B1",
        ["A1", "A2", "C1"],
        "CEFR Reference Levels: B1 คือระดับ 'Threshold' ผู้เรียนสามารถเข้าใจประเด็นหลักในเรื่องที่คุ้นเคย (การงาน โรงเรียน การท่องเที่ยว) และสามารถสร้างข้อความเชื่อมโยงอย่างง่ายได้"
    ),
    (
        "kru-4364",
        "[ภาษาอังกฤษ - CEFR Framework] According to Thailand's Ministry of Education policy, what is the target CEFR competency benchmark for specialized English teachers at the basic education level?",
        "CEFR B2 (or C1 for advanced/bilingual teachers)",
        ["CEFR A1", "CEFR A2", "CEFR C2 only"],
        "Thai MOE Policy / CEFR: กระทรวงศึกษาธิการกำหนดเกณฑ์มาตรฐานสมรรถนะครูผู้สอนวิชาเอกภาษาอังกฤษไว้ที่ระดับ CEFR B2 (และส่งเสริมสู่ C1)"
    ),
    (
        "kru-4365",
        "[ภาษาอังกฤษ - CEFR Framework] At which CEFR level can a language user 'understand a wide range of demanding, longer texts, recognize implicit meaning, and express ideas fluently and spontaneously without much obvious searching for expressions'?",
        "C1 (Effective Operational Proficiency)",
        ["A2 (Waystage)", "B1 (Threshold)", "B2 (Vantage)"],
        "CEFR Descriptor for C1: ระดับ C1 (Effective Operational Proficiency) ผู้ใช้ภาษาสามารถเข้าใจบทความยาวและซับซ้อน จับความหมายโดยนัยได้ และสื่อสารได้อย่างคล่องแคล่วเป็นธรรมชาติโดยไม่ต้องหยุดหาคำศัพท์"
    ),
    (
        "kru-4366",
        "[ภาษาอังกฤษ - CEFR Framework] In CEFR terminology, behavioral descriptions of what a learner is capable of performing at each level are formulated as ________.",
        "'Can-do' descriptors",
        ["'Must-memorize' rules", "'Error-free' mandates", "'Standardized' deductions"],
        "CEFR Can-Do Descriptors: กรอบ CEFR อธิบายสมรรถนะทางภาษาในลักษณะข้อความ 'Can-do' (ผู้เรียนสามารถทำอะไรได้) ซึ่งมุ่งเน้นที่การปฏิบัติได้จริงเชิงบวก มากกว่าการวัดข้อผิดพลาด"
    ),
    (
        "kru-4367",
        "[ภาษาอังกฤษ - CEFR Framework] Which CEFR level represents the 'Breakthrough' beginner stage, where a learner can understand and use familiar everyday expressions and basic phrases aimed at the satisfaction of concrete needs?",
        "A1",
        ["A2", "B1", "B2"],
        "CEFR A1 (Breakthrough): ระดับเริ่มต้น ผู้เรียนสามารถเข้าใจและใช้วลีพื้นฐานในชีวิตประจำวันเพื่อตอบสนองความต้องการที่เป็นรูปธรรม แนะนำตนเอง และถามตอบข้อมูลส่วนตัวเบื้องต้นได้"
    ),
    (
        "kru-4368",
        "[ภาษาอังกฤษ - CEFR Framework] What is the designated title of CEFR Level B2?",
        "Vantage",
        ["Waystage", "Threshold", "Mastery"],
        "CEFR Global Scale Names: A1 = Breakthrough, A2 = Waystage, B1 = Threshold, B2 = Vantage, C1 = Effective Operational Proficiency, C2 = Mastery"
    ),
    (
        "kru-4369",
        "[ภาษาอังกฤษ - CEFR Framework] According to the national basic education curriculum expectations in Thailand, primary school graduates (Grade 6 / Prathom 6) are expected to achieve which CEFR benchmark?",
        "CEFR A1",
        ["CEFR B1", "CEFR B2", "CEFR C1"],
        "Thai Curriculum CEFR Target: เป้าหมายตามหลักสูตรแกนกลางฯ ของไทย กำหนดให้ผู้เรียนจบชั้นประถมศึกษาปีที่ 6 มีความสามารถทางภาษาอังกฤษในระดับ CEFR A1 (และจบ ม.3 ที่ระดับ A2, จบ ม.6 ที่ระดับ B1)"
    ),
    (
        "kru-4370",
        "[ภาษาอังกฤษ - CEFR Framework] Which CEFR level represents complete 'Mastery', characterized by effortless comprehension of virtually everything heard or read and summarizing arguments from different spoken/written sources coherently?",
        "C2",
        ["C1", "B2", "B1"],
        "CEFR C2 (Mastery): ระดับสูงสุดของ CEFR คือ C2 (Mastery) สามารถเข้าใจทุกสิ่งที่ได้ยินหรือได้อ่านอย่างง่ายดาย สรุปข้อมูลจากแหล่งต่างๆ และถ่ายทอดความคิดได้อย่างแม่นยำ ละเอียดอ่อน และเป็นธรรมชาติเทียบเท่าเจ้าของภาษาผู้มีการศึกษาสูง"
    ),
    (
        "kru-4371",
        "[ภาษาอังกฤษ - CEFR Framework] The 2018 CEFR Companion Volume introduced new descriptor scales expanding beyond traditional four skills to include ________.",
        "mediation, plurilingual/pluricultural competence, and online interaction",
        ["handwriting speed, pen pressure, and ink durability", "physical running speed and stamina", "memorization of Latin prefixes"],
        "CEFR Companion Volume (2018/2020): กรอบ CEFR ฉบับปรับปรุงได้เพิ่มสเกลการประเมินด้าน 'การเป็นสื่อกลางทางภาษา' (Mediation), สมรรถนะพหุภาษา/พหุวัฒนธรรม และการปฏิสัมพันธ์ออนไลน์ (Online interaction)"
    ),
    (
        "kru-4372",
        "[ภาษาอังกฤษ - CEFR Framework] A student who can 'communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar and routine matters' is positioned at ________.",
        "CEFR A2 (Waystage)",
        ["CEFR A1", "CEFR B2", "CEFR C2"],
        "CEFR A2 Descriptor: ระดับ A2 (Waystage) สามารถสื่อสารในภาระงานที่ง่ายและเป็นกิจวัตร ซึ่งต้องมีการแลกเปลี่ยนข้อมูลโดยตรงเกี่ยวกับเรื่องที่คุ้นเคย เช่น การซื้อของ ครอบครัว การเดินทาง"
    ),
    (
        "kru-4373",
        "[ภาษาอังกฤษ - CEFR Framework] A learner at CEFR B2 level can be expected to ________.",
        "interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible without strain for either party",
        ["understand only single isolated greeting words like 'hello' and 'bye'", "write a 300-page doctoral thesis in legal jurisprudence", "remain completely silent for the entire academic term"],
        "CEFR B2 Descriptor: ระดับ B2 สามารถสื่อสารได้อย่างคล่องแคล่วและเป็นธรรมชาติในระดับที่ปฏิสัมพันธ์กับเจ้าของภาษาได้โดยไม่มีฝ่ายใดรู้สึกอึดอัดหรือเกร็ง"
    ),
    (
        "kru-4374",
        "[ภาษาอังกฤษ - CEFR Framework] Which communicative activity is categorized under 'Mediation' in the updated CEFR?",
        "Explaining data from a complex chart to a classmate who does not understand it",
        ["Silently taking a multiple-choice grammar test alone", "Listening to a pre-recorded monologue on headphones", "Copying words from a printed textbook onto lined paper"],
        "Mediation in CEFR: Mediation คือการทำหน้าที่เป็นตัวกลางในการถ่ายทอดหรือแปลงสาร เช่น การอธิบายแผนภูมิ ซักทอดข้อมูล หรือช่วยแปลความให้ผู้อื่นเข้าใจ"
    ),
    (
        "kru-4375",
        "[ภาษาอังกฤษ - CEFR Framework] The European Language Portfolio (ELP) derived from the CEFR consists of three main components: Language Passport, Language Biography, and ________.",
        "Dossier",
        ["Grade Book", "Detention Record", "Tuition Receipt"],
        "European Language Portfolio: แฟ้มสะสมงานภาษาประกอบด้วย 3 ส่วน: 1. Passport (พาสปอร์ตภาษา บันทึกระดับทักษะ) 2. Biography (ประวัติการเรียนรู้ภาษา) 3. Dossier (แฟ้มรวบรวมชิ้นงานตัวอย่างจริง)"
    ),

    # --- Language Assessment, Testing & Feedback (kru-4376 to kru-4400) ---
    (
        "kru-4376",
        "[ภาษาอังกฤษ - Language Assessment] If a test accurately measures what it was specifically designed to measure (e.g., measuring communicative speaking rather than grammatical terminology), the test demonstrates high ________.",
        "validity",
        ["reliability", "practicability", "washback"],
        "Measurement / Validity: ความเที่ยงตรง (Validity) คือคุณสมบัติของเครื่องมือวัดที่สามารถวัดได้ตรงตามสิ่งที่ต้องการวัดจริงอย่างแท้จริง"
    ),
    (
        "kru-4377",
        "[ภาษาอังกฤษ - Language Assessment] When a test produces consistent, dependable, and stable scores upon repeated administrations under identical conditions, the test possesses high ________.",
        "reliability",
        ["validity", "authenticity", "subjectivity"],
        "Measurement / Reliability: ความเชื่อมั่น (Reliability) คือความคงเส้นคงวา แน่นอน สม่ำเสมอของผลการวัด ไม่ว่าจะวัดกี่ครั้งภายใต้เงื่อนไขเดิม ก็ได้ผลลัพธ์ใกล้เคียงกันเสมอ"
    ),
    (
        "kru-4378",
        "[ภาษาอังกฤษ - Language Assessment] The impact that a high-stakes standardized examination exerts on classroom teaching and learning practices (either positive or negative) is known as ________.",
        "washback (or backwash)",
        ["halo effect", "central tendency", "Hawthorne effect"],
        "Testing Terminology: 'Washback / Backwash effect' (ผลกระทบย้อนกลับของการทดสอบ) คืออิทธิพลของการสอบที่มีผลต่อรูปแบบการเรียนการสอนในห้องเรียน เช่น ถ้าข้อสอบเน้นข้อเขียน ครูจะฝึกเด็กเขียนมากขึ้น (Positive washback)"
    ),
    (
        "kru-4379",
        "[ภาษาอังกฤษ - Language Assessment] A scoring guide that evaluates a student's performance across separate specific criteria (e.g., vocabulary, grammar, pronunciation, fluency) with independent score bands is called a(n) ________ rubric.",
        "analytic",
        ["holistic", "norm-referenced", "binary"],
        "Assessment Rubrics: รูบริกแบบแยกองค์ประกอบ (Analytic Rubric) ประเมินผลงานโดยแยกเกณฑ์ออกเป็นมิติย่อยๆ แต่ละด้านชัดเจน (เช่น ไวยากรณ์ คำศัพท์ การออกเสียง ความคล่องแคล่ว) ให้คะแนนแยกกัน ต่างจาก Holistic Rubric ที่ให้คะแนนภาพรวมจุดเดียว"
    ),
    (
        "kru-4380",
        "[ภาษาอังกฤษ - Language Assessment] What type of test is administered at the outset of a course to identify specific linguistic weaknesses and strengths so instruction can be tailored accordingly?",
        "Diagnostic test",
        ["Summative test", "Placement test", "Aptitude test"],
        "Types of Language Tests: แบบทดสอบวินิจฉัย (Diagnostic test) ใช้ตรวจหาจุดเด่นและจุดบกพร่องที่เจาะจงของผู้เรียนก่อนเริ่มเรียน เพื่อนำผลมาวางแผนซ่อมเสริมหรือจัดการเรียนรู้ได้อย่างตรงจุด"
    ),
    (
        "kru-4381",
        "[ภาษาอังกฤษ - Language Assessment] In a 'criterion-referenced' test, how are student performances evaluated?",
        "Against predetermined learning standards and objective benchmarks, regardless of other examinees' scores",
        ["Compared against the average rank and percentile curve of other students", "Based entirely on the student's physical height and age", "By comparing student scores to the teacher's personal favorites"],
        "Criterion-Referenced vs Norm-Referenced: การทดสอบแบบอิงเกณฑ์ (Criterion-Referenced) ประเมินผลเทียบกับเกณฑ์หรือมาตรฐานการเรียนรู้ที่กำหนดไว้ล่วงหน้า โดยไม่นำคะแนนไปเปรียบเทียบลำดับที่กับผู้สอบคนอื่น"
    ),
    (
        "kru-4382",
        "[ภาษาอังกฤษ - Language Assessment] What type of validity is threatened if an English reading test includes extremely difficult advanced physics formulas that students without a science background cannot decode?",
        "Construct validity",
        ["Face validity", "Test-retest reliability", "Scorer reliability"],
        "Construct Validity: ความเที่ยงตรงเชิงโครงสร้าง (Construct validity) จะเสียหายหากข้อสอบไปวัดสิ่งอื่นที่ไม่ใช่โครงสร้างคุณลักษณะที่ต้องการวัด (ในที่นี้คือไปวัดความรู้ฟิสิกส์แทนที่จะวัดความเข้าใจการอ่านภาษาอังกฤษ)"
    ),
    (
        "kru-4383",
        "[ภาษาอังกฤษ - Language Assessment] What occurs during 'inter-rater reliability' checks in oral speaking examinations?",
        "Two or more independent examiners score the same student performance to check for scoring consistency",
        ["The same teacher grades the paper twice after a one-year interval", "Students grade each other's papers without using any rubric", "A computer randomly scrambles multiple-choice answer keys"],
        "Inter-rater Reliability: ความเชื่อมั่นระหว่างผู้ประเมิน (Inter-rater reliability) คือความสอดคล้องกันของผลคะแนนเมื่อมีกรรมการผู้ตรวจตั้งแต่สองคนขึ้นไปประเมินผลงานชิ้นเดียวกันอย่างอิสระ"
    ),
    (
        "kru-4384",
        "[ภาษาอังกฤษ - Language Assessment] A language test that requires examinees to perform realistic, real-world tasks (such as ordering food in a restaurant or drafting a formal business email) exhibits high ________.",
        "authenticity",
        ["artificiality", "abstractness", "ambiguity"],
        "Test Authenticity: ความเป็นของแท้/สภาพจริง (Authenticity) คือระดับความสอดคล้องระหว่างภาระงานในข้อสอบกับสถานการณ์การใช้ภาษาจริงในโลกแห่งความเป็นจริง"
    ),
    (
        "kru-4385",
        "[ภาษาอังกฤษ - Language Assessment] In test development, what is meant by 'face validity'?",
        "The superficial appearance that a test looks acceptable, relevant, and fair to test-takers and stakeholders",
        ["A mathematical correlation of test scores with future salary", "The physical facial expression of the examiner during testing", "The durability of the printed paper under bright sunlight"],
        "Face Validity: ความเที่ยงตรงตามสภาพที่ปรากฏ (Face validity) คือการที่ผู้สอบหรือผู้มีส่วนได้ส่วนเสียมองดูผิวเผินแล้วเห็นว่าแบบทดสอบนั้นดูเหมาะสม น่าเชื่อถือ และเกี่ยวข้องกับสิ่งที่วัดจริง"
    ),
    (
        "kru-4386",
        "[ภาษาอังกฤษ - Language Assessment] A 'cloze test' is an assessment technique where ________.",
        "words are systematically deleted from a passage at regular intervals (e.g., every 7th word) for examinees to supply",
        ["students read an entire novel aloud in complete unison", "examinees draw comic illustrations matching audio sounds", "teachers lecture while students take dictation word-for-word"],
        "Cloze Test Procedure: แบบทดสอบแบบ Cloze test (Taylor, 1953) คือการตัดคำออกจากข้อความตามรอบที่กำหนดแน่นอน (เช่น ตัดทุกๆ คำที่ 5, 7) เพื่อให้ผู้สอบเติมคำที่ถูกต้องลงในช่องว่าง วัดความเข้าใจภาษาแบบองค์รวม"
    ),
    (
        "kru-4387",
        "[ภาษาอังกฤษ - Language Assessment] Which assessment format is best suited for assessing a student's longitudinal growth and reflective learning process over an entire academic semester?",
        "Portfolio assessment",
        ["Single-sitting multiple-choice midterm exam", "Unannounced spelling pop quiz", "One-minute speed typing drill"],
        "Portfolio Assessment: แฟ้มสะสมงาน (Portfolio) เป็นเครื่องมือประเมินตามสภาพจริงที่รวบรวมชิ้นงานและบันทึกการสะท้อนคิดของผู้เรียนอย่างต่อเนื่องตลอดภาคเรียน ทำให้เห็นพัฒนาการการเรียนรู้ในระยะยาว"
    ),
    (
        "kru-4388",
        "[ภาษาอังกฤษ - Language Assessment] The 'Halo Effect' in subjective language assessment refers to ________.",
        "a scorer's overall favorable impression of a student biasing their judgment on specific linguistic tasks",
        ["a technical glitch in computer audio recording software", "a glowing reflection on the classroom whiteboard", "a test-taker guessing all multiple-choice answers randomly"],
        "Halo Effect Bias: อคติแบบภาพเหมารวมด้านบวก (Halo Effect) เกิดขึ้นเมื่อผู้ตรวจเกิดความประทับใจในตัวผู้เรียนโดยรวม (เช่น นิสัยดี หน้าตาเรียบร้อย) จนทำให้เผลอให้คะแนนทักษะภาษาด้านอื่นๆ สูงเกินความเป็นจริง"
    ),
    (
        "kru-4389",
        "[ภาษาอังกฤษ - Language Assessment] In item analysis, an 'Item Difficulty Index' (p-value) of 0.85 indicates that the question is ________.",
        "very easy (85% of test-takers answered it correctly)",
        ["very difficult (only 15% answered it correctly)", "flawed and completely unfair", "incapable of discriminating between high and low achievers"],
        "Item Difficulty Index: ค่าความยากง่าย (p) มีค่าตั้งแต่ 0.00 ถึง 1.00 โดยค่า p = 0.85 แสดงว่ามีผู้ตอบถูกถึง 85% ถือว่าเป็นข้อสอบที่ 'ค่อนข้างง่าย' (ข้อสอบที่ดีมักมีค่า p ระหว่าง 0.20 - 0.80)"
    ),
    (
        "kru-4390",
        "[ภาษาอังกฤษ - Language Assessment] What does a negative 'Item Discrimination Index' (r < 0) reveal about an exam question?",
        "More lower-performing students answered the item correctly than higher-performing students, indicating a flawed question or miskeyed answer",
        ["The question is brilliantly designed and perfectly distinguishes geniuses", "The test was printed with black ink instead of blue ink", "All students scored exactly 100% on the examination"],
        "Item Discrimination Index (r): ค่าอำนาจจำแนกที่เป็นลบ (r < 0) แสดงถึงความผิดปกติอย่างยิ่ง เพราะเด็กกลุ่มอ่อนกลับตอบถูกมากกว่าเด็กกลุ่มเก่ง ซึ่งอาจเกิดจากเฉลยผิด (miskeyed) หรือคำถามกำกวมชวนสับสน ต้องตัดทิ้งหรือแก้ไข"
    ),
    (
        "kru-4391",
        "[ภาษาอังกฤษ - Language Assessment] What is the primary characteristic of 'dynamic assessment' grounded in Vygotskian theory?",
        "Assessment and instruction are seamlessly intertwined by providing mediated prompts during the test to evaluate learning potential",
        ["Students are tested while jogging or doing jumping jacks", "The test questions change every thirty seconds without warning", "The examination is administered in a virtual reality gaming world"],
        "Dynamic Assessment: การประเมินแบบพลวัต (Vygotsky / Feuerstein) ผสานการทดสอบเข้ากับการสอน โดยผู้ประเมินให้การชี้แนะเป็นลำดับขั้นระหว่างทำแบบทดสอบ เพื่อวัด 'ศักยภาพการเรียนรู้' (Learning Potential) ภายใน ZPD"
    ),
    (
        "kru-4392",
        "[ภาษาอังกฤษ - Language Assessment] Which type of language test is primarily designed to assign newly arrived students into homogenous instructional groups matching their language proficiency?",
        "Placement test",
        ["Aptitude test", "Achievement test", "Diagnostic test"],
        "Placement Testing: แบบทดสอบจัดระดับ (Placement test) มีจุดประสงค์เพื่อจำแนกผู้เรียนเข้าสู่ชั้นเรียนหรือกลุ่มการเรียนที่เหมาะสมกับระดับความสามารถทางภาษาของตน"
    ),
    (
        "kru-4393",
        "[ภาษาอังกฤษ - Language Assessment] In an ESL speaking evaluation, what distinguishes a 'holistic rubric' from an 'analytic rubric'?",
        "A holistic rubric provides a single global score based on an overall impression of the performance",
        ["A holistic rubric takes three days to grade per student", "A holistic rubric scores thirty separate grammatical sub-rules independently", "A holistic rubric can only be used for multiple-choice tests"],
        "Holistic Rubric: รูบริกแบบองค์รวม (Holistic Rubric) ให้ระดับคะแนนเดียวตามภาพรวมของคุณภาพงานโดยรวมทั้งหมด เหมาะกับการตรวจที่ต้องการความรวดเร็ว เช่น การประเมินการพูดคร่าวๆ"
    ),
    (
        "kru-4394",
        "[ภาษาอังกฤษ - Language Assessment] When a teacher uses 'delayed feedback' rather than 'immediate interruption' during a student speaking fluency activity, the goal is to ________.",
        "avoid breaking the communicative flow and causing communication anxiety",
        ["save time so the teacher can leave the classroom early", "confuse students so they forget what they said", "allow grammatical errors to permanently fossilize"],
        "Fluency Feedback Strategy: ในกิจกรรมฝึกความคล่องแคล่ว (Fluency) ครูควรจดบันทึกข้อผิดพลาดไว้แล้วนำมาอธิบายแก้ไขภายหลัง (Delayed Feedback) เพื่อไม่ให้ขัดจังหวะการสื่อสารและไม่ทำลายความมั่นใจของผู้เรียน"
    ),
    (
        "kru-4395",
        "[ภาษาอังกฤษ - Language Assessment] What is 'peer assessment' primarily designed to cultivate among language learners?",
        "Critical evaluation skills, learner autonomy, and collaborative awareness of assessment criteria",
        ["Envy, resentment, and hostile interpersonal bullying", "Total reliance on the teacher for every decision", "Laziness so teachers do not have to grade assignments"],
        "Peer Assessment: การประเมินโดยเพื่อน (Peer Assessment) ช่วยส่งเสริมความเป็นอิสระในการเรียนรู้ (Autonomy), ทักษะการคิดวิพากษ์ และความเข้าใจในเกณฑ์การประเมินคุณภาพงานอย่างลึกซึ้ง"
    ),
    (
        "kru-4396",
        "[ภาษาอังกฤษ - Language Assessment] A reading test section where examinees must skim an entire newspaper page in thirty seconds to identify the main headline measures which specific reading skill?",
        "Skimming (reading for gist)",
        ["Scanning (reading for specific detail)", "Intensive critical close reading", "Extensive leisure reading"],
        "Reading Sub-skills: 'Skimming' คือการอ่านกวาดสายตาอย่างรวดเร็วเพื่อจับใจความสำคัญหรือภาพรวมของเนื้อหา (Reading for gist) แตกต่างจาก 'Scanning' ซึ่งเป็นการกวาดสายตาหาข้อมูลเฉพาะเจาะจง (Specific detail)"
    ),
    (
        "kru-4397",
        "[ภาษาอังกฤษ - Language Assessment] In writing assessment, what aspect of text quality relates to the smooth logical connection and flow of ideas throughout an essay?",
        "Coherence",
        ["Cohesion", "Orthography", "Punctuation"],
        "Coherence vs Cohesion: 'Coherence' (สัมพันธภาพ/ความสอดคล้องเชิงความหมาย) คือความเชื่อมโยงของความคิดและเหตุผลในระดับเนื้อหา ส่วน 'Cohesion' (เอกภาพทางภาษา) คือการใช้ไวยากรณ์และคำเชื่อมเชื่อมโยงประโยค"
    ),
    (
        "kru-4398",
        "[ภาษาอังกฤษ - Language Assessment] Which of the following is an example of an 'indirect' language testing task?",
        "Selecting the correct grammatical error in an underlined sentence on a paper test to infer writing ability",
        ["Delivering an oral persuasive presentation to a live audience", "Writing a 250-word opinion essay on environmental conservation", "Engaging in an unscripted interview with a native speaker"],
        "Direct vs Indirect Testing: การทดสอบทางอ้อม (Indirect Testing) วัดทักษะที่ต้องการผ่านทักษะย่อยอื่น เช่น วัดความสามารถในการเขียนโดยให้ทำข้อสอบ Error Identification แทนที่จะให้ลงมือเขียนจริง"
    ),
    (
        "kru-4399",
        "[ภาษาอังกฤษ - Language Assessment] What danger arises from 'test-driven teaching' where instruction focuses exclusively on multiple-choice exam tricks?",
        "Negative washback leading to curriculum narrowing and neglect of authentic communicative skills",
        ["Students becoming too creatively fluent in conversational debates", "Schools spending too much money on arts and field trips", "Curriculum expanding too broadly into international cultures"],
        "Negative Washback: ผลกระทบเชิงลบของการสอบ (Negative washback) ทำให้เกิดการบีบแคบหลักสูตร (Curriculum narrowing) ครูมุ่งเน้นแต่เทคนิคกาข้อสอบ ทำให้ละเลยการฝึกทักษะการสื่อสารจริงในชีวิตประจำวัน"
    ),
    (
        "kru-4400",
        "[ภาษาอังกฤษ - Language Assessment] What is the overarching purpose of 'Assessment for Learning' (AfL) in modern language pedagogy?",
        "To utilize real-time diagnostic evidence to inform pedagogical adjustments and empower student learning progress",
        ["To compile statistical rankings for provincial newspaper publication", "To punish underachieving students with mandatory weekend detentions", "To assign final numerical scores for cumulative graduation certificates"],
        "Assessment for Learning (AfL): การประเมินเพื่อพัฒนาการเรียนรู้ (AfL) มีจุดประสงค์เพื่อใช้ข้อมูลเชิงวินิจฉัยที่ได้ระหว่างการเรียนมาปรับปรุงวิธีการจัดการเรียนการสอนของครู และช่วยให้ผู้เรียนรู้จุดที่ต้องพัฒนาของตนเอง"
    ),
]

print(f"Set 44 loaded: {len(SET44_QUESTIONS)} questions")
