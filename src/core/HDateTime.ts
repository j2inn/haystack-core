/*
 * Copyright (c) 2020, J2 Innovations. All Rights Reserved
 */

import { Kind } from './Kind'
import {
	HVal,
	NOT_SUPPORTED_IN_FILTER_MSG,
	CANNOT_CHANGE_READONLY_VALUE,
	valueInspect,
	valueIsKind,
	valueMatches,
} from './HVal'
import { HaysonDateTime } from './hayson'
import { Node } from '../filter/Node'
import { HGrid } from './HGrid'
import { HList } from './HList'
import { HDict } from './HDict'
import { HDate } from './HDate'
import { HTime } from './HTime'
import { EvalContext } from '../filter/EvalContext'
import { JsonV3DateTime } from './jsonv3'
import { memoize } from '../util/memoize'
import { HStr } from './HStr'

export interface PartialHaysonDateTime {
	_kind?: Kind
	val: string
	tz?: string
}

/**
 * Prefixes for IANA timezone names.
 */
const TIMEZONE_PREFIXES = [
	'Africa',
	'America',
	'Asia',
	'Atlantic',
	'Australia',
	'Brazil',
	'Canada',
	'Chile',
	'Etc',
	'Europe',
	'Indian',
	'Mexico',
	'Pacific',
	'US',
]

/**
 * A timezone entry.
 */
export interface TimeZoneEntry extends HDict {
	/**
	 * The timezone name.
	 */
	name: HStr

	/**
	 * The full timezone name.
	 */
	fullName: HStr
}

/**
 * The default method for checking whether a timezone is valid or not.
 *
 * This implementation attempts to use the environment's Intl API. This may
 * not work in all environments (Deno) but this is the best attempt at something generic.
 *
 * This approach was discovered after examining the source code for Luxon.
 *
 * @param timezone The timezone.
 * @returns True if the timezone is supported.
 */
export function defaultIsValidTimeZone(timezone: string): boolean {
	try {
		new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format()
		return true
	} catch (err) {
		return false
	}
}

/**
 * Haystack date time.
 */
export class HDateTime implements HVal {
	/**
	 * An internal cached date string value in an ISO 8601 format.
	 */
	readonly #iso: string

	/**
	 * Internal implementation.
	 */
	readonly #value: string

	/**
	 * Internal timezone.
	 */
	readonly #timezone: string

