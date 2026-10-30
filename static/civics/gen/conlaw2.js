/* Constitutional Law II: Rights (conlaw2). Problem generators for all 50 topics.
   Source: /tmp/work_conlaw2/src/gen_*.js, joined by /tmp/work_conlaw2/build.py (which also fills in the extra case table
   from src/extra.py). Each topic is a bank of facts and small tasks; facts follow the lessons
   (data/civics/lessons/conlaw2.json) and their sources. Practice asks holdings, clauses, tests, tiers, elements, years
   and order, never which side is right.
     level 1  three choices (the right one and two plainly wrong), or a true/false about a core holding
     level 2  four choices whose wrong ones match the topic's trouble note; years to type; the test applied to a short fact
     level 3  choose all that are true; put four or five cases in order; apply a test to a new fact pattern; near misses
   Bank items: { L: [levels], q, a, w: [wrong pool], why }        one answer (mc)
               { L, q, tf: true|false, why }                     true or false
               { L, q, all: [[text, true|false], ...], why }      choose all that are true
               { L, q, num: 1954, why }                          a whole number (a year) to type
               { L, q, order: ['first', ..., 'last'], why }      put in order (cv-order, quiet, lettered A, B, C...)
               { L, gen: function (R, lv) { return item; } }     made fresh each time
   Optional on any item: viz, hint, steps. Choices are shuffled here (keep: true). Fact patterns use neutral, invented
   names and places. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen) return;
  var G = ML.gen, M = Math;
  var EXTRA = {"cbq": ["Chicago, Burlington & Quincy Railroad Co. v. Chicago", 1897, "166 U.S. 226", "", "Due Process (Fourteenth Amendment)", "takings", "Must a state pay just compensation when it takes private property?", "Yes; due process requires just compensation, which is often counted as the first step toward incorporation.", ""], "palko": ["Palko v. Connecticut", 1937, "302 U.S. 319", "", "Due Process (Fourteenth Amendment)", "process", "Does due process stop a state from appealing an acquittal and trying the defendant again?", "No; only rights \"implicit in the concept of ordered liberty\" bind the states, and this retrial did not offend them.", "Overruled by Benton v. Maryland (1969), which applied double jeopardy to the states."], "adamson": ["Adamson v. California", 1947, "332 U.S. 46", "", "Due Process (Fourteenth Amendment)", "process", "Does the privilege against self-incrimination bind the states?", "No (at the time); Justice Black's dissent argued that the Fourteenth Amendment applies the whole Bill of Rights to the states.", "Malloy v. Hogan (1964) applied the privilege to the states."], "saenz": ["Saenz v. Roe", 1999, "526 U.S. 489", "", "Fourteenth Amendment (Privileges or Immunities)", "equal", "May a state pay new residents, in their first year, only the welfare benefits of the state they came from?", "No; the right to travel includes a new resident's right to be treated like other citizens of the state, protected by the Privileges or Immunities Clause.", ""], "burton": ["Burton v. Wilmington Parking Authority", 1961, "365 U.S. 715", "", "Equal Protection; state action", "race", "Is a private restaurant that leases space in a public parking garage bound by the Fourteenth Amendment?", "Yes; the state was so entangled with the restaurant, which shared in its benefits, that its refusal to serve a Black customer was state action.", ""], "jacksonme": ["Jackson v. Metropolitan Edison Co.", 1974, "419 U.S. 345", "", "Due Process; state action", "process", "Is a heavily regulated private utility that cuts off a customer's power a state actor?", "No; regulation, a monopoly license and state approval of its rules were not enough.", ""], "rendellbaker": ["Rendell-Baker v. Kohn", 1982, "457 U.S. 830", "", "State action", "process", "Is a private school that gets nearly all its money from public sources a state actor when it fires teachers?", "No; public funding and regulation do not make its personnel decisions state action.", ""], "halleck": ["Manhattan Community Access Corp. v. Halleck", 2019, "", "", "First Amendment; state action", "speech", "Is a private nonprofit that runs public-access cable channels a state actor?", "No; running such channels is not a function traditionally and exclusively performed by government.", ""], "roth": ["Board of Regents of State Colleges v. Roth", 1972, "408 U.S. 564", "", "Due Process (Fourteenth Amendment)", "process", "Was a professor hired for one year entitled to a hearing when the college chose not to rehire him?", "No; he had no property interest in rehiring (no legitimate claim of entitlement) and no liberty interest was harmed.", ""], "holden": ["Holden v. Hardy", 1898, "169 U.S. 366", "", "Due Process (Fourteenth Amendment)", "process", "May a state limit miners and smelter workers to eight hours a day?", "Yes; the law was a valid health measure for dangerous work.", ""], "adkins": ["Adkins v. Children's Hospital", 1923, "261 U.S. 525", "5–3", "Due Process (Fifth Amendment)", "process", "May Congress set a minimum wage for women in the District of Columbia?", "No; it violated liberty of contract.", "Overruled by West Coast Hotel v. Parrish (1937)."], "nebbia": ["Nebbia v. New York", 1934, "291 U.S. 502", "", "Due Process (Fourteenth Amendment)", "process", "May a state fix the retail price of milk?", "Yes; a state may adopt any economic policy reasonably related to a proper purpose.", ""], "poe": ["Poe v. Ullman", 1961, "367 U.S. 497", "", "Due Process (Fourteenth Amendment)", "liberty", "Could married couples challenge Connecticut's ban on contraceptives that was rarely enforced?", "The appeals were dismissed as not ripe; Justice Harlan's dissent described liberty as a \"rational continuum\" shaped by a \"living\" tradition.", "Griswold v. Connecticut (1965) struck the law down."], "troxel": ["Troxel v. Granville", 2000, "530 U.S. 57", "", "Due Process (Fourteenth Amendment)", "liberty", "May a court order grandparent visits over a fit parent's objection under a very broad statute?", "No, as applied; the plurality held that the order violated the parent's fundamental right to make decisions about her children's care.", ""], "moore": ["Moore v. City of East Cleveland", 1977, "431 U.S. 494", "", "Due Process (Fourteenth Amendment)", "liberty", "May a city zoning rule forbid a grandmother to live with her two grandsons who were cousins?", "No; the plurality held that the Constitution protects the extended family living together.", ""], "bowers": ["Bowers v. Hardwick", 1986, "478 U.S. 186", "5–4", "Due Process (Fourteenth Amendment)", "liberty", "Does due process protect private conduct between consenting adults of the same sex?", "No; the Court upheld Georgia's law.", "Overruled by Lawrence v. Texas (2003)."], "strauder": ["Strauder v. West Virginia", 1880, "100 U.S. 303", "7–2", "Equal Protection", "race", "May a state law allow only white men to serve on juries?", "No; excluding Black men from juries by law violates equal protection.", ""], "gaines": ["Missouri ex rel. Gaines v. Canada", 1938, "305 U.S. 337", "", "Equal Protection", "race", "May a state with a law school for white students only send Black applicants to law schools in other states?", "No; the state must provide equal legal education within its own borders.", ""], "mclaurin": ["McLaurin v. Oklahoma State Regents", 1950, "339 U.S. 637", "9–0", "Equal Protection", "race", "May a university admit a Black graduate student but seat him apart in classrooms, the library and the cafeteria?", "No; the restrictions impaired his ability to study and learn.", ""], "brown2": ["Brown v. Board of Education II", 1955, "349 U.S. 294", "9–0", "Equal Protection", "race", "How should school desegregation be carried out?", "Lower courts were to oversee desegregation \"with all deliberate speed.\"", ""], "arlington": ["Village of Arlington Heights v. Metropolitan Housing Development Corp.", 1977, "429 U.S. 252", "", "Equal Protection", "equal", "Did a village's refusal to rezone land for mixed-income housing violate equal protection because of its racial impact?", "No; the challengers did not prove discriminatory purpose, and the Court listed the kinds of evidence that can show it.", ""], "feeney": ["Personnel Administrator of Massachusetts v. Feeney", 1979, "442 U.S. 256", "", "Equal Protection", "sex", "Does a lifetime hiring preference for veterans, who were overwhelmingly men, discriminate by sex?", "No; discriminatory purpose means acting \"because of,\" not merely \"in spite of,\" a law's effect on a group.", ""], "gratz": ["Gratz v. Bollinger", 2003, "539 U.S. 244", "6–3", "Equal Protection", "race", "May an undergraduate program give a fixed number of points for race?", "No; the automatic points were not narrowly tailored.", ""], "graham": ["Graham v. Richardson", 1971, "403 U.S. 365", "", "Equal Protection", "equal", "May states deny welfare benefits to lawfully present noncitizens?", "No; state classifications based on alienage are inherently suspect and get close scrutiny.", ""], "murgia": ["Massachusetts Board of Retirement v. Murgia", 1976, "427 U.S. 307", "", "Equal Protection", "equal", "May a state require uniformed state police officers to retire at 50?", "Yes; age is not a suspect class, and the rule was rational.", ""], "plyler": ["Plyler v. Doe", 1982, "457 U.S. 202", "5–4", "Equal Protection", "equal", "May a state deny free public education to children who are not lawfully present?", "No; the law did not further a substantial state goal, given the harm to children who did not choose their status.", ""], "shapiro": ["Shapiro v. Thompson", 1969, "394 U.S. 618", "", "Equal Protection", "equal", "May a state deny welfare to people who have lived there less than a year?", "No; the waiting period penalized the right to travel and served no compelling interest.", ""], "abrams": ["Abrams v. United States", 1919, "250 U.S. 616", "7–2", "First Amendment", "speech", "Did convictions for leaflets opposing U.S. intervention in Russia violate free speech?", "No; the Court upheld the convictions. Justice Holmes, dissenting, defended \"free trade in ideas.\"", ""], "whitney": ["Whitney v. California", 1927, "274 U.S. 357", "9–0", "Due Process; First Amendment", "speech", "Could a state punish membership in a group that advocated violent change?", "Yes; the conviction was upheld. Justice Brandeis's concurrence argued that only serious, imminent danger justifies suppression.", "Overruled by Brandenburg v. Ohio (1969)."], "rav": ["R.A.V. v. City of St. Paul", 1992, "505 U.S. 377", "", "First Amendment", "speech", "May a city ban only those fighting words that insult on the basis of race, religion or certain other topics?", "No; even within an unprotected category, government may not single out disfavored subjects or viewpoints.", ""], "matal": ["Matal v. Tam", 2017, "582 U.S. 218", "8–0", "First Amendment", "speech", "May the government refuse to register trademarks that disparage people?", "No; the disparagement clause discriminated by viewpoint.", ""], "rosenberger": ["Rosenberger v. Rector and Visitors of the University of Virginia", 1995, "515 U.S. 819", "", "First Amendment", "speech", "May a public university fund student publications but refuse to fund one with a religious viewpoint?", "No; that is viewpoint discrimination.", ""], "stevens": ["United States v. Stevens", 2010, "559 U.S. 460", "8–1", "First Amendment", "speech", "May Congress create a new unprotected category by weighing a kind of speech's value against its costs?", "No; the statute was overbroad, and the Court refused to add categories by that kind of balancing.", ""], "snyder": ["Snyder v. Phelps", 2011, "562 U.S. 443", "8–1", "First Amendment", "speech", "Could protesters on public land near a funeral be held liable for causing emotional distress?", "No; their speech was on public matters in a public place.", ""], "gertz": ["Gertz v. Robert Welch, Inc.", 1974, "418 U.S. 323", "", "First Amendment", "press", "Must a private person suing for defamation prove actual malice?", "No; states may set their own standard for private figures, as long as they do not impose liability without fault.", ""], "perry": ["Perry Education Association v. Perry Local Educators' Association", 1983, "460 U.S. 37", "", "First Amendment", "speech", "May a school district give only the elected union access to teachers' mailboxes?", "Yes; the mail system was a nonpublic forum, and the rule was reasonable and viewpoint-neutral.", ""], "hague": ["Hague v. Committee for Industrial Organization", 1939, "307 U.S. 496", "", "First Amendment; Due Process", "speech", "May a city ban public meetings in its streets and parks without a permit it can deny at will?", "No; streets and parks have been used for assembly \"time out of mind\" (Justice Roberts's opinion).", ""], "iskcon": ["International Society for Krishna Consciousness, Inc. v. Lee", 1992, "505 U.S. 672", "", "First Amendment", "speech", "Are airport terminals public forums?", "No; they are nonpublic forums, and a ban on soliciting money there was reasonable.", ""], "bethel": ["Bethel School District No. 403 v. Fraser", 1986, "478 U.S. 675", "7–2", "First Amendment", "speech", "May a school discipline a student for a lewd speech at a school assembly?", "Yes; schools may prohibit vulgar and lewd speech.", ""], "hazelwood": ["Hazelwood School District v. Kuhlmeier", 1988, "484 U.S. 260", "5–3", "First Amendment", "speech", "May a principal remove articles from a school-sponsored student newspaper?", "Yes, when the action is reasonably related to legitimate teaching concerns.", ""], "pickering": ["Pickering v. Board of Education", 1968, "391 U.S. 563", "", "First Amendment", "speech", "May a school board fire a teacher for a letter to a newspaper criticizing the board?", "No; the teacher's interest in speaking on public matters outweighed the employer's interests here.", ""], "garcetti": ["Garcetti v. Ceballos", 2006, "547 U.S. 410", "5–4", "First Amendment", "speech", "Is a prosecutor's internal memo, written as part of his job, protected speech?", "No; speech made pursuant to official duties is not protected from employer discipline.", ""], "gobitis": ["Minersville School District v. Gobitis", 1940, "310 U.S. 586", "8–1", "First Amendment", "religion", "May a school expel students who refuse, for religious reasons, to salute the flag?", "Yes; the Court upheld the rule.", "Overruled by West Virginia v. Barnette (1943)."], "wooley": ["Wooley v. Maynard", 1977, "430 U.S. 705", "", "First Amendment", "speech", "May a state punish a driver for covering the motto \"Live Free or Die\" on his license plate?", "No; the state may not force a person to display its ideological message.", ""], "dale": ["Boy Scouts of America v. Dale", 2000, "530 U.S. 640", "5–4", "First Amendment", "speech", "May a state public-accommodations law require a private group to accept an adult leader against its stated views?", "No; it would significantly burden the group's expressive association.", ""], "hurley": ["Hurley v. Irish-American Gay, Lesbian, and Bisexual Group of Boston", 1995, "515 U.S. 557", "9–0", "First Amendment", "speech", "May a state require private parade organizers to include a group whose message they do not wish to convey?", "No; a parade is expression, and the organizers may choose its message.", ""], "vablack": ["Virginia v. Black", 2003, "538 U.S. 343", "", "First Amendment", "speech", "May a state ban burning a cross with intent to intimidate?", "Yes; such cross burning is a true threat, but the state may not treat every cross burning as proof of that intent.", ""], "watts": ["Watts v. United States", 1969, "394 U.S. 705", "", "First Amendment", "speech", "Was a young man's crude remark at a rally about the President and a rifle a punishable threat?", "No; it was political hyperbole, not a true threat.", ""], "leeweisman": ["Lee v. Weisman", 1992, "505 U.S. 577", "5–4", "Establishment Clause", "religion", "May a public school invite clergy to give prayers at graduation?", "No; the school's involvement created subtle coercion to take part.", ""], "lynch": ["Lynch v. Donnelly", 1984, "465 U.S. 668", "", "Establishment Clause", "religion", "May a city include a nativity scene in its holiday display?", "Yes; Justice O'Connor's concurrence proposed the endorsement test.", ""], "galloway": ["Town of Greece v. Galloway", 2014, "572 U.S. 565", "", "Establishment Clause", "religion", "May a town open its board meetings with prayers by volunteer chaplains?", "Yes; legislative prayer fits a long historical tradition.", ""], "marshchambers": ["Marsh v. Chambers", 1983, "463 U.S. 783", "", "Establishment Clause", "religion", "May a state legislature pay a chaplain to open sessions with prayer?", "Yes, because of the practice's unbroken history since the First Congress.", ""], "amlegion": ["American Legion v. American Humanist Association", 2019, "588 U.S. 29", "", "Establishment Clause", "religion", "Must a large cross-shaped World War I memorial on public land be removed or altered?", "No; longstanding monuments carry a strong presumption of constitutionality.", ""], "santafe": ["Santa Fe Independent School District v. Doe", 2000, "530 U.S. 290", "6–3", "Establishment Clause", "religion", "May a school let a student elected under its policy give a prayer over the loudspeaker before football games?", "No; the prayers were school-sponsored.", ""], "wallace": ["Wallace v. Jaffree", 1985, "472 U.S. 38", "", "Establishment Clause", "religion", "Was a law adding \"or voluntary prayer\" to a school moment of silence valid?", "No; its purpose was to endorse prayer.", ""], "trinity": ["Trinity Lutheran Church of Columbia, Inc. v. Comer", 2017, "582 U.S. 449", "7–2", "Free Exercise Clause", "religion", "May a state exclude a church preschool from a grant program for playground surfaces because it is a church?", "No; denying a public benefit solely because of religious status violates free exercise.", ""], "espinoza": ["Espinoza v. Montana Department of Revenue", 2020, "591 U.S. 464", "5–4", "Free Exercise Clause", "religion", "May a state scholarship program for private schools exclude religious schools?", "No; once a state subsidizes private education, it may not disqualify schools because they are religious.", ""], "ocentro": ["Gonzales v. O Centro Espírita Beneficente União do Vegetal", 2006, "546 U.S. 418", "8–0", "RFRA", "religion", "Must the federal government show a compelling interest in applying drug laws to a church's sacramental tea?", "Yes; under RFRA the government did not meet its burden at that stage.", ""], "holt": ["Holt v. Hobbs", 2015, "574 U.S. 352", "", "RLUIPA", "religion", "May a state prison bar an inmate from growing a half-inch beard for religious reasons?", "No; under RLUIPA the policy was not the least restrictive means.", ""], "caetano": ["Caetano v. Massachusetts", 2016, "577 U.S. 411", "", "Second Amendment", "arms", "May a state ban stun guns because they did not exist at the founding and are not military weapons?", "Those reasons contradict Heller; the Second Amendment extends to bearable arms not in existence at the founding.", ""], "usmiller": ["United States v. Miller", 1939, "307 U.S. 174", "8–0", "Second Amendment", "arms", "Does the Second Amendment protect possessing a short-barreled shotgun?", "Not shown here; the Court saw no evidence the weapon related to a well regulated militia.", "Read narrowly by Heller (2008)."], "olmstead": ["Olmstead v. United States", 1928, "277 U.S. 438", "5–4", "Fourth Amendment", "crim", "Was wiretapping phone lines outside a home a search?", "No; there was no physical entry. Justice Brandeis dissented, defending \"the right to be let alone.\"", "Overruled by Katz v. United States (1967)."], "jones": ["United States v. Jones", 2012, "565 U.S. 400", "9–0", "Fourth Amendment", "crim", "Is attaching a GPS tracker to a car and following it for 28 days a search?", "Yes; physically occupying private property to gather information is a search.", ""], "smithmd": ["Smith v. Maryland", 1979, "442 U.S. 735", "", "Fourth Amendment", "crim", "Is recording the numbers dialed from a home phone a search?", "No; a person has no reasonable expectation of privacy in numbers conveyed to the phone company.", "Not extended to cell-site records in Carpenter (2018)."], "kyllo": ["Kyllo v. United States", 2001, "533 U.S. 27", "5–4", "Fourth Amendment", "crim", "Is aiming a thermal imager at a home from the street a search?", "Yes; using technology not in general public use to learn details of the home's interior is a search.", ""], "riley": ["Riley v. California", 2014, "573 U.S. 373", "9–0", "Fourth Amendment", "crim", "May police search the digital contents of an arrested person's cell phone without a warrant?", "No; they generally need a warrant.", ""], "chimel": ["Chimel v. California", 1969, "395 U.S. 752", "6–2", "Fourth Amendment", "crim", "May police search a whole house when they arrest someone there?", "No; a search incident to arrest covers the person and the area within his immediate control.", ""], "carroll": ["Carroll v. United States", 1925, "267 U.S. 132", "", "Fourth Amendment", "crim", "May officers search a car on the highway without a warrant?", "Yes, with probable cause, because a car can be moved quickly.", ""], "weeks": ["Weeks v. United States", 1914, "232 U.S. 383", "9–0", "Fourth Amendment", "crim", "May federal courts use evidence seized by federal officers in an illegal search?", "No; the evidence must be excluded in federal court.", ""], "wolf": ["Wolf v. Colorado", 1949, "338 U.S. 25", "", "Fourth and Fourteenth Amendments", "crim", "Must state courts exclude illegally seized evidence?", "No (at the time); the right applied to the states, but the exclusionary remedy did not.", "Overruled on the remedy by Mapp v. Ohio (1961)."], "nix": ["Nix v. Williams", 1984, "467 U.S. 431", "", "Fourth, Fifth and Sixth Amendments", "crim", "May evidence found through an illegal interrogation be used if it would have been found anyway?", "Yes; this is the inevitable discovery exception.", ""], "quarles": ["New York v. Quarles", 1984, "467 U.S. 649", "", "Fifth Amendment", "crim", "Must police give Miranda warnings before asking an arrested man where he hid a gun in a store?", "No; there is a public safety exception.", ""], "schmerber": ["Schmerber v. California", 1966, "384 U.S. 757", "", "Fourth and Fifth Amendments", "crim", "Does taking a blood sample from a driver violate the privilege against self-incrimination?", "No; the privilege covers testimonial evidence, not physical evidence such as blood.", ""], "benton": ["Benton v. Maryland", 1969, "395 U.S. 784", "", "Fifth Amendment (Double Jeopardy)", "crim", "Does the Double Jeopardy Clause apply to the states?", "Yes; Palko v. Connecticut was overruled.", ""], "malloy": ["Malloy v. Hogan", 1964, "378 U.S. 1", "", "Fifth Amendment", "crim", "Does the privilege against self-incrimination apply to the states?", "Yes.", ""], "betts": ["Betts v. Brady", 1942, "316 U.S. 455", "", "Due Process; Sixth Amendment", "crim", "Must states give lawyers to poor defendants in every felony case?", "No; only where special circumstances made a trial without counsel unfair.", "Overruled by Gideon v. Wainwright (1963)."], "argersinger": ["Argersinger v. Hamlin", 1972, "407 U.S. 25", "", "Sixth Amendment", "crim", "May a poor defendant be jailed for a misdemeanor without a lawyer?", "No; no one may be imprisoned for any offense unless represented by counsel or the right was waived.", ""], "scottil": ["Scott v. Illinois", 1979, "440 U.S. 367", "", "Sixth Amendment", "crim", "Must counsel be appointed when a crime could be punished by jail but only a fine is imposed?", "No; actual imprisonment is the line.", ""], "baldwin": ["Baldwin v. New York", 1970, "399 U.S. 66", "", "Sixth Amendment", "crim", "Does a crime punishable by up to a year in jail require a jury trial?", "Yes; no offense punishable by more than six months is \"petty.\"", ""], "apodaca": ["Apodaca v. Oregon", 1972, "406 U.S. 404", "", "Sixth Amendment", "crim", "Must state juries be unanimous?", "No (at the time), in a fractured decision.", "Overruled by Ramos v. Louisiana (2020)."], "atkins": ["Atkins v. Virginia", 2002, "536 U.S. 304", "6–3", "Eighth Amendment", "crim", "May a person with an intellectual disability be executed?", "No.", ""], "kennedyla": ["Kennedy v. Louisiana", 2008, "554 U.S. 407", "5–4", "Eighth Amendment", "crim", "May a state impose the death penalty for a crime against a person that did not result in death?", "No, for such crimes against individuals.", ""], "mahon": ["Pennsylvania Coal Co. v. Mahon", 1922, "260 U.S. 393", "", "Takings Clause", "takings", "Can a regulation take property even without physically seizing it?", "Yes; \"if regulation goes too far it will be recognized as a taking\" (Justice Holmes).", ""], "berman": ["Berman v. Parker", 1954, "348 U.S. 26", "", "Takings Clause", "takings", "May the government take a store in a blighted area for an urban renewal plan?", "Yes; a redevelopment plan serves a public purpose even if the land passes to private owners.", ""], "midkiff": ["Hawaii Housing Authority v. Midkiff", 1984, "467 U.S. 229", "", "Takings Clause", "takings", "May a state take land from large landowners and sell it to the tenants living on it?", "Yes; reducing concentrated land ownership is a public use.", ""], "loretto": ["Loretto v. Teleprompter Manhattan CATV Corp.", 1982, "458 U.S. 419", "", "Takings Clause", "takings", "Is a law requiring landlords to allow small cable boxes on their buildings a taking?", "Yes; a permanent physical occupation is a taking, however small.", ""], "gingles": ["Thornburg v. Gingles", 1986, "478 U.S. 30", "", "Voting Rights Act, Section 2", "voting", "When do multimember districts unlawfully dilute minority votes?", "The Court set three preconditions: a large and compact minority group, political cohesion, and a white majority that usually defeats the minority's preferred candidates.", ""], "sckatz": ["South Carolina v. Katzenbach", 1966, "383 U.S. 301", "", "Fifteenth Amendment, Section 2", "voting", "Were the Voting Rights Act's coverage formula and preclearance valid?", "Yes; Congress could use these strong remedies to enforce the Fifteenth Amendment.", ""]};
  // a snapshot of the ladder-model cases this course uses (same fields), so the banks can be built even if the kit loads later
  var SNAP = {"abington": {"key": "abington", "name": "Abington School District v. Schempp", "year": 1963, "cite": "374 U.S. 203", "vote": "8–1", "clause": "Establishment Clause", "area": "religion", "q": "May public schools begin the day with Bible reading?", "holding": "No; school-sponsored devotional reading violates the Establishment Clause.", "later": ""}, "adarand": {"key": "adarand", "name": "Adarand Constructors, Inc. v. Peña", "year": 1995, "cite": "515 U.S. 200", "vote": "5–4", "clause": "Fifth Amendment Due Process", "area": "race", "q": "Do federal racial classifications get strict scrutiny?", "holding": "Yes, like state ones.", "later": ""}, "baker": {"key": "baker", "name": "Baker v. Carr", "year": 1962, "cite": "369 U.S. 186", "vote": "6–2", "clause": "Equal Protection; political question", "area": "voting", "q": "Can federal courts hear a challenge to unequal legislative districts?", "holding": "Yes; the claim was justiciable, not a political question.", "later": "Led to \"one person, one vote\" (Reynolds v. Sims, 1964)."}, "bakke": {"key": "bakke", "name": "Regents of the University of California v. Bakke", "year": 1978, "cite": "438 U.S. 265", "vote": "5–4", "clause": "Equal Protection; Title VI", "area": "race", "q": "May a medical school reserve seats for minority applicants?", "holding": "No quotas; but race may be considered as one factor (Justice Powell's controlling opinion).", "later": ""}, "barnette": {"key": "barnette", "name": "West Virginia State Board of Education v. Barnette", "year": 1943, "cite": "319 U.S. 624", "vote": "6–3", "clause": "First Amendment", "area": "speech", "q": "May a public school require students to salute the flag?", "holding": "No; the government may not compel such expression.", "later": "Overruled Minersville School District v. Gobitis (1940)."}, "barron": {"key": "barron", "name": "Barron v. Baltimore", "year": 1833, "cite": "32 U.S. 243", "vote": "7–0", "clause": "Fifth Amendment (Takings Clause)", "area": "process", "q": "Does the Bill of Rights limit state and city governments?", "holding": "No; it limits only the federal government.", "later": "Largely changed by incorporation through the Fourteenth Amendment."}, "batson": {"key": "batson", "name": "Batson v. Kentucky", "year": 1986, "cite": "476 U.S. 79", "vote": "7–2", "clause": "Equal Protection", "area": "crim", "q": "May a prosecutor strike jurors because of their race?", "holding": "No.", "later": ""}, "boerne": {"key": "boerne", "name": "City of Boerne v. Flores", "year": 1997, "cite": "521 U.S. 507", "vote": "6–3", "clause": "Fourteenth Amendment, Section 5", "area": "federalism", "q": "Could Congress apply RFRA to the states under Section 5?", "holding": "No; Section 5 laws need congruence and proportionality to constitutional violations.", "later": ""}, "bolling": {"key": "bolling", "name": "Bolling v. Sharpe", "year": 1954, "cite": "347 U.S. 497", "vote": "9–0", "clause": "Fifth Amendment Due Process", "area": "race", "q": "Is school segregation in the District of Columbia unconstitutional?", "holding": "Yes; the Fifth Amendment's due process clause forbids it.", "later": ""}, "brandenburg": {"key": "brandenburg", "name": "Brandenburg v. Ohio", "year": 1969, "cite": "395 U.S. 444", "vote": "8–0", "clause": "First Amendment", "area": "speech", "q": "May a state punish advocacy of violence at a rally?", "holding": "Only if it is directed to inciting imminent lawless action and likely to produce it.", "later": "Overruled Whitney v. California (1927)."}, "brown": {"key": "brown", "name": "Brown v. Board of Education", "year": 1954, "cite": "347 U.S. 483", "vote": "9–0", "clause": "Equal Protection", "area": "race", "q": "Does segregation of children in public schools by race violate equal protection?", "holding": "Yes; \"separate educational facilities are inherently unequal.\"", "later": "Brown II (1955) ordered desegregation \"with all deliberate speed.\""}, "buckley": {"key": "buckley", "name": "Buckley v. Valeo", "year": 1976, "cite": "424 U.S. 1", "vote": "", "clause": "First Amendment", "area": "speech", "q": "Do federal limits on campaign contributions and spending violate free speech?", "holding": "Contribution limits are valid; limits on independent expenditures and candidates' spending are not.", "later": ""}, "bushgore": {"key": "bushgore", "name": "Bush v. Gore", "year": 2000, "cite": "531 U.S. 98", "vote": "", "clause": "Equal Protection", "area": "voting", "q": "Could Florida's recount continue under varying standards?", "holding": "No; seven justices found an equal protection problem, and five held no remedy was possible in time.", "later": ""}, "carolene": {"key": "carolene", "name": "United States v. Carolene Products Co.", "year": 1938, "cite": "304 U.S. 144", "vote": "6–1", "clause": "Due Process", "area": "process", "q": "Is a ban on shipping \"filled milk\" valid?", "holding": "Yes; economic laws are presumed valid if they rest on a rational basis; footnote four suggested closer review for some laws.", "later": ""}, "carpenter": {"key": "carpenter", "name": "Carpenter v. United States", "year": 2018, "cite": "585 U.S. 296", "vote": "5–4", "clause": "Fourth Amendment", "area": "crim", "q": "Do police need a warrant for a person's historical cell-site location records?", "holding": "Yes, generally.", "later": ""}, "casey": {"key": "casey", "name": "Planned Parenthood of Southeastern Pennsylvania v. Casey", "year": 1992, "cite": "505 U.S. 833", "vote": "5–4", "clause": "Due Process", "area": "liberty", "q": "Should Roe v. Wade be overruled, and what test applies?", "holding": "Roe's central holding was kept and the trimester framework replaced with an \"undue burden\" test.", "later": "The Court overruled this precedent in 2022."}, "chaplinsky": {"key": "chaplinsky", "name": "Chaplinsky v. New Hampshire", "year": 1942, "cite": "315 U.S. 568", "vote": "9–0", "clause": "First Amendment", "area": "speech", "q": "Are face-to-face \"fighting words\" protected?", "holding": "No; fighting words are a narrow unprotected category.", "later": ""}, "citizensunited": {"key": "citizensunited", "name": "Citizens United v. Federal Election Commission", "year": 2010, "cite": "558 U.S. 310", "vote": "5–4", "clause": "First Amendment", "area": "speech", "q": "May the government ban independent election spending by corporations and unions?", "holding": "No; such spending is protected political speech.", "later": ""}, "civilrightscases": {"key": "civilrightscases", "name": "Civil Rights Cases", "year": 1883, "cite": "109 U.S. 3", "vote": "8–1", "clause": "Fourteenth Amendment, Section 5", "area": "race", "q": "Could Congress ban racial discrimination by private inns, theaters and railroads under the Fourteenth Amendment?", "holding": "No; the amendment reaches state action, not private conduct.", "later": "Congress later reached private businesses under the Commerce Clause (1964)."}, "cleburne": {"key": "cleburne", "name": "City of Cleburne v. Cleburne Living Center", "year": 1985, "cite": "473 U.S. 432", "vote": "", "clause": "Equal Protection", "area": "equal", "q": "Did a city violate equal protection by denying a permit for a group home for people with intellectual disabilities?", "holding": "Yes; under rational basis, the denial rested on irrational prejudice.", "later": ""}, "craig": {"key": "craig", "name": "Craig v. Boren", "year": 1976, "cite": "429 U.S. 190", "vote": "7–2", "clause": "Equal Protection", "area": "sex", "q": "May a state set different ages for buying 3.2% beer for men and women?", "holding": "No; sex classifications must serve important objectives and be substantially related to them.", "later": "Set intermediate scrutiny."}, "crawford": {"key": "crawford", "name": "Crawford v. Washington", "year": 2004, "cite": "541 U.S. 36", "vote": "9–0", "clause": "Sixth Amendment", "area": "crim", "q": "May a recorded statement be used at trial if the defendant could not cross-examine the speaker?", "holding": "Not if it is testimonial, unless the witness is unavailable and was cross-examined before.", "later": ""}, "croson": {"key": "croson", "name": "City of Richmond v. J. A. Croson Co.", "year": 1989, "cite": "488 U.S. 469", "vote": "6–3", "clause": "Equal Protection", "area": "race", "q": "Is a city's set-aside of contracts for minority-owned businesses valid?", "holding": "No; state and local racial classifications get strict scrutiny, which the plan failed.", "later": ""}, "cruzan": {"key": "cruzan", "name": "Cruzan v. Director, Missouri Department of Health", "year": 1990, "cite": "497 U.S. 261", "vote": "5–4", "clause": "Due Process", "area": "liberty", "q": "May a state require clear and convincing evidence of a patient's wishes before ending life support?", "holding": "Yes, assuming a competent person has a right to refuse treatment.", "later": ""}, "dennis": {"key": "dennis", "name": "Dennis v. United States", "year": 1951, "cite": "341 U.S. 494", "vote": "6–2", "clause": "First Amendment", "area": "speech", "q": "Did convicting Communist Party leaders for conspiring to advocate overthrow violate free speech?", "holding": "No; the Court upheld the convictions.", "later": "Effectively limited by later cases and Brandenburg."}, "dickerson": {"key": "dickerson", "name": "Dickerson v. United States", "year": 2000, "cite": "530 U.S. 428", "vote": "7–2", "clause": "Fifth Amendment", "area": "crim", "q": "Could Congress replace Miranda's warnings by statute?", "holding": "No; Miranda is a constitutional rule.", "later": ""}, "duncan": {"key": "duncan", "name": "Duncan v. Louisiana", "year": 1968, "cite": "391 U.S. 145", "vote": "7–2", "clause": "Sixth Amendment", "area": "crim", "q": "Must states provide jury trials for serious crimes?", "holding": "Yes; the jury right is fundamental and applies to the states.", "later": ""}, "engel": {"key": "engel", "name": "Engel v. Vitale", "year": 1962, "cite": "370 U.S. 421", "vote": "6–1", "clause": "Establishment Clause", "area": "religion", "q": "May public schools open the day with a state-written prayer?", "holding": "No; even a voluntary, nondenominational official prayer violates the Establishment Clause.", "later": ""}, "everson": {"key": "everson", "name": "Everson v. Board of Education", "year": 1947, "cite": "330 U.S. 1", "vote": "5–4", "clause": "Establishment Clause", "area": "religion", "q": "May a township repay parents for bus fares to religious schools?", "holding": "Yes; the Establishment Clause applies to the states, but this general benefit was allowed.", "later": ""}, "frontiero": {"key": "frontiero", "name": "Frontiero v. Richardson", "year": 1973, "cite": "411 U.S. 677", "vote": "8–1", "clause": "Fifth Amendment Due Process", "area": "sex", "q": "May the military give male service members' wives benefits automatically but require female service members' husbands to prove dependency?", "holding": "No; four justices would apply strict scrutiny to sex classifications, but there was no majority for that test.", "later": ""}, "furman": {"key": "furman", "name": "Furman v. Georgia", "year": 1972, "cite": "408 U.S. 238", "vote": "5–4", "clause": "Eighth Amendment", "area": "crim", "q": "Was the death penalty, as then imposed, cruel and unusual?", "holding": "Yes, as then administered; each justice in the majority wrote separately.", "later": "Revised statutes were upheld in Gregg v. Georgia (1976)."}, "gamble": {"key": "gamble", "name": "Gamble v. United States", "year": 2019, "cite": "", "vote": "7–2", "clause": "Fifth Amendment", "area": "crim", "q": "May a state and the federal government each prosecute the same conduct?", "holding": "Yes; the separate-sovereigns doctrine stands.", "later": ""}, "gideon": {"key": "gideon", "name": "Gideon v. Wainwright", "year": 1963, "cite": "372 U.S. 335", "vote": "9–0", "clause": "Sixth Amendment", "area": "crim", "q": "Must states provide a lawyer to defendants charged with felonies who cannot afford one?", "holding": "Yes; the right to counsel applies to the states.", "later": "Overruled Betts v. Brady (1942)."}, "gitlow": {"key": "gitlow", "name": "Gitlow v. New York", "year": 1925, "cite": "268 U.S. 652", "vote": "7–2", "clause": "First and Fourteenth Amendments", "area": "speech", "q": "Do the freedoms of speech and press limit the states?", "holding": "The Court assumed they do (beginning incorporation), but upheld Gitlow's conviction.", "later": ""}, "glucksberg": {"key": "glucksberg", "name": "Washington v. Glucksberg", "year": 1997, "cite": "521 U.S. 702", "vote": "9–0", "clause": "Due Process", "area": "liberty", "q": "Does due process protect a right to assisted suicide?", "holding": "No; the asserted right is not deeply rooted in history and tradition.", "later": ""}, "goldberg": {"key": "goldberg", "name": "Goldberg v. Kelly", "year": 1970, "cite": "397 U.S. 254", "vote": "5–3", "clause": "Due Process", "area": "process", "q": "Must a state hold a hearing before ending welfare benefits?", "holding": "Yes; an evidentiary hearing is required before termination.", "later": ""}, "gregg": {"key": "gregg", "name": "Gregg v. Georgia", "year": 1976, "cite": "428 U.S. 153", "vote": "7–2", "clause": "Eighth Amendment", "area": "crim", "q": "Is the death penalty always cruel and unusual?", "holding": "No; Georgia's revised procedures were upheld.", "later": ""}, "griswold": {"key": "griswold", "name": "Griswold v. Connecticut", "year": 1965, "cite": "381 U.S. 479", "vote": "7–2", "clause": "Due Process; several amendments", "area": "liberty", "q": "May a state ban married couples' use of contraceptives?", "holding": "No; the law violated a right of marital privacy.", "later": ""}, "grutter": {"key": "grutter", "name": "Grutter v. Bollinger", "year": 2003, "cite": "539 U.S. 306", "vote": "5–4", "clause": "Equal Protection", "area": "race", "q": "May a law school consider race in a holistic admissions process?", "holding": "Yes; diversity was a compelling interest and the program was narrowly tailored.", "later": "The Court rejected race-conscious admissions programs in 2023."}, "harper": {"key": "harper", "name": "Harper v. Virginia Board of Elections", "year": 1966, "cite": "383 U.S. 663", "vote": "6–3", "clause": "Equal Protection", "area": "voting", "q": "May a state charge a poll tax in state elections?", "holding": "No; wealth has nothing to do with voting qualifications.", "later": ""}, "heller": {"key": "heller", "name": "District of Columbia v. Heller", "year": 2008, "cite": "554 U.S. 570", "vote": "5–4", "clause": "Second Amendment", "area": "arms", "q": "Does the Second Amendment protect an individual right to keep a handgun at home?", "holding": "Yes; the District's handgun ban was unconstitutional.", "later": ""}, "hobbylobby": {"key": "hobbylobby", "name": "Burwell v. Hobby Lobby Stores", "year": 2014, "cite": "573 U.S. 682", "vote": "5–4", "clause": "RFRA", "area": "religion", "q": "Does RFRA protect closely held companies from a federal contraceptive-coverage rule?", "holding": "Yes; the rule was not the least restrictive means.", "later": ""}, "johnson": {"key": "johnson", "name": "Texas v. Johnson", "year": 1989, "cite": "491 U.S. 397", "vote": "5–4", "clause": "First Amendment", "area": "speech", "q": "May a state punish burning the American flag as political protest?", "holding": "No; it is expressive conduct protected by the First Amendment.", "later": ""}, "katz": {"key": "katz", "name": "Katz v. United States", "year": 1967, "cite": "389 U.S. 347", "vote": "7–1", "clause": "Fourth Amendment", "area": "crim", "q": "Was recording a call from a public phone booth a search?", "holding": "Yes; the Fourth Amendment protects people, not places, and reasonable expectations of privacy.", "later": ""}, "kelo": {"key": "kelo", "name": "Kelo v. City of New London", "year": 2005, "cite": "545 U.S. 469", "vote": "5–4", "clause": "Takings Clause", "area": "takings", "q": "Is taking homes for an economic development plan a \"public use\"?", "holding": "Yes, with just compensation.", "later": "Many states then limited eminent domain by law."}, "korematsu": {"key": "korematsu", "name": "Korematsu v. United States", "year": 1944, "cite": "323 U.S. 214", "vote": "6–3", "clause": "Due Process; war powers", "area": "race", "q": "Was the wartime order excluding people of Japanese ancestry from the West Coast constitutional?", "holding": "Yes; the Court upheld it while saying racial restrictions are subject to the most rigid scrutiny.", "later": "Congress apologized in 1988; the Supreme Court has since said it was wrongly decided."}, "lawrence": {"key": "lawrence", "name": "Lawrence v. Texas", "year": 2003, "cite": "539 U.S. 558", "vote": "6–3", "clause": "Due Process", "area": "liberty", "q": "May a state make private conduct between consenting adults of the same sex a crime?", "holding": "No; the law violated due process liberty.", "later": "Overruled Bowers v. Hardwick (1986)."}, "leeoptical": {"key": "leeoptical", "name": "Williamson v. Lee Optical", "year": 1955, "cite": "348 U.S. 483", "vote": "8–0", "clause": "Due Process; Equal Protection", "area": "process", "q": "May a state bar opticians from fitting lenses without a prescription?", "holding": "Yes; the legislature might have had a rational reason.", "later": ""}, "lemon": {"key": "lemon", "name": "Lemon v. Kurtzman", "year": 1971, "cite": "403 U.S. 602", "vote": "", "clause": "Establishment Clause", "area": "religion", "q": "May states pay part of teachers' salaries at religious schools?", "holding": "No; the programs fostered excessive entanglement (the three-part Lemon test).", "later": "The Court said in 2022 that it no longer applies this test."}, "leon": {"key": "leon", "name": "United States v. Leon", "year": 1984, "cite": "468 U.S. 897", "vote": "6–3", "clause": "Fourth Amendment", "area": "crim", "q": "Must evidence be excluded when police reasonably relied on a warrant later found invalid?", "holding": "No; there is a good-faith exception.", "later": ""}, "lochner": {"key": "lochner", "name": "Lochner v. New York", "year": 1905, "cite": "198 U.S. 45", "vote": "5–4", "clause": "Due Process (Fourteenth Amendment)", "area": "process", "q": "Does a maximum-hours law for bakers violate liberty of contract?", "holding": "Yes; the law was not a valid health measure and interfered with liberty of contract.", "later": "Repudiated after 1937 (West Coast Hotel v. Parrish)."}, "loving": {"key": "loving", "name": "Loving v. Virginia", "year": 1967, "cite": "388 U.S. 1", "vote": "9–0", "clause": "Equal Protection; Due Process", "area": "race", "q": "May a state ban marriage between people of different races?", "holding": "No; the ban violated equal protection and the freedom to marry.", "later": ""}, "lucas": {"key": "lucas", "name": "Lucas v. South Carolina Coastal Council", "year": 1992, "cite": "505 U.S. 1003", "vote": "6–3", "clause": "Takings Clause", "area": "takings", "q": "Is a rule that leaves land with no economic use a taking?", "holding": "Yes, unless background principles of property law already forbade the use.", "later": ""}, "lukumi": {"key": "lukumi", "name": "Church of the Lukumi Babalu Aye v. City of Hialeah", "year": 1993, "cite": "508 U.S. 520", "vote": "9–0", "clause": "Free Exercise Clause", "area": "religion", "q": "May a city ban a faith's ritual practices through laws aimed at them?", "holding": "No; laws targeting religion get strict scrutiny and failed it.", "later": ""}, "mapp": {"key": "mapp", "name": "Mapp v. Ohio", "year": 1961, "cite": "367 U.S. 643", "vote": "6–3", "clause": "Fourth Amendment", "area": "crim", "q": "Must state courts exclude evidence from an unconstitutional search?", "holding": "Yes; the exclusionary rule applies to the states.", "later": ""}, "marsh": {"key": "marsh", "name": "Marsh v. Alabama", "year": 1946, "cite": "326 U.S. 501", "vote": "5–3", "clause": "First Amendment; state action", "area": "speech", "q": "May a company town ban distributing religious literature on its streets?", "holding": "No; a company town performing public functions is bound by the First Amendment.", "later": ""}, "mathews": {"key": "mathews", "name": "Mathews v. Eldridge", "year": 1976, "cite": "424 U.S. 319", "vote": "6–2", "clause": "Due Process", "area": "process", "q": "Must a hearing come before ending disability benefits?", "holding": "No; under a three-factor balance, the existing procedures were enough.", "later": ""}, "mcdonald": {"key": "mcdonald", "name": "McDonald v. City of Chicago", "year": 2010, "cite": "561 U.S. 742", "vote": "5–4", "clause": "Second and Fourteenth Amendments", "area": "arms", "q": "Does the Second Amendment apply to states and cities?", "holding": "Yes; the right is incorporated.", "later": ""}, "meyer": {"key": "meyer", "name": "Meyer v. Nebraska", "year": 1923, "cite": "262 U.S. 390", "vote": "7–2", "clause": "Due Process", "area": "liberty", "q": "May a state ban teaching foreign languages to young children?", "holding": "No; the liberty protected by due process includes parents' right to have children taught.", "later": ""}, "miller": {"key": "miller", "name": "Miller v. California", "year": 1973, "cite": "413 U.S. 15", "vote": "5–4", "clause": "First Amendment", "area": "speech", "q": "What test defines obscenity, which is not protected?", "holding": "A three-part test using contemporary community standards.", "later": ""}, "miranda": {"key": "miranda", "name": "Miranda v. Arizona", "year": 1966, "cite": "384 U.S. 436", "vote": "5–4", "clause": "Fifth Amendment", "area": "crim", "q": "Must police warn suspects in custody of their rights before questioning them?", "holding": "Yes; without the warnings, statements from custodial interrogation are generally inadmissible.", "later": "Reaffirmed in Dickerson v. United States (2000)."}, "morse": {"key": "morse", "name": "Morse v. Frederick", "year": 2007, "cite": "551 U.S. 393", "vote": "5–4", "clause": "First Amendment", "area": "speech", "q": "May a school punish a student's banner reasonably read as promoting illegal drug use at a school event?", "holding": "Yes.", "later": ""}, "muller": {"key": "muller", "name": "Muller v. Oregon", "year": 1908, "cite": "208 U.S. 412", "vote": "9–0", "clause": "Due Process", "area": "process", "q": "May a state limit working hours for women in factories and laundries?", "holding": "Yes; the Court upheld the law.", "later": ""}, "naacpalabama": {"key": "naacpalabama", "name": "NAACP v. Alabama ex rel. Patterson", "year": 1958, "cite": "357 U.S. 449", "vote": "9–0", "clause": "First and Fourteenth Amendments", "area": "speech", "q": "Must the NAACP give Alabama its membership lists?", "holding": "No; forced disclosure would burden members' freedom of association.", "later": ""}, "near": {"key": "near", "name": "Near v. Minnesota", "year": 1931, "cite": "283 U.S. 697", "vote": "5–4", "clause": "First Amendment", "area": "press", "q": "May a state shut down a newspaper as a \"public nuisance\" for what it prints?", "holding": "No; this is a prior restraint, presumed unconstitutional.", "later": ""}, "obergefell": {"key": "obergefell", "name": "Obergefell v. Hodges", "year": 2015, "cite": "576 U.S. 644", "vote": "5–4", "clause": "Due Process; Equal Protection", "area": "liberty", "q": "Must states license and recognize marriages between two people of the same sex?", "holding": "Yes.", "later": ""}, "obrien": {"key": "obrien", "name": "United States v. O'Brien", "year": 1968, "cite": "391 U.S. 367", "vote": "7–1", "clause": "First Amendment", "area": "speech", "q": "Was burning a draft card protected symbolic speech?", "holding": "No; the law served an important interest unrelated to suppressing expression, with no greater restriction than essential.", "later": ""}, "penncentral": {"key": "penncentral", "name": "Penn Central Transportation Co. v. New York City", "year": 1978, "cite": "438 U.S. 104", "vote": "6–3", "clause": "Takings Clause", "area": "takings", "q": "Did landmark rules that blocked a tower over Grand Central Terminal take property?", "holding": "No, under a balancing of economic impact, investment expectations and the character of the action.", "later": ""}, "pentagonpapers": {"key": "pentagonpapers", "name": "New York Times Co. v. United States", "year": 1971, "cite": "403 U.S. 713", "vote": "6–3", "clause": "First Amendment", "area": "press", "q": "Could the government stop newspapers from publishing the Pentagon Papers?", "holding": "No; the government did not meet the heavy burden needed for a prior restraint.", "later": ""}, "pierce": {"key": "pierce", "name": "Pierce v. Society of Sisters", "year": 1925, "cite": "268 U.S. 510", "vote": "9–0", "clause": "Due Process", "area": "liberty", "q": "May a state require all children to attend public schools?", "holding": "No; parents may choose private schools.", "later": ""}, "plessy": {"key": "plessy", "name": "Plessy v. Ferguson", "year": 1896, "cite": "163 U.S. 537", "vote": "7–1", "clause": "Equal Protection", "area": "race", "q": "Does a state law requiring separate railway cars for Black and white passengers violate equal protection?", "holding": "No; \"separate but equal\" facilities were held constitutional.", "later": "Overruled for public schools by Brown v. Board of Education (1954)."}, "powell": {"key": "powell", "name": "Powell v. Alabama", "year": 1932, "cite": "287 U.S. 45", "vote": "7–2", "clause": "Due Process", "area": "crim", "q": "Did denying effective counsel to the \"Scottsboro boys\" in a capital trial violate due process?", "holding": "Yes; in a capital case like this, due process required effective counsel.", "later": ""}, "railwayexpress": {"key": "railwayexpress", "name": "Railway Express Agency v. New York", "year": 1949, "cite": "336 U.S. 106", "vote": "9–0", "clause": "Equal Protection", "area": "equal", "q": "May a city ban advertising on vehicles except for the owner's own business?", "holding": "Yes; the classification was rational.", "later": ""}, "ramos": {"key": "ramos", "name": "Ramos v. Louisiana", "year": 2020, "cite": "590 U.S. 83", "vote": "6–3", "clause": "Sixth Amendment", "area": "crim", "q": "Must state juries be unanimous to convict of a serious crime?", "holding": "Yes.", "later": ""}, "reed": {"key": "reed", "name": "Reed v. Reed", "year": 1971, "cite": "404 U.S. 71", "vote": "7–0", "clause": "Equal Protection", "area": "sex", "q": "May a state prefer men over women as estate administrators?", "holding": "No; the preference was arbitrary.", "later": ""}, "reedgilbert": {"key": "reedgilbert", "name": "Reed v. Town of Gilbert", "year": 2015, "cite": "576 U.S. 155", "vote": "9–0", "clause": "First Amendment", "area": "speech", "q": "Is a sign code that treats signs differently by their subject content-based?", "holding": "Yes; it gets strict scrutiny, which it failed.", "later": ""}, "reynolds": {"key": "reynolds", "name": "Reynolds v. Sims", "year": 1964, "cite": "377 U.S. 533", "vote": "8–1", "clause": "Equal Protection", "area": "voting", "q": "Must both houses of a state legislature have districts of equal population?", "holding": "Yes: \"one person, one vote.\"", "later": ""}, "rodriguez": {"key": "rodriguez", "name": "San Antonio Independent School District v. Rodriguez", "year": 1973, "cite": "411 U.S. 1", "vote": "5–4", "clause": "Equal Protection", "area": "equal", "q": "Does school funding by local property taxes violate equal protection?", "holding": "No; wealth is not a suspect class, education is not a fundamental right under the Constitution, and the system was rational.", "later": ""}, "roe": {"key": "roe", "name": "Roe v. Wade", "year": 1973, "cite": "410 U.S. 113", "vote": "7–2", "clause": "Due Process (Fourteenth Amendment)", "area": "liberty", "q": "Does the Constitution protect a right to choose abortion?", "holding": "Yes, as part of a right of privacy, under a trimester framework.", "later": "Modified by Casey (1992); the Court overruled it in 2022."}, "romer": {"key": "romer", "name": "Romer v. Evans", "year": 1996, "cite": "517 U.S. 620", "vote": "6–3", "clause": "Equal Protection", "area": "equal", "q": "Was a state constitutional amendment barring local laws protecting gay people valid?", "holding": "No; it lacked a rational relation to a legitimate purpose.", "later": ""}, "roper": {"key": "roper", "name": "Roper v. Simmons", "year": 2005, "cite": "543 U.S. 551", "vote": "5–4", "clause": "Eighth Amendment", "area": "crim", "q": "May a person be executed for a crime committed under 18?", "holding": "No.", "later": ""}, "rucho": {"key": "rucho", "name": "Rucho v. Common Cause", "year": 2019, "cite": "", "vote": "5–4", "clause": "Article III; political question", "area": "voting", "q": "Can federal courts decide partisan gerrymandering claims?", "holding": "No; they are political questions beyond federal courts.", "later": ""}, "schenck": {"key": "schenck", "name": "Schenck v. United States", "year": 1919, "cite": "249 U.S. 47", "vote": "9–0", "clause": "First Amendment", "area": "speech", "q": "Did convictions for leaflets urging resistance to the draft violate free speech?", "holding": "No; speech creating a \"clear and present danger\" of evils Congress may prevent can be punished.", "later": "Its test was replaced by Brandenburg v. Ohio (1969)."}, "shaw": {"key": "shaw", "name": "Shaw v. Reno", "year": 1993, "cite": "509 U.S. 630", "vote": "5–4", "clause": "Equal Protection", "area": "voting", "q": "Can a district drawn mainly by race be challenged under equal protection?", "holding": "Yes; such districts are subject to strict scrutiny.", "later": ""}, "shelby": {"key": "shelby", "name": "Shelby County v. Holder", "year": 2013, "cite": "570 U.S. 529", "vote": "5–4", "clause": "Fifteenth Amendment; Tenth Amendment", "area": "voting", "q": "Is the Voting Rights Act's coverage formula for preclearance still valid?", "holding": "No; it rested on decades-old data.", "later": ""}, "shelley": {"key": "shelley", "name": "Shelley v. Kraemer", "year": 1948, "cite": "334 U.S. 1", "vote": "6–0", "clause": "Equal Protection; state action", "area": "race", "q": "May state courts enforce racially restrictive covenants?", "holding": "No; court enforcement is state action that violates equal protection.", "later": ""}, "sherbert": {"key": "sherbert", "name": "Sherbert v. Verner", "year": 1963, "cite": "374 U.S. 398", "vote": "7–2", "clause": "Free Exercise Clause", "area": "religion", "q": "May a state deny unemployment benefits to a worker who would not work on her Sabbath?", "holding": "No; the burden on religion was not justified by a compelling interest.", "later": "Narrowed by Employment Division v. Smith (1990)."}, "slaughterhouse": {"key": "slaughterhouse", "name": "Slaughter-House Cases", "year": 1873, "cite": "83 U.S. 36", "vote": "5–4", "clause": "Fourteenth Amendment (Privileges or Immunities)", "area": "process", "q": "Does a state-granted slaughterhouse monopoly violate the Fourteenth Amendment?", "holding": "No; the Privileges or Immunities Clause protects only rights of national citizenship.", "later": ""}, "smith": {"key": "smith", "name": "Employment Division v. Smith", "year": 1990, "cite": "494 U.S. 872", "vote": "6–3", "clause": "Free Exercise Clause", "area": "religion", "q": "Must a state exempt sacramental peyote use from its drug laws?", "holding": "No; neutral, generally applicable laws need no religious exemption.", "later": "Congress responded with RFRA (1993)."}, "strickland": {"key": "strickland", "name": "Strickland v. Washington", "year": 1984, "cite": "466 U.S. 668", "vote": "8–1", "clause": "Sixth Amendment", "area": "crim", "q": "When is a lawyer's help so poor that a conviction must be set aside?", "holding": "When performance was deficient and the deficiency prejudiced the defense.", "later": ""}, "sullivan": {"key": "sullivan", "name": "New York Times Co. v. Sullivan", "year": 1964, "cite": "376 U.S. 254", "vote": "9–0", "clause": "First Amendment", "area": "press", "q": "What must a public official prove to win a libel suit about his official conduct?", "holding": "Actual malice: that the statement was made knowing it was false or with reckless disregard of whether it was false.", "later": ""}, "sweatt": {"key": "sweatt", "name": "Sweatt v. Painter", "year": 1950, "cite": "339 U.S. 629", "vote": "9–0", "clause": "Equal Protection", "area": "race", "q": "Was a separate law school for Black students equal to the University of Texas Law School?", "holding": "No; Sweatt had to be admitted to the University of Texas.", "later": ""}, "terry": {"key": "terry", "name": "Terry v. Ohio", "year": 1968, "cite": "392 U.S. 1", "vote": "8–1", "clause": "Fourth Amendment", "area": "crim", "q": "May police briefly stop and frisk someone without probable cause?", "holding": "Yes, with reasonable suspicion of crime and that the person is armed and dangerous.", "later": ""}, "timbs": {"key": "timbs", "name": "Timbs v. Indiana", "year": 2019, "cite": "586 U.S. 146", "vote": "9–0", "clause": "Eighth and Fourteenth Amendments", "area": "crim", "q": "Does the Excessive Fines Clause apply to the states?", "holding": "Yes.", "later": ""}, "tinker": {"key": "tinker", "name": "Tinker v. Des Moines Independent Community School District", "year": 1969, "cite": "393 U.S. 503", "vote": "7–2", "clause": "First Amendment", "area": "speech", "q": "May a school punish students for wearing black armbands protesting the Vietnam War?", "holding": "No; students keep free speech rights unless the speech would materially and substantially disrupt school.", "later": ""}, "vmi": {"key": "vmi", "name": "United States v. Virginia", "year": 1996, "cite": "518 U.S. 515", "vote": "7–1", "clause": "Equal Protection", "area": "sex", "q": "May the Virginia Military Institute admit only men?", "holding": "No; Virginia showed no \"exceedingly persuasive justification.\"", "later": ""}, "ward": {"key": "ward", "name": "Ward v. Rock Against Racism", "year": 1989, "cite": "491 U.S. 781", "vote": "6–3", "clause": "First Amendment", "area": "speech", "q": "May a city require concerts in a park to use its sound system and technician?", "holding": "Yes; a content-neutral time, place and manner rule need not be the least restrictive means.", "later": ""}, "washingtondavis": {"key": "washingtondavis", "name": "Washington v. Davis", "year": 1976, "cite": "426 U.S. 229", "vote": "7–2", "clause": "Equal Protection", "area": "equal", "q": "Does a test that more Black applicants failed violate equal protection without proof of discriminatory purpose?", "holding": "No; a disparate impact alone is not enough under the Constitution.", "later": ""}, "westcoast": {"key": "westcoast", "name": "West Coast Hotel Co. v. Parrish", "year": 1937, "cite": "300 U.S. 379", "vote": "5–4", "clause": "Due Process", "area": "process", "q": "Is a state minimum wage law for women valid?", "holding": "Yes; Adkins v. Children's Hospital (1923) was overruled.", "later": "Ended the Lochner era."}, "yickwo": {"key": "yickwo", "name": "Yick Wo v. Hopkins", "year": 1886, "cite": "118 U.S. 356", "vote": "9–0", "clause": "Equal Protection", "area": "equal", "q": "Does a law fair on its face violate equal protection if officials apply it to discriminate?", "holding": "Yes; San Francisco's permit rule was enforced against Chinese laundry owners.", "later": ""}, "yoder": {"key": "yoder", "name": "Wisconsin v. Yoder", "year": 1972, "cite": "406 U.S. 205", "vote": "", "clause": "Free Exercise Clause", "area": "religion", "q": "Must Amish parents send their children to school after eighth grade?", "holding": "No; the state's interest did not outweigh the burden on their religious practice.", "later": ""}, "zelman": {"key": "zelman", "name": "Zelman v. Simmons-Harris", "year": 2002, "cite": "536 U.S. 639", "vote": "5–4", "clause": "Establishment Clause", "area": "religion", "q": "Is a voucher program that parents can use at religious schools valid?", "holding": "Yes; aid reached religious schools only through parents' independent choices.", "later": ""}};
  var LET = 'ABCDEFGH';
  // a case record from the ladder model or from this course's extra table
  function cs(k) {
    var m = ML.civics && ML.civics.CASES && ML.civics.CASES[k];
    if (m) return m;
    if (SNAP[k]) return SNAP[k];
    var a = EXTRA[k]; if (!a) throw new Error('conlaw2: unknown case ' + k);
    return { key: k, name: a[0], year: a[1], cite: a[2], vote: a[3], clause: a[4], area: a[5], q: a[6], holding: a[7], later: a[8] };
  }
  function nm(k) { return cs(k).name; }
  function ny(k) { var c = cs(k); return c.name + ' (' + c.year + ')'; }
  function it(k) { return '<i>' + cs(k).name + '</i>'; }
  function ity(k) { var c = cs(k); return '<i>' + c.name + '</i> (' + c.year + ')'; }
  // a case card for a problem: model id when available, else its fields; the name is hidden in quiet mode
  function card(k, hide) {
    var c = cs(k), o = { quiet: true, interactive: false, hide: hide || ['name'] };
    if (ML.civics && ML.civics.CASES && ML.civics.CASES[k]) o.id = k;
    else { o.name = c.name; o.year = c.year; o.clause = c.clause; o.q = c.q; o.holding = c.holding; if (c.vote) o.vote = c.vote; }
    return { name: 'cv-case', opts: o };
  }
  function orderItem(R, it0) {
    var n = it0.order.length, start = R.shuffle(it0.order.map(function (x, i) { return i; }));
    if (start.every(function (v, i) { return v === i; })) start.reverse();
    var ans = '';
    for (var k = 0; k < n; k++) ans += LET.charAt(start.indexOf(k));
    return {
      q: it0.q + ' Type the letters in the right order.',
      a: { t: 'text', v: [ans, ans.split('').join(' '), ans.split('').join(','), ans.split('').join(', '), ans.split('').join('-')] },
      viz: { name: 'cv-order', opts: { items: it0.order, start: start, quiet: true, interactive: false } },
      steps: [it0.why, 'In order: ' + it0.order.map(function (t, k) { return LET.charAt(start.indexOf(k)) + ' (' + t + ')'; }).join(', then ') + '. So the answer is ' + ans + '.']
    };
  }
  // ---- widen_civ2: questions about a topic's cases, from the kit's case table (MathLadder.civics.CASES; this file's XC if any)
  var TRB_SKIP = ['clintonjones', 'clintonny', 'bushgore', 'boumediene', 'nixonus', 'roe', 'casey', 'bakke', 'grutter', 'gratz', 'chevron', 'lemon'];
  function TRBcase(R, lv, keys) {
    var C = (ML.civics && ML.civics.CASES) || {}, X = typeof XC !== 'undefined' ? XC : typeof EXTRA !== 'undefined' ? EXTRA : {};
    function get(k) { if (TRB_SKIP.indexOf(k) >= 0) return null; if (typeof cs === 'function') { try { var z = cs(k); if (z) return z; } catch (e) { } } return C[k] || null; }
    function ny2(k) { var c = get(k); return c.name + ' (' + c.year + ')'; }
    var ok = keys.filter(function (k) { var c = get(k); return c && c.year <= 2020; });
    var k = R.pick(ok), c = get(k), kinds = ['year', 'year'];
    if (c.q) kinds.push('which', 'which');
    if (c.holding && c.holding.length > 30 && lv >= 2) kinds.push('holding');
    var kind = R.pick(kinds), all = Object.keys(C).concat(Object.keys(X)).filter(function (x) { var z = get(x); return x !== k && z && z.year <= 2020; });
    var near = function (list) { var seen = {}; return list.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); };
    if (kind === 'year') {
      var ys = near(all.map(function (x) { return String(get(x).year); }).filter(function (y) { return Math.abs(y - c.year) >= 3; }));
      ys.sort(function (a, b) { return Math.abs(a - c.year) - Math.abs(b - c.year) || a - b; });
      return { q: 'In what year was <i>' + c.name + '</i> decided?', a: String(c.year), w: ys.slice(0, 6), why: c.name + ' was decided in ' + c.year + (c.holding ? '. Holding: ' + c.holding : '.') };
    }
    var pool = near(keys.filter(function (x) { return x !== k && get(x) && get(x).year <= 2020; }).concat(all.filter(function (x) { return c.area && get(x).area === c.area; })).concat(all));
    if (kind === 'which') {
      var names = pool.filter(function (x) { return get(x).q !== c.q; }).slice(0, 6).map(ny2);
      return { q: 'Which case asked this question? “' + c.q + '”', a: ny2(k), w: names, why: ny2(k) + ': ' + c.holding };
    }
    var hs = near(pool.filter(function (x) { var h = get(x).holding; return h && h.length > 30 && h !== c.holding; }).map(function (x) { return get(x).holding; })).slice(0, 5);
    return { q: 'What did <i>' + c.name + '</i> (' + c.year + ') hold?', a: c.holding, w: hs, why: ny2(k) + ': ' + c.holding };
  }
  function fromBank(bank, hint) {
    return function (R, ctx) {
      var lv = ctx.level || 1, pool = bank.filter(function (x) { return x.L.indexOf(lv) >= 0; });
      if (!pool.length) pool = bank;
      var it0 = R.pick(pool); if (it0.gen) it0 = Object.assign({ L: it0.L }, it0.gen(R, lv));
      var p = { q: it0.q, steps: [it0.why].concat(it0.steps || []), hint: it0.hint || hint || 'Think back to the key idea of the lesson.' };
      if (it0.viz) p.viz = typeof it0.viz === 'function' ? it0.viz(R) : it0.viz;
      if (it0.order) { var o = orderItem(R, it0); p.q = o.q; p.a = o.a; p.viz = o.viz; p.steps = o.steps; return p; }
      if (it0.tf != null) { p.a = { t: 'tf', v: it0.tf }; p.q = it0.q + ' True or false?'; return p; }
      if (it0.num != null) { p.a = { t: 'num', v: String(it0.num), form: 'int' }; if (it0.unit) p.unit = it0.unit; return p; }
      if (it0.text) { p.a = { t: 'text', v: it0.text }; return p; }
      if (it0.all) {
        var opts = R.shuffle(it0.all.slice()), v = []; opts.forEach(function (o2, i) { if (o2[1]) v.push(i); });
        p.q = it0.q + ' Choose all that are true.'; p.a = { t: 'mc', choices: opts.map(function (o2) { return o2[0]; }), v: v, keep: true }; return p;
      }
      var n = lv === 1 ? 2 : 3, wrong = R.sample(it0.w.filter(function (x) { return x !== it0.a; }), M.min(n, it0.w.length)), ch = R.shuffle([it0.a].concat(wrong));
      p.a = { t: 'mc', choices: ch, v: ch.indexOf(it0.a), keep: true };
      return p;
    };
  }
  // ---- items made from the case table
  // which case decided this question this way? (the right case and others from the pool)
  function whichCase(keys, pool, L) {
    return { L: L || [1, 2, 3], gen: function (R, lv) {
      var k = R.pick(keys), c = cs(k), others = (pool || keys).filter(function (x) { return x !== k && cs(x).name !== c.name; });
      return { q: 'Which case decided this? <b>Question:</b> ' + c.q + ' <b>Holding:</b> ' + c.holding, a: ny(k), w: others.map(ny),
        why: ny(k) + ': ' + c.holding, hint: 'Match the facts in the question to the case you studied.' };
    } };
  }
  // the year a case was decided (typed)
  function yearOf(keys, L) {
    return { L: L || [2, 3], gen: function (R) {
      var k = R.pick(keys), c = cs(k);
      return { q: 'In what year did the Supreme Court decide <i>' + c.name + '</i>?', num: c.year, why: ity(k) + '.', hint: 'Think of where it falls in the unit\'s time line.' };
    } };
  }
  // put cases in order (distinct years)
  function orderCases(keys, n, L) {
    return { L: L || [3], gen: function (R) {
      var pool = R.shuffle(keys.slice()), pick = [], years = {};
      pool.forEach(function (k) { var y = cs(k).year; if (pick.length < n && !years[y]) { years[y] = 1; pick.push(k); } });
      pick.sort(function (a, b) { return cs(a).year - cs(b).year; });
      return { q: 'Put these cases in the order they were decided, earliest first.', order: pick.map(nm), why: pick.map(ity).join(', ') + '.' };
    } };
  }
  // which case is on this card (name hidden)
  function cardCase(keys, pool, L) {
    return { L: L || [2, 3], gen: function (R) {
      var k = R.pick(keys), others = (pool || keys).filter(function (x) { return x !== k && nm(x) !== nm(k); });
      return { q: 'The case card below hides the case name. Which case is it?', viz: card(k), a: ny(k), w: others.map(ny), why: ny(k) + ': ' + cs(k).holding };
    } };
  }

  /* ======================================================== Unit 1: Rights and the States */
  var U1 = ['barron', 'slaughterhouse', 'cbq', 'gitlow', 'palko', 'adamson', 'duncan', 'mcdonald', 'timbs', 'ramos', 'civilrightscases', 'marsh', 'shelley', 'burton', 'jacksonme', 'rendellbaker', 'halleck', 'saenz'];
  G('conlaw2.barron', fromBank([
    { L: [1, 2], q: 'In <i>Barron v. Baltimore</i> (1833), which government did the Court say the Bill of Rights limits?', a: 'only the federal government', w: ['only the states', 'both the federal government and the states', 'only cities and counties'], why: 'Chief Justice Marshall held that the Bill of Rights limits only the federal government.' },
    { L: [1, 2], q: 'Which clause did John Barron rely on when he sued Baltimore over his wharf?', a: 'the Fifth Amendment\'s Takings Clause', w: ['the First Amendment', 'the Equal Protection Clause', 'the Commerce Clause'], why: 'He claimed his property was taken for public use without just compensation.' },
    { L: [1, 2], q: 'Who wrote the opinion of the Court in <i>Barron v. Baltimore</i>?', a: 'Chief Justice John Marshall', w: ['Justice Joseph Story', 'Chief Justice Roger Taney', 'Justice Oliver Wendell Holmes'], why: 'Marshall wrote for a unanimous Court in 1833.' },
    { L: [1, 2, 3], q: 'Barron said that before the Fourteenth Amendment, people looked to their state constitutions for protection against their own states.', tf: true, why: 'Each state had its own constitution and bill of rights; the federal Bill of Rights did not reach the states.' },
    { L: [2, 3], q: 'Marshall pointed to one part of the Constitution that limits the states by name. Which?', a: 'Article I, Section 10 ("No State shall…")', w: ['Article I, Section 9', 'the First Amendment', 'Article III, Section 2'], why: 'Section 10 names the states; Section 9 and the Bill of Rights do not.' },
    { L: [2, 3], q: 'In 1840 a state closes a newspaper for criticizing the governor. Under Barron, what federal constitutional claim did the editor have?', a: 'none; he had to rely on the state constitution', w: ['a First Amendment claim in federal court', 'a Fourteenth Amendment claim', 'a Takings Clause claim'], why: 'In 1840 the First Amendment did not limit states, and the Fourteenth Amendment did not exist until 1868.' },
    { L: [2, 3], q: 'In what year was the Fourteenth Amendment ratified?', num: 1868, why: 'It was ratified in 1868, after the Civil War.' },
    { L: [2, 3], q: 'Which case applied the Takings Clause\'s just compensation requirement to the states through the Fourteenth Amendment?', a: ny('cbq'), w: [ny('barron'), ny('gitlow'), ny('slaughterhouse')], why: 'Chicago, Burlington & Quincy Railroad Co. v. Chicago (1897) is often counted as the first incorporation case.' },
    { L: [3], q: 'About Barron v. Baltimore:', all: [['It was decided in 1833', true], ['It held the Bill of Rights limits only the federal government', true], ['It rested on the Fourteenth Amendment', false], ['Its rule that the Bill of Rights by its own force binds only the federal government is still accurate', true]], why: 'States are bound today through the Fourteenth Amendment, not by the Bill of Rights directly.' },
    { L: [3], q: 'Put these in order.', order: ['The Bill of Rights is ratified', 'Barron v. Baltimore', 'The Fourteenth Amendment is ratified', 'Gitlow v. New York assumes free speech binds the states'], why: '1791, 1833, 1868, 1925.' },
    { L: [3], q: 'A student says: "The First Amendment has bound the states since 1791." True?', tf: false, why: 'Under Barron it bound only Congress until incorporation; Gitlow (1925) assumed free speech binds the states.' }
  ], 'Ask which government the right limits, and when.'));

  G('conlaw2.slaughter-house', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['slaughterhouse', 'saenz', 'mcdonald', 'duncan']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['slaughterhouse', 'saenz', 'mcdonald', 'duncan']); } },
    { L: [1, 2], q: 'Which clause did the Slaughter-House Cases (1873) read narrowly?', a: 'the Fourteenth Amendment\'s Privileges or Immunities Clause', w: ['the Due Process Clause', 'the Equal Protection Clause', 'the Commerce Clause'], why: 'The Court said it protects only rights of national citizenship.' },
    { L: [1, 2], q: 'What was the vote in the Slaughter-House Cases?', a: '5 to 4', w: ['9 to 0', '7 to 2', '6 to 3'], why: 'A 5 to 4 decision by Justice Miller.' },
    { L: [1, 2, 3], q: 'The Slaughter-House majority said the clause protects rights such as access to the seaports and protection on the high seas.', tf: true, why: 'Justice Miller listed rights that owe their existence to the national government.' },
    { L: [2, 3], q: 'Which clause protects citizens of one state from discrimination by another state?', a: 'Article IV\'s Privileges and Immunities Clause', w: ['the Fourteenth Amendment\'s Privileges or Immunities Clause', 'the Citizenship Clause', 'the Supremacy Clause'], why: 'Article IV, Section 2 concerns treatment of out-of-state citizens.' },
    { L: [2, 3], q: 'Which modern case rested on the Fourteenth Amendment\'s Privileges or Immunities Clause to protect a new resident\'s right to equal benefits?', a: ny('saenz'), w: [ny('mcdonald'), ny('shapiro'), ny('duncan')], why: 'Saenz v. Roe (1999) is a rare modern case resting on the clause.' },
    { L: [2, 3], q: 'Who wrote the main dissent in the Slaughter-House Cases, arguing the clause protects the right to pursue a lawful calling?', a: 'Justice Field', w: ['Justice Miller', 'Justice Harlan', 'Chief Justice Marshall'], why: 'Justice Field, joined by three others; Justices Bradley and Swayne also wrote.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A state charges nonresidents ten times more for a commercial fishing license', 'Article IV\'s Privileges and Immunities Clause'], ['A state bars citizens of other states from working as lawyers in its courts', 'Article IV\'s Privileges and Immunities Clause'], ['A state pays new residents only their old state\'s welfare benefits for a year', 'the Fourteenth Amendment\'s Privileges or Immunities Clause']]);
      return { q: c[0] + '. Which clause is the natural claim?', a: c[1], w: ['Article IV\'s Privileges and Immunities Clause', 'the Fourteenth Amendment\'s Privileges or Immunities Clause', 'the Takings Clause'].filter(function (x) { return x !== c[1]; }), why: 'Article IV protects out-of-staters from discrimination; the Fourteenth Amendment clause protects rights of national citizenship, including a new resident\'s right to equal treatment (Saenz).' };
    } },
    { L: [3], q: 'About the Slaughter-House Cases:', all: [['They involved a state-granted slaughterhouse monopoly in New Orleans', true], ['The majority read the Privileges or Immunities Clause narrowly', true], ['They incorporated the Bill of Rights', false], ['Later Courts turned to the Due Process Clause to protect rights against states', true]], why: 'The narrow reading left the clause largely unused; incorporation came through due process.' },
    { L: [3], q: 'Since the Slaughter-House Cases, the Privileges or Immunities Clause has been the Court\'s main tool for applying the Bill of Rights to the states.', tf: false, why: 'The Court has used the Due Process Clause instead; only Justice Thomas in McDonald would have used Privileges or Immunities.' }
  ], 'Two clauses share a name: "and" in Article IV, "or" in the Fourteenth Amendment.'));

  G('conlaw2.incorporation', fromBank([
    { L: [1, 2], q: 'Through which clause has the Court applied most Bill of Rights guarantees to the states?', a: 'the Fourteenth Amendment\'s Due Process Clause', w: ['the Privileges or Immunities Clause', 'the Supremacy Clause', 'the Tenth Amendment'], why: 'Selective incorporation runs through the Due Process Clause.' },
    { L: [1, 2], q: 'Which justice argued in Adamson v. California (1947) that the Fourteenth Amendment applies the whole Bill of Rights to the states?', a: 'Justice Black', w: ['Justice Cardozo', 'Justice Frankfurter', 'Chief Justice Warren'], why: 'Black\'s dissent argued for total incorporation.' },
    { L: [1, 2], q: 'Which case asked whether a right is "implicit in the concept of ordered liberty"?', a: ny('palko'), w: [ny('mapp'), ny('mcdonald'), ny('ramos')], why: 'Justice Cardozo\'s phrase in Palko (1937).' },
    { L: [2, 3], q: 'In McDonald v. Chicago, which clause did Justice Thomas prefer for incorporating the Second Amendment?', a: 'the Privileges or Immunities Clause', w: ['the Due Process Clause', 'the Equal Protection Clause', 'the Ninth Amendment'], why: 'The plurality used due process; Thomas, concurring, used Privileges or Immunities.' },
    { L: [2, 3], q: 'Which of these Bill of Rights guarantees has NOT been applied to the states?', a: 'the Fifth Amendment\'s grand jury requirement', w: ['the right to counsel', 'the Excessive Fines Clause', 'the right to keep and bear arms'], why: 'Grand jury indictment and the Seventh Amendment civil jury do not bind the states.' },
    { L: [2, 3], q: 'Under selective incorporation, does an incorporated right mean the same thing against a state as against the federal government?', a: 'yes, the same content', w: ['no, a weaker version applies to states', 'only for First Amendment rights', 'only if Congress says so'], why: 'McDonald and Ramos confirmed that incorporated rights apply with the same content.' },
    whichCase(['mapp', 'gideon', 'mcdonald', 'timbs', 'ramos', 'duncan'], null, [2, 3]),
    yearOf(['gitlow', 'mapp', 'gideon', 'duncan', 'mcdonald', 'timbs', 'ramos'], [3]),
    orderCases(['gitlow', 'palko', 'mapp', 'gideon', 'duncan', 'mcdonald', 'timbs', 'ramos'], 4),
    { L: [3], q: 'About incorporation:', all: [['Ramos v. Louisiana (2020) required unanimous state felony juries', true], ['Timbs v. Indiana (2019) incorporated the Excessive Fines Clause', true], ['The Seventh Amendment civil jury right binds the states', false], ['Palko v. Connecticut was overruled by Benton v. Maryland (1969)', true]], why: 'Benton applied double jeopardy to the states; the Seventh Amendment is not incorporated.' }
  ], 'Selective incorporation: due process, one right at a time.'));

  G('conlaw2.state-action', fromBank([
    { L: [1, 2], q: 'Which case held that the Fourteenth Amendment limits states, not private businesses, and struck down parts of the Civil Rights Act of 1875?', a: ny('civilrightscases'), w: [ny('shelley'), ny('marsh'), ny('brown')], why: 'The Civil Rights Cases (1883), 8 to 1.' },
    { L: [1, 2], q: 'In <i>Marsh v. Alabama</i> (1946), why was a private company bound by the First Amendment?', a: 'it owned and ran a whole town, a public function', w: ['it received a state license', 'it was heavily regulated', 'its owner was a public official'], why: 'Running a town\'s streets is a traditional public function.' },
    { L: [1, 2], q: 'In <i>Shelley v. Kraemer</i> (1948), what was the state action?', a: 'state courts enforcing racially restrictive covenants', w: ['a state law requiring the covenants', 'a city zoning map', 'a private sale of land'], why: 'Judicial enforcement of the private covenants was state action.' },
    { L: [2, 3], q: 'Which case found state action because a restaurant leasing space in a public parking garage was entangled with the state?', a: ny('burton'), w: [ny('jacksonme'), ny('marsh'), ny('rendellbaker')], why: 'Burton v. Wilmington Parking Authority (1961): a symbiotic relationship.' },
    { L: [2, 3], q: 'A heavily regulated private utility with a state-granted monopoly cuts off a customer. Under <i>Jackson v. Metropolitan Edison</i>, is that state action?', a: 'no; regulation and a monopoly are not enough', w: ['yes; heavy regulation makes it the state', 'yes; any licensed business is a state actor', 'only if the state owns stock'], why: 'Jackson (1974): regulation alone does not make a private business a state actor.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A private gym with a state license cancels a member over his T-shirt', false, 'Licensing and regulation are not enough (Jackson).'], ['A company that owns every street in its town bans leafleting on sidewalks', true, 'Marsh v. Alabama: a public function.'], ['A private school paid almost entirely with public money fires a teacher', false, 'Rendell-Baker v. Kohn (1982).'], ['A state court enforces a racially restrictive covenant', true, 'Shelley v. Kraemer (1948).'], ['A private nonprofit running public-access cable channels removes a program', false, 'Manhattan Community Access Corp. v. Halleck (2019).']]);
      return { q: c[0] + '. Is this state action?', a: c[1] ? 'yes' : 'no', w: [c[1] ? 'no' : 'yes', 'only if the person sues in state court'], why: c[2] };
    } },
    cardCase(['civilrightscases', 'marsh', 'shelley', 'burton', 'jacksonme'], null, [2, 3]),
    { L: [3], q: 'Which are recognized routes to finding state action?', all: [['A traditional, exclusive public function', true], ['Court enforcement of private discrimination', true], ['Close entanglement with the state', true], ['Receiving a business license', false], ['Receiving some public money', false]], why: 'Marsh (a public function), Shelley (enforcement), Burton (entanglement); licensing and funding alone are not enough.' },
    { L: [3], q: 'Congress may forbid private businesses to discriminate only through the Fourteenth Amendment.', tf: false, why: 'After the Civil Rights Cases, Congress used the Commerce Clause (Civil Rights Act of 1964).' }
  ], 'Constitutional rights limit the government; look for public function, enforcement or entanglement.'));

  /* ======================================================== Unit 2: Due Process */
  G('conlaw2.procedural-due-process', fromBank([
    { L: [1, 2], q: 'What are the two steps of a procedural due process claim?', a: 'find a protected interest, then decide what process is due', w: ['find a suspect class, then apply strict scrutiny', 'find a search, then ask for a warrant', 'find state action, then apply rational basis'], why: 'First a life, liberty or property interest; then the process due.' },
    { L: [1, 2], q: 'Which case required an evidentiary hearing before welfare benefits are cut off?', a: ny('goldberg'), w: [ny('mathews'), ny('roth'), ny('lochner')], why: 'Goldberg v. Kelly (1970).' },
    { L: [1, 2], q: 'Which case gave the three-factor balancing test for how much process is due?', a: ny('mathews'), w: [ny('goldberg'), ny('roth'), ny('carolene')], why: 'Mathews v. Eldridge (1976).' },
    { L: [2, 3], q: 'Under <i>Roth</i>, a property interest requires…', a: 'a legitimate claim of entitlement under rules or understandings such as state law or a contract', w: ['a strong hope of keeping the benefit', 'any job with the government', 'a showing of financial need'], why: 'Roth (1972): an abstract need or unilateral expectation is not enough.' },
    { L: [2, 3], q: 'Which is NOT one of the Mathews v. Eldridge factors?', a: 'whether the person belongs to a suspect class', w: ['the private interest affected', 'the risk of error and the value of more safeguards', 'the government\'s interest, including costs'], why: 'The three factors: private interest, risk of error, government interest.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A state university fires a tenured professor, removable only "for cause," with no notice', true, 'Tenure rules create a legitimate claim of entitlement.'], ['A city does not rehire a lifeguard whose one-summer contract made no promise of renewal', false, 'Like Roth, only a hope of rehiring.'], ['A state stops a family\'s welfare benefits that they qualify for under the rules', true, 'Goldberg: an entitlement.'], ['A state college does not renew a one-year teacher whose contract and rules gave no right to renewal', false, 'Roth itself.']]);
      return { q: c[0] + '. Is there a protected property interest?', a: c[1] ? 'yes' : 'no', w: [c[1] ? 'no' : 'yes', 'only if a jury finds one'], why: c[2] };
    } },
    { L: [2, 3], q: 'In <i>Mathews v. Eldridge</i>, did the Court require a hearing before disability benefits ended?', a: 'no; written evidence, a chance to respond and a later hearing were enough', w: ['yes, a full trial-type hearing first', 'yes, a jury trial', 'no process was required at all'], why: 'Mathews (1976) found the existing procedures enough.' },
    { L: [3], q: 'Due process always requires a full trial before the government acts.', tf: false, why: 'The process due is flexible under Mathews; often notice and a chance to respond are enough.' },
    { L: [3], q: 'About procedural due process:', all: [['Property interests come from rules such as state law or contracts', true], ['Goldberg required a hearing before welfare ends', true], ['Mathews weighs three factors', true], ['A one-year teacher with no promise of renewal has a property interest in rehiring', false]], why: 'Roth held he had no such interest.' },
    orderCases(['goldberg', 'roth', 'mathews'], 3)
  ], 'First the interest, then the Mathews balance.'));

  var LOCH = ['holden', 'lochner', 'muller', 'adkins', 'nebbia', 'westcoast'];
  G('conlaw2.lochner-era', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['lochner', 'muller', 'adkins', 'nebbia', 'holden', 'westcoast']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['lochner', 'muller', 'adkins', 'nebbia', 'holden', 'westcoast']); } },
    { L: [1, 2], q: 'What did <i>Lochner v. New York</i> (1905) strike down?', a: 'a maximum-hours law for bakers', w: ['a minimum wage for women', 'a ban on child labor', 'an eight-hour law for miners'], why: 'New York limited bakery employees to 10 hours a day and 60 a week.' },
    { L: [1, 2], q: 'What right did the Lochner majority say the bakers\' hours law violated?', a: 'liberty of contract', w: ['freedom of speech', 'equal protection', 'the right to a jury'], why: 'The majority read "liberty" in the Due Process Clause to include freedom of contract.' },
    { L: [1, 2], q: 'Who wrote that "the Fourteenth Amendment does not enact Mr. Herbert Spencer\'s Social Statics"?', a: 'Justice Holmes, dissenting in Lochner', w: ['Justice Peckham, for the majority in Lochner', 'Justice Brandeis, in Muller', 'Chief Justice Hughes, in West Coast Hotel'], why: 'Holmes\'s dissent.' },
    { L: [2, 3], q: 'Which case UPHELD a ten-hour limit for women in factories and laundries?', a: ny('muller'), w: [ny('lochner'), ny('adkins'), ny('nebbia')], why: 'Muller v. Oregon (1908), unanimously, with the Brandeis brief.' },
    { L: [2, 3], q: 'Which case UPHELD an eight-hour limit for underground miners?', a: ny('holden'), w: [ny('lochner'), ny('adkins'), ny('westcoast')], why: 'Holden v. Hardy (1898).' },
    { L: [2, 3], q: 'Which case struck down a minimum wage for women in the District of Columbia?', a: ny('adkins'), w: [ny('muller'), ny('westcoast'), ny('holden')], why: 'Adkins v. Children\'s Hospital (1923), overruled in 1937.' },
    { L: [2, 3], q: 'What was the vote in <i>Lochner v. New York</i>?', a: '5 to 4', w: ['9 to 0', '7 to 2', '6 to 3'], why: '5 to 4, with dissents by Justices Harlan and Holmes.' },
    whichCase(LOCH.slice(0, 4), LOCH, [2, 3]),
    orderCases(LOCH, 4),
    { L: [3], q: 'During the Lochner era the Court struck down every labor law that came before it.', tf: false, why: 'It upheld many, including Holden (1898) and Muller (1908).' },
    { L: [3], q: 'About the Lochner era:', all: [['The Court asked whether a law truly protected health or safety', true], ['Holmes argued the Constitution does not adopt a particular economic theory', true], ['Muller v. Oregon struck down an hours law', false], ['Adkins struck down a minimum wage for women', true]], why: 'Muller upheld the law.' }
  ], 'Was the law seen as a real health measure, or as shifting bargaining power?'));

  G('conlaw2.end-of-lochner', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['westcoast', 'nebbia', 'carolene', 'leeoptical']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['westcoast', 'nebbia', 'carolene', 'leeoptical']); } },
    { L: [1, 2], q: 'Which 1937 case overruled Adkins and upheld a state minimum wage for women?', a: ny('westcoast'), w: [ny('nebbia'), ny('lochner'), ny('carolene')], why: 'West Coast Hotel Co. v. Parrish (1937), 5 to 4.' },
    { L: [1, 2], q: 'Since 1937, what level of review do ordinary economic regulations get?', a: 'rational basis', w: ['strict scrutiny', 'intermediate scrutiny', 'liberty of contract review'], why: 'Economic laws are presumed valid if any rational basis supports them.' },
    { L: [1, 2], q: 'Which case upheld New York\'s fixed retail price for milk?', a: ny('nebbia'), w: [ny('westcoast'), ny('leeoptical'), ny('lochner')], why: 'Nebbia v. New York (1934).' },
    { L: [2, 3], q: 'Which case\'s footnote four suggested closer review for laws aimed at "discrete and insular minorities"?', a: ny('carolene'), w: [ny('nebbia'), ny('westcoast'), ny('leeoptical')], why: 'United States v. Carolene Products (1938).' },
    { L: [2, 3], q: 'Which is one of the three kinds of laws footnote four said might get closer review?', a: 'laws restricting the political processes that could repeal bad laws', w: ['laws regulating milk prices', 'laws setting minimum wages', 'laws licensing opticians'], why: 'Also laws within specific Bill of Rights prohibitions, and laws aimed at discrete and insular minorities.' },
    { L: [2, 3], q: 'Which case upheld a law favoring eye doctors over opticians because the legislature "might have" had a reason?', a: ny('leeoptical'), w: [ny('carolene'), ny('nebbia'), ny('lochner')], why: 'Williamson v. Lee Optical (1955).' },
    { L: [2, 3], q: 'A state requires a license to arrange flowers for pay. A florist challenges it under due process. Who bears the burden under rational basis?', a: 'the challenger, who must negate every conceivable reason', w: ['the state, which must show a compelling interest', 'the state, which must show an important interest', 'neither; courts do not hear such claims'], why: 'Rational basis puts the burden on the challenger.' },
    { L: [3], q: 'Substantive due process ended entirely in 1937.', tf: false, why: 'Its economic branch receded; its protection of personal and family rights continued and grew.' },
    orderCases(['lochner', 'adkins', 'nebbia', 'westcoast', 'carolene', 'leeoptical'], 4),
    { L: [3], q: 'About the end of the Lochner era:', all: [['West Coast Hotel overruled Adkins', true], ['Nebbia came before West Coast Hotel', true], ['After 1937 the Court reviewed economic laws under strict scrutiny', false], ['Footnote four is the seed of the tiers of scrutiny', true]], why: 'Economic laws get rational basis.' }
  ], 'After 1937: economic laws get rational basis; personal rights went on.'));

  G('conlaw2.sdp-methods', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['glucksberg', 'griswold', 'lawrence', 'obergefell']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['glucksberg', 'griswold', 'lawrence', 'obergefell']); } },
    { L: [1, 2], q: 'Which case asks for a "careful description" of an asserted right and whether it is deeply rooted in the Nation\'s history and tradition?', a: ny('glucksberg'), w: [ny('obergefell'), ny('griswold'), ny('lochner')], why: 'Washington v. Glucksberg (1997).' },
    { L: [1, 2], q: 'Whose dissent described tradition as "a living thing"?', a: 'Justice Harlan, in Poe v. Ullman (1961)', w: ['Justice Scalia, in Lawrence', 'Chief Justice Rehnquist, in Glucksberg', 'Justice Holmes, in Lochner'], why: 'Harlan\'s Poe dissent.' },
    { L: [1, 2], q: 'Which 2015 case said history and tradition "do not set its outer boundaries"?', a: ny('obergefell'), w: [ny('glucksberg'), ny('lawrence'), ny('casey')], why: 'Obergefell v. Hodges followed the reasoned-judgment approach.' },
    { L: [2, 3], q: 'Which case used the history-and-tradition method to reject a claimed right to assisted suicide?', a: ny('glucksberg'), w: [ny('obergefell'), ny('lawrence'), ny('casey')], why: 'Washington v. Glucksberg (1997).' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['"careful description" of the asserted right', 'history and tradition (Glucksberg)'], ['tradition as "a living thing"', 'reasoned judgment (Harlan, Obergefell)'], ['"deeply rooted in this Nation\'s history and tradition"', 'history and tradition (Glucksberg)'], ['history guides but does not set the outer boundaries', 'reasoned judgment (Harlan, Obergefell)'], ['a "rational continuum" of liberty', 'reasoned judgment (Harlan, Obergefell)']]);
      return { q: 'Which method uses the idea of ' + c[0] + '?', a: c[1], w: ['history and tradition (Glucksberg)', 'reasoned judgment (Harlan, Obergefell)', 'rational basis review'].filter(function (x) { return x !== c[1]; }), why: 'Glucksberg: careful description, deeply rooted. Harlan and Obergefell: reasoned judgment, living tradition.' };
    } },
    { L: [2, 3], q: 'What do critics of the Glucksberg method say?', a: 'a narrow description of the right can decide the case in advance', w: ['it gives judges too much room to declare rights', 'it ignores history', 'it applies only to economic rights'], why: 'Critics of Glucksberg focus on the level of generality; critics of reasoned judgment focus on judicial power.' },
    { L: [2, 3], q: 'What do critics of the reasoned-judgment method say?', a: 'it gives judges too much room to declare rights the people never adopted', w: ['a narrow description of the right decides the case in advance', 'it relies only on economic theory', 'it forbids looking at precedent'], why: 'Each method has serious defenders and critics.' },
    { L: [3], q: 'The Court has settled on one method for all unenumerated rights, and the justices agree on it.', tf: false, why: 'The justices disagree; the Court has used both.' },
    { L: [3], q: 'About the two methods:', all: [['Glucksberg asks whether a right is deeply rooted in history and tradition', true], ['Obergefell declined to apply Glucksberg\'s careful-description step to marriage', true], ['Obergefell relied on Justice Harlan\'s view of a living tradition', true], ['Harlan\'s Poe dissent was the opinion of the Court', false]], why: 'Poe was dismissed; Harlan wrote in dissent.' }
  ], 'Careful description and deep roots, or reasoned judgment from a living tradition?'));

  var FAM = ['meyer', 'pierce', 'griswold', 'moore', 'troxel'];
  G('conlaw2.family-autonomy', fromBank([
    { L: [1, 2], q: 'Which case struck down a law requiring all children to attend public schools?', a: ny('pierce'), w: [ny('meyer'), ny('griswold'), ny('troxel')], why: 'Pierce v. Society of Sisters (1925).' },
    { L: [1, 2], q: 'Which case struck down a ban on teaching foreign languages to young children?', a: ny('meyer'), w: [ny('pierce'), ny('moore'), ny('griswold')], why: 'Meyer v. Nebraska (1923).' },
    { L: [1, 2], q: 'Which case struck down a ban on married couples\' use of contraceptives?', a: ny('griswold'), w: [ny('meyer'), ny('troxel'), ny('lochner')], why: 'Griswold v. Connecticut (1965).' },
    { L: [2, 3], q: 'Where did Justice Douglas\'s majority in Griswold find a right of privacy?', a: 'in the "penumbras" of several Bill of Rights guarantees', w: ['in a clause of the Fourth Amendment that names privacy', 'in the Commerce Clause', 'in the Equal Protection Clause alone'], why: 'Penumbras of the First, Third, Fourth, Fifth and Ninth Amendments; concurrences relied on the Ninth Amendment or due process.' },
    { L: [2, 3], q: 'Which case protected a grandmother living with her two grandsons against a narrow zoning definition of "family"?', a: ny('moore'), w: [ny('troxel'), ny('pierce'), ny('griswold')], why: 'Moore v. City of East Cleveland (1977).' },
    { L: [2, 3], q: 'Which case protected a fit parent\'s decisions about grandparent visits?', a: ny('troxel'), w: [ny('moore'), ny('meyer'), ny('pierce')], why: 'Troxel v. Granville (2000), plurality.' },
    whichCase(FAM, FAM, [2, 3]),
    orderCases(FAM, 4),
    { L: [3], q: 'Griswold rested on a clause of the Constitution that names a right of privacy.', tf: false, why: 'No clause names it; Douglas relied on penumbras, and concurrences on the Ninth Amendment or due process.' },
    { L: [3], q: 'About the family cases:', all: [['Meyer and Pierce were decided during the Lochner era', true], ['Pierce let parents choose private schools', true], ['Justices Black and Stewart dissented in Griswold', true], ['Troxel upheld a court order over a fit parent\'s objection', false]], why: 'Troxel struck the order down as applied.' }
  ], 'Parents, family living together, and marital privacy.'));

  G('conlaw2.abortion-cases', fromBank([
    { L: [1, 2], q: 'Which test did Roe v. Wade (1973) use?', a: 'a trimester framework', w: ['an undue burden test', 'rational basis review', 'the Lemon test'], why: 'Roe: trimesters.' },
    { L: [1, 2], q: 'Which case adopted the "undue burden" test?', a: ny('casey'), w: [ny('roe'), ny('griswold'), ny('glucksberg')], why: 'Planned Parenthood v. Casey (1992).' },
    { L: [1, 2], q: 'What was the vote in Roe v. Wade?', a: '7 to 2', w: ['5 to 4', '9 to 0', '6 to 3'], why: 'Justices White and Rehnquist dissented.' },
    { L: [2, 3], q: 'What did Casey reject from Roe?', a: 'the trimester framework', w: ['Roe\'s central holding', 'the line at viability', 'the idea of stare decisis'], why: 'Casey kept Roe\'s "essential holding" and replaced trimesters with the undue burden test.' },
    { L: [2, 3], q: 'In Casey, what doctrine did the joint opinion rely on heavily in keeping Roe\'s central holding?', a: 'stare decisis (respect for precedent)', w: ['the political question doctrine', 'the Commerce Clause', 'the state action doctrine'], why: 'Justices O\'Connor, Kennedy and Souter stressed stare decisis and reliance.' },
    { L: [2, 3], q: 'Under Casey\'s undue burden test, when was a law invalid?', a: 'when its purpose or effect was to place a substantial obstacle in the path of a woman seeking an abortion before viability', w: ['whenever it regulated abortion at all', 'only if it banned abortion in all three trimesters', 'never, if the state had any rational basis'], why: 'That was the joint opinion\'s definition.' },
    { L: [2, 3], q: 'Which Pennsylvania rule did Casey strike down?', a: 'a spousal notification requirement', w: ['a 24-hour waiting period', 'an informed consent rule', 'a parental consent rule with a court bypass'], why: 'The Court upheld the other rules as not imposing an undue burden.' },
    { L: [1, 2, 3], q: 'Casey\'s undue burden test is still the governing federal constitutional test.', tf: false, why: 'The Court overruled Roe and Casey in 2022.' },
    orderCases(['griswold', 'roe', 'casey', 'glucksberg'], 4),
    { L: [3], q: 'Put these in the order the Court announced them.', order: ['a right of marital privacy', 'the trimester framework', 'the undue burden test'], why: 'Griswold (1965), Roe (1973), Casey (1992).' },
    { L: [3], q: 'About these cases:', all: [['Roe was decided 7 to 2', true], ['Casey kept Roe\'s central holding but rejected the trimester framework', true], ['Casey was decided by a unanimous Court', false], ['Four justices in Casey would have overruled Roe', true]], why: 'Casey was 5 to 4 on keeping Roe\'s central holding.' }
  ], 'Roe: trimesters. Casey: undue burden.'));

  var LIB = ['loving', 'bowers', 'lawrence', 'obergefell', 'cruzan', 'glucksberg'];
  G('conlaw2.liberty-and-marriage', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['loving', 'obergefell', 'griswold', 'lawrence']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['loving', 'obergefell', 'griswold', 'lawrence']); } },
    { L: [1, 2], q: 'Which case struck down Virginia\'s ban on interracial marriage?', a: ny('loving'), w: [ny('obergefell'), ny('griswold'), ny('plessy')], why: 'Loving v. Virginia (1967), unanimously.' },
    { L: [1, 2], q: 'Which case overruled Bowers v. Hardwick?', a: ny('lawrence'), w: [ny('obergefell'), ny('romer'), ny('casey')], why: 'Lawrence v. Texas (2003).' },
    { L: [1, 2], q: 'Did Washington v. Glucksberg find a fundamental right to assisted suicide?', a: 'no; states may ban it, and may also choose to allow it by statute', w: ['yes, a fundamental right', 'yes, but only for the terminally ill', 'the Court did not reach the question'], why: 'Glucksberg (1997) found no such fundamental right.' },
    { L: [2, 3], q: 'What did <i>Cruzan</i> (1990) hold?', a: 'a state may require clear and convincing evidence of a patient\'s wishes before ending life support', w: ['patients have no right to refuse treatment', 'a fundamental right to assisted suicide exists', 'families may always decide for patients'], why: 'The Court assumed a competent person may refuse treatment and upheld Missouri\'s evidence rule.' },
    { L: [2, 3], q: 'Which clauses did Loving v. Virginia rest on?', a: 'both Equal Protection and Due Process', w: ['Equal Protection only', 'the Privileges or Immunities Clause', 'the First Amendment'], why: 'A racial classification and the freedom to marry.' },
    { L: [2, 3], q: 'Which clauses did Obergefell v. Hodges rely on?', a: 'Due Process and Equal Protection', w: ['the Commerce Clause', 'the Full Faith and Credit Clause alone', 'the Ninth Amendment alone'], why: 'Justice Kennedy relied on both clauses of the Fourteenth Amendment.' },
    whichCase(LIB, LIB, [2, 3]),
    yearOf(LIB, [3]),
    orderCases(LIB, 5),
    { L: [3], q: 'About these cases:', all: [['Lawrence overruled Bowers', true], ['Obergefell was decided 5 to 4', true], ['Glucksberg found a fundamental right to assisted suicide', false], ['Cruzan assumed a competent person has a liberty interest in refusing unwanted treatment', true]], why: 'Glucksberg found no such right.' }
  ], 'Name the clause, the test and the holding.'));

  /* ======================================================== Unit 3: Equal Protection */
  var TIERS = ['strict scrutiny', 'intermediate scrutiny', 'rational basis'];
  function tierItem(list, L) {
    return { L: L || [1, 2, 3], gen: function (R) {
      var c = R.pick(list);
      return { q: 'A law ' + c[0] + '. Which tier of review applies?', a: c[1], w: TIERS.filter(function (x) { return x !== c[1]; }).concat(c[1] === 'rational basis' ? [] : ['no review at all']), why: c[2] };
    } };
  }
  var TIERLIST = [
    ['classifies people by race', 'strict scrutiny', 'Race is a suspect class.'],
    ['classifies people by national origin', 'strict scrutiny', 'National origin is a suspect class.'],
    ['passed by a state denies benefits to lawfully present noncitizens', 'strict scrutiny', 'State alienage classifications are usually suspect (Graham v. Richardson).'],
    ['treats men and women differently', 'intermediate scrutiny', 'Sex is quasi-suspect (Craig v. Boren).'],
    ['treats children born outside marriage worse', 'intermediate scrutiny', 'Legitimacy gets intermediate scrutiny.'],
    ['sets a mandatory retirement age', 'rational basis', 'Age is not suspect (Murgia).'],
    ['funds schools from local property taxes, so poorer districts get less', 'rational basis', 'Wealth is not suspect (Rodriguez).'],
    ['treats group homes for people with disabilities differently', 'rational basis', 'Disability gets rational basis (Cleburne).'],
    ['taxes vending machines but not stores', 'rational basis', 'Ordinary economic regulation.'],
    ['gives unequal weight to votes in different districts', 'strict scrutiny', 'Voting is a fundamental right (Reynolds v. Sims).']];

  G('conlaw2.ep-framework', fromBank([
    tierItem(TIERLIST),
    { L: [1, 2], q: 'Which case applied equal protection to the federal government through the Fifth Amendment?', a: ny('bolling'), w: [ny('brown'), ny('adarand'), ny('plessy')], why: 'Bolling v. Sharpe (1954), decided the same day as Brown.' },
    { L: [1, 2], q: 'The Equal Protection Clause\'s words apply to…', a: 'the states', w: ['Congress', 'private businesses', 'only federal courts'], why: '"No State shall… deny to any person… the equal protection of the laws."' },
    { L: [2, 3], q: 'What is the first step of equal protection analysis?', a: 'identify the classification the law makes', w: ['apply strict scrutiny', 'ask whether the law is wise', 'find a search or seizure'], why: 'Identify the classification, pick the tier, apply its test.' },
    { L: [2, 3], q: 'Under strict scrutiny, who bears the burden, and what must be shown?', a: 'the government: a compelling interest and narrow tailoring', w: ['the challenger: no conceivable reason', 'the government: an important interest and a substantial relation', 'the challenger: a legitimate interest'], why: 'Strict scrutiny puts the burden on the government.' },
    { L: [2, 3], q: 'What is the name sometimes given to Bolling\'s use of the Fifth Amendment?', a: 'reverse incorporation', w: ['selective incorporation', 'total incorporation', 'the state action doctrine'], why: 'The Fourteenth Amendment\'s guarantee was read back into the Fifth.' },
    { L: [3], q: 'The Equal Protection Clause forbids all laws that classify people.', tf: false, why: 'Every law draws lines; the clause asks whether a line is justified at the right tier.' },
    { L: [3], q: 'Which are suspect classifications that get strict scrutiny?', all: [['race', true], ['national origin', true], ['state alienage laws (usually)', true], ['sex', false], ['age', false]], why: 'Sex is intermediate; age is rational basis.' }
  ], 'Identify the classification, then the tier.'));

  G('conlaw2.ep-rational-basis', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['railwayexpress', 'cleburne', 'romer', 'rodriguez']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['railwayexpress', 'cleburne', 'romer', 'rodriguez']); } },
    { L: [1, 2], q: 'Under rational basis review, a law is valid if it is…', a: 'rationally related to a legitimate interest', w: ['narrowly tailored to a compelling interest', 'substantially related to an important interest', 'the least restrictive means'], why: 'The most deferential tier.' },
    { L: [1, 2], q: 'Which case upheld a city ban on advertising on delivery trucks except for the owner\'s own business?', a: ny('railwayexpress'), w: [ny('cleburne'), ny('romer'), ny('lochner')], why: 'Railway Express Agency v. New York (1949).' },
    { L: [1, 2], q: 'Which case struck down a city\'s denial of a permit for a group home for people with intellectual disabilities?', a: ny('cleburne'), w: [ny('railwayexpress'), ny('rodriguez'), ny('romer')], why: 'Cleburne (1985): irrational prejudice, under rational basis.' },
    { L: [2, 3], q: 'Which case struck down a Colorado amendment barring laws that protected gay and lesbian people from discrimination?', a: ny('romer'), w: [ny('lawrence'), ny('obergefell'), ny('cleburne')], why: 'Romer v. Evans (1996), under rational basis.' },
    { L: [2, 3], q: 'In Cleburne, what tier did the Court apply to disability?', a: 'rational basis (and the denial still failed)', w: ['intermediate scrutiny', 'strict scrutiny', 'no review'], why: 'The Court declined to make disability quasi-suspect.' },
    { L: [2, 3], q: 'Under rational basis, must the government\'s reason be the one the legislature actually had?', a: 'no; any conceivable legitimate reason is enough', w: ['yes, it must be in the law\'s text', 'yes, it must be in the legislative record', 'only for state laws'], why: 'The challenger must negate every conceivable basis.' },
    { L: [2, 3], q: 'What did USDA v. Moreno (1973) say is not a legitimate government interest?', a: 'a bare desire to harm a politically unpopular group', w: ['saving money', 'reducing traffic', 'protecting public health'], why: 'Moreno, Cleburne and Romer all turned on animus.' },
    { L: [3], q: 'Rational basis review means a law is automatically upheld.', tf: false, why: 'Almost always, but laws resting only on animus have failed (Moreno, Cleburne, Romer).' },
    { L: [3], q: 'About rational basis:', all: [['The challenger bears the burden', true], ['A law may address a problem one step at a time', true], ['Cleburne raised disability to intermediate scrutiny', false], ['Romer struck down a state constitutional amendment', true]], why: 'Cleburne kept rational basis.' },
    orderCases(['railwayexpress', 'leeoptical', 'cleburne', 'romer'], 4)
  ], 'Any conceivable legitimate reason, but not animus.'));

  G('conlaw2.race-strict-scrutiny', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['strauder', 'yickwo', 'batson', 'adarand', 'bolling', 'croson', 'korematsu', 'loving']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['strauder', 'yickwo', 'batson', 'adarand', 'bolling', 'croson', 'korematsu', 'loving']); } },
    { L: [1, 2], q: 'What tier of review applies to racial classifications?', a: 'strict scrutiny', w: ['rational basis', 'intermediate scrutiny', 'no review'], why: 'A compelling interest and narrow tailoring.' },
    { L: [1, 2], q: 'Which 1880 case struck down a law allowing only white men to serve on juries?', a: ny('strauder'), w: [ny('plessy'), ny('yickwo'), ny('batson')], why: 'Strauder v. West Virginia.' },
    { L: [1, 2], q: 'Did the Court in Korematsu v. United States (1944) uphold or strike down the wartime exclusion order?', a: 'upheld it', w: ['struck it down', 'declined to decide', 'sent it back to Congress'], why: 'It upheld the order while saying racial restrictions get the most rigid scrutiny.' },
    { L: [2, 3], q: 'How is <i>Korematsu v. United States</i> (1944) regarded today?', a: 'The Supreme Court has since said it was wrongly decided', w: ['It is still followed as good law', 'Congress overruled it by statute in 1988', 'The Court has never mentioned it again'], why: 'Congress apologized in the Civil Liberties Act of 1988 (an apology, not an overruling), and the Supreme Court has since said Korematsu was wrongly decided.' },
    { L: [2, 3], q: 'In Loving v. Virginia, the state argued its law was valid because it applied to both races equally. What did the Court say?', a: 'equal application does not avoid strict scrutiny', w: ['equal application means rational basis applies', 'the argument was correct', 'marriage is not covered by equal protection'], why: 'The law still classified by race.' },
    { L: [2, 3], q: 'What language did the Korematsu majority use about racial restrictions?', a: '"immediately suspect" and subject to "the most rigid scrutiny"', w: ['"presumed valid"', '"rationally related"', '"substantially related"'], why: 'Justice Black\'s words, though the Court deferred to the military.' },
    { L: [2, 3], q: 'Which 1995 case held that federal racial classifications get the same strict scrutiny as state ones?', a: ny('adarand'), w: [ny('bolling'), ny('croson'), ny('grutter')], why: 'Adarand Constructors v. Peña.' },
    orderCases(['strauder', 'korematsu', 'loving', 'adarand'], 4),
    { L: [3], q: 'Korematsu applied rational basis review.', tf: false, why: 'It stated the most rigid scrutiny and still upheld the order; its fault was deference.' },
    { L: [3], q: 'About race and strict scrutiny:', all: [['Congress apologized for the incarceration in the Civil Liberties Act of 1988', true], ['Strauder struck down all-white juries by law', true], ['Loving rested only on due process', false], ['Strict scrutiny puts the burden on the government', true]], why: 'Loving rested on equal protection and due process.' }
  ], 'Race: strict scrutiny, compelling interest, narrow tailoring.'));

  var PB = ['plessy', 'gaines', 'sweatt', 'mclaurin', 'brown', 'brown2'];
  G('conlaw2.plessy-to-brown', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['plessy', 'brown', 'sweatt', 'gaines', 'mclaurin', 'bolling']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['plessy', 'brown', 'sweatt', 'gaines', 'mclaurin', 'bolling']); } },
    { L: [1, 2], q: 'Which case upheld "separate but equal"?', a: ny('plessy'), w: [ny('brown'), ny('sweatt'), ny('gaines')], why: 'Plessy v. Ferguson (1896).' },
    { L: [1, 2], q: 'What was the vote in Brown v. Board of Education (1954)?', a: '9 to 0', w: ['5 to 4', '7 to 2', '6 to 3'], why: 'Unanimous, led by Chief Justice Warren.' },
    { L: [1, 2], q: 'Who was the only dissenter in Plessy v. Ferguson?', a: 'Justice John Marshall Harlan', w: ['Chief Justice Earl Warren', 'Justice Henry Billings Brown', 'Thurgood Marshall'], why: 'Harlan wrote "Our Constitution is color-blind."' },
    { L: [2, 3], q: 'Brown held that in public education, separate facilities are…', a: '"inherently unequal"', w: ['acceptable if equal', 'unequal only if the buildings differ', 'a matter for each state'], why: '"Separate educational facilities are inherently unequal."' },
    { L: [2, 3], q: 'Which case found a hastily created law school for Black students not equal to the University of Texas Law School?', a: ny('sweatt'), w: [ny('gaines'), ny('mclaurin'), ny('brown')], why: 'Sweatt v. Painter (1950) counted intangibles like reputation.' },
    { L: [2, 3], q: 'What did Brown II (1955) order?', a: 'desegregation "with all deliberate speed"', w: ['immediate desegregation by a set date', 'separate but equal schools', 'nothing; it dismissed the cases'], why: 'Lower courts were to oversee desegregation.' },
    { L: [2, 3], q: 'Which case barred Missouri from sending Black law students to other states instead of admitting them?', a: ny('gaines'), w: [ny('sweatt'), ny('mclaurin'), ny('plessy')], why: 'Missouri ex rel. Gaines v. Canada (1938).' },
    whichCase(PB, PB, [2, 3]),
    orderCases(PB, 5),
    { L: [3], q: 'Brown v. Board of Education by its own terms ended segregation in all public facilities.', tf: false, why: 'Brown addressed public education; later per curiam orders applied it to beaches, buses, parks and more.' },
    { L: [3], q: 'About the road to Brown:', all: [['The NAACP first challenged graduate and law schools', true], ['McLaurin involved a student admitted but seated apart', true], ['Bolling v. Sharpe addressed schools in Washington, D.C.', true], ['Plessy was decided after Sweatt', false]], why: 'Plessy was 1896; Sweatt 1950.' }
  ], 'Plessy upheld separation; the graduate cases showed inequality; Brown ended it in schools.'));

  G('conlaw2.discriminatory-purpose', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['yickwo', 'washingtondavis', 'arlington', 'feeney']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['yickwo', 'washingtondavis', 'arlington', 'feeney']); } },
    { L: [1, 2], q: 'Under Washington v. Davis (1976), is a disparate impact alone enough to violate the Equal Protection Clause?', a: 'no; discriminatory purpose must be shown', w: ['yes, always', 'yes, if the impact is over 50 percent', 'only for federal laws'], why: 'Impact is evidence, not enough by itself.' },
    { L: [1, 2], q: 'Which case struck down the discriminatory enforcement of a San Francisco laundry permit rule?', a: ny('yickwo'), w: [ny('washingtondavis'), ny('strauder'), ny('plessy')], why: 'Yick Wo v. Hopkins (1886).' },
    { L: [1, 2], q: 'Which statute, unlike the Constitution, reaches disparate impact in employment?', a: 'Title VII of the Civil Rights Act of 1964', w: ['the Voting Rights Act\'s Section 5', 'the Religious Freedom Restoration Act', 'the Espionage Act'], why: 'Griggs v. Duke Power (1971) read Title VII to reach impact.' },
    { L: [2, 3], q: 'Which case listed kinds of evidence of discriminatory purpose, such as historical background and departures from normal procedure?', a: ny('arlington'), w: [ny('washingtondavis'), ny('feeney'), ny('yickwo')], why: 'Village of Arlington Heights (1977).' },
    { L: [2, 3], q: 'Feeney (1979) said discriminatory purpose means acting…', a: '"because of," not merely "in spite of," the effect on a group', w: ['with any awareness of the effect', 'carelessly about the effect', 'without a written reason'], why: 'A veterans\' preference that mostly helped men was upheld.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['the sequence of events (a rule changed right after a new group registered)', true], ['departures from normal procedures (skipping the usual hearing)', true], ['statements by decision-makers', true], ['the historical background of the decision', true], ['the fact that the rule is written in neutral words', false]]);
      return { q: 'Is this an Arlington Heights factor that can show discriminatory purpose: ' + c[0] + '?', a: c[1] ? 'yes' : 'no', w: [c[1] ? 'no' : 'yes'], why: 'Arlington Heights listed impact, historical background, sequence of events, departures from normal procedure or standards, and statements of decision-makers.' };
    } },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A city uses a written test that one racial group fails more often; there is no other evidence', 'the constitutional claim fails without proof of purpose'], ['A county applies a neutral permit rule only against one ethnic group\'s businesses', 'it violates equal protection, like Yick Wo'], ['A state adopts a veterans\' preference knowing most veterans are men, but for reasons unrelated to sex', 'it is valid under Feeney']]);
      return { q: c[0] + '. Result under the Equal Protection Clause?', a: c[1], w: ['the constitutional claim fails without proof of purpose', 'it violates equal protection, like Yick Wo', 'it is valid under Feeney', 'strict scrutiny applies automatically'].filter(function (x) { return x !== c[1]; }), why: 'Purpose, not impact alone; discriminatory enforcement counts as purpose.' };
    } },
    { L: [3], q: 'Unequal results by themselves prove a violation of the Equal Protection Clause.', tf: false, why: 'Purpose must be shown under the Constitution.' },
    orderCases(['yickwo', 'washingtondavis', 'arlington', 'feeney'], 4)
  ], 'Constitution: purpose. Some statutes: impact.'));

  var AA = ['bakke', 'croson', 'adarand', 'grutter', 'gratz'];
  G('conlaw2.affirmative-action', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['croson', 'adarand']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['croson', 'adarand']); } },
    { L: [1, 2], q: 'Which case barred fixed racial quotas in admissions but allowed race as one factor (in Justice Powell\'s controlling opinion)?', a: ny('bakke'), w: [ny('grutter'), ny('croson'), ny('gratz')], why: 'Regents of the University of California v. Bakke (1978).' },
    { L: [1, 2], q: 'Which case held that federal racial classifications, like state ones, get strict scrutiny?', a: ny('adarand'), w: [ny('grutter'), ny('bakke'), ny('gratz')], why: 'Adarand Constructors v. Peña (1995): "consistency."' },
    { L: [1, 2], q: 'What tier applies to racial classifications meant to help, such as set-asides?', a: 'strict scrutiny', w: ['intermediate scrutiny', 'rational basis', 'no review'], why: 'Croson (state and local) and Adarand (federal).' },
    { L: [2, 3], q: 'Which case upheld Michigan Law School\'s holistic program in 2003?', a: ny('grutter'), w: [ny('gratz'), ny('bakke'), ny('croson')], why: 'Grutter v. Bollinger, 5 to 4. The Court rejected race-conscious admissions programs in 2023.' },
    { L: [2, 3], q: 'Which case struck down a point system giving 20 points for race?', a: ny('gratz'), w: [ny('grutter'), ny('croson'), ny('bakke')], why: 'Gratz v. Bollinger (2003).' },
    { L: [2, 3], q: 'Which case struck down Richmond\'s set-aside of a share of city construction subcontracts for minority-owned businesses?', a: ny('croson'), w: [ny('adarand'), ny('bakke'), ny('washingtondavis')], why: 'City of Richmond v. J. A. Croson Co. (1989).' },
    { L: [2, 3], q: 'Which is one argument the Grutter dissenters made?', a: 'the program had no measurable goals or logical end point and sorted people by race', w: ['diversity can never matter to education', 'law schools may not consider anything but grades', 'the Equal Protection Clause does not apply to public universities'], why: 'Chief Justice Rehnquist and Justices Scalia, Kennedy and Thomas dissented.' },
    { L: [2, 3], q: 'In Justice Powell\'s controlling opinion in Bakke, what interest could justify considering race in admissions?', a: 'the educational benefits of a diverse student body', w: ['remedying general societal discrimination', 'balancing the class by fixed quotas', 'none at all'], why: 'Powell accepted diversity but rejected quotas and remedying general societal discrimination.' },
    orderCases(AA, 5),
    { L: [3], q: 'About these cases:', all: [['Grutter expected preferences would not be needed in 25 years', true], ['Adarand applied strict scrutiny to federal programs', true], ['Gratz upheld automatic points for race', false], ['Grutter and Gratz were decided on the same day', true]], why: 'Gratz struck down the point system.' }
  ], 'All racial classifications get strict scrutiny; know each holding.'));

  var SEX = ['reed', 'frontiero', 'craig', 'vmi'];
  G('conlaw2.sex-discrimination', fromBank([
    { L: [1, 2], q: 'What tier applies to classifications by sex?', a: 'intermediate scrutiny', w: ['strict scrutiny', 'rational basis', 'no review'], why: 'Craig v. Boren (1976).' },
    { L: [1, 2], q: 'Which case set intermediate scrutiny in a dispute over the age for buying 3.2 percent beer?', a: ny('craig'), w: [ny('reed'), ny('frontiero'), ny('vmi')], why: 'Craig v. Boren (1976).' },
    { L: [1, 2], q: 'Which case required an "exceedingly persuasive justification" and opened the Virginia Military Institute to women?', a: ny('vmi'), w: [ny('craig'), ny('reed'), ny('frontiero')], why: 'United States v. Virginia (1996).' },
    { L: [2, 3], q: 'How many justices in Frontiero v. Richardson (1973) would have applied strict scrutiny to sex classifications?', a: 'four (a plurality)', w: ['five (a majority)', 'nine', 'none'], why: 'One vote short of a majority.' },
    { L: [2, 3], q: 'Which case first struck down a law for sex discrimination under the Equal Protection Clause, a preference for men as estate administrators?', a: ny('reed'), w: [ny('craig'), ny('frontiero'), ny('vmi')], why: 'Reed v. Reed (1971).' },
    { L: [2, 3], q: 'Intermediate scrutiny asks whether a law…', a: 'serves an important objective and is substantially related to it', w: ['serves a compelling interest by the least restrictive means', 'is rationally related to a legitimate interest', 'fits historical tradition'], why: 'Craig\'s formulation, sharpened in United States v. Virginia.' },
    { L: [2, 3], q: 'Does intermediate scrutiny protect men as well as women?', a: 'yes; Craig and Mississippi University for Women v. Hogan involved men', w: ['no, only women', 'only in employment', 'only after 1996'], why: 'The clause protects any person.' },
    whichCase(SEX, SEX, [2, 3]),
    orderCases(SEX, 4),
    { L: [3], q: 'Sex classifications get strict scrutiny because of Frontiero v. Richardson.', tf: false, why: 'Frontiero\'s call for strict scrutiny drew only four votes; the standard is intermediate.' }
  ], 'Race: strict. Sex: intermediate, with an exceedingly persuasive justification.'));

  G('conlaw2.other-classifications', fromBank([
    tierItem(TIERLIST.slice(2, 8)),
    { L: [1, 2], q: 'What tier does age get?', a: 'rational basis', w: ['strict scrutiny', 'intermediate scrutiny'], why: 'Massachusetts Board of Retirement v. Murgia (1976).' },
    { L: [1, 2], q: 'What tier do state laws about lawfully present noncitizens usually get?', a: 'strict scrutiny', w: ['rational basis', 'intermediate scrutiny'], why: 'Graham v. Richardson (1971).' },
    { L: [2, 3], q: 'A state requires its police officers to be U.S. citizens. Under the political-function exception, what review applies?', a: 'rational basis; the rule is upheld', w: ['strict scrutiny; the rule falls', 'intermediate scrutiny', 'no review because police are federal'], why: 'The political-function exception lets states limit such jobs to citizens.' },
    { L: [2, 3], q: 'Which case held that wealth is not a suspect class and school funding by local property taxes is valid?', a: ny('rodriguez'), w: [ny('plyler'), ny('murgia'), ny('cleburne')], why: 'San Antonio v. Rodriguez (1973).' },
    { L: [2, 3], q: 'Which case struck down a state law denying free public education to children not lawfully present?', a: ny('plyler'), w: [ny('rodriguez'), ny('graham'), ny('murgia')], why: 'Plyler v. Doe (1982), 5 to 4.' },
    { L: [2, 3], q: 'What tier does a classification by legitimacy (birth outside marriage) get?', a: 'intermediate scrutiny', w: ['strict scrutiny', 'rational basis'], why: 'Legitimacy is a quasi-suspect classification.' },
    { L: [3], q: 'Since the 1970s the Court has added several new suspect classes, including age and wealth.', tf: false, why: 'It has declined to add new suspect classes; age and wealth get rational basis.' },
    { L: [3], q: 'Which get rational basis?', all: [['age', true], ['wealth', true], ['disability', true], ['state alienage laws (usually)', false], ['legitimacy', false]], why: 'Alienage is usually strict; legitimacy intermediate.' }
  ], 'Use the established list; most other lines get rational basis.'));

  var FR = ['reynolds', 'harper', 'shapiro', 'rodriguez', 'saenz', 'bushgore'];
  G('conlaw2.ep-fundamental-rights', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['reynolds', 'harper', 'shapiro', 'saenz', 'rodriguez', 'plyler']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['reynolds', 'harper', 'shapiro', 'saenz', 'rodriguez', 'plyler']); } },
    { L: [1, 2], q: 'Which case required "one person, one vote" for both houses of a state legislature?', a: ny('reynolds'), w: [ny('harper'), ny('bushgore'), ny('shapiro')], why: 'Reynolds v. Sims (1964).' },
    { L: [1, 2], q: 'Which case struck down poll taxes in state elections?', a: ny('harper'), w: [ny('reynolds'), ny('saenz'), ny('rodriguez')], why: 'Harper v. Virginia Board of Elections (1966).' },
    { L: [1, 2], q: 'Is education a fundamental right under the federal Constitution?', a: 'no (Rodriguez, 1973)', w: ['yes (Brown, 1954)', 'yes (Plyler, 1982)', 'only for high school'], why: 'Many state constitutions protect it, though.' },
    { L: [2, 3], q: 'Which amendment banned poll taxes in federal elections?', a: 'the Twenty-fourth Amendment (1964)', w: ['the Fifteenth Amendment (1870)', 'the Nineteenth Amendment (1920)', 'the Twenty-sixth Amendment (1971)'], why: 'Harper (1966) then reached state elections.' },
    { L: [2, 3], q: 'Which case struck down a one-year waiting period for welfare as a penalty on the right to travel?', a: ny('shapiro'), w: [ny('saenz'), ny('harper'), ny('plyler')], why: 'Shapiro v. Thompson (1969).' },
    { L: [2, 3], q: 'A state senate has one district of 40,000 people and another of 400,000. What result?', a: 'invalid under Reynolds v. Sims', w: ['valid; states may weight districts as they like', 'valid if the state constitution allows it', 'a political question no court may hear'], why: 'Both houses need substantially equal populations.' },
    { L: [2, 3], q: 'In Bush v. Gore (2000), what did seven justices agree on?', a: 'the recount\'s varying standards raised equal protection problems', w: ['the recount should continue', 'Florida law was unconstitutional on its face', 'the case was a political question'], why: 'Five held no remedy could be completed in time.' },
    whichCase(FR, FR, [2, 3]),
    orderCases(FR, 5),
    { L: [3], q: 'Which rights have triggered strict scrutiny under equal protection?', all: [['voting', true], ['interstate travel', true], ['education', false], ['equal weight of votes', true]], why: 'Rodriguez: education is not a fundamental right under the federal Constitution.' }
  ], 'A fundamental right burdened unequally triggers strict scrutiny.'));

  /* ======================================================== Unit 4: Freedom of Speech and Press */
  var CPD = ['schenck', 'abrams', 'gitlow', 'whitney', 'dennis', 'brandenburg'];
  G('conlaw2.clear-present-danger', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['schenck', 'abrams', 'gitlow', 'whitney', 'dennis', 'brandenburg']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['schenck', 'abrams', 'gitlow', 'whitney', 'dennis', 'brandenburg']); } },
    { L: [1, 2], q: 'Which case announced the "clear and present danger" test?', a: ny('schenck'), w: [ny('brandenburg'), ny('dennis'), ny('gitlow')], why: 'Schenck v. United States (1919), Justice Holmes for a unanimous Court.' },
    { L: [1, 2], q: 'The words about "falsely shouting fire in a theatre" come from which case?', a: ny('schenck'), w: [ny('abrams'), ny('brandenburg'), ny('tinker')], why: 'An analogy in Schenck, not its holding.' },
    { L: [1, 2], q: 'In Abrams v. United States (1919), Holmes wrote in…', a: 'dissent, defending "free trade in ideas"', w: ['the majority, upholding the convictions', 'a concurrence joining the majority', 'a unanimous opinion'], why: 'Abrams was 7 to 2; Holmes and Brandeis dissented.' },
    { L: [2, 3], q: 'Who wrote that the remedy for bad speech is "more speech, not enforced silence"?', a: 'Justice Brandeis, concurring in Whitney v. California', w: ['Justice Holmes, in Schenck', 'Chief Justice Vinson, in Dennis', 'Justice Black, in Brandenburg'], why: 'Brandeis\'s Whitney concurrence (1927).' },
    { L: [2, 3], q: 'Which case upheld the Smith Act convictions of Communist Party leaders in 1951?', a: ny('dennis'), w: [ny('gitlow'), ny('whitney'), ny('brandenburg')], why: 'Dennis v. United States, 6 to 2.' },
    { L: [2, 3], q: 'Which case assumed that the freedoms of speech and press bind the states, while upholding a conviction?', a: ny('gitlow'), w: [ny('schenck'), ny('near'), ny('dennis')], why: 'Gitlow v. New York (1925).' },
    { L: [2, 3], q: 'Which test governs advocacy of lawbreaking today?', a: 'Brandenburg\'s incitement test', w: ['Schenck\'s clear and present danger test', 'the bad tendency test', 'Dennis\'s gravity-of-the-evil formula'], why: 'Brandenburg (1969) replaced the older tests.' },
    whichCase(CPD.slice(0, 5), CPD, [2, 3]),
    orderCases(CPD, 5),
    { L: [3], q: '"You cannot falsely shout fire in a crowded theater" is the Supreme Court\'s current test for punishing speech.', tf: false, why: 'It was an analogy in Schenck; the governing test is Brandenburg.' }
  ], 'Schenck\'s test was narrowed, then replaced by Brandenburg.'));

  G('conlaw2.brandenburg', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['brandenburg', 'whitney', 'schenck', 'dennis']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['brandenburg', 'whitney', 'schenck', 'dennis']); } },
    { L: [1, 2], q: 'Brandenburg v. Ohio (1969) protects advocacy of lawbreaking unless it is directed to inciting <b>what</b> kind of lawless action?', a: 'imminent', w: ['eventual', 'any', 'political'], why: '"Imminent lawless action."' },
    { L: [1, 2], q: 'Which earlier case did Brandenburg overrule?', a: ny('whitney'), w: [ny('schenck'), ny('gitlow'), ny('dennis')], why: 'Whitney v. California (1927).' },
    { L: [1, 2], q: 'How many elements must be present for speech to be unprotected incitement under Brandenburg?', num: 3, why: 'Intent (directed to), imminence, and likelihood.' },
    { L: [2, 3], q: 'Which is NOT an element of the Brandenburg test?', a: 'the speech is offensive to most listeners', w: ['the speech is directed to inciting lawless action', 'the lawless action is imminent', 'the speech is likely to produce that action'], why: 'Offensiveness is not an element.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A speaker says the movement will have to fight in the streets "someday." No one acts.', 'protected: not imminent', 'Imminence fails (and likelihood).'], ['A speaker tells an angry crowd to break into the building across the street right now, and people start toward it.', 'unprotected incitement', 'Directed, imminent and likely.'], ['A writer publishes an essay arguing that violent revolution is justified in theory.', 'protected: abstract advocacy', 'Not directed to imminent action.'], ['A protester shouts that the group will take the street "later."', 'protected: not imminent', 'Hess v. Indiana (1973).']]);
      return { q: c[0] + ' Under Brandenburg?', a: c[1], w: ['protected: not imminent', 'unprotected incitement', 'protected: abstract advocacy', 'unprotected because it is offensive'].filter(function (x) { return x !== c[1]; }), why: c[2] };
    } },
    { L: [2, 3], q: 'How was Brandenburg v. Ohio decided?', a: 'a per curiam opinion, without dissent', w: ['5 to 4, by Justice Holmes', '6 to 3, by Chief Justice Warren', '7 to 2, by Justice Black'], why: 'Per curiam; Justices Black and Douglas concurred.' },
    { L: [3], q: 'Speech can be punished as incitement if it is directed to imminent lawless action, even if no one is likely to act.', tf: false, why: 'Likelihood is required too.' },
    { L: [3], q: 'Which are required for unprotected incitement?', all: [['intent: directed to inciting lawless action', true], ['imminence', true], ['likelihood', true], ['the speaker belongs to a disfavored group', false]], why: 'All three elements; nothing about who the speaker is.' },
    { L: [3], q: 'In what year was Brandenburg v. Ohio decided?', num: 1969, why: '1969.' }
  ], 'Directed, imminent, likely: all three.'));

  G('conlaw2.content-based', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['reedgilbert', 'ward', 'matal', 'rosenberger', 'rav']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['reedgilbert', 'ward', 'matal', 'rosenberger', 'rav']); } },
    { L: [1, 2], q: 'What tier applies to a content-based law regulating speech?', a: 'strict scrutiny', w: ['intermediate scrutiny', 'rational basis'], why: 'Reed v. Town of Gilbert (2015).' },
    { L: [1, 2], q: 'What tier applies to a content-neutral rule like a limit on sign size?', a: 'intermediate scrutiny', w: ['strict scrutiny', 'rational basis'], why: 'Content-neutral rules get intermediate review.' },
    { L: [1, 2], q: 'Which case held a town sign code with categories like "ideological" and "directional" content-based?', a: ny('reedgilbert'), w: [ny('ward'), ny('brandenburg'), ny('johnson')], why: 'Reed v. Town of Gilbert (2015).' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['bans signs criticizing the city council', 'viewpoint-based'], ['bans all signs about elections', 'content-based'], ['limits all signs to 16 square feet', 'content-neutral'], ['bans sound trucks after 10 p.m.', 'content-neutral'], ['refuses trademarks that disparage people', 'viewpoint-based'], ['bans all leaflets about religion', 'content-based'], ['funds student papers except those with a religious viewpoint', 'viewpoint-based']]);
      return { q: 'A law ' + c[0] + '. What kind of law is it?', a: c[1], w: ['viewpoint-based', 'content-based', 'content-neutral'].filter(function (x) { return x !== c[1]; }), why: 'Viewpoint: one side. Content: a subject. Neutral: regardless of message.' };
    } },
    { L: [2, 3], q: 'Which case held that refusing to register "disparaging" trademarks is viewpoint discrimination?', a: ny('matal'), w: [ny('reedgilbert'), ny('rosenberger'), ny('rav')], why: 'Matal v. Tam (2017).' },
    { L: [2, 3], q: 'Which case held a university could not deny printing funds to a student paper because of its religious viewpoint?', a: ny('rosenberger'), w: [ny('matal'), ny('hazelwood'), ny('reedgilbert')], why: 'Rosenberger (1995).' },
    { L: [3], q: 'A law that treats all viewpoints equally is always content-neutral.', tf: false, why: 'A law can be viewpoint-neutral but content-based if it singles out a subject.' },
    { L: [3], q: 'About content and viewpoint:', all: [['Viewpoint discrimination is the most suspect kind', true], ['A ban on all election signs is content-based', true], ['Content-neutral rules get strict scrutiny', false], ['Rosenberger involved a religious viewpoint', true]], why: 'Content-neutral rules get intermediate scrutiny.' }
  ], 'Would you have to read the sign to know whether the law applies?'));

  G('conlaw2.unprotected-categories', fromBank([
    { L: [1, 2], q: 'Which case recognized "fighting words" as unprotected?', a: ny('chaplinsky'), w: [ny('miller'), ny('vablack'), ny('stevens')], why: 'Chaplinsky v. New Hampshire (1942).' },
    { L: [1, 2], q: 'Which case set the three-part test for obscenity?', a: ny('miller'), w: [ny('chaplinsky'), ny('stevens'), ny('sullivan')], why: 'Miller v. California (1973).' },
    { L: [1, 2], q: 'Is "hate speech" an unprotected category under the Supreme Court\'s cases?', a: 'no; it is unprotected only if it fits another category, such as true threats', w: ['yes, since Chaplinsky', 'yes, since Matal v. Tam', 'yes, but only online'], why: 'The Court has not recognized such a category.' },
    { L: [2, 3], q: 'Which case held that a crude, conditional remark about the President at a political rally, met with laughter, was political hyperbole and not a true threat?', a: ny('watts'), w: [ny('vablack'), ny('brandenburg'), ny('chaplinsky')], why: 'Watts v. United States (1969).' },
    { L: [2, 3], q: 'Which case held that a state may ban cross burning carried out with intent to intimidate?', a: ny('vablack'), w: [ny('rav'), ny('watts'), ny('snyder')], why: 'Virginia v. Black (2003): such cross burning is a true threat.' },
    { L: [2, 3], q: 'In United States v. Stevens (2010), what did the Court refuse to do?', a: 'create a new unprotected category by weighing a kind of speech\'s value against its harm', w: ['protect any depiction of animals', 'apply the First Amendment to Congress', 'recognize incitement as a category'], why: 'New categories need historical grounding, not ad hoc balancing.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A serious message to a neighbor promising to hurt her', true, 'A true threat (Virginia v. Black).'], ['Offensive protest signs on public land near a funeral', false, 'Snyder v. Phelps (2011).'], ['A lie about winning a military medal, with no attempt to get money', false, 'United States v. Alvarez (2012).'], ['A violent video game sold to a minor', false, 'Brown v. Entertainment Merchants Association (2011).'], ['A knowingly false statement of fact that ruins a private person\'s reputation', true, 'Defamation.'], ['Insulting words about a religion, with no threat or incitement', false, 'No hate-speech category.']]);
      return { q: c[0] + '. Is this in an unprotected category?', a: c[1] ? 'yes' : 'no', w: [c[1] ? 'no' : 'yes'], why: c[2] };
    } },
    { L: [2, 3], q: 'Which case held that a city may not single out only the fighting words that address disfavored topics?', a: ny('rav'), w: [ny('chaplinsky'), ny('snyder'), ny('watts')], why: 'R.A.V. v. City of St. Paul (1992).' },
    orderCases(['chaplinsky', 'watts', 'miller', 'rav', 'vablack', 'stevens', 'snyder'], 5),
    { L: [3], q: 'Which are recognized unprotected or less-protected categories?', all: [['incitement', true], ['true threats', true], ['obscenity', true], ['hate speech', false], ['depictions of animal cruelty', false]], why: 'Stevens refused to add animal cruelty depictions.' }
  ], 'Name the category before calling speech unprotected.'));

  G('conlaw2.symbolic-speech', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['obrien', 'johnson', 'tinker', 'barnette']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['obrien', 'johnson', 'tinker', 'barnette']); } },
    { L: [1, 2], q: 'Which case upheld a conviction for burning a draft card?', a: ny('obrien'), w: [ny('johnson'), ny('tinker'), ny('barnette')], why: 'United States v. O\'Brien (1968).' },
    { L: [1, 2], q: 'Which case protected burning the American flag as political protest?', a: ny('johnson'), w: [ny('obrien'), ny('tinker'), ny('brandenburg')], why: 'Texas v. Johnson (1989), 5 to 4.' },
    { L: [1, 2], q: 'What did students wear in Tinker v. Des Moines (1969)?', a: 'black armbands protesting the Vietnam War', w: ['political T-shirts', 'campaign buttons', 'flags on their backpacks'], why: 'The armbands were protected expression.' },
    { L: [2, 3], q: 'Which O\'Brien prong decides whether its intermediate test applies at all?', a: 'whether the government\'s interest is unrelated to suppressing expression', w: ['whether the law is within the government\'s power', 'whether the speaker is a citizen', 'whether the law is the least restrictive means'], why: 'If the interest is related to the message, strict scrutiny applies (Johnson).' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A city bans all open fires in parks; a protester is fined for burning a flag there', 'the O\'Brien test (an interest unrelated to the message)'], ['A state bans burning the flag "in a manner that casts contempt upon it"', 'strict scrutiny (the law targets the message)'], ['A law forbids destroying draft cards to keep the draft running smoothly', 'the O\'Brien test (an interest unrelated to the message)'], ['A school bans only armbands protesting a war, while allowing other political symbols', 'Tinker (a rule aimed at one message)']]);
      return { q: c[0] + '. Which test or case applies?', a: c[1], w: ['the O\'Brien test (an interest unrelated to the message)', 'strict scrutiny (the law targets the message)', 'Tinker (a rule aimed at one message)', 'no First Amendment review'].filter(function (x) { return x !== c[1]; }), why: 'Ask whether the law targets the message.' };
    } },
    { L: [2, 3], q: 'After Texas v. Johnson, Congress passed the Flag Protection Act of 1989. What happened to it?', a: 'the Court struck it down in United States v. Eichman (1990)', w: ['the Court upheld it', 'it was never challenged', 'a constitutional amendment approved it'], why: 'Eichman followed Johnson.' },
    { L: [3], q: 'United States v. O\'Brien means symbolic speech gets no First Amendment protection.', tf: false, why: 'It gets intermediate review when a law targets conduct for reasons unrelated to the message.' },
    { L: [3], q: 'About symbolic speech:', all: [['Conduct meant to convey a message likely to be understood can be speech', true], ['O\'Brien\'s interest was keeping draft certificates available', true], ['Texas v. Johnson was unanimous', false], ['Tinker protected armbands', true]], why: 'Johnson was 5 to 4.' },
    orderCases(['obrien', 'tinker', 'johnson'], 3)
  ], 'Is the government\'s interest related to the message?'));

  G('conlaw2.defamation', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['sullivan', 'gertz', 'snyder']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['sullivan', 'gertz', 'snyder']); } },
    { L: [1, 2], q: 'What must a public official prove to win a defamation suit about official conduct?', a: 'actual malice', w: ['negligence', 'that the statement was offensive', 'that the speaker disliked him'], why: 'New York Times Co. v. Sullivan (1964).' },
    { L: [1, 2], q: '"Actual malice" means…', a: 'knowing falsity or reckless disregard for the truth', w: ['ill will or spite toward the person', 'any factual error', 'a failure to apologize'], why: 'A term of art about knowledge of falsity.' },
    { L: [1, 2], q: 'Which case let states set a lower standard for private figures, as long as there is fault?', a: ny('gertz'), w: [ny('sullivan'), ny('near'), ny('snyder')], why: 'Gertz v. Robert Welch (1974).' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A newspaper falsely reports a mayor took a bribe; the reporter believed it after checking two sources', 'the mayor loses: no actual malice'], ['A blog publishes a claim about a senator it knows is false', 'the senator can win: knowing falsity is actual malice'], ['A reporter who dislikes a governor reports a true fact about him', 'the governor loses: the statement is true'], ['A blogger, without any checking, falsely says a private shopkeeper sells stolen goods', 'the shopkeeper may win if the state requires only negligence']]);
      return { q: c[0] + '. Likely result?', a: c[1], w: ['the mayor loses: no actual malice', 'the senator can win: knowing falsity is actual malice', 'the governor loses: the statement is true', 'the shopkeeper may win if the state requires only negligence', 'the plaintiff wins because the speaker had ill will'].filter(function (x) { return x !== c[1]; }), why: 'Public officials need actual malice; truth is a defense; private figures face the Gertz standard.' };
    } },
    { L: [2, 3], q: 'What advertisement was at issue in New York Times Co. v. Sullivan?', a: '"Heed Their Rising Voices," supporting the civil rights movement', w: ['an ad for a political candidate', 'a cigarette ad', 'an editorial about the Vietnam War'], why: 'It contained some factual errors about events in Montgomery.' },
    { L: [2, 3], q: 'Which case extended the actual malice rule to public figures who are not officials?', a: 'Curtis Publishing Co. v. Butts (1967)', w: ['Gertz v. Robert Welch (1974)', 'Near v. Minnesota (1931)', 'Snyder v. Phelps (2011)'], why: 'Public figures, like officials, must prove actual malice.' },
    { L: [3], q: 'A reporter who hates the mayor has acted with "actual malice" even if he believes his story is true.', tf: false, why: 'Actual malice concerns knowledge of falsity, not hatred.' },
    { L: [3], q: 'About defamation and the First Amendment:', all: [['Sullivan was unanimous', true], ['Private figures may recover presumed or punitive damages without showing actual malice', false], ['Some justices have asked whether Sullivan should be reconsidered', true], ['Public figures must prove actual malice', true]], why: 'Under Gertz, presumed and punitive damages need actual malice.' }
  ], 'Actual malice is about knowledge of falsity, not spite.'));

  G('conlaw2.prior-restraint', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['near', 'pentagonpapers']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['near', 'pentagonpapers']); } },
    { L: [1, 2], q: 'A court order stopping a newspaper from publishing a story is called…', a: 'a prior restraint', w: ['a time, place and manner rule', 'a content-neutral law', 'a defamation judgment'], why: 'It stops speech before it happens.' },
    { L: [1, 2], q: 'Which case struck down a Minnesota law allowing a newspaper to be shut down as a "public nuisance"?', a: ny('near'), w: [ny('pentagonpapers'), ny('sullivan'), ny('gitlow')], why: 'Near v. Minnesota (1931).' },
    { L: [1, 2], q: 'In the Pentagon Papers case (1971), did the government get an order stopping publication?', a: 'no; it did not meet its heavy burden', w: ['yes, for national security', 'yes, but only for the Post', 'the Court did not decide'], why: 'New York Times Co. v. United States, 6 to 3.' },
    { L: [2, 3], q: 'How many separate opinions did the justices write in the Pentagon Papers case, besides the short per curiam?', num: 9, why: 'Each justice wrote: six concurrences and three dissents.' },
    { L: [2, 3], q: 'Which exception did Chief Justice Hughes name in Near?', a: 'publishing the sailing dates of transports or the location of troops in wartime', w: ['criticizing public officials', 'reporting on crime', 'publishing government budgets'], why: 'A narrow wartime exception.' },
    { L: [2, 3], q: 'Who wrote the opinion of the Court in Near v. Minnesota?', a: 'Chief Justice Hughes', w: ['Justice Holmes', 'Justice Brandeis', 'Chief Justice Marshall'], why: 'Hughes called the Minnesota law "the essence of censorship."' },
    { L: [3], q: 'The Pentagon Papers decision was a single long opinion of the Court.', tf: false, why: 'A short per curiam with nine separate opinions.' },
    { L: [3], q: 'About prior restraints:', all: [['They carry a heavy presumption against validity', true], ['They are treated as more suspect than punishment after publication', true], ['Near was decided 9 to 0', false], ['The Pentagon Papers ruling did not decide whether publishers could be punished afterward', true]], why: 'Near was 5 to 4.' },
    orderCases(['near', 'pentagonpapers'], 2)
  ], 'Stopping speech in advance needs an extraordinary justification.'));

  G('conlaw2.public-forum', fromBank([
    { L: [1, 2], gen: function (R) {
      var c = R.pick([['a city park', 'traditional public forum'], ['a public sidewalk', 'traditional public forum'], ['a street', 'traditional public forum'], ['a military base', 'nonpublic forum'], ['an airport terminal', 'nonpublic forum'], ['teachers\' school mailboxes', 'nonpublic forum'], ['a polling place on election day', 'nonpublic forum']]);
      return { q: 'What kind of forum is ' + c[0] + '?', a: c[1], w: ['traditional public forum', 'nonpublic forum', 'designated public forum'].filter(function (x) { return x !== c[1]; }), why: 'Streets, sidewalks and parks are traditional forums; bases, terminals, internal mail and polling places are not.' };
    } },
    { L: [1, 2], q: 'In a nonpublic forum, restrictions on speech must be…', a: 'reasonable and viewpoint-neutral', w: ['narrowly tailored to a compelling interest', 'the least restrictive means', 'approved by a jury'], why: 'Perry Education Association (1983).' },
    { L: [2, 3], q: 'In a traditional public forum, what review does a content-based rule get?', a: 'strict scrutiny', w: ['reasonableness only', 'rational basis', 'none'], why: 'The strongest protection.' },
    { L: [2, 3], q: 'Which case held airport terminals are nonpublic forums?', a: ny('iskcon'), w: [ny('perry'), ny('hague'), ny('ward')], why: 'ISKCON v. Lee (1992).' },
    { L: [2, 3], q: 'Which case involved a school district letting only the elected union use teacher mailboxes?', a: ny('perry'), w: [ny('iskcon'), ny('hazelwood'), ny('pickering')], why: 'Perry (1983): nonpublic forum, reasonable and viewpoint-neutral.' },
    { L: [2, 3], q: 'Which opinion said streets and parks have been used for assembly "time out of mind"?', a: 'Justice Roberts\'s opinion in Hague v. CIO (1939)', w: ['Justice Holmes in Schenck (1919)', 'Justice Kennedy in Ward (1989)', 'Chief Justice Hughes in Near (1931)'], why: 'Hague v. Committee for Industrial Organization.' },
    { L: [2, 3], q: 'A city bans leafleting about religion on downtown sidewalks. Which test?', a: 'strict scrutiny: a content-based rule in a traditional forum', w: ['reasonable and viewpoint-neutral', 'rational basis', 'no review: sidewalks are nonpublic'], why: 'Sidewalks are traditional forums; the rule targets a subject.' },
    { L: [3], q: 'All government property is a public forum.', tf: false, why: 'Military bases, airport terminals and internal mail systems are not.' },
    { L: [3], q: 'About forums:', all: [['Even in a nonpublic forum, viewpoint discrimination is forbidden', true], ['Airport terminals are nonpublic forums (ISKCON v. Lee)', true], ['A government may open a designated public forum', true], ['Content-based rules in traditional forums get rational basis', false]], why: 'Strict scrutiny applies there.' }
  ], 'Name the forum first; it sets the test.'));

  G('conlaw2.time-place-manner', fromBank([
    { L: [1, 2], q: 'Which case set out the modern time, place and manner test, in a dispute over concert sound in Central Park?', a: ny('ward'), w: [ny('reedgilbert'), ny('obrien'), ny('perry')], why: 'Ward v. Rock Against Racism (1989).' },
    { L: [1, 2], q: 'Must a time, place and manner rule be the least restrictive means?', a: 'no; it must not burden substantially more speech than necessary', w: ['yes, always', 'yes, in parks only', 'only for loud speech'], why: 'Ward said so expressly.' },
    { L: [2, 3], q: 'Which is NOT one of the requirements for a valid time, place and manner rule?', a: 'a compelling government interest', w: ['content neutrality', 'narrow tailoring to a significant interest', 'ample alternative channels'], why: 'A significant (not compelling) interest.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['limits amplified sound in a plaza to daytime hours', 'likely valid'], ['bans all leafleting everywhere in town to prevent litter', 'likely invalid: not narrowly tailored'], ['requires parade permits under neutral rules with quick decisions', 'likely valid'], ['lets officials deny permits for any reason they choose', 'likely invalid: unbridled discretion'], ['bans picketing focused on a single residence', 'likely valid']]);
      return { q: 'A city rule ' + c[0] + '. Under the time, place and manner test?', a: c[1], w: ['likely valid', 'likely invalid: not narrowly tailored', 'likely invalid: unbridled discretion', 'strict scrutiny applies'].filter(function (x) { return x !== c[1]; }), why: 'Neutral, narrowly tailored to a significant interest, with ample alternatives.' };
    } },
    { L: [2, 3], q: 'Which case upheld a ban on sleeping in a park near the White House, even for protesters?', a: 'Clark v. Community for Creative Non-Violence (1984)', w: ['Ward v. Rock Against Racism (1989)', 'Hague v. CIO (1939)', 'Texas v. Johnson (1989)'], why: 'A content-neutral rule on the manner of protest.' },
    { L: [3], q: 'A time, place and manner rule must be the least restrictive means of serving the government\'s interest.', tf: false, why: 'Ward: it need not be.' },
    { L: [3], q: 'For a valid time, place and manner rule:', all: [['it must be content-neutral', true], ['it must serve a significant interest', true], ['it must leave ample alternative channels', true], ['it must be the least restrictive means', false]], why: 'The Ward test.' }
  ], 'Neutral, narrowly tailored, significant interest, ample alternatives.'));

  var SCH = ['tinker', 'bethel', 'hazelwood', 'morse'];
  G('conlaw2.schools-employees', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['tinker', 'hazelwood', 'bethel', 'morse', 'pickering', 'garcetti']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['tinker', 'hazelwood', 'bethel', 'morse', 'pickering', 'garcetti']); } },
    { L: [1, 2], q: 'Under Tinker, when may a school forbid student speech?', a: 'when it would materially and substantially disrupt school or invade others\' rights', w: ['whenever a teacher disagrees', 'whenever it is political', 'never'], why: 'Students do not shed their rights "at the schoolhouse gate."' },
    { L: [1, 2], q: 'Which case let a principal remove articles from a school-sponsored newspaper?', a: ny('hazelwood'), w: [ny('tinker'), ny('bethel'), ny('morse')], why: 'Hazelwood v. Kuhlmeier (1988).' },
    { L: [1, 2], q: 'Which case protected a public employee\'s speech as a citizen on public concerns, through a balancing test?', a: ny('pickering'), w: [ny('garcetti'), ny('tinker'), ny('hazelwood')], why: 'Pickering v. Board of Education (1968).' },
    { L: [2, 3], q: 'Under Garcetti v. Ceballos, is a public employee\'s speech made pursuant to official duties protected from discipline?', a: 'no', w: ['yes, always', 'yes, if it concerns public matters', 'only for teachers'], why: 'Garcetti (2006).' },
    { L: [2, 3], q: 'Which case let a school punish a student for a banner at a school event reasonably read as promoting illegal drug use?', a: ny('morse'), w: [ny('hazelwood'), ny('tinker'), ny('bethel')], why: 'Morse v. Frederick (2007).' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['a lewd speech at a school assembly', ny('bethel')], ['a banner at a school event reasonably read as promoting illegal drug use', ny('morse')], ['articles in a school-sponsored newspaper', ny('hazelwood')], ['black armbands protesting a war', ny('tinker')]]);
      return { q: 'Which case governs a school\'s response to ' + c[0] + '?', a: c[1], w: SCH.map(ny).filter(function (x) { return x !== c[1]; }), why: 'Tinker is the baseline; Bethel, Hazelwood and Morse set limits.' };
    } },
    { L: [2, 3], q: 'Pickering balancing weighs the employee\'s interest in speaking as a citizen on public matters against…', a: 'the employer\'s interest in an efficient workplace', w: ['the public\'s interest in silence', 'the speaker\'s popularity', 'the newspaper\'s profits'], why: 'Pickering v. Board of Education (1968).' },
    orderCases(['pickering', 'tinker', 'bethel', 'hazelwood', 'garcetti', 'morse'], 5),
    { L: [3], q: 'Under Tinker, a school may forbid a student\'s political armband because it fears the armband might upset someone, without any facts suggesting disruption.', tf: false, why: '"Undifferentiated fear" of disturbance is not enough; the test is substantial disruption.' }
  ], 'Tinker is the baseline; then the special rules.'));

  G('conlaw2.campaign-speech', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['buckley', 'citizensunited']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['buckley', 'citizensunited']); } },
    { L: [1, 2], q: 'In Buckley v. Valeo (1976), what happened to limits on contributions to candidates?', a: 'they were upheld', w: ['they were struck down', 'they were not reviewed', 'they were left to the states'], why: 'They serve the interest in preventing corruption or its appearance.' },
    { L: [1, 2], q: 'In Buckley, what happened to limits on independent expenditures?', a: 'they were struck down', w: ['they were upheld', 'they were raised', 'they applied only to corporations'], why: 'They directly limit the quantity of political speech.' },
    { L: [1, 2], q: 'Which case held corporations and unions may spend independently on elections?', a: ny('citizensunited'), w: [ny('buckley'), ny('sullivan'), ny('naacpalabama')], why: 'Citizens United v. FEC (2010), 5 to 4.' },
    { L: [2, 3], q: 'What interest justifies contribution limits under Buckley?', a: 'preventing corruption or its appearance', w: ['equalizing candidates\' resources', 'reducing the number of ads', 'helping incumbents'], why: 'Buckley rejected equalization as a reason.' },
    { L: [2, 3], q: 'In Citizens United, how did the Court rule on disclaimer and disclosure rules?', a: 'it upheld them, 8 to 1', w: ['it struck them down, 5 to 4', 'it did not address them', 'it upheld them only for unions'], why: 'Disclosure burdens speech less and informs voters.' },
    { L: [2, 3], q: 'A state caps both contributions to a campaign and a person\'s own independent ad spending. Which cap is vulnerable under Buckley?', a: 'the cap on independent spending', w: ['the cap on contributions', 'both equally', 'neither'], why: 'Buckley upheld contribution limits and struck expenditure limits.' },
    { L: [2, 3], q: 'Which case struck down aggregate limits on how much one donor could give to all candidates combined?', a: 'McCutcheon v. FEC (2014)', w: ['Buckley v. Valeo (1976)', 'Citizens United v. FEC (2010)', 'Randall v. Sorrell (2006)'], why: 'McCutcheon (2014).' },
    { L: [3], q: 'Buckley treated contributions and expenditures the same way.', tf: false, why: 'It distinguished them.' },
    { L: [3], q: 'About campaign finance law:', all: [['Citizens United overruled Austin v. Michigan Chamber of Commerce', true], ['Buckley called money spent on political communication speech', true], ['Contribution limits are always invalid', false], ['Disclosure rules have mostly been upheld', true]], why: 'Contribution limits are generally valid.' }
  ], 'Contributions: limits allowed. Independent spending: protected.'));

  var CSA = ['gobitis', 'barnette', 'naacpalabama', 'wooley', 'hurley', 'dale'];
  G('conlaw2.compelled-speech-association', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['barnette', 'gobitis', 'wooley', 'dale', 'naacpalabama', 'hurley']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['barnette', 'gobitis', 'wooley', 'dale', 'naacpalabama', 'hurley']); } },
    { L: [1, 2], q: 'Which case held public schools may not require students to salute the flag?', a: ny('barnette'), w: [ny('gobitis'), ny('tinker'), ny('wooley')], why: 'West Virginia v. Barnette (1943).' },
    { L: [1, 2], q: 'Which case did Barnette overrule?', a: ny('gobitis'), w: [ny('tinker'), ny('wooley'), ny('everson')], why: 'Minersville School District v. Gobitis (1940).' },
    { L: [1, 2], q: 'Which case let a driver cover the motto "Live Free or Die" on his license plate?', a: ny('wooley'), w: [ny('barnette'), ny('johnson'), ny('dale')], why: 'Wooley v. Maynard (1977).' },
    { L: [2, 3], q: 'On what ground did Barnette rest?', a: 'freedom of speech and mind', w: ['the Free Exercise Clause alone', 'the Equal Protection Clause', 'the Establishment Clause'], why: 'Justice Jackson rested on free speech, so it protects nonreligious objectors too.' },
    { L: [2, 3], q: 'Which case protected the privacy of the NAACP\'s membership lists?', a: ny('naacpalabama'), w: [ny('dale'), ny('barnette'), ny('buckley')], why: 'NAACP v. Alabama ex rel. Patterson (1958).' },
    { L: [2, 3], q: 'Which case held that a state could not require private parade organizers to include a group whose message they did not wish to convey?', a: ny('hurley'), w: [ny('dale'), ny('wooley'), ny('naacpalabama')], why: 'Hurley v. Irish-American Gay, Lesbian, and Bisexual Group of Boston (1995), 9 to 0.' },
    { L: [2, 3], q: 'Who wrote that "no official, high or petty, can prescribe what shall be orthodox"?', a: 'Justice Jackson, in Barnette', w: ['Justice Frankfurter, in Gobitis', 'Justice Brennan, in Texas v. Johnson', 'Justice Souter, in Hurley'], why: 'The "fixed star" passage.' },
    whichCase(CSA, CSA, [2, 3]),
    orderCases(CSA, 5),
    { L: [3], q: 'Barnette protects only students who object for religious reasons.', tf: false, why: 'It rested on freedom of speech.' }
  ], 'The freedom not to speak, and to associate to speak.'));

  /* ======================================================== Unit 5: The Religion Clauses; Unit 6: The Second Amendment */
  G('conlaw2.establishment-history', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['everson', 'engel', 'abington']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['everson', 'engel', 'abington']); } },
    { L: [1, 2], q: 'Which case applied the Establishment Clause to the states?', a: ny('everson'), w: [ny('lemon'), ny('engel'), ny('barron')], why: 'Everson v. Board of Education (1947).' },
    { L: [1, 2], q: 'Where does the phrase "wall of separation between church and State" come from?', a: 'Jefferson\'s 1802 letter to the Danbury Baptists', w: ['the First Amendment\'s text', 'the Declaration of Independence', 'the Federalist Papers'], why: 'The Constitution says "no law respecting an establishment of religion."' },
    { L: [1, 2], q: 'In Everson, did the Court uphold or strike down repaying parents for bus fares to religious schools?', a: 'upheld it as a general public benefit', w: ['struck it down', 'sent it back to the state', 'did not decide'], why: 'Like police and fire protection.' },
    { L: [2, 3], q: 'Which case applied the Free Exercise Clause to the states in 1940?', a: 'Cantwell v. Connecticut', w: ['Everson v. Board of Education', 'Engel v. Vitale', 'Barron v. Baltimore'], why: 'Cantwell (1940); Everson (1947) did the same for the Establishment Clause.' },
    { L: [2, 3], q: 'What was the vote in Everson v. Board of Education?', a: '5 to 4', w: ['9 to 0', '7 to 2', '6 to 3'], why: 'Justice Black for five; Justices Jackson and Rutledge wrote dissents.' },
    { L: [2, 3], q: 'Before incorporation, which government did the Establishment Clause limit?', a: 'only Congress (the federal government)', w: ['only the states', 'both', 'neither'], why: 'Barron; several states still had established churches after 1791.' },
    { L: [2, 3], q: 'Which state was the last to end its established church, in 1833?', a: 'Massachusetts', w: ['Virginia', 'New York', 'Pennsylvania'], why: 'Massachusetts ended its system in 1833.' },
    { L: [3], q: 'Put in order.', order: ['The First Amendment is ratified', 'Jefferson writes to the Danbury Baptists', 'Massachusetts ends its established church', 'Cantwell v. Connecticut', 'Everson v. Board of Education'], why: '1791, 1802, 1833, 1940, 1947.' },
    { L: [3], q: 'The words "separation of church and state" appear in the Constitution.', tf: false, why: 'They come from Jefferson\'s letter.' },
    { L: [3], q: 'About Everson:', all: [['It quoted Jefferson\'s "wall of separation"', true], ['It applied the Establishment Clause to the states', true], ['It struck down the bus fare program', false], ['Four justices dissented', true]], why: 'It upheld the program 5 to 4.' }
  ], 'Two clauses; the famous phrase is Jefferson\'s.'));

  G('conlaw2.establishment-tests', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['leeweisman', 'marshchambers', 'galloway', 'santafe', 'wallace', 'lynch', 'amlegion']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['leeweisman', 'marshchambers', 'galloway', 'santafe', 'wallace', 'lynch', 'amlegion']); } },
    { L: [1, 2], q: 'Which test asked about secular purpose, primary effect and excessive entanglement?', a: 'the Lemon test', w: ['the endorsement test', 'the coercion test', 'the Brandenburg test'], why: 'Lemon v. Kurtzman (1971).' },
    { L: [1, 2], q: 'Which case set out the coercion test, striking down prayers at a middle school graduation?', a: ny('leeweisman'), w: [ny('lemon'), ny('marshchambers'), ny('galloway')], why: 'Lee v. Weisman (1992).' },
    { L: [1, 2], q: 'Who proposed the endorsement test?', a: 'Justice O\'Connor, concurring in Lynch v. Donnelly (1984)', w: ['Chief Justice Burger, in Lemon', 'Justice Kennedy, in Lee v. Weisman', 'Justice Black, in Everson'], why: 'A reasonable observer asks whether government endorses religion.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['Is there a secular purpose?', 'Lemon'], ['Is there excessive entanglement?', 'Lemon'], ['Would a reasonable observer see government approval?', 'endorsement'], ['Are people pressured to take part in a religious exercise?', 'coercion'], ['Does the practice fit what the First Congress and later tradition accepted?', 'history and tradition']]);
      return { q: 'Which approach asks: "' + c[0] + '"', a: c[1], w: ['Lemon', 'endorsement', 'coercion', 'history and tradition'].filter(function (x) { return x !== c[1]; }), why: 'Lemon (1971); endorsement (Lynch, 1984); coercion (Lee, 1992); history (Marsh, Galloway).' };
    } },
    { L: [2, 3], q: 'Which case upheld a state legislature\'s paid chaplain because of the practice\'s unbroken history?', a: ny('marshchambers'), w: [ny('lemon'), ny('engel'), ny('everson')], why: 'Marsh v. Chambers (1983).' },
    { L: [2, 3], q: 'Which case upheld prayers opening town board meetings?', a: ny('galloway'), w: [ny('santafe'), ny('leeweisman'), ny('wallace')], why: 'Town of Greece v. Galloway (2014).' },
    { L: [2, 3], q: 'Which case held a large cross-shaped World War I memorial on public land could stay?', a: ny('amlegion'), w: [ny('lynch'), ny('galloway'), ny('lemon')], why: 'American Legion v. American Humanist Association (2019).' },
    orderCases(['lemon', 'marshchambers', 'lynch', 'leeweisman', 'galloway', 'amlegion'], 5),
    { L: [3], q: 'Courts today apply the Lemon test as the controlling Establishment Clause test.', tf: false, why: 'The Court said in 2022 that it no longer applies the Lemon test.' },
    { L: [3], q: 'Name the Lemon prongs:', all: [['secular purpose', true], ['primary effect neither advances nor inhibits religion', true], ['no excessive entanglement', true], ['a compelling interest', false]], why: 'Lemon had three prongs, none about a compelling interest.' }
  ], 'Name the test: Lemon, endorsement, coercion or history.'));

  var SP = ['engel', 'abington', 'wallace', 'leeweisman', 'santafe'];
  G('conlaw2.school-prayer', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['engel', 'abington', 'leeweisman', 'santafe', 'wallace']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['engel', 'abington', 'leeweisman', 'santafe', 'wallace']); } },
    { L: [1, 2], q: 'Which case struck down a prayer written by New York\'s Board of Regents for public schools?', a: ny('engel'), w: [ny('abington'), ny('leeweisman'), ny('santafe')], why: 'Engel v. Vitale (1962).' },
    { L: [1, 2], q: 'May students pray privately at public school?', a: 'yes; the cases bar only school-sponsored prayer', w: ['no, never', 'only before 8 a.m.', 'only with a teacher present'], why: 'Private student prayer is protected.' },
    { L: [1, 2], q: 'Which case struck down clergy-led prayers at a middle school graduation?', a: ny('leeweisman'), w: [ny('santafe'), ny('engel'), ny('abington')], why: 'Lee v. Weisman (1992): subtle coercion.' },
    { L: [2, 3], q: 'Which case struck down student-led prayers over the loudspeaker before football games under a school policy?', a: ny('santafe'), w: [ny('leeweisman'), ny('engel'), ny('wallace')], why: 'Santa Fe Independent School District v. Doe (2000).' },
    { L: [2, 3], q: 'Which case struck down school-sponsored Bible reading at the start of the school day?', a: ny('abington'), w: [ny('santafe'), ny('leeweisman'), ny('wallace')], why: 'Abington School District v. Schempp (1963).' },
    { L: [2, 3], q: 'Engel\'s prayer was voluntary and nondenominational. Did that save it?', a: 'no; government may not compose official prayers at all', w: ['yes, voluntariness saves it', 'yes, if it was short', 'only in high schools'], why: 'Engel (1962).' },
    { L: [2, 3], q: 'Which case struck down a moment of silence law amended to add "or voluntary prayer"?', a: ny('wallace'), w: [ny('engel'), ny('abington'), ny('santafe')], why: 'Wallace v. Jaffree (1985).' },
    whichCase(SP, SP, [2, 3]),
    orderCases(SP, 5),
    { L: [3], q: 'About religion in public schools:', all: [['Schools may teach about religion, its history and literature', true], ['Religious student clubs may meet on the same terms as other clubs', true], ['A school may lead a voluntary prayer if students can leave', false], ['Abington struck down school-sponsored Bible reading', true]], why: 'Engel forbids official prayer even with excusal.' }
  ], 'Government prayer: no. Private prayer: yes.'));

  var AID = ['everson', 'zelman', 'trinity', 'espinoza'];
  G('conlaw2.aid-to-religion', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['zelman', 'everson', 'espinoza', 'trinity']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['zelman', 'everson', 'espinoza', 'trinity']); } },
    { L: [1, 2], q: 'Which case upheld school vouchers that parents could use at religious schools?', a: ny('zelman'), w: [ny('lemon'), ny('espinoza'), ny('everson')], why: 'Zelman v. Simmons-Harris (2002): true private choice.' },
    { L: [1, 2], q: 'Which case held a church preschool could not be excluded from a playground-surface grant program because it was a church?', a: ny('trinity'), w: [ny('espinoza'), ny('everson'), ny('zelman')], why: 'Trinity Lutheran v. Comer (2017).' },
    { L: [1, 2], q: 'Under Zelman, aid reaches religious schools legitimately when…', a: 'parents independently choose where to use it', w: ['the government picks the schools', 'the schools promise not to teach religion', 'Congress approves each school'], why: '"True private choice."' },
    { L: [2, 3], q: 'Which case involved a Montana tax-credit scholarship and the state\'s "no-aid" provision?', a: ny('espinoza'), w: [ny('everson'), ny('trinity'), ny('zelman')], why: 'Espinoza v. Montana Department of Revenue (2020).' },
    { L: [2, 3], q: 'Which clause did Trinity Lutheran and Espinoza rely on?', a: 'the Free Exercise Clause', w: ['the Establishment Clause', 'the Equal Protection Clause', 'the Spending Clause'], why: 'Excluding religious schools from general programs burdened free exercise.' },
    { L: [2, 3], q: 'After Espinoza, must a state that funds only public schools also fund religious schools?', a: 'no; the cases govern programs a state chooses to create', w: ['yes, always', 'yes, if any parent asks', 'only in Maine'], why: 'A state may fund only public schools.' },
    orderCases(['everson', 'lemon', 'zelman', 'trinity', 'espinoza'], 5),
    { L: [3], q: 'The Establishment Clause forbids any public money from ever reaching a religious school.', tf: false, why: 'Aid through private choice is allowed, and exclusions can violate free exercise.' },
    { L: [3], q: 'About aid cases:', all: [['Espinoza said a state need not subsidize private education at all', true], ['Zelman was decided 5 to 4', true], ['Trinity Lutheran rested on the Establishment Clause', false], ['Locke v. Davey (2004) upheld not funding devotional theology degrees', true]], why: 'Trinity Lutheran rested on free exercise.' }
  ], 'Private choice is allowed; excluding religion from general programs is not.'));

  var FE = ['sherbert', 'yoder', 'smith', 'lukumi'];
  G('conlaw2.free-exercise', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['smith', 'sherbert', 'yoder', 'lukumi']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['smith', 'sherbert', 'yoder', 'lukumi']); } },
    { L: [1, 2], q: 'Which case held that neutral, generally applicable laws need no religious exemption?', a: ny('smith'), w: [ny('sherbert'), ny('yoder'), ny('lukumi')], why: 'Employment Division v. Smith (1990).' },
    { L: [1, 2], q: 'Which case struck down city ordinances aimed at a faith\'s ritual practices?', a: ny('lukumi'), w: [ny('smith'), ny('yoder'), ny('boerne')], why: 'Church of the Lukumi Babalu Aye v. City of Hialeah (1993), 9 to 0.' },
    { L: [1, 2], q: 'What test did Sherbert v. Verner (1963) apply to burdens on religion?', a: 'strict scrutiny (a compelling interest)', w: ['rational basis', 'the Lemon test', 'intermediate scrutiny'], why: 'Sherbert and Yoder applied strict scrutiny.' },
    { L: [2, 3], q: 'Besides targeting a faith, why were the ordinances in Lukumi not generally applicable?', a: 'they allowed many secular killings of animals that harmed the city\'s stated interests just as much', w: ['they applied to everyone equally', 'they were federal laws', 'they were taxes'], why: 'A law that forbids religious conduct while allowing comparable secular conduct is not generally applicable.' },
    { L: [2, 3], q: 'Which case let Amish families stop school after eighth grade?', a: ny('yoder'), w: [ny('sherbert'), ny('smith'), ny('pierce')], why: 'Wisconsin v. Yoder (1972).' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A neutral ban on all drones over farmland during harvest, with no exceptions', 'rational basis (Smith)'], ['An ordinance banning one faith\'s ritual while exempting similar secular acts', 'strict scrutiny (Lukumi)'], ['A no-beards rule for police officers with medical exceptions but no religious ones', 'strict scrutiny (not generally applicable)'], ['A neutral drug law with no exceptions, applied to a sacramental use', 'rational basis (Smith)']]);
      return { q: c[0] + '. Which standard applies under the Free Exercise Clause?', a: c[1], w: ['rational basis (Smith)', 'strict scrutiny (Lukumi)', 'strict scrutiny (not generally applicable)', 'intermediate scrutiny'].filter(function (x) { return x !== c[1]; }), why: 'Neutral and generally applicable: Smith. Targeting or favored secular exceptions: strict scrutiny.' };
    } },
    { L: [2, 3], q: 'How did Congress respond to Employment Division v. Smith?', a: 'it passed the Religious Freedom Restoration Act (1993)', w: ['it proposed a constitutional amendment', 'it removed the Court\'s jurisdiction', 'it did nothing'], why: 'RFRA restored strict scrutiny by statute.' },
    whichCase(FE, FE, [2, 3]),
    orderCases(FE, 5),
    { L: [3], q: 'Employment Division v. Smith allows government to target a religious practice.', tf: false, why: 'Targeting still gets strict scrutiny (Lukumi).' }
  ], 'Neutral and generally applicable? If not, strict scrutiny.'));

  G('conlaw2.rfra', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['boerne', 'smith', 'hobbylobby', 'ocentro', 'holt']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['boerne', 'smith', 'hobbylobby', 'ocentro', 'holt']); } },
    { L: [1, 2], q: 'What test does RFRA apply to substantial burdens on religious exercise?', a: 'a compelling interest pursued by the least restrictive means', w: ['rational basis', 'the Lemon test', 'intermediate scrutiny'], why: 'RFRA restored the Sherbert-Yoder test.' },
    { L: [1, 2], q: 'Which case held RFRA invalid as applied to the states?', a: ny('boerne'), w: [ny('smith'), ny('hobbylobby'), ny('lukumi')], why: 'City of Boerne v. Flores (1997).' },
    { L: [1, 2], q: 'In what year did Congress pass RFRA?', num: 1993, why: '1993, three years after Smith.' },
    { L: [2, 3], q: 'What test did Boerne set for laws under Section 5 of the Fourteenth Amendment?', a: 'congruence and proportionality', w: ['rational basis', 'strict scrutiny', 'the Lemon test'], why: 'Section 5 laws must be congruent and proportional to constitutional violations.' },
    { L: [2, 3], q: 'Does RFRA still bind the federal government?', a: 'yes', w: ['no, Boerne struck it down entirely', 'only in prisons', 'only for corporations'], why: 'Burwell v. Hobby Lobby (2014) and O Centro (2006) applied it.' },
    { L: [2, 3], q: 'Which statute protects religious exercise in state prisons and land use?', a: 'RLUIPA (2000)', w: ['RFRA (1993)', 'the Civil Rights Act of 1964', 'the Equal Access Act (1984)'], why: 'Holt v. Hobbs (2015) applied RLUIPA.' },
    { L: [2, 3], q: 'Which case held closely held corporations are "persons" under RFRA?', a: ny('hobbylobby'), w: [ny('boerne'), ny('ocentro'), ny('holt')], why: 'Burwell v. Hobby Lobby Stores (2014), 5 to 4.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A federal agency rule burdens a worker\'s Sabbath', 'RFRA'], ['A state prison bars a religious head covering', 'RLUIPA'], ['A city zoning rule burdens a church building', 'RLUIPA'], ['A federal drug law burdens a church\'s sacramental tea', 'RFRA']]);
      return { q: c[0] + '. Which statute gives the claim?', a: c[1], w: ['RFRA', 'RLUIPA', 'neither; only the Constitution'].filter(function (x) { return x !== c[1]; }), why: 'RFRA binds the federal government; RLUIPA covers state prisons and land use.' };
    } },
    orderCases(['smith', 'boerne', 'ocentro', 'hobbylobby', 'holt'], 4),
    { L: [3], q: 'City of Boerne v. Flores struck down RFRA in every application.', tf: false, why: 'Only as applied to states.' }
  ], 'RFRA binds the federal government; RLUIPA reaches state prisons and land use.'));

  G('conlaw2.heller-mcdonald', fromBank([
    { L: [1, 2], q: 'What did District of Columbia v. Heller (2008) hold the Second Amendment protects?', a: 'an individual right to keep and bear arms', w: ['only a right of state militias', 'only a right to hunt', 'no enforceable right'], why: 'Heller, 5 to 4.' },
    { L: [1, 2], q: 'Which case applied the Second Amendment to the states?', a: ny('mcdonald'), w: [ny('heller'), ny('caetano'), ny('usmiller')], why: 'McDonald v. City of Chicago (2010).' },
    { L: [1, 2], q: 'What was the vote in Heller?', a: '5 to 4', w: ['9 to 0', '6 to 3', '7 to 2'], why: 'Justice Scalia for five.' },
    { L: [2, 3], q: 'How did the Heller majority read "A well regulated Militia, being necessary to the security of a free State"?', a: 'as a prefatory clause announcing a purpose, not limiting the right', w: ['as limiting the right to militia members', 'as meaningless', 'as a grant of power to Congress'], why: 'Justice Stevens\'s dissent read it as tying the right to militia service.' },
    { L: [2, 3], q: 'Which regulations did Heller call "presumptively lawful"?', a: 'longstanding ones, such as bans on possession by felons and carrying in sensitive places', w: ['all gun regulations', 'none', 'only federal ones'], why: 'Also conditions on commercial sale.' },
    { L: [2, 3], q: 'In McDonald, which clause did the plurality use to incorporate the right?', a: 'the Due Process Clause', w: ['the Privileges or Immunities Clause', 'the Equal Protection Clause', 'the Commerce Clause'], why: 'Justice Thomas would have used Privileges or Immunities.' },
    { L: [2, 3], q: 'Which 1939 case upheld a federal tax on short-barreled shotguns?', a: ny('usmiller'), w: [ny('heller'), ny('mcdonald'), ny('caetano')], why: 'United States v. Miller.' },
    { L: [3], q: 'Which justices wrote the main dissents in Heller?', all: [['Justice Stevens (militia reading)', true], ['Justice Breyer (interest balancing)', true], ['Justice Scalia', false], ['Justice Thomas', false]], why: 'Scalia wrote the majority.' },
    orderCases(['usmiller', 'heller', 'mcdonald'], 3)
  ], 'An individual right (Heller), applied to the states (McDonald).'));

  G('conlaw2.bruen-rahimi', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['heller', 'mcdonald', 'usmiller', 'caetano']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['heller', 'mcdonald', 'usmiller', 'caetano']); } },
    { L: [1, 2], q: 'Which kind of law did Heller describe as "presumptively lawful"?', a: 'longstanding bans on possession of firearms by felons', w: ['a ban on handguns in the home', 'a ban on all firearms in the home', 'a rule that guns at home be kept disassembled'], why: 'Heller listed bans on possession by felons and the mentally ill, carrying in sensitive places, and conditions on commercial sale.' },
    { L: [1, 2], q: 'Which places did Heller name as "sensitive places" where carrying firearms may be forbidden?', a: 'schools and government buildings', w: ['homes', 'private farms', 'every public street'], why: 'Heller: "sensitive places such as schools and government buildings."' },
    { L: [1, 2], q: 'Which case applied Heller to stun guns?', a: ny('caetano'), w: [ny('mcdonald'), ny('usmiller'), ny('heller')], why: 'Caetano v. Massachusetts (2016), an unsigned opinion.' },
    { L: [2, 3], q: 'Which weapons does the Second Amendment protect, according to Heller?', a: 'arms in common use for lawful purposes, not "dangerous and unusual weapons"', w: ['only weapons that existed in 1791', 'any weapon at all', 'only weapons a militia would use'], why: 'Heller tied protection to arms in common use for lawful purposes such as self-defense.' },
    { L: [2, 3], q: 'A state court reasoned that stun guns are unprotected because they did not exist at the founding. What did the Supreme Court say?', a: 'that reasoning contradicts Heller, which reaches bearable arms not in existence at the founding', w: ['the state court was right', 'only muskets are protected', 'the Second Amendment does not apply to states'], why: 'Caetano v. Massachusetts (2016).' },
    { L: [2, 3], q: 'Which proposal did the Heller majority reject?', a: 'Justice Breyer\'s case-by-case interest balancing', w: ['an individual right', 'incorporation against the states', 'any limits on the right'], why: 'Justice Scalia said the enumerated right could not depend on such balancing.' },
    { L: [1, 2, 3], q: 'Heller held that every gun regulation is unconstitutional.', tf: false, why: 'It named longstanding regulations as presumptively lawful.' },
    { L: [1, 2, 3], q: 'Courts today judge Second Amendment cases by choosing a tier of scrutiny.', tf: false, why: 'Since 2022 the Court has judged gun laws by the Nation\'s historical tradition of firearm regulation rather than by tiers of scrutiny.' },
    orderCases(['usmiller', 'heller', 'mcdonald', 'caetano'], 4),
    { L: [3], q: 'About the limits Heller described:', all: [['Bans on possession by felons are presumptively lawful', true], ['Conditions on the commercial sale of arms are presumptively lawful', true], ['The right covers only weapons that existed in 1791', false], ['The list of presumptively lawful measures was not exhaustive', true]], why: 'Heller gave examples and said the right reaches arms invented later.' }
  ], 'Which people, which places, which weapons?'));

  /* ======================================================== Unit 7: Criminal Procedure; Unit 8: Property and Voting */
  var SR = ['olmstead', 'katz', 'smithmd', 'kyllo', 'jones', 'carpenter'];
  G('conlaw2.fourth-amendment-search', fromBank([
    { L: [1, 2], q: 'Which case held that "the Fourth Amendment protects people, not places"?', a: ny('katz'), w: [ny('olmstead'), ny('jones'), ny('terry')], why: 'Katz v. United States (1967).' },
    { L: [1, 2], q: 'Which case required a warrant for historical cell-site location records?', a: ny('carpenter'), w: [ny('smithmd'), ny('jones'), ny('riley')], why: 'Carpenter v. United States (2018).' },
    { L: [1, 2], q: 'Which case did Katz overrule?', a: ny('olmstead'), w: [ny('weeks'), ny('carroll'), ny('wolf')], why: 'Olmstead (1928) had held that wiretapping without physical entry was not a search.' },
    { L: [2, 3], q: 'What are the two parts of Justice Harlan\'s Katz test?', a: 'an actual expectation of privacy that society is prepared to recognize as reasonable', w: ['probable cause and a warrant', 'a trespass and a seizure', 'custody and interrogation'], why: 'The reasonable expectation of privacy test.' },
    { L: [2, 3], q: 'Which case revived a trespass test by holding that attaching a GPS tracker to a car is a search?', a: ny('jones'), w: [ny('katz'), ny('kyllo'), ny('carpenter')], why: 'United States v. Jones (2012).' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['Police record the numbers dialed from a home phone at the phone company', 'not a search', 'Smith v. Maryland (third-party doctrine).'], ['Police aim a thermal imager at a home from the street', 'a search', 'Kyllo v. United States (2001).'], ['Police look through trash bags left at the curb', 'not a search', 'California v. Greenwood (1988).'], ['Police attach a GPS tracker to a suspect\'s car', 'a search', 'United States v. Jones (2012).'], ['Police get months of a person\'s cell-site location records', 'a search', 'Carpenter v. United States (2018).'], ['Police bring a drug dog onto a home\'s front porch to sniff the door', 'a search', 'Florida v. Jardines (2013).'], ['Police get a suspect\'s bank records from the bank', 'not a search', 'United States v. Miller (1976).']]);
      return { q: c[0] + '. Under current doctrine, is that a Fourth Amendment search?', a: c[1], w: [c[1] === 'a search' ? 'not a search' : 'a search', 'only if the person is a citizen'], why: c[2] };
    } },
    whichCase(SR, SR, [2, 3]),
    orderCases(SR, 5),
    { L: [3], q: 'Information a person shares with a third party is never protected by the Fourth Amendment.', tf: false, why: 'Carpenter declined to extend the third-party doctrine to cell-site location records.' },
    { L: [3], q: 'About searches:', all: [['Katz involved a public phone booth', true], ['Jones relied on physical intrusion', true], ['Smith v. Maryland applied the third-party doctrine', true], ['Carpenter was unanimous', false]], why: 'Carpenter was 5 to 4.' }
  ], 'Privacy (Katz) or property (Jones): was it a search?'));

  G('conlaw2.warrants-exceptions', fromBank([
    { L: [1, 2], q: 'What standard allows a brief Terry stop?', a: 'reasonable suspicion', w: ['probable cause', 'proof beyond a reasonable doubt', 'no suspicion at all'], why: 'Terry v. Ohio (1968).' },
    { L: [1, 2], q: 'Which exception lets police search a car on the highway with probable cause and no warrant?', a: 'the automobile exception', w: ['plain view', 'search incident to arrest', 'consent'], why: 'Carroll v. United States (1925).' },
    { L: [1, 2], q: 'Which is the higher standard?', a: 'probable cause', w: ['reasonable suspicion'], why: 'Reasonable suspicion is lower.' },
    { L: [2, 3], q: 'Under Chimel v. California, a search incident to arrest may cover…', a: 'the arrested person and the area within his immediate control', w: ['the whole house', 'any place the police choose', 'nothing without a warrant'], why: 'Chimel (1969).' },
    { L: [2, 3], q: 'May police search the digital contents of an arrested person\'s phone without a warrant?', a: 'generally no (Riley v. California, 2014)', w: ['yes, always', 'yes, if the phone is locked', 'only for traffic arrests'], why: '"Get a warrant."' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['An officer sees two men repeatedly peer into a store window and confer, then stops and pats them down', 'stop and frisk (Terry)'], ['A driver agrees when an officer asks to look in the trunk', 'consent'], ['Officers lawfully in a room see stolen goods on a table', 'plain view'], ['Officers smell burning marijuana from a car in a state where it is illegal and search the trunk', 'the automobile exception'], ['Officers chase a fleeing suspect into a house', 'exigent circumstances (hot pursuit)']]);
      return { q: c[0] + '. Which exception to the warrant requirement fits best?', a: c[1], w: ['stop and frisk (Terry)', 'consent', 'plain view', 'the automobile exception', 'exigent circumstances (hot pursuit)'].filter(function (x) { return x !== c[1]; }), why: 'Match the facts to the exception.' };
    } },
    { L: [2, 3], q: 'After arresting a man in his living room, officers search every room without a warrant. Valid under Chimel?', a: 'no; it exceeds the area within his immediate control', w: ['yes, any search after arrest is valid', 'yes, if they find evidence', 'yes, because he was arrested at home'], why: 'Chimel limits the scope.' },
    orderCases(['carroll', 'terry', 'chimel', 'riley'], 4),
    { L: [3], q: 'Reasonable suspicion is a higher standard than probable cause.', tf: false, why: 'It is lower.' },
    { L: [3], q: 'Which are recognized exceptions to the warrant requirement?', all: [['consent', true], ['plain view', true], ['the automobile exception', true], ['a hunch with no facts', false], ['exigent circumstances', true]], why: 'A hunch is not even reasonable suspicion.' }
  ], 'Warrant and probable cause, unless an exception fits.'));

  var EXR = ['weeks', 'wolf', 'mapp', 'leon', 'nix'];
  G('conlaw2.exclusionary-rule', fromBank([
    { L: [1, 2], q: 'Which case applied the exclusionary rule to state courts?', a: ny('mapp'), w: [ny('weeks'), ny('wolf'), ny('leon')], why: 'Mapp v. Ohio (1961).' },
    { L: [1, 2], q: 'Which case created the exclusionary rule for federal courts?', a: ny('weeks'), w: [ny('mapp'), ny('wolf'), ny('nix')], why: 'Weeks v. United States (1914).' },
    { L: [1, 2], q: 'Which case created the good-faith exception for reliance on a warrant later found invalid?', a: ny('leon'), w: [ny('nix'), ny('mapp'), ny('weeks')], why: 'United States v. Leon (1984).' },
    { L: [2, 3], q: 'Wolf v. Colorado (1949) applied the Fourth Amendment right to the states. What did it not apply?', a: 'the exclusionary remedy', w: ['the warrant requirement', 'the right itself', 'the Fifth Amendment'], why: 'Mapp later applied the remedy too.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['Officers relied reasonably on a warrant later found to lack probable cause', 'good faith'], ['A search party already combing the area would have found the evidence within hours', 'inevitable discovery'], ['Police also found the evidence through a separate, lawful search', 'independent source'], ['After an unlawful stop, police discovered a valid arrest warrant and then found the evidence', 'attenuation']]);
      return { q: c[0] + '. Which exception lets the evidence in?', a: c[1], w: ['good faith', 'inevitable discovery', 'independent source', 'attenuation'].filter(function (x) { return x !== c[1]; }), why: 'Good faith (Leon), inevitable discovery (Nix), independent source and attenuation.' };
    } },
    { L: [2, 3], q: 'What does the phrase "fruit of the poisonous tree" mean?', a: 'evidence derived from an unconstitutional search is excluded too, unless an exception applies', w: ['all evidence in the case is excluded', 'the defendant goes free automatically', 'only physical evidence counts'], why: 'Derivative evidence.' },
    whichCase(EXR, EXR, [2, 3]),
    orderCases(EXR, 5),
    { L: [3], q: 'An illegal search always ends the prosecution.', tf: false, why: 'Only tainted evidence is excluded, and exceptions often apply.' }
  ], 'Exclude the tainted evidence, unless an exception applies.'));

  G('conlaw2.miranda', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['miranda', 'dickerson', 'quarles']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['miranda', 'dickerson', 'quarles']); } },
    { L: [1, 2], q: 'Miranda warnings are required before…', a: 'custodial interrogation', w: ['any conversation with police', 'any arrest, even without questions', 'a traffic stop'], why: 'Both custody and interrogation.' },
    { L: [1, 2], q: 'Which case held that Congress cannot overrule Miranda by statute?', a: ny('dickerson'), w: [ny('quarles'), ny('miranda'), ny('gideon')], why: 'Dickerson v. United States (2000), 7 to 2.' },
    { L: [1, 2], q: 'Which amendment\'s privilege does Miranda protect?', a: 'the Fifth Amendment', w: ['the Fourth Amendment', 'the Sixth Amendment', 'the Eighth Amendment'], why: 'The privilege against self-incrimination.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['An officer on a sidewalk asks a man who is free to leave what he saw; the man confesses', 'admissible: no custody'], ['After an arrest, before any questions, the suspect blurts out a confession in the patrol car', 'admissible: volunteered, no interrogation'], ['Police question an arrested suspect at the station for an hour without warnings', 'excluded: custodial interrogation without warnings'], ['Officers arrest a man in a store and, before warnings, ask where he hid a gun', 'admissible: public safety exception']]);
      return { q: c[0] + '. Under Miranda, the statement is…', a: c[1], w: ['admissible: no custody', 'admissible: volunteered, no interrogation', 'excluded: custodial interrogation without warnings', 'admissible: public safety exception'].filter(function (x) { return x !== c[1]; }), why: 'Check custody, interrogation and the exceptions.' };
    } },
    { L: [2, 3], q: 'Which case created a public safety exception to Miranda?', a: ny('quarles'), w: [ny('dickerson'), ny('miranda'), ny('terry')], why: 'New York v. Quarles (1984).' },
    { L: [2, 3], q: 'What was the vote in Miranda v. Arizona (1966)?', a: '5 to 4', w: ['9 to 0', '7 to 2', '6 to 3'], why: 'Chief Justice Warren for five.' },
    { L: [2, 3], q: 'Is an ordinary traffic stop "custody" for Miranda purposes?', a: 'no; a routine traffic stop ordinarily is not custody', w: ['yes, always', 'only at night', 'only if the driver is a minor'], why: 'Roadside questioning at a routine stop is not custodial.' },
    { L: [3], q: 'Which are among the Miranda warnings?', all: [['the right to remain silent', true], ['anything said can be used in court', true], ['the right to a lawyer, appointed if needed', true], ['the right to a jury of one\'s choosing', false]], why: 'The four warnings.' },
    { L: [3], q: 'Put the Miranda sequence in order.', order: ['the person is in custody', 'police give the warnings', 'the person waives the rights', 'police ask questions'], why: 'Warnings and a valid waiver come before questioning.' },
    { L: [3], q: 'Miranda applies whenever police speak with anyone.', tf: false, why: 'Only to custodial interrogation.' }
  ], 'Custody plus interrogation.'));

  G('conlaw2.fifth-amendment', fromBank([
    { L: [1, 2], q: 'Does the privilege against self-incrimination cover a blood sample?', a: 'no; it covers testimonial evidence, not physical evidence', w: ['yes, all evidence', 'yes, if taken without consent', 'only in federal cases'], why: 'Schmerber v. California (1966).' },
    { L: [1, 2], q: 'May a state and the federal government each prosecute the same act?', a: 'yes, under the separate-sovereigns doctrine (Gamble, 2019)', w: ['no, double jeopardy forbids it', 'only if the first trial ended in acquittal', 'only with the defendant\'s consent'], why: 'Different sovereigns, different offenses.' },
    { L: [1, 2], q: 'Which test decides whether two crimes are the "same offense"?', a: 'the Blockburger same-elements test', w: ['the Lemon test', 'the Mathews test', 'the O\'Brien test'], why: 'Each must require proof of a fact the other does not.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['being forced to testify against yourself at your own trial', true], ['a blood sample after a crash', false], ['fingerprints at booking', false], ['being forced to reveal a memorized combination', true], ['standing in a lineup', false], ['a handwriting sample', false]]);
      return { q: 'Is ' + c[0] + ' protected by the privilege against self-incrimination?', a: c[1] ? 'yes' : 'no', w: [c[1] ? 'no' : 'yes'], why: c[1] ? 'Testimonial: it reveals the contents of the mind.' : 'Physical evidence, not testimony.' };
    } },
    { L: [2, 3], q: 'Which case applied double jeopardy to the states?', a: ny('benton'), w: [ny('palko'), ny('gamble'), ny('malloy')], why: 'Benton v. Maryland (1969) overruled Palko.' },
    { L: [2, 3], q: 'Which case applied the privilege against self-incrimination to the states?', a: ny('malloy'), w: [ny('benton'), ny('adamson'), ny('miranda')], why: 'Malloy v. Hogan (1964).' },
    { L: [2, 3], q: 'After a hung jury, may the state try the defendant again?', a: 'yes; there was no acquittal or conviction', w: ['no, never', 'only with a new judge', 'only in federal court'], why: 'A mistrial for a hung jury allows retrial.' },
    { L: [3], q: 'May a prosecutor tell the jury that the defendant\'s refusal to testify suggests guilt?', a: 'no (Griffin v. California, 1965)', w: ['yes, always', 'yes, in closing only', 'only in state court'], why: 'No comment on a defendant\'s silence.' },
    { L: [3], q: 'About the Fifth Amendment:', all: [['Gamble v. United States kept the separate-sovereigns doctrine', true], ['Immunity can be used to compel testimony', true], ['The privilege covers fingerprints', false], ['Double jeopardy bars a second trial after an acquittal', true]], why: 'Fingerprints are physical evidence.' }
  ], 'Testimony, not physical evidence; same offense, same sovereign.'));

  var RC = ['powell', 'betts', 'gideon', 'argersinger', 'scottil', 'strickland'];
  G('conlaw2.right-to-counsel', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['gideon', 'betts', 'powell', 'argersinger', 'scottil', 'strickland']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['gideon', 'betts', 'powell', 'argersinger', 'scottil', 'strickland']); } },
    { L: [1, 2], q: 'Which case required states to provide lawyers to poor defendants charged with felonies?', a: ny('gideon'), w: [ny('betts'), ny('powell'), ny('miranda')], why: 'Gideon v. Wainwright (1963), unanimous.' },
    { L: [1, 2], q: 'Which case did Gideon overrule?', a: ny('betts'), w: [ny('powell'), ny('argersinger'), ny('palko')], why: 'Betts v. Brady (1942).' },
    { L: [1, 2], q: 'What are the two parts of the Strickland test for ineffective assistance?', a: 'deficient performance and prejudice', w: ['custody and interrogation', 'intent and imminence', 'purpose and effect'], why: 'Strickland v. Washington (1984).' },
    { L: [2, 3], q: 'Which case extended the right to appointed counsel to any case that results in imprisonment?', a: ny('argersinger'), w: [ny('gideon'), ny('scottil'), ny('powell')], why: 'Argersinger v. Hamlin (1972).' },
    { L: [2, 3], q: 'A poor defendant is charged with a crime punishable by jail but receives only a fine, without a lawyer. Was counsel constitutionally required?', a: 'no (Scott v. Illinois, 1979)', w: ['yes (Gideon)', 'yes (Argersinger)', 'yes (Powell)'], why: 'Actual imprisonment is the line.' },
    { L: [2, 3], q: 'Which case involved the "Scottsboro boys" tried for their lives without effective counsel?', a: ny('powell'), w: [ny('gideon'), ny('betts'), ny('batson')], why: 'Powell v. Alabama (1932).' },
    { L: [2, 3], q: 'A lawyer\'s error was clearly unreasonable, but the other evidence of guilt was overwhelming. Does the defendant win under Strickland?', a: 'no; prejudice is missing', w: ['yes; deficient performance is enough', 'yes; any error requires a new trial', 'no; lawyers cannot be ineffective'], why: 'Both parts are needed.' },
    whichCase(RC, RC, [2, 3]),
    orderCases(RC, 5),
    { L: [3], q: 'Gideon v. Wainwright required appointed lawyers in every criminal case, including those punished only by a fine.', tf: false, why: 'It covered felonies; Argersinger and Scott set the line at actual imprisonment.' }
  ], 'Felonies (Gideon), then any jail sentence (Argersinger).'));

  var JC = ['duncan', 'baldwin', 'apodaca', 'batson', 'crawford', 'ramos'];
  G('conlaw2.jury-confrontation', fromBank([
    { L: [1, 2], q: 'Which case required unanimous juries in state felony trials?', a: ny('ramos'), w: [ny('duncan'), ny('apodaca'), ny('batson')], why: 'Ramos v. Louisiana (2020).' },
    { L: [1, 2], q: 'Which case barred prosecutors from striking jurors because of race?', a: ny('batson'), w: [ny('crawford'), ny('ramos'), ny('strauder')], why: 'Batson v. Kentucky (1986).' },
    { L: [1, 2], q: 'Above what maximum punishment is an offense "serious," requiring a jury?', a: 'more than six months', w: ['more than one day', 'more than five years', 'any jail time'], why: 'Baldwin v. New York (1970).' },
    { L: [2, 3], q: 'Which case requires cross-examination for testimonial statements of witnesses who do not testify?', a: ny('crawford'), w: [ny('batson'), ny('duncan'), ny('miranda')], why: 'Crawford v. Washington (2004).' },
    { L: [2, 3], q: 'Which case did Ramos overrule?', a: ny('apodaca'), w: [ny('duncan'), ny('baldwin'), ny('batson')], why: 'Apodaca v. Oregon (1972).' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['a police interrogation statement by a witness who does not testify', 'testimonial'], ['a sworn lab certificate prepared for trial', 'testimonial'], ['a 911 call made to get help during an ongoing emergency', 'not testimonial'], ['a formal written statement to police about a past crime', 'testimonial']]);
      return { q: 'Under Crawford and later cases, is ' + c[0] + ' testimonial?', a: c[1], w: [c[1] === 'testimonial' ? 'not testimonial' : 'testimonial', 'it depends on the defendant\'s race'], why: 'Statements made mainly to establish past facts for a prosecution are testimonial (Melendez-Diaz; Davis).' };
    } },
    { L: [2, 3], q: 'A defendant charged with an offense punishable by at most 90 days asks for a jury. Is one constitutionally required?', a: 'no; it is a petty offense', w: ['yes, always', 'yes, if the defendant is a citizen', 'only in federal court'], why: 'Six months or less is presumptively petty.' },
    whichCase(['duncan', 'baldwin', 'batson', 'crawford', 'ramos'], ['duncan', 'baldwin', 'batson', 'crawford', 'ramos'], [2, 3]),
    orderCases(JC, 5),
    { L: [3], q: 'The Sixth Amendment guarantees a jury in every criminal case, however minor.', tf: false, why: 'Only for serious offenses.' }
  ], 'Serious crimes, unanimous juries, fair selection, cross-examination.'));

  var EI = ['furman', 'gregg', 'atkins', 'roper', 'kennedyla', 'timbs'];
  G('conlaw2.eighth-amendment', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['roper', 'atkins', 'gregg', 'furman', 'timbs', 'kennedyla']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['roper', 'atkins', 'gregg', 'furman', 'timbs', 'kennedyla']); } },
    { L: [1, 2], q: 'Did Furman v. Georgia (1972) abolish the death penalty?', a: 'no; it struck down the systems then in use', w: ['yes, permanently', 'yes, until 2005', 'it upheld all death sentences'], why: 'Gregg (1976) upheld revised statutes.' },
    { L: [1, 2], q: 'Which case barred the death penalty for crimes committed under age 18?', a: ny('roper'), w: [ny('atkins'), ny('gregg'), ny('furman')], why: 'Roper v. Simmons (2005).' },
    { L: [1, 2], q: 'Which case applied the Excessive Fines Clause to the states?', a: ny('timbs'), w: [ny('roper'), ny('gregg'), ny('mapp')], why: 'Timbs v. Indiana (2019), unanimous.' },
    { L: [2, 3], q: 'Which case upheld Georgia\'s revised death penalty system with a separate sentencing phase?', a: ny('gregg'), w: [ny('furman'), ny('atkins'), ny('kennedyla')], why: 'Gregg v. Georgia (1976).' },
    { L: [2, 3], q: 'Which case barred the death penalty for people with intellectual disabilities?', a: ny('atkins'), w: [ny('roper'), ny('kennedyla'), ny('gregg')], why: 'Atkins v. Virginia (2002).' },
    { L: [2, 3], q: 'Which phrase, from Trop v. Dulles (1958), guides the Court\'s categorical limits?', a: '"evolving standards of decency"', w: ['"clear and present danger"', '"all deliberate speed"', '"actual malice"'], why: 'Justices who favor original meaning have criticized this approach.' },
    { L: [2, 3], q: 'A man committed a crime at 17 and is tried at 20. May the state seek the death penalty?', a: 'no; age at the time of the crime controls', w: ['yes, he is now an adult', 'yes, if the jury agrees', 'only for federal crimes'], why: 'Roper v. Simmons.' },
    whichCase(EI, EI, [2, 3]),
    orderCases(EI, 5),
    { L: [3], q: 'Which three protections does the Eighth Amendment contain?', all: [['no excessive bail', true], ['no excessive fines', true], ['no cruel and unusual punishments', true], ['a speedy trial', false]], why: 'A speedy trial is a Sixth Amendment right.' }
  ], 'Furman stopped the old systems; Gregg upheld new ones; categorical limits followed.'));

  var TK = ['mahon', 'berman', 'penncentral', 'loretto', 'midkiff', 'lucas', 'kelo'];
  G('conlaw2.takings', fromBank([
    { L: [1, 2], q: 'What two conditions does the Takings Clause place on taking private property?', a: 'it must be for public use, with just compensation', w: ['it must be approved by a jury and Congress', 'it must be temporary and voluntary', 'there are no conditions'], why: '"…for public use, without just compensation."' },
    { L: [1, 2], q: 'Which case held that economic development is a public use?', a: ny('kelo'), w: [ny('lucas'), ny('penncentral'), ny('loretto')], why: 'Kelo v. City of New London (2005), 5 to 4.' },
    { L: [1, 2], q: 'In Kelo, did the owners receive just compensation?', a: 'yes; compensation was required; the question was public use', w: ['no, the city paid nothing', 'only half the value', 'only if they moved away'], why: 'Kelo concerned public use.' },
    { L: [2, 3], q: 'Who wrote that "if regulation goes too far it will be recognized as a taking"?', a: 'Justice Holmes, in Pennsylvania Coal Co. v. Mahon (1922)', w: ['Justice Stevens, in Kelo', 'Justice Scalia, in Lucas', 'Chief Justice Marshall, in Barron'], why: 'The start of regulatory takings law.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['A law requires landlords to allow a small permanent cable box on their roofs', 'a taking: permanent physical occupation (Loretto)'], ['A rule leaves a beachfront lot with no economically beneficial use', 'a taking: total loss of value (Lucas)'], ['A landmarks law blocks a tower but leaves a profitable use', 'not a taking under Penn Central balancing'], ['A zoning change lowers a lot\'s value by 20 percent', 'not a taking under Penn Central balancing']]);
      return { q: c[0] + '. Result?', a: c[1], w: ['a taking: permanent physical occupation (Loretto)', 'a taking: total loss of value (Lucas)', 'not a taking under Penn Central balancing', 'a taking: any loss in value requires payment'].filter(function (x) { return x !== c[1]; }), why: 'Physical occupation and total loss are takings; otherwise Penn Central balancing.' };
    } },
    { L: [2, 3], q: 'Which factor is NOT part of the Penn Central balance?', a: 'whether the owner is a citizen', w: ['the economic impact on the owner', 'interference with investment-backed expectations', 'the character of the government action'], why: 'The three Penn Central factors.' },
    { L: [2, 3], q: 'Which case first applied the just compensation requirement to the states?', a: ny('cbq'), w: [ny('barron'), ny('kelo'), ny('mahon')], why: 'Chicago, Burlington & Quincy Railroad Co. v. Chicago (1897).' },
    whichCase(TK, TK, [2, 3]),
    orderCases(TK, 5),
    { L: [3], q: 'Kelo v. City of New London allowed the city to take homes without paying for them.', tf: false, why: 'Compensation was required; the question was public use.' }
  ], 'Public use and just compensation; regulations that go too far.'));

  var VR = ['sckatz', 'gingles', 'shaw', 'shelby', 'rucho'];
  G('conlaw2.voting-rights-law', fromBank([
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['shelby', 'gingles', 'sckatz', 'shaw']); } },
    { L: [1, 2, 3], gen: function (R, lv) { return TRBcase(R, lv, ['shelby', 'gingles', 'sckatz', 'shaw']); } },
    { L: [1, 2], q: 'Which case struck down the Voting Rights Act\'s preclearance coverage formula?', a: ny('shelby'), w: [ny('gingles'), ny('rucho'), ny('sckatz')], why: 'Shelby County v. Holder (2013).' },
    { L: [1, 2], q: 'Which case held that partisan gerrymandering claims are beyond the reach of federal courts?', a: ny('rucho'), w: [ny('shaw'), ny('shelby'), ny('baker')], why: 'Rucho v. Common Cause (2019).' },
    { L: [1, 2], q: 'In what year did Congress pass the Voting Rights Act?', num: 1965, why: 'Signed August 6, 1965.' },
    { L: [2, 3], q: 'Which section of the Voting Rights Act applies nationwide and bars practices that result in denying the vote on account of race?', a: 'Section 2', w: ['Section 4(b)', 'Section 5', 'Section 10'], why: 'Section 2, with a results test since 1982.' },
    { L: [2, 3], q: 'After Shelby County, what is the status of Section 5 preclearance?', a: 'Section 5 remains, but covers no one without a coverage formula', w: ['it was struck down', 'it applies nationwide', 'it was replaced by Section 2'], why: 'The Court did not rule on Section 5 itself.' },
    { L: [2, 3], q: 'Which case set three preconditions for a Section 2 vote dilution claim?', a: ny('gingles'), w: [ny('shelby'), ny('shaw'), ny('rucho')], why: 'Thornburg v. Gingles (1986).' },
    { L: [2, 3], q: 'Which of these is one of the three Gingles preconditions for a Section 2 vote dilution claim?', a: 'the minority group is large and compact enough to form a majority in a district', w: ['the state was covered by the 1965 formula', 'the districts differ in population', 'the map helps one political party'], why: 'The others: the group is politically cohesive, and the majority usually votes as a bloc to defeat its preferred candidates.' },
    { L: [2, 3], gen: function (R) {
      var c = R.pick([['Voters say districts were drawn to help one party', 'not in federal court after Rucho'], ['Voters say a district was drawn mainly by race', 'strict scrutiny under equal protection (Shaw)'], ['Voters say a map dilutes a compact, cohesive minority group\'s votes', 'a Section 2 claim under Gingles']]);
      return { q: c[0] + '. What claim, if any, can be heard?', a: c[1], w: ['not in federal court after Rucho', 'strict scrutiny under equal protection (Shaw)', 'a Section 2 claim under Gingles', 'a Section 5 preclearance claim'].filter(function (x) { return x !== c[1]; }), why: 'Partisan: Rucho. Racial: Shaw. Dilution: Section 2.' };
    } },
    orderCases(VR, 5),
    { L: [3], q: 'About voting rights law:', all: [['South Carolina v. Katzenbach (1966) upheld the original VRA', true], ['Congress reauthorized the VRA in 2006 for 25 years', true], ['Shelby County struck down Section 2', false], ['Rucho noted that state courts and Congress may address partisan gerrymandering', true]], why: 'Shelby struck down Section 4(b).' }
  ], 'Section 2 nationwide; Section 4(b) struck; partisan claims left to the political process.'));

})(window.MathLadder);

