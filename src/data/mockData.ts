import { group } from "console";

export const dayNames = [
  "Bazar ertəsi",
  "Çərşənbə axşamı", 
  "Çərşənbə",
  "Cümə axşamı",
  "Cümə"
];

export const mockScheduleData: ScheduleData = {
  faculty: {
    faculty_id: 1,
    faculty_name: "ITT",
    groups: [
      {
        group_id: 1,
        group_name: "688a3",
        days: [
          {
            day_id: 1, // Bazar ertəsi
            hours: [
              {
                hour_id: 1,
                lessons: [
                  {
                    id: 1,
                    schedule_id: 1,
                    subject_id: 10,
                    subject_name: "İnformasiya Texnologiyalarına Giriş",
                    lesson_type_id: 1,
                    lesson_type_name: "Mühazirə",
                    teacher: {
                      code: "5YHKL34",
                      name: "Ruhid",
                      surname: "Novruzov"
                    },
                    room: {
                      room_id: 3,
                      room_name: "248",
                      corp_name: "1-ci korpus"
                    },
                    week_type_id: 1,
                    week_type_name: "ümumi həftə",
                    confirm_status: 1,
                    blocked: false
                  }
                ]
              },
              {
                hour_id: 2,
                lessons: [
                  {
                    id: 2,
                    schedule_id: 2,
                    subject_id: 11,
                    subject_name: "İngilis Dili 2",
                    lesson_type_id: 2,
                    lesson_type_name: "Məşğələ",
                    teacher: {
                      code: "8HKL56",
                      name: "Səbinə",
                      surname: "Məmmədova"
                    },
                    room: {
                      room_id: 5,
                      room_name: "341",
                      corp_name: "5-ci korpus"
                    },
                    week_type_id: 2,
                    week_type_name: "üst həftə",
                    confirm_status: 1,
                    blocked: true
                  },
                  {
                    id: 3,
                    schedule_id: 3,
                    subject_id: 12,
                    subject_name: "Alman Dili 2",
                    lesson_type_id: 2,
                    lesson_type_name: "Məşğələ",
                    teacher: {
                      code: "9XLZ78",
                      name: "Günay",
                      surname: "Həsənova"
                    },
                    room: {
                      room_id: 6,
                      room_name: "220",
                      corp_name: "3-cü korpus"
                    },
                    week_type_id: 3,
                    week_type_name: "alt həftə",
                    confirm_status: 1,
                    blocked: true
                  }
                ]
              },
              {
                hour_id: 3,
                lessons: [
                  {
                    id: 4,
                    schedule_id: 4,
                    subject_id: 13,
                    subject_name: "Riyaziyyat",
                    lesson_type_id: 3,
                    lesson_type_name: "Laboratoriya",
                    teacher: {
                      code: "3ABC12",
                      name: "Elmar",
                      surname: "Quliyev"
                    },
                    room: {
                      room_id: 7,
                      room_name: "105",
                      corp_name: "2-ci korpus"
                    },
                    week_type_id: 1,
                    week_type_name: "ümumi həftə",
                    confirm_status: 1,
                    blocked: false
                  }
                ]
              }
            ]
          },
          {
            day_id: 2, // Çərşənbə axşamı
            hours: [
              {
                hour_id: 1,
                lessons: [
                  {
                    id: 5,
                    schedule_id: 5,
                    subject_id: 14,
                    subject_name: "Proqramlaşdırma",
                    lesson_type_id: 1,
                    lesson_type_name: "Mühazirə",
                    teacher: {
                      code: "4DEF89",
                      name: "Kamran",
                      surname: "Əliyev"
                    },
                    room: {
                      room_id: 8,
                      room_name: "315",
                      corp_name: "4-cü korpus"
                    },
                    week_type_id: 1,
                    week_type_name: "ümumi həftə",
                    confirm_status: 1,
                    blocked: false
                  }
                ]
              },
              {
                hour_id: 4,
                lessons: [
                  {
                    id: 6,
                    schedule_id: 6,
                    subject_id: 15,
                    subject_name: "Fizika",
                    lesson_type_id: 2,
                    lesson_type_name: "Məşğələ",
                    teacher: {
                      code: "7GHI45",
                      name: "Nigar",
                      surname: "Rəhimova"
                    },
                    room: {
                      room_id: 9,
                      room_name: "423",
                      corp_name: "1-ci korpus"
                    },
                    week_type_id: 2,
                    week_type_name: "üst həftə",
                    confirm_status: 1,
                    blocked: false
                  }
                ]
              }
            ]
          },
          {
            day_id: 3, // Çərşənbə
            hours: [
              {
                hour_id: 2,
                lessons: [
                  {
                    id: 7,
                    schedule_id: 7,
                    subject_id: 16,
                    subject_name: "Verilənlər Bazası",
                    lesson_type_id: 3,
                    lesson_type_name: "Laboratoriya",
                    teacher: {
                      code: "2JKL67",
                      name: "Orxan",
                      surname: "Babayev"
                    },
                    room: {
                      room_id: 10,
                      room_name: "201",
                      corp_name: "5-ci korpus"
                    },
                    week_type_id: 1,
                    week_type_name: "ümumi həftə",
                    confirm_status: 1,
                    blocked: true
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        group_id: 2,
        group_name: "688b1",
        days: [
          {
            day_id: 1, // Bazar ertəsi
            hours: [
              {
                hour_id: 1,
                lessons: [
                  {
                    id: 8,
                    schedule_id: 8,
                    subject_id: 17,
                    subject_name: "Web Proqramlaşdırma",
                    lesson_type_id: 1,
                    lesson_type_name: "Mühazirə",
                    teacher: {
                      code: "6MNO23",
                      name: "Aytən",
                      surname: "İsmayılova"
                    },
                    room: {
                      room_id: 11,
                      room_name: "302",
                      corp_name: "3-cü korpus"
                    },
                    week_type_id: 1,
                    week_type_name: "ümumi həftə",
                    confirm_status: 1,
                    blocked: false
                  }
                ]
              },
              {
                hour_id: 3,
                lessons: [
                  {
                    id: 9,
                    schedule_id: 9,
                    subject_id: 18,
                    subject_name: "Şəbəkə Texnologiyaları",
                    lesson_type_id: 2,
                    lesson_type_name: "Məşğələ",
                    teacher: {
                      code: "1PQR90",
                      name: "Fərid",
                      surname: "Həsənov"
                    },
                    room: {
                      room_id: 12,
                      room_name: "150",
                      corp_name: "2-ci korpus"
                    },
                    week_type_id: 2,
                    week_type_name: "üst həftə",
                    confirm_status: 1,
                    blocked: false
                  },
                  {
                    id: 10,
                    schedule_id: 10,
                    subject_id: 19,
                    subject_name: "Mobil Proqramlaşdırma",
                    lesson_type_id: 2,
                    lesson_type_name: "Məşğələ",
                    teacher: {
                      code: "8STU56",
                      name: "Leyla",
                      surname: "Mustafayeva"
                    },
                    room: {
                      room_id: 13,
                      room_name: "401",
                      corp_name: "4-cü korpus"
                    },
                    week_type_id: 3,
                    week_type_name: "alt həftə",
                    confirm_status: 1,
                    blocked: true
                  }
                ]
              }
            ]
          },
          {
            day_id: 4, // Cümə axşamı
            hours: [
              {
                hour_id: 2,
                lessons: [
                  {
                    id: 11,
                    schedule_id: 11,
                    subject_id: 20,
                    subject_name: "Kiberavtanqatlıq",
                    lesson_type_id: 3,
                    lesson_type_name: "Laboratoriya",
                    teacher: {
                      code: "5VWX34",
                      name: "Rəsul",
                      surname: "Əhmədov"
                    },
                    room: {
                      room_id: 14,
                      room_name: "501",
                      corp_name: "1-ci korpus"
                    },
                    week_type_id: 1,
                    week_type_name: "ümumi həftə",
                    confirm_status: 1,
                    blocked: false
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        group_id: 3,
        group_name: "685a2",
        days: [
          {
            day_id: 2, // Çərşənbə axşamı
            hours: [
              {
                hour_id: 4,
                lessons: [
                  {
                    id: 12,
                    schedule_id: 12,
                    subject_id: 21,
                    subject_name: "Süni İntellekt",
                    lesson_type_id: 1,
                    lesson_type_name: "Mühazirə",
                    teacher: {
                      code: "9YZA78",
                      name: "Təranə",
                      surname: "Qədirzadə"
                    },
                    room: {
                      room_id: 15,
                      room_name: "308",
                      corp_name: "5-ci korpus"
                    },
                    week_type_id: 2,
                    week_type_name: "üst həftə",
                    confirm_status: 1,
                    blocked: true
                  },
                  {
                    id: 13,
                    schedule_id: 13,
                    subject_id: 22,
                    subject_name: "Maşın Öyrənməsi",
                    lesson_type_id: 1,
                    lesson_type_name: "Mühazirə",
                    teacher: {
                      code: "3BCD12",
                      name: "Murad",
                      surname: "Əlizadə"
                    },
                    room: {
                      room_id: 16,
                      room_name: "410",
                      corp_name: "3-cü korpus"
                    },
                    week_type_id: 3,
                    week_type_name: "alt həftə",
                    confirm_status: 1,
                    blocked: false
                  }
                ]
              },
              {
                hour_id: 5,
                lessons: [
                  {
                    id: 14,
                    schedule_id: 14,
                    subject_id: 23,
                    subject_name: "IoT Sistemləri",
                    lesson_type_id: 3,
                    lesson_type_name: "Laboratoriya",
                    teacher: {
                      code: "7EFG45",
                      name: "Zəhra",
                      surname: "Nəbiyeva"
                    },
                    room: {
                      room_id: 17,
                      room_name: "512",
                      corp_name: "2-ci korpus"
                    },
                    week_type_id: 1,
                    week_type_name: "ümumi həftə",
                    confirm_status: 1,
                    blocked: false
                  }
                ]
              }
            ]
          },
          {
            day_id: 5, // Cümə
            hours: [
              {
                hour_id: 1,
                lessons: [
                  {
                    id: 15,
                    schedule_id: 15,
                    subject_id: 24,
                    subject_name: "Layihə İdarəetməsi",
                    lesson_type_id: 2,
                    lesson_type_name: "Məşğələ",
                    teacher: {
                      code: "4HIJ89",
                      name: "Röya",
                      surname: "Vəliyeva"
                    },
                    room: {
                      room_id: 18,
                      room_name: "205",
                      corp_name: "4-cü korpus"
                    },
                    week_type_id: 1,
                    week_type_name: "ümumi həftə",
                    confirm_status: 1,
                    blocked: true
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },

  groups : [
    { group_id: 1, group_name: "688a3" },
    { group_id: 2, group_name: "688b1" },
    { group_id: 3, group_name: "685a2" }
  ],
 hours: [
    { id: 1, name: "09:00-10:20", time: "09:00-10:20", status: 1 },
    { id: 2, name: "10:30-11:50", time: "10:30-11:50", status: 1 },
    { id: 3, name: "12:00-13:20", time: "12:00-13:20", status: 1 },
    { id: 4, name: "13:35-14:55", time: "13:35-14:55", status: 1 },
    { id: 5, name: "15:05-16:25", time: "15:05-16:25", status: 1 },
    { id: 6, name: "16:35-17:55", time: "16:35-17:55", status: 1 }
  ],
  lesson_types: [
    { id: 1, name: "Mühazirə" },
    { id: 2, name: "Məşğələ" },
    { id: 3, name: "Laboratoriya" }
  ],
  week_types: [
    { id: 1, name: "ümumi həftə" },
    { id: 2, name: "üst həftə" },
    { id: 3, name: "alt həftə" }
  ],
  subjects: [
    { subject_id: 10, subject_name: "İnformasiya Texnologiyalarına Giriş" },
    { subject_id: 11, subject_name: "İngilis Dili 2" },
    { subject_id: 12, subject_name: "Alman Dili 2" },
    { subject_id: 13, subject_name: "Riyaziyyat" },
    { subject_id: 14, subject_name: "Proqramlaşdırma" },
    { subject_id: 15, subject_name: "Fizika" },
    { subject_id: 16, subject_name: "Verilənlər Bazası" },
    { subject_id: 17, subject_name: "Web Proqramlaşdırma" },
    { subject_id: 18, subject_name: "Şəbəkə Texnologiyaları" },
    { subject_id: 19, subject_name: "Mobil Proqramlaşdırma" },
    { subject_id: 20, subject_name: "Kiberavtanqatlıq" },
    { subject_id: 21, subject_name: "Süni İntellekt" },
    { subject_id: 22, subject_name: "Maşın Öyrənməsi" },
    { subject_id: 23, subject_name: "IoT Sistemləri" },
    { subject_id: 24, subject_name: "Layihə İdarəetməsi" }
  ],
  rooms: [
    { room_id: 3, room_name: "248", corp_name: "1-ci korpus" },
    { room_id: 5, room_name: "341", corp_name: "5-ci korpus" },
    { room_id: 6, room_name: "220", corp_name: "3-cü korpus" },
    { room_id: 7, room_name: "105", corp_name: "2-ci korpus" },
    { room_id: 8, room_name: "315", corp_name: "4-cü korpus" },
    { room_id: 9, room_name: "423", corp_name: "1-ci korpus" },
    { room_id: 10, room_name: "201", corp_name: "5-ci korpus" },
    { room_id: 11, room_name: "302", corp_name: "3-cü korpus" },
    { room_id: 12, room_name: "150", corp_name: "2-ci korpus" },
    { room_id: 13, room_name: "401", corp_name: "4-cü korpus" },
    { room_id: 14, room_name: "501", corp_name: "1-ci korpus" },
    { room_id: 15, room_name: "308", corp_name: "5-ci korpus" },
    { room_id: 16, room_name: "410", corp_name: "3-cü korpus" },
    { room_id: 17, room_name: "512", corp_name: "2-ci korpus" },
    { room_id: 18, room_name: "205", corp_name: "4-cü korpus" }
  ]
};