	/**
	 * Constructs a new haystack date time.
	 *
	 * @param value The date time as a string, a JS Date or Hayson date object.
	 */
	private constructor(value: string | Date | HaysonDateTime) {
		let val = ''
		let tz = ''

		if (value) {
			if (typeof value === 'string') {
				val = value
			} else if (value instanceof Date) {
				val = (value as Date).toISOString()
			} else {
				const obj = value as HaysonDateTime
				val = obj.val

				if (obj.tz) {
					tz = obj.tz
				}
			}
		}

		if (!val) {
			throw new Error('Invalid date')
		}

		// Parse the ISO formatted string, the offset and any timezone.
		const result =
			/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.]\d+)?)(Z|(?:[-+]\d{2}:\d{2}))(?: (.+))?$/.exec(
				val
			) ?? []

		let [, , offset, timezone] = result
		const [, dateTime] = result

		if (!dateTime || !offset) {
			throw new Error('Invalid date format')
		}

		if (tz) {
			timezone = tz
		}

		if (!timezone) {
			// Calculate the GMT offset if there is no timezone specified.
			timezone = HDateTime.fromGmtOffset(offset)

			if (timezone === 'UTC') {
				offset = 'Z'
			}
		}

		this.#iso = `${dateTime}${offset}`
		this.#value = `${dateTime}${offset}${
			offset === 'Z' ? '' : ` ${timezone}`
		}`
		this.#timezone = timezone || 'UTC'
	}

	/**
	 * Calculate the GMT offset to use as a fallback timezone.
	 *
	 * @param offset The string encoded offset (-/+HH:MM) or Z.
	 * @returns The calculated GMT offset.
	 */
	private static fromGmtOffset(offset: string): string {
		if (offset === 'Z') {
			return 'UTC'
		}

		const negative = offset[0] === '-'
		const hours = Number(offset.substring(1, 3))

		return hours ? `GMT${negative ? '+' : '-'}${hours}` : 'UTC'
	}

	/**
	 * Factory method for a haystack date time.
	 *
	 * @param value The date time as a string, a JS Date or Hayson date object.
	 * @returns A haystack date time.
	 */
	public static make(
		value: string | Date | HaysonDateTime | HDateTime
	): HDateTime {
		if (valueIsKind<HDateTime>(value, Kind.DateTime)) {
			return value
		} else {
			return new HDateTime(value as string | Date | HaysonDateTime)
		}
	}

	/**
	 * @returns The date time value.
	 */
	public get value(): string {
		return this.#value
	}

	public set value(value: string) {
		throw new Error(CANNOT_CHANGE_READONLY_VALUE)
	}

	/**
	 * @returns The date time in an ISO 8601 format.
	 */
	public get iso(): string {
		return this.#iso
	}

	/**
	 * @returns The timezone.
	 */
	public get timezone(): string {
		return this.#timezone
	}

	/**
	 * @returns The date time object as a JavaScript date.
	 */
	public get date(): Date {
		return new Date(this.iso)
	}

	/**
	 * @returns The value's kind.
	 */
	public getKind(): Kind {
		return Kind.DateTime
	}

	/**
	 * Compares the value's kind.
	 *
	 * @param kind The kind to compare against.
	 * @returns True if the kind matches.
	 */
	public isKind(kind: Kind): boolean {
		return valueIsKind<HDateTime>(this, kind)
	}

	/**
	 * Returns true if the haystack filter matches the value.
	 *
	 * @param filter The filter to test.
	 * @param cx Optional haystack filter evaluation context.
	 * @returns True if the filter matches ok.
	 */
	public matches(filter: string | Node, cx?: Partial<EvalContext>): boolean {
		return valueMatches(this, filter, cx)
	}

	/**
	 * Dump the value to the local console output.
	 *
	 * @param message An optional message to display before the value.
	 * @returns The value instance.
	 */
	public inspect(message?: string): this {
		return valueInspect(this, message)
	}

	/**
	 * @returns Now as a date time object.
	 */
	public static now(): HDateTime {
		return HDateTime.make(new Date())
	}

	/**
	 * @returns A string representation of the value.
	 */
	public toString(): string {
		return (
			this.date.toLocaleString() +
			(this.timezone ? ` ${this.timezone}` : '')
		)
	}

	/**
	 * @returns The encoded date time value.
	 */
	public valueOf(): string {
		return this.value
	}

	/**
	 * Encodes to an encoding zinc value.
	 *
	 * @returns The encoded zinc string.
	 */
	public toZinc(): string {
		return this.value
	}

	/**
	 * Value equality check.
	 *
	 * @param value The value to test.
	 * @returns True if the value is the same.
	 */
	public equals(value: unknown): boolean {
		return (
			valueIsKind<HDateTime>(value, Kind.DateTime) &&
			value.value === this.value
		)
	}

	/**
	 * Compares two date times.
	 *
	 * @param value The value value to compare against.
	 * @returns The sort order as negative, 0, or positive
	 */
	public compareTo(value: unknown): number {
		if (!valueIsKind<HDateTime>(value, Kind.DateTime)) {
			return -1
		}

		if (this.date < value.date) {
			return -1
		} else if (this.date > value.date) {
			return 1
		} else {
			return 0
		}
	}

	/**
	 * Encodes to an encoded zinc value that can be used
	 * in a haystack filter string.
	 *
	 * A dict isn't supported in filter so throw an error.
	 *
	 * @returns The encoded value that can be used in a haystack filter.
	 */
	public toFilter(): string {
		throw new Error(NOT_SUPPORTED_IN_FILTER_MSG)
	}

	/**
	 * @returns A JSON reprentation of the object.
	 */
	public toJSON(): HaysonDateTime {
		const json: HaysonDateTime = {
			_kind: this.getKind(),
			val: this.iso,
		}

		const tz = this.timezone

		if (tz !== 'UTC') {
			json.tz = tz
		}

		return json
	}

	/**
	 * @returns A JSON v3 representation of the object.
	 */
	public toJSONv3(): JsonV3DateTime {
		return `t:${this.toZinc()}`
	}

	/**
	 * @returns An Axon encoded string of the value.
	 */
	public toAxon(): string {
		const date = this.date
		return `dateTime(${HDate.make(date).toAxon()},${HTime.make(
			date
		).toAxon()})`
	}

	/**
	 * @returns Returns the value instance.
	 */
	public newCopy(): HDateTime {
		return this
	}

	/**
	 * @returns The value as a grid.
	 */
	public toGrid(): HGrid {
		return HGrid.make(this)
	}

	/**
	 * @returns The value as a list.
	 */
	public toList(): HList<HDateTime> {
		return HList.make(this)
	}

	/**
	 * @returns The value as a dict.
	 */
	public toDict(): HDict {
		return HDict.make(this)
	}

	/**
	 * Return the full IANA timezone name or an empty string if it can't be found.
	 *
	 * @param isValidTimeZone An optional callback invoked to see if the timezone is valid.
	 * @returns The IANA timezone name or an empty string if the timezone name isn't valid.
	 */
	public getIANATimeZone(
		isValidTimeZone: (timezone: string) => boolean = defaultIsValidTimeZone
	): string {
		return HDateTime.getIANATimeZone(this.#timezone, isValidTimeZone)
	}

	/**
	 * Return the full IANA timezone name or an empty string if it can't be found.
	 *
	 * The timezone name can be a full existing timezone or an alias.
	 *
	 * Since a vanilla JavaScript environment doesn't have support for querying the IANA database,
	 * a callback function needs to be passed in to query the local database implementation.
	 *
	 * Here's an example that uses [Luxon](https://moment.github.io/luxon/index.html)...
	 * ```typescript
	 * import { DateTime } from 'luxon'
	 * ...
	 * const isValidTimeZone = (timezone: string): boolean =>
	 *   !!DateTime.now().setZone(timezone).isValid
	 *
	 * const tz = getIANATimeZone('New_York', isValidTimeZone) // Returns 'America/New_York'.
	 * ...
	 * ```
	 *
	 * Here's an example that uses [Moment with timezones](https://momentjs.com/timezone/docs/)...
	 * ```typescript
	 * import * as moment from 'moment-timezone'
	 * ...
	 * const isValidTimeZone = (timezone: string): boolean =>
	 *   !!moment.tz.zone(timezone)
	 *
	 * const tz = getIANATimeZone('New_York', isValidTimeZone) // Returns 'America/New_York'.
	 * ```
	 *
	 * @see defaultIsValidTimeZone
	 * @link [IANA timezone database](https://www.iana.org/time-zones)
	 * @link [Fantom's DateTime with alias explanation](https://fantom.org/doc/docLang/DateTime)
	 *
	 * @param timezone A full timezone name or alias.
	 * @param isValidTimeZone An optional callback invoked to see if the timezone is valid.
	 * @returns The IANA timezone name or an empty string if the timezone name isn't valid.
	 */
	public static getIANATimeZone(
		timezone: string,
		isValidTimeZone: (timezone: string) => boolean = defaultIsValidTimeZone
	): string {
		if (isValidTimeZone(timezone)) {
			return timezone
		}

		for (const prefix of TIMEZONE_PREFIXES) {
			const tz = `${prefix}/${timezone}`
			if (isValidTimeZone(tz)) {
				return tz
			}
		}

		return ''
	}

	/**
	 * @returns The timezone database.
	 *
	 * - https://project-haystack.org/download/tz.txt
	 * - https://project-haystack.org/doc/docHaystack/TimeZones
	 */
	@memoize()
	public static getTimezoneDb(): HGrid<TimeZoneEntry> {
		return HGrid.make<TimeZoneEntry>({
			rows: [
				{ name: 'Abidjan', fullName: 'Africa/Abidjan' },
				{ name: 'Accra', fullName: 'Africa/Accra' },
				{ name: 'Adak', fullName: 'America/Adak' },
				{ name: 'Adelaide', fullName: 'Australia/Adelaide' },
				{ name: 'Algiers', fullName: 'Africa/Algiers' },
				{ name: 'Almaty', fullName: 'Asia/Almaty' },
				{ name: 'Amman', fullName: 'Asia/Amman' },
				{ name: 'Amsterdam', fullName: 'Europe/Amsterdam' },
				{ name: 'Anadyr', fullName: 'Asia/Anadyr' },
				{ name: 'Anchorage', fullName: 'America/Anchorage' },
				{ name: 'Andorra', fullName: 'Europe/Andorra' },
				{ name: 'Apia', fullName: 'Pacific/Apia' },
				{ name: 'Aqtau', fullName: 'Asia/Aqtau' },
				{ name: 'Aqtobe', fullName: 'Asia/Aqtobe' },
				{ name: 'Araguaina', fullName: 'America/Araguaina' },
				{ name: 'Ashgabat', fullName: 'Asia/Ashgabat' },
				{ name: 'Astrakhan', fullName: 'Europe/Astrakhan' },
				{ name: 'Asuncion', fullName: 'America/Asuncion' },
				{ name: 'Athens', fullName: 'Europe/Athens' },
				{ name: 'Atikokan', fullName: 'America/Atikokan' },
				{ name: 'Atyrau', fullName: 'Asia/Atyrau' },
				{ name: 'Auckland', fullName: 'Pacific/Auckland' },
				{ name: 'Azores', fullName: 'Atlantic/Azores' },
				{ name: 'Baghdad', fullName: 'Asia/Baghdad' },
				{ name: 'Bahia', fullName: 'America/Bahia' },
				{ name: 'Bahia_Banderas', fullName: 'America/Bahia_Banderas' },
				{ name: 'Baku', fullName: 'Asia/Baku' },
				{ name: 'Bangkok', fullName: 'Asia/Bangkok' },
				{ name: 'Barbados', fullName: 'America/Barbados' },
				{ name: 'Barnaul', fullName: 'Asia/Barnaul' },
				{ name: 'Beirut', fullName: 'Asia/Beirut' },
				{ name: 'Belem', fullName: 'America/Belem' },
				{ name: 'Belgrade', fullName: 'Europe/Belgrade' },
				{ name: 'Belize', fullName: 'America/Belize' },
				{ name: 'Berlin', fullName: 'Europe/Berlin' },
				{ name: 'Bermuda', fullName: 'Atlantic/Bermuda' },
				{ name: 'Beulah', fullName: 'America/North_Dakota/Beulah' },
				{ name: 'Bishkek', fullName: 'Asia/Bishkek' },
				{ name: 'Bissau', fullName: 'Africa/Bissau' },
				{ name: 'Blanc-Sablon', fullName: 'America/Blanc-Sablon' },
				{ name: 'Boa_Vista', fullName: 'America/Boa_Vista' },
				{ name: 'Bogota', fullName: 'America/Bogota' },
				{ name: 'Boise', fullName: 'America/Boise' },
				{ name: 'Bougainville', fullName: 'Pacific/Bougainville' },
				{ name: 'Brisbane', fullName: 'Australia/Brisbane' },
				{ name: 'Broken_Hill', fullName: 'Australia/Broken_Hill' },
				{ name: 'Brunei', fullName: 'Asia/Brunei' },
				{ name: 'Brussels', fullName: 'Europe/Brussels' },
				{ name: 'Bucharest', fullName: 'Europe/Bucharest' },
				{ name: 'Budapest', fullName: 'Europe/Budapest' },
				{
					name: 'Buenos_Aires',
					fullName: 'America/Argentina/Buenos_Aires',
				},
				{ name: 'CET', fullName: 'CET' },
				{ name: 'CST6CDT', fullName: 'CST6CDT' },
				{ name: 'Cairo', fullName: 'Africa/Cairo' },
				{ name: 'Cambridge_Bay', fullName: 'America/Cambridge_Bay' },
				{ name: 'Campo_Grande', fullName: 'America/Campo_Grande' },
				{ name: 'Canary', fullName: 'Atlantic/Canary' },
				{ name: 'Cancun', fullName: 'America/Cancun' },
				{ name: 'Cape_Verde', fullName: 'Atlantic/Cape_Verde' },
				{ name: 'Caracas', fullName: 'America/Caracas' },
				{ name: 'Casablanca', fullName: 'Africa/Casablanca' },
				{ name: 'Casey', fullName: 'Antarctica/Casey' },
				{ name: 'Catamarca', fullName: 'America/Argentina/Catamarca' },
				{ name: 'Cayenne', fullName: 'America/Cayenne' },
				{ name: 'Center', fullName: 'America/North_Dakota/Center' },
				{ name: 'Ceuta', fullName: 'Africa/Ceuta' },
				{ name: 'Chagos', fullName: 'Indian/Chagos' },
				{ name: 'Chatham', fullName: 'Pacific/Chatham' },
				{ name: 'Chicago', fullName: 'America/Chicago' },
				{ name: 'Chihuahua', fullName: 'America/Chihuahua' },
				{ name: 'Chisinau', fullName: 'Europe/Chisinau' },
				{ name: 'Chita', fullName: 'Asia/Chita' },
				{ name: 'Choibalsan', fullName: 'Asia/Choibalsan' },
				{ name: 'Christmas', fullName: 'Indian/Christmas' },
				{ name: 'Chuuk', fullName: 'Pacific/Chuuk' },
				{ name: 'Cocos', fullName: 'Indian/Cocos' },
				{ name: 'Colombo', fullName: 'Asia/Colombo' },
				{ name: 'Copenhagen', fullName: 'Europe/Copenhagen' },
				{ name: 'Cordoba', fullName: 'America/Argentina/Cordoba' },
				{ name: 'Costa_Rica', fullName: 'America/Costa_Rica' },
				{ name: 'Creston', fullName: 'America/Creston' },
				{ name: 'Cuiaba', fullName: 'America/Cuiaba' },
				{ name: 'Curacao', fullName: 'America/Curacao' },
				{ name: 'Currie', fullName: 'Australia/Currie' },
				{ name: 'Damascus', fullName: 'Asia/Damascus' },
				{ name: 'Danmarkshavn', fullName: 'America/Danmarkshavn' },
				{ name: 'Darwin', fullName: 'Australia/Darwin' },
				{ name: 'Davis', fullName: 'Antarctica/Davis' },
				{ name: 'Dawson', fullName: 'America/Dawson' },
				{ name: 'Dawson_Creek', fullName: 'America/Dawson_Creek' },
				{ name: 'Denver', fullName: 'America/Denver' },
				{ name: 'Detroit', fullName: 'America/Detroit' },
				{ name: 'Dhaka', fullName: 'Asia/Dhaka' },
				{ name: 'Dili', fullName: 'Asia/Dili' },
				{ name: 'Dubai', fullName: 'Asia/Dubai' },
				{ name: 'Dublin', fullName: 'Europe/Dublin' },
				{
					name: 'DumontDUrville',
					fullName: 'Antarctica/DumontDUrville',
				},
				{ name: 'Dushanbe', fullName: 'Asia/Dushanbe' },
				{ name: 'EET', fullName: 'EET' },
				{ name: 'EST', fullName: 'EST' },
				{ name: 'EST5EDT', fullName: 'EST5EDT' },
				{ name: 'Easter', fullName: 'Pacific/Easter' },
				{ name: 'Edmonton', fullName: 'America/Edmonton' },
				{ name: 'Efate', fullName: 'Pacific/Efate' },
				{ name: 'Eirunepe', fullName: 'America/Eirunepe' },
				{ name: 'El_Aaiun', fullName: 'Africa/El_Aaiun' },
				{ name: 'El_Salvador', fullName: 'America/El_Salvador' },
				{ name: 'Enderbury', fullName: 'Pacific/Enderbury' },
				{ name: 'Eucla', fullName: 'Australia/Eucla' },
				{ name: 'Fakaofo', fullName: 'Pacific/Fakaofo' },
				{ name: 'Famagusta', fullName: 'Asia/Famagusta' },
				{ name: 'Faroe', fullName: 'Atlantic/Faroe' },
				{ name: 'Fiji', fullName: 'Pacific/Fiji' },
				{ name: 'Fort_Nelson', fullName: 'America/Fort_Nelson' },
				{ name: 'Fortaleza', fullName: 'America/Fortaleza' },
				{ name: 'Funafuti', fullName: 'Pacific/Funafuti' },
				{ name: 'GMT', fullName: 'Etc/GMT' },
				{ name: 'GMT+1', fullName: 'Etc/GMT+1' },
				{ name: 'GMT+10', fullName: 'Etc/GMT+10' },
				{ name: 'GMT+11', fullName: 'Etc/GMT+11' },
				{ name: 'GMT+12', fullName: 'Etc/GMT+12' },
				{ name: 'GMT+2', fullName: 'Etc/GMT+2' },
				{ name: 'GMT+3', fullName: 'Etc/GMT+3' },
				{ name: 'GMT+4', fullName: 'Etc/GMT+4' },
				{ name: 'GMT+5', fullName: 'Etc/GMT+5' },
				{ name: 'GMT+6', fullName: 'Etc/GMT+6' },
				{ name: 'GMT+7', fullName: 'Etc/GMT+7' },
				{ name: 'GMT+8', fullName: 'Etc/GMT+8' },
				{ name: 'GMT+9', fullName: 'Etc/GMT+9' },
				{ name: 'GMT-1', fullName: 'Etc/GMT-1' },
				{ name: 'GMT-10', fullName: 'Etc/GMT-10' },
				{ name: 'GMT-11', fullName: 'Etc/GMT-11' },
				{ name: 'GMT-12', fullName: 'Etc/GMT-12' },
				{ name: 'GMT-13', fullName: 'Etc/GMT-13' },
				{ name: 'GMT-14', fullName: 'Etc/GMT-14' },
				{ name: 'GMT-2', fullName: 'Etc/GMT-2' },
				{ name: 'GMT-3', fullName: 'Etc/GMT-3' },
				{ name: 'GMT-4', fullName: 'Etc/GMT-4' },
				{ name: 'GMT-5', fullName: 'Etc/GMT-5' },
				{ name: 'GMT-6', fullName: 'Etc/GMT-6' },
				{ name: 'GMT-7', fullName: 'Etc/GMT-7' },
				{ name: 'GMT-8', fullName: 'Etc/GMT-8' },
				{ name: 'GMT-9', fullName: 'Etc/GMT-9' },
				{ name: 'Galapagos', fullName: 'Pacific/Galapagos' },
				{ name: 'Gambier', fullName: 'Pacific/Gambier' },
				{ name: 'Gaza', fullName: 'Asia/Gaza' },
				{ name: 'Gibraltar', fullName: 'Europe/Gibraltar' },
				{ name: 'Glace_Bay', fullName: 'America/Glace_Bay' },
				{ name: 'Godthab', fullName: 'America/Godthab' },
				{ name: 'Goose_Bay', fullName: 'America/Goose_Bay' },
				{ name: 'Grand_Turk', fullName: 'America/Grand_Turk' },
				{ name: 'Guadalcanal', fullName: 'Pacific/Guadalcanal' },
				{ name: 'Guam', fullName: 'Pacific/Guam' },
				{ name: 'Guatemala', fullName: 'America/Guatemala' },
				{ name: 'Guayaquil', fullName: 'America/Guayaquil' },
				{ name: 'Guyana', fullName: 'America/Guyana' },
				{ name: 'HST', fullName: 'HST' },
				{ name: 'Halifax', fullName: 'America/Halifax' },
				{ name: 'Havana', fullName: 'America/Havana' },
				{ name: 'Hebron', fullName: 'Asia/Hebron' },
				{ name: 'Helsinki', fullName: 'Europe/Helsinki' },
				{ name: 'Hermosillo', fullName: 'America/Hermosillo' },
				{ name: 'Ho_Chi_Minh', fullName: 'Asia/Ho_Chi_Minh' },
				{ name: 'Hobart', fullName: 'Australia/Hobart' },
				{ name: 'Hong_Kong', fullName: 'Asia/Hong_Kong' },
				{ name: 'Honolulu', fullName: 'Pacific/Honolulu' },
				{ name: 'Hovd', fullName: 'Asia/Hovd' },
				{
					name: 'Indianapolis',
					fullName: 'America/Indiana/Indianapolis',
				},
				{ name: 'Inuvik', fullName: 'America/Inuvik' },
				{ name: 'Iqaluit', fullName: 'America/Iqaluit' },
				{ name: 'Irkutsk', fullName: 'Asia/Irkutsk' },
				{ name: 'Istanbul', fullName: 'Europe/Istanbul' },
				{ name: 'Jakarta', fullName: 'Asia/Jakarta' },
				{ name: 'Jamaica', fullName: 'America/Jamaica' },
				{ name: 'Jayapura', fullName: 'Asia/Jayapura' },
				{ name: 'Jerusalem', fullName: 'Asia/Jerusalem' },
				{ name: 'Johannesburg', fullName: 'Africa/Johannesburg' },
				{ name: 'Juba', fullName: 'Africa/Juba' },
				{ name: 'Jujuy', fullName: 'America/Argentina/Jujuy' },
				{ name: 'Juneau', fullName: 'America/Juneau' },
				{ name: 'Kabul', fullName: 'Asia/Kabul' },
				{ name: 'Kaliningrad', fullName: 'Europe/Kaliningrad' },
				{ name: 'Kamchatka', fullName: 'Asia/Kamchatka' },
				{ name: 'Karachi', fullName: 'Asia/Karachi' },
				{ name: 'Kathmandu', fullName: 'Asia/Kathmandu' },
				{ name: 'Kerguelen', fullName: 'Indian/Kerguelen' },
				{ name: 'Khandyga', fullName: 'Asia/Khandyga' },
				{ name: 'Khartoum', fullName: 'Africa/Khartoum' },
				{ name: 'Kiev', fullName: 'Europe/Kiev' },
				{ name: 'Kiritimati', fullName: 'Pacific/Kiritimati' },
				{ name: 'Kirov', fullName: 'Europe/Kirov' },
				{ name: 'Knox', fullName: 'America/Indiana/Knox' },
				{ name: 'Kolkata', fullName: 'Asia/Kolkata' },
				{ name: 'Kosrae', fullName: 'Pacific/Kosrae' },
				{ name: 'Krasnoyarsk', fullName: 'Asia/Krasnoyarsk' },
				{ name: 'Kuala_Lumpur', fullName: 'Asia/Kuala_Lumpur' },
				{ name: 'Kuching', fullName: 'Asia/Kuching' },
				{ name: 'Kwajalein', fullName: 'Pacific/Kwajalein' },
				{ name: 'La_Paz', fullName: 'America/La_Paz' },
				{ name: 'La_Rioja', fullName: 'America/Argentina/La_Rioja' },
				{ name: 'Lagos', fullName: 'Africa/Lagos' },
				{ name: 'Lima', fullName: 'America/Lima' },
				{ name: 'Lindeman', fullName: 'Australia/Lindeman' },
				{ name: 'Lisbon', fullName: 'Europe/Lisbon' },
				{ name: 'London', fullName: 'Europe/London' },
				{ name: 'Lord_Howe', fullName: 'Australia/Lord_Howe' },
				{ name: 'Los_Angeles', fullName: 'America/Los_Angeles' },
				{ name: 'Louisville', fullName: 'America/Kentucky/Louisville' },
				{ name: 'Luxembourg', fullName: 'Europe/Luxembourg' },
				{ name: 'MET', fullName: 'MET' },
				{ name: 'MST', fullName: 'MST' },
				{ name: 'MST7MDT', fullName: 'MST7MDT' },
				{ name: 'Macau', fullName: 'Asia/Macau' },
				{ name: 'Maceio', fullName: 'America/Maceio' },
				{ name: 'Macquarie', fullName: 'Antarctica/Macquarie' },
				{ name: 'Madeira', fullName: 'Atlantic/Madeira' },
				{ name: 'Madrid', fullName: 'Europe/Madrid' },
				{ name: 'Magadan', fullName: 'Asia/Magadan' },
				{ name: 'Mahe', fullName: 'Indian/Mahe' },
				{ name: 'Majuro', fullName: 'Pacific/Majuro' },
				{ name: 'Makassar', fullName: 'Asia/Makassar' },
				{ name: 'Maldives', fullName: 'Indian/Maldives' },
				{ name: 'Malta', fullName: 'Europe/Malta' },
				{ name: 'Managua', fullName: 'America/Managua' },
				{ name: 'Manaus', fullName: 'America/Manaus' },
				{ name: 'Manila', fullName: 'Asia/Manila' },
				{ name: 'Maputo', fullName: 'Africa/Maputo' },
				{ name: 'Marengo', fullName: 'America/Indiana/Marengo' },
				{ name: 'Marquesas', fullName: 'Pacific/Marquesas' },
				{ name: 'Martinique', fullName: 'America/Martinique' },
				{ name: 'Matamoros', fullName: 'America/Matamoros' },
				{ name: 'Mauritius', fullName: 'Indian/Mauritius' },
				{ name: 'Mawson', fullName: 'Antarctica/Mawson' },
				{ name: 'Mazatlan', fullName: 'America/Mazatlan' },
				{ name: 'Melbourne', fullName: 'Australia/Melbourne' },
				{ name: 'Mendoza', fullName: 'America/Argentina/Mendoza' },
				{ name: 'Menominee', fullName: 'America/Menominee' },
				{ name: 'Merida', fullName: 'America/Merida' },
				{ name: 'Metlakatla', fullName: 'America/Metlakatla' },
				{ name: 'Mexico_City', fullName: 'America/Mexico_City' },
				{ name: 'Minsk', fullName: 'Europe/Minsk' },
				{ name: 'Miquelon', fullName: 'America/Miquelon' },
				{ name: 'Monaco', fullName: 'Europe/Monaco' },
				{ name: 'Moncton', fullName: 'America/Moncton' },
				{ name: 'Monrovia', fullName: 'Africa/Monrovia' },
				{ name: 'Monterrey', fullName: 'America/Monterrey' },
				{ name: 'Montevideo', fullName: 'America/Montevideo' },
				{ name: 'Monticello', fullName: 'America/Kentucky/Monticello' },
				{ name: 'Moscow', fullName: 'Europe/Moscow' },
				{ name: 'Nairobi', fullName: 'Africa/Nairobi' },
				{ name: 'Nassau', fullName: 'America/Nassau' },
				{ name: 'Nauru', fullName: 'Pacific/Nauru' },
				{ name: 'Ndjamena', fullName: 'Africa/Ndjamena' },
				{
					name: 'New_Salem',
					fullName: 'America/North_Dakota/New_Salem',
				},
				{ name: 'New_York', fullName: 'America/New_York' },
				{ name: 'Nicosia', fullName: 'Asia/Nicosia' },
				{ name: 'Nipigon', fullName: 'America/Nipigon' },
				{ name: 'Niue', fullName: 'Pacific/Niue' },
				{ name: 'Nome', fullName: 'America/Nome' },
				{ name: 'Norfolk', fullName: 'Pacific/Norfolk' },
				{ name: 'Noronha', fullName: 'America/Noronha' },
				{ name: 'Noumea', fullName: 'Pacific/Noumea' },
				{ name: 'Novokuznetsk', fullName: 'Asia/Novokuznetsk' },
				{ name: 'Novosibirsk', fullName: 'Asia/Novosibirsk' },
				{ name: 'Ojinaga', fullName: 'America/Ojinaga' },
				{ name: 'Omsk', fullName: 'Asia/Omsk' },
				{ name: 'Oral', fullName: 'Asia/Oral' },
				{ name: 'Oslo', fullName: 'Europe/Oslo' },
				{ name: 'PST8PDT', fullName: 'PST8PDT' },
				{ name: 'Pago_Pago', fullName: 'Pacific/Pago_Pago' },
				{ name: 'Palau', fullName: 'Pacific/Palau' },
				{ name: 'Palmer', fullName: 'Antarctica/Palmer' },
				{ name: 'Panama', fullName: 'America/Panama' },
				{ name: 'Pangnirtung', fullName: 'America/Pangnirtung' },
				{ name: 'Paramaribo', fullName: 'America/Paramaribo' },
				{ name: 'Paris', fullName: 'Europe/Paris' },
				{ name: 'Perth', fullName: 'Australia/Perth' },
				{ name: 'Petersburg', fullName: 'America/Indiana/Petersburg' },
				{ name: 'Phoenix', fullName: 'America/Phoenix' },
				{ name: 'Pitcairn', fullName: 'Pacific/Pitcairn' },
				{ name: 'Pohnpei', fullName: 'Pacific/Pohnpei' },
				{ name: 'Pontianak', fullName: 'Asia/Pontianak' },
				{ name: 'Port-au-Prince', fullName: 'America/Port-au-Prince' },
				{ name: 'Port_Moresby', fullName: 'Pacific/Port_Moresby' },
				{ name: 'Port_of_Spain', fullName: 'America/Port_of_Spain' },
				{ name: 'Porto_Velho', fullName: 'America/Porto_Velho' },
				{ name: 'Prague', fullName: 'Europe/Prague' },
				{ name: 'Puerto_Rico', fullName: 'America/Puerto_Rico' },
				{ name: 'Punta_Arenas', fullName: 'America/Punta_Arenas' },
				{ name: 'Pyongyang', fullName: 'Asia/Pyongyang' },
				{ name: 'Qatar', fullName: 'Asia/Qatar' },
				{ name: 'Qostanay', fullName: 'Asia/Qostanay' },
				{ name: 'Qyzylorda', fullName: 'Asia/Qyzylorda' },
				{ name: 'Rainy_River', fullName: 'America/Rainy_River' },
				{ name: 'Rankin_Inlet', fullName: 'America/Rankin_Inlet' },
				{ name: 'Rarotonga', fullName: 'Pacific/Rarotonga' },
				{ name: 'Recife', fullName: 'America/Recife' },
				{ name: 'Regina', fullName: 'America/Regina' },
				{ name: 'Rel', fullName: 'Etc/Rel' },
				{ name: 'Resolute', fullName: 'America/Resolute' },
				{ name: 'Reunion', fullName: 'Indian/Reunion' },
				{ name: 'Reykjavik', fullName: 'Atlantic/Reykjavik' },
				{ name: 'Riga', fullName: 'Europe/Riga' },
				{ name: 'Rio_Branco', fullName: 'America/Rio_Branco' },
				{
					name: 'Rio_Gallegos',
					fullName: 'America/Argentina/Rio_Gallegos',
				},
				{ name: 'Riyadh', fullName: 'Asia/Riyadh' },
				{ name: 'Rome', fullName: 'Europe/Rome' },
				{ name: 'Rothera', fullName: 'Antarctica/Rothera' },
				{ name: 'Sakhalin', fullName: 'Asia/Sakhalin' },
				{ name: 'Salta', fullName: 'America/Argentina/Salta' },
				{ name: 'Samara', fullName: 'Europe/Samara' },
				{ name: 'Samarkand', fullName: 'Asia/Samarkand' },
				{ name: 'San_Juan', fullName: 'America/Argentina/San_Juan' },
				{ name: 'San_Luis', fullName: 'America/Argentina/San_Luis' },
				{ name: 'Santarem', fullName: 'America/Santarem' },
				{ name: 'Santiago', fullName: 'America/Santiago' },
				{ name: 'Santo_Domingo', fullName: 'America/Santo_Domingo' },
				{ name: 'Sao_Paulo', fullName: 'America/Sao_Paulo' },
				{ name: 'Sao_Tome', fullName: 'Africa/Sao_Tome' },
				{ name: 'Saratov', fullName: 'Europe/Saratov' },
				{ name: 'Scoresbysund', fullName: 'America/Scoresbysund' },
				{ name: 'Seoul', fullName: 'Asia/Seoul' },
				{ name: 'Shanghai', fullName: 'Asia/Shanghai' },
				{ name: 'Simferopol', fullName: 'Europe/Simferopol' },
				{ name: 'Singapore', fullName: 'Asia/Singapore' },
				{ name: 'Sitka', fullName: 'America/Sitka' },
				{ name: 'Sofia', fullName: 'Europe/Sofia' },
				{ name: 'South_Georgia', fullName: 'Atlantic/South_Georgia' },
				{ name: 'Srednekolymsk', fullName: 'Asia/Srednekolymsk' },
				{ name: 'St_Johns', fullName: 'America/St_Johns' },
				{ name: 'Stanley', fullName: 'Atlantic/Stanley' },
				{ name: 'Stockholm', fullName: 'Europe/Stockholm' },
				{ name: 'Swift_Current', fullName: 'America/Swift_Current' },
				{ name: 'Sydney', fullName: 'Australia/Sydney' },
				{ name: 'Syowa', fullName: 'Antarctica/Syowa' },
				{ name: 'Tahiti', fullName: 'Pacific/Tahiti' },
				{ name: 'Taipei', fullName: 'Asia/Taipei' },
				{ name: 'Tallinn', fullName: 'Europe/Tallinn' },
				{ name: 'Tarawa', fullName: 'Pacific/Tarawa' },
				{ name: 'Tashkent', fullName: 'Asia/Tashkent' },
				{ name: 'Tbilisi', fullName: 'Asia/Tbilisi' },
				{ name: 'Tegucigalpa', fullName: 'America/Tegucigalpa' },
				{ name: 'Tehran', fullName: 'Asia/Tehran' },
				{ name: 'Tell_City', fullName: 'America/Indiana/Tell_City' },
				{ name: 'Thimphu', fullName: 'Asia/Thimphu' },
				{ name: 'Thule', fullName: 'America/Thule' },
				{ name: 'Thunder_Bay', fullName: 'America/Thunder_Bay' },
				{ name: 'Tijuana', fullName: 'America/Tijuana' },
				{ name: 'Tirane', fullName: 'Europe/Tirane' },
				{ name: 'Tokyo', fullName: 'Asia/Tokyo' },
				{ name: 'Tomsk', fullName: 'Asia/Tomsk' },
				{ name: 'Tongatapu', fullName: 'Pacific/Tongatapu' },
				{ name: 'Toronto', fullName: 'America/Toronto' },
				{ name: 'Tripoli', fullName: 'Africa/Tripoli' },
				{ name: 'Troll', fullName: 'Antarctica/Troll' },
				{ name: 'Tucuman', fullName: 'America/Argentina/Tucuman' },
				{ name: 'Tunis', fullName: 'Africa/Tunis' },
				{ name: 'UTC', fullName: 'Etc/UTC' },
				{ name: 'Ulaanbaatar', fullName: 'Asia/Ulaanbaatar' },
				{ name: 'Ulyanovsk', fullName: 'Europe/Ulyanovsk' },
				{ name: 'Urumqi', fullName: 'Asia/Urumqi' },
				{ name: 'Ushuaia', fullName: 'America/Argentina/Ushuaia' },
				{ name: 'Ust-Nera', fullName: 'Asia/Ust-Nera' },
				{ name: 'Uzhgorod', fullName: 'Europe/Uzhgorod' },
				{ name: 'Vancouver', fullName: 'America/Vancouver' },
				{ name: 'Vevay', fullName: 'America/Indiana/Vevay' },
				{ name: 'Vienna', fullName: 'Europe/Vienna' },
				{ name: 'Vilnius', fullName: 'Europe/Vilnius' },
				{ name: 'Vincennes', fullName: 'America/Indiana/Vincennes' },
				{ name: 'Vladivostok', fullName: 'Asia/Vladivostok' },
				{ name: 'Volgograd', fullName: 'Europe/Volgograd' },
				{ name: 'Vostok', fullName: 'Antarctica/Vostok' },
				{ name: 'WET', fullName: 'WET' },
				{ name: 'Wake', fullName: 'Pacific/Wake' },
				{ name: 'Wallis', fullName: 'Pacific/Wallis' },
				{ name: 'Warsaw', fullName: 'Europe/Warsaw' },
				{ name: 'Whitehorse', fullName: 'America/Whitehorse' },
				{ name: 'Winamac', fullName: 'America/Indiana/Winamac' },
				{ name: 'Windhoek', fullName: 'Africa/Windhoek' },
				{ name: 'Winnipeg', fullName: 'America/Winnipeg' },
				{ name: 'Yakutat', fullName: 'America/Yakutat' },
				{ name: 'Yakutsk', fullName: 'Asia/Yakutsk' },
				{ name: 'Yangon', fullName: 'Asia/Yangon' },
				{ name: 'Yekaterinburg', fullName: 'Asia/Yekaterinburg' },
				{ name: 'Yellowknife', fullName: 'America/Yellowknife' },
				{ name: 'Yerevan', fullName: 'Asia/Yerevan' },
				{ name: 'Zaporozhye', fullName: 'Europe/Zaporozhye' },
				{ name: 'Zurich', fullName: 'Europe/Zurich' },
			],
		})
	}
}
