const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
] as const

type Short<S extends string> = S extends `${infer h1}${infer h2}${infer h3}${string}` ? `${h1}${h2}${h3}` : never
type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>
type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>> | T
type Pad<T extends string, P extends string> = T extends `${infer h1}${infer h2}${string}` ? `${h1}${h2}` : `${P}${T}`

type Day = typeof weekdays[number]
type Month = typeof months[number]

type Token<Tok> = '%' extends Tok
  ? '%'
  : 'a' extends Tok
  ? Short<Day>
  : 'A' extends Tok
  ? Day
  : 'b' extends Tok
  ? Short<Month>
  : 'B' extends Tok
  ? Month
  : 'c' extends Tok
  ? string
  : 'd' extends Tok
  ? Pad<`${Range<1, 31>}`, '0'>
  : 'e' extends Tok
  ? `${Range<1, 31>}`
  : 'H' extends Tok
  ? Pad<`${Range<1, 24>}`, '0'>
  : 'I' extends Tok
  ? Pad<`${Range<1, 12>}`, '0'>
  : 'l' extends Tok
  ? Pad<`${Range<1, 12>}`, ' '>
  : 'm' extends Tok
  ? Pad<`${Range<1, 12>}`, '0'>
  : 'M' extends Tok
  ? Pad<`${Range<0, 59>}`, '0'>
  : 'p' extends Tok
  ? 'am' | 'pm'
  : 'P' extends Tok
  ? 'AM' | 'PM'
  : 'S' extends Tok
  ? Pad<`${Range<0, 59>}`, '0'>
  : 'w' extends Tok
  ? `${Range<0, 6>}`
  : 'y' extends Tok
  ? Pad<`${Range<0, 99>}`, '0'>
  : 'Y' extends Tok
  ? `${Range<0, 9>}${Range<0, 9>}${Range<0, 9>}${Range<0, 9>}`
  : 'Z' extends Tok
  ? string
  : 'z' extends Tok
  ? `${'-' | '+'}${Range<0, 9>}${Range<0, 9>}${Range<0, 9>}${Range<0, 9>}`
  : Tok extends string
  ? `%${Tok}`
  : never

export type Strftime<Str> = Str extends `${infer Head}%${infer Tok}${infer Tail}`
  ? `${Head}${Token<Tok>}${Strftime<Tail>}`
  : Str extends `${infer Head}%${infer Tok}`
  ? `${Head}${Token<Tok>}`
  : Str extends string
  ? Str
  : never

export function strftime<Str extends string>(time: Date, formatString: Str): Strftime<Str> {
  const day = time.getDay()
  const date = time.getDate()
  const month = time.getMonth()
  const year = time.getFullYear()
  const hour = time.getHours()
  const minute = time.getMinutes()
  const second = time.getSeconds()
  return formatString.replace(/%([%aAbBcdeHIlmMpPSwyYZz])/g, function (_arg: string) {
    let match
    const modifier = _arg[1]
    switch (modifier) {
      case '%':
        return '%'
      case 'a':
        return weekdays[day].slice(0, 3)
      case 'A':
        return weekdays[day]
      case 'b':
        return months[month].slice(0, 3)
      case 'B':
        return months[month]
      case 'c':
        return time.toString()
      case 'd':
        return String(date).padStart(2, '0')
      case 'e':
        return String(date)
      case 'H':
        return String(hour).padStart(2, '0')
      case 'I':
        if (hour === 0 || hour === 12) {
          return String(12)
        } else {
          return String((hour + 12) % 12).padStart(2, '0')
        }
      case 'l':
        if (hour === 0 || hour === 12) {
          return String(12)
        } else {
          return String((hour + 12) % 12).padStart(2, ' ')
        }
      case 'm':
        return String(month + 1).padStart(2, '0')
      case 'M':
        return String(minute).padStart(2, '0')
      case 'p':
        if (hour > 11) {
          return 'PM'
        } else {
          return 'AM'
        }
      case 'P':
        if (hour > 11) {
          return 'pm'
        } else {
          return 'am'
        }
      case 'S':
        return String(second).padStart(2, '0')
      case 'w':
        return String(day)
      case 'y':
        return String(year % 100).padStart(2, '0')
      case 'Y':
        return String(year)
      case 'Z':
        match = time.toString().match(/\((\w+)\)$/)
        return match ? match[1] : ''
      case 'z':
        match = time.toString().match(/\w([+-]\d\d\d\d) /)
        return match ? match[1] : ''
    }
    return ''
  }) as unknown as Strftime<Str>
}
