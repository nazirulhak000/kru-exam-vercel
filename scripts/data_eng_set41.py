# -*- coding: utf-8 -*-
# Set 41: Advanced Grammar & Sentence Structure (kru-4001 to kru-4100)

SET41_QUESTIONS = [
    # --- Tenses & Aspects (kru-4001 to kru-4010) ---
    (
        "kru-4001",
        "[ภาษาอังกฤษ - Tenses] By the time the committee convenes next Friday, the research team ________ all the field data for the annual report.",
        "will have compiled",
        ["will compile", "has compiled", "had compiled"],
        "Future Perfect Tense (will have + V3) ใช้กับเหตุการณ์ที่จะเสร็จสมบูรณ์ก่อนเวลาหรือเหตุการณ์หนึ่งในอนาคต โดยมีตัวบอกเวลา 'By the time + Present Simple (convenes)'"
    ),
    (
        "kru-4002",
        "[ภาษาอังกฤษ - Tenses] Hardly had the keynote speaker stepped onto the podium ________ a sudden power outage plunged the auditorium into complete darkness.",
        "when",
        ["than", "then", "that"],
        "โครงสร้าง 'Hardly / Scarcely had + S + V3... when + S + V2' ใช้แสดงเหตุการณ์ที่เพิ่งเกิดขึ้นแล้วมีอีกเหตุการณ์หนึ่งแทรกขึ้นมาทันที (ถ้าใช้ No sooner จะใช้คู่กับ than)"
    ),
    (
        "kru-4003",
        "[ภาษาอังกฤษ - Tenses] She ________ for the multinational firm for over fifteen years before she finally decided to launch her own consultancy.",
        "had been working",
        ["has been working", "was working", "works"],
        "Past Perfect Continuous Tense (had been + V-ing) เน้นความต่อเนื่องของการกระทำที่ดำเนินมาอย่างต่อเนื่องในอดีต ก่อนที่จะมีอีกเหตุการณ์หนึ่งเกิดขึ้นตามมาในอดีต (before she finally decided)"
    ),
    (
        "kru-4004",
        "[ภาษาอังกฤษ - Tenses] Since the inception of the national literacy initiative, the literacy rate in rural districts ________ by nearly 18 percent.",
        "has increased",
        ["increased", "had increased", "was increasing"],
        "Present Perfect Tense (has/have + V3) ใช้กับเหตุการณ์ที่เริ่มต้นขึ้นในอดีตและส่งผลต่อเนื่องมาถึงปัจจุบัน โดยมีคำบอกเวลา 'Since + จุดเริ่มต้นในอดีต'"
    ),
    (
        "kru-4005",
        "[ภาษาอังกฤษ - Tenses] While the archeologists ________ the ancient ruins, they unearthed a trove of Bronze Age artifacts.",
        "were excavating",
        ["had excavated", "excavated", "have excavated"],
        "Past Continuous Tense (were excavating) ใช้แสดงเหตุการณ์ที่กำลังดำเนินอยู่ในอดีต และมี Past Simple (unearthed) เข้ามาขัดจังหวะหรือเกิดขึ้นในระหว่างนั้น"
    ),
    (
        "kru-4006",
        "[ภาษาอังกฤษ - Tenses] The professor reminded the students that water ________ at 100 degrees Celsius under standard atmospheric pressure.",
        "boils",
        ["boiled", "had boiled", "would boil"],
        "แม้ประโยคหลักจะอยู่ในอดีต (reminded) แต่ข้อเท็จจริงทางวิทยาศาสตร์หรือความจริงทั่วไป (General Truth / Scientific Fact) ใน Indirect Speech ยังคงรูป Present Simple Tense เสมอ"
    ),
    (
        "kru-4007",
        "[ภาษาอังกฤษ - Tenses] At this exact moment tomorrow afternoon, Dr. Arisara ________ the opening remarks at the International TEFL Symposium.",
        "will be delivering",
        ["will deliver", "delivers", "will have delivered"],
        "Future Continuous Tense (will be + V-ing) ใช้กับเหตุการณ์ที่จะกำลังกระทำอยู่ ณ เวลาที่ระบุไว้อย่างเจาะจงในอนาคต ('At this exact moment tomorrow afternoon')"
    ),
    (
        "kru-4008",
        "[ภาษาอังกฤษ - Tenses] Many contemporary linguists believe that the human brain ________ an innate capacity for syntax acquisition.",
        "possesses",
        ["is possessing", "has been possessing", "was possessed"],
        "กริยาแสดงสถานะหรือการครอบครอง (Stative Verbs) เช่น possess, belong to, own มักไม่นิยมใช้ในรูป Continuous Tense จึงต้องใช้ Present Simple (possesses)"
    ),
    (
        "kru-4009",
        "[ภาษาอังกฤษ - Tenses] When Inspector Vance arrived at the crime scene, forensic experts ________ the area for fingerprints for over an hour.",
        "had been scouring",
        ["have scoured", "were scouring", "scoured"],
        "Past Perfect Continuous (had been + V-ing) ใช้เพื่อเน้นย้ำความต่อเนื่องของระยะเวลา (for over an hour) ก่อนที่เหตุการณ์ในอดีตอีกเหตุการณ์หนึ่งจะเกิดขึ้น (arrived)"
    ),
    (
        "kru-4010",
        "[ภาษาอังกฤษ - Tenses] Look at those dark looming storm clouds! It ________ within the next few minutes.",
        "is going to pour",
        ["pours", "will have poured", "poured"],
        "โครงสร้าง 'be going to' ใช้กับการคาดคะเนเหตุการณ์ในอนาคตอันใกล้ที่มีหลักฐานประจักษ์ชัดเจนในปัจจุบัน (Look at those dark looming storm clouds)"
    ),

    # --- Conditionals & Inverted Conditionals (kru-4011 to kru-4020) ---
    (
        "kru-4011",
        "[ภาษาอังกฤษ - Conditionals] If the municipal government had allocated sufficient funding last year, the flood defense barrier ________ operational today.",
        "would be",
        ["would have been", "will be", "had been"],
        "Mixed Conditional (Past condition -> Present result): เงื่อนไขในอดีต (had allocated) ส่งผลต่อสถานการณ์ในปัจจุบัน (operational today) จึงใช้รูป 'would + V.inf'"
    ),
    (
        "kru-4012",
        "[ภาษาอังกฤษ - Conditionals] ________ you encounter any technical glitches during the computerized test, please raise your hand immediately.",
        "Should",
        ["Were", "Had", "Could"],
        "Inversion of First Conditional: การละ 'if' ในเงื่อนไขแบบที่ 1 จะใช้ 'Should + S + V.inf' มีความหมายเท่ากับ 'If you should encounter...'"
    ),
    (
        "kru-4013",
        "[ภาษาอังกฤษ - Conditionals] ________ the surgeon known about the patient's severe drug allergy, she would have selected an alternative anesthetic.",
        "Had",
        ["Should", "Were", "Did"],
        "Inversion of Third Conditional: การละ 'if' ในเงื่อนไขแบบที่ 3 จะใช้โครงสร้าง 'Had + S + V3' ซึ่งเทียบเท่ากับ 'If the surgeon had known...'"
    ),
    (
        "kru-4014",
        "[ภาษาอังกฤษ - Conditionals] If he were genuinely proficient in statistical analysis, he ________ that glaring calculation error in yesterday's seminar.",
        "would not have made",
        ["would not make", "will not make", "had not made"],
        "Mixed Conditional (Present state -> Past result): ข้อเท็จจริงในปัจจุบัน (If he were proficient) ส่งผลต่อการกระทำในอดีต (yesterday's seminar) โครงสร้างผลลัพธ์คือ 'would have + V3'"
    ),
    (
        "kru-4015",
        "[ภาษาอังกฤษ - Conditionals] ________ he to resign from the directorship, the board of trustees would immediately launch an external executive search.",
        "Were",
        ["Should", "Had", "Was"],
        "Inversion of Second Conditional: การละ 'if' ในเงื่อนไขแบบที่ 2 เมื่อใช้กับกริยาแท้จะใช้โครงสร้าง 'Were + S + to + V.inf' ('Were he to resign...')"
    ),
    (
        "kru-4016",
        "[ภาษาอังกฤษ - Conditionals] Unless the school administration ________ prompt remedial measures, student absenteeism will continue to escalate.",
        "takes",
        ["will take", "took", "had taken"],
        "ในอนุประโยคเงื่อนไขที่นำหน้าด้วย Unless (= If... not) จะใช้รูป Present Simple (takes) เพื่อแสดงเงื่อนไขที่เป็นไปได้ในอนาคต โดยไม่ใช้ will ใน unless-clause"
    ),
    (
        "kru-4017",
        "[ภาษาอังกฤษ - Conditionals] But for the prompt intervention of the paramedic, the accident victim ________ from catastrophic blood loss.",
        "would have succumbed",
        ["succumbed", "will succumb", "would succumb"],
        "'But for + Noun' มีความหมายว่า 'If it had not been for...' (ถ้าไม่ใช่เพราะ...) ใช้ใน Third Conditional ประโยคหลักจึงต้องเป็น 'would have + V3'"
    ),
    (
        "kru-4018",
        "[ภาษาอังกฤษ - Conditionals] Provided that all prerequisites ________ met, the academic registrar will approve your accelerated graduation plan.",
        "are",
        ["were", "will be", "had been"],
        "'Provided that / Providing that' ทำหน้าที่เป็นคำสันธานเงื่อนไข (= If) เมื่อประโยคหลักใช้ Future Simple (will approve) ใน conditional clause จึงต้องใช้ Present Simple (are)"
    ),
    (
        "kru-4019",
        "[ภาษาอังกฤษ - Conditionals] If you heat ice to above zero degrees Celsius, it ________.",
        "melts",
        ["will melt", "melted", "would melt"],
        "Zero Conditional (If + Present Simple, Present Simple) ใช้แสดงความจริงทางวิทยาศาสตร์หรือกฎธรรมชาติที่เป็นจริงเสมอ (heat ice -> melts)"
    ),
    (
        "kru-4020",
        "[ภาษาอังกฤษ - Conditionals] Had it not been for their meticulous planning, the entire diplomatic summit ________ in failure.",
        "would have ended",
        ["will end", "ends", "had ended"],
        "โครงสร้าง 'Had it not been for + Noun' เป็นรูป Inversion ของ Third Conditional แสดงเหตุการณ์ตรงข้ามกับความจริงในอดีต ประโยคหลักต้องใช้ 'would have + V3'"
    ),

    # --- Subjunctive Mood (kru-4021 to kru-4030) ---
    (
        "kru-4021",
        "[ภาษาอังกฤษ - Subjunctive] The faculty board strongly recommended that each prospective thesis candidate ________ an ethical clearance form.",
        "submit",
        ["submits", "submitted", "is submitting"],
        "Mandative Subjunctive: หลังกริยาแสดงข้อเสนอแนะหรือคำสั่ง (recommend, insist, demand, propose, urge) ใน that-clause จะต้องใช้รูปกริยาฐาน (Base form of verb / bare infinitive) โดยไม่ผันตามประธาน"
    ),
    (
        "kru-4022",
        "[ภาษาอังกฤษ - Subjunctive] It is imperative that the laboratory supervisor ________ the radioactive materials under strict double-lock containment.",
        "keep",
        ["keeps", "kept", "is keeping"],
        "Mandative Subjunctive หลังคุณศัพท์แสดงความจำเป็น/ความสำคัญยิ่งยวด (imperative, essential, crucial, vital, mandatory) that-clause ต้องใช้รูป Base Form (keep)"
    ),
    (
        "kru-4023",
        "[ภาษาอังกฤษ - Subjunctive] I would rather you ________ me the unvarnished truth before I signed the vendor agreement yesterday.",
        "had told",
        ["told", "tell", "have told"],
        "โครงสร้าง 'would rather + subject + Past Perfect' ใช้แสดงความปรารถนาที่ตรงข้ามกับความเป็นจริงในอดีต (มีคำบอกเวลา yesterday)"
    ),
    (
        "kru-4024",
        "[ภาษาอังกฤษ - Subjunctive] The inspector general demanded that the corrupted surveillance footage ________ immediately to the independent judicial committee.",
        "be released",
        ["is released", "was released", "to be released"],
        "Passive Subjunctive: ในโครงสร้าง Subjunctive ที่มีความหมายเป็นกรรม (ถูกกระทำ) จะใช้รูป 'be + V3' (be released)"
    ),
    (
        "kru-4025",
        "[ภาษาอังกฤษ - Subjunctive] She speaks with such profound authority about Renaissance literature as if she ________ personally acquainted with the Elizabethan playwrights.",
        "were",
        ["is", "has been", "would be"],
        "Unreal Comparison: หลัง 'as if / as though' เมื่อพูดถึงสิ่งที่ไม่เป็นความจริงในปัจจุบัน จะใช้รูป Past Subjunctive โดยใช้ 'were' กับประธานทุกบุรุษ"
    ),
    (
        "kru-4026",
        "[ภาษาอังกฤษ - Subjunctive] It is high time the ministry of education ________ the outdated secondary curriculum to meet 21st-century digital demands.",
        "revised",
        ["revises", "revise", "has revised"],
        "โครงสร้าง 'It is high time / It is about time + Subject + Past Simple' ใช้เพื่อแสดงว่าถึงเวลาอันสมควรแล้วที่ควรจะทำสิ่งนั้น (แต่ยังไม่ได้ทำ)"
    ),
    (
        "kru-4027",
        "[ภาษาอังกฤษ - Subjunctive] The chief financial officer insisted that every department head ________ present at the emergency audit briefing.",
        "be",
        ["is", "was", "are"],
        "Mandative Subjunctive: หลังกริยา insist that กริยาของ that-clause ต้องอยู่ในรูปกริยาฐาน ซึ่งกริยา to be คือ 'be'"
    ),
    (
        "kru-4028",
        "[ภาษาอังกฤษ - Subjunctive] '________ the King!' shouted the loyal herald as the royal carriage passed through the palace gates.",
        "Long live",
        ["Long lives", "Long lived", "Long is living"],
        "Formulaic Subjunctive: สำนวนโบราณหรือคำอวยพรคงรูป เช่น 'Long live the King!', 'God save the Queen!', 'Heaven forbid!' ซึ่งใช้รูปกริยาฐานเสมอ"
    ),
    (
        "kru-4029",
        "[ภาษาอังกฤษ - Subjunctive] If only the local authorities ________ the structural deterioration of the suspension bridge before the collapse occurred.",
        "had noticed",
        ["noticed", "have noticed", "would notice"],
        "'If only / I wish + Past Perfect' ใช้แสดงความเสียดายหรือความปรารถนาที่ตรงข้ามกับความเป็นจริงในอดีต (before the collapse occurred)"
    ),
    (
        "kru-4030",
        "[ภาษาอังกฤษ - Subjunctive] The committee proposed a resolution that the proposed tariff hike ________ postponed until further macroeconomic evaluation.",
        "be",
        ["is", "was", "must be"],
        "Mandative Subjunctive: หลังคำนามหรือกริยาเช่น proposal/proposed/resolution that กริยาใน that-clause ต้องเป็นรูป Base Form (be postponed)"
    ),

    # --- Passive Voice & Causative Verbs (kru-4031 to kru-4040) ---
    (
        "kru-4031",
        "[ภาษาอังกฤษ - Passive Voice] The ancient Roman aqueduct is believed ________ by emperor Claudius during the first century AD.",
        "to have been commissioned",
        ["to commission", "having commissioned", "to be commissioned"],
        "Complex Passive: กริยาแสดงความคิด/ความเชื่อในรูป Passive (is believed) ตามด้วย Perfect Passive Infinitive (to have been + V3) เพื่อบอกว่าการสร้างเกิดขึ้นก่อนเวลาในปัจจุบัน"
    ),
    (
        "kru-4032",
        "[ภาษาอังกฤษ - Causative] Because the legal terminology was so convoluted, the director had her corporate attorney ________ the revised contract.",
        "examine",
        ["examined", "to examine", "examining"],
        "Causative Verb 'have': โครงสร้าง 'have + person + V.inf' (have someone do something) แปลว่า ให้หรือมอบหมายให้ผู้อื่นทำกริยานั้น"
    ),
    (
        "kru-4033",
        "[ภาษาอังกฤษ - Causative] To maintain rigorous safety standards, the flight academy gets its aircraft ________ by certified engineers twice a month.",
        "inspected",
        ["inspect", "to inspect", "inspecting"],
        "Causative Verb 'get': โครงสร้าง 'get + something + V3' (get something done) ใช้เมื่อกรรมถูกกระทำโดยผู้อื่น (เครื่องบินถูกตรวจสอบ)"
    ),
    (
        "kru-4034",
        "[ภาษาอังกฤษ - Causative] After negotiating for over an hour, the union representative finally got the management ________ a ten percent wage increment.",
        "to concede",
        ["concede", "conceded", "conceding"],
        "Causative Verb 'get': โครงสร้าง 'get + person + to + V.inf' (get someone to do something) หมายถึง โน้มน้าวหรือชักจูงให้ผู้อื่นทำบางสิ่ง"
    ),
    (
        "kru-4035",
        "[ภาษาอังกฤษ - Passive Voice] Under no circumstances should sensitive biometric databases ________ without multi-factor cryptographic authorization.",
        "be accessed",
        ["access", "have accessed", "be accessing"],
        "Passive with Modals: หลัง Modal auxiliary (should) ในความหมายถูกกระทำ ใช้รูป 'Modal + be + V3' (should be accessed)"
    ),
    (
        "kru-4036",
        "[ภาษาอังกฤษ - Causative] The eccentric billionaire made the architectural firm ________ the blueprint three times before granting approval.",
        "redesign",
        ["redesigned", "to redesign", "redesigning"],
        "Causative Verb 'make': โครงสร้าง 'make + person + V.inf' (บังคับหรือสั่งให้ใครทำบางสิ่ง) ต้องตามด้วย Bare Infinitive (redesign)"
    ),
    (
        "kru-4037",
        "[ภาษาอังกฤษ - Passive Voice] The fugitive is reported ________ across the national border using forged travel documents late last night.",
        "to have slipped",
        ["to slip", "slipping", "to have been slipped"],
        "Complex Passive with reporting verb: 'is reported to have + V3' ใช้กล่าวถึงการกระทำของประธานที่เป็น active (คนร้ายหลบหนีข้ามพรมแดนเอง) ที่เกิดขึ้นในอดีตก่อนเวลาที่รายงาน"
    ),
    (
        "kru-4038",
        "[ภาษาอังกฤษ - Passive Voice] All confidential research files need ________ before being archived in the central server repository.",
        "to be encrypted",
        ["encrypting them", "to encrypt", "encrypted"],
        "Passive Infinitive: หลังกริยา need เมื่อประธานเป็นสิ่งของที่ต้องการได้รับการกระทำ สามารถใช้ 'need + to be + V3' หรือ 'need + V-ing' (need encrypting)"
    ),
    (
        "kru-4039",
        "[ภาษาอังกฤษ - Causative] Rather than troubleshooting the malfunctioning server himself, the IT manager let the vendor's technician ________ the firmware patch.",
        "install",
        ["to install", "installed", "installing"],
        "Causative / Permissive Verb 'let': โครงสร้าง 'let + person + V.inf' (อนุญาตให้ใครทำอะไร) ต้องตามด้วย Bare Infinitive (install)"
    ),
    (
        "kru-4040",
        "[ภาษาอังกฤษ - Passive Voice] The new pedagogical framework is said ________ by dozens of pilot schools across the Scandinavian region last semester.",
        "to have been adopted",
        ["to adopt", "to be adopted", "having adopted"],
        "Complex Passive: โครงสร้าง 'is said to have been + V3' ใช้เมื่อประธานเป็นสิ่งของที่ถูกกระทำในอดีต (the framework was adopted last semester)"
    ),

    # --- Inversion & Negative Adverbials (kru-4041 to kru-4050) ---
    (
        "kru-4041",
        "[ภาษาอังกฤษ - Inversion] Seldom ________ such extraordinary pedagogical dedication and empathy among newly appointed novice instructors.",
        "have I witnessed",
        ["I have witnessed", "did I witnessed", "I witnessed"],
        "Negative Inversion: เมื่อประโยคขึ้นต้นด้วยคำปฏิเสธหรือกึ่งปฏิเสธ (Seldom, Rarely, Never, Little) ต้องสลับตำแหน่งกริยาช่วยมาไว้หน้าประธาน (Auxiliary + Subject + Main Verb)"
    ),
    (
        "kru-4042",
        "[ภาษาอังกฤษ - Inversion] Only after conducting exhaustive forensic analyses ________ the true origin of the malicious cyberattack.",
        "did the cybersecurity team discover",
        ["the cybersecurity team discovered", "the cybersecurity team did discover", "had discovered the cybersecurity team"],
        "Inversion with 'Only after...': เมื่อส่วนขยายเวลา 'Only after / Only when / Only if' ขึ้นต้นประโยค ประโยคหลักจะต้องกลับกริยาช่วยมาหน้าประธาน (did the team discover)"
    ),
    (
        "kru-4043",
        "[ภาษาอังกฤษ - Inversion] Not only ________ the prestigious national science award, but she also secured a doctoral scholarship to Cambridge.",
        "did she win",
        ["she won", "won she", "she did win"],
        "Inversion with 'Not only... but also': เมื่อขึ้นต้นประโยคด้วย Not only ประโยคแรกต้อง Inversion (did she win)"
    ),
    (
        "kru-4044",
        "[ภาษาอังกฤษ - Inversion] Under no circumstances ________ unattended baggage inside the terminal concourse.",
        "should passengers leave",
        ["passengers should leave", "passengers leave", "must passengers leaving"],
        "Negative Adverbial Inversion: 'Under no circumstances' (ไม่ว่าในกรณีใดก็ตาม) เป็นวลีปฏิเสธ กริยาช่วย (should) ต้องวางหน้าประธาน (passengers)"
    ),
    (
        "kru-4045",
        "[ภาษาอังกฤษ - Inversion] Scarcely ________ the stadium when torrential rain began flooding the pitch.",
        "had the spectators reached",
        ["the spectators had reached", "did the spectators reach", "reached the spectators"],
        "โครงสร้าง 'Scarcely had + Subject + V3... when...' กริยาช่วย had ต้องอยู่หน้าประธานเสมอ"
    ),
    (
        "kru-4046",
        "[ภาษาอังกฤษ - Inversion] Little ________ that the confidential memorandum had already been leaked to the press corps.",
        "did the spokesperson realize",
        ["the spokesperson realized", "was the spokesperson realizing", "the spokesperson did realize"],
        "Inversion with 'Little': Little มีความหมายเชิงปฏิเสธ (แทบไม่รู้เลย) เมื่อขึ้นต้นประโยคต้องใช้รูป Inversion 'did + S + V.inf'"
    ),
    (
        "kru-4047",
        "[ภาษาอังกฤษ - Inversion] At the summit of the verdant mountain ridge ________ an ancient Buddhist sanctuary dating back to the Sukhothai era.",
        "stood",
        ["did stand", "standing", "was stood"],
        "Locative Inversion: เมื่อขึ้นต้นประโยคด้วยบุพบทวลีบอกสถานที่ (Prepositional Phrase of Place) และกริยาเป็น Intransitive verb of position (stand, sit, lie) กริยาแท้สามารถวางหน้าประธานนามได้โดยตรงโดยไม่ต้องใช้กริยาช่วย do/did"
    ),
    (
        "kru-4048",
        "[ภาษาอังกฤษ - Inversion] No sooner had the bell chimed for recess ________ the elementary pupils rushed onto the playground.",
        "than",
        ["when", "then", "that"],
        "คู่คำเชื่อม Inversion: 'No sooner had + S + V3... than + S + V2' ใช้คู่กับ 'than' เสมอ (ห้ามสับสนกับ Hardly/Scarcely ที่ใช้คู่กับ when)"
    ),
    (
        "kru-4049",
        "[ภาษาอังกฤษ - Inversion] In no way ________ responsible for the unauthorized financial transactions executed by the rogue rogue trader.",
        "can the bank be held",
        ["the bank can be held", "the bank is", "can be the bank"],
        "Inversion with 'In no way': วลีปฏิเสธขึ้นต้นประโยค กริยาช่วย (can) ต้องสลับตำแหน่งมาอยู่หน้าประธาน (the bank)"
    ),
    (
        "kru-4050",
        "[ภาษาอังกฤษ - Inversion] On no account ________ access cards to unauthorized personnel under any pretext.",
        "must staff transfer",
        ["staff must transfer", "must transfer staff", "staff transfer"],
        "Negative Inversion: 'On no account' (เด็ดขาด/ไม่ว่าด้วยเหตุผลใด) บังคับรูป Inversion โดยวาง modal verb (must) หน้าประธาน (staff)"
    ),

    # --- Relative Clauses & Reduced Clauses (kru-4051 to kru-4060) ---
    (
        "kru-4051",
        "[ภาษาอังกฤษ - Relative Clauses] The theoretical physicist, ________ groundbreaking treatise on quantum entanglement won the Nobel Prize, will address our symposium.",
        "whose",
        ["whom", "who", "which"],
        "Relative Pronoun แสดงความเป็นเจ้าของ: 'whose' ใช้เชื่อมคำนามข้างหน้า (physicist) กับสิ่งที่เป็นผลงาน (treatise: ตำรา/บทความวิชาการ)"
    ),
    (
        "kru-4052",
        "[ภาษาอังกฤษ - Relative Clauses] The distinguished diplomat to ________ the foreign secretary addressed the official grievance has issued an apology.",
        "whom",
        ["who", "which", "whose"],
        "Prepositional Relative Clause: เมื่อมีบุพบท (to) นำหน้าและอ้างอิงถึงบุคคล ต้องใช้รูปกรรม 'whom' เท่านั้น (ห้ามใช้ who หรือ that หลัง preposition)"
    ),
    (
        "kru-4053",
        "[ภาษาอังกฤษ - Relative Clauses] The ancient manuscript, ________ by medieval monks in the fourteenth century, was restored using laser technology.",
        "illuminated",
        ["illuminating", "which illuminated", "was illuminated"],
        "Reduced Relative Clause (Past Participle): ละรูปมาจาก 'which was illuminated' เมื่อตัด relative pronoun และ verb to be ออก จะเหลือเฉพาะกริยาช่อง 3 (illuminated) ทำหน้าที่ขยายนามในความหมายถูกกระทำ"
    ),
    (
        "kru-4054",
        "[ภาษาอังกฤษ - Relative Clauses] Students ________ late for the standardized examination will not be admitted under any circumstances.",
        "arriving",
        ["arrived", "who arriving", "are arrived"],
        "Reduced Relative Clause (Present Participle): ลดรูปมาจาก 'Students who arrive late' ประธานกระทำกริยาเอง (Active voice) ลดรูปลงเหลือ 'V-ing' (arriving)"
    ),
    (
        "kru-4055",
        "[ภาษาอังกฤษ - Relative Clauses] The educational committee surveyed forty secondary schools, five of ________ had adopted virtual reality science laboratories.",
        "which",
        ["whom", "them", "that"],
        "Quantifier + of + Relative Pronoun: 'five of which' ใช้แทนสิ่งของหรือสถานที่ (schools) ถ้าใช้ five of them จะกลายเป็น Run-on sentence เพราะขาดคำเชื่อมประโยค"
    ),
    (
        "kru-4056",
        "[ภาษาอังกฤษ - Relative Clauses] This is the comprehensive pedagogical manual ________ every newly recruited language instructor must become thoroughly familiar.",
        "with which",
        ["which", "that", "where"],
        "Preposition with Relative Pronoun: มาจากสำนวน 'be familiar with something' ดังนั้นเมื่อนำขึ้นมาเป็น relative clause จึงต้องเป็น 'with which every newly recruited instructor must become familiar'"
    ),
    (
        "kru-4057",
        "[ภาษาอังกฤษ - Relative Clauses] Professor Harrison, ________ you had the opportunity to consult yesterday, is an internationally acclaimed lexicographer.",
        "whom",
        ["which", "whose", "where"],
        "Non-defining Relative Clause: ขยายคำนามที่เป็นบุคคลเฉพาะเจาะจง (Professor Harrison) และทำหน้าที่เป็นกรรมของกริยา consult จึงใช้ 'whom' (หรือ who ในภาษาพูด แต่ในข้อสอบมาตรฐานภาษาทางการนิยม whom)"
    ),
    (
        "kru-4058",
        "[ภาษาอังกฤษ - Relative Clauses] The university introduced a new mentorship program, the primary objective of ________ is to curtail freshman attrition rates.",
        "which",
        ["that", "whose", "it"],
        "Relative Pronoun: 'the primary objective of which' (เป้าหมายหลักของโครงการดังกล่าว) ขยายนามสิ่งของ/โครงการ (mentorship program)"
    ),
    (
        "kru-4059",
        "[ภาษาอังกฤษ - Relative Clauses] Having ________ all night to meet the project deadline, the lead software architect was visibly exhausted.",
        "worked",
        ["working", "been worked", "work"],
        "Perfect Participle Clause (Active): 'Having + V3' (Having worked) ใช้เน้นว่าการกระทำนั้นเสร็จสิ้นสมบูรณ์ก่อนที่เหตุการณ์ในประโยคหลักจะเกิดขึ้น"
    ),
    (
        "kru-4060",
        "[ภาษาอังกฤษ - Relative Clauses] ________ of his colleagues' malicious rumors, the newly promoted vice-principal remained entirely focused on curriculum reform.",
        "Unaware",
        ["Unawarely", "Being unawared", "Having unaware"],
        "Adjective Clause Reduction: คุณศัพท์ 'Unaware of...' สามารถวางขึ้นต้นประโยครองรับประธานหลัก (the vice-principal) ได้โดยตรง มีความหมายเท่ากับ 'Because he was unaware of...'"
    ),

    # --- Subject-Verb Agreement (kru-4061 to kru-4070) ---
    (
        "kru-4061",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] Neither the primary school principal nor the grade-level subject coordinators ________ willing to endorse the revised timetable.",
        "were",
        ["was", "is", "has been"],
        "Proximity Rule: เมื่อเชื่อมประธานด้วย 'Neither... nor' กริยาจะต้องผันตามประธานตัวที่อยู่ใกล้กริยาที่สุด ในที่นี้คือ 'the grade-level subject coordinators' ซึ่งเป็นพหูพจน์ กริยาจึงต้องเป็น 'were'"
    ),
    (
        "kru-4062",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] The renowned pediatric neurosurgeon, along with three resident physicians, ________ currently conducting the clinical trial.",
        "is",
        ["are", "were", "have been"],
        "Parenthetical Expressions: วลีเชื่อมเช่น 'along with, as well as, together with, accompanied by' ไม่ถือเป็นประธานร่วม ประธานแท้คือ 'The renowned pediatric neurosurgeon' ซึ่งเป็นเอกพจน์ กริยาจึงต้องเป็น 'is'"
    ),
    (
        "kru-4063",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] A considerable number of supplementary reading materials ________ distributed to remote border patrol schools last month.",
        "were",
        ["was", "has been", "is"],
        "'A number of + plural noun' มีความหมายว่า 'จำนวนมาก' ถือเป็นพหูพจน์เสมอ กริยาจึงต้องเป็นพหูพจน์ (were distributed) ต่างจาก 'The number of' ที่เป็นเอกพจน์"
    ),
    (
        "kru-4064",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] The number of international exchange students enrolled in Thai bilingual programs ________ steadily over the past five years.",
        "has grown",
        ["have grown", "are growing", "were grown"],
        "'The number of + plural noun' หมายถึง 'จำนวนของ...' ถือเป็นประธานเอกพจน์เสมอ กริยาจึงต้องใช้รูปเอกพจน์ (has grown)"
    ),
    (
        "kru-4065",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] Every textbook, workbook, and reference manual in the school archives ________ cataloged according to the Dewey Decimal system.",
        "is",
        ["are", "were", "have been"],
        "ประธานที่นำหน้าด้วย 'Each' หรือ 'Every' ไม่ว่าจะเชื่อมด้วย and กี่ตัวก็ตาม ถือเป็นเอกพจน์เสมอ กริยาจึงต้องเป็นเอกพจน์ (is cataloged)"
    ),
    (
        "kru-4066",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] Two-thirds of the provincial education budget ________ allocated to upgrading classroom digital infrastructure.",
        "was",
        ["were", "are", "have been"],
        "Fractions / Percentages of an Uncountable Noun: เมื่อเศษส่วนขยายนามนับไม่ได้ (budget) กริยาจะต้องเป็นรูปเอกพจน์ (was allocated)"
    ),
    (
        "kru-4067",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] The committee ________ divided in their individual opinions regarding the implementation of standardized testing.",
        "were",
        ["was", "has been", "is"],
        "Collective Nouns with Plural Meaning: คำนามกลุ่ม (committee, staff, jury, family) หากสมาชิกในกลุ่มมีความเห็นแตกแยกหรือกระทำเป็นรายบุคคล (มีคำบอกใบ้ 'divided in their individual opinions') จะถือเป็นพหูพจน์ กริยาจึงใช้ 'were'"
    ),
    (
        "kru-4068",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] Ten kilometers ________ an arduous distance for young primary school pupils to trek to school each morning.",
        "is",
        ["are", "were", "have been"],
        "Expressions of Measurement / Distance / Time / Money: ระยะทาง เวลา และจำนวนเงิน เมื่อมองเป็นหน่วยรวมก้อนเดียว (a single unit) จะถือเป็นเอกพจน์เสมอ (Ten kilometers is...)"
    ),
    (
        "kru-4069",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] What the research team desperately requires ________ comprehensive and longitudinal empirical data.",
        "is",
        ["are", "were", "have been"],
        "Noun Clause as Subject: เมื่ออนุประโยคคำนามที่ขึ้นต้นด้วย What (Nominal Relative Clause) ทำหน้าที่เป็นประธานของประโยค จะถือเป็นเอกพจน์ กริยาจึงใช้ 'is'"
    ),
    (
        "kru-4070",
        "[ภาษาอังกฤษ - Subject-Verb Agreement] Not only the athletic director but also the school board members ________ enthusiastically in favor of building an indoor sports complex.",
        "are",
        ["is", "was", "has been"],
        "Correlative Conjunctions: โครงสร้าง 'Not only A but also B' กริยาต้องผันตามประธาน B ('the school board members') ซึ่งเป็นพหูพจน์ กริยาจึงเป็น 'are'"
    ),

    # --- Parallelism & Sentence Structure (kru-4071 to kru-4080) ---
    (
        "kru-4071",
        "[ภาษาอังกฤษ - Parallelism] The modern educator's responsibilities include developing engaging lesson plans, assessing student progress, and ________ constructive feedback to parents.",
        "providing",
        ["to provide", "provide", "provided"],
        "Parallel Structure (โครงสร้างขนาน): รายการที่เชื่อมด้วย 'and' ต้องมีโครงสร้างทางไวยากรณ์เดียวกัน ในที่นี้คือ Gerunds: developing..., assessing..., and providing..."
    ),
    (
        "kru-4072",
        "[ภาษาอังกฤษ - Parallelism] The newly drafted educational policy aims not only to improve academic literacy ________ to bridge regional socio-economic inequities.",
        "but also",
        ["and also", "as well as", "or even"],
        "Correlative Conjunction: 'not only... but also...' เป็นคู่คำเชื่อมที่ต้องใช้คู่กันอย่างสมมาตร (not only to improve... but also to bridge...)"
    ),
    (
        "kru-4073",
        "[ภาษาอังกฤษ - Parallelism] Effective classroom management requires teachers to speak clearly, establish firm boundaries, and ________ consistently.",
        "enforce rules",
        ["enforcing rules", "to be enforcing rules", "rules should be enforced"],
        "Parallel Structure with Infinitives: โครงสร้างขนานหลัง 'to': speak clearly, establish firm boundaries, and enforce rules (ละ 'to' ตัวหลังได้)"
    ),
    (
        "kru-4074",
        "[ภาษาอังกฤษ - Sentence Structure] Which of the following sentences does NOT contain a dangling or misplaced modifier?",
        "Walking into the library, Dr. Thorne noticed that the rare manuscript was missing.",
        ["Walking into the library, the missing rare manuscript caught Dr. Thorne's eye.", "Having finished the examination, the test papers were collected by the invigilator.", "To qualify for the scholarship, a high grade point average must be maintained by students."],
        "Dangling Modifier: ส่วนขยายหน้าประโยค (Walking into the library) ประธานของประโยคหลักต้องเป็นผู้กระทำกริยานั้นจริง ซึ่งคือ 'Dr. Thorne' (ไม่ใช่ manuscript ที่เดินเข้าห้องสมุด)"
    ),
    (
        "kru-4075",
        "[ภาษาอังกฤษ - Parallelism] Successful language learners usually demonstrate a willingness to take cognitive risks, adapt to unfamiliar phonetics, and ________ independently.",
        "study",
        ["studying", "studied", "to studying"],
        "Parallel Structure: กริยาขนานตามหลัง 'willingness to': take..., adapt..., and study... ทั้งหมดต้องเป็น Bare Infinitive"
    ),
    (
        "kru-4076",
        "[ภาษาอังกฤษ - Sentence Structure] Identify the sentence that correctly resolves the comma splice error.",
        "The primary curriculum was completely revised; consequently, teachers required extensive in-service training.",
        ["The primary curriculum was completely revised, consequently, teachers required extensive in-service training.", "The primary curriculum was completely revised, teachers required extensive in-service training.", "The primary curriculum was completely revised, however teachers required extensive in-service training."],
        "Comma Splice Correction: การเชื่อมสองประโยคอิสระ (Independent Clauses) ด้วยคำกริยาวิเศษณ์เชื่อม (Conjunctive Adverb เช่น consequently, however, therefore) ต้องใช้เซมิโคลอน (;) ข้างหน้าและจุลภาค (,) ข้างหลัง"
    ),
    (
        "kru-4077",
        "[ภาษาอังกฤษ - Parallelism] The university president praised the faculty both for their prolific research output and ________.",
        "for their exceptional mentoring of undergraduates",
        ["their exceptional mentoring of undergraduates", "they mentored undergraduates exceptionally", "because they mentored undergraduates"],
        "Parallelism with 'both... and...': หลัง both เป็นบุพบทวลี 'for their prolific research output' ดังนั้นหลัง and ก็ต้องเป็นบุพบทวลีที่ขนานกัน 'for their exceptional mentoring of undergraduates'"
    ),
    (
        "kru-4078",
        "[ภาษาอังกฤษ - Parallelism] Online distance education is praised for being cost-effective, self-paced, and ________.",
        "conveniently accessible",
        ["convenience", "to access conveniently", "providing easy accessibility"],
        "Parallel Structure with Predicate Adjectives: cost-effective (Adj), self-paced (Adj), and conveniently accessible (Adv + Adj)"
    ),
    (
        "kru-4079",
        "[ภาษาอังกฤษ - Sentence Structure] Which of the following examples represents a grammatically complete and correct sentence rather than a sentence fragment or run-on?",
        "Although the school budget was drastically curtailed, the arts program continued to flourish.",
        ["Although the school budget was drastically curtailed and the arts program struggled.", "The school budget was curtailed the arts program continued to flourish anyway.", "Being curtailed drastically, the arts program flourishing despite the cuts."],
        "Complete Complex Sentence: ประกอบด้วย Dependent Clause ('Although...') และ Independent Clause ที่สมบูรณ์ ('the arts program continued to flourish')"
    ),
    (
        "kru-4080",
        "[ภาษาอังกฤษ - Parallelism] The newly elected school board pledged to modernize classrooms, recruit qualified native speakers, and ________ teacher salaries.",
        "raise",
        ["raising", "to be raised", "would raise"],
        "Parallelism with 'pledged to': to modernize..., recruit..., and raise... (รูป Bare Infinitive ขนานกัน)"
    ),

    # --- Gerunds & Infinitives (kru-4081 to kru-4090) ---
    (
        "kru-4081",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] The newly appointed head of school firmly objects ________ standardized aptitude scores as the sole criterion for admission.",
        "to using",
        ["to use", "using", "use"],
        "Preposition 'to' + Gerund: ในสำนวน 'object to' คำว่า to เป็นบุพบท (Preposition) ดังนั้นกริยาที่ตามมาต้องอยู่ในรูป Gerund (-ing) คือ 'to using'"
    ),
    (
        "kru-4082",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] While hiking along the national park trail, the biology professor stopped ________ a rare species of carnivorous orchid.",
        "to photograph",
        ["photographing", "photograph", "photographed"],
        "Stop to do vs Stop doing: 'stop to + V.inf' หมายถึง หยุดการกระทำหนึ่งเพื่อไปทำอีกสิ่งหนึ่ง (หยุดเดินเพื่อถ่ายภาพ) ส่วน 'stop + V-ing' หมายถึง เลิกทำสิ่งนั้น"
    ),
    (
        "kru-4083",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] Language learners must become accustomed ________ authentic English accents by listening to podcasts regularly.",
        "to deciphering",
        ["to decipher", "deciphering", "decipher"],
        "Preposition 'to' + Gerund: 'be / become accustomed to + V-ing' หมายถึง เคยชินกับการ... โดย to เป็นบุพบท ต้องตามด้วย Gerund (to deciphering)"
    ),
    (
        "kru-4084",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] I vividly remember ________ the original treaty manuscript in the British Museum during my postgraduate exchange in 2018.",
        "viewing",
        ["to view", "view", "to have viewed"],
        "Remember to do vs Remember doing: 'remember + V-ing' ใช้กับความทรงจำเกี่ยวกับเหตุการณ์ในอดีตที่เคยทำมาแล้ว (จำได้ว่าเคยดู) ส่วน 'remember + to V.inf' หมายถึง อย่าลืมที่จะทำในอนาคต"
    ),
    (
        "kru-4085",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] The defense attorney vehemently denied ________ confidential court documents to unauthorized reporters.",
        "leaking",
        ["to leak", "leak", "to have leaked"],
        "Verbs followed by Gerund: กริยา 'deny' (ปฏิเสธ) ต้องตามด้วยรูป Gerund (V-ing) เสมอ (denied leaking...)"
    ),
    (
        "kru-4086",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] We regret ________ all applicants that due to overwhelming demand, registration has officially closed.",
        "to inform",
        ["informing", "inform", "to have informed"],
        "Regret to do vs Regret doing: 'regret to inform / say / announce' เป็นสำนวนทางการหมายถึง เสียใจที่จะต้องแจ้งเรื่องไม่ดีให้ทราบ ส่วน 'regret + V-ing' หมายถึง เสียใจหรือเสียดายสิ่งที่ทำลงไปในอดีต"
    ),
    (
        "kru-4087",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] The school management decided to postpone ________ the disciplinary hearing until the student's legal guardian could attend.",
        "convening",
        ["to convene", "convene", "convened"],
        "Verbs followed by Gerund: กริยา 'postpone, delay, defer' (เลื่อนออกไป) ต้องตามหลังด้วย Gerund (postpone convening)"
    ),
    (
        "kru-4088",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] Having relocated from Tokyo to Bangkok, Hiroshi found it challenging to get used to ________ on the left side of the road.",
        "driving",
        ["drive", "to drive", "be driven"],
        "Preposition 'to' + Gerund: ในสำนวน 'get used to + V-ing' คำว่า to เป็นบุพบท หมายถึง ปรับตัวจนคุ้นเคยกับการกระทำนั้น"
    ),
    (
        "kru-4089",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] With a view to ________ bilateral academic collaboration, the two universities signed a historic memorandum of understanding.",
        "fostering",
        ["foster", "to foster", "fostered"],
        "Preposition 'to' + Gerund: สำนวน 'with a view to + V-ing' มีความหมายว่า 'โดยมีวัตถุประสงค์เพื่อ...' to เป็นบุพบท ต้องตามด้วย Gerund (fostering)"
    ),
    (
        "kru-4090",
        "[ภาษาอังกฤษ - Gerunds & Infinitives] The principal recommended that we consider ________ the flipped classroom model in our English classes next term.",
        "implementing",
        ["to implement", "implement", "implemented"],
        "Verbs followed by Gerund: กริยา 'consider' (พิจารณา) เมื่อตามด้วยกริยา ต้องใช้ในรูป Gerund (-ing) เสมอ (consider implementing)"
    ),

    # --- Modals & Modal Perfects (kru-4091 to kru-4100) ---
    (
        "kru-4091",
        "[ภาษาอังกฤษ - Modals] The archival documents are severely water-damaged. The burst pipe ________ leaking for several days over the holiday weekend.",
        "must have been",
        ["should have been", "could not be", "need not have been"],
        "Logical Deduction in the Past: 'must have been + V-ing' ใช้แสดงการอนุมานอย่างมั่นใจเกือบ 100% ว่าเหตุการณ์ในอดีตต้องกำลังเกิดขึ้นอย่างแน่นอน โดยมีหลักฐานคือเอกสารเสียหายจากน้ำอย่างหนัก"
    ),
    (
        "kru-4092",
        "[ภาษาอังกฤษ - Modals] You ________ all those printed handouts for the seminar; the university provided digital tablets with pre-loaded materials for everyone.",
        "needn't have printed",
        ["didn't need to print", "mustn't have printed", "couldn't print"],
        "'needn't have + V3' หมายถึง ได้ทำสิ่งนั้นไปแล้วทั้งที่ไม่มีความจำเป็นต้องทำ (ปริ้นท์ไปแล้วโดยไม่จำเป็น) แตกต่างจาก 'didn't need to' ที่รู้ว่าไม่จำเป็นจึงไม่ได้ทำ"
    ),
    (
        "kru-4093",
        "[ภาษาอังกฤษ - Modals] The flight from London was scheduled to land at 6:00 AM, but there is dense fog at Suvarnabhumi. The plane ________ diverted to Don Mueang.",
        "might have been",
        ["should be", "would have", "must be"],
        "Past Possibility: 'might / may have been + V3' ใช้แสดงการคาดเดาถึงความเป็นไปได้ในอดีต (เครื่องบินอาจถูกเปลี่ยนเส้นทางไปลงดอนเมือง)"
    ),
    (
        "kru-4094",
        "[ภาษาอังกฤษ - Modals] She ________ the confidential exam paper; she wasn't even in the country when the incident took place.",
        "can't have leaked",
        ["must have leaked", "shouldn't leak", "might leak"],
        "Negative Past Deduction: 'can't have / couldn't have + V3' ใช้แสดงการอนุมานในอดีตว่าเป็นไปไม่ได้อย่างแน่นอน (เธอไม่ได้อยู่ในประเทศตอนเกิดเรื่อง จึงเป็นไปไม่ได้ที่จะเป็นคนปล่อยข้อสอบหลุด)"
    ),
    (
        "kru-4095",
        "[ภาษาอังกฤษ - Modals] You ________ the research methodology more thoroughly before submitting your final dissertation proposal.",
        "ought to have reviewed",
        ["ought review", "must review", "ought to review"],
        "Past Criticism / Unfulfilled Obligation: 'ought to have + V3' (หรือ should have + V3) ใช้ตักเตือนหรือวิจารณ์ว่าควรจะได้ทำสิ่งนั้นในอดีต (แต่ความจริงไม่ได้ทำ)"
    ),
    (
        "kru-4096",
        "[ภาษาอังกฤษ - Modals] 'I wonder why the professor didn't show up for his office hours.' — 'He ________ about the faculty emergency meeting.'",
        "could have forgotten",
        ["should forget", "must forget", "can forget"],
        "Past Possibility / Speculation: 'could have + V3' ใช้คาดคะเนเหตุการณ์ในอดีตว่าเป็นไปได้ที่เขาอาจจะลืม"
    ),
    (
        "kru-4097",
        "[ภาษาอังกฤษ - Modals] Since the seminar room was equipped with a state-of-the-art public address system, the speaker ________ at the top of her lungs.",
        "didn't need to shout",
        ["needn't have shouted", "mustn't shout", "couldn't shout"],
        "'didn't need to + V.inf' ใช้เมื่อไม่มีความจำเป็นต้องทำในอดีต และผู้พูดไม่ได้ทำสิ่งนั้น (เพราะมีไมค์และลำโพงชั้นดี จึงไม่จำเป็นต้องตะโกนและไม่ได้ตะโกน)"
    ),
    (
        "kru-4098",
        "[ภาษาอังกฤษ - Modals] Drivers ________ their mobile phones while operating a vehicle; it is strictly prohibited by traffic legislation.",
        "must not use",
        ["don't have to use", "need not use", "would not use"],
        "Prohibition: 'must not (mustn't)' ใช้แสดงข้อห้ามอย่างเด็ดขาดตามกฎหมาย ส่วน 'don't have to / need not' แปลว่า ไม่จำเป็นต้องทำ (จะทำหรือไม่ทำก็ได้)"
    ),
    (
        "kru-4099",
        "[ภาษาอังกฤษ - Modals] If the ambulance had arrived five minutes later, the patient ________ survived.",
        "might not have",
        ["should not have", "could not", "must not have"],
        "Past Unreal Possibility: 'might not have + V3' ใน Third Conditional ใช้บอกว่าถ้ามาช้ากว่านี้อีก 5 นาที ผู้ป่วยอาจจะไม่รอดชีวิต"
    ),
    (
        "kru-4100",
        "[ภาษาอังกฤษ - Modals] To be eligible for the national English teaching scholarship, candidates ________ a minimum CEFR B2 certification before the application deadline.",
        "must possess",
        ["can possess", "might possess", "may have possessed"],
        "Obligation / Requirement: 'must' ใช้ระบุข้อกำหนด กฎเกณฑ์ หรือคุณสมบัติบังคับที่จำเป็นต้องมี (must possess a minimum CEFR B2 certification)"
    ),
]

print(f"Set 41 loaded: {len(SET41_QUESTIONS)} questions")
