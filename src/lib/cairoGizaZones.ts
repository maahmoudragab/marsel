/**
 * Comprehensive Cairo & Giza Delivery Zones Dataset
 * Bilingual: Natural Egyptian Arabic & Phonetic/Egyptian English Transliterations
 */

export interface CairoGizaZone {
  id: string;
  governorate: "Cairo" | "Giza";
  governorateAr: "القاهرة" | "الجيزة";
  nameEn: string;
  nameAr: string;
  shippingFee: number;
}

export const CAIRO_GIZA_ZONES: CairoGizaZone[] = [
  // ==========================================
  // CAIRO GOVERNORATE (القاهرة)
  // ==========================================
  // Nasr City & Extensions
  { id: "nasr-city", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City", nameAr: "مدينة نصر", shippingFee: 60 },
  { id: "nasr-city-makram", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City - Makram Ebeid", nameAr: "مدينة نصر - مكرم عبيد", shippingFee: 60 },
  { id: "nasr-city-abbas", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City - Abbas El Akkad", nameAr: "مدينة نصر - عباس العقاد", shippingFee: 60 },
  { id: "nasr-city-tayaran", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City - Tayaran", nameAr: "مدينة نصر - الطيران", shippingFee: 60 },
  { id: "nasr-city-1st", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City - 1st District", nameAr: "مدينة نصر - الحي الأول", shippingFee: 60 },
  { id: "nasr-city-7th", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City - 7th District", nameAr: "مدينة نصر - الحي السابع", shippingFee: 60 },
  { id: "nasr-city-8th", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City - 8th District", nameAr: "مدينة نصر - الحي الثامن", shippingFee: 60 },
  { id: "nasr-city-10th", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City - 10th District", nameAr: "مدينة نصر - الحي العاشر", shippingFee: 60 },
  { id: "nasr-city-zahraa", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City - Zahraa Nasr City", nameAr: "زهراء مدينة نصر", shippingFee: 60 },
  { id: "nasr-city-waha", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Nasr City - El Waha", nameAr: "مدينة نصر - الواحة", shippingFee: 60 },

  // Masr El Gedida (Heliopolis) & Sheraton
  { id: "masr-el-gedida", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Masr El Gedida (Heliopolis)", nameAr: "مصر الجديدة", shippingFee: 60 },
  { id: "masr-el-gedida-korba", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Masr El Gedida - Korba", nameAr: "مصر الجديدة - الكوربة", shippingFee: 60 },
  { id: "masr-el-gedida-roxy", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Masr El Gedida - Roxy", nameAr: "مصر الجديدة - روكسي", shippingFee: 60 },
  { id: "masr-el-gedida-merghany", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Masr El Gedida - El Merghany", nameAr: "مصر الجديدة - الميرغني", shippingFee: 60 },
  { id: "masr-el-gedida-hegaz", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Masr El Gedida - Square Hegaz", nameAr: "مصر الجديدة - ميدان الحجاز", shippingFee: 60 },
  { id: "masr-el-gedida-triumph", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Masr El Gedida - Square Triumph", nameAr: "مصر الجديدة - ميدان تريومف", shippingFee: 60 },
  { id: "sheraton-heliopolis", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Sheraton Heliopolis", nameAr: "شيراتون هليوبوليس", shippingFee: 60 },

  // New Cairo & Tagamoat
  { id: "tagamoa-5th", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tagamoa El Khames (5th Settlement)", nameAr: "التجمع الخامس", shippingFee: 65 },
  { id: "tagamoa-90th", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tagamoa El Khames - 90th Street", nameAr: "التجمع الخامس - شارع التسعين", shippingFee: 65 },
  { id: "tagamoa-narges", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tagamoa El Khames - El Narges", nameAr: "التجمع الخامس - النرجس", shippingFee: 65 },
  { id: "tagamoa-yasmeen", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tagamoa El Khames - El Yasmeen", nameAr: "التجمع الخامس - الياسمين", shippingFee: 65 },
  { id: "tagamoa-banafseg", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tagamoa El Khames - El Banafseg", nameAr: "التجمع الخامس - البنفسج", shippingFee: 65 },
  { id: "tagamoa-choueifat", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tagamoa El Khames - El Choueifat", nameAr: "التجمع الخامس - الشويفات", shippingFee: 65 },
  { id: "tagamoa-south-academy", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tagamoa El Khames - South Academy", nameAr: "التجمع الخامس - جنوب الأكاديمية", shippingFee: 65 },
  { id: "tagamoa-1st", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tagamoa El Awal (1st Settlement)", nameAr: "التجمع الأول", shippingFee: 65 },
  { id: "tagamoa-3rd", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tagamoa El Talet (3rd Settlement)", nameAr: "التجمع الثالث", shippingFee: 65 },
  { id: "beit-el-watan", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "New Cairo - Beit El Watan", nameAr: "القاهرة الجديدة - بيت الوطن", shippingFee: 65 },
  { id: "el-rehab", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Rehab City", nameAr: "مدينة الرحاب", shippingFee: 65 },
  { id: "madinaty", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Madinaty", nameAr: "مدينتي", shippingFee: 70 },
  { id: "el-shorouk", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Shorouk City", nameAr: "مدينة الشروق", shippingFee: 70 },
  { id: "badr-city", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Badr City", nameAr: "مدينة بدر", shippingFee: 70 },
  { id: "el-obour", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Obour City", nameAr: "مدينة العبور", shippingFee: 70 },
  { id: "mostakbal-city", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Mostakbal City", nameAr: "المستقبل سيتي", shippingFee: 70 },
  { id: "new-capital", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "New Administrative Capital", nameAr: "العاصمة الإدارية الجديدة", shippingFee: 75 },

  // Maadi & Mokattam
  { id: "el-maadi", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Maadi", nameAr: "المعادي", shippingFee: 60 },
  { id: "maadi-sarayat", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Maadi - Sarayat", nameAr: "سرايات المعادي", shippingFee: 60 },
  { id: "maadi-degla", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Maadi - Degla", nameAr: "دجلة المعادي", shippingFee: 60 },
  { id: "maadi-corniche", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Maadi - Corniche", nameAr: "كورنيش المعادي", shippingFee: 60 },
  { id: "zahraa-el-maadi", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Zahraa El Maadi", nameAr: "زهراء المعادي", shippingFee: 60 },
  { id: "hadayek-el-maadi", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Hadayek El Maadi", nameAr: "حدائق المعادي", shippingFee: 60 },
  { id: "el-mokattam", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Mokattam", nameAr: "المقطم", shippingFee: 60 },
  { id: "mokattam-hadaba-wosta", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Mokattam - Hadaba Wosta", nameAr: "المقطم - الهضبة الوسطى", shippingFee: 60 },
  { id: "mokattam-hadaba-olya", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Mokattam - Hadaba Olya", nameAr: "المقطم - الهضبة العليا", shippingFee: 60 },
  { id: "el-katameya", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Katameya", nameAr: "القطامية", shippingFee: 65 },
  { id: "el-asmarat", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Asmarat", nameAr: "الأسمرات", shippingFee: 65 },

  // Central Cairo & Nile
  { id: "el-zamalek", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Zamalek", nameAr: "الزمالك", shippingFee: 60 },
  { id: "wust-el-balad", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Wust El Balad (Downtown)", nameAr: "وسط البلد", shippingFee: 60 },
  { id: "garden-city", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Garden City", nameAr: "جاردن سيتي", shippingFee: 60 },
  { id: "el-manial", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Manial", nameAr: "المنيل", shippingFee: 60 },

  // Shoubra & North Cairo
  { id: "shoubra-masr", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Shoubra Masr", nameAr: "شبرا مصر", shippingFee: 60 },
  { id: "shoubra-el-kheima", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Shoubra El Kheima", nameAr: "شبرا الخيمة", shippingFee: 65 },
  { id: "rod-el-farag", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Rod El Farag", nameAr: "روض الفرج", shippingFee: 60 },
  { id: "el-sahel", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Sahel", nameAr: "الساحل", shippingFee: 60 },

  // East & Mid Cairo
  { id: "ain-shams", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Ain Shams", nameAr: "عين شمس", shippingFee: 60 },
  { id: "ain-shams-east", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Ain Shams El Sharkiya", nameAr: "عين شمس الشرقية", shippingFee: 60 },
  { id: "ain-shams-west", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Ain Shams El Gharbiya", nameAr: "عين شمس الغربية", shippingFee: 60 },
  { id: "el-matariya", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Matariya", nameAr: "المطرية", shippingFee: 60 },
  { id: "el-zaytoun", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Zaytoun", nameAr: "الزيتون", shippingFee: 60 },
  { id: "hadayek-el-kobba", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Hadayek El Kobba", nameAr: "حدائق القبة", shippingFee: 60 },
  { id: "saray-el-kobba", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Saray El Kobba", nameAr: "سراي القبة", shippingFee: 60 },
  { id: "kobry-el-kobba", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Kobry El Kobba", nameAr: "كوبري القبة", shippingFee: 60 },
  { id: "el-abbassia", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Abbassia", nameAr: "العباسية", shippingFee: 60 },
  { id: "el-waili", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Waili", nameAr: "الوايلي", shippingFee: 60 },
  { id: "manshiyet-el-sadr", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Manshiyet El Sadr", nameAr: "منشية الصدر", shippingFee: 60 },
  { id: "manshiyet-el-bakry", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Manshiyet El Bakry", nameAr: "منشية البكري", shippingFee: 60 },
  { id: "el-nozha-el-gedida", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Nozha El Gedida", nameAr: "النزهة الجديدة", shippingFee: 60 },
  { id: "gesr-el-suez", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Gesr El Suez", nameAr: "جسر السويس", shippingFee: 60 },
  { id: "alf-maskan", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Alf Maskan", nameAr: "الألف مسكن", shippingFee: 60 },
  { id: "el-marg", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Marg", nameAr: "المرج", shippingFee: 60 },
  { id: "el-marg-el-gedida", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Marg El Gedida", nameAr: "المرج الجديدة", shippingFee: 60 },
  { id: "el-salam", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Madinet El Salam", nameAr: "مدينة السلام", shippingFee: 60 },
  { id: "ezbet-el-nakhl", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Ezbet El Nakhl", nameAr: "عزبة النخل", shippingFee: 60 },

  // Historic & Old Cairo
  { id: "el-zaher", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Zaher", nameAr: "الظاهر", shippingFee: 60 },
  { id: "bab-el-shariya", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Bab El Shariya", nameAr: "باب الشعرية", shippingFee: 60 },
  { id: "sayeda-zeinab", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Sayeda Zeinab", nameAr: "السيدة زينب", shippingFee: 60 },
  { id: "masr-el-qadima", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Masr El Qadima (Old Cairo)", nameAr: "مصر القديمة", shippingFee: 60 },
  { id: "el-fustat", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Fustat", nameAr: "الفسطاط", shippingFee: 60 },
  { id: "abdeen", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Abdeen", nameAr: "عابدين", shippingFee: 60 },
  { id: "el-mosky", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Mosky", nameAr: "الموسكي", shippingFee: 60 },
  { id: "el-azhar", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Azhar", nameAr: "الأزهر", shippingFee: 60 },
  { id: "el-darb-el-ahmar", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Darb El Ahmar", nameAr: "الدرب الأحمر", shippingFee: 60 },
  { id: "el-helmeya", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Helmeya", nameAr: "الحلمية", shippingFee: 60 },
  { id: "helmeyet-el-zaytoun", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Helmeyet El Zaytoun", nameAr: "حلمية الزيتون", shippingFee: 60 },

  // South Cairo & Helwan
  { id: "helwan", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Helwan", nameAr: "حلوان", shippingFee: 70 },
  { id: "hadayek-helwan", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Hadayek Helwan", nameAr: "حدائق حلوان", shippingFee: 70 },
  { id: "el-maasara", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Maasara", nameAr: "المعصرة", shippingFee: 70 },
  { id: "tora", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "Tora", nameAr: "طرة", shippingFee: 65 },
  { id: "15th-may-city", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "15th of May City", nameAr: "مدينة ١٥ مايو", shippingFee: 75 },
  { id: "el-tebbin", governorate: "Cairo", governorateAr: "القاهرة", nameEn: "El Tebbin", nameAr: "التبين", shippingFee: 75 },

  // ==========================================
  // GIZA GOVERNORATE (الجيزة)
  // ==========================================
  // Central Giza (Mohandessin, Dokki, Agouza)
  { id: "el-mohandessin", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Mohandessin", nameAr: "المهندسين", shippingFee: 65 },
  { id: "mohandessin-gameat-dowal", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Mohandessin - Gameat El Dowal", nameAr: "المهندسين - جامعة الدول", shippingFee: 65 },
  { id: "mohandessin-shehab", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Mohandessin - Shehab", nameAr: "المهندسين - شارع شهاب", shippingFee: 65 },
  { id: "mohandessin-lebnan", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Mohandessin - Midan Lebnan", nameAr: "المهندسين - ميدان لبنان", shippingFee: 65 },
  { id: "el-dokki", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Dokki", nameAr: "الدقي", shippingFee: 65 },
  { id: "dokki-mesaha", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Dokki - Midan El Mesaha", nameAr: "الدقي - ميدان المساحة", shippingFee: 65 },
  { id: "dokki-mossadak", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Dokki - Mossadak", nameAr: "الدقي - شارع مصدق", shippingFee: 65 },
  { id: "dokki-tahrir", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Dokki - Tahrir Street", nameAr: "الدقي - شارع التحرير", shippingFee: 65 },
  { id: "el-agouza", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Agouza", nameAr: "العجوزة", shippingFee: 65 },
  { id: "agouza-corniche", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Agouza - Nile Corniche", nameAr: "العجوزة - كورنيش النيل", shippingFee: 65 },
  { id: "kit-kat", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Kit Kat", nameAr: "الكيت كات", shippingFee: 65 },

  // Sheikh Zayed & October
  { id: "sheikh-zayed", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Sheikh Zayed", nameAr: "الشيخ زايد", shippingFee: 75 },
  { id: "sheikh-zayed-beverly", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Sheikh Zayed - Beverly Hills", nameAr: "الشيخ زايد - بيفرلي هيلز", shippingFee: 75 },
  { id: "sheikh-zayed-hyper", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Sheikh Zayed - Hyper One Area", nameAr: "الشيخ زايد - محيط هايبر وان", shippingFee: 75 },
  { id: "sheikh-zayed-dahshur", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Sheikh Zayed - Waslet Dahshur", nameAr: "الشيخ زايد - وصلة دهشور", shippingFee: 75 },
  { id: "sheikh-zayed-green-belt", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Sheikh Zayed - Green Belt", nameAr: "الشيخ زايد - الثورة الخضراء", shippingFee: 75 },
  { id: "6th-of-october", governorate: "Giza", governorateAr: "الجيزة", nameEn: "6th of October", nameAr: "٦ أكتوبر", shippingFee: 75 },
  { id: "october-hosary", governorate: "Giza", governorateAr: "الجيزة", nameEn: "6th of October - Midan El Hosary", nameAr: "٦ أكتوبر - ميدان الحصري", shippingFee: 75 },
  { id: "october-districts", governorate: "Giza", governorateAr: "الجيزة", nameEn: "6th of October - Districts (1-12)", nameAr: "٦ أكتوبر - الأحياء (من ١ إلى ١٢)", shippingFee: 75 },
  { id: "october-motamayez", governorate: "Giza", governorateAr: "الجيزة", nameEn: "6th of October - El Motamayez", nameAr: "٦ أكتوبر - الحي المتميز", shippingFee: 75 },
  { id: "october-northern-expansions", governorate: "Giza", governorateAr: "الجيزة", nameEn: "6th of October - Northern Expansions", nameAr: "٦ أكتوبر - التوسعات الشمالية", shippingFee: 75 },
  { id: "october-industrial-zone", governorate: "Giza", governorateAr: "الجيزة", nameEn: "6th of October - Industrial Zone", nameAr: "٦ أكتوبر - المنطقة الصناعية", shippingFee: 80 },
  { id: "october-ashgar", governorate: "Giza", governorateAr: "الجيزة", nameEn: "6th of October - Hay El Ashgar", nameAr: "٦ أكتوبر - حي الأشجار", shippingFee: 75 },
  { id: "hadayek-october", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Hadayek October", nameAr: "حدائق أكتوبر", shippingFee: 75 },
  { id: "hadayek-october-degla-palms", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Hadayek October - Degla Palms", nameAr: "حدائق أكتوبر - دجلة بالمز", shippingFee: 75 },
  { id: "october-southern-expansions", governorate: "Giza", governorateAr: "الجيزة", nameEn: "October - Southern Expansions", nameAr: "أكتوبر - التوسعات الجنوبية", shippingFee: 75 },

  // Hadayek El Ahram (Pyramid Gardens)
  { id: "hadayek-el-ahram", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Hadayek El Ahram", nameAr: "حدائق الأهرام", shippingFee: 70 },
  { id: "hadayek-ahram-gate1", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Hadayek El Ahram - Gate 1 (Khofo)", nameAr: "حدائق الأهرام - البوابة الأولى (خوفو)", shippingFee: 70 },
  { id: "hadayek-ahram-gate2", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Hadayek El Ahram - Gate 2 (Khafraa)", nameAr: "حدائق الأهرام - البوابة الثانية (خفرع)", shippingFee: 70 },
  { id: "hadayek-ahram-gate3", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Hadayek El Ahram - Gate 3 (Menkaure)", nameAr: "حدائق الأهرام - البوابة الثالثة (منقرع)", shippingFee: 70 },
  { id: "hadayek-ahram-gate4", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Hadayek El Ahram - Gate 4 (Mina)", nameAr: "حدائق الأهرام - البوابة الرابعة (مينا)", shippingFee: 70 },

  // Haram & Faisal
  { id: "el-haram", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Haram", nameAr: "الهرم", shippingFee: 65 },
  { id: "haram-maryoutia", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Haram - El Maryoutia", nameAr: "الهرم - المريوطية", shippingFee: 65 },
  { id: "haram-libini", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Haram - El Libini", nameAr: "الهرم - اللبيني", shippingFee: 65 },
  { id: "haram-meshaal", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Haram - Meshaal", nameAr: "الهرم - مشعل", shippingFee: 65 },
  { id: "haram-arish", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Haram - El Arish", nameAr: "الهرم - العريش", shippingFee: 65 },
  { id: "haram-nasr-el-din", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Haram - Nasr El Din", nameAr: "الهرم - نصر الدين", shippingFee: 65 },
  { id: "faisal", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Faisal", nameAr: "فيصل", shippingFee: 65 },
  { id: "faisal-eshreen", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Faisal - El Eshreen", nameAr: "فيصل - شارع العشرين", shippingFee: 65 },
  { id: "faisal-tawoon", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Faisal - El Tawoon", nameAr: "فيصل - التعاون", shippingFee: 65 },
  { id: "faisal-talbiya", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Faisal - El Talbiya", nameAr: "فيصل - الطالبية", shippingFee: 65 },
  { id: "faisal-hassan-mohamed", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Faisal - Hassan Mohamed", nameAr: "فيصل - حسن محمد", shippingFee: 65 },
  { id: "faisal-kafr-tohormos", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Faisal - Kafr Tohormos", nameAr: "فيصل - كفر طهرمس", shippingFee: 65 },

  // Omraneya & Giza Core
  { id: "el-omraneya", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Omraneya", nameAr: "العمرانية", shippingFee: 65 },
  { id: "omraneya-sharkiya", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Omraneya El Sharkiya", nameAr: "العمرانية الشرقية", shippingFee: 65 },
  { id: "omraneya-gharbiya", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Omraneya El Gharbiya", nameAr: "العمرانية الغربية", shippingFee: 65 },
  { id: "el-talbiya", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Talbiya", nameAr: "الطالبية", shippingFee: 65 },
  { id: "giza-square", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Giza - Midan El Giza", nameAr: "الجيزة - ميدان الجيزة", shippingFee: 65 },
  { id: "giza-bahr-aazam", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Giza - Bahr El Aazam", nameAr: "الجيزة - شارع البحر الأعظم", shippingFee: 65 },
  { id: "giza-mourad", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Giza - Mourad Street", nameAr: "الجيزة - شارع مراد", shippingFee: 65 },
  { id: "giza-gamea", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Giza - Gamea Street", nameAr: "الجيزة - شارع الجامعة", shippingFee: 65 },

  // Imbaba & North Giza
  { id: "imbaba", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Imbaba", nameAr: "إمبابة", shippingFee: 65 },
  { id: "imbaba-wehda", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Imbaba - El Wehda Street", nameAr: "إمبابة - شارع الوحدة", shippingFee: 65 },
  { id: "mounira-gharbiya", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Mounira El Gharbiya", nameAr: "المنيرة الغربية", shippingFee: 65 },
  { id: "bashtil", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Bashtil", nameAr: "بشتيل", shippingFee: 65 },
  { id: "el-warraq", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Warraq", nameAr: "الوراق", shippingFee: 65 },
  { id: "kerdasa", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Kerdasa", nameAr: "كرداسة", shippingFee: 70 },
  { id: "abu-rawash", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Abu Rawash", nameAr: "أبو رواش", shippingFee: 70 },
  { id: "smart-village", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Smart Village", nameAr: "القرية الذكية", shippingFee: 75 },

  // West & South Giza Districts
  { id: "bein-el-sarayat", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Bein El Sarayat", nameAr: "بين السرايات", shippingFee: 65 },
  { id: "saft-el-laban", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Saft El Laban", nameAr: "صفط اللبن", shippingFee: 65 },
  { id: "ard-el-lewa", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Ard El Lewa", nameAr: "أرض اللواء", shippingFee: 65 },
  { id: "el-moneeb", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Moneeb", nameAr: "المنيب", shippingFee: 65 },
  { id: "saqiyet-mekki", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Saqiyet Mekki", nameAr: "ساقية مكي", shippingFee: 65 },
  { id: "geziret-el-dahab", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Geziret El Dahab", nameAr: "جزيرة الدهب", shippingFee: 65 },
  { id: "tersa", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Tersa", nameAr: "ترسا", shippingFee: 65 },
  { id: "oseem", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Oseem", nameAr: "أوسيم", shippingFee: 70 },
  { id: "el-baragil", governorate: "Giza", governorateAr: "الجيزة", nameEn: "El Baragil", nameAr: "البراجيل", shippingFee: 70 },
  { id: "al-hawamdeya", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Al Hawamdeya", nameAr: "الحوامدية", shippingFee: 75 },
  { id: "al-badrasheen", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Al Badrasheen", nameAr: "البدرشين", shippingFee: 80 },
  { id: "al-ayyat", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Al Ayyat", nameAr: "العياط", shippingFee: 85 },
  { id: "al-saff", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Al Saff", nameAr: "الصف", shippingFee: 85 },
  { id: "atfeeh", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Atfeeh", nameAr: "أطفيح", shippingFee: 90 },
  { id: "manshiyet-el-qanater", governorate: "Giza", governorateAr: "الجيزة", nameEn: "Manshiyet El Qanater", nameAr: "منشأة القناطر", shippingFee: 75 },
];

/**
 * Normalization helper for Egyptian place names
 */
function normalizeString(str: string): string {
  return (str || "")
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[-_.,()\/]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Find zone by id, nameAr, nameEn, or partial match
 */
export function findZone(query: string, gov?: string): CairoGizaZone | undefined {
  if (!query) return undefined;
  const qNorm = normalizeString(query);

  let pool = CAIRO_GIZA_ZONES;
  if (gov) {
    const isCairo = gov.toLowerCase().includes("cairo") || gov.includes("قاهر");
    const isGiza = gov.toLowerCase().includes("giza") || gov.includes("جيز");
    if (isCairo) {
      pool = CAIRO_GIZA_ZONES.filter((z) => z.governorate === "Cairo");
    } else if (isGiza) {
      pool = CAIRO_GIZA_ZONES.filter((z) => z.governorate === "Giza");
    }
  }

  // 1. Exact ID match
  const byId = pool.find((z) => z.id.toLowerCase() === query.trim().toLowerCase());
  if (byId) return byId;

  // 2. Exact name match
  const byName = pool.find(
    (z) =>
      normalizeString(z.nameAr) === qNorm ||
      normalizeString(z.nameEn) === qNorm
  );
  if (byName) return byName;

  // 3. Partial contains match
  return pool.find(
    (z) =>
      qNorm.includes(normalizeString(z.nameAr)) ||
      normalizeString(z.nameAr).includes(qNorm) ||
      qNorm.includes(normalizeString(z.nameEn)) ||
      normalizeString(z.nameEn).includes(qNorm)
  );
}

/**
 * Get sorted zones for a governorate
 */
export function getZonesByGovernorate(gov: string): CairoGizaZone[] {
  const isCairo = (gov || "").toLowerCase().includes("cairo") || (gov || "").includes("قاهر");
  const targetGov = isCairo ? "Cairo" : "Giza";
  return CAIRO_GIZA_ZONES.filter((z) => z.governorate === targetGov);
}

/**
 * Get localized name for an area string
 */
export function getLocalizedArea(areaValue: string, isArabic: boolean): string {
  if (!areaValue) return "";
  const matched = findZone(areaValue);
  if (!matched) return areaValue;
  return isArabic ? matched.nameAr : matched.nameEn;
}