/* ---- widen_hum: more questions from the lesson's own tables -----------------------------------------------------
   Each topic listed below also asks about the facts in its lesson's tables (copied here from the lesson, so the
   answers are the lesson's own). Forms, by level:
     match   "Which museum is in Turin?": the right cell and others from the same column (3 choices at level 1, 4 above)
     pairs   lines "A → B": which pairing is right (level 2), or which one is wrong (level 3)
     sort    a comparison table: which column does this cell describe (levels 1-2), or choose all for one column (level 3)
   How often: about a third to a half of the draws, more when the topic's own questions are few at that level.
   Generated by /tmp/work_widen_widen_hum/tabbuild.js from data/<ladder>/lessons/<course>.json. ---- */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var TABS = [{"k":"conlaw2.barron#4","h":["Text","Whom it limits","Why that matters"],"r":[["Article I, Section 9: \"No Bill of Attainder or ex post facto Law shall be passed\"","Congress (it sits in the article about Congress)","general words, read in context"],["Article I, Section 10: \"No State shall…\"","the states, by name","the framers could name states when they meant to"],["First Amendment: \"Congress shall make no law…\"","Congress, by name","the plainest case"],["Fifth Amendment: \"…nor shall private property be taken for public use, without just compensation\"","under Barron, the federal government only","no state is named"]],"cap":"","m":[[0,1,"Whom does this limit: {a}?",0]]},
    {"k":"conlaw2.incorporation#2","h":["Approach","Main voice","What it says"],"r":[["Fundamental fairness","Justice Cardozo in <i>Palko v. Connecticut</i> (1937)","apply only rights \"implicit in the concept of ordered liberty\"; decide case by case"],["Total incorporation","Justice Black, dissenting in <i>Adamson v. California</i> (1947)","the Fourteenth Amendment applies the whole Bill of Rights to the states"],["Selective incorporation (the Court's method)","<i>Duncan v. Louisiana</i> (1968)","apply a right if it is fundamental to \"our scheme of ordered liberty\" and deeply rooted; once applied, it applies against states with the same content as against the federal government"]],"cap":"","m":[[1,0,"Which approach to incorporation is linked with {a}?",0,"an approach with its main voice"],[2,0,"Which approach to incorporation says this: {a}?",0,0,2]]},
    {"k":"conlaw2.family-autonomy#2","h":["Case","The law","Holding"],"r":[["<i>Meyer v. Nebraska</i> (1923)","Nebraska banned teaching any modern foreign language to children before eighth grade","struck down: liberty includes the right of parents to have children taught and of teachers to teach"],["<i>Pierce v. Society of Sisters</i> (1925)","Oregon required children to attend public schools","struck down: \"the child is not the mere creature of the State\"; parents may choose private schools"],["<i>Griswold v. Connecticut</i> (1965)","Connecticut banned the use of contraceptives, even by married couples","struck down: a right of marital privacy"],["<i>Moore v. City of East Cleveland</i> (1977)","a city zoning rule allowed only a narrow \"family\" to share a home, excluding a grandmother living with two grandsons","struck down (plurality): the extended family living together is protected"],["<i>Troxel v. Granville</i> (2000)","a statute let \"any person\" seek court-ordered visits with a child \"at any time\"","struck down as applied (plurality): a fit parent's decisions about her children deserve special weight"]],"cap":"","m":[[1,0,"Which case concerned this law: {a}?",0],[0,2,"What did the Court hold in {a}?",0,0,2]]},
    {"k":"conlaw2.sex-discrimination#2","h":["Case","Law","What the Court did"],"r":[["<i>Reed v. Reed</i> (1971)","Idaho preferred men over women as administrators of estates",""],["<i>Frontiero v. Richardson</i> (1973)","the military gave male members' wives benefits automatically, but female members' husbands had to prove dependency","struck it down (8 to 1); a plurality of four would have applied strict scrutiny, one vote short"],["<i>Craig v. Boren</i> (1976)","Oklahoma let women buy 3.2 percent beer at 18 but men only at 21","struck it down; set <b>intermediate scrutiny</b>: an important objective and a substantial relationship"],["<i>United States v. Virginia</i> (1996)","the Virginia Military Institute admitted only men; Virginia offered a separate program for women","struck it down (7 to 1); the state must show an \"exceedingly persuasive justification\""]],"cap":"","m":[[1,0,"Which case concerned this law: {a}?",0],[0,2,"What did the Court do in {a}?",0,0,2]]},
    {"k":"conlaw2.other-classifications#2","h":["Classification","Tier","Leading case and notes"],"r":[["State laws about lawfully present noncitizens (alienage)","strict, usually","<i>Graham v. Richardson</i> (1971): exception: states may limit \"political functions\" such as police officers and public school teachers to citizens; federal immigration rules get deference"],["Birth outside marriage (legitimacy)","intermediate","the Court's legitimacy cases: children should not be penalized for their parents' status"],["Age","rational basis","<i>Massachusetts Board of Retirement v. Murgia</i> (1976): mandatory retirement for state police at 50 upheld"],["Wealth","rational basis","<i>San Antonio Independent School District v. Rodriguez</i> (1973): school funding through local property taxes upheld"],["Disability","rational basis","<i>City of Cleburne v. Cleburne Living Center</i> (1985): though the denial in Cleburne failed even that test"],["Children not lawfully present, denied schooling","special case","<i>Plyler v. Doe</i> (1982): struck down: the law did not further a substantial state goal"]],"cap":"","m":[[0,1,"Which tier of review applies to {a:l}?",0,"a classification with its tier"]]},
    {"k":"conlaw2.brandenburg#3","h":["Element","Words in Brandenburg","What it rules out"],"r":[["1. Intent","\"directed to inciting or producing\"","speech that is careless or reckless about violence but not aimed at it"],["2. Imminence","\"imminent lawless action\"","advocacy of lawbreaking at some later time"],["3. Likelihood","\"likely to incite or produce such action\"","calls to violence that no one is likely to act on"]],"cap":"","m":[[1,0,"Which element of the Brandenburg test do these words state: {a}?",0,"an element with its words"],[2,0,"Which element of the Brandenburg test rules out {a}?",0,0,2]]},
    {"k":"conlaw2.content-based#2","h":["Kind of law","Example","Review"],"r":[["<b>Viewpoint-based</b>: favors or disfavors one side","a ban on signs criticizing the mayor, but not praising","almost always invalid (the most suspect)"],["<b>Content-based</b>: depends on the subject or message","a ban on all political signs, or a code with different rules for \"ideological\" and \"directional\" signs","strict scrutiny: compelling interest, narrowly tailored"],["<b>Content-neutral</b>: applies regardless of message","no signs larger than 16 square feet; no loudspeakers after 10 p.m","intermediate scrutiny (see time, place and manner)"]],"cap":"","m":[[1,0,"What kind of law is this: {a}?",0],[0,2,"What review does a court give to a {a:l}?",0,0,2]]},
    {"k":"conlaw2.unprotected-categories#2","h":["Category","Leading case","The test, in brief"],"r":[["Incitement","<i>Brandenburg v. Ohio</i> (1969)","directed to imminent lawless action and likely to produce it"],["True threats","<i>Virginia v. Black</i> (2003)","statements in which the speaker means to communicate a serious expression of an intent to commit unlawful violence against a particular person or group; crude political exaggeration is not enough (<i>Watts v. United States</i> (1969))"],["Fighting words","<i>Chaplinsky v. New Hampshire</i> (1942)","face-to-face personal insults likely to provoke an immediate violent reaction; read very narrowly today"],["Obscenity","<i>Miller v. California</i> (1973)","a three-part test: by contemporary community standards the work as a whole appeals to the prurient interest; it describes sexual conduct defined by state law in a patently offensive way; and it lacks serious literary, artistic, political or scientific value"],["Defamation","<i>New York Times Co. v. Sullivan</i> (1964)","false statements of fact that harm reputation, with constitutional limits (next topics)"],["Fraud, speech integral to crime","many cases","false statements to get money; speech that is part of a criminal act"]],"cap":"","m":[[0,1,"What is the leading case for {a:l}?",0,"a category with its leading case"],[1,0,"Which category of unprotected speech does {a} define?",0,0,2]]},
    {"k":"conlaw2.defamation#4","h":["Plaintiff","Must prove (for compensatory damages)","Case"],"r":[["Public official","actual malice","<i>New York Times Co. v. Sullivan</i> (1964)"],["Public figure","actual malice","Curtis Publishing Co. v. Butts (1967)"],["Private figure, public concern","at least fault, as the state sets (often negligence)","<i>Gertz v. Robert Welch, Inc.</i> (1974)"]],"cap":"","m":[[0,2,"Which case set the rule for a {a:l} plaintiff?",0,0,2]]},
    {"k":"conlaw2.time-place-manner#3","h":["Requirement","Question","Ward"],"r":[["Content-neutral","Does the rule apply without regard to the message?","yes: all bandshell concerts"],["Significant interest","Is the goal important?","yes: protecting residents and park users from excessive noise"],["Narrowly tailored","Does it avoid burdening substantially more speech than needed? (Not least restrictive means)","yes: the city mixed sound to the group's wishes, controlling only volume"],["Ample alternatives","Can the speaker still reach the audience?","yes: concerts still went on"]],"cap":"","m":[[0,1,"In time, place and manner review, which question goes with the requirement \"{a}\"?",0,"a requirement with its question"]]},
    {"k":"conlaw2.schools-employees#3","h":["Case","Speech","Rule"],"r":[["<i>Bethel School District No. 403 v. Fraser</i> (1986)","a lewd speech at a school assembly","schools may prohibit vulgar and lewd speech"],["<i>Hazelwood School District v. Kuhlmeier</i> (1988)","articles in a school-sponsored newspaper","schools may edit school-sponsored speech for reasons reasonably related to legitimate teaching concerns"],["<i>Morse v. Frederick</i> (2007)","a banner at a school event reasonably read as promoting illegal drug use","schools may restrict such speech"]],"cap":"","m":[[1,0,"Which case concerned this speech: {a}?",0,"a case with its speech"],[0,2,"What rule came from {a}?",0,0,2]]},
    {"k":"conlaw2.fourth-amendment-search#5","h":["Test","Source","Question"],"r":[["Reasonable expectation of privacy","Katz (1967), Harlan concurrence","Did the person expect privacy, and is that expectation reasonable?"],["Trespass (property)","Jones (2012); also Florida v. Jardines (2013)","Did the government physically intrude on a person, house, papers or effects to gather information?"],["Third-party doctrine","Smith v. Maryland (1979)","Did the person voluntarily convey the information to a third party? (Not extended to cell-site records in Carpenter)"]],"cap":"","m":[[0,1,"Where does the {a} test come from?",0,"a test with its source"],[2,0,"Which Fourth Amendment test asks: {a}",0,0,2]]},
    {"k":"conlaw2.warrants-exceptions#2","h":["Exception","Leading case","What it allows"],"r":[["Consent","Schneckloth v. Bustamonte (1973)","a search a person voluntarily agrees to; knowing of the right to refuse is not required"],["Plain view","Horton v. California (1990)","seizing evidence in plain view from a lawful vantage point, if its incriminating nature is immediately apparent"],["Search incident to arrest","<i>Chimel v. California</i> (1969)","searching the arrested person and the area within his immediate control; not a whole house. Cell phone data needs a warrant (<i>Riley v. California</i> (2014))"],["Automobile exception","<i>Carroll v. United States</i> (1925)","searching a car with probable cause, because cars can be moved quickly"],["Exigent circumstances","Brigham City v. Stuart (2006)","emergencies: hot pursuit, preventing evidence destruction, helping someone in danger"],["Stop and frisk","<i>Terry v. Ohio</i> (1968)","a brief stop on <b>reasonable suspicion</b> of crime; a pat-down for weapons if the person may be armed and dangerous"]],"cap":"","m":[[0,1,"What is the leading case for the {a:l} exception to the warrant requirement?",0,"an exception with its leading case"],[2,0,"Which exception to the warrant requirement allows {a}?",0,0,2]]},
    {"k":"conlaw2.jury-confrontation#2","h":["Right","Case","Rule"],"r":[["Jury trial in state courts","<i>Duncan v. Louisiana</i> (1968)","incorporated for serious crimes"],["Which crimes are serious","<i>Baldwin v. New York</i> (1970)","any offense punishable by more than six months; petty offenses may be tried by a judge"],["Jury size","Williams v. Florida (1970)","six-person juries allowed in state cases"],["Unanimity","<i>Ramos v. Louisiana</i> (2020)","a unanimous verdict is required to convict of a serious offense in state court; overruled Apodaca (1972)"],["Jury selection","<i>Batson v. Kentucky</i> (1986)","a prosecutor may not strike jurors because of their race (and, later, sex: J.E.B. v. Alabama, 1994)"],["Confrontation","<i>Crawford v. Washington</i> (2004)",""]],"cap":"","m":[[0,1,"Which case is linked with this right: {a}?",0,"a right with its case"],[1,2,"What rule came from {a}?",0,0,2]]},
    {"k":"conlaw2.takings#4","h":["Rule","Case","When"],"r":[["Physical occupation is a taking, however small","<i>Loretto v. Teleprompter Manhattan CATV Corp.</i> (1982)","a permanent physical occupation (a cable box on a roof)"],["Total loss of economic value is a taking","<i>Lucas v. South Carolina Coastal Council</i> (1992)","a rule leaves land with no economically beneficial use, unless background principles of property or nuisance law already forbade the use"],["Otherwise, balance","<i>Penn Central Transportation Co. v. New York City</i> (1978)","weigh the economic impact, interference with distinct investment-backed expectations, and the character of the government action"]],"cap":"","m":[[0,1,"Which case stated this takings rule: {a}?",0,"a rule with its case"]]}];
  var FUNS = {};
  function plain(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim(); }
  function txt(s) { return String(s).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function low(s) { return txt(s).toLowerCase().replace(/[.;:,]+$/, ''); }
  function big(x) { return String(x).replace(/<span class="(sc-b|eg-cop|eg-h)">/g, '<span class="$1" style="font-size:1.6em;line-height:1">'); }
  function fill(t, x) { x = big(x); return t.replace('{a:l}', String(x).replace(/^[A-Z](?=[a-z])/, function (c) { return c.toLowerCase(); })).replace('{a}', x); }
  function dot(s) { s = String(s); return /[.!?…"”’)]$/.test(txt(s)) ? s : s + '.'; }
  function sameRow(t, i, a) { return t.r.filter(function (r) { return low(r[a]) === low(t.r[i][a]); }); }
  function partnerSteps(t, tp, right, shown) { // what each wrong choice goes with
    var out = [];
    shown.forEach(function (c) {
      if (low(c) === low(right)) return;
      var rows = t.r.filter(function (r) { return low(r[tp[1]]) === low(c); });
      if (rows.length === 1 && txt(rows[0][tp[0]]).length <= 90) out.push(dot(c + ': that goes with ' + rows[0][tp[0]]));
    });
    return out.slice(0, 3);
  }
  // match: ask for column b from a cell of column a
  function match(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][b]).length <= 130; });
    if (!ok.length) return null;
    var i = R.pick(ok), right = t.r[i][b], seen = {};
    seen[low(right)] = 1;
    var bad = {}; sameRow(t, i, a).forEach(function (r) { bad[low(r[b])] = 1; }); // never a choice that is also right
    var pool = []; t.r.forEach(function (r) { var k = low(r[b]); if (r[b] && !seen[k] && !bad[k] && txt(r[b]).length <= 130) { seen[k] = 1; pool.push(r[b]); } });
    var k = Math.min(L === 1 ? 3 : 4, pool.length + 1); if (k < 3) return null;
    var wrongs = R.shuffle(pool).slice(0, k - 1), choices = [right].concat(wrongs);
    return { q: fill(tp[2], t.r[i][a]), a: { t: 'mc', choices: choices, v: 0 },
      steps: [dot(t.r[i][a] + ' → ' + right), ].concat(partnerSteps(t, tp, right, choices)),
      hint: tp[3] || 'Think back to the lesson’s table' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 'm', a, b, i, txt(t.r[i][a])] };
  }
  // pairs: three or four lines "a → b"; one right (level 2) or one wrong (level 3)
  function pairs(R, t, tp, L) {
    var a = tp[0], b = tp[1], ok = t.r.map(function (_, i) { return i; }).filter(function (i) { return t.r[i][a] && t.r[i][b] && txt(t.r[i][a]).length <= 70 && txt(t.r[i][b]).length <= 70; });
    var uniq = {}; ok = ok.filter(function (i) { var k = low(t.r[i][a]); if (uniq[k]) return false; uniq[k] = 1; return true; });
    var n = Math.min(4, ok.length); if (n < 3) return null;
    var rows = R.shuffle(ok).slice(0, n), wrongOne = L >= 3, target = R.int(0, n - 1), lines = [], steps = [];
    for (var j = 0; j < n; j++) {
      var i = rows[j], right = wrongOne ? j !== target : j === target, ans = t.r[i][b];
      if (!right) {
        var good = {}; sameRow(t, i, a).forEach(function (r) { good[low(r[b])] = 1; });
        var ws = []; t.r.forEach(function (r) { if (r[b] && !good[low(r[b])] && txt(r[b]).length <= 70 && ws.map(low).indexOf(low(r[b])) < 0) ws.push(r[b]); });
        if (!ws.length) return null;
        ans = R.pick(ws);
      }
      lines.push(t.r[i][a] + ' → ' + ans);
      steps.push(dot(t.r[i][a] + ' → ' + t.r[i][b] + (right ? ': right' : ', not ' + ans)));
    }
    var what = tp[4] ? ' Each line pairs ' + tp[4] + '.' : '';
    return { q: (wrongOne ? 'Exactly one of these pairings is <b>wrong</b>. Which one?' : 'Exactly one of these pairings is right. Which one?') + what,
      a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own against what you learned.', wh: [t.k, wrongOne ? 'pw' : 'pr', a, b] };
  }
  // sort: which column of a comparison table does a cell belong to
  function sortQ(R, t, L) {
    var cols = t.h.map(function (_, j) { return j; }).filter(function (j) { return j >= (t.na ? 0 : 1) && txt(t.h[j]); });
    if (cols.length < 2) return null;
    var cells = [];
    t.r.forEach(function (r, i) { cols.forEach(function (j) {
      if (!r[j] || (!t.na && !txt(r[0]))) return;
      var dup = cols.some(function (j2) { return j2 !== j && r[j2] && (low(r[j2]) === low(r[j]) || low(r[j2]).indexOf(low(r[j])) >= 0 || low(r[j]).indexOf(low(r[j2])) >= 0); });
      if (!dup && txt(r[j]).length <= 140) cells.push([i, j]);
    }); });
    if (cells.length < 2) return null;
    var heads = cols.map(function (j) { return t.h[j]; });
    if (L >= 3 && cells.length >= 5) {
      var j0 = R.pick(cols), pick = R.shuffle(cells).slice(0, Math.min(5, cells.length));
      var hits = pick.filter(function (c) { return c[1] === j0; }).length;
      if (hits >= 1 && hits < pick.length) {
        var ch = pick.map(function (c) { return lab(t, c); });
        var v = pick.map(function (c, k) { return c[1] === j0 ? k : -1; }).filter(function (k) { return k >= 0; });
        return { q: fill(t.all, t.h[j0]), a: { t: 'mc', choices: ch, v: v },
          steps: pick.map(function (c) { return dot(lab(t, c) + ' (' + t.h[c[1]] + ')'); }),
          hint: 'Go through them one at a time.', wh: [t.k, 'sa', j0, pick] };
      }
    }
    var c = R.pick(cells);
    return { q: t.one + (t.na ? (/^["“]/.test(txt(t.r[c[0]][c[1]])) ? '<br>' + t.r[c[0]][c[1]] : '<br>“' + t.r[c[0]][c[1]] + '”') : '<br>' + asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]), a: { t: 'mc', choices: heads.slice(), v: cols.indexOf(c[1]) },
      steps: t.na ? [dot('That is ' + t.h[c[1]].replace(/^./, function (x) { return x.toLowerCase(); }))] : [dot(txt(t.r[c[0]][0]) + ' for ' + t.h[c[1]] + ': ' + t.r[c[0]][c[1]])].concat(cols.filter(function (j) { return j !== c[1] && t.r[c[0]][j]; }).map(function (j) { return dot('For ' + t.h[j] + ': ' + t.r[c[0]][j]); })),
      hint: 'Think back to the lesson’s comparison' + (t.cap ? ' (' + t.cap.replace(/\.$/, '') + ')' : '') + '.', wh: [t.k, 's', c[0], c[1]] };
  }
  function asp(x) { return '<b>' + x + (/\?$/.test(txt(x)) ? '' : ':') + '</b> '; }
  function lab(t, c) { return t.na ? t.r[c[0]][c[1]] : asp(t.r[c[0]][0]) + t.r[c[0]][c[1]]; }
  // extra bank items: { q, a, w: [wrong answers, more than are shown], s: [steps], h: hint, lv } or { q, tf: true|false, s, lv }
  function extra(R, t, L) {
    var its = t.x.filter(function (it) { return (it.lv || 1) <= L; }); if (!its.length) return null;
    var it = R.pick(its), p;
    if (it.f) { it = FUNS[it.f](R, L); if (!it) return null; }
    if (it.num !== undefined) {
      p = { q: it.q, a: { t: 'num', v: String(it.num) }, steps: it.s.slice() };
      if (Number.isInteger(it.num) && !it.unit && !it.pct) p.a.form = 'int';
      if (it.pct) p.a.pct = true;
      if (it.tol != null) p.a.tol = it.tol;
      if (it.unit) p.unit = it.unit;
    }
    else if (it.tf !== undefined) p = { q: it.q, a: { t: 'tf', v: it.tf }, steps: it.s.slice() };
    else {
      var k = Math.min(L === 1 ? 3 : 4, it.w.length + 1);
      p = { q: it.q, a: { t: 'mc', choices: [it.a].concat(R.shuffle(it.w).slice(0, k - 1)), v: 0 }, steps: it.s.slice() };
    }
    p.hint = it.h || 'Think back to the lesson.';
    p.wh = [t.k, 'x', its.indexOf(it) >= 0 ? t.x.indexOf(it) : -1];
    return FUNS.__wrap ? FUNS.__wrap(p, L) : p;
  }
  function make(R, list, L) {
    for (var tries = 0; tries < 8; tries++) {
      var t = R.pick(list), p = null;
      if (t.x) p = extra(R, t, L);
      else if (t.one) p = sortQ(R, t, L);
      else {
        var tps = t.m.filter(function (tp) { return (tp[5] || 1) <= L; }); if (!tps.length) continue;
        var tp = R.pick(tps);
        p = L >= 2 && tp[4] && R.chance(0.35) ? pairs(R, t, tp, L) : match(R, t, tp, L);
      }
      if (p) {
        // ladder pages show choices as plain text (only $…$ math is rendered), so choices carry no tags
        if (p.a.t === 'mc') { p.a.choices = p.a.choices.map(plain); var seen = {}; if (p.a.choices.some(function (c) { var k = seen[c]; seen[c] = 1; return k; })) continue; }
        p.nowiden = true; return p;
      }
    }
    return null;
  }
  var BY = {}; TABS.forEach(function (t) { var id = t.k.split('#')[0].split('@')[0]; (BY[id] = BY[id] || []).push(t); });
  var VAR = {};
  function baseCount(id, base, L) { // different questions (ignoring the order of choices) from 40 fixed seeds
    var key = id + '|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        try { var p = base(ML.rand(id + '#whv#' + s + '#' + L), { level: L, mode: 'learn' }), a = p.a || {};
          var k = p.q + '|' + JSON.stringify(a.choices ? a.choices.slice().sort() : a.v) + '|' + JSON.stringify(p.viz || null);
          if (!seen[k]) { seen[k] = 1; n++; } } catch (e) { }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  function extCount(id, L) { // different table questions from 40 fixed seeds
    var key = id + '|x|' + L;
    if (VAR[key] === undefined) {
      var seen = {}, n = 0;
      for (var s = 1; s <= 24; s++) {
        var p = make(ML.rand(id + '#whx#' + s + '#' + L), BY[id], L); if (!p) continue;
        var k = p.q + '|' + JSON.stringify(p.a.choices ? p.a.choices.slice().sort() : p.a.v);
        if (!seen[k]) { seen[k] = 1; n++; }
      }
      VAR[key] = n;
    }
    return VAR[key];
  }
  Object.keys(BY).forEach(function (id) {
    var base = ML.getGen(id); if (!base || base._wh) return;
    var fn = function (R, ctx) {
      var L = (ctx && ctx.level) || 1, n = baseCount(id, base, L), x = extCount(id, L), share = Math.max(0.15, Math.min(0.5, x / (x + n + 1)));
      if (R.chance(share)) { var p = make(R, BY[id], L); if (p) return p; }
      return base(R, ctx);
    };
    fn._wh = true;
    ML.gen(id, fn);
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen_hum ---- */

/* ---- widen: more forms of the same questions (so practice repeats less) ----------------------------------------
   Every topic of this course keeps its own problems, and some draws are turned into other forms of the same skill,
   built only from the topic's own problems (so their answers stay the ones the topic already checks):
     check   "Ava chose X. Is Ava right?" (Yes or No) from a one-answer multiple-choice problem
     pairs   two or three lines "question → answer"; which line is right (or, at level 3, which one is wrong)
     tfpick  "Which sentence is true?" (or false) from three of the topic's true-or-false sentences
   Questions whose answer depends on the other choices (first, best, most, not …) show the choices in the check form
   and never go into pairs. Mix per level: CFG.mix[level] = [check, pairs, tfpick] shares; the rest stays as it was. */
(function (ML) {
  'use strict';
  if (!ML || !ML.gen || !ML.getGen || !ML.rand) return;
  var CFG = {"prefix":"conlaw2.","only":["barron","slaughter-house","incorporation","state-action","procedural-due-process","lochner-era","end-of-lochner","sdp-methods","family-autonomy","abortion-cases","liberty-and-marriage","ep-framework","ep-rational-basis","race-strict-scrutiny","plessy-to-brown","discriminatory-purpose","affirmative-action","sex-discrimination","other-classifications","ep-fundamental-rights","clear-present-danger","brandenburg","content-based","unprotected-categories","symbolic-speech","defamation","prior-restraint","public-forum","time-place-manner","schools-employees","campaign-speech","compelled-speech-association","establishment-history","establishment-tests","school-prayer","aid-to-religion","free-exercise","rfra","heller-mcdonald","bruen-rahimi","fourth-amendment-search","warrants-exceptions","exclusionary-rule","miranda","fifth-amendment","right-to-counsel","jury-confrontation","eighth-amendment","takings","voting-rights-law"]};
  var NAMES = ['Ava', 'Ben', 'Cora', 'Dev', 'Eli', 'Finn', 'Gus', 'Hana', 'Ivy', 'Jude', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Pia',
    'Quinn', 'Rosa', 'Sam', 'Tess', 'Uma', 'Vic', 'Wren', 'Zoe', 'Ada', 'Leo', 'Mia', 'Theo', 'June', 'Max'];
  var REL = /\b(first|last|earliest|latest|earlier|later|before|after|older|oldest|newer|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|look|read|here|example|examples|likely|probably|mainly|main|usually|typically|other|another|which one|each|order|then|next)\b|n['’]t\b/i;
  // pairs judge each line on its own, so only questions whose answer depends on the other choices are left out
  var RELP = /\b(first|last|earliest|latest|oldest|newest|most|least|largest|smallest|biggest|best|better|worse|worst|closest|nearest|farthest|longest|shortest|highest|lowest|odd|not|except|different|same|these|this|those|following|below|above|shown|picture|pictures|map|table|chart|graph|diagram|passage|scene|story|which one|other|another|rank|order|more|less|fewer)\b|n['’]t\b|\w+est\b/i;
  var REF = /\b(this|these|those|shown|picture|map|table|chart|graph|diagram|passage|scene|story|above|below|here|following)\b/i;
  var BADCH = /\b(all|none|both|neither) of\b|\b(above|below)\b|^(both|neither|all|none)\b|\bchoice\b|\boption\b/i;
  function strip(s) { return String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim(); }
  function plainish(s) { return !/<(?!\/?(b|i|em|strong)\b)[^>]*>/.test(String(s).replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1')); }
  function add(q, html) { // inside a read-aloud big span when there is one
    var m = /<span class="[\w-]*big">/.exec(q);
    if (m) { var k = q.lastIndexOf('</span>'); if (k > m.index) return q.slice(0, k) + '<br>' + html.replace(/<\/p>\s*<p[^>]*>/g, '<br>').replace(/<\/?p[^>]*>/g, '') + q.slice(k); }
    return q + html;
  }
  function single(p) {
    return p && p.a && p.a.t === 'mc' && !Array.isArray(p.a.v) && Array.isArray(p.a.choices) && p.a.choices.length >= 2 &&
      !p.a.choices.some(function (c) { return BADCH.test(strip(c)); });
  }
  function hash(t) { var h = 7; for (var i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) >>> 0; return h; }
  function nameFor(q, key) { // the same claim always gets the same name, so a name alone never makes a "new" problem
    var t = strip(q), ok = NAMES.filter(function (n) { return t.indexOf(n) < 0 && String(key).indexOf(n) < 0; });
    return (ok.length ? ok : NAMES)[hash(t + '|' + key) % (ok.length || NAMES.length)];
  }
  function dot(s) { s = String(s); return /[.!?…"”')\]]\s*(<\/b>)?$/.test(strip(s)) || /\$$/.test(s) ? s : s + '.'; }
  function optList(ch) { return '<p class="wd-opts">The choices were:<br>' + ch.map(function (c) { return '• ' + c; }).join('<br>') + '</p>'; }
  function copyP(p, q, a, steps) { var o = {}; for (var k in p) if (Object.prototype.hasOwnProperty.call(p, k)) o[k] = p[k]; o.q = q; o.a = a; o.steps = steps; delete o.choices; return o; }

  // check: show one choice (the right one half the time) and ask whether it is right
  function check(p, R) {
    var ch = p.a.choices, v = p.a.v, idx = ch.map(function (_, i) { return i; }), others = idx.filter(function (i) { return i !== v; });
    var i = R.chance(0.5) ? v : R.pick(others), ok = i === v, nm = nameFor(p.q, ch[i]), letters = ch.every(function (c) { return /^[A-Z]$/.test(String(c)); });
    var stem = strip(p.q), html = '';
    if (!letters && (REL.test(stem) || ch.length > 4 || CFG.listAll)) {
      var shown = p.a.keep ? ch.slice() : R.shuffle(ch);
      html += optList(shown);
    }
    html += '<p class="wd-check">' + nm + ' chose: <b>' + ch[i] + '</b>' + (/[.!?…"”]$/.test(strip(ch[i])) ? '' : '.') + ' Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes. ' + dot(ch[v]) + ' is the right answer.' : 'No. The right answer is: ' + dot(ch[v]);
    if (ok) first = 'Yes, that is the right answer.';
    return copyP(p, add(p.q, html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [first].concat(p.steps || []));
  }
  // check for "choose all": the whole list is shown, and one learner's picks; right only if exactly the right ones
  function checkAll(p, R) {
    var ch = p.a.choices, v = p.a.v.slice().sort(), n = ch.length, pick;
    if (R.chance(0.45)) pick = v.slice();
    else {
      var t = 0; do { var j = R.int(0, n - 1), s = v.slice(), k = s.indexOf(j); if (k >= 0) s.splice(k, 1); else s.push(j); if (R.chance(0.3)) { var j2 = R.int(0, n - 1), k2 = s.indexOf(j2); if (k2 >= 0) s.splice(k2, 1); else s.push(j2); } pick = s.sort(); t++; }
      while (t < 20 && (!pick.length || pick.join() === v.join()));
      if (!pick.length || pick.join() === v.join()) return null;
    }
    var ok = pick.join() === v.join(), nm = nameFor(p.q, pick.join());
    var html = optList(ch) + '<p class="wd-check">' + nm + ' chose ' +
      (pick.length === 1 ? 'only: <b>' + ch[pick[0]] + '</b>' : 'these: <b>' + pick.map(function (i) { return ch[i]; }).join('</b>; <b>') + '</b>') + '. Is ' + nm + ' right?</p>';
    var first = ok ? 'Yes, those are exactly the right ones.' : 'No. The right ones are: ' + v.map(function (i) { return ch[i]; }).join('; ');
    return copyP(p, add(p.q.replace(/\s*(Choose|Select|Pick) (all|every)[^.?!<]*[.?!]?/i, ''), html), { t: 'mc', choices: ['Yes', 'No'], v: ok ? 0 : 1, keep: true }, [dot(first)].concat(p.steps || []));
  }

  // items for pairs: one-answer questions that stand on their own (no picture, no passage, no "first/best/…")
  function pairItem(p) {
    if (!single(p) || p.viz) return null;
    var max = CFG.maxStem || 120, maxA = CFG.maxAns || 70, a = strip(p.a.choices[p.a.v]), stem, group = '';
    // "prompt<br><b>thing</b>" or "prompt<blockquote>thing</blockquote>": a line is "thing → answer", lines share the prompt
    var q0 = p.q.replace(/<p class="[\w-]*readme">[\s\S]*?<\/p>/g, '').replace(/<span class="[\w-]*big">([\s\S]*)<\/span>/, '$1').trim();
    var m = /^([^<]{6,140}?)\s*(?:<br>\s*<b>([^<]{3,140})<\/b>|<blockquote>([^<]{3,140})<\/blockquote>)\s*$/.exec(q0);
    if (m) { group = m[1].trim(); stem = (m[2] || m[3]).trim(); if (RELP.test(group.replace(/\b(this|these)\b/gi, ''))) return null; }
    else {
      if (!plainish(p.q)) return null;
      stem = strip(p.q); if (RELP.test(stem)) return null;
    }
    if (stem.length > max || stem.length < 3 || a.length > maxA || /^[A-Z]$/.test(a) || /\$/.test(stem + a + group)) return null;
    var w = p.a.choices.filter(function (_, i) { return i !== p.a.v; }).map(strip).filter(function (x) { return x.length <= maxA && x !== a; });
    if (!w.length) return null;
    return { stem: stem.replace(/\s*(Choose one|Pick one)\.?$/i, ''), a: a, w: w, why: (p.steps || [])[0] || '', group: group };
  }
  function tfItem(p) {
    if (!p || !p.a || p.a.t !== 'tf' || p.viz || !plainish(p.q)) return null;
    var s = strip(p.q).replace(/^(True or false\?|True or false:)\s*/i, '').replace(/\s*(True or false\?|Is this true or false\?|Is it true or false\?)$/i, '').trim();
    if (s.length < 8 || s.length > (CFG.maxStem || 120) + 20 || REF.test(s) || /\?$/.test(s) || /\$/.test(s)) return null;
    return { s: s, v: p.a.v, why: (p.steps || [])[0] || '' };
  }
  function harvest(base, R, ctx, make, n, distinct) {
    var out = [], keys = {};
    for (var t = 0; t < 24 && out.length < n; t++) {
      // at level 3, lines may come from level 2 questions too: three lines with one wrong is the harder form
      var c2 = ctx && ctx.level >= 3 && (t % 2) ? Object.assign({}, ctx, { level: 2 }) : ctx;
      var p; try { p = base(ML.rand(R.int(1, 2e9)), c2); } catch (e) { continue; }
      var it = make(p); if (!it) continue;
      if (out.length && it.group !== undefined && it.group !== out[0].group) continue;
      var k = distinct(it); if (k.some(function (x) { return keys[x]; })) continue;
      k.forEach(function (x) { keys[x] = 1; }); out.push(it);
    }
    return out;
  }
  function pairs(base, R, ctx, n, wrongOne) {
    var its = harvest(base, R, ctx, pairItem, n, function (it) { return it.group ? ['s:' + it.stem] : ['s:' + it.stem, 'a:' + it.a]; });
    if (its.length < n) return null;
    var answers = its.map(function (it) { return it.a; }), used = {};
    var target = R.int(0, n - 1), lines = [], steps = [];
    for (var i = 0; i < n; i++) {
      var it = its[i], right = wrongOne ? i !== target : i === target, ans = it.a;
      if (!right) {
        var ws = it.w.filter(function (x) { return (its[0].group || answers.indexOf(x) < 0) && !used[x]; });
        if (!ws.length) return null;
        ans = R.pick(ws); if (!its[0].group) used[ans] = 1;
      }
      lines.push(it.stem + ' → ' + ans); // plain text: ladder pages show choices as text
      steps.push(it.group ? dot(it.stem) + ' Answer: ' + it.a + (right ? '.' : ', not ' + ans + '.') : it.stem + ' The answer is ' + it.a + (right ? '.' : ', not ' + ans + '.'));
    }
    var g = its[0].group, q = g ? '<p class="wd-group">The question for every line: <i>' + g + '</i></p>' + (wrongOne ? 'One line has the <b>wrong</b> answer. Which line is it?' : n === 2 ? 'Which line has the <b>right</b> answer?' : 'Only one line has the right answer. Which line is it?') : wrongOne ? 'Each line is a question and an answer. One answer is <b>wrong</b>. Which line is it?'
      : (n === 2 ? 'Each line is a question and an answer. Which line has the <b>right</b> answer?' : 'Each line is a question and an answer. Only one answer is right. Which line is it?');
    if (its[target].why) steps.push(its[target].why);
    return { q: q, a: { t: 'mc', choices: lines, v: target }, steps: steps, hint: 'Check each line on its own. Does the answer fit the question?' };
  }
  function tfpick(base, R, ctx, wantFalse) {
    var its = harvest(base, R, ctx, tfItem, 6, function (it) { return ['s:' + it.s]; });
    var T = its.filter(function (x) { return x.v; }), F = its.filter(function (x) { return !x.v; });
    var odd = wantFalse ? F : T, rest = wantFalse ? T : F;
    if (!odd.length || rest.length < 2) return null;
    var pick = [odd[0], rest[0], rest[1]], order = R.shuffle([0, 1, 2]), choices = order.map(function (i) { return pick[i].s; });
    var steps = pick.map(function (x) { return x.s + ' ' + (x.v ? 'True.' : 'False.'); });
    if (odd[0].why) steps.push(odd[0].why);
    return { q: wantFalse ? 'Which sentence is <b>false</b>?' : 'Which sentence is <b>true</b>?', a: { t: 'mc', choices: choices, v: order.indexOf(0) }, steps: steps,
      hint: 'Decide about each sentence on its own.' };
  }
  var MIX = CFG.mix || { 1: [0.38, 0.25, 0.04], 2: [0.27, 0.3, 0.1], 3: [0.17, 0.4, 0.15] };
  function wrap(id, base) {
    var fn = function (R, ctx) {
      var lv = ctx && ctx.level || 1, p = base(R, ctx), m = MIX[lv] || MIX[3], r = R.next();
      if (p.nowiden || !p.a || (p.a.t !== 'mc' && p.a.t !== 'tf') || (CFG.skip && CFG.skip.indexOf(id) >= 0)) return p; // typed answers stay as they are
      var form = r < m[0] ? 0 : r < m[0] + m[1] ? 1 : r < m[0] + m[1] + m[2] ? 2 : -1;
      if (form < 0) return p;
      var tries = [form, (form + 1) % 3, (form + 2) % 3].filter(function (f) { return m[f] > 0; });
      for (var t = 0; t < tries.length; t++) {
        var f = tries[t], alt = null;
        if (f === 0) alt = single(p) ? check(p, R) : (p.a && p.a.t === 'mc' && Array.isArray(p.a.v) && !p.viz ? checkAll(p, R) : null);
        else if (f === 1) alt = pairs(base, R, ctx, lv === 1 ? 2 : 3, lv >= 3 && R.chance(0.6));
        else alt = tfpick(base, R, ctx, R.chance(0.4));
        if (alt) return alt;
      }
      return p;
    };
    fn.widened = true;
    return fn;
  }
  ML.genIds().forEach(function (id) {
    if (id.indexOf(CFG.prefix) !== 0 || (CFG.only && CFG.only.indexOf(id.slice(CFG.prefix.length)) < 0)) return;
    var g = ML.getGen(id); if (g && !g.widened) ML.gen(id, wrap(id, g));
  });
})(typeof window !== 'undefined' ? window.MathLadder : undefined);
/* ---- end widen ---- */
