// 指定年の第n曜日の日付を返す（weekday: 0=日〜6=土）
function nthWeekday(year: number, month: number, weekday: number, n: number): number {
    const firstDay = new Date(year, month - 1, 1).getDay()
    const diff = (weekday - firstDay + 7) % 7
    return 1 + diff + (n - 1) * 7
}

// 春分の日（3月）
function vernalEquinox(year: number): number {
    return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
}

// 秋分の日（9月）
function autumnalEquinox(year: number): number {
    return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4))
}

// 指定年の祝日を Map<'yyyy-MM-dd', 祝日名> で返す
export function getHolidaysForYear(year: number): Map<string, string> {
    const holidays = new Map<string, string>()

    const add = (month: number, day: number, name: string) => {
        const key = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        holidays.set(key, name)
    }

    // 固定祝日
    add(1, 1, '元日')
    add(2, 11, '建国記念の日')
    add(2, 23, '天皇誕生日')
    add(3, vernalEquinox(year), '春分の日')
    add(4, 29, '昭和の日')
    add(5, 3, '憲法記念日')
    add(5, 4, 'みどりの日')
    add(5, 5, 'こどもの日')
    add(8, 11, '山の日')
    add(9, autumnalEquinox(year), '秋分の日')
    add(11, 3, '文化の日')
    add(11, 23, '勤労感謝の日')

    // 第n月曜日系
    add(1, nthWeekday(year, 1, 1, 2), '成人の日')       // 1月第2月曜
    add(7, nthWeekday(year, 7, 1, 3), '海の日')         // 7月第3月曜
    add(9, nthWeekday(year, 9, 1, 3), '敬老の日')       // 9月第3月曜
    add(10, nthWeekday(year, 10, 1, 2), 'スポーツの日') // 10月第2月曜

    // 振替休日（祝日が日曜 → 祝日でない日が見つかるまで1日ずつ後ろへ）
    holidays.forEach((_, key) => {
        const date = new Date(key)
        if (date.getDay() === 0) {
            const candidate = new Date(date)
            candidate.setDate(candidate.getDate() + 1)
            while (holidays.has(candidate.toISOString().slice(0, 10))) {
                candidate.setDate(candidate.getDate() + 1)
            }
            holidays.set(candidate.toISOString().slice(0, 10), '振替休日')
        }
    })

    return holidays
}
